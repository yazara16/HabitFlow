import type { RequestHandler } from "express";
import db from "../db";

export const getCalendarData: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get habits and their logs for calendar view
    const habits = await db.habit.findMany({
      where: { userId },
      include: {
        habitLogs: {
          orderBy: { date: 'desc' },
          take: 10 // Get last 10 logs per habit
        }
      }
    });

    const calendarData = {
      habits: habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        logs: habit.habitLogs.map(log => ({
          date: log.date.toISOString().split('T')[0],
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
