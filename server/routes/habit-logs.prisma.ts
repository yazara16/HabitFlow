import type { RequestHandler } from "express";
import db from "../db";

export const createHabitLog: RequestHandler = async (req, res) => {
  try {
    const { userId, habitId } = req.params;
    const { date, completedAmount, completedBoolean, note } = req.body;

    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    // Verify the habit exists and belongs to the user
    const habit = await db.habit.findFirst({
      where: { id: habitId, userId }
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logDate = date ? new Date(date) : new Date();

    // Create the habit log
    const habitLog = await db.habitLog.create({
      data: {
        habitId,
        userId,
        date: logDate,
        completedAmount: completedAmount || 0,
        completedBoolean: completedBoolean || false,
        note: note || null
      }
    });

    // Update habit completion count and streak if completed
    if (completedBoolean) {
      await db.habit.update({
        where: { id: habitId },
        data: {
          completed: { increment: 1 },
          lastCompleted: logDate,
          streak: await calculateStreak(habitId, logDate)
        }
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
    const { userId, habitId, logId } = req.params;
    const updateData = req.body;

    // Verify the log exists and belongs to the user
    const existingLog = await db.habitLog.findFirst({
      where: { id: logId, userId, habitId }
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
        date: updateData.date ? new Date(updateData.date) : undefined
      }
    });

    // Recalculate habit stats if completion status changed
    if (updateData.completedBoolean !== undefined && updateData.completedBoolean !== existingLog.completedBoolean) {
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
    const { userId, habitId, logId } = req.params;

    // Verify the log exists and belongs to the user
    const existingLog = await db.habitLog.findFirst({
      where: { id: logId, userId, habitId }
    });

    if (!existingLog) {
      return res.status(404).json({ message: "Habit log not found" });
    }

    await db.habitLog.delete({
      where: { id: logId }
    });

    // Recalculate habit stats
    await updateHabitStats(habitId);

    res.json({ message: "Habit log deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit log:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getHabitLogs: RequestHandler = async (req, res) => {
  try {
    const { userId, habitId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    const logs = await db.habitLog.findMany({
      where: { userId, habitId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await db.habitLog.count({
      where: { userId, habitId }
    });

    res.json({ logs, total, hasMore: offset + logs.length < total });
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper functions
async function calculateStreak(habitId: string, logDate: Date): Promise<number> {
  try {
    // Get recent logs ordered by date descending
    const recentLogs = await db.habitLog.findMany({
      where: { 
        habitId,
        completedBoolean: true,
        date: { lte: logDate }
      },
      orderBy: { date: 'desc' },
      take: 30 // Check last 30 days max
    });

    let streak = 0;
    const today = logDate.toISOString().split('T')[0];
    let checkDate = today;

    for (const log of recentLogs) {
      const logDateStr = log.date.toISOString().split('T')[0];
      
      if (logDateStr === checkDate) {
        streak++;
        // Move to previous day
        checkDate = new Date(Date.parse(checkDate) - 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
      } else {
        // Gap found, streak broken
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
}

async function updateHabitStats(habitId: string): Promise<void> {
  try {
    // Count total completed logs
    const completedCount = await db.habitLog.count({
      where: { habitId, completedBoolean: true }
    });

    // Get the last completed date
    const lastLog = await db.habitLog.findFirst({
      where: { habitId, completedBoolean: true },
      orderBy: { date: 'desc' }
    });

    // Calculate current streak
    const currentStreak = lastLog ? await calculateStreak(habitId, lastLog.date) : 0;

    await db.habit.update({
      where: { id: habitId },
      data: {
        completed: completedCount,
        streak: currentStreak,
        lastCompleted: lastLog?.date || null
      }
    });
  } catch (error) {
    console.error("Error updating habit stats:", error);
  }
}
