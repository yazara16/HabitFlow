import fs from "fs";
import path from "path";
import db from "../db";
import { RequestHandler } from "../types.d";

export const createBackup: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    // gather user and related data
    const user = await db.get(
      "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
      userId,
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const habits = await db.all(
      "SELECT * FROM habits WHERE userId = ?",
      userId,
    );
    const logs = await db.all(
      "SELECT * FROM habit_logs WHERE userId = ?",
      userId,
    );
    const reminders = await db.all(
      "SELECT * FROM reminders WHERE userId = ?",
      userId,
    );
    const notifications = await db.all(
      "SELECT * FROM notifications WHERE userId = ?",
      userId,
    );
    const settingsRow = await db.get(
      "SELECT settings FROM user_settings WHERE userId = ?",
      userId,
    );
    const userSettings = settingsRow
      ? JSON.parse(settingsRow.settings || "{}")
      : {};
    const achievements = await db.all(
      "SELECT ua.*, a.title, a.description FROM user_achievements ua LEFT JOIN achievements a ON ua.achievementId = a.id WHERE ua.userId = ?",
      userId,
    );

    const payload = {
      meta: {
        createdAt: new Date().toISOString(),
        userId: userId,
      },
      user,
      settings: userSettings,
      habits,
      logs,
      reminders,
      notifications,
      achievements,
    };

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
