import type { RequestHandler } from "express";
import db from "../db";

export const getHabitsHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const habits = await db.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, description, category, color, icon, target, frequency, reminderTime, reminderEnabled } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    // Convert icon object to string if it's an object
    let iconString = icon;
    if (typeof icon === 'object' && icon !== null) {
      // Extract icon name from the icon object, or use a default
      iconString = icon.name || 'target';
    }

    const habit = await db.habit.create({
      data: {
        userId,
        name,
        description,
        category,
        color,
        icon: iconString,
        target: target || 1,
        frequency,
        reminderTime,
        reminderEnabled: reminderEnabled || false,
      }
    });

    res.json(habit);
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { habitId } = req.params;
    const updateData = req.body;

    // Convert icon object to string if it's an object
    if (updateData.icon && typeof updateData.icon === 'object' && updateData.icon !== null) {
      updateData.icon = updateData.icon.name || 'target';
    }

    // Filter only allowed fields for Habit model
    const allowedFields = [
      'name', 'description', 'category', 'color', 'icon', 'target',
      'frequency', 'monthlyDays', 'monthlyMonths', 'reminderTime',
      'reminderEnabled', 'completed', 'streak' 
    ];

    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Handle lastCompleted specially
    if (updateData.lastCompleted !== undefined) {
      filteredData.lastCompleted = updateData.lastCompleted ? new Date(updateData.lastCompleted) : null;
    }

    const habit = await db.habit.update({
      where: { id: habitId },
      data: filteredData
    });

    res.json(habit);
  } catch (error: any) {
    console.error("Error updating habit:", error);
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Habit not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const deleteHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { habitId } = req.params;

    await db.habit.delete({
      where: { id: habitId }
    });

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// New endpoint to mark habit as completed (creates a log entry)
export const completeHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { userId, habitId } = req.params;
    const { completedAmount = 0, completedBoolean = true, note } = req.body;

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

    const logDate = new Date();

    // Check if there's already a log for today
    const existingLog = await db.habitLog.findFirst({
      where: {
        habitId,
        userId,
        date: {
          gte: new Date(logDate.toISOString().split('T')[0]), // Start of today
          lt: new Date(Date.parse(logDate.toISOString().split('T')[0]) + 24 * 60 * 60 * 1000) // End of today
        }
      }
    });

    if (existingLog) {
      // Update existing log
      const updatedLog = await db.habitLog.update({
        where: { id: existingLog.id },
        data: {
          completedAmount,
          completedBoolean,
          note: note || null
        }
      });

      // Update habit stats
      await updateHabitStats(habitId);

      return res.json(updatedLog);
    } else {
      // Create new log
      const habitLog = await db.habitLog.create({
        data: {
          habitId,
          userId,
          date: logDate,
          completedAmount,
          completedBoolean,
          note: note || null
        }
      });

      // Update habit stats
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
    }
  } catch (error) {
    console.error("Error completing habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to calculate streak
async function calculateStreak(habitId: string, logDate: Date): Promise<number> {
  try {
    const recentLogs = await db.habitLog.findMany({
      where: { 
        habitId,
        completedBoolean: true,
        date: { lte: logDate }
      },
      orderBy: { date: 'desc' },
      take: 30
    });

    let streak = 0;
    const today = logDate.toISOString().split('T')[0];
    let checkDate = today;

    for (const log of recentLogs) {
      const logDateStr = log.date.toISOString().split('T')[0];
      
      if (logDateStr === checkDate) {
        streak++;
        checkDate = new Date(Date.parse(checkDate) - 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
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

// Helper function to update habit stats
async function updateHabitStats(habitId: string): Promise<void> {
  try {
    const completedCount = await db.habitLog.count({
      where: { habitId, completedBoolean: true }
    });

    const lastLog = await db.habitLog.findFirst({
      where: { habitId, completedBoolean: true },
      orderBy: { date: 'desc' }
    });

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
