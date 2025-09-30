import type { RequestHandler } from 'express';
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';

// Registrar un dispositivo
export const registerDevice: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const data = req.body || {};
    if (!data.pushToken) return res.status(400).json({ message: 'Missing pushToken' });

    const id = uuidv4();
    const now = new Date();

    const device = await prisma.device.create({
      data: {
        id,                // UUID string
        userId,            // number
        platform: data.platform || null,
        pushToken: data.pushToken,
        lastSeenAt: now,
        createdAt: now,
      },
    });

    res.status(201).json(device);
  } catch (error) {
    console.error('Error registering device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Eliminar un dispositivo
export const unregisterDevice: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id; // string UUID
    // Verificar existencia
    const existing = await prisma.device.findUnique({
      where: { id },
    });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    await prisma.device.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error unregistering device:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Listar dispositivos de un usuario
export const listDevices: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ message: 'Invalid userId' });

    const devices = await prisma.device.findMany({
      where: { userId },
      select: { id: true, platform: true, pushToken: true, lastSeenAt: true, createdAt: true },
    });

    res.json(devices);
  } catch (error) {
    console.error('Error listing devices:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
