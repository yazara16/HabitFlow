import db from "../db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const registerHandler: RequestHandler = async (req, res) => {
  const { name, email, password, photoUrl } = req.body || {};
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  // Check existing
  const existing = await db.get(
    "SELECT id,email FROM users WHERE email = ?",
    email,
  );
  if (existing)
    return res.status(400).json({ message: "Email already registered" });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 8);
  const createdAt = new Date().toISOString();
  await db.run(
    "INSERT INTO users (id,name,email,password,photoUrl,createdAt) VALUES (?,?,?,?,?,?)",
    id,
    name,
    email,
    hashed,
    photoUrl || null,
    createdAt,
  );

  // Seed default habits for new user based on preferences
  const prefs: string[] = req.body?.preferredCategories || [];
  const map: Record<string, any[]> = {
    exercise: [
      {
        name: "Correr 30 minutos",
        description: "Ejercicio cardiovascular matutino",
        category: "exercise",
        icon: "Dumbbell",
        color: "text-red-500 bg-red-500/10",
        target: 1,
        unit: "sesión",
        frequency: "daily",
        reminderTime: "07:00",
        reminderEnabled: 1,
      },
    ],
    hydration: [
      {
        name: "Beber 2 litros de agua",
        description: "Mantener hidratación óptima",
        category: "hydration",
        icon: "Droplets",
        color: "text-blue-500 bg-blue-500/10",
        target: 8,
        unit: "vasos",
        frequency: "daily",
        reminderTime: "09:00",
        reminderEnabled: 1,
      },
    ],
    finance: [
      {
        name: "Ahorrar $50 semanales",
        description: "Meta de ahorro para emergencias",
        category: "finance",
        icon: "DollarSign",
        color: "text-green-500 bg-green-500/10",
        target: 50,
        unit: "MXN",
        frequency: "weekly",
        reminderEnabled: 0,
      },
    ],
    shopping: [
      {
        name: "Lista de compras semanal",
        description: "Planificación de compras del hogar",
        category: "shopping",
        icon: "ShoppingCart",
        color: "text-orange-500 bg-orange-500/10",
        target: 1,
        unit: "lista",
        frequency: "weekly",
        reminderTime: "18:00",
        reminderEnabled: 1,
      },
    ],
    reading: [
      {
        name: "Leer 20 páginas",
        description: "Fomentar hábito de lectura",
        category: "reading",
        icon: "Book",
        color: "text-purple-500 bg-purple-500/10",
        target: 20,
        unit: "páginas",
        frequency: "daily",
        reminderTime: "21:00",
        reminderEnabled: 0,
      },
    ],
    study: [
      {
        name: "Estudiar 1 hora",
        description: "Tiempo de estudio concentrado",
        category: "study",
        icon: "BookOpen",
        color: "text-indigo-500 bg-indigo-500/10",
        target: 1,
        unit: "hora",
        frequency: "daily",
        reminderTime: "20:00",
        reminderEnabled: 0,
      },
    ],
    meditation: [
      {
        name: "Meditar 15 minutos",
        description: "Práctica de mindfulness",
        category: "custom",
        icon: "Star",
        color: "text-teal-500 bg-teal-500/10",
        target: 1,
        unit: "sesión",
        frequency: "daily",
        reminderTime: "08:00",
        reminderEnabled: 0,
      },
    ],
    custom: [
      {
        name: "Hábito personal",
        description: "Crea tu propio hábito",
        category: "custom",
        icon: "Star",
        color: "text-gray-500 bg-gray-500/10",
        target: 1,
        unit: "sesión",
        frequency: "daily",
        reminderEnabled: 0,
      },
    ],
  };

  let defaultHabits: any[] = [];
  if (Array.isArray(prefs) && prefs.length > 0) {
    for (const p of prefs) {
      if (map[p]) defaultHabits = defaultHabits.concat(map[p]);
    }
  }
  if (defaultHabits.length === 0) {
    // fallback
    defaultHabits = [
      {
        name: "Correr 30 minutos",
        description: "Ejercicio cardiovascular matutino",
        category: "exercise",
        icon: "Dumbbell",
        color: "text-red-500 bg-red-500/10",
        target: 1,
        unit: "sesión",
        frequency: "daily",
        reminderTime: "07:00",
        reminderEnabled: 1,
      },
      {
        name: "Beber 2 litros de agua",
        description: "Mantener hidratación óptima",
        category: "hydration",
        icon: "Droplets",
        color: "text-blue-500 bg-blue-500/10",
        target: 8,
        unit: "vasos",
        frequency: "daily",
        reminderTime: "09:00",
        reminderEnabled: 1,
      },
      {
        name: "Ahorrar $50 semanales",
        description: "Meta de ahorro para emergencias",
        category: "finance",
        icon: "DollarSign",
        color: "text-green-500 bg-green-500/10",
        target: 50,
        unit: "MXN",
        frequency: "weekly",
        reminderEnabled: 0,
      },
    ];
  }

  const now = new Date().toISOString();
  for (const h of defaultHabits) {
    const hid = uuidv4();
    await db.run(
      `INSERT INTO habits (id,userId,name,description,category,color,icon,target,completed,streak,frequency,monthlyDays,monthlyMonths,reminderTime,reminderEnabled,createdAt,lastCompleted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      hid,
      id,
      h.name,
      h.description || null,
      h.category || null,
      h.color || null,
      h.icon || null,
      h.target || 0,
      0,
      0,
      h.frequency || null,
      null,
      null,
      h.reminderTime || null,
      h.reminderEnabled ? 1 : 0,
      now,
      null,
    );
  }

  const user = await db.get(
    "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
    id,
  );
  // Sign JWT for session (if configured)
  let token: string | undefined = undefined;
  try {
    const { signToken } = require("../lib/jwt");
    token = signToken({ sub: user.id, email: user.email });
  } catch (e: any) {
    console.warn("Failed to sign JWT in registerHandler:", String(e));
  }
  return res.status(201).json({ user, token });
};

export const deleteUserHandler: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "Missing id" });

    // Delete related data
    const tables = [
      "user_settings",
      "reminders",
      "devices",
      "habit_overrides",
      "habit_logs",
      "user_achievements",
      "notifications",
      "habits",
    ];
    for (const t of tables) {
      await db.run(`DELETE FROM ${t} WHERE userId = ?`, id);
    }
    // Finally delete user
    await db.run("DELETE FROM users WHERE id = ?", id);
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("deleteUserHandler error:", e);
    return res.status(500).json({ message: String(e) });
  }
};

export const loginHandler: RequestHandler = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const row = await db.get("SELECT * FROM users WHERE email = ?", email);
  if (!row) return res.status(401).json({ message: "Invalid credentials" });
  const ok = bcrypt.compareSync(password, row.password || "");
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const user = {
    id: row.id,
    name: row.name,
    email: row.email,
    photoUrl: row.photoUrl,
    createdAt: row.createdAt,
  };
  // Sign JWT for session (if configured)
  let token: string | undefined = undefined;
  try {
    const { signToken } = require("../lib/jwt");
    token = signToken({ sub: user.id, email: user.email });
  } catch (e: any) {
    console.warn("Failed to sign JWT in loginHandler:", String(e));
  }
  return res.status(200).json({ user, token });
};

export const googleMockHandler: RequestHandler = async (req, res) => {
  const email = "demo-google@habitflow.app";
  let row = await db.get(
    "SELECT id,name,email,photoUrl,createdAt FROM users WHERE email = ?",
    email,
  );
  if (!row) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    await db.run(
      "INSERT INTO users (id,name,email,createdAt) VALUES (?,?,?,?)",
      id,
      "Usuario Google",
      email,
      createdAt,
    );
    row = await db.get(
      "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
      id,
    );
  }
  res.json(row);
};

export const getUserHandler: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const row = await db.get(
    "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
    id,
  );
  if (!row) return res.status(404).json({ message: "Not found" });
  res.json(row);
};

export const updateUserHandler: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const { name, photoUrl, email } = req.body || {};

  // If email is changing, ensure it's not already used
  if (email) {
    const existing = await db.get(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      email,
      id,
    );
    if (existing)
      return res.status(400).json({ message: "Email already in use" });
  }

  await db.run(
    "UPDATE users SET name = COALESCE(?, name), photoUrl = COALESCE(?, photoUrl), email = COALESCE(?, email) WHERE id = ?",
    name,
    photoUrl,
    email,
    id,
  );
  const row = await db.get(
    "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
    id,
  );
  res.json(row);
};
