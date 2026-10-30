import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../database/index.js';
import { users, sessions } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
authRouter.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, validatedData.email),
  });

  if (existingUser) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 10);

  // Create user
  const [user] = await db.insert(users).values({
    email: validatedData.email,
    password: hashedPassword,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName,
    role: 'user',
  }).returning();

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Create session
  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    },
  });
}));

// Login
authRouter.post('/login', asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, validatedData.email),
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 403);
  }

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  // Create session
  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Update last login
  await db.update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.id, user.id));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    },
  });
}));

// Get current user
authRouter.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
  });
}));

// Logout
authRouter.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

// Update profile
authRouter.put('/profile', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, avatar } = req.body;

  await db.update(users)
    .set({
      firstName,
      lastName,
      avatar,
      updatedAt: new Date(),
    })
    .where(eq(users.id, req.user!.id));

  res.json({
    success: true,
    message: 'Profile updated successfully',
  });
}));

// Change password
authRouter.put('/password', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);

  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, req.user!.id));

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));
