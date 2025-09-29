import fs from "fs";
import path from "path";
import db from "../db";
import { RequestHandler } from "../types.d";

export const createBackup: RequestHandler = (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    // gather user and related data
    const user = db
      .prepare(
        "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
      )
      .get(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const habits = db
      .prepare("SELECT * FROM habits WHERE userId = ?")
      .all(userId);
    const logs = db
      .prepare("SELECT * FROM habit_logs WHERE userId = ?")
      .all(userId);
    const reminders = db
      .prepare("SELECT * FROM reminders WHERE userId = ?")
      .all(userId);
    const notifications = db
      .prepare("SELECT * FROM notifications WHERE userId = ?")
      .all(userId);
    const settingsRow = db
      .prepare("SELECT settings FROM user_settings WHERE userId = ?")
      .get(userId);
    const userSettings = settingsRow
      ? JSON.parse(settingsRow.settings || "{}")
      : {};
    const achievements = db
      .prepare(
        "SELECT ua.*, a.title, a.description FROM user_achievements ua LEFT JOIN achievements a ON ua.achievementId = a.id WHERE ua.userId = ?",
      )
      .all(userId);

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
