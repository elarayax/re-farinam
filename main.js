const { app, BrowserWindow, ipcMain, Notification } = require('electron');
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
        { fileName: 'metodosPago.json', source: path.join(__dirname, 'data', 'metodosPago.json') },
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

// Crear ventana de progreso de actualización
let updateWindow;
function createUpdateWindow() {
    updateWindow = new BrowserWindow({
        width: 500,
        height: 300,
        parent: null,  // Ventana flotante
        modal: true,    // Modal para que bloquee el acceso a otras ventanas
        show: false,    // No la mostramos hasta que esté lista
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    //updateWindow.loadURL(path.join('file://', __dirname, 'update.html'));  
    updateWindow.loadURL(`http://localhost:3000/updater`); // Carga una vista HTML para mostrar el progreso

    updateWindow.once('ready-to-show', () => {
        updateWindow.show();  // Mostrar la ventana de actualización
    });
}

function closeUpdateWindow() {
    if (updateWindow) {
        updateWindow.close();
        updateWindow = null;
    }
}

// Evento whenReady para inicializar la app y crear la ventana
app.whenReady().then(() => {
    initializeUserData(); // Inicializa los datos del usuario
    createUpdateWindow(); // Crea la ventana de actualización
    createWindow();

    autoUpdater.checkForUpdatesAndNotify();

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
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('update-available', () => {
    console.log('Actualización disponible.');
    // Aquí puedes notificar al usuario en la interfaz
});

autoUpdater.on('update-downloaded', () => {
    console.log('Actualización descargada. La aplicación se cerrará y se actualizará.');
    closeUpdateWindow();  // Cerramos la ventana de progreso
    autoUpdater.quitAndInstall();
});

autoUpdater.on('checking-for-update', () => {
    console.log('Verificando si hay actualizaciones...');
});

autoUpdater.on('update-not-available', () => {
    console.log('No hay actualizaciones disponibles.');
    // Aquí puedes notificar al usuario en la interfaz
});

autoUpdater.on('error', (err) => {
    console.error('Error al verificar actualizaciones:', err);
    // Notificar al usuario de algún error
    closeUpdateWindow();  // Cerramos la ventana de progreso si hay un error
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Descargando: " + progressObj.percent + "%";
    console.log(log_message);
    // Aquí puedes actualizar la interfaz con el progreso de la descarga
    if (updateWindow) {
        updateWindow.webContents.send('update-progress', progressObj);  // Enviar el progreso a la ventana de actualización
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Actualización descargada:', info);
    if (updateWindow) {
        updateWindow.webContents.send('update-progress', { percent: 100 });
        updateWindow.webContents.executeJavaScript(`
            document.getElementById('status').innerText = "Actualización completada. Reiniciando...";
        `);
    }

    setTimeout(() => {
        closeUpdateWindow();
        autoUpdater.quitAndInstall();
    }, 3000); // Espera 3 segundos antes de reiniciar
});
