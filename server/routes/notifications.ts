import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listNotifications: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT id,type,title,message,time,read,metadata,createdAt FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(userId);
  const items = rows.map((r: any) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    message: r.message,
    time: r.time,
    read: !!r.read,
    metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
    createdAt: r.createdAt,
  }));
  res.json(items);
};

export const createNotification: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.title) return res.status(400).json({ message: 'Missing title' });
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  db.prepare('INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, userId, data.type || 'system', data.title, data.message || null, data.time || createdAt, data.read ? 1 : 0, data.metadata ? JSON.stringify(data.metadata) : null, createdAt);
  const row = db.prepare('SELECT id,type,title,message,time,read,metadata,createdAt FROM notifications WHERE id = ?').get(id);
  res.status(201).json({
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    time: row.time,
    read: !!row.read,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: row.createdAt,
  });
};

export const markAsRead: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?').run(id, userId);
  const row = db.prepare('SELECT id,type,title,message,time,read,metadata,createdAt FROM notifications WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ message: 'Not found' });
  res.json({ ...row, read: !!row.read, metadata: row.metadata ? JSON.parse(row.metadata) : undefined });
};

export const markAllRead: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  db.prepare('UPDATE notifications SET read = 1 WHERE userId = ?').run(userId);
  res.status(204).send();
};

export const deleteNotification: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  db.prepare('DELETE FROM notifications WHERE id = ? AND userId = ?').run(id, userId);
  res.status(204).send();
};
