// logic/zonasRoutes.js
const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath, actualizarClientesWebSocketMedidas) {
    // Rutas de archivo desde userDataPath
    const medidasFilePath = path.join(userDataPath, 'medidas.json');

    // API para obtener datos de medidas
    server.get('/api/medidas', (req, res) => {
        fs.readFile(medidasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading medidas file');
            res.json(JSON.parse(data));
        });
    });

    // API para agregar una nueva medida
    server.post('/api/medidas', (req, res) => {
        fs.readFile(medidasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading medidas file');
            const medidas = JSON.parse(data);
            const maxId = medidas.reduce((max, item) => item.id > max ? item.id : max, 0);
            const newMedida = { id: maxId + 1, ...req.body };
            medidas.push(newMedida);
            fs.writeFile(medidasFilePath, JSON.stringify(medidas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing medidas file');
                actualizarClientesWebSocketMedidas("medidas", medidas);
                res.status(201).json(newMedida);
            });
        });
    });

    // API para actualizar una medida
    server.put('/api/medidas/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(medidasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading medidas file');
            let medidas = JSON.parse(data);
            const index = medidas.findIndex(medida => medida.id === id);
            if (index === -1) return res.status(404).send('Medida no encontrada');
            medidas[index] = { id, ...req.body };
            fs.writeFile(medidasFilePath, JSON.stringify(medidas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing medidas file');
                actualizarClientesWebSocketMedidas("medidas", medidas);
                res.status(200).json(medidas[index]);
            });
        });
    });

    // API para eliminar una medida
    server.delete('/api/medidas/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(medidasFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading medidas file');
            let medidas = JSON.parse(data);
            medidas = medidas.filter(medida => medida.id !== id);
            fs.writeFile(medidasFilePath, JSON.stringify(medidas, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing medidas file');
                actualizarClientesWebSocketMedidas("medidas", medidas);
                res.status(200).send('Medida eliminada con éxito');
            });
        });
    });
}