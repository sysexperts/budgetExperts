import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = new Database('budget.db');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

db.exec(`
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

app.get('/api/family-members', (req, res) => {
  const members = db.prepare('SELECT * FROM family_members').all();
  res.json(members);
});

app.post('/api/family-members', (req, res) => {
  const { name, role } = req.body;
  const result = db.prepare('INSERT INTO family_members (name, role) VALUES (?, ?)').run(name, role || null);
  res.json({ id: result.lastInsertRowid, name, role });
});

app.delete('/api/family-members/:id', (req, res) => {
  db.prepare('DELETE FROM family_members WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/fixed-costs', (req, res) => {
  const costs = db.prepare('SELECT * FROM fixed_costs').all();
  res.json(costs.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    amount: c.amount,
    interval: c.interval,
    familyMemberId: c.family_member_id
  })));
});

app.post('/api/fixed-costs', (req, res) => {
  const { name, category, amount, interval, familyMemberId } = req.body;
  const result = db.prepare(
    'INSERT INTO fixed_costs (name, category, amount, interval, family_member_id) VALUES (?, ?, ?, ?, ?)'
  ).run(name, category, amount, interval, familyMemberId || null);
  res.json({ id: result.lastInsertRowid, name, category, amount, interval, familyMemberId });
});

app.delete('/api/fixed-costs/:id', (req, res) => {
  db.prepare('DELETE FROM fixed_costs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/subscriptions', (req, res) => {
  const subs = db.prepare('SELECT * FROM subscriptions').all();
  res.json(subs.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category,
    amount: s.amount,
    interval: s.interval,
    paymentDate: s.payment_date,
    familyMemberId: s.family_member_id
  })));
});

app.post('/api/subscriptions', (req, res) => {
  const { name, category, amount, interval, paymentDate, familyMemberId } = req.body;
  const result = db.prepare(
    'INSERT INTO subscriptions (name, category, amount, interval, payment_date, family_member_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, category, amount, interval, paymentDate, familyMemberId || null);
  res.json({ id: result.lastInsertRowid, name, category, amount, interval, paymentDate, familyMemberId });
});

app.delete('/api/subscriptions/:id', (req, res) => {
  db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/month-summary', (req, res) => {
  const costs = db.prepare('SELECT * FROM fixed_costs').all();
  const subs = db.prepare('SELECT * FROM subscriptions').all();
  
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
  
  const members = db.prepare('SELECT * FROM family_members').all();
  const costs = db.prepare('SELECT * FROM fixed_costs').all();
  const subs = db.prepare('SELECT * FROM subscriptions').all();
  
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
app.listen(PORT, () => {
  console.log(`Budget Planner server running on port ${PORT}`);
});
