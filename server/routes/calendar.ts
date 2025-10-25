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

    const logs = await db.all(
      `SELECT id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt FROM habit_logs WHERE ${where} ORDER BY date ASC`,
      ...params,
    );

    const overrideParams: any[] = [userId];
    let overrideWhere = "userId = ?";
    if (from) {
      overrideWhere += " AND date >= ?";
      overrideParams.push(from);
    }
    if (to) {
      overrideWhere += " AND date <= ?";
      overrideParams.push(to);
    }
    const overridesRaw = await db.all(
      `SELECT id,habitId,userId,date,hidden,patch,createdAt,updatedAt FROM habit_overrides WHERE ${overrideWhere} ORDER BY date ASC`,
      ...overrideParams,
    );

    // Deduplicate overrides by habitId+date keeping the most recently updated
    const overridesMap: Record<string, any> = {};
    for (const o of overridesRaw || []) {
      const key = `${o.date}_${o.habitId}`;
      if (!overridesMap[key]) overridesMap[key] = o;
      else {
        // keep latest updatedAt
        const existing = overridesMap[key];
        const a = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
        const b = new Date(o.updatedAt || o.createdAt || 0).getTime();
        if (b >= a) overridesMap[key] = o;
      }
    }
    const overrides = Object.values(overridesMap).map((r: any) => ({
      ...r,
      hidden: !!r.hidden,
      patch: typeof r.patch === 'string' && r.patch ? JSON.parse(r.patch) : r.patch || null,
    }));

    return res.json({ logs, overrides });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Failed to fetch calendar data", error: String(e) });
  }
};
