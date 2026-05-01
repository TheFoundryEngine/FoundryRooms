import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

// Re-use types from API contracts for consistency
const ActorId = z.string().uuid();
const CommunityId = z.string().uuid();
const CommunitySlug = z.string().regex(/^[a-z0-9-]+$/).min(3).max(50);
const CommunityVisibility = z.enum(['public', 'private']);
const SpaceId = z.string().uuid();
const SpaceVisibility = z.enum(['public', 'members', 'restricted']);
const ChannelId = z.string().uuid();
const ChannelType = z.enum(['discussion', 'announcements', 'events', 'resources']);
const ChannelVisibility = z.enum(['public', 'members', 'restricted']);
const MembershipId = z.string().uuid();

// ============================================================================
// Community Events
// ============================================================================

export const CommunityCreatedEvent = createEventSchema(
  'community.created',
  'community',
  {
    communityId: CommunityId,
    name: z.string(),
    slug: CommunitySlug,
    description: z.string().nullable(),
    visibility: CommunityVisibility,
    createdBy: ActorId,
  },
);
export type CommunityCreatedEvent = InferEvent<typeof CommunityCreatedEvent>;

export const CommunityUpdatedEvent = createEventSchema(
  'community.updated',
  'community',
  {
    communityId: CommunityId,
    changes: z.object({
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      visibility: CommunityVisibility.optional(),
      iconUrl: z.string().url().nullable().optional(),
    }),
    updatedBy: ActorId,
  },
);
export type CommunityUpdatedEvent = InferEvent<typeof CommunityUpdatedEvent>;

// ============================================================================
// Space Events
// ============================================================================

export const SpaceCreatedEvent = createEventSchema(
  'community.space.created',
  'space',
  {
    spaceId: SpaceId,
    communityId: CommunityId,
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    visibility: SpaceVisibility,
    createdBy: ActorId,
  },
);
export type SpaceCreatedEvent = InferEvent<typeof SpaceCreatedEvent>;

// ============================================================================
// Channel Events
// ============================================================================

export const ChannelCreatedEvent = createEventSchema(
  'community.channel.created',
  'channel',
  {
    channelId: ChannelId,
    spaceId: SpaceId,
    communityId: CommunityId,
    name: z.string(),
    type: ChannelType,
    description: z.string().nullable(),
    visibility: ChannelVisibility,
    createdBy: ActorId,
  },
);
export type ChannelCreatedEvent = InferEvent<typeof ChannelCreatedEvent>;

// ============================================================================
// Membership Events
// ============================================================================

export const MemberJoinedEvent = createEventSchema(
  'community.member.joined',
  'membership',
  {
    membershipId: MembershipId,
    communityId: CommunityId,
    actorId: ActorId,
    invitedBy: ActorId.nullable(),
    invitationToken: z.string().nullable(),
  },
);
export type MemberJoinedEvent = InferEvent<typeof MemberJoinedEvent>;

export const MemberLeftEvent = createEventSchema(
  'community.member.left',
  'membership',
  {
    membershipId: MembershipId,
    communityId: CommunityId,
    actorId: ActorId,
    reason: z.enum(['voluntary', 'kicked', 'banned']),
    removedBy: ActorId.nullable(),
  },
);
export type MemberLeftEvent = InferEvent<typeof MemberLeftEvent>;

// ============================================================================
// Union of all Community Structure events
// ============================================================================

export const CommunityStructureEvent = z.discriminatedUnion('type', [
  CommunityCreatedEvent,
  CommunityUpdatedEvent,
  SpaceCreatedEvent,
  ChannelCreatedEvent,
  MemberJoinedEvent,
  MemberLeftEvent,
]);
export type CommunityStructureEvent = z.infer<typeof CommunityStructureEvent>;

// Event type constants for type-safe event handling
export const CommunityStructureEventTypes = {
  COMMUNITY_CREATED: 'community.created',
  COMMUNITY_UPDATED: 'community.updated',
  SPACE_CREATED: 'community.space.created',
  CHANNEL_CREATED: 'community.channel.created',
  MEMBER_JOINED: 'community.member.joined',
  MEMBER_LEFT: 'community.member.left',
} as const;
