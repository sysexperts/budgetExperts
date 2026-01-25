import express from 'express';
import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let db;

// Verwende /app/data für Docker, Benutzerdatenverzeichnis für Electron, sonst aktuelles Verzeichnis
let dbPath;
if (process.env.NODE_ENV === 'production') {
  if (process.versions && process.versions.electron) {
    // Electron Desktop App
    const userDataPath = process.env.ELECTRON_USER_DATA || path.join(os.homedir(), 'AppData', 'Roaming', 'moneta');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    dbPath = path.join(userDataPath, 'budget.db');
  } else {
    // Docker
    dbPath = '/app/data/budget.db';
  }
} else {
  // Entwicklung
  dbPath = 'budget.db';
}

function createBackup() {
  if (fs.existsSync(dbPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let backupDir;
    
    if (process.env.NODE_ENV === 'production') {
      if (process.versions && process.versions.electron) {
        // Electron Desktop App
        const userDataPath = process.env.ELECTRON_USER_DATA || path.join(os.homedir(), 'AppData', 'Roaming', 'moneta');
        backupDir = userDataPath;
      } else {
        // Docker
        backupDir = '/app/data';
      }
    } else {
      // Entwicklung
      backupDir = '.';
    }
    
    const backupPath = path.join(backupDir, `budget_backup_${timestamp}.db`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`Backup erstellt: ${backupPath}`);
  }
}

function runMigrations() {
  console.log('Führe Datenbank-Migrationen durch...');
  
  // Erstelle Backup vor Migrationen
  createBackup();
  
  // Hilfsfunktion um zu prüfen ob eine Spalte existiert
  function columnExists(tableName, columnName) {
    try {
      const stmt = db.prepare(`PRAGMA table_info(${tableName})`);
      const columns = [];
      while (stmt.step()) {
        columns.push(stmt.getAsObject().name);
      }
      stmt.free();
      return columns.includes(columnName);
    } catch (error) {
      return false;
    }
  }
  
  // Migration 1: Füge household_id zu family_members hinzu
  if (!columnExists('family_members', 'household_id')) {
    console.log('Migration: Füge household_id zu family_members hinzu');
    db.run('ALTER TABLE family_members ADD COLUMN household_id INTEGER');
  }
  
  // Migration 2: Füge household_id zu fixed_costs hinzu
  if (!columnExists('fixed_costs', 'household_id')) {
    console.log('Migration: Füge household_id zu fixed_costs hinzu');
    db.run('ALTER TABLE fixed_costs ADD COLUMN household_id INTEGER');
  }
  
  // Migration 3: Füge household_id zu subscriptions hinzu
  if (!columnExists('subscriptions', 'household_id')) {
    console.log('Migration: Füge household_id zu subscriptions hinzu');
    db.run('ALTER TABLE subscriptions ADD COLUMN household_id INTEGER');
  }
  
  console.log('Migrationen abgeschlossen');
  saveDatabase();
}

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
    console.log('Bestehende Datenbank geladen');
  } else {
    db = new SQL.Database();
    console.log('Neue Datenbank erstellt');
  }

  // Erstelle Tabellen nur wenn sie nicht existieren
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS households (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'expense'
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      household_id INTEGER,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fixed_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      interval TEXT NOT NULL,
      family_member_id INTEGER,
      household_id INTEGER,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      interval TEXT NOT NULL,
      payment_date INTEGER NOT NULL,
      family_member_id INTEGER,
      household_id INTEGER,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS paid_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL UNIQUE,
      item_type TEXT NOT NULL,
      paid_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS installment_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      total_amount REAL,
      down_payment REAL,
      interest_rate REAL,
      payment_day INTEGER,
      notes TEXT,
      family_member_id INTEGER,
      household_id INTEGER,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      target_date TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      monthly_contribution REAL NOT NULL,
      household_id INTEGER,
      family_member_id INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE SET NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
    );
  `);
  
  // Führe Migrationen durch um fehlende Spalten hinzuzufügen
  runMigrations();
  
  // Erstelle Standard-Benutzer falls noch keiner existiert
  const userStmt = db.prepare('SELECT COUNT(*) as count FROM users');
  userStmt.step();
  const userCount = userStmt.getAsObject().count;
  userStmt.free();
  
  if (userCount === 0) {
    console.log('Erstelle Standard-Benutzer...');
    const passwordHash = crypto.createHash('sha256').update('Kayseri3838').digest('hex');
    db.run('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)', 
           ['vapurserdar@gmail.com', passwordHash, 'Vapurserdar']);
    console.log('Benutzer vapurserdar@gmail.com erstellt');
  }
  
  // Erstelle Standard-Kategorien falls noch keine existieren
  const stmt = db.prepare('SELECT COUNT(*) as count FROM categories');
  stmt.step();
  const count = stmt.getAsObject().count;
  stmt.free();
  
  if (count === 0) {
    const defaultCategories = [
      'Wohnen',
      'Versicherung',
      'Lebensmittel',
      'Transport',
      'Unterhaltung',
      'Gesundheit',
      'Bildung',
      'Sonstiges'
    ];
    
    defaultCategories.forEach(category => {
      db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [category, 'expense']);
    });
  }
  
  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Session Management
const sessions = new Map();

// Middleware für Authentifizierung
function requireAuth(req, res, next) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }
  
  req.user = session.user;
  next();
}

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email und Passwort erforderlich' });
  }
  
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?');
  stmt.bind([email, passwordHash]);
  
  if (stmt.step()) {
    const user = stmt.getAsObject();
    stmt.free();
    
    // Erstelle Session
    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionId, { user, createdAt: new Date() });
    
    res.json({ 
      success: true, 
      sessionId, 
      user: { id: user.id, email: user.email, name: user.name }
    });
  } else {
    stmt.free();
    res.status(401).json({ error: 'Ungültige Login-Daten' });
  }
});

// Logout API
app.post('/api/logout', (req, res) => {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(sessionId);
  res.json({ success: true });
});

// Check Session API
app.get('/api/session', requireAuth, (req, res) => {
  res.json({ 
    success: true, 
    user: { id: req.user.id, email: req.user.email, name: req.user.name }
  });
});

// Households API
app.get('/api/households', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM households');
  const households = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    households.push(row);
  }
  stmt.free();
  res.json(households);
});

app.post('/api/households', requireAuth, (req, res) => {
  const { name, description } = req.body;
  db.run('INSERT INTO households (name, description) VALUES (?, ?)', [name, description || null]);
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, description });
});

app.delete('/api/households/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM households WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// Categories API
app.get('/api/categories', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  const categories = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    categories.push({
      id: row.id,
      name: row.name,
      type: row.type
    });
  }
  stmt.free();
  res.json(categories);
});

app.post('/api/categories', requireAuth, (req, res) => {
  const { name, type } = req.body;
  
  // Prüfe ob Kategorie bereits existiert
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE name = ?');
  checkStmt.bind([name]);
  checkStmt.step();
  const exists = checkStmt.getAsObject().count > 0;
  checkStmt.free();
  
  if (exists) {
    return res.status(400).json({ error: 'Kategorie existiert bereits' });
  }
  
  db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type || 'expense']);
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, type: type || 'expense' });
});

app.put('/api/categories/:id', requireAuth, (req, res) => {
  const { name } = req.body;
  
  // Prüfe ob Kategorie mit diesem Namen bereits existiert (außer die aktuelle)
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE name = ? AND id != ?');
  checkStmt.bind([name, req.params.id]);
  checkStmt.step();
  const exists = checkStmt.getAsObject().count > 0;
  checkStmt.free();
  
  if (exists) {
    return res.status(400).json({ error: 'Kategorie existiert bereits' });
  }
  
  db.run('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.delete('/api/categories/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// Family Members API
app.get('/api/family-members', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM family_members');
  const members = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    members.push({
      id: row.id,
      name: row.name,
      role: row.role,
      householdId: row.household_id
    });
  }
  stmt.free();
  res.json(members);
});

app.post('/api/family-members', requireAuth, (req, res) => {
  const { name, role, householdId } = req.body;
  db.run('INSERT INTO family_members (name, role, household_id) VALUES (?, ?, ?)', [name, role || null, householdId || null]);
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, role, householdId });
});

app.delete('/api/family-members/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM family_members WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/fixed-costs', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM fixed_costs');
  const costs = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    costs.push({
      id: row.id,
      name: row.name,
      category: row.category,
      amount: row.amount,
      interval: row.interval,
      familyMemberId: row.family_member_id,
      householdId: row.household_id
    });
  }
  stmt.free();
  res.json(costs);
});

app.post('/api/fixed-costs', requireAuth, (req, res) => {
  const { name, category, amount, interval, familyMemberId, householdId } = req.body;
  db.run(
    'INSERT INTO fixed_costs (name, category, amount, interval, family_member_id, household_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, amount, interval, familyMemberId || null, householdId || null]
  );
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, category, amount, interval, familyMemberId, householdId });
});

app.delete('/api/fixed-costs/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM fixed_costs WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/subscriptions', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM subscriptions');
  const subs = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    subs.push({
      id: row.id,
      name: row.name,
      category: row.category,
      amount: row.amount,
      interval: row.interval,
      paymentDate: row.payment_date,
      familyMemberId: row.family_member_id,
      householdId: row.household_id
    });
  }
  stmt.free();
  res.json(subs);
});

app.post('/api/subscriptions', requireAuth, (req, res) => {
  const { name, category, amount, interval, paymentDate, familyMemberId, householdId } = req.body;
  db.run(
    'INSERT INTO subscriptions (name, category, amount, interval, payment_date, family_member_id, household_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, category, amount, interval, paymentDate, familyMemberId || null, householdId || null]
  );
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, category, amount, interval, paymentDate, familyMemberId, householdId });
});

app.delete('/api/subscriptions/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM subscriptions WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// Installment Plans API
app.get('/api/installment-plans', requireAuth, (req, res) => {
  const stmt = db.prepare('SELECT * FROM installment_plans');
  const plans = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    plans.push({
      id: row.id,
      name: row.name,
      startDate: row.start_date,
      endDate: row.end_date,
      monthlyAmount: row.monthly_amount,
      totalAmount: row.total_amount ?? undefined,
      downPayment: row.down_payment ?? undefined,
      interestRate: row.interest_rate ?? undefined,
      paymentDay: row.payment_day ?? undefined,
      notes: row.notes ?? undefined,
      familyMemberId: row.family_member_id,
      householdId: row.household_id
    });
  }
  stmt.free();
  res.json(plans);
});

app.post('/api/installment-plans', requireAuth, (req, res) => {
  const {
    name,
    startDate,
    endDate,
    monthlyAmount,
    totalAmount,
    downPayment,
    interestRate,
    paymentDay,
    notes,
    familyMemberId,
    householdId
  } = req.body;

  db.run(
    `INSERT INTO installment_plans 
     (name, start_date, end_date, monthly_amount, total_amount, down_payment, interest_rate, payment_day, notes, family_member_id, household_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      name,
      startDate,
      endDate,
      monthlyAmount,
      totalAmount || null,
      downPayment || null,
      interestRate || null,
      paymentDay || null,
      notes || null,
      familyMemberId || null,
      householdId || null
    ]
  );
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({
    id,
    name,
    startDate,
    endDate,
    monthlyAmount,
    totalAmount,
    downPayment,
    interestRate,
    paymentDay,
    notes,
    familyMemberId,
    householdId
  });
});

