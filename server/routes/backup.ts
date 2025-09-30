import fs from "fs";
import path from "path";
import type { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBackup: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    // obtener usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, photoUrl: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // obtener hábitos, logs, recordatorios, notificaciones
    const [habits, logs, reminders, notifications, settingsRow, achievements] = await Promise.all([
      prisma.habit.findMany({ where: { userId } }),
      prisma.habitLog.findMany({ where: { userId } }),
      prisma.reminder.findMany({ where: { userId } }),
      prisma.notification.findMany({ where: { userId } }),
      prisma.userSettings.findUnique({ where: { userId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: { select: { title: true, description: true } },
        },
      }),
    ]);

    const userSettings = settingsRow ? JSON.parse(settingsRow.settings || "{}") : {};

    // formatear achievements con los campos title y description
    const achievementsFormatted = achievements.map(a => ({
      ...a,
      title: a.achievement?.title,
      description: a.achievement?.description,
      meta: a.meta ? JSON.parse(a.meta) : undefined,
    }));

    const payload = {
      meta: {
        createdAt: new Date().toISOString(),
        userId,
      },
      user,
      settings: userSettings,
      habits,
      logs,
      reminders,
      notifications,
      achievements: achievementsFormatted,
    };

    // crear carpeta de backup si no existe
    const dir = path.join(process.cwd(), "server", "data", "backups");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = `${userId}-${Date.now()}.json`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), "utf-8");

    return res.json({ ok: true, filename });
  } catch (e: any) {
    console.error("Backup error:", e);
    return res.status(500).json({ message: String(e) });
  }
};
