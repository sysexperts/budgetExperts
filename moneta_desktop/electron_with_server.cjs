const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

let mainWindow;
let server;

// Einfacher HTTP Server für API und statische Dateien
function createServer() {
  const port = 3001;
  
  server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // CORS Header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // API Endpoints
    if (parsedUrl.pathname.startsWith('/api/')) {
      handleApiRequest(req, res, parsedUrl);
    } 
    // Statische Dateien
    else {
      serveStaticFile(req, res, parsedUrl);
    }
  });
  
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  
  return server;
}

function handleApiRequest(req, res, parsedUrl) {
  // Einfache Mock-API für Test
  if (parsedUrl.pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        
        // Mock Login - akzeptiere vapurserdar@gmail.com mit Kayseri3838
        if (email === 'vapurserdar@gmail.com' && password === 'Kayseri3838') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            sessionId: 'mock-session-id',
            user: { id: 1, email: 'vapurserdar@gmail.com', name: 'Vapurserdar' }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ungültige Login-Daten' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ungültige Anfrage' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API Endpoint nicht gefunden' }));
  }
}

function serveStaticFile(req, res, parsedUrl) {
  let filePath = path.join(__dirname, 'dist');
  
  if (parsedUrl.pathname === '/') {
    filePath = path.join(filePath, 'index.html');
  } else {
    filePath = path.join(filePath, parsedUrl.pathname);
  }
  
  // Korrigiere Pfade für assets
  if (parsedUrl.pathname.startsWith('/assets/')) {
    filePath = path.join(__dirname, 'dist', 'assets', path.basename(parsedUrl.pathname));
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    }[ext] || 'text/plain';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    show: false,
    titleBarStyle: 'default'
  });

  // Lade die Anwendung vom lokalen Server
  const startUrl = 'http://localhost:3001';
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
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
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createServer();
  createWindow();
  createMenu();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
