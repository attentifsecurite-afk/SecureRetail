import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { alarms } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const alarmsRouter = Router();

alarmsRouter.use(authenticate);

const createAlarmSchema = z.object({
  siteId: z.number().int().positive(),
  zone: z.string().min(1),
  type: z.string().min(1),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  associatedCamera: z.string().optional(),
});

const updateAlarmSchema = z.object({
  status: z.enum(['active', 'en_traitement', 'levee', 'fausse']).optional(),
  doubtRaised: z.boolean().optional(),
});

// Get all alarms
alarmsRouter.get('/', asyncHandler(async (req, res) => {
  const { siteId, status, priority } = req.query;

  let allAlarms = await db.query.alarms.findMany({
    orderBy: [desc(alarms.timestamp)],
  });

  if (siteId) {
    allAlarms = allAlarms.filter(a => a.siteId === parseInt(siteId as string));
  }
  if (status) {
    allAlarms = allAlarms.filter(a => a.status === status);
  }
  if (priority) {
    allAlarms = allAlarms.filter(a => a.priority === priority);
  }

  res.json({
    success: true,
    data: allAlarms,
  });
}));

// Get alarm by ID
alarmsRouter.get('/:id', asyncHandler(async (req, res) => {
  const alarm = await db.query.alarms.findFirst({
    where: eq(alarms.id, parseInt(req.params.id)),
  });

  if (!alarm) {
    throw new AppError('Alarm not found', 404);
  }

  res.json({
    success: true,
    data: alarm,
  });
}));

// Create alarm
alarmsRouter.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const validatedData = createAlarmSchema.parse(req.body);

  const [alarm] = await db.insert(alarms).values(validatedData).returning();

  // Emit real-time alarm via WebSocket
  const io = req.app.get('io');
  io.to(`site-${alarm.siteId}`).emit('new-alarm', alarm);

  // If critical, emit to all admins
  if (alarm.priority === 'critique') {
    io.to('admins').emit('critical-alarm', alarm);
  }

  res.status(201).json({
    success: true,
    data: alarm,
  });
}));

// Update alarm
alarmsRouter.put('/:id', asyncHandler(async (req, res) => {
  const validatedData = updateAlarmSchema.parse(req.body);

  const updateData: any = { ...validatedData };
  
  if (['levee', 'fausse'].includes(validatedData.status || '')) {
    updateData.resolvedAt = new Date();
  }

  const [updatedAlarm] = await db.update(alarms)
    .set(updateData)
    .where(eq(alarms.id, parseInt(req.params.id)))
    .returning();

  if (!updatedAlarm) {
    throw new AppError('Alarm not found', 404);
  }

  // Emit real-time update via WebSocket
  const io = req.app.get('io');
  io.to(`site-${updatedAlarm.siteId}`).emit('alarm-updated', updatedAlarm);

  res.json({
    success: true,
    data: updatedAlarm,
  });
}));

// Get active alarms
alarmsRouter.get('/active/all', asyncHandler(async (req, res) => {
  const activeAlarms = await db.query.alarms.findMany({
    where: eq(alarms.status, 'active'),
    orderBy: [desc(alarms.timestamp)],
  });

  res.json({
    success: true,
    data: activeAlarms,
  });
}));

// Get alarms by site
alarmsRouter.get('/site/:siteId', asyncHandler(async (req, res) => {
  const siteAlarms = await db.query.alarms.findMany({
    where: eq(alarms.siteId, parseInt(req.params.siteId)),
    orderBy: [desc(alarms.timestamp)],
  });

  res.json({
    success: true,
    data: siteAlarms,
  });
}));
