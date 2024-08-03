// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  receiveFileContent: (callback) => {
    ipcRenderer.on('file-content', (event, content) => {
      callback(content);
    });
  },
  receiveFileError: (callback) => {
    ipcRenderer.on('file-error', (event, message) => {
      callback(message);
    });
  },
  saveFile: (callback) => {
    ipcRenderer.on('save-success', (event, filePath) => {
      callback(null, filePath);
    });
    ipcRenderer.on('save-error', (event, message) => {
      callback(message);
    });
  },
});