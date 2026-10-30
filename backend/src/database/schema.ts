import { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb, decimal, date } from 'drizzle-orm/pg-core';

// ═══════════════════════════════════════════════════════════
// USERS & AUTHENTICATION
// ═══════════════════════════════════════════════════════════

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // admin, manager, user
  avatar: text('avatar'),
  isActive: boolean('is_active').notNull().default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// SITES & LOCATIONS
// ═══════════════════════════════════════════════════════════

export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  zone: varchar('zone', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // flagship, premium, standard
  surface: integer('surface').notNull(),
  criticality: varchar('criticality', { length: 50 }).notNull(), // faible, moyenne, élevée, critique
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  riskScore: integer('risk_score').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const siteCameras = pgTable('site_cameras', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  totalCameras: integer('total_cameras').notNull().default(0),
  onlineCameras: integer('online_cameras').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const siteAgents = pgTable('site_agents', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  totalAgents: integer('total_agents').notNull().default(0),
  activeAgents: integer('active_agents').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// CAMERAS & EQUIPMENT
// ═══════════════════════════════════════════════════════════

export const cameras = pgTable('cameras', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // ip_camera, dvr, nvr, access_control
  protocol: varchar('protocol', { length: 50 }).notNull(), // onvif, rtsp, http, https, proprietary
  ipAddress: varchar('ip_address', { length: 50 }).notNull(),
  port: integer('port').notNull(),
  username: varchar('username', { length: 100 }).notNull(),
  password: text('password').notNull(), // encrypted
  streamPath: text('stream_path').notNull(),
  resolution: varchar('resolution', { length: 50 }),
  fps: integer('fps'),
  status: varchar('status', { length: 50 }).notNull().default('offline'), // online, offline, error
  macAddress: varchar('mac_address', { length: 50 }),
  serialNumber: varchar('serial_number', { length: 100 }),
  firmware: varchar('firmware', { length: 100 }),
  lastSeen: timestamp('last_seen'),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// AGENTS & STAFF
// ═══════════════════════════════════════════════════════════

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(), // Chef de poste, Agent ADS, Agent SSIAP
  qualifications: jsonb('qualifications').notNull().default([]),
  professionalCard: varchar('professional_card', { length: 100 }).notNull(),
  cardExpiry: date('card_expiry').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('repos'), // en_service, pause, absent, repos
  serviceStartTime: varchar('service_start_time', { length: 10 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// EVENTS & INCIDENTS
// ═══════════════════════════════════════════════════════════

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  type: varchar('type', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  zone: varchar('zone', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(), // info, basse, moyenne, haute, critique
  status: varchar('status', { length: 50 }).notNull().default('ouvert'), // ouvert, en_cours, cloture
  description: text('description').notNull(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  assignedTo: integer('assigned_to').references(() => agents.id),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const alarms = pgTable('alarms', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  zone: varchar('zone', { length: 100 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(),
  priority: varchar('priority', { length: 50 }).notNull(), // basse, moyenne, haute, critique
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, en_traitement, levee, fausse
  doubtRaised: boolean('doubt_raised').notNull().default(false),
  associatedCamera: varchar('associated_camera', { length: 100 }),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// ROUNDS & PATROLS
// ═══════════════════════════════════════════════════════════

export const rounds = pgTable('rounds', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  agentId: integer('agent_id').notNull().references(() => agents.id),
  circuit: varchar('circuit', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // perimetrique, fermeture, ouverture, exterieur, ssiap, dissuasion
  scheduledTime: varchar('scheduled_time', { length: 10 }).notNull(),
  actualTime: varchar('actual_time', { length: 10 }),
  status: varchar('status', { length: 50 }).notNull().default('planifiee'), // planifiee, en_cours, terminee, manquee, incomplete
  controlPoints: integer('control_points').notNull().default(0),
  scannedPoints: integer('scanned_points').notNull().default(0),
  anomalies: integer('anomalies').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// CRM - CUSTOMER RELATIONSHIP MANAGEMENT
// ═══════════════════════════════════════════════════════════

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const installations = pgTable('installations', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  date: date('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // camera, dvr, nvr, alarm, access
  brand: varchar('brand', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // planifie, en_cours, termine, maintenance
  technician: varchar('technician', { length: 255 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const interventions = pgTable('interventions', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  date: date('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // maintenance, panne, upgrade, support
  description: text('description').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // ouvert, en_cours, resolu
  priority: varchar('priority', { length: 50 }).notNull(), // basse, moyenne, haute, critique
  technician: varchar('technician', { length: 255 }).notNull(),
  duration: decimal('duration', { precision: 5, scale: 2 }).notNull(), // hours
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  contractNumber: varchar('contract_number', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // maintenance, supervision, complet
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(), // actif, expire, renouvellement
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// BILLING & INVOICES
// ═══════════════════════════════════════════════════════════

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  clientName: varchar('client_name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // facture, devis, avoir
  status: varchar('status', { length: 50 }).notNull(), // brouillon, envoyee, payee, en_retard, annulee
  issueDate: date('issue_date').notNull(),
  dueDate: date('due_date').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(), // starter, professional, enterprise
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due, trialing
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════════════════════════

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: varchar('ticket_number', { length: 100 }).notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  priority: varchar('priority', { length: 50 }).notNull(), // basse, moyenne, haute, critique
  status: varchar('status', { length: 50 }).notNull().default('ouvert'), // ouvert, en_cours, en_attente, resolu, ferme
  category: varchar('category', { length: 100 }).notNull(), // technique, facturation, general, bug, feature
  assignedTo: integer('assigned_to').references(() => users.id),
  messagesCount: integer('messages_count').notNull().default(0),
  satisfaction: integer('satisfaction'), // 1-5 stars
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ticketMessages = pgTable('ticket_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').notNull().references(() => tickets.id),
  userId: integer('user_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  isStaff: boolean('is_staff').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// LOSS PREVENTION (DEMARQUE INCONNUE)
// ═══════════════════════════════════════════════════════════

export const lossMetrics = pgTable('loss_metrics', {
  id: serial('id').primaryKey(),
  siteId: integer('site_id').notNull().references(() => sites.id),
  productFamily: varchar('product_family', { length: 100 }).notNull(),
  gap: decimal('gap', { precision: 10, scale: 2 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  period: varchar('period', { length: 50 }).notNull(),
  source: varchar('source', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ═══════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: integer('resource_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
