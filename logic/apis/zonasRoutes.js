// logic/zonasRoutes.js
const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath, actualizarClientesWebSocket) {
    const zonasFilePath = path.join(userDataPath, 'zonas.json');
    // API para obtener datos de zonas
    server.get('/api/zonas', (req, res) => {
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            res.json(JSON.parse(data));
        });
    });

    // API para agregar una nueva zona
    server.post('/api/zonas', (req, res) => {
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            const zonas = JSON.parse(data);
            const maxId = zonas.reduce((max, item) => item.id > max ? item.id : max, 0);
            const newZona = { id: maxId + 1, ...req.body };
            zonas.push(newZona);
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(201).json(newZona);
            });
        });
    });

    // API para actualizar una zona
    server.put('/api/zonas/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            let zonas = JSON.parse(data);
            const index = zonas.findIndex(zona => zona.id === id);
            if (index === -1) return res.status(404).send('Zona no encontrada');
            zonas[index] = { id, ...req.body };
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(200).json(zonas[index]);
            });
        });
    });

    // API para eliminar una zona
    server.delete('/api/zonas/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            let zonas = JSON.parse(data);
            zonas = zonas.filter(zona => zona.id !== id);
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(200).send('Zona eliminada con éxito');
            });
        });
    });

    // API para obtener las mesas de una zona específica
    server.get('/api/zonas/:zonaId/mesas', (req, res) => {
        const zonaId = parseInt(req.params.zonaId, 10);
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            const zonas = JSON.parse(data);
            const zona = zonas.find(z => z.id === zonaId);
            if (!zona) return res.status(404).send('Zona no encontrada');
            res.json(zona.mesas);
        });
    });

    server.post('/api/zonas/:zonaId/mesas', (req, res) => {
        const zonaId = parseInt(req.params.zonaId, 10);
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            const zonas = JSON.parse(data);
            const zona = zonas.find(z => z.id === zonaId);
            if (!zona) return res.status(404).send('Zona no encontrada');
            
            // Aseguramos que la propiedad 'mesas' sea un array
            if (!Array.isArray(zona.mesas)) {
                zona.mesas = [];  // Si no es un array, lo inicializamos
            }
            
            const newMesa = { 
                id: zona.mesas.length + 1,
                numero: req.body.numero, 
                estado: "disponible", 
                cantidadPersonas: req.body.cantidadPersonas || 4, 
                pedidoActual: null 
            };
            
            zona.mesas.push(newMesa);
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(201).json(newMesa);
            });
        });
    });

    // API para actualizar una mesa en una zona
    server.put('/api/zonas/:zonaId/mesas/:mesaNumero', (req, res) => {
        const zonaId = parseInt(req.params.zonaId, 10);
        const mesaNumero = parseInt(req.params.mesaNumero, 10);

        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            const zonas = JSON.parse(data);
            const zona = zonas.find(z => z.id === zonaId);
            if (!zona) return res.status(404).send('Zona no encontrada');

            const mesa = zona.mesas.find(m => m.numero === mesaNumero);
            if (!mesa) return res.status(404).send('Mesa no encontrada');

            Object.assign(mesa, req.body); // Actualizar propiedades de la mesa
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(200).json(mesa);
            });
        });
    });

    // API para eliminar una mesa de una zona
    server.delete('/api/zonas/:zonaId/mesas/:mesaNumero', (req, res) => {
        const zonaId = parseInt(req.params.zonaId, 10);
        const mesaNumero = parseInt(req.params.mesaNumero, 10);

        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading zonas file');
            const zonas = JSON.parse(data);
            const zona = zonas.find(z => z.id === zonaId);
            if (!zona) return res.status(404).send('Zona no encontrada');

            const mesaIndex = zona.mesas.find(m => m.numero === mesaNumero);
            if (mesaIndex === -1) return res.status(404).send('Mesa no encontrada');

            zona.mesas.splice(mesaIndex, 1); // Elimina la mesa de la zona
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing zonas file');
                actualizarClientesWebSocket("zonas", zonas);
                res.status(200).send('Mesa eliminada con éxito');
            });
        });
    });

    server.put('/api/zonasn/:zonaId/mesas/:mesaNumero', (req, res) => {
        const { zonaId, mesaNumero } = req.params;
        const { estado, pedidoActual } = req.body;
    
        console.log('zonaId recibido:', zonaId);
        console.log('mesaNumero recibido:', mesaNumero);
    
        // Decodificamos el número de mesa para manejar caracteres especiales
        const mesaNumeroDecodificado = decodeURIComponent(mesaNumero);
        console.log('mesaNumero decodificado:', mesaNumeroDecodificado);
    
        // Leemos el archivo JSON que contiene las zonas
        fs.readFile(zonasFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error al leer el archivo JSON:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
    
            let zonas;
            try {
                zonas = JSON.parse(data);
            } catch (parseError) {
                console.error('Error al analizar el archivo JSON:', parseError);
                return res.status(500).json({ error: 'Error en el formato del archivo JSON' });
            }
    
            // Buscar la zona por ID
            const zona = zonas.find((z) => z.id === parseInt(zonaId, 10));
            if (!zona) {
                console.error('Zona no encontrada:', zonaId);
                return res.status(404).json({ error: 'Zona no encontrada' });
            }
    
            // Buscar la mesa dentro de la zona por el número de mesa
            const mesa = zona.mesas.find((m) => m.numero === mesaNumeroDecodificado);
            if (!mesa) {
                console.error('Mesa no encontrada en zona:', mesaNumeroDecodificado);
                return res.status(404).json({ error: 'Mesa no encontrada' });
            }
    
            // Actualizar los campos de la mesa si están presentes en el cuerpo de la solicitud
            if (estado) mesa.estado = estado;
            if (pedidoActual !== undefined) mesa.pedidoActual = pedidoActual;
    
            // Guardar los cambios en el archivo JSON
            fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error al guardar el archivo JSON:', writeErr);
                    return res.status(500).json({ error: 'Error al guardar los cambios' });
                }
    
                res.json({ mensaje: 'Mesa actualizada exitosamente', mesa });
            });
        });
    });
    
};
