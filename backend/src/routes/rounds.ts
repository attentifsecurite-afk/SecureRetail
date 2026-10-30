import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { rounds } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const roundsRouter = Router();

roundsRouter.use(authenticate);

const createRoundSchema = z.object({
  siteId: z.number().int().positive(),
  agentId: z.number().int().positive(),
  circuit: z.string().min(1),
  type: z.enum(['perimetrique', 'fermeture', 'ouverture', 'exterieur', 'ssiap', 'dissuasion']),
  scheduledTime: z.string().min(1),
  controlPoints: z.number().int().positive(),
});

const updateRoundSchema = z.object({
  actualTime: z.string().optional(),
  status: z.enum(['planifiee', 'en_cours', 'terminee', 'manquee', 'incomplete']).optional(),
  scannedPoints: z.number().int().nonnegative().optional(),
  anomalies: z.number().int().nonnegative().optional(),
});

// Get all rounds
roundsRouter.get('/', asyncHandler(async (req, res) => {
  const { siteId, status, type } = req.query;

  let allRounds = await db.query.rounds.findMany({
    orderBy: [desc(rounds.createdAt)],
  });

  if (siteId) {
    allRounds = allRounds.filter(r => r.siteId === parseInt(siteId as string));
  }
  if (status) {
    allRounds = allRounds.filter(r => r.status === status);
  }
  if (type) {
    allRounds = allRounds.filter(r => r.type === type);
  }

  res.json({
    success: true,
    data: allRounds,
  });
}));

// Get round by ID
roundsRouter.get('/:id', asyncHandler(async (req, res) => {
  const round = await db.query.rounds.findFirst({
    where: eq(rounds.id, parseInt(req.params.id)),
  });

  if (!round) {
    throw new AppError('Round not found', 404);
  }

  res.json({
    success: true,
    data: round,
  });
}));

// Create round
roundsRouter.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const validatedData = createRoundSchema.parse(req.body);

  const [round] = await db.insert(rounds).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: round,
  });
}));

// Update round
roundsRouter.put('/:id', asyncHandler(async (req, res) => {
  const validatedData = updateRoundSchema.parse(req.body);

  const [updatedRound] = await db.update(rounds)
    .set(validatedData)
    .where(eq(rounds.id, parseInt(req.params.id)))
    .returning();

  if (!updatedRound) {
    throw new AppError('Round not found', 404);
  }

  // Emit real-time update via WebSocket
  const io = req.app.get('io');
  io.to(`site-${updatedRound.siteId}`).emit('round-updated', updatedRound);

  res.json({
    success: true,
    data: updatedRound,
  });
}));

// Get rounds by site
roundsRouter.get('/site/:siteId', asyncHandler(async (req, res) => {
  const siteRounds = await db.query.rounds.findMany({
    where: eq(rounds.siteId, parseInt(req.params.siteId)),
    orderBy: [desc(rounds.createdAt)],
  });

  res.json({
    success: true,
    data: siteRounds,
  });
}));

// Get rounds by agent
roundsRouter.get('/agent/:agentId', asyncHandler(async (req, res) => {
  const agentRounds = await db.query.rounds.findMany({
    where: eq(rounds.agentId, parseInt(req.params.agentId)),
    orderBy: [desc(rounds.createdAt)],
  });

  res.json({
    success: true,
    data: agentRounds,
  });
}));
