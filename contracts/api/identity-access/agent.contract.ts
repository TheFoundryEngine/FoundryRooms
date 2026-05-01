import { z } from 'zod';
import { ActorId, ActorBase, ActorSummary } from './actor.contract';

export const Agent = ActorBase.extend({
  type: z.literal('agent'),
  description: z.string().max(500).nullable(),
  ownerActorId: ActorId.nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Agent = z.infer<typeof Agent>;

export const AgentSummary = ActorSummary.extend({
  type: z.literal('agent'),
});
export type AgentSummary = z.infer<typeof AgentSummary>;

export const CreateAgentRequest = z.object({
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export type CreateAgentRequest = z.infer<typeof CreateAgentRequest>;

export const CreateAgentResponse = z.object({
  agent: AgentSummary,
  apiKey: z.string(), // Only returned once at creation
});
export type CreateAgentResponse = z.infer<typeof CreateAgentResponse>;
