import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listOverrides: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const date = req.query.date as string | undefined;
  let stmt = 'SELECT * FROM habit_overrides WHERE userId = ? AND habitId = ?';
  const params: any[] = [userId, habitId];
  if (date) { stmt += ' AND date = ?'; params.push(date); }
  const rows = await db.all(stmt, ...params);
  res.json(rows.map((r: any) => ({ ...r, hidden: !!r.hidden, patch: r.patch ? r.patch : null })));
};

export const createOverride: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const data = req.body || {};
  if (!data.date) return res.status(400).json({ message: 'Missing date' });
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run('INSERT INTO habit_overrides (id,habitId,userId,date,hidden,patch,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)', id, habitId, userId, data.date, data.hidden ? 1 : 0, data.patch ? JSON.stringify(data.patch) : null, now, now);
  const row = await db.get('SELECT * FROM habit_overrides WHERE id = ?', id);
  res.status(201).json({ ...row, hidden: !!row.hidden, patch: row.patch ? row.patch : null });
};

export const deleteOverride: RequestHandler = async (req, res) => {
  const { userId, habitId, overrideId } = req.params;
  const row = await db.get('SELECT * FROM habit_overrides WHERE id = ? AND habitId = ? AND userId = ?', overrideId, habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  await db.run('DELETE FROM habit_overrides WHERE id = ?', overrideId);
  res.status(204).send();
};
