import type { RequestHandler } from "express";
import db from "../db";
import { v4 as uuidv4 } from "uuid";

export const registerDevice: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const data = req.body || {};
  if (!data.pushToken)
    return res.status(400).json({ message: "Missing pushToken" });
  const id = uuidv4();
  const now = new Date().toISOString();
  await db.run(
    "INSERT INTO devices (id,userId,platform,pushToken,lastSeenAt,createdAt) VALUES (?,?,?,?,?,?)",
    id,
    userId,
    data.platform || null,
    data.pushToken,
    now,
    now,
  );
  const row = await db.get("SELECT * FROM devices WHERE id = ?", id);
  res.status(201).json(row);
};

export const unregisterDevice: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const id = req.params.id;
  const row = await db.get(
    "SELECT * FROM devices WHERE id = ? AND userId = ?",
    id,
    userId,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  await db.run("DELETE FROM devices WHERE id = ?", id);
  res.status(204).send();
};

export const listDevices: RequestHandler = async (req, res) => {
  const userId = req.params.userId;
  const rows = await db.all(
    "SELECT id,platform,pushToken,lastSeenAt,createdAt FROM devices WHERE userId = ?",
    userId,
  );
  res.json(rows);
};
