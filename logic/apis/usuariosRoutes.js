// usuariosRoutes.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

module.exports = function (server, userDataPath, actualizarClientesWebSocketUsuarios) {
    const usuariosFilePath = path.join(userDataPath, 'usuarios.json');
    const saltRounds = 10; 

    // Rutas para gestionar usuarios
    server.get('/api/usuarios', (req, res) => {
        fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer usuarios');
            res.json(JSON.parse(data));
        });
    });

    server.get('/api/usuarios/:id', (req, res) => {
        const id = parseInt(req.params.id, 10); // Obtener el ID desde la URL
        fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer usuarios');
            const usuarios = JSON.parse(data);
            const usuario = usuarios.find(user => user.id === id); // Buscar el usuario por ID
            if (!usuario) return res.status(404).send('Usuario no encontrado'); // Si no se encuentra el usuario, devolver 404
            res.json(usuario); // Si se encuentra, devolver el usuario en formato JSON
        });
    });

    server.post('/api/usuarios', async (req, res) => {
        try {
            const { password, ...userData } = req.body;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
                if (err) return res.status(500).send('Error al leer usuarios');
                const usuarios = JSON.parse(data);
                const maxId = usuarios.reduce((max, user) => (user.id > max ? user.id : max), 0);
                const newUser = { id: maxId + 1, password: hashedPassword, ...userData };
                usuarios.push(newUser);

                fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                    if (err) return res.status(500).send('Error al guardar usuarios');
                    actualizarClientesWebSocketUsuarios("usuario", usuarios);
                    res.status(201).json(newUser);
                });
            });
        } catch (error) {
            res.status(500).send('Error al procesar la contraseña');
        }
    });

    server.put('/api/usuarios/:id', async (req, res) => {
        const id = parseInt(req.params.id, 10);
        try {
            const { password, ...userData } = req.body;
            const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

            fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
                if (err) return res.status(500).send('Error al leer usuarios');
                let usuarios = JSON.parse(data);
                const index = usuarios.findIndex(user => user.id === id);
                if (index === -1) return res.status(404).send('Usuario no encontrado');

                usuarios[index] = { 
                    ...usuarios[index], 
                    ...userData, 
                    ...(hashedPassword ? { password: hashedPassword } : {}) 
                };

                fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                    if (err) return res.status(500).send('Error al guardar usuarios');
                    actualizarClientesWebSocketUsuarios("usuario", usuarios);
                    res.status(200).json(usuarios[index]);
                });
            });
        } catch (error) {
            res.status(500).send('Error al procesar la contraseña');
        }
    });

    server.delete('/api/usuarios/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(usuariosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer usuarios');
            let usuarios = JSON.parse(data);
            usuarios = usuarios.filter(user => user.id !== id);
            fs.writeFile(usuariosFilePath, JSON.stringify(usuarios, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar usuarios');
                actualizarClientesWebSocketUsuarios("usuario", usuarios);
                res.status(200).send('Usuario eliminado con éxito');
            });
        });
    });

    // Agrega esta ruta dentro del módulo que exportas

    server.post('/api/usuarios/login', async (req, res) => {
        const { nickname, password } = req.body; // Recibe email y contraseña desde el frontend

        // Lee el archivo de usuarios
        fs.readFile(usuariosFilePath, 'utf8', async (err, data) => {
            if (err) return res.status(500).send('Error al leer usuarios');

            const usuarios = JSON.parse(data);
            const usuario = usuarios.find(user => user.nickNameUsuario === nickname); // Busca el usuario por email

            if (!usuario) return res.status(404).send('Usuario no encontrado');

            // Compara la contraseña usando bcrypt
            const match = await bcrypt.compare(password, usuario.password);
            if (!match) return res.status(401).send('Contraseña incorrecta');

            // Si la autenticación es exitosa, retorna id y tipo de usuario
            res.status(200).json({
                id: usuario.id,
                tipoUsuario: usuario.tipoUsuario,
                message: 'Login exitoso'
            });
        });
    });
};
