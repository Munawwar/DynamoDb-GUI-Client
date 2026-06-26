const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  listProfiles: () => ipcRenderer.invoke('aws:list-profiles'),
  resolveProfile: (name) => ipcRenderer.invoke('aws:resolve-profile', name),
  getLoginCommand: (name) => ipcRenderer.invoke('aws:get-login-command', name),
});
