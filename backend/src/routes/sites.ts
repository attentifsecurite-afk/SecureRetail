import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { sites, siteCameras, siteAgents } from '../database/schema.js';
import { eq, sql } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const sitesRouter = Router();

// Apply authentication to all routes
sitesRouter.use(authenticate);

// Validation schemas
const createSiteSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  zone: z.string().min(1),
  type: z.enum(['flagship', 'premium', 'standard']),
  surface: z.number().int().positive(),
  criticality: z.enum(['faible', 'moyenne', 'élevée', 'critique']),
  latitude: z.number(),
  longitude: z.number(),
});

const updateSiteSchema = createSiteSchema.partial();

// Get all sites
sitesRouter.get('/', asyncHandler(async (req, res) => {
  const allSites = await db.query.sites.findMany({
    with: {
      cameras: true,
      agents: true,
    },
  });

  res.json({
    success: true,
    data: allSites,
  });
}));

// Get site by ID
sitesRouter.get('/:id', asyncHandler(async (req, res) => {
  const site = await db.query.sites.findFirst({
    where: eq(sites.id, parseInt(req.params.id)),
    with: {
      cameras: true,
      agents: true,
    },
  });

  if (!site) {
    throw new AppError('Site not found', 404);
  }

  res.json({
    success: true,
    data: site,
  });
}));

// Create site
sitesRouter.post('/', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = createSiteSchema.parse(req.body);

  const [site] = await db.insert(sites).values(validatedData).returning();

  // Create related records
  await db.insert(siteCameras).values({
    siteId: site.id,
    totalCameras: 0,
    onlineCameras: 0,
  });

  await db.insert(siteAgents).values({
    siteId: site.id,
    totalAgents: 0,
    activeAgents: 0,
  });

  res.status(201).json({
    success: true,
    data: site,
  });
}));

// Update site
sitesRouter.put('/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = updateSiteSchema.parse(req.body);

  const [updatedSite] = await db.update(sites)
    .set({ ...validatedData, updatedAt: new Date() })
    .where(eq(sites.id, parseInt(req.params.id)))
    .returning();

  if (!updatedSite) {
    throw new AppError('Site not found', 404);
  }

  res.json({
    success: true,
    data: updatedSite,
  });
}));

// Delete site
sitesRouter.delete('/:id', authorize('admin'), asyncHandler(async (req, res) => {
  const [deletedSite] = await db.delete(sites)
    .where(eq(sites.id, parseInt(req.params.id)))
    .returning();

  if (!deletedSite) {
    throw new AppError('Site not found', 404);
  }

  res.json({
    success: true,
    message: 'Site deleted successfully',
  });
}));

// Get site statistics
sitesRouter.get('/:id/stats', asyncHandler(async (req, res) => {
  const siteId = parseInt(req.params.id);

  // Get cameras stats
  const camerasStats = await db.query.siteCameras.findFirst({
    where: eq(siteCameras.siteId, siteId),
  });

  // Get agents stats
  const agentsStats = await db.query.siteAgents.findFirst({
    where: eq(siteAgents.siteId, siteId),
  });

  // Get events count
  const eventsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(db.schema.events)
    .where(eq(db.schema.events.siteId, siteId));

  // Get alarms count
  const alarmsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(db.schema.alarms)
    .where(eq(db.schema.alarms.siteId, siteId));

  res.json({
    success: true,
    data: {
      cameras: camerasStats,
      agents: agentsStats,
      events: eventsCount[0]?.count || 0,
      alarms: alarmsCount[0]?.count || 0,
    },
  });
}));
