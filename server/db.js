import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '..', 'cards.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    source TEXT DEFAULT 'manual',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const SEED_CARDS = [
  'Make the boring version first.',
  'Remove the thesis; keep the gesture.',
  'What would survive if the audience vanished?',
  "Finish the sentence you've been avoiding.",
  'Use the constraint you were ignoring.',
  'Do it wrong, then wrong again, differently.',
  "Name the thing you're circling around.",
  'Cut the introduction.',
  'Work at the scale of one.',
  'Repeat until it means something else.',
];

const count = db.prepare('SELECT COUNT(*) as n FROM cards').get();
if (count.n === 0) {
  const insert = db.prepare('INSERT INTO cards (text, source) VALUES (?, ?)');
  for (const text of SEED_CARDS) {
    insert.run(text, 'seed');
  }
}

export function getRandomCard() {
  return db.prepare('SELECT * FROM cards ORDER BY RANDOM() LIMIT 1').get();
}

export function getCardCount() {
  return db.prepare('SELECT COUNT(*) as n FROM cards').get().n;
}

export function getAllCards() {
  return db.prepare('SELECT * FROM cards ORDER BY created_at DESC').all();
}

export function updateCard(id, text) {
  return db.prepare('UPDATE cards SET text = ? WHERE id = ?').run(text, id);
}

export function deleteCard(id) {
  return db.prepare('DELETE FROM cards WHERE id = ?').run(id);
}

export function insertCard(text, source = 'discord') {
  return db.prepare('INSERT INTO cards (text, source) VALUES (?, ?)').run(text, source);
}

export function getAdminByUsername(username) {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

export function getAdminCount() {
  return db.prepare('SELECT COUNT(*) as n FROM admins').get().n;
}

export function insertAdmin(username, passwordHash) {
  return db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
}
