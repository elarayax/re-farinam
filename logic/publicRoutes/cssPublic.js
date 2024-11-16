// cssPublic.js
const path = require('path');

function setupCssRoutes(server, baseDir) {
    server.get('/estilos/global.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'global.css'));
    });

    server.get('/estilos/opciones.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'opciones.css'));
    });

    server.get('/estilos/modal.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'modal.css'));
    });

    server.get('/estilos/login.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'login.css'));
    });

    server.get('/estilos/mensajes.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'mensajes.css'));
    });

    server.get('/estilos/menu.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'menu.css'));
    });

    server.get('/estilos/usuarios.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'usuarios.css'));
    });
}

module.exports = setupCssRoutes;