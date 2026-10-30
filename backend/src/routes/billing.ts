import { Router } from 'express';
import { z } from 'zod';
import { db } from '../database/index.js';
import { invoices, subscriptions } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const billingRouter = Router();

billingRouter.use(authenticate);

// ═══════════════════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════════════════

const createInvoiceSchema = z.object({
  siteId: z.number().int().positive(),
  clientName: z.string().min(1),
  type: z.enum(['facture', 'devis', 'avoir']),
  issueDate: z.string(),
  dueDate: z.string(),
  amount: z.number().positive(),
});

// Get all invoices
billingRouter.get('/invoices', asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  
  let allInvoices = await db.query.invoices.findMany({
    orderBy: [desc(invoices.issueDate)],
  });
  
  if (status) {
    allInvoices = allInvoices.filter(i => i.status === status);
  }
  if (type) {
    allInvoices = allInvoices.filter(i => i.type === type);
  }

  res.json({
    success: true,
    data: allInvoices,
  });
}));

// Get invoice by ID
billingRouter.get('/invoices/:id', asyncHandler(async (req, res) => {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, parseInt(req.params.id)),
  });

  if (!invoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: invoice,
  });
}));

// Create invoice
billingRouter.post('/invoices', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const validatedData = createInvoiceSchema.parse(req.body);

  // Generate invoice number
  const invoiceNumber = `${validatedData.type === 'facture' ? 'FAC' : validatedData.type === 'devis' ? 'DEV' : 'AVO'}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  const [invoice] = await db.insert(invoices).values({
    ...validatedData,
    invoiceNumber,
    status: 'brouillon',
  }).returning();

  res.status(201).json({
    success: true,
    data: invoice,
  });
}));

// Update invoice
billingRouter.put('/invoices/:id', authorize('admin', 'manager'), asyncHandler(async (req, res) => {
  const { status, paidAt } = req.body;

  const [updatedInvoice] = await db.update(invoices)
    .set({
      status,
      paidAt: paidAt ? new Date(paidAt) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, parseInt(req.params.id)))
    .returning();

  if (!updatedInvoice) {
    throw new AppError('Invoice not found', 404);
  }

  res.json({
    success: true,
    data: updatedInvoice,
  });
}));

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTIONS (Stripe)
// ═══════════════════════════════════════════════════════════

// Create checkout session
billingRouter.post('/create-checkout-session', asyncHandler(async (req: AuthRequest, res) => {
  const { plan } = req.body;

  const prices: Record<string, string> = {
    starter: process.env.STRIPE_PRICE_STARTER || '',
    professional: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
  };

  if (!prices[plan]) {
    throw new AppError('Invalid plan', 400);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: prices[plan],
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    customer_email: req.user!.email,
    metadata: {
      userId: req.user!.id.toString(),
      plan,
    },
  });

  res.json({
    success: true,
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
}));

// Get user subscription
billingRouter.get('/subscription', asyncHandler(async (req: AuthRequest, res) => {
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, req.user!.id),
  });

  res.json({
    success: true,
    data: subscription || null,
  });
}));

// Stripe webhook
billingRouter.post('/webhook', asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    throw new AppError(`Webhook Error: ${err.message}`, 400);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = parseInt(session.metadata?.userId || '0');
      const plan = session.metadata?.plan || 'starter';

      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        plan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await db.update(subscriptions)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
      break;
    }
  }

  res.json({ received: true });
}));

// Get billing statistics
billingRouter.get('/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const allInvoices = await db.query.invoices.findMany();

  const paid = allInvoices.filter(i => i.status === 'payee');
  const pending = allInvoices.filter(i => i.status === 'envoyee');
  const overdue = allInvoices.filter(i => i.status === 'en_retard');

  const paidAmount = paid.reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
  const pendingAmount = pending.reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);
  const overdueAmount = overdue.reduce((sum, i) => sum + parseFloat(i.amount.toString()), 0);

  res.json({
    success: true,
    data: {
      total: allInvoices.length,
      paid: { count: paid.length, amount: paidAmount },
      pending: { count: pending.length, amount: pendingAmount },
      overdue: { count: overdue.length, amount: overdueAmount },
    },
  });
}));
