import type { RequestHandler } from "express";
import db from "../db";

export const getAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user's achievements
    const userAchievements = await db.userAchievement.findMany({
      where: { userId },
      include: { achievements: true },
      orderBy: { createdAt: 'desc' }
    });

    // Get all available achievements (for showing locked ones)
    const allAchievements = await db.achievement.findMany({
      orderBy: { points: 'asc' }
    });

    res.json({
      userAchievements: userAchievements.map(ua => ({
        id: ua.id,
        earnedAt: ua.earnedAt,
        achievement: ua.achievements
      })),
      allAchievements
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unlockAchievement: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;
    
    if (!userId || !achievementId) {
      return res.status(400).json({ message: "User ID and Achievement ID are required" });
    }

    // Check if already unlocked
    const existing = await db.userAchievement.findFirst({
      where: { userId, achievementId }
    });

    if (existing) {
      return res.status(400).json({ message: "Achievement already unlocked" });
    }

    const achievement = await db.userAchievement.create({
      data: {
        userId,
        achievementId,
        earnedAt: new Date()
      },
      include: { achievements: true }
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user stats
    const userStats = await db.user.findUnique({
      where: { id: userId },
      include: {
        habits: true,
        habitLogs: true,
        userAchievements: true
      }
    });

    if (!userStats) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate achievements
    const unlockedAchievements = [];
    const stats = {
      totalHabits: userStats.habits.length,
      totalLogs: userStats.habitLogs.length,
      currentStreaks: userStats.habits.reduce((sum, h) => sum + (h.streak || 0), 0),
      longestStreak: Math.max(...userStats.habits.map(h => h.streak || 0), 0)
    };

    // Check for various achievements
    const achievements = [
      { id: 'first-habit', condition: () => stats.totalHabits >= 1 },
      { id: 'five-habits', condition: () => stats.totalHabits >= 5 },
      { id: 'ten-habits', condition: () => stats.totalHabits >= 10 },
      { id: 'streak-7', condition: () => stats.longestStreak >= 7 },
      { id: 'streak-30', condition: () => stats.longestStreak >= 30 },
      { id: 'streak-100', condition: () => stats.longestStreak >= 100 },
      { id: 'log-10', condition: () => stats.totalLogs >= 10 },
      { id: 'log-50', condition: () => stats.totalLogs >= 50 },
      { id: 'log-100', condition: () => stats.totalLogs >= 100 }
    ];

    // Check each achievement
    for (const ach of achievements) {
      if (ach.condition()) {
        await unlockAchievement.internal?.(userId, ach.id);
      }
    }

    res.json({ 
      stats,
      newAchievements: unlockedAchievements 
    });
  } catch (error) {
    console.error("Error checking achievements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
