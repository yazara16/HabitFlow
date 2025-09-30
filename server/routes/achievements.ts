import type { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const listCatalog: RequestHandler = async (_req, res) => {
  const rows = await prisma.achievement.findMany({
    select: {
      id: true,
      key: true,
      title: true,
      description: true,
      criteria: true,
      createdAt: true,
    },
  });

  // parsear criteria de String a objeto si existe
  const result = rows.map(r => ({
    ...r,
    criteria: r.criteria ? JSON.parse(r.criteria) : undefined,
  }));

  res.json(result);
};

export const getUserAchievements: RequestHandler = async (req, res) => {
  const userId = Number(req.params.userId);

  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { earnedAt: 'desc' },
    include: { achievement: true },
  });

  res.json(rows.map(r => ({
    id: r.id,
    achievementId: r.achievementId,
    key: r.achievement.key,
    title: r.achievement.title,
    description: r.achievement.description,
    earnedAt: r.earnedAt,
    meta: r.meta ? JSON.parse(r.meta) : undefined,
  })));
};

export const unlockAchievement: RequestHandler = async (req, res) => {
  const userId = Number(req.params.userId);
  const { achievementKey, meta } = req.body || {};
  if (!achievementKey) return res.status(400).json({ message: 'Missing achievementKey' });

  let ach = await prisma.achievement.findUnique({ where: { key: achievementKey } });

  if (!ach) {
    // crear logro al vuelo
    ach = await prisma.achievement.create({
      data: {
        id: undefined, // Prisma autoincrementa automáticamente
        key: achievementKey,
        title: achievementKey,
        description: achievementKey,
        criteria: JSON.stringify({ auto: true }),
        createdAt: new Date(),
      },
    });
  }

  // prevenir duplicados
  const existing = await prisma.userAchievement.findFirst({
    where: { userId, achievementId: ach.id },
  });
  if (existing) return res.status(409).json({ message: 'Already unlocked' });

  const now = new Date();
  const ua = await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: ach.id,
      earnedAt: now,
      meta: meta ? JSON.stringify(meta) : null,
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: 'achievement',
      title: `Logro: ${achievementKey}`,
      message: `Has desbloqueado: ${achievementKey}`,
      time: now.toISOString(),
      read: false,
      metadata: JSON.stringify({ achievementKey }),
      createdAt: now,
    },
  });

  res.status(201).json({
    id: ua.id,
    achievementId: ach.id,
    earnedAt: ua.earnedAt,
  });
};

export const seedCatalog: RequestHandler = async (_req, res) => {
  const seeds = [
    { key: '3_in_a_day', title: '3 hábitos completados hoy', description: 'Completa 3 hábitos en el mismo día', criteria: { type: 'count_per_day', count: 3 } },
    { key: 'perfect_day', title: 'Día perfecto', description: 'Completa todos tus hábitos hoy', criteria: { type: 'all_today' } },
    { key: 'streak_7', title: 'Racha 7+', description: 'Alcanza una racha de 7 días', criteria: { type: 'streak', days: 7 } },
  ];

  for (const s of seeds) {
    await prisma.achievement.upsert({
      where: { key: s.key },
      update: {},
      create: {
        key: s.key,
        title: s.title,
        description: s.description,
        criteria: JSON.stringify(s.criteria),
        createdAt: new Date(),
      },
    });
  }

  res.json({ ok: true });
};
