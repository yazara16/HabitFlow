import type { RequestHandler } from 'express';
import db from '../db';

export const listUsers: RequestHandler = (_req, res) => {
  const rows = db.prepare('SELECT id,name,email,photoUrl,createdAt FROM users').all();
  res.json(rows);
};

export const listHabits: RequestHandler = (_req, res) => {
  const rows = db.prepare('SELECT id,userId,name,description,category,target,completed,streak,frequency,createdAt,lastCompleted FROM habits').all();
  res.json(rows);
};

export const dbStats: RequestHandler = (_req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const habitCount = db.prepare('SELECT COUNT(*) as c FROM habits').get().c;
  res.json({ users: userCount, habits: habitCount });
};
