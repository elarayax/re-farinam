// logic/zonasRoutes.js
const fs = require('fs');
const path = require('path');

module.exports = function(server, userDataPath) {
    const tiposUsuarioFilePath = path.join(userDataPath, 'tiposUsuario.json');
    // API para obtener datos de zonas
    server.get('/api/tiposUsuario', (req, res) => {
        fs.readFile(tiposUsuarioFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error reading tipos usuario file');
            res.json(JSON.parse(data));
        });
    });
};
