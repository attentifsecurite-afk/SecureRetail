import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { events } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const eventsRouter = Router();

eventsRouter.use(authenticate);

const createEventSchema = z.object({
  siteId: z.number().int().positive(),
  type: z.string().min(1),
  category: z.string().min(1),
  zone: z.string().min(1),
  severity: z.enum(['info', 'basse', 'moyenne', 'haute', 'critique']),
  description: z.string().min(1),
  createdBy: z.string().min(1),
  assignedTo: z.number().int().positive().optional(),
});

const updateEventSchema = z.object({
  status: z.enum(['ouvert', 'en_cours', 'cloture']).optional(),
  assignedTo: z.number().int().positive().optional(),
});

// Get all events
eventsRouter.get('/', asyncHandler(async (req, res) => {
  const { siteId, status, severity } = req.query;

  let allEvents = await db.query.events.findMany({
    orderBy: [desc(events.timestamp)],
  });

  if (siteId) {
    allEvents = allEvents.filter(e => e.siteId === parseInt(siteId as string));
  }
  if (status) {
    allEvents = allEvents.filter(e => e.status === status);
  }
  if (severity) {
    allEvents = allEvents.filter(e => e.severity === severity);
  }

  res.json({
    success: true,
    data: allEvents,
  });
}));

// Get event by ID
eventsRouter.get('/:id', asyncHandler(async (req, res) => {
  const event = await db.query.events.findFirst({
    where: eq(events.id, parseInt(req.params.id)),
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    data: event,
  });
}));

// Create event
eventsRouter.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const validatedData = createEventSchema.parse(req.body);

  const [event] = await db.insert(events).values(validatedData).returning();

  // Emit real-time event via WebSocket
  const io = req.app.get('io');
  io.to(`site-${event.siteId}`).emit('new-event', event);

  res.status(201).json({
    success: true,
    data: event,
  });
}));

// Update event
eventsRouter.put('/:id', asyncHandler(async (req, res) => {
  const validatedData = updateEventSchema.parse(req.body);

  const updateData: any = { ...validatedData, updatedAt: new Date() };
  
  if (validatedData.status === 'cloture') {
    updateData.closedAt = new Date();
  }

  const [updatedEvent] = await db.update(events)
    .set(updateData)
    .where(eq(events.id, parseInt(req.params.id)))
    .returning();

  if (!updatedEvent) {
    throw new AppError('Event not found', 404);
  }

  // Emit real-time update via WebSocket
  const io = req.app.get('io');
  io.to(`site-${updatedEvent.siteId}`).emit('event-updated', updatedEvent);

  res.json({
    success: true,
    data: updatedEvent,
  });
}));

// Delete event
eventsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const [deletedEvent] = await db.delete(events)
    .where(eq(events.id, parseInt(req.params.id)))
    .returning();

  if (!deletedEvent) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    message: 'Event deleted successfully',
  });
}));

// Get events by site
eventsRouter.get('/site/:siteId', asyncHandler(async (req, res) => {
  const siteEvents = await db.query.events.findMany({
    where: eq(events.siteId, parseInt(req.params.siteId)),
    orderBy: [desc(events.timestamp)],
  });

  res.json({
    success: true,
    data: siteEvents,
  });
}));
