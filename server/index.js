import express from 'express';
import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let db;

const dbPath = 'budget.db';

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS fixed_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      interval TEXT NOT NULL,
      family_member_id INTEGER,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      interval TEXT NOT NULL,
      payment_date INTEGER NOT NULL,
      family_member_id INTEGER,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id)
    );
  `);
  
  saveDatabase();
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/api/family-members', (req, res) => {
  const stmt = db.prepare('SELECT * FROM family_members');
  const members = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    members.push(row);
  }
  stmt.free();
  res.json(members);
});

app.post('/api/family-members', (req, res) => {
  const { name, role } = req.body;
  db.run('INSERT INTO family_members (name, role) VALUES (?, ?)', [name, role || null]);
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, role });
});

app.delete('/api/family-members/:id', (req, res) => {
  db.run('DELETE FROM family_members WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/fixed-costs', (req, res) => {
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
      familyMemberId: row.family_member_id
    });
  }
  stmt.free();
  res.json(costs);
});

app.post('/api/fixed-costs', (req, res) => {
  const { name, category, amount, interval, familyMemberId } = req.body;
  db.run(
    'INSERT INTO fixed_costs (name, category, amount, interval, family_member_id) VALUES (?, ?, ?, ?, ?)',
    [name, category, amount, interval, familyMemberId || null]
  );
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, category, amount, interval, familyMemberId });
});

app.delete('/api/fixed-costs/:id', (req, res) => {
  db.run('DELETE FROM fixed_costs WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/subscriptions', (req, res) => {
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
      familyMemberId: row.family_member_id
    });
  }
  stmt.free();
  res.json(subs);
});

app.post('/api/subscriptions', (req, res) => {
  const { name, category, amount, interval, paymentDate, familyMemberId } = req.body;
  db.run(
    'INSERT INTO subscriptions (name, category, amount, interval, payment_date, family_member_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, amount, interval, paymentDate, familyMemberId || null]
  );
  const stmt = db.prepare('SELECT last_insert_rowid() as id');
  stmt.step();
  const id = stmt.getAsObject().id;
  stmt.free();
  saveDatabase();
  res.json({ id, name, category, amount, interval, paymentDate, familyMemberId });
});

app.delete('/api/subscriptions/:id', (req, res) => {
  db.run('DELETE FROM subscriptions WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

app.get('/api/month-summary', (req, res) => {
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

app.get('/api/export', (req, res) => {
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
    exportDate: new Date().toISOString()
  };
  
  if (format === 'csv') {
    let csv = 'Type,Name,Category,Amount,Interval,PaymentDate,FamilyMember\n';
    
    costs.forEach(c => {
      const member = members.find(m => m.id === c.family_member_id);
      csv += `Fixed Cost,${c.name},${c.category},${c.amount},${c.interval},,${member ? member.name : 'Household'}\n`;
    });
    
    subs.forEach(s => {
      const member = members.find(m => m.id === s.family_member_id);
      csv += `Subscription,${s.name},${s.category},${s.amount},${s.interval},${s.payment_date},${member ? member.name : 'Household'}\n`;
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
