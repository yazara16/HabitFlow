import type { RequestHandler } from "express";
import db from "../db";

export const getGoals: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const goals = await db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createGoal: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const goalData = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const goal = await db.goal.create({
      data: {
        userId,
        title: goalData.title,
        description: goalData.description || null,
        category: goalData.category || 'general',
        targetValue: goalData.targetValue || 0,
        currentValue: goalData.currentValue || 0,
        deadline: goalData.deadline ? new Date(goalData.deadline) : null,
        status: goalData.status || 'active',
        priority: goalData.priority || 'medium',
        color: goalData.color || '#3b82f6',
        icon: goalData.icon || 'target'
      }
    });

    res.status(201).json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateGoal: RequestHandler = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const updateData = req.body;
    
    if (!userId || !goalId) {
      return res.status(400).json({ message: "User ID and Goal ID are required" });
    }

    const goal = await db.goal.update({
      where: { 
        id: goalId,
        userId // Ensure user owns this goal
      },
      data: {
        title: updateData.title,
        description: updateData.description,
        category: updateData.category,
        targetValue: updateData.targetValue,
        currentValue: updateData.currentValue,
        deadline: updateData.deadline ? new Date(updateData.deadline) : undefined,
        status: updateData.status,
        priority: updateData.priority,
        color: updateData.color,
        icon: updateData.icon
      }
    });

    res.json(goal);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGoal: RequestHandler = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    
    if (!userId || !goalId) {
      return res.status(400).json({ message: "User ID and Goal ID are required" });
    }

    await db.goal.delete({
      where: { 
        id: goalId,
        userId // Ensure user owns this goal
      }
    });

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGoalProgress: RequestHandler = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    
    if (!userId || !goalId) {
      return res.status(400).json({ message: "User ID and Goal ID are required" });
    }

    const progress = await db.progressEntry.findMany({
      where: { 
        userId,
        goalId
      },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 entries
    });

    res.json(progress);
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
