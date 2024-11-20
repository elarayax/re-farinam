// serverRoutes.js
const setupRoutes = require('./routes');
const zonasRoutes = require('./apis/zonasRoutes');
const categoriesRoutes = require('./apis/categoriesRoutes');
const medidasRoutes = require('./apis/medidasRoutes');
const inventarioRoutes = require('./apis/inventarioRoutes');
const menuRoutes = require('./apis/menuRoutes');
const categoriasMenuRoutes = require('./apis/categoriasMenuRoutes');
const tiposUsuarioRoutes = require('./apis/tiposUsuariosRoutes');
const usuariosRoutes = require('./apis/usuariosRoutes');
const pedidosActivosRoutes = require('./apis/pedidosActivosRoutes');
const pedidosFinalizadosRoutes = require('./apis/pedidosFinalizadosRoutes');
const metodosPagoRoutes = require('./apis/metodosPagoRoutes');

function setupAppRoutes(server, baseDir, userDataPath, actualizarClientesWebSocket) {
    setupRoutes(server, baseDir);
    zonasRoutes(server, userDataPath, actualizarClientesWebSocket);
    categoriesRoutes(server, userDataPath, actualizarClientesWebSocket);
    medidasRoutes(server, userDataPath, actualizarClientesWebSocket);
    inventarioRoutes(server, userDataPath, actualizarClientesWebSocket);
    menuRoutes(server, userDataPath, actualizarClientesWebSocket);
    categoriasMenuRoutes(server, userDataPath, actualizarClientesWebSocket);
    tiposUsuarioRoutes(server, userDataPath);
    usuariosRoutes(server, userDataPath, actualizarClientesWebSocket);
    pedidosActivosRoutes(server, userDataPath, actualizarClientesWebSocket);
    pedidosFinalizadosRoutes(server, userDataPath);
    metodosPagoRoutes(server, userDataPath, actualizarClientesWebSocket);
}

module.exports = setupAppRoutes;
