const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const cfg = {
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppass',
  database: process.env.DB_NAME || 'appdb',
};

let pool;

// The database may start slower than the API, so retry until it is ready.
async function init() {
  for (let i = 1; i <= 20; i++) {
    try {
      pool = mysql.createPool({ ...cfg, connectionLimit: 5 });
      await pool.query(
        'CREATE TABLE IF NOT EXISTS messages (' +
        'id INT AUTO_INCREMENT PRIMARY KEY, ' +
        'text VARCHAR(255) NOT NULL, ' +
        'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
      );
      console.log('Database ready');
      return;
    } catch (e) {
      console.log(`DB not ready (attempt ${i}): ${e.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error('Could not connect to the database');
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/messages', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, text, created_at FROM messages ORDER BY id DESC LIMIT 20'
  );
  res.json(rows);
});

app.post('/api/messages', async (req, res) => {
  const text = String(req.body.text || '').slice(0, 255);
  if (!text) return res.status(400).json({ error: 'text is required' });
  await pool.query('INSERT INTO messages (text) VALUES (?)', [text]);
  res.status(201).json({ ok: true });
});

init()
  .then(() => app.listen(3000, () => console.log('API listening on 3000')))
  .catch((e) => { console.error(e); process.exit(1); });
