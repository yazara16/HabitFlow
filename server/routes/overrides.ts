import type { RequestHandler } from "express";
import db from "../db";
import { v4 as uuidv4 } from "uuid";

export const listOverrides: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const date = req.query.date as string | undefined;
  let stmt = "SELECT * FROM habit_overrides WHERE userId = ? AND habitId = ?";
  const params: any[] = [userId, habitId];
  if (date) {
    stmt += " AND date = ?";
    params.push(date);
  }
  const rows = await db.all(stmt, ...params);
  res.json(
    rows.map((r: any) => ({
      ...r,
      hidden: !!r.hidden,
      patch: typeof r.patch === 'string' && r.patch ? JSON.parse(r.patch) : r.patch || null,
    })),
  );
};

export const createOverride: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const data = req.body || {};
  if (!data.date) return res.status(400).json({ message: "Missing date" });
  const now = new Date().toISOString();

  // Prevent duplicate overrides for same habit/date: upsert semantics
  const existing = await db.get(
    "SELECT id FROM habit_overrides WHERE habitId = ? AND userId = ? AND date = ?",
    habitId,
    userId,
    data.date,
  );

  if (existing) {
    // Update existing
    await db.run(
      "UPDATE habit_overrides SET hidden = ?, patch = ?, updatedAt = ? WHERE id = ?",
      data.hidden ? 1 : 0,
      data.patch ? JSON.stringify(data.patch) : null,
      now,
      existing.id,
    );
    // remove any other duplicates for same habit/date
    await db.run(
      "DELETE FROM habit_overrides WHERE habitId = ? AND userId = ? AND date = ? AND id != ?",
      habitId,
      userId,
      data.date,
      existing.id,
    );
      const row = await db.get("SELECT * FROM habit_overrides WHERE id = ?", existing.id);
    if (!row) {
      const fallback = {
        id: existing.id,
        habitId,
        userId,
        date: data.date,
        hidden: !!data.hidden,
        patch: data.patch || null,
        createdAt: now,
        updatedAt: now,
      };
      return res.status(200).json(fallback);
    }
    return res.status(200).json({
      ...row,
      hidden: !!row.hidden,
      patch: typeof row.patch === 'string' && row.patch ? JSON.parse(row.patch) : row.patch || null,
    });
  }

  const id = uuidv4();
  await db.run(
    "INSERT INTO habit_overrides (id,habitId,userId,date,hidden,patch,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)",
    id,
    habitId,
    userId,
    data.date,
    data.hidden ? 1 : 0,
    data.patch ? JSON.stringify(data.patch) : null,
    now,
    now,
  );
  // delete any pre-existing duplicates that might exist (keep the newly inserted id)
  await db.run(
    "DELETE FROM habit_overrides WHERE habitId = ? AND userId = ? AND date = ? AND id != ?",
    habitId,
    userId,
    data.date,
    id,
  );
  const row = await db.get("SELECT * FROM habit_overrides WHERE id = ?", id);
  if (!row) {
    const fallback = {
      id,
      habitId,
      userId,
      date: data.date,
      hidden: !!data.hidden,
      patch: data.patch || null,
      createdAt: now,
      updatedAt: now,
    };
    return res.status(201).json(fallback);
  }
  res
    .status(201)
    .json({
      ...row,
      hidden: !!row.hidden,
      patch: typeof row.patch === 'string' && row.patch ? JSON.parse(row.patch) : row.patch || null,
    });
};

export const deleteOverride: RequestHandler = async (req, res) => {
  const { userId, habitId, overrideId } = req.params;
  const row = await db.get(
    "SELECT * FROM habit_overrides WHERE id = ? AND habitId = ? AND userId = ?",
    overrideId,
    habitId,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  await db.run("DELETE FROM habit_overrides WHERE id = ?", overrideId);
  res.status(204).send();
};
