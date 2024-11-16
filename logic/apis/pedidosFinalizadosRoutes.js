const fs = require('fs');
const path = require('path');

module.exports = function (server, userDataPath) {
    const pedidosFinalizadosFilePath = path.join(userDataPath, 'pedidosFinalizados.json');

    // Obtener todos los pedidos finalizados
    server.get('/api/pedidos/finalizados', (req, res) => {
        fs.readFile(pedidosFinalizadosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos finalizados');
            res.json(JSON.parse(data)); // Retorna todos los pedidos finalizados
        });
    });

    // Obtener un pedido finalizado específico por ID
    server.get('/api/pedidos/finalizados/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(pedidosFinalizadosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos finalizados');
            const pedidos = JSON.parse(data);
            const pedido = pedidos.find(pedido => pedido.id === id);
            if (!pedido) return res.status(404).send('Pedido no encontrado');
            res.json(pedido);
        });
    });

    server.get('/api/pedidos/finalizados/buscar', (req, res) => {
        const { idUsuario, idZona, idMesa, fechaFinalizacion } = req.query;

        fs.readFile(pedidosFinalizadosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            let pedidos = JSON.parse(data);

            if (idUsuario) {
                pedidos = pedidos.filter(pedido => pedido.idMozo == idUsuario);
            }
            if (idZona) {
                pedidos = pedidos.filter(pedido => pedido.idZona == idZona);
            }
            if (idMesa) {
                pedidos = pedidos.filter(pedido => pedido.idMesa == idMesa);
            }
            if (fechaFinalizacion) {
                pedidos = pedidos.filter(pedido => pedido.fechaFinalizacion && pedido.fechaFinalizacion === fechaFinalizacion);
            }

            res.json(pedidos);
        });
    });
};
