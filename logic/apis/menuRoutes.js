const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath, actualizarClientesWebSocketMenu) {
    const menuFilePath = path.join(userDataPath, 'menu.json');

    server.get('/api/menu', (req, res) => {
        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer inventario');
            res.json(JSON.parse(data));
        });
    });

    server.get('/api/menu/sorted', (req, res) => {
        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer el archivo de menú');
            
            let menu = JSON.parse(data);
    
            // Ordenar el menú por `nombreCategoria` y luego por `subCategoria.nombre`
            menu = menu.sort((a, b) => {
                const categoriaA = a.plato.categoria.nombreCategoria.toLowerCase();
                const categoriaB = b.plato.categoria.nombreCategoria.toLowerCase();
    
                // Comparar categorías
                if (categoriaA < categoriaB) return -1;
                if (categoriaA > categoriaB) return 1;
    
                // Si las categorías son iguales, ordenar por subcategoría
                const subCategoriaA = a.plato.categoria.subCategoria[0]?.nombre.toLowerCase() || "";
                const subCategoriaB = b.plato.categoria.subCategoria[0]?.nombre.toLowerCase() || "";
    
                if (subCategoriaA < subCategoriaB) return -1;
                if (subCategoriaA > subCategoriaB) return 1;
    
                return 0;
            });
    
            res.json(menu);
        });
    });

    server.post('/api/menu', (req, res) => {
        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer menu');
            const menu = JSON.parse(data);
            const maxId = menu.reduce((max, item) => item.id > max ? item.id : max, 0);
            const newItem = { id: maxId + 1, ...req.body };
            menu.push(newItem);
            fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar menu');
                actualizarClientesWebSocketMenu("menu", menu);
                res.status(201).json(newItem);
            });
        });
    });

    server.get('/api/menu/busqueda', (req, res) => {
        const subcategoria = req.query.subcategoria; // Lee el parámetro de subcategoría de la consulta
        
        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer el menú');
    
            let menu = JSON.parse(data);
    
            // Filtrar por subcategoría si se proporciona
            if (subcategoria) {
                menu = menu.filter(item => item.plato && item.plato.categoria && Array.isArray(item.plato.categoria.subCategoria) && item.plato.categoria.subCategoria.some(
                        sub => sub.nombre && sub.nombre.toLowerCase() === subcategoria.toLowerCase()
                    )
                );
            }
    
            res.json(menu);
        });
    });

    server.get('/api/menu/:id', (req, res) => {
        const platoId = parseInt(req.params.id);
        
        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer el menú');
            
            const menu = JSON.parse(data);
            const plato = menu.find(item => item.id === platoId);

            if (plato) {
                res.json(plato);
            } else {
                res.status(404).send('Plato no encontrado');
            }
        });
    });

    server.put('/api/menu/:id', (req, res) => {
        const platoId = parseInt(req.params.id);

        fs.readFile(menuFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer el menú');

            let menu = JSON.parse(data);
            const platoIndex = menu.findIndex(item => item.id === platoId);

            if (platoIndex === -1) {
                return res.status(404).send('Plato no encontrado');
            }

            // Actualizar los datos del plato con los datos del cuerpo de la solicitud
            const updatedPlato = { ...menu[platoIndex], ...req.body };
            menu[platoIndex] = updatedPlato;

            fs.writeFile(menuFilePath, JSON.stringify(menu, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar el menú');
                actualizarClientesWebSocketMenu("menu", menu);
                res.json(updatedPlato);
            });
        });
    });
}