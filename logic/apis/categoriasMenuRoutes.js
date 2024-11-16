// logic/categoriasMenuRoutes.js
const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath, actualizarClientesWebSocketCategoriasMenu) {
    // API para obtener todas las categorías
    server.get('/api/categoriasmenu', (req, res) => {
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            // Verificar si el archivo tiene datos válidos
            if (!data || data.trim() === '') {
                return res.status(404).send('El archivo de categorías está vacío o no existe');
            }
            try {
                const categorias = JSON.parse(data);
                res.json(categorias);  // Responder con las categorías
            } catch (parseError) {
                return res.status(500).send('Error al parsear el archivo de categorías');
            }
        });
    });

    

    server.get('/api/categoriasmenu/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === id);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            res.json(categoria);  // Responder con la categoría encontrada
        });
    });


    // API para agregar una nueva categoría
    server.post('/api/categoriasmenu', (req, res) => {
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            
            const categorias = JSON.parse(data);
            const maxId = categorias.reduce((max, item) => item.id > max ? item.id : max, 0);
            const newCategoria = { id: maxId + 1, ...req.body };
            categorias.push(newCategoria);
    
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
    
                res.status(201).json(newCategoria);  // Responder con la nueva categoría
    
                // Actualizar a todos los clientes después de escribir el archivo
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
            });
        });
    });
    


    // API para actualizar una categoría
    server.put('/api/categoriasmenu/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            
            let categorias = JSON.parse(data);
            const index = categorias.findIndex(categoria => categoria.id === id);
            if (index === -1) return res.status(404).send('Categoría no encontrada');
            
            categorias[index] = { id, ...req.body };
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
                res.status(200).json(categorias[index]);  // Responder con la categoría actualizada
            });
        });
    });


    // API para eliminar una categoría
    server.delete('/api/categoriasmenu/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            
            let categorias = JSON.parse(data);
            categorias = categorias.filter(categoria => categoria.id !== id);
            
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
                res.status(200).send('Categoría eliminada con éxito');  // Responder con mensaje de éxito
            });
        });
    });


    /// Ruta para agregar una subcategoría a una categoría
    server.post('/api/categoriasmenu/:id/subcategorias', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === id);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            // Asegurarse de que 'subcategorias' esté definido y sea un array
            if (!Array.isArray(categoria.subcategorias)) {
                categoria.subcategorias = [];
            }
    
            // Encuentra el ID más alto entre las subcategorías existentes
            const maxSubcategoriaId = categoria.subcategorias.reduce((max, subcategoria) => subcategoria.id > max ? subcategoria.id : max, 0);
            
            // Crear una nueva subcategoría con el ID más alto + 1
            const newSubcategoria = { id: maxSubcategoriaId + 1, ...req.body };
            categoria.subcategorias.push(newSubcategoria);
            
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
                res.status(201).json(newSubcategoria);  // Responder con la nueva subcategoría agregada
            });
        });
    });
    
    

    // Ruta para obtener todas las subcategorías de una categoría
    server.get('/api/categoriasmenu/:categoriaId/subcategorias', (req, res) => {
        const categoriaId = parseInt(req.params.categoriaId, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === categoriaId);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            res.json(categoria.subcategorias);  // Responde con las subcategorías de la categoría encontrada
        });
    });

    // Ruta para actualizar una subcategoría
    server.put('/api/categoriasmenu/:categoriaId/subcategorias/:subcategoriaId', (req, res) => {
        const categoriaId = parseInt(req.params.categoriaId, 10);
        const subcategoriaId = parseInt(req.params.subcategoriaId, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === categoriaId);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            const subcategoria = categoria.subcategorias.find(sc => sc.id === subcategoriaId);
            if (!subcategoria) return res.status(404).send('Subcategoría no encontrada');
            
            Object.assign(subcategoria, req.body); // Actualiza la subcategoría
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
                res.status(200).json(subcategoria);  // Responde con la subcategoría actualizada
            });
        });
    });

    // Ruta para eliminar una subcategoría de una categoría
    server.delete('/api/categoriasmenu/:categoriaId/subcategorias/:subcategoriaId', (req, res) => {
        const categoriaId = parseInt(req.params.categoriaId, 10);
        const subcategoriaId = parseInt(req.params.subcategoriaId, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === categoriaId);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            categoria.subcategorias = categoria.subcategorias.filter(sc => sc.id !== subcategoriaId);
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                actualizarClientesWebSocketCategoriasMenu("categoriaMenu", categorias);
                res.status(200).send('Subcategoría eliminada con éxito');  // Responde con mensaje de éxito
            });
        });
    });

    // Ruta para agregar una nueva subcategoría a una categoría
    server.post('/api/categoriasmenu/:id/subcategorias', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(path.join(userDataPath, 'categoriasMenu.json'), 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading categorias file');
            let categorias = JSON.parse(data);
            const categoria = categorias.find(c => c.id === id);
            if (!categoria) return res.status(404).send('Categoría no encontrada');
            
            const newSubcategoria = { id: categoria.subcategorias.length + 1, ...req.body };
            categoria.subcategorias.push(newSubcategoria);
            fs.writeFile(path.join(userDataPath, 'categoriasMenu.json'), JSON.stringify(categorias, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing categorias file');
                res.status(201).json(newSubcategoria);  // Responde con la nueva subcategoría agregada
            });
        });
    });
};
