import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

function parseDateIso(d: string) {
  return new Date(d + 'T00:00:00');
}

function isoDateStr(date: Date) {
  return date.toISOString().split('T')[0];
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

export const runWorker: RequestHandler = (_req, res) => {
  const todayIso = isoDateStr(new Date());
  const users = db.prepare('SELECT id FROM users').all();
  const achievements = db.prepare('SELECT id,key,title,description,criteria FROM achievements').all();

  const report: any = { users: 0, habitsUpdated: 0, achievementsUnlocked: 0 };

  for (const u of users) {
    report.users += 1;
    const userId = u.id;
    const habits = db.prepare('SELECT id,target FROM habits WHERE userId = ?').all(userId);

    // Compute habit streaks and today's completion
    for (const h of habits) {
      const habitId = h.id;
      const streak = computeDailyStreak(habitId, userId);

      // Find today's log
      const todayLog = db.prepare('SELECT completedAmount, completedBoolean FROM habit_logs WHERE habitId = ? AND userId = ? AND date = ?').get(habitId, userId, todayIso);
      const completedToday = !!(todayLog && todayLog.completedBoolean);
      const completedAmount = todayLog ? todayLog.completedAmount : 0;

      // update habits table: streak, completed (accumulate? keep existing completed total), completedToday flag, lastCompleted
      // We'll update streak and lastCompleted if completedToday
      if (streak !== undefined) {
        const lastCompleted = completedToday ? todayIso : db.prepare('SELECT lastCompleted FROM habits WHERE id = ?').get(habitId)?.lastCompleted || null;
        db.prepare('UPDATE habits SET streak = ?, lastCompleted = COALESCE(?, lastCompleted) WHERE id = ?').run(streak, lastCompleted, habitId);
        report.habitsUpdated += 1;
      }

      // Optionally update completedToday boolean column if present
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
          // count logs today with completedBoolean
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
          // if any habit has streak >= days
          const row = db.prepare('SELECT id,streak FROM habits WHERE userId = ?').all(userId).find((x: any) => (x.streak || 0) >= days);
          if (row) shouldUnlock = true;
          break;
        }
      }

      if (shouldUnlock) {
        // check existing
        const exists = db.prepare('SELECT id FROM user_achievements WHERE userId = ? AND achievementId = ?').get(userId, a.id);
        if (!exists) {
          const uaId = uuidv4();
          const now = new Date().toISOString();
          db.prepare('INSERT INTO user_achievements (id,userId,achievementId,earnedAt,meta) VALUES (?,?,?,?,?)').run(uaId, userId, a.id, now, JSON.stringify({ auto: true }));
          // create notification
          db.prepare('INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES (?,?,?,?,?,?,?,?,?)')
            .run(uuidv4(), userId, 'achievement', `Logro: ${a.key}`, `Has desbloqueado: ${a.title}`, now, 0, JSON.stringify({ achievementKey: a.key }), now);
          report.achievementsUnlocked += 1;
        }
      }
    }
  }

  res.json(report);
};
