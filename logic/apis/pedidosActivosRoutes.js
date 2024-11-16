const fs = require('fs');
const path = require('path');

module.exports = function (server, userDataPath, actualizarClientesWebSocketPedidosActivos) {
    const pedidosActivosFilePath = path.join(userDataPath, 'pedidosActivos.json');
    const pedidosFinalizadosFilePath = path.join(userDataPath, 'pedidosFinalizados.json');

    // Obtener todos los pedidos activos
    server.get('/api/pedidos/activos', (req, res) => {
        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            res.json(JSON.parse(data)); // Retorna todos los pedidos activos
        });
    });

    // Obtener un pedido activo específico por ID
    server.get('/api/pedidos/activos/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            const pedidos = JSON.parse(data);
            const pedido = pedidos.find(pedido => pedido.id === id);
            if (!pedido) return res.status(404).send('Pedido no encontrado');
            res.json(pedido);
        });
    });

    // Crear un nuevo pedido activo
    server.post('/api/pedidos/activos', (req, res) => {
        const { idMesa, platos, idMozo, estadoPedido, metodosPago } = req.body;

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            const pedidos = JSON.parse(data);

            const maxId = pedidos.reduce((max, pedido) => (pedido.id > max ? pedido.id : max), 0);
            const newPedido = {
                id: maxId + 1,
                idMesa,
                platos,
                idMozo,
                estadoPedido,
                horaInicio: new Date().toISOString(),
                horaTermino: null,
                metodosPago: metodosPago || [],
            };

            pedidos.push(newPedido);

            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar el pedido activo');
                actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidos);
                res.status(201).json(newPedido);
            });
        });
    });

    // Actualizar un pedido activo por ID
    server.put('/api/pedidos/activos/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { idMesa, platos, idMozo, estadoPedido, metodosPago, horaTermino } = req.body;

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            let pedidos = JSON.parse(data);
            const index = pedidos.findIndex(pedido => pedido.id === id);
            if (index === -1) return res.status(404).send('Pedido no encontrado');

            pedidos[index] = {
                ...pedidos[index],
                idMesa,
                platos,
                idMozo,
                estadoPedido,
                metodosPago,
                horaTermino: horaTermino || pedidos[index].horaTermino,
            };

            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar el pedido activo');
                actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidos);
                res.status(200).json(pedidos[index]);
            });
        });
    });

    // Eliminar un pedido activo por ID
    server.delete('/api/pedidos/activos/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            let pedidos = JSON.parse(data);
            pedidos = pedidos.filter(pedido => pedido.id !== id);

            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar los pedidos activos');
                actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidos);
                res.status(200).send('Pedido eliminado con éxito');
            });
        });
    });

    // Finalizar un pedido (moverlo de pedidos activos a pedidos finalizados)
    server.put('/api/pedidos/activos/:id/finalizar', (req, res) => {
        const id = parseInt(req.params.id, 10);

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            let pedidosActivos = JSON.parse(data);
            const index = pedidosActivos.findIndex(pedido => pedido.id === id);
            if (index === -1) return res.status(404).send('Pedido no encontrado');

            const pedidoFinalizado = { ...pedidosActivos[index], fechaFinalizacion: new Date().toISOString() };
            const pedido = pedidosActivos.splice(index, 1)[0];

            // Guardar los pedidos activos actualizados
            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidosActivos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar los pedidos activos');
            });

            // Agregar el pedido finalizado al archivo correspondiente
            fs.readFile(pedidosFinalizadosFilePath, 'utf8', (err, data) => {
                if (err) return res.status(500).send('Error al leer los pedidos finalizados');
                let pedidosFinalizados = JSON.parse(data);
                pedidosFinalizados.push(pedidoFinalizado);

                fs.writeFile(pedidosFinalizadosFilePath, JSON.stringify(pedidosFinalizados, null, 2), (err) => {
                    if (err) return res.status(500).send('Error al guardar los pedidos finalizados');
                    actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidosFinalizados);
                    res.status(200).json(pedidoFinalizado);
                });
            });
        });
    });

    // Búsqueda de pedidos activos por idUsuario, idZona, idMesa, fechaFinalizacion
    server.get('/api/pedidos/activos/buscar', (req, res) => {
        const { idUsuario, idZona, idMesa, fechaFinalizacion } = req.query;

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
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
