import type { RequestHandler } from 'express';
import db from '../db'; 

export const listUsers: RequestHandler = async (_req, res) => {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      photoUrl: true,
      createdAt: true,
    },
  });
  res.json(users);
};

export const listHabits: RequestHandler = async (_req, res) => {
  const habits = await db.habit.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      category: true,
      target: true,
      completed: true,
      streak: true,
      frequency: true,
      createdAt: true,
      lastCompleted: true,
    },
  });
  res.json(habits);
};

export const dbStats: RequestHandler = async (_req, res) => {
  const userCount = await db.user.count();
  const habitCount = await db.habit.count();
  res.json({ users: userCount, habits: habitCount });
};
