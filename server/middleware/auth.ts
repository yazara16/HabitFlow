import type { RequestHandler } from "express";
import db from "../db"; // PrismaClient
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Registrar usuario
export const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, photoUrl, preferredCategories } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // Verificar si ya existe el email
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Crear usuario
    const hashed = bcrypt.hashSync(password, 8);
    const user = await db.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashed,
        photoUrl: photoUrl || null,
        createdAt: new Date(),
      }
    });

    // Crear hábitos por defecto según preferencias
    const prefs: string[] = preferredCategories || [];
    const defaultHabits: any[] = [];

    if (prefs.includes('exercise')) defaultHabits.push({
      userId: user.id, name: "Correr 30 minutos", description: "Ejercicio cardiovascular matutino",
      category: "exercise", icon: "Dumbbell", color: "text-red-500 bg-red-500/10",
      target: 1, frequency: "daily", reminderTime: "07:00", reminderEnabled: true
    });
    if (prefs.includes('hydration')) defaultHabits.push({
      userId: user.id, name: "Beber 2 litros de agua", description: "Mantener hidratación óptima",
      category: "hydration", icon: "Droplets", color: "text-blue-500 bg-blue-500/10",
      target: 8, frequency: "daily", reminderTime: "09:00", reminderEnabled: true
    });
    // Puedes agregar los demás hábitos igual que arriba

    if (defaultHabits.length > 0) {
      await db.habit.createMany({ data: defaultHabits });
    }

    res.status(201).json({ user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login
export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, photoUrl: true }
    });
    if (!user || !user.password) return res.status(401).json({ message: "Invalid credentials" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    // TODO: Implementar JWT
    const token = "temp-token";

    res.json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Obtener usuario por id
export const getUserHandler: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, photoUrl: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Actualizar usuario
export const updateUserHandler: RequestHandler = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, photoUrl } = req.body || {};

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(photoUrl !== undefined && { photoUrl })
      }
    });
    res.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
