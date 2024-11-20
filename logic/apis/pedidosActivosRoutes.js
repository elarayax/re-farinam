const fs = require('fs');
const path = require('path');
const os = require('os');

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
    /*server.post('/api/pedidos/activos', (req, res) => {
        const { idMesa, platos, idMozo, estadoPedido, metodosPago, total, nombreMozo, mesa, idZona, zona } = req.body;

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            const pedidos = JSON.parse(data);

            const maxId = pedidos.reduce((max, pedido) => (pedido.id > max ? pedido.id : max), 0);
            const newPedido = {
                id: maxId + 1,
                idMesa,
                platos,
                idMozo,
                nombreMozo,
                estadoPedido,
                total,
                mesa,
                idZona,
                zona,           
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
    });*/

    server.post('/api/pedidos/activos', (req, res) => {
        const { idMesa, platos, idMozo, estadoPedido, metodosPago, total, nombreMozo, mesa, idZona, zona, cantidadPersonas } = req.body;
    
        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
            const pedidos = JSON.parse(data);
    
            const maxId = pedidos.reduce((max, pedido) => (pedido.id > max ? pedido.id : max), 0);
            const newPedido = {
                id: maxId + 1,
                idMesa,
                platos,
                idMozo,
                nombreMozo,
                estadoPedido,
                total,
                mesa,
                idZona,
                zona,
                cantidadPersonas,
                horaInicio: new Date().toISOString(),
                horaTermino: null,
                metodosPago: metodosPago || [],
            };
    
            pedidos.push(newPedido);
    
            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar el pedido activo');
    
                // Llamar a la API para actualizar el estado de la mesa
                const serverIP = getLocalIP(); // Cambia por la IP de tu servidor si es necesario

                let mesaActualizada = {
                    idMesa: parseInt(newPedido.idMesa),
                    numero: `${newPedido.mesa}`,
                    estado: "ocupada",
                    cantidadPersonas: newPedido.cantidadPersonas,
                    pedidoActual: newPedido.id
                }

                let idZonas = parseInt(newPedido.idZona);


    
                console.log(`http://${getLocalIP()}:3000/api/zonasn/${idZonas}/mesas/${encodeURIComponent(newPedido.mesa)}`);

                fetch(`http://${getLocalIP()}:3000/api/zonasn/${idZonas}/mesas/${encodeURIComponent(newPedido.mesa)}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(mesaActualizada),
                })
                    .then((response) => {
                        if (!response.ok) {
                            console.error('Error en la respuesta del servidor:', response.status);
                            throw new Error(`Error al actualizar la mesa en la zona. Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log('Mesa actualizada correctamente:', data);
                        actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidos);
                        res.status(201).json(newPedido);
                    })
                    .catch((error) => {
                        console.error('Error al actualizar la mesa:', error.message);
                        res.status(201).json({
                            mensaje: 'Pedido guardado, pero no se pudo actualizar el estado de la mesa',
                            pedido: newPedido,
                        });
                    });
                
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

        const { metodosPago, total } = req.body;

        if (!metodosPago || !Array.isArray(metodosPago)) {
            return res.status(400).send('Métodos de pago inválidos o no proporcionados');
        }
        if (!total || typeof total !== 'number') {
            return res.status(400).send('Total inválido o no proporcionado');
        }
    
        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');
    
            let pedidosActivos = JSON.parse(data);
            const index = pedidosActivos.findIndex(pedido => pedido.id === id);
            if (index === -1) return res.status(404).send('Pedido no encontrado');
    
            const pedido = pedidosActivos.splice(index, 1)[0]; // Extraer el pedido
            const horaTermino = new Date().toISOString(); // Hora actual
            const { metodosPago, total } = req.body; // Obtener métodos de pago y total del cliente
    
            // Leer pedidos finalizados para calcular el nuevo ID
            fs.readFile(pedidosFinalizadosFilePath, 'utf8', (err, finalizadosData) => {
                if (err) return res.status(500).send('Error al leer los pedidos finalizados');
                const pedidosFinalizados = JSON.parse(finalizadosData);
    
                // Calcular nuevo ID para el pedido finalizado
                const nuevoId = pedidosFinalizados.length > 0
                    ? Math.max(...pedidosFinalizados.map(p => p.id)) + 1
                    : 1;
    
                // Crear el objeto del pedido finalizado
                const pedidoFinalizado = {
                    ...pedido,
                    id: nuevoId,
                    horaTermino,
                    metodosPago,
                    total,
                    estadoPedido: 'finalizado',
                    fechaFinalizacion: horaTermino,
                };
    
                // Guardar el pedido finalizado
                pedidosFinalizados.push(pedidoFinalizado);
                fs.writeFile(pedidosFinalizadosFilePath, JSON.stringify(pedidosFinalizados, null, 2), (err) => {
                    if (err) return res.status(500).send('Error al guardar los pedidos finalizados');
    
                    // Guardar pedidos activos actualizados
                    fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidosActivos, null, 2), (err) => {
                        if (err) return res.status(500).send('Error al guardar los pedidos activos');
    
                        // Actualizar la mesa
                        const mesaActualizada = {
                            idMesa: pedido.idMesa,
                            numero: pedido.mesa,
                            estado: "disponible",
                            cantidadPersonas: 0,
                            pedidoActual: 0
                        };
    
                        fetch(`http://${getLocalIP()}:3000/api/zonasn/${pedido.idZona}/mesas/${encodeURIComponent(mesaActualizada.numero)}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(mesaActualizada),
                        })
                            .then((response) => {
                                if (!response.ok) {
                                    console.error('Error en la respuesta del servidor:', response.status);
                                    throw new Error(`Error al actualizar la mesa en la zona. Status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then((data) => {
                                console.log('Mesa actualizada correctamente:', data);
                                actualizarClientesWebSocketPedidosActivos("pedidosFinalizados", pedidosFinalizados);
                                res.status(200).json(pedidoFinalizado);
                            })
                            .catch((error) => {
                                console.error('Error al actualizar la mesa:', error.message);
                                res.status(201).json({
                                    mensaje: 'Pedido guardado, pero no se pudo actualizar el estado de la mesa',
                                    pedido: pedidoFinalizado,
                                });
                            });
                    });
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

    // Actualizar un pedido activo por ID
    server.put('/api/pedidos/activos/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { platos, estadoPedido, metodosPago, total } = req.body;

        fs.readFile(pedidosActivosFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los pedidos activos');

            let pedidos = JSON.parse(data);
            const pedidoIndex = pedidos.findIndex(pedido => pedido.id === id);

            if (pedidoIndex === -1) return res.status(404).send('Pedido no encontrado');

            // Actualizar los campos enviados en el cuerpo de la solicitud
            if (platos !== undefined) pedidos[pedidoIndex].platos = platos;
            if (estadoPedido !== undefined) pedidos[pedidoIndex].estadoPedido = estadoPedido;
            if (metodosPago !== undefined) pedidos[pedidoIndex].metodosPago = metodosPago;
            if (total !== undefined) pedidos[pedidoIndex].total = total;

            fs.writeFile(pedidosActivosFilePath, JSON.stringify(pedidos, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar los pedidos activos actualizados');
                actualizarClientesWebSocketPedidosActivos("pedidosActivos", pedidos);
                res.status(200).json(pedidos[pedidoIndex]);
            });
        });
    });

};

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const net of interfaces[interfaceName]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback a localhost si no se encuentra
}