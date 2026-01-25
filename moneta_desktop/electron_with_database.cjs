const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

let mainWindow;
let server;
let dbPath;

// Datenbankpfad im Projektordner
function setupDatabase() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  dbPath = path.join(dataDir, 'budget.db');
  console.log('Datenbankpfad:', dbPath);
}

// Einfache In-Memory Datenbank mit Persistenz
let database = {
  users: [
    { id: 1, email: 'vapurserdar@gmail.com', name: 'Vapurserdar' }
  ],
  households: [],
  categories: [
    { id: 1, name: 'Wohnen', type: 'expense' },
    { id: 2, name: 'Versicherung', type: 'expense' },
    { id: 3, name: 'Lebensmittel', type: 'expense' },
    { id: 4, name: 'Transport', type: 'expense' },
    { id: 5, name: 'Unterhaltung', type: 'expense' },
    { id: 6, name: 'Gesundheit', type: 'expense' },
    { id: 7, name: 'Bildung', type: 'expense' },
    { id: 8, name: 'Sonstiges', type: 'expense' }
  ],
  familyMembers: [],
  fixedCosts: [],
  subscriptions: [],
  installmentPlans: [],
  savingsGoals: []
};

// Lade Datenbank aus Datei
function loadDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      database = JSON.parse(data);
      console.log('Datenbank geladen');
    }
  } catch (error) {
    console.error('Fehler beim Laden der Datenbank:', error);
  }
}

// Speichere Datenbank in Datei
function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    console.log('Datenbank gespeichert');
  } catch (error) {
    console.error('Fehler beim Speichern der Datenbank:', error);
  }
}

// Einfacher HTTP Server mit API
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
            user: database.users[0]
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
  }
  // Session Check
  else if (parsedUrl.pathname === '/api/session' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      user: database.users[0]
    }));
  }
  // Categories
  else if (parsedUrl.pathname === '/api/categories' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.categories));
  }
  // Family Members
  else if (parsedUrl.pathname === '/api/family-members' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.familyMembers));
  }
  // Fixed Costs
  else if (parsedUrl.pathname === '/api/fixed-costs' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.fixedCosts));
  }
  // Subscriptions
  else if (parsedUrl.pathname === '/api/subscriptions' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.subscriptions));
  }
  // Installment Plans
  else if (parsedUrl.pathname === '/api/installment-plans' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.installmentPlans));
  }
  // Households
  else if (parsedUrl.pathname === '/api/households' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(database.households));
  }
  // Month Summary
  else if (parsedUrl.pathname === '/api/month-summary' && req.method === 'GET') {
    const transactions = [];
    
    database.fixedCosts.forEach(cost => {
      const monthly = cost.interval === 'monthly' ? cost.amount : cost.amount / 12;
      transactions.push({
        id: `cost-${cost.id}`,
        name: cost.name,
        category: cost.category,
        amount: monthly,
        date: new Date().toISOString(),
        paid: false,
        type: 'fixed'
      });
    });
    
    database.subscriptions.forEach(sub => {
      const monthly = sub.interval === 'monthly' ? sub.amount : sub.amount / 12;
      transactions.push({
        id: `sub-${sub.id}`,
        name: sub.name,
        category: sub.category,
        amount: monthly,
        date: new Date().toISOString(),
        paid: false,
        type: 'subscription'
      });
    });
    
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalExpenses,
      paid: 0,
      open: totalExpenses,
      remaining: totalExpenses,
      transactions
    }));
  }
  else {
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
          label: 'Datenbank sichern',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(__dirname, 'data', `budget_backup_${timestamp}.db`);
            
            try {
              fs.copyFileSync(dbPath, backupPath);
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Backup erstellt',
                message: `Datenbank wurde erfolgreich gesichert als:\n${path.basename(backupPath)}`
              });
            } catch (error) {
              dialog.showMessageBox(mainWindow, {
                type: 'error',
                title: 'Fehler',
                message: 'Backup konnte nicht erstellt werden.'
              });
            }
          }
        },
        {
          label: 'Datenbank wiederherstellen',
          click: () => {
            const restorePaths = dialog.showOpenDialogSync(mainWindow, {
              defaultPath: path.join(__dirname, 'data'),
              filters: [
                { name: 'Database Files', extensions: ['db', 'json'] }
              ],
              properties: ['openFile']
            });
            
            if (restorePaths && restorePaths.length > 0) {
              try {
                // Erstelle Backup vor Wiederherstellung
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupPath = path.join(__dirname, 'data', `budget_backup_before_restore_${timestamp}.db`);
                if (fs.existsSync(dbPath)) {
                  fs.copyFileSync(dbPath, backupPath);
                }
                
                // Lade wiederherzustellende Datei
                const restoreData = fs.readFileSync(restorePaths[0], 'utf8');
                database = JSON.parse(restoreData);
                saveDatabase();
                
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Wiederherstellung erfolgreich',
                  message: 'Datenbank wurde wiederhergestellt. Die Anwendung wird neu gestartet.',
                  buttons: ['OK']
                }).then(() => {
                  app.relaunch();
                  app.exit();
                });
              } catch (error) {
                dialog.showMessageBox(mainWindow, {
                  type: 'error',
                  title: 'Fehler',
                  message: 'Datenbank konnte nicht wiederhergestellt werden.'
                });
              }
            }
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
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  setupDatabase();
  loadDatabase();
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
  saveDatabase(); // Speichere Datenbank beim Schließen
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
