import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const registerDevice: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.pushToken) return res.status(400).json({ message: 'Missing pushToken' });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO devices (id,userId,platform,pushToken,lastSeenAt,createdAt) VALUES (?,?,?,?,?,?)').run(id, userId, data.platform || null, data.pushToken, now, now);
  const row = db.prepare('SELECT * FROM devices WHERE id = ?').get(id);
  res.status(201).json(row);
};

export const unregisterDevice: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM devices WHERE id = ? AND userId = ?').get(id, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM devices WHERE id = ?').run(id);
  res.status(204).send();
};

export const listDevices: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT id,platform,pushToken,lastSeenAt,createdAt FROM devices WHERE userId = ?').all(userId);
  res.json(rows);
};
