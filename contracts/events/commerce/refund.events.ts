import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

const ActorId = z.string().uuid();
const PurchaseId = z.string().uuid();
const RefundId = z.string().uuid();

export const RefundIssued = createEventSchema(
  'commerce.refund.issued',
  'refund',
  {
    refundId: RefundId,
    purchaseId: PurchaseId,
    actorId: ActorId,
    amount: z.number().int().positive(),
    currency: z.string().length(3),
    processedAt: z.string().datetime(),
  },
);
export type RefundIssued = InferEvent<typeof RefundIssued>;

export const RefundFailed = createEventSchema(
  'commerce.refund.failed',
  'refund',
  {
    refundId: RefundId,
    purchaseId: PurchaseId,
    actorId: ActorId,
    reason: z.string(),
    failedAt: z.string().datetime(),
  },
);
export type RefundFailed = InferEvent<typeof RefundFailed>;

export const RefundEventTypes = {
  REFUND_ISSUED: 'commerce.refund.issued',
  REFUND_FAILED: 'commerce.refund.failed',
} as const;
