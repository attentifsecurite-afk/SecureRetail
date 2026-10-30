import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { contacts, installations, interventions, contracts } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

export const crmRouter = Router();

crmRouter.use(authenticate);

// ═══════════════════════════════════════════════════════════
// CONTACTS
// ═══════════════════════════════════════════════════════════

const createContactSchema = z.object({
  siteId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  isPrimary: z.boolean().optional(),
});

// Get all contacts
crmRouter.get('/contacts', asyncHandler(async (req, res) => {
  const { siteId } = req.query;
  
  let allContacts = await db.query.contacts.findMany();
  
  if (siteId) {
    allContacts = allContacts.filter(c => c.siteId === parseInt(siteId as string));
  }

  res.json({
    success: true,
    data: allContacts,
  });
}));

// Create contact
crmRouter.post('/contacts', asyncHandler(async (req, res) => {
  const validatedData = createContactSchema.parse(req.body);
  const [contact] = await db.insert(contacts).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: contact,
  });
}));

// ═══════════════════════════════════════════════════════════
// INSTALLATIONS
// ═══════════════════════════════════════════════════════════

const createInstallationSchema = z.object({
  siteId: z.number().int().positive(),
  date: z.string(),
  type: z.enum(['camera', 'dvr', 'nvr', 'alarm', 'access']),
  brand: z.string().min(1),
  model: z.string().min(1),
  quantity: z.number().int().positive(),
  status: z.enum(['planifie', 'en_cours', 'termine', 'maintenance']),
  technician: z.string().min(1),
  notes: z.string().optional(),
});

// Get all installations
crmRouter.get('/installations', asyncHandler(async (req, res) => {
  const { siteId } = req.query;
  
  let allInstallations = await db.query.installations.findMany();
  
  if (siteId) {
    allInstallations = allInstallations.filter(i => i.siteId === parseInt(siteId as string));
  }

  res.json({
    success: true,
    data: allInstallations,
  });
}));

// Create installation
crmRouter.post('/installations', asyncHandler(async (req, res) => {
  const validatedData = createInstallationSchema.parse(req.body);
  const [installation] = await db.insert(installations).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: installation,
  });
}));

// ═══════════════════════════════════════════════════════════
// INTERVENTIONS
// ═══════════════════════════════════════════════════════════

const createInterventionSchema = z.object({
  siteId: z.number().int().positive(),
  date: z.string(),
  type: z.enum(['maintenance', 'panne', 'upgrade', 'support']),
  description: z.string().min(1),
  status: z.enum(['ouvert', 'en_cours', 'resolu']),
  priority: z.enum(['basse', 'moyenne', 'haute', 'critique']),
  technician: z.string().min(1),
  duration: z.number().positive(),
});

// Get all interventions
crmRouter.get('/interventions', asyncHandler(async (req, res) => {
  const { siteId, status } = req.query;
  
  let allInterventions = await db.query.interventions.findMany();
  
  if (siteId) {
    allInterventions = allInterventions.filter(i => i.siteId === parseInt(siteId as string));
  }
  if (status) {
    allInterventions = allInterventions.filter(i => i.status === status);
  }

  res.json({
    success: true,
    data: allInterventions,
  });
}));

// Create intervention
crmRouter.post('/interventions', asyncHandler(async (req, res) => {
  const validatedData = createInterventionSchema.parse(req.body);
  const [intervention] = await db.insert(interventions).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: intervention,
  });
}));

// ═══════════════════════════════════════════════════════════
// CONTRACTS
// ═══════════════════════════════════════════════════════════

const createContractSchema = z.object({
  siteId: z.number().int().positive(),
  contractNumber: z.string().min(1),
  type: z.enum(['maintenance', 'supervision', 'complet']),
  startDate: z.string(),
  endDate: z.string(),
  amount: z.number().positive(),
  status: z.enum(['actif', 'expire', 'renouvellement']),
});

// Get all contracts
crmRouter.get('/contracts', asyncHandler(async (req, res) => {
  const { siteId, status } = req.query;
  
  let allContracts = await db.query.contracts.findMany();
  
  if (siteId) {
    allContracts = allContracts.filter(c => c.siteId === parseInt(siteId as string));
  }
  if (status) {
    allContracts = allContracts.filter(c => c.status === status);
  }

  res.json({
    success: true,
    data: allContracts,
  });
}));

// Create contract
crmRouter.post('/contracts', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = createContractSchema.parse(req.body);
  const [contract] = await db.insert(contracts).values(validatedData).returning();

  res.status(201).json({
    success: true,
    data: contract,
  });
}));

// Get CRM statistics
crmRouter.get('/stats', asyncHandler(async (req, res) => {
  const allContracts = await db.query.contracts.findMany();
  const allInterventions = await db.query.interventions.findMany();

  const activeContracts = allContracts.filter(c => c.status === 'actif');
  const renewalContracts = allContracts.filter(c => c.status === 'renouvellement');
  const openInterventions = allInterventions.filter(i => i.status !== 'resolu');

  const totalRevenue = activeContracts.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  res.json({
    success: true,
    data: {
      totalSites: new Set(allContracts.map(c => c.siteId)).size,
      activeContracts: activeContracts.length,
      renewalContracts: renewalContracts.length,
      openInterventions: openInterventions.length,
      totalRevenue,
    },
  });
}));
