import type { RequestHandler } from 'express';
import db from '../db';

export const listReminders: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const reminders = await db.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createReminder: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const data = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!data.timeOfDay) {
      return res.status(400).json({ message: 'Missing timeOfDay' });
    }

    const habitId = data.habitId !== undefined ? Number(data.habitId) : null;
    const { timeOfDay, enabled, timezone, recurrence, days, nextRun } = data;

    const reminder = await db.reminder.create({
      data: {
        userId,
        habitId,
        timeOfDay,
        enabled: enabled || false,
        timezone: timezone || null,
        recurrence: recurrence || null,
        days: days ? JSON.stringify(days) : null,
        nextRun: nextRun ? new Date(nextRun) : null
      }
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateReminder: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const id = Number(req.params.id);
    const data = req.body;

    if (!userId || !id) {
      return res.status(400).json({ message: "User ID and Reminder ID are required" });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await db.reminder.findFirst({
      where: { id, userId }
    });

    if (!existingReminder) {
      return res.status(404).json({ message: 'Not found' });
    }

    const updateData: any = {};
    if (data.timeOfDay !== undefined) updateData.timeOfDay = data.timeOfDay;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;
    if (data.days !== undefined) updateData.days = data.days ? JSON.stringify(data.days) : null;
    if (data.nextRun !== undefined) updateData.nextRun = data.nextRun ? new Date(data.nextRun) : null;

    const updatedReminder = await db.reminder.update({
      where: { id },
      data: updateData
    });

    res.json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteReminder: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const id = Number(req.params.id);

    if (!userId || !id) {
      return res.status(400).json({ message: "User ID and Reminder ID are required" });
    }

    // Check if reminder exists and belongs to user
    const existingReminder = await db.reminder.findFirst({
      where: { id, userId }
    });

    if (!existingReminder) {
      return res.status(404).json({ message: 'Not found' });
    }

    await db.reminder.delete({
      where: { id }
    });

    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
