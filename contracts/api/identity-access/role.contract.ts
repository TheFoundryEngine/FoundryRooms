import { z } from 'zod';
import { ActorId } from './actor.contract';

export const RoleId = z.string().uuid();
export type RoleId = z.infer<typeof RoleId>;

export const RoleScope = z.enum(['system', 'community']);
export type RoleScope = z.infer<typeof RoleScope>;

export const Role = z.object({
  id: RoleId,
  name: z.string().min(1).max(50),
  scope: RoleScope,
  isBuiltIn: z.boolean(),
  description: z.string().max(200).nullable(),
});
export type Role = z.infer<typeof Role>;

export const PermissionKey = z.string().regex(/^[a-z]+\.[a-z_]+$/);
export type PermissionKey = z.infer<typeof PermissionKey>;

export const Permission = z.object({
  key: PermissionKey,
  description: z.string(),
});
export type Permission = z.infer<typeof Permission>;

export const ActorRole = z.object({
  actorId: ActorId,
  roleId: RoleId,
  scopeType: RoleScope,
  scopeId: z.string().uuid().nullable(),
  assignedAt: z.string().datetime(),
});
export type ActorRole = z.infer<typeof ActorRole>;

export const CheckPermissionRequest = z.object({
  actorId: ActorId,
  permission: PermissionKey,
  scopeType: RoleScope.optional(),
  scopeId: z.string().uuid().optional(),
});
export type CheckPermissionRequest = z.infer<typeof CheckPermissionRequest>;

export const CheckPermissionResponse = z.object({
  allowed: z.boolean(),
  reason: z.string().optional(),
});
export type CheckPermissionResponse = z.infer<typeof CheckPermissionResponse>;
