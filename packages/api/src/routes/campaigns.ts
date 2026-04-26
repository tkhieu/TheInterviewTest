import { Router } from 'express';
import { z } from 'zod';
import { Campaign } from '../models/index.js';
import { requireAuth } from '../lib/auth.js';
import { validateBody } from '../lib/validate.js';
import { errors } from '../lib/errors.js';
import {
  createCampaign,
  getCampaignDetail,
  listCampaigns,
} from '../services/campaigns.js';

const idSchema = z.string().uuid();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const createSchema = z
  .object({
    name: z.string().min(1).max(200),
    subject: z.string().min(1).max(300),
    body: z.string().min(1).max(20_000),
    recipient_emails: z.array(z.string().email()).min(1).max(50),
  })
  .strict();

const patchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    subject: z.string().min(1).max(300).optional(),
    body: z.string().min(1).max(20_000).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'No fields to update' });

function serializeCampaign(c: Campaign): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    subject: c.subject,
    body: c.body,
    status: c.status,
    scheduled_at: c.scheduled_at,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

export const campaignsRouter = Router();

campaignsRouter.use(requireAuth);

campaignsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(errors.validation('Invalid query', parsed.error.flatten().fieldErrors));
      return;
    }
    const { page, limit } = parsed.data;
    const userId = req.userId!;
    const { data, total } = await listCampaigns(userId, page, limit);
    res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
});

campaignsRouter.post('/', validateBody(createSchema), async (req, res, next) => {
  try {
    const userId = req.userId!;
    const body = req.body as z.infer<typeof createSchema>;
    const { campaign, recipients_count } = await createCampaign({ userId, ...body });
    res.status(201).json({
      ...serializeCampaign(campaign),
      recipients_count,
    });
  } catch (err) {
    next(err);
  }
});

campaignsRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = req.userId!;
    if (!idSchema.safeParse(req.params.id).success) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    const detail = await getCampaignDetail(req.params.id, userId);
    if (!detail) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    const { campaign, stats, recipients } = detail;
    res.json({
      ...serializeCampaign(campaign),
      stats,
      recipients,
    });
  } catch (err) {
    next(err);
  }
});

campaignsRouter.patch('/:id', validateBody(patchSchema), async (req, res, next) => {
  try {
    const userId = req.userId!;
    if (!idSchema.safeParse(req.params.id).success) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, created_by: userId },
    });
    if (!campaign) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    if (campaign.status !== 'draft') {
      next(errors.invalidStatus('Can only edit draft campaigns'));
      return;
    }
    const updates = req.body as z.infer<typeof patchSchema>;
    await campaign.update({ ...updates, updated_at: new Date() });
    res.json(serializeCampaign(campaign));
  } catch (err) {
    next(err);
  }
});

campaignsRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.userId!;
    if (!idSchema.safeParse(req.params.id).success) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    const campaign = await Campaign.findOne({
      where: { id: req.params.id, created_by: userId },
    });
    if (!campaign) {
      next(errors.notFound('Campaign not found'));
      return;
    }
    if (campaign.status !== 'draft') {
      next(errors.invalidStatus('Can only delete draft campaigns'));
      return;
    }
    await campaign.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
