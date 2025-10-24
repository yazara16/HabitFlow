import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

// Routes
import { handleDemo } from "./routes/demo";
import {
  registerHandler,
  loginHandler,
  googleMockHandler,
  getUserHandler,
  updateUserHandler,
} from "./routes/auth";

import {
  getHabitsHandler,
  createHabitHandler,
  updateHabitHandler,
  deleteHabitHandler,
} from "./routes/habits";

import { listUsers, listHabits, dbStats } from "./routes/debug";

import {
  listNotifications,
  createNotification,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "./routes/notifications";

import {
  listReminders,
  createReminder,
  updateReminder,
  deleteReminder,
} from "./routes/reminders";

import {
  listCatalog,
  getUserAchievements,
  unlockAchievement,
  seedCatalog,
} from "./routes/achievements";

import {
  registerDevice,
  unregisterDevice,
  listDevices,
} from "./routes/devices";

import { listLogs, createLog, updateLog, deleteLog } from "./routes/habit_logs";
import {
  listOverrides,
  createOverride,
  deleteOverride,
} from "./routes/overrides";
import { getSettings, upsertSettings } from "./routes/settings";
import { getDashboardStats } from "./routes/dashboard";
import { getCalendarData } from "./routes/calendar";
import { createBackup } from "./routes/backup";
import { deleteUserHandler } from "./routes/auth";

// Middleware
import { requireAuth } from "./middleware/auth";

// Database
import db from "./db";

export function createServer() {
  const app = express();

  // Security: restrict CORS to front-end origin if provided and allow credentials for cookie usage
  const FRONTEND = process.env.FRONTEND_URL || "http://localhost:8080";
  app.use(cors({ origin: FRONTEND, credentials: true }));

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; script-src 'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self';",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
    if (process.env.NODE_ENV === "production") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }
    next();
  });

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CSRF middleware (optional)
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

  // Helper: ensure authenticated user matches :userId param for user-scoped routes
  const requireOwner = (req: any, res: any, next: any) => {
    const paramId = req.params.userId || req.params.id;
    if (!req.authUserId)
      return res.status(401).json({ message: "Unauthorized" });
    if (paramId && req.authUserId !== paramId)
      return res.status(403).json({ message: "Forbidden" });
    next();
  };

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/register", registerHandler);
  app.post("/api/login", loginHandler);
  app.get("/api/auth/google", (req, res) => {
    try {
      const { googleRedirect } = require("./routes/google_oauth");
      return googleRedirect(req, res);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });
  app.get("/api/auth/google/callback", (req, res) => {
    try {
      const { googleCallback } = require("./routes/google_oauth");
      return googleCallback(req, res);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const uid = req.authUserId;
      const row = await db.get(
        "SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?",
        uid,
      );
      return res.json(row);
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });

  app.get("/api/users/:id", getUserHandler);
  app.put("/api/users/:id", requireAuth, requireOwner, updateUserHandler);

  // Habits
  app.get(
    "/api/users/:userId/habits",
    requireAuth,
    requireOwner,
    getHabitsHandler,
  );
  app.post(
    "/api/users/:userId/habits",
    requireAuth,
    requireOwner,
    createHabitHandler,
  );
  app.put(
    "/api/users/:userId/habits/:habitId",
    requireAuth,
    requireOwner,
    updateHabitHandler,
  );
  app.delete(
    "/api/users/:userId/habits/:habitId",
    requireAuth,
    requireOwner,
    deleteHabitHandler,
  );

  // Dashboard
  app.get(
    "/api/users/:userId/dashboard",
    requireAuth,
    requireOwner,
    getDashboardStats,
  );

  // Calendar
  app.get(
    "/api/users/:userId/calendar",
    requireAuth,
    requireOwner,
    getCalendarData,
  );

  // Debug
  app.get("/api/debug/users", listUsers);
  app.get("/api/debug/habits", listHabits);
  app.get("/api/debug/stats", dbStats);

  // Notifications
  app.get(
    "/api/users/:userId/notifications",
    requireAuth,
    requireOwner,
    listNotifications,
  );
  app.post(
    "/api/users/:userId/notifications",
    requireAuth,
    requireOwner,
    createNotification,
  );
  app.post(
    "/api/users/:userId/notifications/mark_all",
    requireAuth,
    requireOwner,
    markAllRead,
  );
  app.put(
    "/api/users/:userId/notifications/:id/read",
    requireAuth,
    requireOwner,
    markAsRead,
  );
  app.delete(
    "/api/users/:userId/notifications/:id",
    requireAuth,
    requireOwner,
    deleteNotification,
  );

  // Reminders
  app.get(
    "/api/users/:userId/reminders",
    requireAuth,
    requireOwner,
    listReminders,
  );
  app.post(
    "/api/users/:userId/reminders",
    requireAuth,
    requireOwner,
    createReminder,
  );
  app.put(
    "/api/users/:userId/reminders/:id",
    requireAuth,
    requireOwner,
    updateReminder,
  );
  app.delete(
    "/api/users/:userId/reminders/:id",
    requireAuth,
    requireOwner,
    deleteReminder,
  );

  // Achievements
  app.get("/api/achievements", listCatalog);
  app.post("/api/achievements/seed", seedCatalog);
  app.get(
    "/api/users/:userId/achievements",
    requireAuth,
    requireOwner,
    getUserAchievements,
  );
  app.post(
    "/api/users/:userId/achievements",
    requireAuth,
    requireOwner,
    unlockAchievement,
  );

  // Devices
  app.get("/api/users/:userId/devices", requireAuth, requireOwner, listDevices);
  app.post(
    "/api/users/:userId/devices",
    requireAuth,
    requireOwner,
    registerDevice,
  );
  app.delete(
    "/api/users/:userId/devices/:id",
    requireAuth,
    requireOwner,
    unregisterDevice,
  );

  // Admin
  const adminToken = process.env.ADMIN_TOKEN || "CHANGE_ME_ADMIN_TOKEN";
  const requireAdmin = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization || req.query.admin_token;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    let token = auth;
    if (auth.startsWith("Bearer ")) token = auth.slice(7);
    if (token !== adminToken)
      return res.status(403).json({ message: "Forbidden" });
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

  // Habit logs
  app.get(
    "/api/users/:userId/habits/:habitId/logs",
    requireAuth,
    requireOwner,
    listLogs,
  );
  app.post(
    "/api/users/:userId/habits/:habitId/logs",
    requireAuth,
    requireOwner,
    createLog,
  );
  app.put(
    "/api/users/:userId/habits/:habitId/logs/:logId",
    requireAuth,
    requireOwner,
    updateLog,
  );
  app.delete(
    "/api/users/:userId/habits/:habitId/logs/:logId",
    requireAuth,
    requireOwner,
    deleteLog,
  );

  // Overrides
  app.get(
    "/api/users/:userId/habits/:habitId/overrides",
    requireAuth,
    requireOwner,
    listOverrides,
  );
  app.post(
    "/api/users/:userId/habits/:habitId/overrides",
    requireAuth,
    requireOwner,
    createOverride,
  );
  app.delete(
    "/api/users/:userId/habits/:habitId/overrides/:overrideId",
    requireAuth,
    requireOwner,
    deleteOverride,
  );

  // User settings
  app.get(
    "/api/users/:userId/settings",
    requireAuth,
    requireOwner,
    getSettings,
  );
  app.put(
    "/api/users/:userId/settings",
    requireAuth,
    requireOwner,
    upsertSettings,
  );

  // Backup
  app.post(
    "/api/users/:userId/backup",
    requireAuth,
    requireOwner,
    createBackup,
  );

  // Delete account
  app.delete("/api/users/:id", requireAuth, requireOwner, deleteUserHandler);

  return app;
}

// Start server if run directly
if (process.argv[1] && process.argv[1].endsWith("server/index.ts")) {
  const app = createServer();
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
