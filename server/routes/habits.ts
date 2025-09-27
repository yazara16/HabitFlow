import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const getHabitsHandler: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT * FROM habits WHERE userId = ?').all(userId);
  const habits = rows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    description: r.description,
    category: r.category,
    color: r.color,
    icon: r.icon,
    target: r.target,
    completed: r.completed,
    streak: r.streak,
    frequency: r.frequency,
    monthlyDays: r.monthlyDays ? JSON.parse(r.monthlyDays) : [],
    monthlyMonths: r.monthlyMonths ? JSON.parse(r.monthlyMonths) : [],
    reminderTime: r.reminderTime,
    reminderEnabled: !!r.reminderEnabled,
    createdAt: r.createdAt,
    lastCompleted: r.lastCompleted,
  }));
  res.json(habits);
};

export const createHabitHandler: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.name) return res.status(400).json({ message: 'Missing name' });
  const id = uuidv4();
  const createdAt = data.createdAt || new Date().toISOString();
  const stmt = db.prepare(`INSERT INTO habits (id,userId,name,description,category,color,icon,target,completed,streak,frequency,monthlyDays,monthlyMonths,reminderTime,reminderEnabled,createdAt,lastCompleted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  stmt.run(
    id,
    userId,
    data.name,
    data.description || null,
    data.category || null,
    data.color || null,
    data.icon || null,
    data.target || 0,
    data.completed || 0,
    data.streak || 0,
    data.frequency || null,
    data.monthlyDays ? JSON.stringify(data.monthlyDays) : null,
    data.monthlyMonths ? JSON.stringify(data.monthlyMonths) : null,
    data.reminderTime || null,
    data.reminderEnabled ? 1 : 0,
    createdAt,
    data.lastCompleted || null,
  );
  const row = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
  const habit = {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    category: row.category,
    color: row.color,
    icon: row.icon,
    target: row.target,
    completed: row.completed,
    streak: row.streak,
    frequency: row.frequency,
    monthlyDays: row.monthlyDays ? JSON.parse(row.monthlyDays) : [],
    monthlyMonths: row.monthlyMonths ? JSON.parse(row.monthlyMonths) : [],
    reminderTime: row.reminderTime,
    reminderEnabled: !!row.reminderEnabled,
    createdAt: row.createdAt,
    lastCompleted: row.lastCompleted,
  };
  res.status(201).json(habit);
};

export const updateHabitHandler: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const habitId = req.params.habitId;
  const data = req.body || {};
  const row = db.prepare('SELECT * FROM habits WHERE id = ? AND userId = ?').get(habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });

  const updated = {
    name: data.name ?? row.name,
    description: data.description ?? row.description,
    category: data.category ?? row.category,
    color: data.color ?? row.color,
    icon: data.icon ?? row.icon,
    target: data.target ?? row.target,
    completed: data.completed ?? row.completed,
    streak: data.streak ?? row.streak,
    frequency: data.frequency ?? row.frequency,
    monthlyDays: typeof data.monthlyDays !== 'undefined' ? JSON.stringify(data.monthlyDays) : row.monthlyDays,
    monthlyMonths: typeof data.monthlyMonths !== 'undefined' ? JSON.stringify(data.monthlyMonths) : row.monthlyMonths,
    reminderTime: data.reminderTime ?? row.reminderTime,
    reminderEnabled: typeof data.reminderEnabled !== 'undefined' ? (data.reminderEnabled ? 1 : 0) : row.reminderEnabled,
    lastCompleted: typeof data.lastCompleted !== 'undefined' ? data.lastCompleted : row.lastCompleted,
  };

  db.prepare(`UPDATE habits SET name=?,description=?,category=?,color=?,icon=?,target=?,completed=?,streak=?,frequency=?,monthlyDays=?,monthlyMonths=?,reminderTime=?,reminderEnabled=?,lastCompleted=? WHERE id=? AND userId=?`).run(
    updated.name,
    updated.description,
    updated.category,
    updated.color,
    updated.icon,
    updated.target,
    updated.completed,
    updated.streak,
    updated.frequency,
    updated.monthlyDays,
    updated.monthlyMonths,
    updated.reminderTime,
    updated.reminderEnabled,
    updated.lastCompleted,
    habitId,
    userId,
  );

  const row2 = db.prepare('SELECT * FROM habits WHERE id = ?').get(habitId);
  const habit = {
    id: row2.id,
    userId: row2.userId,
    name: row2.name,
    description: row2.description,
    category: row2.category,
    color: row2.color,
    icon: row2.icon,
    target: row2.target,
    completed: row2.completed,
    streak: row2.streak,
    frequency: row2.frequency,
    monthlyDays: row2.monthlyDays ? JSON.parse(row2.monthlyDays) : [],
    monthlyMonths: row2.monthlyMonths ? JSON.parse(row2.monthlyMonths) : [],
    reminderTime: row2.reminderTime,
    reminderEnabled: !!row2.reminderEnabled,
    createdAt: row2.createdAt,
    lastCompleted: row2.lastCompleted,
  };
  res.json(habit);
};

export const deleteHabitHandler: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const habitId = req.params.habitId;
  const row = db.prepare('SELECT * FROM habits WHERE id = ? AND userId = ?').get(habitId, userId);
  if (!row) return res.status(404).json({ message: 'Not found' });
  db.prepare('DELETE FROM habits WHERE id = ? AND userId = ?').run(habitId, userId);
  res.status(204).send();
};
