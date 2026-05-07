import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  getRandomCard,
  getCardCount,
  getAllCards,
  updateCard,
  deleteCard,
  getAdminByUsername,
} from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    req.admin = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/cards/random', (req, res) => {
  const card = getRandomCard();
  const total = getCardCount();
  res.json({ card: card || null, total });
});

router.get('/cards', requireAdmin, (req, res) => {
  res.json(getAllCards());
});

router.put('/cards/:id', requireAdmin, (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  updateCard(parseInt(req.params.id, 10), text.trim());
  res.json({ ok: true });
});

router.delete('/cards/:id', requireAdmin, (req, res) => {
  deleteCard(parseInt(req.params.id, 10));
  res.json({ ok: true });
});

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const admin = getAdminByUsername(username);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

router.get('/auth/verify', requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.username });
});

export default router;
