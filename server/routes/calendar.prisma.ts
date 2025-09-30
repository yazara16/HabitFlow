import type { RequestHandler } from "express";
import db from "../db";

export const getCalendarData: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Asegúrate de que el modelo Habit tiene habitLogs o ajusta el nombre
    const habits = await db.habit.findMany({
      where: { userId: userIdNum },
      include: {
        habitLogs: {
          orderBy: { date: "desc" },
          take: 10
        }
      }
    });

    const calendarData = {
      habits: habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        logs: habit.habitLogs.map(log => ({
          date: log.date.toISOString().split("T")[0],
          completed: log.completedBoolean,
          amount: log.completedAmount
        }))
      })),
      stats: {
        totalHabits: habits.length,
        activeHabits: habits.filter(h => h.streak && h.streak > 0).length
      }
    };

    res.json(calendarData);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
