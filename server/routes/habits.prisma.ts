import type { RequestHandler } from "express";
import db from "../db";

// Obtener hábitos de un usuario
export const getHabitsHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const habits = await db.habit.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    res.json(habits);
  } catch (error) {
    console.error("Error fetching habits:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Crear hábito nuevo
export const createHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      description,
      category,
      color,
      icon,
      target,
      frequency,
      reminderTime,
      reminderEnabled,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    // Convertir icon a string si es un objeto
    let iconString: string | undefined = icon;
    if (typeof icon === "object" && icon !== null) {
      iconString = icon.name || "target";
    }

    const habit = await db.habit.create({
      data: {
        name,
        description,
        category,
        color,
        icon: iconString,
        target: target || 1,
        frequency,
        reminderTime,
        reminderEnabled: reminderEnabled || false,
        user: {
          connect: { id: Number(userId) },
        },
      },
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar hábito
export const updateHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { habitId } = req.params;
    const updateData = req.body;

    if (!habitId) {
      return res.status(400).json({ message: "Habit ID is required" });
    }

    // Convertir icon a string si es un objeto
    if (updateData.icon && typeof updateData.icon === "object" && updateData.icon !== null) {
      updateData.icon = updateData.icon.name || "target";
    }

    // Filtrar solo campos permitidos
    const allowedFields = [
      "name",
      "description",
      "category",
      "color",
      "icon",
      "target",
      "frequency",
      "monthlyDays",
      "monthlyMonths",
      "reminderTime",
      "reminderEnabled",
      "completed",
      "streak",
      "lastCompleted",
    ];

    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] =
          field === "lastCompleted" && updateData[field]
            ? new Date(updateData[field])
            : updateData[field];
      }
    }

    const habit = await db.habit.update({
      where: { id: Number(habitId) },
      data: filteredData,
    });

    res.json(habit);
  } catch (error: any) {
    console.error("Error updating habit:", error);
    if (error.code === "P2025") {
      res.status(404).json({ message: "Habit not found" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Eliminar hábito
export const deleteHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { habitId } = req.params;

    if (!habitId) {
      return res.status(400).json({ message: "Habit ID is required" });
    }

    await db.habit.delete({
      where: { id: Number(habitId) },
    });

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Marcar hábito como completado
export const completeHabitHandler: RequestHandler = async (req, res) => {
  try {
    const { userId, habitId } = req.params;
    const { completedAmount = 0, completedBoolean = true, note } = req.body;

    if (!userId || !habitId) {
      return res.status(400).json({ message: "User ID and Habit ID are required" });
    }

    const habit = await db.habit.findFirst({
      where: { id: Number(habitId), userId: Number(userId) },
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const logDate = new Date();
    const startOfToday = new Date(logDate);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(logDate);
    endOfToday.setHours(23, 59, 59, 999);

    const existingLog = await db.habitLog.findFirst({
      where: {
        habitId: Number(habitId),
        userId: Number(userId),
        date: { gte: startOfToday, lte: endOfToday },
      },
    });

    if (existingLog) {
      const updatedLog = await db.habitLog.update({
        where: { id: existingLog.id },
        data: {
          completedAmount,
          completedBoolean,
          note: note || null,
        },
      });

      await updateHabitStats(Number(habitId));

      return res.json(updatedLog);
    }

    const habitLog = await db.habitLog.create({
      data: {
        habitId: Number(habitId),
        userId: Number(userId),
        date: logDate,
        completedAmount,
        completedBoolean,
        note: note || null,
      },
    });

    if (completedBoolean) {
      await db.habit.update({
        where: { id: Number(habitId) },
        data: {
          completed: { increment: 1 },
          lastCompleted: logDate,
          streak: await calculateStreak(Number(habitId), logDate),
        },
      });
    }

    res.status(201).json(habitLog);
  } catch (error) {
    console.error("Error completing habit:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper: calcular streak
async function calculateStreak(habitId: number, logDate: Date): Promise<number> {
  try {
    const recentLogs = await db.habitLog.findMany({
      where: { habitId, completedBoolean: true, date: { lte: logDate } },
      orderBy: { date: "desc" },
      take: 30,
    });

    let streak = 0;
    let checkDate = new Date(logDate);
    checkDate.setHours(0, 0, 0, 0);

    for (const log of recentLogs) {
      const logDateCopy = new Date(log.date);
      logDateCopy.setHours(0, 0, 0, 0);

      if (logDateCopy.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
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

// Helper: actualizar estadísticas del hábito
async function updateHabitStats(habitId: number): Promise<void> {
  try {
    const completedCount = await db.habitLog.count({
      where: { habitId, completedBoolean: true },
    });

    const lastLog = await db.habitLog.findFirst({
      where: { habitId, completedBoolean: true },
      orderBy: { date: "desc" },
    });

    const currentStreak = lastLog ? await calculateStreak(habitId, lastLog.date) : 0;

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
