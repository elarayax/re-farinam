const { app, BrowserWindow } = require('electron');
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws'); // Importar la biblioteca ws

const server = express();
const PORT = 3000;
const cors = require('cors');

const { autoUpdater } = require('electron-updater');

// Middleware
server.use(cors({ origin: '*' })); 
server.use(express.static('public'));
server.use(express.json());

server.get('/administrador/opciones.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vistas', 'administrador', 'opciones.html'));
});

server.get('/administrador/scripts/zonas.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vistas', 'administrador', 'scripts', 'zonas.js'));
});

server.get('/administrador/scripts/medidas.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vistas', 'administrador', 'scripts', 'medidas.js'));
});

// Ruta para servir index.html en la raíz
server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para obtener datos
server.get('/api/data', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'data.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file');
        }
        res.json(JSON.parse(data));
    });
});

// API para actualizar datos
server.post('/api/data', (req, res) => {
    fs.writeFile(path.join(__dirname, 'data', 'data.json'), JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Error writing data file');
        }
        res.status(200).send('Data updated successfully');
    });
});

const zonasFilePath = path.join(__dirname, 'data', 'zonas.json');

// Ruta para obtener todas las zonas
server.get('/api/zonas', (req, res) => {
    fs.readFile(zonasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo zonas.json:', err);
            return res.status(500).send('Error reading zonas file');
        }
        try {
            const zonas = JSON.parse(data);
            res.json(zonas);
        } catch (parseError) {
            console.error('Error al analizar JSON:', parseError);
            return res.status(500).send('Error parsing zonas JSON');
        }
    });
});

// Ruta para agregar una nueva zona
server.post('/api/zonas', (req, res) => {
    console.log('Datos recibidos:', req.body);  // Verificar si los datos llegan correctamente

    fs.readFile(zonasFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading zonas file');
        }
        const zonas = JSON.parse(data);
        const newZona = { id: zonas.length + 1, ...req.body };
        zonas.push(newZona);
        fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing zonas file');
            }
            // Enviar las zonas actualizadas a todos los clientes WebSocket
            actualizarClientesWebSocket(zonas);
            res.status(201).json(newZona);
        });
    });
});
// Ruta para eliminar una zona
server.delete('/api/zonas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10); // Obtener el ID de la zona a eliminar
    fs.readFile(zonasFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading zonas file');
        }
        let zonas = JSON.parse(data);
        // Filtrar la zona que se desea eliminar
        zonas = zonas.filter(zona => zona.id !== id);
        fs.writeFile(zonasFilePath, JSON.stringify(zonas, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing zonas file');
            }
            // Enviar las zonas actualizadas a todos los clientes WebSocket
            actualizarClientesWebSocket(zonas);
            res.status(200).send('Zona eliminada con éxito');
        });
    });
});

const medidasFilePath = path.join(__dirname, 'data', 'medidas.json');

server.get('/api/medidas', (req, res) => {
    fs.readFile(medidasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al cargar medidas:', err);
            return res.status(500).send('Error reading medidas file');
        }
        try {
            const medidas = JSON.parse(data);
            res.json(medidas);
        } catch (parseError) {
            console.error('Error al analizar JSON:', parseError);
            return res.status(500).send('Error parsing medidas JSON');
        }
    });
});

server.post('/api/medidas', (req, res) => {
    console.log('Datos recibidos para agregar medida:', req.body);  // Depurar los datos
    fs.readFile(medidasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer medidas:', err);
            return res.status(500).send('Error reading medidas file');
        }

        try {
            const medidas = JSON.parse(data);
            const newMedida = { id: medidas.length + 1, ...req.body };
            medidas.push(newMedida);

            fs.writeFile(medidasFilePath, JSON.stringify(medidas, null, 2), (err) => {
                if (err) {
                    console.error('Error al escribir medidas:', err);
                    return res.status(500).send('Error writing medidas file');
                }

                // Enviar las medidas actualizadas a todos los clientes WebSocket
                actualizarClientesWebSocketMedidas(medidas);
                res.status(201).json(newMedida);
            });
        } catch (parseError) {
            console.error('Error al analizar JSON:', parseError);
            res.status(500).send('Error parsing medidas JSON');
        }
    });
});


// Ruta para actualizar una medida
server.put('/api/medidas/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const data = await fs.readFile(medidasFilePath, 'utf8');
        const medidas = JSON.parse(data);
        const index = medidas.findIndex(medida => medida.id === id);

        if (index === -1) {
            return res.status(404).send('Medida no encontrada');
        }

        medidas[index] = { id, ...req.body };
        await fs.writeFile(medidasFilePath, JSON.stringify(medidas, null, 2));
        actualizarClientesWebSocketMedidas(medidas);
        res.status(200).json(medidas[index]);
    } catch (error) {
        console.error('Error al actualizar medida:', error);
        res.status(500).send('Error processing medidas');
    }
});

