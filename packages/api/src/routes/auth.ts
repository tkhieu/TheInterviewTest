import { Router } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { z } from 'zod';
import { User } from '../models/user.js';
import { hashPassword, verifyPassword, signToken } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { errors } from '../lib/errors.js';

const registerSchema = z.object({
  email: z.string().email().max(255).transform((s) => s.toLowerCase()),
  password: z.string().min(12).max(72),
  name: z.string().min(1).max(120),
});

const loginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase()),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body as z.infer<typeof registerSchema>;
    const password_hash = await hashPassword(password);
    let user;
    try {
      user = await User.create({ email, name, password_hash });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        next(errors.emailExists());
        return;
      }
      throw err;
    }
    const token = signToken({ userId: user.id });
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      next(errors.invalidCredentials());
      return;
    }
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      next(errors.invalidCredentials());
      return;
    }
    const token = signToken({ userId: user.id });
    res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    next(err);
  }
});
