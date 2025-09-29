import "dotenv/config";
import express from "express";
import cors from "cors";

export function createTempServer() {
  const app = express();

  // Security: restrict CORS to front-end origin if provided and allow credentials for cookie usage
  const FRONTEND = process.env.FRONTEND_URL || "http://localhost:8080";
  app.use(cors({ origin: FRONTEND, credentials: true }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", (_req, res) => {
    res.json({ message: "Demo endpoint working - database temporarily disabled" });
  });

  // Placeholder routes for development
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.json({ 
        message: "API endpoint temporarily disabled", 
        path: req.path,
        note: "Database bindings issue - install Visual Studio Build Tools to fix"
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });

  app.post("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.json({ 
        message: "API endpoint temporarily disabled", 
        path: req.path,
        note: "Database bindings issue - install Visual Studio Build Tools to fix"
      });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  });

  return app;
}
