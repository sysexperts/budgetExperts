const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const express = require('express');
const fs = require('fs');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Lade die App - in Entwicklung von Vite, in Produktion von gebauten Dateien
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // In Entwicklung öffne DevTools
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Datenbank sichern',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            backupDatabase();
          }
        },
        {
          label: 'Datenbank wiederherstellen',
          click: () => {
            restoreDatabase();
          }
        },
        { type: 'separator' },
        {
          label: 'Beenden',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Über Moneta',
              message: 'Moneta - Budget Planner',
              detail: 'Ein moderner web-basierter Budget-Planer für Einzelpersonen und Familien.\nVersion 1.0.0'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function backupDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'budget.db');
  if (fs.existsSync(dbPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = dialog.showSaveDialogSync(mainWindow, {
      defaultPath: `budget_backup_${timestamp}.db`,
      filters: [
        { name: 'Database Files', extensions: ['db'] }
      ]
    });
    
    if (backupPath) {
      fs.copyFileSync(dbPath, backupPath);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Backup erstellt',
        message: 'Datenbank wurde erfolgreich gesichert.'
      });
    }
  }
}

function restoreDatabase() {
  const restorePath = dialog.showOpenDialogSync(mainWindow, {
    filters: [
      { name: 'Database Files', extensions: ['db'] }
    ],
    properties: ['openFile']
  });
  
  if (restorePath && restorePath.length > 0) {
    const dbPath = path.join(app.getPath('userData'), 'budget.db');
    
    // Erstelle Backup vor Wiederherstellung
    if (fs.existsSync(dbPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(app.getPath('userData'), `budget_backup_before_restore_${timestamp}.db`);
      fs.copyFileSync(dbPath, backupPath);
    }
    
    fs.copyFileSync(restorePath[0], dbPath);
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Wiederherstellung erfolgreich',
      message: 'Datenbank wurde wiederhergestellt. Die Anwendung wird neu gestartet.',
      buttons: ['OK']
    }).then(() => {
      app.relaunch();
      app.exit();
    });
  }
}

app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Sicherheitsmaßnahmen
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
