import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { cameras } from '../database/schema.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const camerasRouter = Router();

camerasRouter.use(authenticate);

const createCameraSchema = z.object({
  siteId: z.number().int().positive(),
  name: z.string().min(1),
  location: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  type: z.enum(['ip_camera', 'dvr', 'nvr', 'access_control']),
  protocol: z.enum(['onvif', 'rtsp', 'http', 'https', 'proprietary']),
  ipAddress: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string().min(1),
  password: z.string().min(1),
  streamPath: z.string().min(1),
  resolution: z.string().optional(),
  fps: z.number().int().positive().optional(),
  macAddress: z.string().optional(),
  serialNumber: z.string().optional(),
  firmware: z.string().optional(),
});

const updateCameraSchema = createCameraSchema.partial();

// Get all cameras
camerasRouter.get('/', asyncHandler(async (req, res) => {
  const { siteId, status, type } = req.query;

  let query = db.query.cameras;

  const allCameras = await query.findMany();

  // Filter in memory (could be optimized with proper query building)
  let filteredCameras = allCameras;

  if (siteId) {
    filteredCameras = filteredCameras.filter(c => c.siteId === parseInt(siteId as string));
  }
  if (status) {
    filteredCameras = filteredCameras.filter(c => c.status === status);
  }
  if (type) {
    filteredCameras = filteredCameras.filter(c => c.type === type);
  }

  res.json({
    success: true,
    data: filteredCameras,
  });
}));

// Get camera by ID
camerasRouter.get('/:id', asyncHandler(async (req, res) => {
  const camera = await db.query.cameras.findFirst({
    where: eq(cameras.id, parseInt(req.params.id)),
  });

  if (!camera) {
    throw new AppError('Camera not found', 404);
  }

  res.json({
    success: true,
    data: camera,
  });
}));

// Create camera
camerasRouter.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = createCameraSchema.parse(req.body);

  const [camera] = await db.insert(cameras).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: camera,
  });
}));

// Update camera
camerasRouter.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = updateCameraSchema.parse(req.body);

  const [updatedCamera] = await db.update(cameras)
    .set({ ...validatedData, updatedAt: new Date() })
    .where(eq(cameras.id, parseInt(req.params.id)))
    .returning();

  if (!updatedCamera) {
    throw new AppError('Camera not found', 404);
  }

  res.json({
    success: true,
    data: updatedCamera,
  });
}));

// Delete camera
camerasRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const [deletedCamera] = await db.delete(cameras)
    .where(eq(cameras.id, parseInt(req.params.id)))
    .returning();

  if (!deletedCamera) {
    throw new AppError('Camera not found', 404);
  }

  res.json({
    success: true,
    message: 'Camera deleted successfully',
  });
}));

// Test camera connection
camerasRouter.post('/:id/test', asyncHandler(async (req, res) => {
  const camera = await db.query.cameras.findFirst({
    where: eq(cameras.id, parseInt(req.params.id)),
  });

  if (!camera) {
    throw new AppError('Camera not found', 404);
  }

  // Simulate connection test (in real implementation, would use ONVIF/RTSP)
  const isConnected = Math.random() > 0.2; // 80% success rate for demo

  if (isConnected) {
    await db.update(cameras)
      .set({
        status: 'online',
        lastSeen: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cameras.id, camera.id));
  } else {
    await db.update(cameras)
      .set({
        status: 'error',
        updatedAt: new Date(),
      })
      .where(eq(cameras.id, camera.id));
  }

  res.json({
    success: true,
    data: {
      connected: isConnected,
      status: isConnected ? 'online' : 'error',
      message: isConnected ? 'Connection successful' : 'Connection failed',
    },
  });
}));

// Get cameras by site
camerasRouter.get('/site/:siteId', asyncHandler(async (req, res) => {
  const siteCameras = await db.query.cameras.findMany({
    where: eq(cameras.siteId, parseInt(req.params.siteId)),
  });

  res.json({
    success: true,
    data: siteCameras,
  });
}));
