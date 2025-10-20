import type { RequestHandler } from 'express';
import db from '../db';

export const listUsers: RequestHandler = async (_req, res) => {
  const rows = await db.all('SELECT id,name,email,photoUrl,createdAt FROM users');
  res.json(rows);
};

export const listHabits: RequestHandler = async (_req, res) => {
  const rows = await db.all('SELECT id,userId,name,description,category,target,completed,streak,frequency,createdAt,lastCompleted FROM habits');
  res.json(rows);
};

export const dbStats: RequestHandler = async (_req, res) => {
  const userCount = (await db.get('SELECT COUNT(*) as c FROM users'))?.c ?? 0;
  const habitCount = (await db.get('SELECT COUNT(*) as c FROM habits'))?.c ?? 0;
  res.json({ users: userCount, habits: habitCount });
};
