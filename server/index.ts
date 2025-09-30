import "dotenv/config";
import express from "express";
import cors from "cors";

// Auth routes
import {
  registerHandler,
  loginHandler,
  googleMockHandler,
  getUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "./routes/auth.prisma";

// Habits routes
import {
  getHabitsHandler,
  createHabitHandler,
  updateHabitHandler,
  deleteHabitHandler,
  completeHabitHandler,
} from "./routes/habits.prisma";

// Debug
import { listUsers, listHabits, dbStats } from "./routes/debug";

// Notifications
import {
  listNotifications,
  createNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "./routes/notifications.prisma";

// Reminders
import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "./routes/reminders.prisma";

// Settings
import { getSettings, upsertSettings } from "./routes/settings.prisma";

// Dashboard
import { getDashboardStats } from "./routes/dashboard.prisma";

// Goals
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
} from "./routes/goals.prisma";

// Achievements
import {
  getAchievements,
  unlockAchievement,
  checkAchievements,
} from "./routes/achievements.prisma";

// Streaks
import { getStreaks, updateStreak } from "./routes/streak.prisma";

// Habit Logs
import {
  createHabitLog,
  updateHabitLog,
  deleteHabitLog,
  getHabitLogs,
} from "./routes/habit-logs.prisma";

// Backup
import { createBackup } from "./routes/backup";

// Middleware
import { requireAuth } from "./middleware/auth.prisma";

// Database
import db from "./db";
import { getCalendarData } from "./routes/calendar.prisma";

export function createServer() {
  const app = express();

  // FRONTEND URL para CORS
  const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
  app.use(cors({ origin: FRONTEND, credentials: true }));

  // Security headers
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self';"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }
    next();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CSRF middleware
  try {
    const { ensureCsrfCookie, csrfProtection } = require("./middleware/csrf");
    app.use(ensureCsrfCookie);
    app.use(csrfProtection);
    app.get("/api/csrf", (req: any, res: any) => {
      res.json({ csrfToken: req.csrfToken || null });
    });
  } catch (e) {
    console.warn("Failed to initialize CSRF middleware", String(e));
  }

  const requireOwner = (req: any, res: any, next: any) => {
    const paramId = req.params.userId || req.params.id;
    if (!req.authUserId)
      return res.status(401).json({ message: "Unauthorized" });
    if (paramId && Number(req.authUserId) !== Number(paramId))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Auth
  app.post("/api/register", registerHandler);
  app.post("/api/login", loginHandler);
  app.get("/api/auth/google", googleMockHandler);

  // /api/me endpoint
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const uid = Number(req.authUserId);
      const user = await db.user.findUnique({
        where: { id: uid },
        select: {
          id: true,
          name: true,
          email: true,
          photoUrl: true,
          createdAt: true,
        },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Users
  app.get("/api/users/:id", getUserHandler);
  app.put("/api/users/:id", requireAuth, requireOwner, updateUserHandler);
  app.delete("/api/users/:id", requireAuth, requireOwner, deleteUserHandler);

  // Habits
  app.get("/api/users/:userId/habits", requireAuth, requireOwner, getHabitsHandler);
  app.post("/api/users/:userId/habits", requireAuth, requireOwner, createHabitHandler);
  app.put("/api/users/:userId/habits/:habitId", requireAuth, requireOwner, updateHabitHandler);
  app.delete("/api/users/:userId/habits/:habitId", requireAuth, requireOwner, deleteHabitHandler);
  app.post("/api/users/:userId/habits/:habitId/complete", requireAuth, requireOwner, completeHabitHandler);

  // Dashboard
  app.get("/api/users/:userId/dashboard", requireAuth, requireOwner, getDashboardStats);

  // Calendar
  app.get("/api/users/:userId/calendar", requireAuth, requireOwner, getCalendarData);

  // Debug
  app.get("/api/debug/users", listUsers);
  app.get("/api/debug/habits", listHabits);
  app.get("/api/debug/stats", dbStats);

  // Notifications
  app.get("/api/users/:userId/notifications", requireAuth, requireOwner, listNotifications);
  app.post("/api/users/:userId/notifications", requireAuth, requireOwner, createNotification);
  app.post("/api/users/:userId/notifications/mark_all", requireAuth, requireOwner, markAllRead);
  app.put("/api/users/:userId/notifications/:id/read", requireAuth, requireOwner, markAsRead);
  app.delete("/api/users/:userId/notifications/:id", requireAuth, requireOwner, deleteNotification);

  // Reminders
  app.get("/api/users/:userId/reminders", requireAuth, requireOwner, listReminders);
  app.post("/api/users/:userId/reminders", requireAuth, requireOwner, createReminder);
  app.put("/api/users/:userId/reminders/:id", requireAuth, requireOwner, updateReminder);
  app.delete("/api/users/:userId/reminders/:id", requireAuth, requireOwner, deleteReminder);

  // Goals & Progress
  app.get("/api/users/:userId/goals", requireAuth, requireOwner, getGoals);
  app.post("/api/users/:userId/goals", requireAuth, requireOwner, createGoal);
  app.put("/api/users/:userId/goals/:goalId", requireAuth, requireOwner, updateGoal);
  app.delete("/api/users/:userId/goals/:goalId", requireAuth, requireOwner, deleteGoal);
  app.get("/api/users/:userId/goals/:goalId/progress", requireAuth, requireOwner, getGoalProgress);

  // Achievements
  app.get("/api/users/:userId/achievements", requireAuth, requireOwner, getAchievements);
  app.post("/api/users/:userId/achievements/unlock", requireAuth, requireOwner, unlockAchievement);
  app.post("/api/users/:userId/achievements/check", requireAuth, requireOwner, checkAchievements);

  // Streaks
  app.get("/api/users/:userId/streaks", requireAuth, requireOwner, getStreaks);
  app.post("/api/users/:userId/streaks/update", requireAuth, requireOwner, updateStreak);

  // Habit Logs
  app.get("/api/users/:userId/habits/:habitId/logs", requireAuth, requireOwner, getHabitLogs);
  app.post("/api/users/:userId/habits/:habitId/logs", requireAuth, requireOwner, createHabitLog);
  app.put("/api/users/:userId/habits/:habitId/logs/:logId", requireAuth, requireOwner, updateHabitLog);
  app.delete("/api/users/:userId/habits/:habitId/logs/:logId", requireAuth, requireOwner, deleteHabitLog);

  // User settings
  app.get("/api/users/:userId/settings", requireAuth, requireOwner, getSettings);
  app.put("/api/users/:userId/settings", requireAuth, requireOwner, upsertSettings);

  // Backup
  app.post("/api/users/:userId/backup", requireAuth, requireOwner, createBackup);

  // Admin
  const adminToken = process.env.ADMIN_TOKEN || "CHANGE_ME_ADMIN_TOKEN";
  const requireAdmin = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization || req.query.admin_token;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    let token = auth;
    if (auth.startsWith("Bearer ")) token = auth.slice(7);
    if (token !== adminToken) return res.status(403).json({ message: "Forbidden" });
    next();
  };
  app.post("/api/admin/run_worker", requireAdmin, (req, res) => {
    try {
      const { runWorker } = require("./routes/worker");
      return runWorker(req, res);
    } catch (e) {
      res.status(500).json({ error: "worker failed", details: String(e) });
    }
  });

  return app;
}

// Start server if run directly
if (process.argv[1] && process.argv[1].endsWith("server/index.ts")) {
  const app = createServer();
  const port = 8080; // puerto fijo 8080
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
