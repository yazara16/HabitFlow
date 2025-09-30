import type { RequestHandler } from "express";
import db from "../db";

export const createHabitLog: RequestHandler = async (req, res) => {
  try {
    // Convertir params a números
    const userId = Number(req.params.userId);
    const habitId = Number(req.params.habitId);

    const { date, completedAmount, completedBoolean, note } = req.body;

    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    const habit = await db.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logDate = date ? new Date(date) : new Date();

    const habitLog = await db.habitLog.create({
      data: {
        habitId,
        userId,
        date: logDate,
        completedAmount: completedAmount || 0,
        completedBoolean: completedBoolean || false,
        note: note || null,
      },
    });

    if (completedBoolean) {
      await db.habit.update({
        where: { id: habitId },
        data: {
          completed: { increment: 1 },
          lastCompleted: logDate,
          streak: await calculateStreak(habitId, logDate),
        },
      });
    }

    res.status(201).json(habitLog);
  } catch (error) {
    console.error("Error creating habit log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHabitLog: RequestHandler = async (req, res) => {
  try {
    const logId = Number(req.params.logId);
    const habitId = Number(req.params.habitId);
    const userId = Number(req.params.userId);
    const updateData = req.body;

    const existingLog = await db.habitLog.findFirst({
      where: { id: logId, habitId, userId },
    });

    if (!existingLog) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    const updatedLog = await db.habitLog.update({
      where: { id: logId },
      data: {
        completedAmount: updateData.completedAmount,
        completedBoolean: updateData.completedBoolean,
        note: updateData.note,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    if (
      updateData.completedBoolean !== undefined &&
      updateData.completedBoolean !== existingLog.completedBoolean
    ) {
      await updateHabitStats(habitId);
    }

    res.json(updatedLog);
  } catch (error) {
    console.error("Error updating habit log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteHabitLog: RequestHandler = async (req, res) => {
  try {
    const logId = Number(req.params.logId);
    const habitId = Number(req.params.habitId);
    const userId = Number(req.params.userId);

    const existingLog = await db.habitLog.findFirst({
      where: { id: logId, habitId, userId },
    });

    if (!existingLog) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    await db.habitLog.delete({ where: { id: logId } });
    await updateHabitStats(habitId);

    res.json({ message: "Habit log deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHabitLogs: RequestHandler = async (req, res) => {
  try {
    const habitId = Number(req.params.habitId);
    const userId = Number(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    const logs = await db.habitLog.findMany({
      where: { userId, habitId },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await db.habitLog.count({ where: { userId, habitId } });

    res.json({ logs, total, hasMore: offset + logs.length < total });
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions
async function calculateStreak(habitId: number, logDate: Date): Promise<number> {
  try {
    const recentLogs = await db.habitLog.findMany({
      where: { habitId, completedBoolean: true, date: { lte: logDate } },
      orderBy: { date: "desc" },
      take: 30,
    });

    let streak = 0;
    let checkDate = logDate.toISOString().split("T")[0];

    for (const log of recentLogs) {
      const logDateStr = log.date.toISOString().split("T")[0];

      if (logDateStr === checkDate) {
        streak++;
        checkDate = new Date(Date.parse(checkDate) - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}

async function updateHabitStats(habitId: number): Promise<void> {
  try {
    const completedCount = await db.habitLog.count({
      where: { habitId, completedBoolean: true },
    });

    const lastLog = await db.habitLog.findFirst({
      where: { habitId, completedBoolean: true },
      orderBy: { date: "desc" },
    });

    const currentStreak = lastLog
      ? await calculateStreak(habitId, lastLog.date)
      : 0;

    await db.habit.update({
      where: { id: habitId },
      data: {
        completed: completedCount,
        streak: currentStreak,
        lastCompleted: lastLog?.date || null,
      },
    });
  } catch (error) {
    console.error("Error updating habit stats:", error);
  }
}
