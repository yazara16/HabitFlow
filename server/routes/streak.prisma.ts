import type { RequestHandler } from "express";
import db from "../db";

export const getStreaks: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user habits with streaks
    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        habitLogs: {
          orderBy: { date: 'desc' },
          take: 90 // Last 90 days for streak calculation
        }
      }
    });

    // Calculate streaks for each habit
    const streaks = habits.map(habit => {
      const logs = habit.habitLogs
        .filter(log => log.completedBoolean)
        .map(log => log.date.toISOString().split('T')[0])
        .sort();

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (logs.length > 0) {
        // Calculate longest streak
        let consecutiveDays = 1;
        for (let i = 1; i < logs.length; i++) {
          const prev = new Date(logs[i - 1]);
          const curr = new Date(logs[i]);
          const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            consecutiveDays++;
            longestStreak = Math.max(longestStreak, consecutiveDays);
          } else {
            consecutiveDays = 1;
          }
        }

        // Calculate current streak
        let checkDate = today;
        tempStreak = logs.includes(checkDate) ? 1 : 0;
        
        while (tempStreak > 0 && checkDate >= logs[0]) {
          checkDate = new Date(Date.parse(checkDate) - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          tempStreak += logs.includes(checkDate) ? 1 : 0;
          
          if (!logs.includes(checkDate)) break;
        }
        
        currentStreak = tempStreak;
      }

      return {
        habitId: habit.id,
        habitName: habit.name,
        habitColor: habit.color,
        currentStreak,
        longestStreak,
        weeklyStreak: Math.floor(currentStreak / 7),
        monthlyStreak: Math.floor(currentStreak / 30),
        lastActivity: logs.length > 0 ? logs[0] : null
      };
    });

    // Overall stats
    const totalHabits = habits.length;
    const activeStreaks = streaks.filter(s => s.currentStreak > 0).length;
    const longestOverallStreak = Math.max(...streaks.map(s => s.longestStreak), 0);
    const totalCurrentStreak = streaks.reduce((sum, s) => sum + s.currentStreak, 0);

    res.json({
      streaks,
      stats: {
        totalHabits,
        activeStreaks,
        longestOverallStreak,
        totalCurrentStreak,
        averageStreak: totalHabits > 0 ? totalCurrentStreak / totalHabits : 0
      }
    });
  } catch (error) {
    console.error("Error fetching streaks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStreak: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { habitId, completed } = req.body;
    
    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    // Update or create streak record
    const streak = await db.streakRecord.upsert({
      where: org.habit.getUniqueName(),
      update: {},
      create: {}
    });

    // Implementation for updating streak records
    res.json({ message: "Streak updated successfully" });
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
