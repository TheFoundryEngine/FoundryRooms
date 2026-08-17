/**
 * Invite Expiration handler (identity-access context).
 *
 * Expires a pending invite that has passed its TTL. Delegates to the
 * InviteExpirationService port. Idempotent: expiring an already-expired
 * invite is a no-op.
 */
import { z } from 'zod';
import type { JobHandler } from '../../runtime/handler';

export const inviteExpirationSchema = z.object({
  inviteId: z.string().uuid(),
  email: z.string().email(),
  expiresAt: z.string().datetime(),
});

export type InviteExpirationPayload = z.infer<typeof inviteExpirationSchema>;

export interface InviteExpirationService {
  expireInvite(input: InviteExpirationPayload): Promise<{ expired: boolean }>;
}

export interface InviteExpirationHandlerDeps {
  service: InviteExpirationService;
}

export function createInviteExpirationHandler(
  deps: InviteExpirationHandlerDeps,
): JobHandler<InviteExpirationPayload, { expired: boolean }> {
  return {
    name: 'identity-access.invite-expiration',
    schema: inviteExpirationSchema,
    async handle(payload) {
      return deps.service.expireInvite(payload);
    },
  };
}
