import type { RequestHandler } from 'express';
import db from '../db';

export const getSettings: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const row = await db.get('SELECT settings FROM user_settings WHERE userId = ?', userId);
  if (!row) return res.json({});
  try {
    const settings = row.settings;
    return res.json(settings);
  } catch (e) {
    return res.json({});
  }
};

export const upsertSettings: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  const now = new Date().toISOString();
  const existing = await db.get('SELECT userId FROM user_settings WHERE userId = ?', userId);
  const str = JSON.stringify(data);
  if (existing) {
    await db.run('UPDATE user_settings SET settings = ?, updatedAt = ? WHERE userId = ?', str, now, userId);
  } else {
    await db.run('INSERT INTO user_settings (userId,settings,updatedAt) VALUES (?,?,?)', userId, str, now);
  }
  res.json(data);
};
