import { z } from 'zod';
import { CommunityId, CommunitySummary } from './community.contract';
import { Space } from './space.contract';
import { Channel } from './channel.contract';

// Import from identity-access contracts
const ActorId = z.string().uuid();

export const MembershipId = z.string().uuid();
export type MembershipId = z.infer<typeof MembershipId>;

export const MembershipStatus = z.enum(['active', 'suspended', 'banned']);
export type MembershipStatus = z.infer<typeof MembershipStatus>;

export const Membership = z.object({
  id: MembershipId,
  actorId: ActorId,
  communityId: CommunityId,
  status: MembershipStatus,
  joinedAt: z.string().datetime(),
});
export type Membership = z.infer<typeof Membership>;

export const JoinCommunityRequest = z.object({
  invitationToken: z.string().optional(),
});
export type JoinCommunityRequest = z.infer<typeof JoinCommunityRequest>;

// Navigation structure for sidebar
export const SpaceWithChannels = z.object({
  space: Space,
  channels: z.array(Channel),
});
export type SpaceWithChannels = z.infer<typeof SpaceWithChannels>;

export const CommunityNavigation = z.object({
  community: CommunitySummary,
  spaces: z.array(SpaceWithChannels),
});
export type CommunityNavigation = z.infer<typeof CommunityNavigation>;
