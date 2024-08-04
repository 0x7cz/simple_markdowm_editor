// main.js
const { app, BrowserWindow, dialog, Menu,ipcMain, MenuItem } = require('electron');
const fs = require('fs');
const path = require('node:path');

let currentFilePath = null; // 用于存储当前文件的路径

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled && filePaths.length > 0) {
    currentFilePath = filePaths[0];
    return filePaths[0];
  }
  return null;
}

async function handleFileSave(win) {
  if (currentFilePath) {
    // 如果当前有文件路径，则直接保存到该路径
    const content = await win.webContents.executeJavaScript('document.getElementById("input").value');
    try {
      await fs.promises.writeFile(currentFilePath, content, 'utf8');
      win.webContents.send('save-success', currentFilePath);
    } catch (error) {
      console.error('Error writing file:', error);
      win.webContents.send('save-error', error.message);
    }
  } else {
    // 如果当前没有文件路径，则显示保存对话框
    const { filePath } = await dialog.showSaveDialog();
    if (filePath) {
      currentFilePath = filePath;
      const content = await win.webContents.executeJavaScript('document.getElementById("input").value');
      try {
        await fs.promises.writeFile(currentFilePath, content, 'utf8');
        win.webContents.send('save-success', currentFilePath);
      } catch (error) {
        console.error('Error writing file:', error);
        win.webContents.send('save-error', error.message);
      }
    }
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('src/notepad.html');

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        new MenuItem({
          label: 'New',
          click: () => {
            win.webContents.send('action', 'new');
          },
          accelerator: 'CmdOrCtrl+N',
        }),
        new MenuItem({
          label: 'Open',
          click: async () => {
            const filePath = await handleFileOpen();
            if (filePath) {
              try {
                const data = await fs.promises.readFile(filePath, 'utf8');
                win.webContents.send('file-content', data);
              } catch (error) {
                console.error('Error reading file:', error);
                win.webContents.send('file-error', error.message);
              }
            }
          },
          accelerator: 'CmdOrCtrl+O',
        }),
        new MenuItem({
          label: 'Save',
          click: async () => {
            await handleFileSave(win);
          },
          accelerator: 'CmdOrCtrl+S',
        }),
        new MenuItem({
          type: 'separator',
        }),
        new MenuItem({
          role: 'quit',
        }),
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
};

app.whenReady().then(() => {
  createWindow();
  console.log('Window created and loaded.');
});

// 打印启动完成的信息
app.on('ready', () => {
  console.log('Application is ready.');
});

ipcMain.on('reqaction', (event, arg) => {
  console.log(`Received action: ${arg}`);
  switch (arg) {
    case 'exit':
      // Do other operations here, like saving window state
      app.quit(); // Exit the application
      break;
  }
});