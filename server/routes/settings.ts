import type { RequestHandler } from 'express';
import db from '../db';

export const getSettings: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const row = db.prepare('SELECT settings FROM user_settings WHERE userId = ?').get(userId);
  if (!row) return res.json({});
  try {
    const settings = JSON.parse(row.settings);
    return res.json(settings);
  } catch (e) {
    return res.json({});
  }
};

export const upsertSettings: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT userId FROM user_settings WHERE userId = ?').get(userId);
  const str = JSON.stringify(data);
  if (existing) {
    db.prepare('UPDATE user_settings SET settings = ?, updatedAt = ? WHERE userId = ?').run(str, now, userId);
  } else {
    db.prepare('INSERT INTO user_settings (userId,settings,updatedAt) VALUES (?,?,?)').run(userId, str, now);
  }
  res.json(data);
};
