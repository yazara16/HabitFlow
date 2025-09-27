import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listOverrides: RequestHandler = (req, res) => {
  const { userId, habitId } = req.params;
  const date = req.query.date as string | undefined;
  let stmt = 'SELECT * FROM habit_overrides WHERE userId = ? AND habitId = ?';
  const params: any[] = [userId, habitId];
  if (date) { stmt += ' AND date = ?'; params.push(date); }
  const rows = db.prepare(stmt).all(...params);
  res.json(rows.map((r: any) => ({ ...r, hidden: !!r.hidden, patch: r.patch ? JSON.parse(r.patch) : null })));
};

export const createOverride: RequestHandler = (req, res) => {
  const { userId, habitId } = req.params;
  const data = req.body || {};
  if (!data.date) return res.status(400).json({ message: 'Missing date' });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO habit_overrides (id,habitId,userId,date,hidden,patch,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, habitId, userId, data.date, data.hidden ? 1 : 0, data.patch ? JSON.stringify(data.patch) : null, now, now);
  const row = db.prepare('SELECT * FROM habit_overrides WHERE id = ?').get(id);
  res.status(201).json({ ...row, hidden: !!row.hidden, patch: row.patch ? JSON.parse(row.patch) : null });
};

export const deleteOverride: RequestHandler = (req, res) => {
  const { userId, habitId, overrideId } = req.params;
  const row = db.prepare('SELECT * FROM habit_overrides WHERE id = ? AND habitId = ? AND userId = ?').get(overrideId, habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM habit_overrides WHERE id = ?').run(overrideId);
  res.status(204).send();
};
