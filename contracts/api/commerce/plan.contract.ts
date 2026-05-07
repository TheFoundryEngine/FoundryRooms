import { z } from 'zod';

export const PlanId = z.string().uuid();
export type PlanId = z.infer<typeof PlanId>;

export const BillingInterval = z.enum(['monthly', 'annual', 'one_time']);
export type BillingInterval = z.infer<typeof BillingInterval>;

export const PlanTier = z.enum(['free', 'basic', 'pro', 'enterprise']);
export type PlanTier = z.infer<typeof PlanTier>;

export const Plan = z.object({
  id: PlanId,
  name: z.string().min(1).max(100),
  tier: PlanTier,
  billingInterval: BillingInterval,
  priceAmount: z.number().int().nonnegative(),  // in cents
  currency: z.string().length(3),               // ISO 4217
  description: z.string().nullable(),
  features: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Plan = z.infer<typeof Plan>;

export const PlanSummary = z.object({
  id: PlanId,
  name: z.string(),
  tier: PlanTier,
  billingInterval: BillingInterval,
  priceAmount: z.number().int().nonnegative(),
  currency: z.string().length(3),
});
export type PlanSummary = z.infer<typeof PlanSummary>;

export const CreatePlanRequest = z.object({
  name: z.string().min(1).max(100),
  tier: PlanTier,
  billingInterval: BillingInterval,
  priceAmount: z.number().int().nonnegative(),
  currency: z.string().length(3),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});
export type CreatePlanRequest = z.infer<typeof CreatePlanRequest>;

export const UpdatePlanRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
export type UpdatePlanRequest = z.infer<typeof UpdatePlanRequest>;
