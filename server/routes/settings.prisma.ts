import type { RequestHandler } from "express";
import db from "../db";

export const getSettings: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const settings = await db.userSettings.findUnique({
      where: { userId }
    });

    const defaultSettings = {
      theme: 'system',
      notifications: true,
      reminders: true,
      weeklyReport: true,
      language: 'es'
    };

    const userSettings = settings ? {
      ...defaultSettings,
      ...JSON.parse(settings.settings || '{}')
    } : defaultSettings;

    res.json(userSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertSettings: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const settingsData = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const settings = await db.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        settings: JSON.stringify(settingsData),
        updatedAt: new Date()
      },
      update: {
        settings: JSON.stringify(settingsData),
        updatedAt: new Date()
      }
    });

    res.json({ message: "Settings updated successfully", settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
