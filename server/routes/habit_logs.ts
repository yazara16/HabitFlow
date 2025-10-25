import type { RequestHandler } from "express";
import db from "../db";
import { v4 as uuidv4 } from "uuid";

export const listLogs: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  let stmt = "SELECT * FROM habit_logs WHERE userId = ? AND habitId = ?";
  const params: any[] = [userId, habitId];
  if (from) {
    stmt += " AND date >= ?";
    params.push(from);
  }
  if (to) {
    stmt += " AND date <= ?";
    params.push(to);
  }
  stmt += " ORDER BY date DESC";
  const rows = await db.all(stmt, ...params);
  res.json(
    rows.map((r: any) => ({
      ...r,
      completedBoolean: !!r.completedBoolean,
    })),
  );
};

export const createLog: RequestHandler = async (req, res) => {
  const { userId, habitId } = req.params;
  const data = req.body || {};
  if (!data.date) return res.status(400).json({ message: "Missing date" });
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run(
    "INSERT INTO habit_logs (id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?)",
    id,
    habitId,
    userId,
    data.date,
    data.completedAmount || 0,
    data.completedBoolean ? 1 : 0,
    data.note || null,
    now,
    now,
  );
  const row = await db.get("SELECT * FROM habit_logs WHERE id = ?", id);
  if (!row) {
    // If the read-back failed, return a representation based on what we inserted
    const fallback = {
      id,
      habitId,
      userId,
      date: data.date,
      completedAmount: data.completedAmount || 0,
      completedBoolean: !!data.completedBoolean,
      note: data.note || null,
      createdAt: now,
      updatedAt: now,
    };
    return res.status(201).json(fallback);
  }
  res.status(201).json({ ...row, completedBoolean: !!row.completedBoolean });
};

export const updateLog: RequestHandler = async (req, res) => {
  const { userId, habitId, logId } = req.params;
  const data = req.body || {};
  const row = await db.get(
    "SELECT * FROM habit_logs WHERE id = ? AND habitId = ? AND userId = ?",
    logId,
    habitId,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  const updatedAt = new Date().toISOString();
  const completedAmount =
    typeof data.completedAmount !== "undefined"
      ? data.completedAmount
      : row.completedAmount;
  const completedBoolean =
    typeof data.completedBoolean !== "undefined"
      ? data.completedBoolean
        ? 1
        : 0
      : row.completedBoolean;
  const note = typeof data.note !== "undefined" ? data.note : row.note;
  await db.run(
    "UPDATE habit_logs SET completedAmount = ?, completedBoolean = ?, note = ?, updatedAt = ? WHERE id = ?",
    completedAmount,
    completedBoolean,
    note,
    updatedAt,
    logId,
  );
  const row2 = await db.get("SELECT * FROM habit_logs WHERE id = ?", logId);
  res.json({ ...row2, completedBoolean: !!row2.completedBoolean });
};

export const deleteLog: RequestHandler = async (req, res) => {
  const { userId, habitId, logId } = req.params;
  const row = await db.get(
    "SELECT * FROM habit_logs WHERE id = ? AND habitId = ? AND userId = ?",
    logId,
    habitId,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  await db.run("DELETE FROM habit_logs WHERE id = ?", logId);
  res.status(204).send();
};
