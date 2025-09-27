import type { RequestHandler } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

// Catalog of achievements (admin or seeded)
export const listCatalog: RequestHandler = (_req, res) => {
  const rows = db.prepare('SELECT id,key,title,description,criteria,createdAt FROM achievements').all();
  res.json(rows);
};

export const getUserAchievements: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const rows = db.prepare('SELECT ua.id,ua.userId,ua.achievementId,ua.earnedAt,ua.meta,a.key,a.title,a.description FROM user_achievements ua JOIN achievements a ON a.id = ua.achievementId WHERE ua.userId = ? ORDER BY ua.earnedAt DESC').all(userId);
  res.json(rows.map((r: any) => ({ id: r.id, achievementId: r.achievementId, key: r.key, title: r.title, description: r.description, earnedAt: r.earnedAt, meta: r.meta ? JSON.parse(r.meta) : undefined })));
};

export const unlockAchievement: RequestHandler = (req, res) => {
  const userId = req.params.userId;
  const { achievementKey, meta } = req.body || {};
  if (!achievementKey) return res.status(400).json({ message: 'Missing achievementKey' });

  const ach = db.prepare('SELECT id FROM achievements WHERE key = ?').get(achievementKey);
  if (!ach) return res.status(404).json({ message: 'Achievement not found' });
  // prevent duplicates
  const existing = db.prepare('SELECT id FROM user_achievements WHERE userId = ? AND achievementId = ?').get(userId, ach.id);
  if (existing) return res.status(409).json({ message: 'Already unlocked' });

  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO user_achievements (id,userId,achievementId,earnedAt,meta) VALUES (?,?,?,?,?)').run(id, userId, ach.id, now, meta ? JSON.stringify(meta) : null);

  // create notification
  db.prepare('INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(uuidv4(), userId, 'achievement', `Logro: ${achievementKey}`, `Has desbloqueado: ${achievementKey}`, now, 0, JSON.stringify({ achievementKey }), now);

  res.status(201).json({ id, achievementId: ach.id, earnedAt: now });
};

export const seedCatalog: RequestHandler = (_req, res) => {
  // Seed some common achievements if missing
  const seeds = [
    { key: '3_in_a_day', title: '3 hábitos completados hoy', description: 'Completa 3 hábitos en el mismo día', criteria: JSON.stringify({ type: 'count_per_day', count: 3 }) },
    { key: 'perfect_day', title: 'Día perfecto', description: 'Completa todos tus hábitos hoy', criteria: JSON.stringify({ type: 'all_today' }) },
    { key: 'streak_7', title: 'Racha 7+', description: 'Alcanza una racha de 7 días', criteria: JSON.stringify({ type: 'streak', days: 7 }) }
  ];
  const now = new Date().toISOString();
  const insert = db.prepare('INSERT OR IGNORE INTO achievements (id,key,title,description,criteria,createdAt) VALUES (?,?,?,?,?,?)');
  for (const s of seeds) {
    insert.run(uuidv4(), s.key, s.title, s.description, s.criteria, now);
  }
  res.json({ ok: true });
};
