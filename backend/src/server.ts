import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { checkDatabaseConnection } from './database/index.js';
import { authRouter } from './routes/auth.js';
import { sitesRouter } from './routes/sites.js';
import { camerasRouter } from './routes/cameras.js';
import { agentsRouter } from './routes/agents.js';
import { eventsRouter } from './routes/events.js';
import { alarmsRouter } from './routes/alarms.js';
import { roundsRouter } from './routes/rounds.js';
import { crmRouter } from './routes/crm.js';
import { billingRouter } from './routes/billing.js';
import { supportRouter } from './routes/support.js';
import { shopguardRouter } from './routes/shopguard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/alarms', alarmsRouter);
app.use('/api/rounds', roundsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/billing', billingRouter);
app.use('/api/support', supportRouter);
app.use('/api/shopguard', shopguardRouter);

// WebSocket for real-time updates
io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('subscribe', (channels: string[]) => {
    channels.forEach(channel => socket.join(channel));
    logger.info('Client subscribed to channels', { socketId: socket.id, channels });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Start server
const PORT = process.env.PORT || 8000;

httpServer.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    logger.info('✅ Database connected');
  } else {
    logger.error('❌ Database connection failed');
  }
});

export { io };
export default app;
