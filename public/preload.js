const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Datenbank-Operationen
  backupDatabase: () => ipcRenderer.invoke('backup-database'),
  restoreDatabase: () => ipcRenderer.invoke('restore-database'),
  
  // App-Info
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // Plattform-Info
  platform: process.platform
});
