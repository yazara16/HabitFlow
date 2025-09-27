import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listLogs: RequestHandler = (req, res) => {
  const { userId, habitId } = req.params;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  let stmt = 'SELECT * FROM habit_logs WHERE userId = ? AND habitId = ?';
  const params: any[] = [userId, habitId];
  if (from) { stmt += ' AND date >= ?'; params.push(from); }
  if (to) { stmt += ' AND date <= ?'; params.push(to); }
  stmt += ' ORDER BY date DESC';
  const rows = db.prepare(stmt).all(...params);
  res.json(rows.map((r: any) => ({
    ...r,
    completedBoolean: !!r.completedBoolean,
  })));
};

export const createLog: RequestHandler = (req, res) => {
  const { userId, habitId } = req.params;
  const data = req.body || {};
  if (!data.date) return res.status(400).json({ message: 'Missing date' });
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO habit_logs (id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, habitId, userId, data.date, data.completedAmount || 0, data.completedBoolean ? 1 : 0, data.note || null, now, now);
  const row = db.prepare('SELECT * FROM habit_logs WHERE id = ?').get(id);
  res.status(201).json({ ...row, completedBoolean: !!row.completedBoolean });
};

export const updateLog: RequestHandler = (req, res) => {
  const { userId, habitId, logId } = req.params;
  const data = req.body || {};
  const row = db.prepare('SELECT * FROM habit_logs WHERE id = ? AND habitId = ? AND userId = ?').get(logId, habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  const updatedAt = new Date().toISOString();
  const completedAmount = typeof data.completedAmount !== 'undefined' ? data.completedAmount : row.completedAmount;
  const completedBoolean = typeof data.completedBoolean !== 'undefined' ? (data.completedBoolean ? 1 : 0) : row.completedBoolean;
  const note = typeof data.note !== 'undefined' ? data.note : row.note;
  db.prepare('UPDATE habit_logs SET completedAmount = ?, completedBoolean = ?, note = ?, updatedAt = ? WHERE id = ?').run(completedAmount, completedBoolean, note, updatedAt, logId);
  const row2 = db.prepare('SELECT * FROM habit_logs WHERE id = ?').get(logId);
  res.json({ ...row2, completedBoolean: !!row2.completedBoolean });
};

export const deleteLog: RequestHandler = (req, res) => {
  const { userId, habitId, logId } = req.params;
  const row = db.prepare('SELECT * FROM habit_logs WHERE id = ? AND habitId = ? AND userId = ?').get(logId, habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM habit_logs WHERE id = ?').run(logId);
  res.status(204).send();
};
