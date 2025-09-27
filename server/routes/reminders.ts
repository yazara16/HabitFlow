import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listReminders: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT * FROM reminders WHERE userId = ?').all(userId);
  res.json(rows.map((r: any) => ({ ...r, enabled: !!r.enabled, days: r.days ? JSON.parse(r.days) : [] })));
};

export const createReminder: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.timeOfDay) return res.status(400).json({ message: 'Missing timeOfDay' });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO reminders (id,userId,habitId,timeOfDay,enabled,timezone,recurrence,days,nextRun,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .run(id, userId, data.habitId || null, data.timeOfDay, data.enabled ? 1 : 0, data.timezone || null, data.recurrence || null, data.days ? JSON.stringify(data.days) : null, data.nextRun || null, now);
  const row = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
  res.status(201).json({ ...row, enabled: !!row.enabled, days: row.days ? JSON.parse(row.days) : [] });
};

export const updateReminder: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const data = req.body || {};
  const row = db.prepare('SELECT * FROM reminders WHERE id = ? AND userId = ?').get(id, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('UPDATE reminders SET timeOfDay = COALESCE(?, timeOfDay), enabled = COALESCE(?, enabled), timezone = COALESCE(?, timezone), recurrence = COALESCE(?, recurrence), days = COALESCE(?, days), nextRun = COALESCE(?, nextRun) WHERE id = ? AND userId = ?')
    .run(data.timeOfDay || null, typeof data.enabled !== 'undefined' ? (data.enabled ? 1 : 0) : null, data.timezone || null, data.recurrence || null, data.days ? JSON.stringify(data.days) : null, data.nextRun || null, id, userId);
  const row2 = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
  res.json({ ...row2, enabled: !!row2.enabled, days: row2.days ? JSON.parse(row2.days) : [] });
};

export const deleteReminder: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM reminders WHERE id = ? AND userId = ?').get(id, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
  res.status(204).send();
};
