import type { RequestHandler } from "express";
import db from "../db";

export const listNotifications: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createNotification: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { type, title, message, metadata } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });

    res.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const id = Number(req.params.id);

    const notification = await db.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllRead: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    await db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const id = Number(req.params.id);

    await db.notification.delete({
      where: { id }
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
