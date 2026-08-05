/**
 * Queue name constants.
 *
 * Each bounded context owns its queue. Queue names are constants so that
 * producers and consumers never drift via magic strings.
 */
export const QueueNames = {
  NOTIFICATIONS: 'notifications',
  COMMERCE: 'commerce',
  EVENTS: 'events',
  IDENTITY_ACCESS: 'identity-access',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];

export const ALL_QUEUE_NAMES: readonly QueueName[] = [
  QueueNames.NOTIFICATIONS,
  QueueNames.COMMERCE,
  QueueNames.EVENTS,
  QueueNames.IDENTITY_ACCESS,
];
