import db from "../db";

// Returns aggregated dashboard stats for a given user
export const getDashboardStats: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const today = new Date().toISOString().split("T")[0];

    const totalHabitsRow = await db.get(
      "SELECT COUNT(*) as c FROM habits WHERE userId = ?",
      userId,
    );
    const totalHabits = totalHabitsRow?.c ?? 0;

    // Completed today: count habit_logs where completedBoolean=1 for today
    const completedTodayRow = await db.get(
      "SELECT COUNT(*) as c FROM habit_logs WHERE userId = ? AND date = ? AND completedBoolean = 1",
      userId,
      today,
    );
    const completedToday = completedTodayRow?.c ?? 0;

    // Yesterday completed
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayIso = yesterdayDate.toISOString().split("T")[0];
    const yesterdayRow = await db.get(
      "SELECT COUNT(*) as c FROM habit_logs WHERE userId = ? AND date = ? AND completedBoolean = 1",
      userId,
      yesterdayIso,
    );
    const yesterdayCompleted = yesterdayRow?.c ?? 0;

    // Current max streak among habits
    const streakRow = await db.get(
      "SELECT MAX(streak) as maxStreak FROM habits WHERE userId = ?",
      userId,
    );
    const maxStreak = streakRow?.maxStreak ?? 0;

    // Achievements unlocked count
    const achievementsRow = await db.get(
      "SELECT COUNT(*) as c FROM user_achievements WHERE userId = ?",
      userId,
    );
    const achievementsCount = achievementsRow?.c ?? 0;

    // Achievements in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysIso = sevenDaysAgo.toISOString().split("T")[0];
    const recentAchievementsRow = await db.get(
      "SELECT COUNT(*) as c FROM user_achievements WHERE userId = ? AND earnedAt >= ?",
      userId,
      sevenDaysIso,
    );
    const achievementsNew = recentAchievementsRow?.c ?? 0;

    // This week completed logs (from Monday)
    const now = new Date();
    const day = now.getDay();
    // compute Monday as start of week (day 1). If Sunday (0) set to previous Monday.
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const mondayIso = monday.toISOString().split("T")[0];

    const weekCompletedRow = await db.get(
      "SELECT COUNT(*) as c FROM habit_logs WHERE userId = ? AND date >= ? AND date <= ? AND completedBoolean = 1",
      userId,
      mondayIso,
      today,
    );
    const weekCompleted = weekCompletedRow?.c ?? 0;

    // Some basic per-category counts
    const categories =
      (await db.all(
        "SELECT category, COUNT(*) as c FROM habits WHERE userId = ? GROUP BY category",
        userId,
      )) || [];
    const categoryCounts: Record<string, number> = {};
    categories.forEach((r: any) => {
      categoryCounts[r.category || "custom"] = r.c;
    });

    return res.json({
      totalHabits,
      completedToday,
      yesterdayCompleted,
      maxStreak,
      achievementsCount,
      achievementsNew,
      weekCompleted,
      categoryCounts,
      today,
    });
  } catch (e: any) {
    return res
      .status(500)
      .json({ message: "Failed to compute dashboard stats", error: String(e) });
  }
};
