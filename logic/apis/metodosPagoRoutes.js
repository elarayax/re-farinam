// metodosPagoRoutes.js
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws'); // Importar WebSocket

module.exports = function (server, paymentMethodsDataPath, wss) {
    const metodosPagoFilePath = path.join(paymentMethodsDataPath, 'metodosPago.json');

    // Rutas para gestionar los métodos de pago
    server.get('/api/metodosPago', (req, res) => {
        fs.readFile(metodosPagoFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los métodos de pago');
            res.json(JSON.parse(data));  // Devuelve todos los métodos de pago en formato JSON
        });
    });

    server.get('/api/metodosPago/:id', (req, res) => {
        const id = parseInt(req.params.id, 10); // Obtener el ID desde la URL
        fs.readFile(metodosPagoFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los métodos de pago');
            const metodosPago = JSON.parse(data);
            const metodoPago = metodosPago.find(m => m.id === id); // Buscar el método de pago por ID
            if (!metodoPago) return res.status(404).send('Método de pago no encontrado'); // Si no se encuentra el método de pago, devolver 404
            res.json(metodoPago); // Si se encuentra, devolver el método de pago en formato JSON
        });
    });

    server.post('/api/metodosPago', (req, res) => {
        const { nombre, comision } = req.body;

        fs.readFile(metodosPagoFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los métodos de pago');
            const metodosPago = JSON.parse(data);
            const maxId = metodosPago.reduce((max, metodo) => (metodo.id > max ? metodo.id : max), 0);
            const newMetodoPago = { id: maxId + 1, nombre, comision };

            metodosPago.push(newMetodoPago);

            fs.writeFile(metodosPagoFilePath, JSON.stringify(metodosPago, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar el método de pago');
                
                // Notificar a todos los clientes conectados por WebSocket
                wss("metodoPago", metodosPago);

                res.status(201).json(newMetodoPago);  // Devuelve el nuevo método de pago agregado
            });
        });
    });

    server.put('/api/metodosPago/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);
        const { nombre, comision } = req.body;

        fs.readFile(metodosPagoFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los métodos de pago');
            let metodosPago = JSON.parse(data);
            const index = metodosPago.findIndex(m => m.id === id);
            if (index === -1) return res.status(404).send('Método de pago no encontrado');

            metodosPago[index] = { id, nombre, comision };  // Actualiza el método de pago con el nuevo nombre y comision

            fs.writeFile(metodosPagoFilePath, JSON.stringify(metodosPago, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar los métodos de pago');

                // Notificar a todos los clientes conectados por WebSocket
                wss("metodoPago", metodosPago);

                res.status(200).json(metodosPago[index]);  // Devuelve el método de pago actualizado
            });
        });
    });

    server.delete('/api/metodosPago/:id', (req, res) => {
        const id = parseInt(req.params.id, 10);

        fs.readFile(metodosPagoFilePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Error al leer los métodos de pago');
            let metodosPago = JSON.parse(data);
            metodosPago = metodosPago.filter(m => m.id !== id);  // Elimina el método de pago por ID

            fs.writeFile(metodosPagoFilePath, JSON.stringify(metodosPago, null, 2), (err) => {
                if (err) return res.status(500).send('Error al guardar los métodos de pago');

                // Notificar a todos los clientes conectados por WebSocket
                wss("metodoPago", metodosPago);

                res.status(200).send('Método de pago eliminado con éxito');
            });
        });
    });
};
