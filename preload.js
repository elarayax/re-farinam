const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, data) => callback(data))
});
