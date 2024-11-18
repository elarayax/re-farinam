const path = require('path');

function setupRoutes(server,baseDir) {
    server.get('/', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'index.html'));
    });
    
    server.get('/administrador/opciones.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'opciones.html'));
    });

    server.get('/administrador/inventario.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'inventario.html'));
    });

    server.get('/administrador/menu.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'menu.html'));
    });

    server.get('/administrador/pedidos.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'pedidos.html'));
    });

    server.get('/administrador/usuarios.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'usuarios.html'));
    });

    server.get('/administrador/actual', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'actual.html'));
    });

    server.get('/administrador/pedidos.html', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'pedidos.html'));
    });

    server.get('/administrador/cerrar-sesion', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'cerrarSesion.html'));
    });

    server.get('/administrador/scripts/zonas.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'zonas.js'));
    });

    server.get('/administrador/scripts/medidas.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'medidas.js'));
    });

    server.get('/administrador/scripts/categorias.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'categorias.js'));
    });

    server.get('/administrador/scripts/producto.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'producto.js'));
    });

    server.get('/administrador/scripts/head.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'head.js'));
    });

    server.get('/administrador/scripts/inventario.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'inventario.js'));
    });

    server.get('/administrador/scripts/menu.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'menu.js'));
    });

    server.get('/administrador/scripts/categoriasMenu.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'categoriasMenu.js'));
    });

    server.get('/administrador/scripts/pedidos.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'pedidos.js'));
    });

    server.get('/administrador/scripts/usuarios.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'usuarios.js'));
    });

    server.get('/administrador/scripts/router.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'router.js'));
    });

    server.get('/administrador/scripts/pedidos.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'vistas', 'administrador', 'scripts', 'pedidos.js'));
    });

    server.get('/scripts/apis/tiposDeUsuario.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'apis', 'tiposDeUsuario.js'));
    });

    server.get('/scripts/apis/usuarios.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'apis', 'usuarios.js'));
    });

    server.get('/scripts/apis/pedidosActivos.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'apis', 'pedidosActivos.js'));
    });

    server.get('/scripts/apis/zonas.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'apis', 'zonas.js'));
    });

    server.get('/scripts/apis/menu.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'apis', 'menu.js'));
    });

    server.get('/scripts/logic/loginIndex.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'logic', 'loginIndex.js'));
    });

    server.get('/scripts/logic/mensajes.js', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'scripts', 'logic','mensajes.js'));
    });

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

    server.get('/estilos/pedidos.css', (req, res) => {
        res.sendFile(path.join(baseDir, 'public', 'estilos', 'pedidos.css'));
    });
}

module.exports = setupRoutes;