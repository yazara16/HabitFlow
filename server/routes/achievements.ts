import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

// Catalog of achievements (admin or seeded)
export const listCatalog: RequestHandler = async (_req, res) => {
  const rows = await db.all('SELECT id,key,title,description,criteria,createdAt FROM achievements');
  res.json(rows);
};

export const getUserAchievements: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const rows = await db.all('SELECT ua.id,ua.userId,ua.achievementId,ua.earnedAt,ua.meta,a.key,a.title,a.description FROM user_achievements ua JOIN achievements a ON a.id = ua.achievementId WHERE ua.userId = ? ORDER BY ua.earnedAt DESC', userId);
  res.json(rows.map((r: any) => ({ id: r.id, achievementId: r.achievementId, key: r.key, title: r.title, description: r.description, earnedAt: r.earnedAt, meta: r.meta ? r.meta : undefined })));
};

export const unlockAchievement: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const { achievementKey, meta } = req.body || {};
  if (!achievementKey) return res.status(400).json({ message: 'Missing achievementKey' });

  let ach = await db.get('SELECT id FROM achievements WHERE key = ?', achievementKey);
  if (!ach) {
    // create a new achievement record on the fly
    const aid = uuidv4();
    const now = new Date().toISOString();
    await db.run('INSERT INTO achievements (id,key,title,description,criteria,createdAt) VALUES (?,?,?,?,?,?)', aid, achievementKey, achievementKey, achievementKey, JSON.stringify({ auto: true }), now);
    ach = { id: aid };
  }
  // prevent duplicates
  const existing = await db.get('SELECT id FROM user_achievements WHERE userId = ? AND achievementId = ?', userId, ach.id);
  if (existing) return res.status(409).json({ message: 'Already unlocked' });

  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run('INSERT INTO user_achievements (id,userId,achievementId,earnedAt,meta) VALUES (?,?,?,?,?)', id, userId, ach.id, now, meta ? meta : null);

  // create notification
  await db.run('INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES (?,?,?,?,?,?,?,?,?)', uuidv4(), userId, 'achievement', `Logro: ${achievementKey}`, `Has desbloqueado: ${achievementKey}`, now, 0, JSON.stringify({ achievementKey }), now);

  res.status(201).json({ id, achievementId: ach.id, earnedAt: now });
};

export const seedCatalog: RequestHandler = async (_req, res) => {
  // Seed some common achievements if missing
  const seeds = [
    { key: '3_in_a_day', title: '3 hábitos completados hoy', description: 'Completa 3 hábitos en el mismo día', criteria: JSON.stringify({ type: 'count_per_day', count: 3 }) },
    { key: 'perfect_day', title: 'Día perfecto', description: 'Completa todos tus hábitos hoy', criteria: JSON.stringify({ type: 'all_today' }) },
    { key: 'streak_7', title: 'Racha 7+', description: 'Alcanza una racha de 7 días', criteria: JSON.stringify({ type: 'streak', days: 7 }) }
  ];
  const now = new Date().toISOString();
  for (const s of seeds) {
    // INSERT OR IGNORE equivalent for Postgres
    await db.run('INSERT INTO achievements (id,key,title,description,criteria,createdAt) VALUES (?,?,?,?,?,?) ON CONFLICT (key) DO NOTHING', uuidv4(), s.key, s.title, s.description, s.criteria, now);
  }
  res.json({ ok: true });
};
