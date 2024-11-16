const { app, BrowserWindow,ipcMain } = require('electron');
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');
const cors = require('cors');
const { autoUpdater } = require('electron-updater');
const setupAppRoutes = require('./logic/serverRoutes'); 

const server = express();
const PORT = 3000;

// Obtiene el directorio de usuario donde se guardarán los archivos JSON
const userDataPath = app.getPath('userData');
const baseDir = __dirname;

// Función para inicializar los datos del usuario
function initializeUserData() {
    const filesToCopy = [
        { fileName: 'zonas.json', source: path.join(__dirname, 'data', 'zonas.json') },
        { fileName: 'medidas.json', source: path.join(__dirname, 'data', 'medidas.json') },
        { fileName: 'ip.json', source: path.join(__dirname, 'data', 'ip.json') },
        { fileName: 'producto.json', source: path.join(__dirname, 'data', 'producto.json') },
        { fileName: 'categoriasProductos.json', source: path.join(__dirname, 'data', 'categoriasProductos.json') },
        { fileName: 'inventario.json', source: path.join(__dirname, 'data', 'inventario.json') },
        { fileName: 'menu.json', source: path.join(__dirname, 'data', 'menu.json') },
        { fileName: 'categoriasMenu.json', source: path.join(__dirname, 'data', 'categoriasMenu.json') },
        { fileName: 'tiposUsuario.json', source: path.join(__dirname, 'data', 'tiposUsuario.json') },
        { fileName: 'usuarios.json', source: path.join(__dirname, 'data', 'usuarios.json') },
        { fileName: 'pedidosFinalizados.json', source: path.join(__dirname, 'data', 'pedidosFinalizados.json') },
        { fileName: 'pedidosActivos.json', source: path.join(__dirname, 'data', 'pedidosActivos.json') },
    ];

    filesToCopy.forEach(({ fileName, source }) => {
        const targetPath = path.join(userDataPath, fileName);
        if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(source, targetPath);
            console.log(`Copiado ${fileName} a ${userDataPath}`);
        }
    });
}

// Middleware
server.use(cors({ origin: '*' }));
server.use(express.static('public'));
server.use(express.json());

setupAppRoutes(server, baseDir, userDataPath, actualizarClientesWebSocket);

// Configuración de WebSocket
const serverHttp = require('http').createServer(server);
const wss = new WebSocket.Server({ noServer: true });

serverHttp.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

function actualizarClientesWebSocket(type, array) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: type, data: array }));
        }
    });
}

// Crear ventana de la aplicación
function createWindow() {
    const win = new BrowserWindow({
        width: 1050,
        height: 700,
        minWidth: 1050,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    const localIP = getLocalIP();
    win.loadURL(`http://${localIP}:${PORT}/`); // Cargar la raíz
}

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

// Evento whenReady para inicializar la app y crear la ventana
app.whenReady().then(() => {
    initializeUserData(); // Inicializa los datos del usuario
    createWindow();

    serverHttp.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor escuchando en http://${getLocalIP()}:${PORT}`);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Cierra la aplicación cuando todas las ventanas estén cerradas (excepto en macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
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

// Configuración de autoUpdater
autoUpdater.on('update-available', () => {
    console.log('Actualización disponible.');
});

autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada. La aplicación se cerrará y se actualizará.');
    autoUpdater.quitAndInstall();
});