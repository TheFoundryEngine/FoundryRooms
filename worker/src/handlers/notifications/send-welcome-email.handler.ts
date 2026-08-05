/**
 * Send Welcome Email handler (notifications context).
 *
 * Validates the job payload then delegates to the WelcomeEmailService port.
 * The handler never touches SMTP/DB adapters directly — that is the
 * adapter's job. Idempotent: re-sending a welcome email for the same user
 * is safe (the service dedups by userId).
 */
import { z } from 'zod';
import type { JobHandler } from '../../runtime/handler';

export const sendWelcomeEmailSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1),
});

export type SendWelcomeEmailPayload = z.infer<typeof sendWelcomeEmailSchema>;

export interface WelcomeEmailService {
  sendWelcomeEmail(input: SendWelcomeEmailPayload): Promise<{ delivered: boolean }>;
}

export interface SendWelcomeEmailHandlerDeps {
  service: WelcomeEmailService;
}

export function createSendWelcomeEmailHandler(
  deps: SendWelcomeEmailHandlerDeps,
): JobHandler<SendWelcomeEmailPayload, { delivered: boolean }> {
  return {
    name: 'notifications.send-welcome-email',
    schema: sendWelcomeEmailSchema,
    async handle(payload) {
      return deps.service.sendWelcomeEmail(payload);
    },
  };
}
