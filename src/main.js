const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { gerarDocx } = require('./gerador');
const { parseSentenca } = require('./parser');

function criarJanela() {
  const janela = new BrowserWindow({
    width: 980,
    height: 760,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  janela.loadFile(path.join(__dirname, 'index.html'));
  janela.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  criarJanela();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('gerar-docx', async (event, textoJS) => {
  try {
    const estrutura = parseSentenca(textoJS);

    const nomeSugerido = sugerirNome(estrutura.processo);
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Salvar sentença',
      defaultPath: nomeSugerido,
      filters: [{ name: 'Documento Word', extensions: ['docx'] }]
    });

    if (canceled || !filePath) {
      return { ok: false, motivo: 'cancelado' };
    }

    const buffer = await gerarDocx(estrutura);
    fs.writeFileSync(filePath, buffer);
    return { ok: true, caminho: filePath };
  } catch (erro) {
    return { ok: false, motivo: erro.message, stack: erro.stack };
  }
});

function sugerirNome(processo) {
  if (!processo) return 'sentenca.docx';
  const limpo = processo
    .replace(/Processo n[ºo°]?\s*/i, '')
    .replace(/[^\w\-.]/g, '_')
    .replace(/_+/g, '_');
  return `sentenca_${limpo}.docx`;
}
