import type { RSVP } from '../../api/events';

export const testRsvpUserYes: RSVP = {
  eventId: 'e1000001-0000-0000-0000-000000000001',
  actorId: '11111111-1111-1111-1111-111111111111',  // testUser1 (user actor)
  status: 'yes',
  respondedAt: '2026-05-10T12:00:00Z',
};

export const testRsvpAgentYes: RSVP = {
  eventId: 'e1000001-0000-0000-0000-000000000001',
  actorId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',  // testAgent1 (agent actor — proves Actor model not User-only)
  status: 'yes',
  respondedAt: '2026-05-10T13:00:00Z',
};