app.delete('/api/installment-plans/:id', requireAuth, (req, res) => {
  db.run('DELETE FROM installment_plans WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/month-summary', requireAuth, (req, res) => {
  let stmt = db.prepare('SELECT * FROM fixed_costs');
  const costs = [];
  while (stmt.step()) {
    costs.push(stmt.getAsObject());
  }
  stmt.free();
  
  stmt = db.prepare('SELECT * FROM subscriptions');
  const subs = [];
  while (stmt.step()) {
    subs.push(stmt.getAsObject());
  }
  stmt.free();

  stmt = db.prepare('SELECT * FROM installment_plans');
  const installmentPlans = [];
  while (stmt.step()) {
    installmentPlans.push(stmt.getAsObject());
  }
  stmt.free();
  
  const transactions = [];
  
  costs.forEach(cost => {
    const monthly = cost.interval === 'monthly' ? cost.amount : cost.amount / 12;
    transactions.push({
      id: `cost-${cost.id}`,
      name: cost.name,
      category: cost.category,
      amount: monthly,
      date: new Date().toISOString(),
      paid: false,
      type: 'fixed',
      familyMemberId: cost.family_member_id
    });
  });
  
  subs.forEach(sub => {
    const monthly = sub.interval === 'monthly' ? sub.amount : sub.amount / 12;
    transactions.push({
      id: `sub-${sub.id}`,
      name: sub.name,
      category: sub.category,
      amount: monthly,
      date: new Date().toISOString(),
      paid: false,
      type: 'subscription',
      familyMemberId: sub.family_member_id
    });
  });
  
  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  res.json({
    totalExpenses,
    paid: 0,
    open: totalExpenses,
    remaining: totalExpenses,
    transactions
  });
});

// API für Sparziele
app.get('/api/savings-goals', requireAuth, (req, res) => {
  let stmt = db.prepare('SELECT * FROM savings_goals ORDER BY priority DESC, target_date ASC');
  const goals = [];
  while (stmt.step()) {
    goals.push(stmt.getAsObject());
  }
  stmt.free();
  res.json(goals);
});

// Debug route to check table schema
app.get('/api/debug/savings-goals-schema', (req, res) => {
  try {
    let stmt = db.prepare('PRAGMA table_info(savings_goals)');
    const columns = [];
    while (stmt.step()) {
      columns.push(stmt.getAsObject());
    }
    stmt.free();
    res.json({ columns });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/savings-goals', requireAuth, (req, res) => {
  console.log('Received savings goal data:', JSON.stringify(req.body, null, 2));
  
  const { name, description, targetAmount, targetDate, category, priority, monthlyContribution, householdId, familyMemberId } = req.body;
  
  // Validierung
  if (!name || !targetAmount || !targetDate || !category || !priority || monthlyContribution === undefined) {
    console.log('Validation failed:', { name, targetAmount, targetDate, category, priority, monthlyContribution });
    return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein' });
  }
  
  if (isNaN(parseFloat(targetAmount)) || isNaN(parseFloat(monthlyContribution))) {
    return res.status(400).json({ error: 'Betrag und monatlicher Beitrag müssen gültige Zahlen sein' });
  }
  
  try {
    // Versuche mit direktem SQL statt Parameter-Binding
    const sql = `
      INSERT INTO savings_goals (name, description, target_amount, current_amount, target_date, category, priority, status, monthly_contribution, household_id, family_member_id, created_at, updated_at)
      VALUES ('${name}', '${description || ''}', ${parseFloat(targetAmount)}, 0, '${targetDate}', '${category}', '${priority}', 'active', ${parseFloat(monthlyContribution)}, ${householdId || null}, ${familyMemberId || null}, datetime('now'), datetime('now'))
    `;
    
    console.log('Direct SQL:', sql);
    
    db.run(sql);
    
    console.log('Savings goal created successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ error: 'Datenbankfehler: ' + error.message });
  }
});

app.put('/api/savings-goals/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { name, description, targetAmount, currentAmount, targetDate, category, priority, status, monthlyContribution } = req.body;
  
  // Validierung
  if (!name || !targetAmount || !targetDate || !category || !priority || monthlyContribution === undefined) {
    return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt sein' });
  }
  
  if (isNaN(parseFloat(targetAmount)) || (currentAmount !== undefined && isNaN(parseFloat(currentAmount))) || isNaN(parseFloat(monthlyContribution))) {
    return res.status(400).json({ error: 'Alle Beträge müssen gültige Zahlen sein' });
  }
  
  try {
    const stmt = db.prepare(`
      UPDATE savings_goals 
      SET name = ?, description = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?, priority = ?, status = ?, monthly_contribution = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    stmt.run(name, description, parseFloat(targetAmount), parseFloat(currentAmount), targetDate, category, priority, status, parseFloat(monthlyContribution), id);
    stmt.free();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({ error: 'Datenbankfehler: ' + error.message });
  }
});

app.delete('/api/savings-goals/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  
  const stmt = db.prepare('DELETE FROM savings_goals WHERE id = ?');
  stmt.run(id);
  stmt.free();
  
  res.json({ success: true });
});

app.post('/api/savings-goals/:id/contribute', requireAuth, (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  
  const stmt = db.prepare(`
    UPDATE savings_goals 
    SET current_amount = current_amount + ?, updated_at = datetime('now')
    WHERE id = ?
  `);
  
  stmt.run(amount, id);
  stmt.free();
  
  res.json({ success: true });
});

// API für bezahlte Einträge
app.get('/api/paid-items', requireAuth, (req, res) => {
  let stmt = db.prepare('SELECT * FROM paid_items');
  const paidItems = [];
  while (stmt.step()) {
    paidItems.push(stmt.getAsObject());
  }
  stmt.free();
  res.json(paidItems);
});

app.post('/api/paid-items', requireAuth, (req, res) => {
  const { itemId, itemType, paid } = req.body;
  
  // Prüfe ob Eintrag bereits existiert
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM paid_items WHERE item_id = ?');
  checkStmt.bind([itemId]);
  checkStmt.step();
  const exists = checkStmt.getAsObject().count > 0;
  checkStmt.free();
  
  if (paid && !exists) {
    // Als bezahlt markieren
    db.run('INSERT INTO paid_items (item_id, item_type, paid_at) VALUES (?, ?, ?)', 
           [itemId, itemType, new Date().toISOString()]);
  } else if (!paid && exists) {
    // Als nicht bezahlt markieren
    db.run('DELETE FROM paid_items WHERE item_id = ?', [itemId]);
  }
  
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/export', requireAuth, (req, res) => {
  const format = req.query.format || 'json';
  
  let stmt = db.prepare('SELECT * FROM family_members');
  const members = [];
  while (stmt.step()) {
    members.push(stmt.getAsObject());
  }
  stmt.free();
  
  stmt = db.prepare('SELECT * FROM fixed_costs');
  const costs = [];
  while (stmt.step()) {
    costs.push(stmt.getAsObject());
  }
  stmt.free();
  
  stmt = db.prepare('SELECT * FROM subscriptions');
  const subs = [];
  while (stmt.step()) {
    subs.push(stmt.getAsObject());
  }
  stmt.free();
  
  const data = {
    familyMembers: members,
    fixedCosts: costs,
    subscriptions: subs,
    installmentPlans,
    exportDate: new Date().toISOString()
  };
  
  if (format === 'csv') {
    let csv = 'Type,Name,Category,Amount,Interval,PaymentDate,FamilyMember,StartDate,EndDate,MonthlyAmount,TotalAmount,DownPayment,InterestRate,Notes\n';
    
    costs.forEach(c => {
      const member = members.find(m => m.id === c.family_member_id);
      csv += `Fixed Cost,${c.name},${c.category},${c.amount},${c.interval},,${member ? member.name : 'Household'}\n`;
    });
    
    subs.forEach(s => {
      const member = members.find(m => m.id === s.family_member_id);
      csv += `Subscription,${s.name},${s.category},${s.amount},${s.interval},${s.payment_date},${member ? member.name : 'Household'},,,,,,,\n`;
    });

    installmentPlans.forEach(p => {
      const member = members.find(m => m.id === p.family_member_id);
      csv += `Installment Plan,${p.name},,${p.monthly_amount},Monthly,,${member ? member.name : 'Household'},${p.start_date},${p.end_date},${p.monthly_amount},${p.total_amount ?? ''},${p.down_payment ?? ''},${p.interest_rate ?? ''},${(p.notes || '').replace(/\n/g, ' ')}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=budget-export.csv');
    res.send(csv);
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=budget-export.json');
    res.json(data);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Budget Planner server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
