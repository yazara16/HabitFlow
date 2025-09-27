import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { registerHandler, loginHandler, googleMockHandler, getUserHandler, updateUserHandler } from "./routes/auth";
import { getHabitsHandler, createHabitHandler, updateHabitHandler, deleteHabitHandler } from "./routes/habits";
import { listUsers, listHabits, dbStats } from "./routes/debug";

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
  app.post('/api/auth/google', googleMockHandler);
  app.get('/api/users/:id', getUserHandler);
  app.put('/api/users/:id', updateUserHandler);

  // Habits
  app.get('/api/users/:userId/habits', getHabitsHandler);
  app.post('/api/users/:userId/habits', createHabitHandler);
  app.put('/api/users/:userId/habits/:habitId', updateHabitHandler);
  app.delete('/api/users/:userId/habits/:habitId', deleteHabitHandler);

  return app;
}
