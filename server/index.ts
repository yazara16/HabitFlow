import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { registerHandler, loginHandler, googleMockHandler, getUserHandler, updateUserHandler } from "./routes/auth";
import { requireAuth } from './middleware/auth';
import { getHabitsHandler, createHabitHandler, updateHabitHandler, deleteHabitHandler } from "./routes/habits";
import { listUsers, listHabits, dbStats } from "./routes/debug";
import { listNotifications, createNotification, markAsRead, markAllRead, deleteNotification } from "./routes/notifications";
import { listReminders, createReminder, updateReminder, deleteReminder } from "./routes/reminders";
import { listCatalog, getUserAchievements, unlockAchievement, seedCatalog } from "./routes/achievements";
import { registerDevice, unregisterDevice, listDevices } from "./routes/devices";
import { listNotifications, createNotification, markAsRead, markAllRead, deleteNotification } from "./routes/notifications";
import { listReminders, createReminder, updateReminder, deleteReminder } from "./routes/reminders";
import { listCatalog, getUserAchievements, unlockAchievement, seedCatalog } from "./routes/achievements";
import { registerDevice, unregisterDevice, listDevices } from "./routes/devices";
import { listLogs, createLog, updateLog, deleteLog } from "./routes/habit_logs";
import { listOverrides, createOverride, deleteOverride } from "./routes/overrides";
import { getSettings, upsertSettings } from "./routes/settings";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post('/api/register', registerHandler);
  app.post('/api/login', loginHandler);
  // OAuth (Google) - redirect to provider
  app.get('/api/auth/google', (req,res)=>{ try { const { googleRedirect } = require('./routes/google_oauth'); return googleRedirect(req,res); } catch(e){ return res.status(500).json({error:String(e)}); } });
  app.get('/api/auth/google/callback', (req,res)=>{ try { const { googleCallback } = require('./routes/google_oauth'); return googleCallback(req,res); } catch(e){ return res.status(500).json({error:String(e)}); } });
  app.get('/api/me', requireAuth, (req,res)=>{ try { const uid = req.authUserId; const row = require('./db').default.prepare('SELECT id,name,email,photoUrl,createdAt FROM users WHERE id = ?').get(uid); return res.json(row); } catch(e){ return res.status(500).json({error:String(e)}); } });
  app.get('/api/users/:id', getUserHandler);
  app.put('/api/users/:id', requireAuth, updateUserHandler);

  // Habits
  app.get('/api/users/:userId/habits', getHabitsHandler);
  app.post('/api/users/:userId/habits', createHabitHandler);
  app.put('/api/users/:userId/habits/:habitId', updateHabitHandler);
  app.delete('/api/users/:userId/habits/:habitId', deleteHabitHandler);

  // Debug (dev-only)
  app.get('/api/debug/users', listUsers);
  app.get('/api/debug/habits', listHabits);
  app.get('/api/debug/stats', dbStats);

  // Notifications
  app.get('/api/users/:userId/notifications', listNotifications);
  app.post('/api/users/:userId/notifications', createNotification);
  app.post('/api/users/:userId/notifications/mark_all', markAllRead);
  app.put('/api/users/:userId/notifications/:id/read', markAsRead);
  app.delete('/api/users/:userId/notifications/:id', deleteNotification);

  // Reminders
  app.get('/api/users/:userId/reminders', listReminders);
  app.post('/api/users/:userId/reminders', createReminder);
  app.put('/api/users/:userId/reminders/:id', updateReminder);
  app.delete('/api/users/:userId/reminders/:id', deleteReminder);

  // Achievements
  app.get('/api/achievements', listCatalog);
  app.post('/api/achievements/seed', seedCatalog);
  app.get('/api/users/:userId/achievements', getUserAchievements);
  app.post('/api/users/:userId/achievements', unlockAchievement);

  // Devices
  app.get('/api/users/:userId/devices', listDevices);
  app.post('/api/users/:userId/devices', registerDevice);
  app.delete('/api/users/:userId/devices/:id', unregisterDevice);

  // Admin middleware (simple token check)
  const adminToken = process.env.ADMIN_TOKEN || 'CHANGE_ME_ADMIN_TOKEN';
  const requireAdmin = (req: any, res: any, next: any) => {
    const auth = req.headers.authorization || req.query.admin_token;
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    let token = auth;
    if (auth.startsWith('Bearer ')) token = auth.slice(7);
    if (token !== adminToken) return res.status(403).json({ message: 'Forbidden' });
    next();
  };

  // Worker (admin) - protected
  app.post('/api/admin/run_worker', requireAdmin, (req, res) => { try { const { runWorker } = require('./routes/worker'); return runWorker(req, res); } catch (e) { res.status(500).json({ error: 'worker failed', details: String(e) }); } });

  // Habit logs
  app.get('/api/users/:userId/habits/:habitId/logs', listLogs);
  app.post('/api/users/:userId/habits/:habitId/logs', createLog);
  app.put('/api/users/:userId/habits/:habitId/logs/:logId', updateLog);
  app.delete('/api/users/:userId/habits/:habitId/logs/:logId', deleteLog);

  // Overrides
  app.get('/api/users/:userId/habits/:habitId/overrides', listOverrides);
  app.post('/api/users/:userId/habits/:habitId/overrides', createOverride);
  app.delete('/api/users/:userId/habits/:habitId/overrides/:overrideId', deleteOverride);

  // User settings
  app.get('/api/users/:userId/settings', getSettings);
  app.put('/api/users/:userId/settings', upsertSettings);

  return app;
}

// If executed directly (node tsx server/index.ts), start listening
if (process.argv[1] && process.argv[1].endsWith('server/index.ts')) {
  const app = createServer();
  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}
