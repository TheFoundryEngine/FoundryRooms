/**
 * Handler registry — aggregates all handlers from every bounded context.
 *
 * Each context owns its handlers. This module wires concrete (mocked)
 * service ports into the handlers and returns the full list for the
 * bootstrap to register. In production the services are real application
 * service ports injected from the module composition root.
 */
import type { JobHandler } from '../runtime/handler';
import { createSendWelcomeEmailHandler, type WelcomeEmailService } from './notifications/send-welcome-email.handler';
import { createEntitlementSyncHandler, type EntitlementSyncService } from './commerce/entitlement-sync.handler';
import { createEventReminderHandler, type EventReminderService } from './events/event-reminder.handler';
import { createInviteExpirationHandler, type InviteExpirationService } from './identity-access/invite-expiration.handler';

export type {
  WelcomeEmailService,
  EntitlementSyncService,
  EventReminderService,
  InviteExpirationService,
};

export interface HandlerServices {
  welcomeEmail: WelcomeEmailService;
  entitlementSync: EntitlementSyncService;
  eventReminder: EventReminderService;
  inviteExpiration: InviteExpirationService;
}

/** Builds the full set of handlers from injected application services. */
export function createAllHandlers(services: HandlerServices): JobHandler<unknown, unknown>[] {
  return [
    createSendWelcomeEmailHandler({ service: services.welcomeEmail }),
    createEntitlementSyncHandler({ service: services.entitlementSync }),
    createEventReminderHandler({ service: services.eventReminder }),
    createInviteExpirationHandler({ service: services.inviteExpiration }),
  ];
}
