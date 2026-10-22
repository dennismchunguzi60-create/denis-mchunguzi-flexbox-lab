import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const app = express();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false } });
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'Denis Mchunguzi Flexbox Lab API' }));

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Please log in first.' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Session invalid or expired. Please log in again.' }); }
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Enter a name, valid email, and password with at least 8 characters.' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,plan', [name,email,hash]);
    res.status(201).json({ user: result.rows[0], token: jwt.sign({ id: result.rows[0].id, email }, process.env.JWT_SECRET, { expiresIn: '7d' }) });
  } catch (e) { if (e.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' }); console.error(e); res.status(500).json({ error: 'Could not create account.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const result = await pool.query('SELECT id,name,email,password_hash,plan FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    delete user.password_hash;
    res.json({ user, token });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not log in.' }); }
});

app.get('/api/projects', auth, async (req, res) => {
  try { const r = await pool.query('SELECT id,title,layout_json,created_at,updated_at FROM projects WHERE user_id=$1 ORDER BY updated_at DESC', [req.user.id]); res.json({ projects: r.rows }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not load projects.' }); }
});
app.post('/api/projects', auth, async (req, res) => {
  try {
    const title = String(req.body.title || 'My CSS layout').trim().slice(0,100);
    const layout = req.body.layout;
    if (!layout || typeof layout !== 'object' || Array.isArray(layout)) return res.status(400).json({ error: 'Layout must be a JSON object.' });
    const r = await pool.query('INSERT INTO projects(user_id,title,layout_json) VALUES($1,$2,$3) RETURNING id,title,layout_json,created_at,updated_at', [req.user.id,title,JSON.stringify(layout)]);
    res.status(201).json({ project: r.rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save project.' }); }
});
app.delete('/api/projects/:id', auth, async (req, res) => {
  try { const r = await pool.query('DELETE FROM projects WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]); if (!r.rowCount) return res.status(404).json({ error: 'Project not found.' }); res.json({ ok: true }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Could not delete project.' }); }
});
app.get('/api/account', auth, async (req, res) => {
  const r = await pool.query('SELECT id,name,email,plan,subscription_status FROM users WHERE id=$1', [req.user.id]);
  if (!r.rowCount) return res.status(404).json({ error: 'Account not found.' });
  res.json({ user: r.rows[0] });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Flexbox Lab API listening on ${port}`));
