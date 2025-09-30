import type { RequestHandler } from "express";
import db from "../db";

/**
 * Obtener todos los logros y cuáles ha desbloqueado un usuario.
 */
export const getAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Todos los logros
    const allAchievements = await db.achievement.findMany({
      orderBy: { id: "asc" } // ✅ usamos id porque no existe "points"
    });

    // Los logros obtenidos por el usuario
    const userAchievements = await db.userAchievement.findMany({
      where: { userId: Number(userId) },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" }
    });

    // Formato combinado (Obtenido/Bloqueado)
    const formatted = allAchievements.map((ach) => {
      const obtained = userAchievements.find(
        (ua) => ua.achievementId === ach.id
      );
      return {
        id: ach.id,
        key: ach.key,
        title: ach.title,
        description: ach.description,
        obtained: !!obtained,
        earnedAt: obtained?.earnedAt ?? null
      };
    });

    res.json({ achievements: formatted });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Desbloquear manualmente un logro.
 */
export const unlockAchievement: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { achievementId } = req.body;

    if (!userId || !achievementId) {
      return res
        .status(400)
        .json({ message: "User ID and Achievement ID are required" });
    }

    // Revisar si ya está desbloqueado
    const existing = await db.userAchievement.findFirst({
      where: {
        userId: Number(userId),
        achievementId: Number(achievementId)
      }
    });

    if (existing) {
      return res.status(400).json({ message: "Achievement already unlocked" });
    }

    // Crear el logro desbloqueado
    const achievement = await db.userAchievement.create({
      data: {
        userId: Number(userId),
        achievementId: Number(achievementId),
        earnedAt: new Date()
      },
      include: { achievement: true }
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Verifica condiciones y desbloquea logros automáticamente.
 */
export const checkAchievements: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Stats del usuario
    const userStats = await db.user.findUnique({
      where: { id: Number(userId) },
      include: {
        habits: true,
        habitLogs: true,
        userAchievements: true
      }
    });

    if (!userStats) {
      return res.status(404).json({ message: "User not found" });
    }

    const unlockedAchievements: any[] = [];

    const stats = {
      totalHabits: userStats.habits?.length || 0,
      totalLogs: userStats.habitLogs?.length || 0,
      currentStreaks:
        userStats.habits?.reduce((sum, h) => sum + (h.streak || 0), 0) || 0,
      longestStreak: Math.max(...userStats.habits?.map((h) => h.streak || 0), 0)
    };

    // Define condiciones básicas (puedes expandirlas con más logros)
    const achievements = [
      { id: 1, condition: () => stats.totalHabits >= 1 }, // Crea un hábito
      { id: 2, condition: () => stats.totalHabits >= 5 },
      { id: 3, condition: () => stats.totalHabits >= 10 },
      { id: 4, condition: () => stats.longestStreak >= 7 },
      { id: 5, condition: () => stats.longestStreak >= 14 }
    ];

    // Revisa y desbloquea
    for (const ach of achievements) {
      if (ach.condition()) {
        const exists = await db.userAchievement.findFirst({
          where: { userId: Number(userId), achievementId: ach.id }
        });

        if (!exists) {
          const newAch = await db.userAchievement.create({
            data: {
              userId: Number(userId),
              achievementId: ach.id,
              earnedAt: new Date()
            },
            include: { achievement: true }
          });
          unlockedAchievements.push(newAch);
        }
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
