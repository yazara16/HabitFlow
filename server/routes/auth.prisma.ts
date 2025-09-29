import type { RequestHandler } from "express";
import db from "../db";
import bcrypt from "bcryptjs";

export const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { name, email, password, photoUrl } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // Check existing user
    const existing = await db.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
    
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Create user
    const hashed = bcrypt.hashSync(password, 8);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashed,
        photoUrl: photoUrl || null,
      }
    });

    // Seed default habits for new user based on preferences
    const prefs: string[] = req.body?.preferredCategories || [];
    const defaultHabits = [];

    if (prefs.includes('exercise')) {
      defaultHabits.push({
        userId: user.id,
        name: "Correr 30 minutos",
        description: "Ejercicio cardiovascular matutino",
        category: "exercise",
        icon: "Dumbbell",
        color: "text-red-500 bg-red-500/10",
        target: 1,
        frequency: "daily",
        reminderTime: "07:00",
        reminderEnabled: true,
      });
    }

    if (prefs.includes('hydration')) {
      defaultHabits.push({
        userId: user.id,
        name: "Beber 2 litros de agua",
        description: "Mantener hidratación óptima",
        category: "hydration",
        icon: "Droplets",
        color: "text-blue-500 bg-blue-500/10",
        target: 8,
        frequency: "daily",
        reminderTime: "08:00",
        reminderEnabled: true,
      });
    }

    if (prefs.includes('mindfulness')) {
      defaultHabits.push({
        userId: user.id,
        name: "Meditación 10 minutos",
        description: "Práctica de mindfulness diaria",
        category: "mindfulness",
        icon: "Brain",
        color: "text-purple-500 bg-purple-500/10",
        target: 1,
        frequency: "daily",
        reminderTime: "09:00",
        reminderEnabled: true,
      });
    }

    if (prefs.includes('reading')) {
      defaultHabits.push({
        userId: user.id,
        name: "Leer 30 minutos",
        description: "Lectura diaria para el crecimiento personal",
        category: "reading",
        icon: "BookOpen",
        color: "text-green-500 bg-green-500/10",
        target: 1,
        frequency: "daily",
        reminderTime: "20:00",
        reminderEnabled: true,
      });
    }

    if (prefs.includes('sleep')) {
      defaultHabits.push({
        userId: user.id,
        name: "Dormir 8 horas",
        description: "Descanso adecuado para la salud",
        category: "sleep",
        icon: "Moon",
        color: "text-indigo-500 bg-indigo-500/10",
        target: 1,
        frequency: "daily",
        reminderTime: "22:00",
        reminderEnabled: true,
      });
    }

    // Create default habits
    if (defaultHabits.length > 0) {
      await db.habit.createMany({
        data: defaultHabits
      });
    }

    res.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, photoUrl: true }
    });

    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token (you'll need to implement this)
    const token = "temp-token"; // TODO: Implement JWT

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, photoUrl: true, createdAt: true }
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, photoUrl } = req.body || {};

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(photoUrl !== undefined && { photoUrl }),
      },
      select: { id: true, name: true, email: true, photoUrl: true, createdAt: true }
    });

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleMockHandler: RequestHandler = (req, res) => {
  // Mock Google OAuth handler
  res.json({ message: "Google OAuth not implemented yet" });
};

export const deleteUserHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero, eliminar datos dependientes si tienes relaciones (habits, logs, etc.)
    // Ejemplo rápido usando db (ajusta según tus modelos y relaciones)
    await db.habit.deleteMany({ where: { userId: Number(id) } });
    await db.habitLog.deleteMany({ where: { userId: Number(id) } });
    await db.habitOverride.deleteMany({ where: { userId: Number(id) } });
    await db.notification.deleteMany({ where: { userId: Number(id) } });
    await db.reminder.deleteMany({ where: { userId: Number(id) } });
    await db.goal.deleteMany({ where: { userId: Number(id) } });
    await db.progressEntry.deleteMany({ where: { userId: Number(id) } });
    await db.streakRecord.deleteMany({ where: { userId: Number(id) } });
    await db.userAchievement.deleteMany({ where: { userId: Number(id) } });
    await db.category.deleteMany({ where: { userId: Number(id) } });
    await db.theme.deleteMany({ where: { userId: Number(id) } });
    await db.userSettings.deleteMany({ where: { userId: Number(id) } });

    // Finalmente eliminar el usuario
    await db.user.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};