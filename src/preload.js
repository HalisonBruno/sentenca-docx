const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  gerarDocx: (textoJS) => ipcRenderer.invoke('gerar-docx', textoJS)
});
