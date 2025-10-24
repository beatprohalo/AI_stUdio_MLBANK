const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // App controls
  newSession: () => ipcRenderer.send('new-session'),
  openFileDialog: () => ipcRenderer.send('open-file'),
  
  // System info
  getVersion: () => ipcRenderer.invoke('get-version'),
  getPlatform: () => process.platform,
  
  // Event listeners
  onNewSession: (callback) => ipcRenderer.on('new-session', callback),
  onOpenFile: (callback) => ipcRenderer.on('open-file', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose a safe version of the Node.js process object
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
