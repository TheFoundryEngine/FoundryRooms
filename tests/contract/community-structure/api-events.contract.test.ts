import { describe, it, expect } from 'vitest';
import {
  CommunityStructureApi,
  CommunityStructureEvents,
  CommunityStructureFixtures,
} from '@foundry/contracts';

describe('Community Structure API Contracts', () => {
  describe('Community schema', () => {
    it('should validate a valid community', () => {
      const result = CommunityStructureApi.Community.safeParse(CommunityStructureFixtures.testCommunity1);
      expect(result.success).toBe(true);
    });

    it('should reject invalid community data', () => {
      const result = CommunityStructureApi.Community.safeParse({
        id: 'not-a-uuid',
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Space schema', () => {
    it('should validate a valid space', () => {
      const result = CommunityStructureApi.Space.safeParse(CommunityStructureFixtures.testSpace1);
      expect(result.success).toBe(true);
    });
  });

  describe('Channel schema', () => {
    it('should validate a valid channel', () => {
      const result = CommunityStructureApi.Channel.safeParse(CommunityStructureFixtures.testChannel1);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateCommunityRequest schema', () => {
    it('should validate a valid create community request', () => {
      const result = CommunityStructureApi.CreateCommunityRequest.safeParse({
        name: 'Test Community',
        slug: 'test-community',
        description: 'A test community',
        visibility: 'public',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid visibility', () => {
      const result = CommunityStructureApi.CreateCommunityRequest.safeParse({
        name: 'Test Community',
        slug: 'test-community',
        visibility: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Community Structure Event Contracts', () => {
  describe('CommunityCreatedEvent', () => {
    it('should validate a valid community created event', () => {
      const event = {
        id: '550e8400-e29b-41d4-a716-446655440010',
        type: 'community.created',
        occurredAt: '2024-01-15T10:30:00Z',
        aggregateId: '550e8400-e29b-41d4-a716-446655440011',
        aggregateType: 'community',
        actorId: '550e8400-e29b-41d4-a716-446655440000',
        payload: {
          communityId: '550e8400-e29b-41d4-a716-446655440011',
          name: 'Test Community',
          slug: 'test-community',
          description: null,
          visibility: 'public',
          createdBy: '550e8400-e29b-41d4-a716-446655440000',
        },
      };
      const result = CommunityStructureEvents.CommunityCreatedEvent.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('MemberJoinedEvent', () => {
    it('should validate a valid member joined event', () => {
      const event = {
        id: '550e8400-e29b-41d4-a716-446655440012',
        type: 'community.member.joined',
        occurredAt: '2024-01-15T10:30:00Z',
        aggregateId: '550e8400-e29b-41d4-a716-446655440013',
        aggregateType: 'membership',
        actorId: '550e8400-e29b-41d4-a716-446655440001',
        payload: {
          membershipId: '550e8400-e29b-41d4-a716-446655440013',
          communityId: '550e8400-e29b-41d4-a716-446655440011',
          actorId: '550e8400-e29b-41d4-a716-446655440001',
          invitedBy: null,
          invitationToken: null,
        },
      };
      const result = CommunityStructureEvents.MemberJoinedEvent.safeParse(event);
      expect(result.success).toBe(true);
    });
  });
});

describe('Community Structure Fixtures', () => {
  it('should export test communities', () => {
    expect(CommunityStructureFixtures.testCommunity1).toBeDefined();
    expect(CommunityStructureFixtures.testCommunity2).toBeDefined();
  });

  it('should export test spaces', () => {
    expect(CommunityStructureFixtures.testSpace1).toBeDefined();
    expect(CommunityStructureFixtures.testSpace2).toBeDefined();
  });

  it('should export test channels', () => {
    expect(CommunityStructureFixtures.testChannel1).toBeDefined();
    expect(CommunityStructureFixtures.testChannel2).toBeDefined();
  });
});
