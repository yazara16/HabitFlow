import type { RequestHandler } from "express";
import  prisma  from "../db"; 

export const getGoals: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid userId" });

    const goals = await prisma.goal.findMany({
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
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid userId" });

    const goalData = req.body;

    const goal = await prisma.goal.create({
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
    const userId = Number(req.params.userId);
    const goalId = Number(req.params.goalId);
    if (isNaN(userId) || isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid userId or goalId" });
    }

    const updateData = req.body;

    const goal = await prisma.goal.update({
      where: { id: goalId },
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
    const userId = Number(req.params.userId);
    const goalId = Number(req.params.goalId);
    if (isNaN(userId) || isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid userId or goalId" });
    }

    await prisma.goal.delete({ where: { id: goalId } });
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGoalProgress: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const goalId = Number(req.params.goalId);
    if (isNaN(userId) || isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid userId or goalId" });
    }

    const progress = await prisma.progressEntry.findMany({
      where: { userId, goalId },
      orderBy: { date: 'desc' },
      take: 30
    });

    res.json(progress);
  } catch (error) {
    console.error("Error fetching goal progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
