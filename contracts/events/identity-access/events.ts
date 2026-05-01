import { z } from 'zod';
import { createEventSchema, InferEvent } from '../base.event';

// Re-use types from API contracts for consistency
const ActorId = z.string().uuid();
const ActorType = z.enum(['user', 'agent']);
const Email = z.string().email();
const RoleId = z.string().uuid();
const RoleScope = z.enum(['system', 'community']);
const EntitlementId = z.string().uuid();
const EntitlementType = z.enum(['feature_access', 'content_access', 'api_access']);
const AccessGroupId = z.string().uuid();

// ============================================================================
// User Events
// ============================================================================

export const UserRegisteredEvent = createEventSchema(
  'identity.user.registered',
  'user',
  {
    userId: ActorId,
    email: Email,
    displayName: z.string(),
    emailVerified: z.boolean(),
  },
);
export type UserRegisteredEvent = InferEvent<typeof UserRegisteredEvent>;

// ============================================================================
// Agent Events
// ============================================================================

export const AgentCreatedEvent = createEventSchema(
  'identity.agent.created',
  'agent',
  {
    agentId: ActorId,
    displayName: z.string(),
    description: z.string().nullable(),
    ownerActorId: ActorId.nullable(),
  },
);
export type AgentCreatedEvent = InferEvent<typeof AgentCreatedEvent>;

// ============================================================================
// Role Events
// ============================================================================

export const RoleAssignedEvent = createEventSchema(
  'identity.role.assigned',
  'role',
  {
    actorId: ActorId,
    actorType: ActorType,
    roleId: RoleId,
    roleName: z.string(),
    scopeType: RoleScope,
    scopeId: z.string().uuid().nullable(),
  },
);
export type RoleAssignedEvent = InferEvent<typeof RoleAssignedEvent>;

export const RoleRevokedEvent = createEventSchema(
  'identity.role.revoked',
  'role',
  {
    actorId: ActorId,
    actorType: ActorType,
    roleId: RoleId,
    roleName: z.string(),
    scopeType: RoleScope,
    scopeId: z.string().uuid().nullable(),
    reason: z.string().optional(),
  },
);
export type RoleRevokedEvent = InferEvent<typeof RoleRevokedEvent>;

// ============================================================================
// Entitlement Events
// ============================================================================

export const EntitlementGrantedEvent = createEventSchema(
  'identity.entitlement.granted',
  'entitlement',
  {
    entitlementId: EntitlementId,
    actorId: ActorId,
    type: EntitlementType,
    scopeType: z.string().nullable(),
    scopeId: z.string().uuid().nullable(),
    expiresAt: z.string().datetime().nullable(),
    grantedBy: ActorId.nullable(),
  },
);
export type EntitlementGrantedEvent = InferEvent<typeof EntitlementGrantedEvent>;

export const EntitlementRevokedEvent = createEventSchema(
  'identity.entitlement.revoked',
  'entitlement',
  {
    entitlementId: EntitlementId,
    actorId: ActorId,
    type: EntitlementType,
    scopeType: z.string().nullable(),
    scopeId: z.string().uuid().nullable(),
    revokedBy: ActorId.nullable(),
    reason: z.string().optional(),
  },
);
export type EntitlementRevokedEvent = InferEvent<typeof EntitlementRevokedEvent>;

// ============================================================================
// Access Group Events
// ============================================================================

export const ActorAddedToGroupEvent = createEventSchema(
  'identity.access_group.actor_added',
  'access_group',
  {
    accessGroupId: AccessGroupId,
    accessGroupName: z.string(),
    actorId: ActorId,
    actorType: ActorType,
    addedBy: ActorId.nullable(),
  },
);
export type ActorAddedToGroupEvent = InferEvent<typeof ActorAddedToGroupEvent>;

// ============================================================================
// Union of all Identity Access events
// ============================================================================

export const IdentityAccessEvent = z.discriminatedUnion('type', [
  UserRegisteredEvent,
  AgentCreatedEvent,
  RoleAssignedEvent,
  RoleRevokedEvent,
  EntitlementGrantedEvent,
  EntitlementRevokedEvent,
  ActorAddedToGroupEvent,
]);
export type IdentityAccessEvent = z.infer<typeof IdentityAccessEvent>;

// Event type constants for type-safe event handling
export const IdentityAccessEventTypes = {
  USER_REGISTERED: 'identity.user.registered',
  AGENT_CREATED: 'identity.agent.created',
  ROLE_ASSIGNED: 'identity.role.assigned',
  ROLE_REVOKED: 'identity.role.revoked',
  ENTITLEMENT_GRANTED: 'identity.entitlement.granted',
  ENTITLEMENT_REVOKED: 'identity.entitlement.revoked',
  ACTOR_ADDED_TO_GROUP: 'identity.access_group.actor_added',
} as const;
