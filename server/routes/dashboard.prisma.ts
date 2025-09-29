import type { RequestHandler } from "express";
import db from "../db";

export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user habits
    const habits = await db.habit.findMany({
      where: { userId }
    });

    // Get today's habit logs
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayLogs = await db.habitLog.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Calculate stats
    const totalHabits = habits.length;
    const completedToday = todayLogs.filter(log => log.completedBoolean).length;
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);

    const stats = {
      totalHabits,
      completedToday,
      totalStreak,
      completionRate: totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0,
      habits,
      recentLogs: todayLogs
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
