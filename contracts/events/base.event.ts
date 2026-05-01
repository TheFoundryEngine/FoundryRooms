import { z } from 'zod';

/**
 * Base schema for all domain events.
 * Events represent facts that have occurred in the system.
 */
export const EventId = z.string().uuid();
export type EventId = z.infer<typeof EventId>;

export const AggregateType = z.enum([
  'user',
  'agent',
  'role',
  'entitlement',
  'access_group',
  'community',
  'space',
  'channel',
  'membership',
]);
export type AggregateType = z.infer<typeof AggregateType>;

export const EventMetadata = z.object({
  correlationId: z.string().uuid().optional(),
  causationId: z.string().uuid().optional(),
  version: z.number().int().positive().default(1),
});
export type EventMetadata = z.infer<typeof EventMetadata>;

export const BaseEvent = z.object({
  id: EventId,
  type: z.string(),
  occurredAt: z.string().datetime(),
  aggregateId: z.string().uuid(),
  aggregateType: AggregateType,
  actorId: z.string().uuid().nullable(),
  metadata: EventMetadata.optional(),
});
export type BaseEvent = z.infer<typeof BaseEvent>;

/**
 * Helper to create a typed event schema.
 * Extends BaseEvent with a specific event type literal and custom payload.
 */
export function createEventSchema<
  TType extends string,
  TPayload extends z.ZodRawShape,
  TAggregate extends AggregateType,
>(
  eventType: TType,
  aggregateType: TAggregate,
  payloadShape: TPayload,
) {
  return BaseEvent.extend({
    type: z.literal(eventType),
    aggregateType: z.literal(aggregateType),
    payload: z.object(payloadShape),
  });
}

/**
 * Helper type to infer the event type from a schema created with createEventSchema.
 */
export type InferEvent<T extends z.ZodTypeAny> = z.infer<T>;
