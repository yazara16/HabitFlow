import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

export const listOverrides: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const habitId = Number(req.params.habitId);
    const date = req.query.date as string | undefined;

    if (!userId || !habitId) return res.status(400).json({ message: 'User ID and Habit ID are required' });

    const where: any = { userId, habitId };
    if (date) where.date = date;

    const rows = await db.habitOverride.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    res.json(rows.map(r => ({
      ...r,
      hidden: !!r.hidden,
      patch: r.patch ? JSON.parse(r.patch) : null
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOverride: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const habitId = Number(req.params.habitId);
    const data = req.body || {};
    if (!data.date) return res.status(400).json({ message: 'Missing date' });

    const now = new Date();
    const override = await db.habitOverride.create({
      data: {
        id: uuidv4(),
        userId,
        habitId,
        date: data.date,
        hidden: data.hidden ? true : false,
        patch: data.patch ? JSON.stringify(data.patch) : null,
        createdAt: now,
        updatedAt: now
      }
    });

    res.status(201).json({
      ...override,
      hidden: !!override.hidden,
      patch: override.patch ? JSON.parse(override.patch) : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteOverride: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const habitId = Number(req.params.habitId);
    const overrideId = Number(req.params.overrideId);

    const row = await db.habitOverride.findFirst({
      where: { id: overrideId, userId, habitId }
    });

    if (!row) return res.status(404).json({ message: 'Not found' });

    await db.habitOverride.delete({ where: { id: overrideId } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