server.delete('/api/medidas/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    fs.readFile(medidasFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo de medidas:', err);
            return res.status(500).send('Error reading medidas file');
        }

        let medidas = JSON.parse(data);
        const medidasFiltradas = medidas.filter(medida => medida.id !== id);

        if (medidas.length === medidasFiltradas.length) {
            console.log('Medida no encontrada con ID:', id);
            return res.status(404).send('Medida no encontrada');
        }

        fs.writeFile(medidasFilePath, JSON.stringify(medidasFiltradas, null, 2), (err) => {
            if (err) {
                console.error('Error al escribir en el archivo de medidas:', err);
                return res.status(500).send('Error writing medidas file');
            }

            // Enviar las medidas actualizadas a los clientes WebSocket
            console.log('Enviando medidas actualizadas a los clientes WebSocket');
            actualizarClientesWebSocketMedidas(medidasFiltradas);

            res.status(200).send('Medida eliminada con éxito');
        });
    });
});


// Configuración de WebSocket
const serverHttp = require('http').createServer(server);
const wss = new WebSocket.Server({ noServer: true });

serverHttp.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Función para actualizar clientes WebSocket con las zonas
function actualizarClientesWebSocket(zonas) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'zonas', data: zonas }));
        }
    });
}

function actualizarClientesWebSocketMedidas(medidas) {
    console.log('Actualizando WebSocket con las medidas:', medidas);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            console.log('Enviando datos a WebSocket:', medidas);
            client.send(JSON.stringify({ type: 'medidas', data: medidas }));
        }
    });
}

// Función para obtener la IP local
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

// Función para leer la IP desde ip.json
function readStoredIP() {
    const ipFilePath = path.join(__dirname, 'data', 'ip.json');
    if (fs.existsSync(ipFilePath)) {
        const data = fs.readFileSync(ipFilePath, 'utf8');
        return JSON.parse(data).ip;
    }
    return null; // Si no existe el archivo, retorna null
}

// Función para guardar la IP en ip.json
function saveIP(ip) {
    const ipFilePath = path.join(__dirname, 'data', 'ip.json');
    fs.writeFileSync(ipFilePath, JSON.stringify({ ip }, null, 2), 'utf8');
}

function modifyFiles(filePaths) {
    const localIP = getLocalIP();
    const storedIP = readStoredIP();

    console.log(`IP local: ${localIP}, IP almacenada: ${storedIP}`);

    // Si la IP ha cambiado, actualiza los archivos
    if (storedIP !== localIP) {
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                // Leer el contenido del archivo
                let content = fs.readFileSync(filePath, 'utf8');

                // Reemplazar "localhost" o la IP antigua por la nueva IP
                const updatedContent = content
                    .replace(/localhost/g, localIP) // Reemplaza "localhost"
                    .replace(new RegExp(storedIP, 'g'), localIP); // Reemplaza la IP antigua

                // Escribir el contenido actualizado de nuevo en el archivo
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Archivo modificado: ${filePath}`);
            } else {
                console.error(`El archivo no existe: ${filePath}`);
            }
        });
        // Guarda la nueva IP
        saveIP(localIP);
    } else {
        console.log('La IP no ha cambiado. No se realizan modificaciones.');
    }
}

// Crear ventana de la aplicación
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const localIP = getLocalIP();
    win.loadURL(`http://${localIP}:${PORT}/`); // Cargar la raíz
}

app.whenReady().then(() => {
    const storedIP = readStoredIP();
    const currentIP = getLocalIP();
    console.log(`IP almacenada: ${storedIP}, IP actual: ${currentIP}`); // Log para verificar

    if (storedIP !== currentIP) {
        console.log("La IP ha cambiado, modificando archivos...");
        modifyFiles([
            path.join(__dirname, 'public/index.html'), 
            path.join(__dirname, 'public/vistas/administrador/scripts/zonas.js'),
            path.join(__dirname, 'public/vistas/administrador/scripts/medidas.js'),
            path.join(__dirname, 'public/vistas/administrador/opciones.html'),
        ]); // Modificar archivos

        // Guarda la nueva IP después de modificar los archivos
        saveIP(currentIP);
    } else {
        console.log('La IP no ha cambiado. No se realizan modificaciones.');
    }

    serverHttp.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor escuchando en http://${currentIP}:${PORT}`);
    });
    createWindow();
});

// Manejo de conexiones WebSocket en el servidor
wss.on('connection', (ws) => {
    console.log('Cliente conectado');

    ws.on('message', (message) => {
        console.log('Mensaje recibido:', message);
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

autoUpdater.on('update-available', () => {
    console.log('Actualización disponible.');
});
  
autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada. La aplicación se cerrará y se actualizará.');
    autoUpdater.quitAndInstall();
});