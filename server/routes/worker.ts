import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

function parseDateIso(d: string) {
  return new Date(d + 'T00:00:00');
}

function isoDateStr(date: Date) {
  return date.toISOString().split('T')[0];
}

// Compute consecutive streak for a habit based on habit_logs and habit frequency
function computeStreakForHabit(habit: any, userId: string): number {
  const habitId = habit.id;
  const frequency = habit.frequency || 'daily';
  const createdAt = habit.createdAt || null; // ISO date

  if (frequency === 'daily') {
    return computeDailyStreak(habitId, userId);
  }

  if (frequency === 'weekly') {
    // For weekly, determine scheduled weekday from createdAt or default to Sunday (0)
    const created = createdAt ? new Date(createdAt) : new Date();
    const weekday = created.getDay();
    // Check consecutive weeks: for each week starting this week going back, check if there's a completed log on that weekday
    let streak = 0;
    let cursor = new Date(); cursor.setHours(0,0,0,0);
    // Align cursor to this week's target weekday
    const diff = cursor.getDay() - weekday;
    cursor.setDate(cursor.getDate() - diff);
    for (let i=0;i<365;i++) { // safety cap
      const iso = isoDateStr(cursor);
      const row = db.prepare('SELECT completedBoolean FROM habit_logs WHERE habitId = ? AND userId = ? AND date = ?').get(habitId, userId, iso);
      if (row && row.completedBoolean) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 7);
      } else {
        break;
      }
    }
    return streak;
  }

  if (frequency === 'monthly') {
    // For monthly, determine scheduled day-of-month from createdAt or default to 1
    const created = createdAt ? new Date(createdAt) : new Date();
    const dayOfMonth = created.getDate();
    let streak = 0;
    let cursor = new Date(); cursor.setHours(0,0,0,0);
    // set cursor to this month's scheduled day, or if past, to this month's
    cursor.setDate(dayOfMonth);
    if (cursor > new Date()) {
      // if scheduled day in future (this month), move to previous month
      cursor.setMonth(cursor.getMonth() - 1);
    }
    for (let i=0;i<120;i++) {
      const iso = isoDateStr(cursor);
      const row = db.prepare('SELECT completedBoolean FROM habit_logs WHERE habitId = ? AND userId = ? AND date = ?').get(habitId, userId, iso);
      if (row && row.completedBoolean) {
        streak += 1;
        cursor.setMonth(cursor.getMonth() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // fallback
  return computeDailyStreak(habitId, userId);
}

// Compute consecutive daily streak for a habit based on habit_logs (completedBoolean)
function computeDailyStreak(habitId: string, userId: string): number {
  const rows = db.prepare('SELECT date, completedBoolean FROM habit_logs WHERE habitId = ? AND userId = ? ORDER BY date DESC').all(habitId, userId);
  if (!rows || rows.length === 0) return 0;
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0,0,0,0);
  for (const r of rows) {
    const d = parseDateIso(r.date);
    const diff = Math.round((cursor.getTime() - d.getTime()) / (1000*60*60*24));
    if (diff === 0 && r.completedBoolean) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diff === 1 && r.completedBoolean) {
      // allow consecutive previous day
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (diff > 1) {
      break;
    } else if (!r.completedBoolean) {
      break;
    } else {
      break;
    }
  }
  return streak;
}

export async function computeAndRunWorker() {
  const todayIso = isoDateStr(new Date());
  const users = db.prepare('SELECT id FROM users').all();
  const achievements = db.prepare('SELECT id,key,title,description,criteria FROM achievements').all();

  const report: any = { users: 0, habitsUpdated: 0, achievementsUnlocked: 0 };

  for (const u of users) {
    report.users += 1;
    const userId = u.id;
    const habits = db.prepare('SELECT id,target,frequency,createdAt FROM habits WHERE userId = ?').all(userId);

    // Compute habit streaks and today's completion
    for (const h of habits) {
      const habitId = h.id;
      const streak = computeStreakForHabit(h, userId);

      // Find today's log
      const todayLog = db.prepare('SELECT completedAmount, completedBoolean FROM habit_logs WHERE habitId = ? AND userId = ? AND date = ?').get(habitId, userId, todayIso);
      const completedToday = !!(todayLog && todayLog.completedBoolean);
      const completedAmount = todayLog ? todayLog.completedAmount : 0;

      if (streak !== undefined) {
        const lastCompleted = completedToday ? todayIso : db.prepare('SELECT lastCompleted FROM habits WHERE id = ?').get(habitId)?.lastCompleted || null;
        db.prepare('UPDATE habits SET streak = ?, lastCompleted = COALESCE(?, lastCompleted) WHERE id = ?').run(streak, lastCompleted, habitId);
        report.habitsUpdated += 1;
      }

      db.prepare('UPDATE habits SET completed = COALESCE(completed,0) WHERE id = ?').run(habitId);
    }

    // Evaluate achievements for this user
    for (const a of achievements) {
      let criteria;
      try { criteria = JSON.parse(a.criteria); } catch { criteria = null; }
      let shouldUnlock = false;
      if (!criteria) continue;

      switch (criteria.type) {
        case 'count_per_day': {
          const cnt = db.prepare('SELECT COUNT(*) as c FROM habit_logs WHERE userId = ? AND date = ? AND completedBoolean = 1').get(userId, todayIso).c;
          if (cnt >= (criteria.count || 0)) shouldUnlock = true;
          break;
        }
        case 'all_today': {
          const totalHabits = db.prepare('SELECT COUNT(*) as c FROM habits WHERE userId = ?').get(userId).c;
          if (totalHabits === 0) break;
          const completedHabits = db.prepare('SELECT COUNT(DISTINCT habitId) as c FROM habit_logs WHERE userId = ? AND date = ? AND completedBoolean = 1').get(userId, todayIso).c;
          if (completedHabits >= totalHabits) shouldUnlock = true;
          break;
        }
        case 'streak': {
          const days = criteria.days || 0;
          const row = db.prepare('SELECT id,streak FROM habits WHERE userId = ?').all(userId).find((x: any) => (x.streak || 0) >= days);
          if (row) shouldUnlock = true;
          break;
        }
      }

      if (shouldUnlock) {
        const exists = db.prepare('SELECT id FROM user_achievements WHERE userId = ? AND achievementId = ?').get(userId, a.id);
        if (!exists) {
          const uaId = uuidv4();
          const now = new Date().toISOString();
          db.prepare('INSERT INTO user_achievements (id,userId,achievementId,earnedAt,meta) VALUES (?,?,?,?,?)').run(uaId, userId, a.id, now, JSON.stringify({ auto: true }));
          db.prepare('INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES (?,?,?,?,?,?,?,?,?)')
            .run(uuidv4(), userId, 'achievement', `Logro: ${a.key}`, `Has desbloqueado: ${a.title}`, now, 0, JSON.stringify({ achievementKey: a.key }), now);
          report.achievementsUnlocked += 1;
        }
      }
    }
  }

  return report;
}

export const runWorker: RequestHandler = async (_req, res) => {
  try {
    const result = await computeAndRunWorker();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
