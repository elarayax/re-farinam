const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath, actualizarClientesWebSocketInventario) {
    const inventarioFilePath = path.join(userDataPath, 'inventario.json');

    server.get('/api/inventario', (req, res) => {
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            res.json(JSON.parse(data));
        });
    });

    server.post('/api/inventario', (req, res) => {
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            const inventario = JSON.parse(data);
            const maxId = inventario.reduce((max, item) => item.id > max ? item.id : max, 0);
            const newItem = { id: maxId + 1, ...req.body };
            inventario.push(newItem);
            fs.writeFile(inventarioFilePath, JSON.stringify(inventario, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar inventario');
                actualizarClientesWebSocketInventario("inventario", inventario);
                res.status(201).json(newItem);
            });
        });
    });

    server.get('/api/inventario/buscarComestibles', (req, res) => {
        const { nombre } = req.query;
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
    
            let inventario = JSON.parse(data);
    
            // Filtrar por nombre y verificar si es comestible
            if (nombre) {
                const lowerCaseNombre = nombre.toLowerCase();
                inventario = inventario.filter(item => 
                    item.nombre.toLowerCase().includes(lowerCaseNombre) &&
                    item.categoria.some(cat => cat.comestible === "true")
                );
            }
    
            res.json(inventario);
        });
    });
    
    server.put('/api/inventario/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            let inventario = JSON.parse(data);
            const index = inventario.findIndex(item => item.id === id);
            if (index === -1) return res.status(404).send('Item no encontrado');
            inventario[index] = { id, ...req.body };
            fs.writeFile(inventarioFilePath, JSON.stringify(inventario, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar inventario');
                actualizarClientesWebSocketInventario("inventario", inventario);
                res.status(200).json(inventario[index]);
            });
        });
    });

    server.delete('/api/inventario/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            let inventario = JSON.parse(data);
            inventario = inventario.filter(item => item.id !== id);
            fs.writeFile(inventarioFilePath, JSON.stringify(inventario, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar inventario');
                actualizarClientesWebSocketInventario("inventario", inventario);
                res.status(200).send('Item eliminado con éxito');
            });
        });
    });

    // Filtro por categoría o subcategoría
    server.get('/api/inventario/filter', (req, res) => {
        const { categoria, subcategoria } = req.query;
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            let inventario = JSON.parse(data);
            if (categoria) inventario = inventario.filter(item => item.categoria === categoria);
            if (subcategoria) inventario = inventario.filter(item => item.subcategoria === subcategoria);
            res.json(inventario);
        });
    });

    server.get('/api/inventario/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(inventarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            const inventario = JSON.parse(data);
            const item = inventario.find(item => item.id === id);
            if (!item) return res.status(404).send('Item no encontrado');
            res.json(item);
        });
    });
}