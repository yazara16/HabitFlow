import type { RequestHandler } from "express";
import db from "../db";
import { v4 as uuidv4 } from "uuid";

export const listReminders: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const rows = await db.all("SELECT * FROM reminders WHERE userId = ?", userId);
  res.json(
    rows.map((r: any) => ({
      ...r,
      enabled: !!r.enabled,
      days: r.days ? JSON.parse(r.days) : [],
    })),
  );
};

export const createReminder: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.timeOfDay)
    return res.status(400).json({ message: "Missing timeOfDay" });
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run(
    "INSERT INTO reminders (id,userId,habitId,timeOfDay,enabled,timezone,recurrence,days,nextRun,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)",
    id,
    userId,
    data.habitId || null,
    data.timeOfDay,
    data.enabled ? 1 : 0,
    data.timezone || null,
    data.recurrence || null,
    data.days ? JSON.stringify(data.days) : null,
    data.nextRun || null,
    now,
  );
  const row = await db.get("SELECT * FROM reminders WHERE id = ?", id);
  if (!row) {
    // Fallback representation when read-back failed
    const fallback = {
      id,
      userId,
      habitId: data.habitId || null,
      timeOfDay: data.timeOfDay,
      enabled: !!data.enabled,
      timezone: data.timezone || null,
      recurrence: data.recurrence || null,
      days: data.days || [],
      nextRun: data.nextRun || null,
      createdAt: now,
    };
    return res.status(201).json(fallback);
  }
  let parsedDays: any = [];
  try {
    parsedDays = row.days ? JSON.parse(row.days) : [];
  } catch (e) {
    parsedDays = [];
  }
  res.status(201).json({
    ...row,
    enabled: !!row.enabled,
    days: parsedDays,
  });
};

export const updateReminder: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const data = req.body || {};
  const row = await db.get(
    "SELECT * FROM reminders WHERE id = ? AND userId = ?",
    id,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  await db.run(
    "UPDATE reminders SET timeOfDay = COALESCE(?, timeOfDay), enabled = COALESCE(?, enabled), timezone = COALESCE(?, timezone), recurrence = COALESCE(?, recurrence), days = COALESCE(?, days), nextRun = COALESCE(?, nextRun) WHERE id = ? AND userId = ?",
    data.timeOfDay || null,
    typeof data.enabled !== "undefined" ? (data.enabled ? 1 : 0) : null,
    data.timezone || null,
    data.recurrence || null,
    data.days ? JSON.stringify(data.days) : null,
    data.nextRun || null,
    id,
    userId,
  );
  const row2 = await db.get("SELECT * FROM reminders WHERE id = ?", id);
  res.json({
    ...row2,
    enabled: !!row2.enabled,
    days: row2.days ? JSON.parse(row2.days) : [],
  });
};

export const deleteReminder: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const row = await db.get(
    "SELECT * FROM reminders WHERE id = ? AND userId = ?",
    id,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  await db.run("DELETE FROM reminders WHERE id = ?", id);
  res.status(204).send();
};
