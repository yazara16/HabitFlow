import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'server', 'data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, 'app.sqlite');

const db = new Database(DB_PATH);

// Initialize tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  photoUrl TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  color TEXT,
  icon TEXT,
  target INTEGER,
  completed INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  frequency TEXT,
  monthlyDays TEXT,
  monthlyMonths TEXT,
  reminderTime TEXT,
  reminderEnabled INTEGER DEFAULT 0,
  createdAt TEXT,
  lastCompleted TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT,
  title TEXT,
  message TEXT,
  time TEXT,
  read INTEGER DEFAULT 0,
  metadata TEXT,
  createdAt TEXT,
  FOREIGN KEY (userId) REFERENCES users(id)
);
`);

export default db;
