import type { RequestHandler } from "express";
import db from "../db";

// GET /api/users/:userId/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getCalendarData: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const params: any[] = [userId];
    let where = "userId = ?";
    if (from) {
      where += " AND date >= ?";
      params.push(from);
    }
    if (to) {
      where += " AND date <= ?";
      params.push(to);
    }

    const logs = db
      .prepare(
        `SELECT id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt FROM habit_logs WHERE ${where} ORDER BY date ASC`,
      )
      .all(...params);
    const overrides = db
      .prepare(
        `SELECT id,habitId,userId,date,hidden,patch,createdAt,updatedAt FROM habit_overrides WHERE userId = ? ${from ? "AND date >= ?" : ""} ${to ? "AND date <= ?" : ""} ORDER BY date ASC`,
      )
      .all(...[userId].concat(from ? [from] : []).concat(to ? [to] : []));

    return res.json({ logs, overrides });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Failed to fetch calendar data", error: String(e) });
  }
};
