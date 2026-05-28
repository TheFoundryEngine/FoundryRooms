import type { Reminder } from '../../api/events';

export const testReminderScheduled: Reminder = {
  id: 'e4000001-0000-0000-0000-000000000001',
  eventId: 'e1000001-0000-0000-0000-000000000001',
  targetActorId: '11111111-1111-1111-1111-111111111111',
  fireAt: '2026-06-01T17:00:00Z',
  status: 'scheduled',
};

export const testReminderSent: Reminder = {
  id: 'e4000002-0000-0000-0000-000000000002',
  eventId: 'e1000002-0000-0000-0000-000000000002',
  targetActorId: '22222222-2222-2222-2222-222222222222',
  fireAt: '2026-06-08T17:00:00Z',
  status: 'sent',
};
