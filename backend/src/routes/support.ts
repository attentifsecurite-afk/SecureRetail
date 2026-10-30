import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { tickets, ticketMessages } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const supportRouter = Router();

supportRouter.use(authenticate);

const createTicketSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  category: z.enum(['technique', 'facturation', 'general', 'bug', 'feature']),
});

const createMessageSchema = z.object({
  message: z.string().min(1),
});

// Get all tickets
supportRouter.get('/tickets', asyncHandler(async (req: AuthRequest, res) => {
  const { status, priority } = req.query;
  
  let allTickets = await db.query.tickets.findMany({
    orderBy: [desc(tickets.createdAt)],
  });
  
  // If not admin, only show user's tickets
  if (req.user!.role !== 'admin') {
    allTickets = allTickets.filter(t => t.userId === req.user!.id);
  }
  
  if (status) {
    allTickets = allTickets.filter(t => t.status === status);
  }
  if (priority) {
    allTickets = allTickets.filter(t => t.priority === priority);
  }

  res.json({
    success: true,
    data: allTickets,
  });
}));

// Get ticket by ID
supportRouter.get('/tickets/:id', asyncHandler(async (req: AuthRequest, res) => {
  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parseInt(req.params.id)),
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Check permission
  if (req.user!.role !== 'admin' && ticket.userId !== req.user!.id) {
    throw new AppError('Access denied', 403);
  }

  // Get messages
  const messages = await db.query.ticketMessages.findMany({
    where: eq(ticketMessages.ticketId, ticket.id),
    orderBy: [ticketMessages.createdAt],
  });

  res.json({
    success: true,
    data: { ...ticket, messages },
  });
}));

// Create ticket
supportRouter.post('/tickets', asyncHandler(async (req: AuthRequest, res) => {
  const validatedData = createTicketSchema.parse(req.body);

  // Generate ticket number
  const ticketNumber = `TK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const [ticket] = await db.insert(tickets).values({
    ...validatedData,
    ticketNumber,
    userId: req.user!.id,
  }).returning();

  // Create initial message
  await db.insert(ticketMessages).values({
    ticketId: ticket.id,
    userId: req.user!.id,
    message: validatedData.description,
    isStaff: false,
  });

  res.status(201).json({
    success: true,
    data: ticket,
  });
}));

// Add message to ticket
supportRouter.post('/tickets/:id/messages', asyncHandler(async (req: AuthRequest, res) => {
  const validatedData = createMessageSchema.parse(req.body);
  const ticketId = parseInt(req.params.id);

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Check permission
  if (req.user!.role !== 'admin' && ticket.userId !== req.user!.id) {
    throw new AppError('Access denied', 403);
  }

  const isStaff = req.user!.role === 'admin' || req.user!.role === 'manager';

  const [message] = await db.insert(ticketMessages).values({
    ticketId,
    userId: req.user!.id,
    message: validatedData.message,
    isStaff,
  }).returning();

  // Update ticket
  await db.update(tickets)
    .set({
      messagesCount: ticket.messagesCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, ticketId));

  // Emit real-time message via WebSocket
  const io = req.app.get('io');
  io.to(`ticket-${ticketId}`).emit('new-message', message);

  res.status(201).json({
    success: true,
    data: message,
  });
}));

// Update ticket status
supportRouter.patch('/tickets/:id/status', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { status, assignedTo, satisfaction } = req.body;

  const [updatedTicket] = await db.update(tickets)
    .set({
      status,
      assignedTo,
      satisfaction,
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, parseInt(req.params.id)))
    .returning();

  if (!updatedTicket) {
    throw new AppError('Ticket not found', 404);
  }

  res.json({
    success: true,
    data: updatedTicket,
  });
}));

// Rate ticket
supportRouter.post('/tickets/:id/rate', asyncHandler(async (req: AuthRequest, res) => {
  const { satisfaction } = req.body;

  if (satisfaction < 1 || satisfaction > 5) {
    throw new AppError('Satisfaction must be between 1 and 5', 400);
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parseInt(req.params.id)),
  });

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  // Only ticket owner can rate
  if (ticket.userId !== req.user!.id) {
    throw new AppError('Access denied', 403);
  }

  const [updatedTicket] = await db.update(tickets)
    .set({ satisfaction, updatedAt: new Date() })
    .where(eq(tickets.id, ticket.id))
    .returning();

  res.json({
    success: true,
    data: updatedTicket,
  });
}));

// Get support statistics
supportRouter.get('/stats', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const allTickets = await db.query.tickets.findMany();

  const open = allTickets.filter(t => t.status === 'ouvert');
  const inProgress = allTickets.filter(t => t.status === 'en_cours');
  const resolved = allTickets.filter(t => t.status === 'resolu');

  const ratedTickets = allTickets.filter(t => t.satisfaction !== null);
  const avgSatisfaction = ratedTickets.length > 0
    ? ratedTickets.reduce((sum, t) => sum + (t.satisfaction || 0), 0) / ratedTickets.length
    : 0;

  res.json({
    success: true,
    data: {
      total: allTickets.length,
      open: open.length,
      inProgress: inProgress.length,
      resolved: resolved.length,
      avgSatisfaction: avgSatisfaction.toFixed(1),
    },
  });
}));
