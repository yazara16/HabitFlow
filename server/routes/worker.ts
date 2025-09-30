import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

// Helpers de fecha
function isoDateStr(date: Date) {
  return date.toISOString().split('T')[0];
}

function parseDateIso(d: string) {
  return new Date(d + 'T00:00:00');
}

// Compute streak for daily habit
async function computeDailyStreak(habitId: number, userId: number): Promise<number> {
  const logs = await db.habitLog.findMany({
    where: { habitId, userId },
    orderBy: { date: 'desc' },
    select: { date: true, completedBoolean: true },
  });

  if (!logs || logs.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const log of logs) {
    const logDate = parseDateIso(log.date.toISOString().split('T')[0]);
    const diff = Math.round((cursor.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

    if ((diff === 0 || diff === 1) && log.completedBoolean) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Compute streak for weekly habit
async function computeWeeklyStreak(habit: any, userId: number): Promise<number> {
  const created = habit.createdAt ? new Date(habit.createdAt) : new Date();
  const weekday = created.getDay(); // día programado
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const diff = cursor.getDay() - weekday;
  cursor.setDate(cursor.getDate() - diff);

  for (let i = 0; i < 52; i++) {
    const start = isoDateStr(cursor);
    const log = await db.habitLog.findFirst({
      where: { habitId: habit.id, userId, date: new Date(start), completedBoolean: true },
    });
    if (log) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

// Compute streak for monthly habit
async function computeMonthlyStreak(habit: any, userId: number): Promise<number> {
  const created = habit.createdAt ? new Date(habit.createdAt) : new Date();
  const dayOfMonth = created.getDate(); // día programado
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(dayOfMonth);
  if (cursor > new Date()) {
    cursor.setMonth(cursor.getMonth() - 1);
  }

  for (let i = 0; i < 12; i++) {
    const iso = isoDateStr(cursor);
    const log = await db.habitLog.findFirst({
      where: { habitId: habit.id, userId, date: new Date(iso), completedBoolean: true },
    });
    if (log) {
      streak += 1;
      cursor.setMonth(cursor.getMonth() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Compute streak for habit based on frequency
async function computeStreakForHabit(habit: any, userId: number): Promise<number> {
  const frequency = habit.frequency || 'daily';
  if (frequency === 'daily') return computeDailyStreak(habit.id, userId);
  if (frequency === 'weekly') return computeWeeklyStreak(habit, userId);
  if (frequency === 'monthly') return computeMonthlyStreak(habit, userId);
  return computeDailyStreak(habit.id, userId);
}

// Worker principal
export async function computeAndRunWorker() {
  const todayIso = isoDateStr(new Date());
  const users = await db.user.findMany({ select: { id: true } });
  const achievements = await db.achievement.findMany();

  const report = { users: 0, habitsUpdated: 0, achievementsUnlocked: 0 };

  for (const u of users) {
    report.users += 1;
    const userId = u.id;

    const habits = await db.habit.findMany({
      where: { userId },
      select: { id: true, frequency: true, createdAt: true },
    });

    for (const h of habits) {
      const streak = await computeStreakForHabit(h, userId);

      // Upsert streak record
      await db.streakRecord.upsert({
        where: { habitId_userId: { habitId: h.id, userId } } as any,
        update: {
          currentStreak: streak,
          longestStreak: streak,
          lastActivity: new Date(),
        },
        create: {
          habitId: h.id,
          userId,
          streakType: h.frequency || 'daily',
          currentStreak: streak,
          longestStreak: streak,
          lastActivity: new Date(),
          streakStarted: new Date(),
        },
      });

      // Actualizar campo streak en Habit
      await db.habit.update({
        where: { id: h.id },
        data: { streak },
      });

      report.habitsUpdated += 1;
    }

    // Evaluar logros
    for (const a of achievements) {
      let criteria;
      try { criteria = JSON.parse(a.criteria || 'null'); } catch { criteria = null; }
      if (!criteria) continue;

      let shouldUnlock = false;

      switch (criteria.type) {
        case 'count_per_day': {
          const cnt = await db.habitLog.count({
            where: { userId, date: new Date(todayIso), completedBoolean: true },
          });
          if (cnt >= (criteria.count || 0)) shouldUnlock = true;
          break;
        }
        case 'all_today': {
          const totalHabits = await db.habit.count({ where: { userId } });
          if (totalHabits === 0) break;

          const completedHabitsLogs = await db.habitLog.findMany({
            where: { userId, date: new Date(todayIso), completedBoolean: true },
            distinct: ['habitId'],
            select: { habitId: true },
          });
          const completedHabits = completedHabitsLogs.length;

          if (completedHabits >= totalHabits) shouldUnlock = true;
          break;
        }
        case 'streak': {
          const days = criteria.days || 0;
          const row = await db.habit.findFirst({
            where: { userId, streak: { gte: days } },
          });
          if (row) shouldUnlock = true;
          break;
        }
      }

      if (shouldUnlock) {
        const exists = await db.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: a.id } } as any,
        });

        if (!exists) {
          const uaId = uuidv4();
          const now = new Date();
          await db.userAchievement.create({
            data: {
              id: uaId,
              userId,
              achievementId: a.id,
              earnedAt: now,
              meta: JSON.stringify({ auto: true }),
            },
          });

          await db.notification.create({
            data: {
              id: uuidv4(),
              userId,
              type: 'achievement',
              title: `Logro: ${a.key}`,
              message: `Has desbloqueado: ${a.title}`,
              time: now.toISOString(),
              read: false,
              metadata: JSON.stringify({ achievementKey: a.key }),
              createdAt: now,
            },
          });

          report.achievementsUnlocked += 1;
        }
      }
    }
  }

  return report;
}

// Endpoint para ejecutar worker
export const runWorker: RequestHandler = async (_req, res) => {
  try {
    const result = await computeAndRunWorker();
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e) });
  }
};
