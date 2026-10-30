import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { agents } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const agentsRouter = Router();

agentsRouter.use(authenticate);

const createAgentSchema = z.object({
  siteId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().min(1),
  qualifications: z.array(z.string()),
  professionalCard: z.string().min(1),
  cardExpiry: z.string(),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  status: z.enum(['en_service', 'pause', 'absent', 'repos']).optional(),
  serviceStartTime: z.string().optional(),
});

const updateAgentSchema = createAgentSchema.partial();

// Get all agents
agentsRouter.get('/', asyncHandler(async (req, res) => {
  const { siteId, status } = req.query;

  let allAgents = await db.query.agents.findMany();

  if (siteId) {
    allAgents = allAgents.filter(a => a.siteId === parseInt(siteId as string));
  }
  if (status) {
    allAgents = allAgents.filter(a => a.status === status);
  }

  res.json({
    success: true,
    data: allAgents,
  });
}));

// Get agent by ID
agentsRouter.get('/:id', asyncHandler(async (req, res) => {
  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, parseInt(req.params.id)),
  });

  if (!agent) {
    throw new AppError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: agent,
  });
}));

// Create agent
agentsRouter.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = createAgentSchema.parse(req.body);

  const [agent] = await db.insert(agents).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: agent,
  });
}));

// Update agent
agentsRouter.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = updateAgentSchema.parse(req.body);

  const [updatedAgent] = await db.update(agents)
    .set({ ...validatedData, updatedAt: new Date() })
    .where(eq(agents.id, parseInt(req.params.id)))
    .returning();

  if (!updatedAgent) {
    throw new AppError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: updatedAgent,
  });
}));

// Delete agent
agentsRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const [deletedAgent] = await db.delete(agents)
    .where(eq(agents.id, parseInt(req.params.id)))
    .returning();

  if (!deletedAgent) {
    throw new AppError('Agent not found', 404);
  }

  res.json({
    success: true,
    message: 'Agent deleted successfully',
  });
}));

// Update agent status
agentsRouter.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status, serviceStartTime } = req.body;

  const [updatedAgent] = await db.update(agents)
    .set({
      status,
      serviceStartTime,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, parseInt(req.params.id)))
    .returning();

  if (!updatedAgent) {
    throw new AppError('Agent not found', 404);
  }

  res.json({
    success: true,
    data: updatedAgent,
  });
}));

// Get agents by site
agentsRouter.get('/site/:siteId', asyncHandler(async (req, res) => {
  const siteAgents = await db.query.agents.findMany({
    where: eq(agents.siteId, parseInt(req.params.siteId)),
  });

  res.json({
    success: true,
    data: siteAgents,
  });
}));
