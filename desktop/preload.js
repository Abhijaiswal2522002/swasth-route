const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe context bridge API to the frontend renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});
