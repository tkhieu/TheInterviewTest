import { Router } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { z } from 'zod';
import { Recipient } from '../models/index.js';
import { requireAuth } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { errors } from '../lib/errors.js';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createSchema = z
  .object({
    email: z.string().email().max(255).transform((s) => s.toLowerCase()),
    name: z.string().min(1).max(120).optional(),
  })
  .strict();

function serializeRecipient(r: Recipient): Record<string, unknown> {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    created_at: r.created_at,
  };
}

export const recipientsRouter = Router();

recipientsRouter.use(requireAuth);

recipientsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(errors.validation('Invalid query', parsed.error.flatten().fieldErrors));
      return;
    }
    const { page, limit } = parsed.data;
    const offset = (page - 1) * limit;
    const { rows, count } = await Recipient.findAndCountAll({
      order: [['email', 'ASC']],
      limit,
      offset,
    });
    res.json({
      data: rows.map(serializeRecipient),
      page,
      limit,
      total: count,
    });
  } catch (err) {
    next(err);
  }
});

recipientsRouter.post('/', validateBody(createSchema), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createSchema>;
    let recipient;
    try {
      recipient = await Recipient.create({
        email: body.email,
        name: body.name ?? null,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        next(errors.emailExists());
        return;
      }
      throw err;
    }
    res.status(201).json(serializeRecipient(recipient));
  } catch (err) {
    next(err);
  }
});
