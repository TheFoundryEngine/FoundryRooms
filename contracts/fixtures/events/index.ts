import {
  Event,
  RSVP,
  Attendance,
  Reminder,
} from '../../api/events';

export * from './events.fixture';
export * from './rsvps.fixture';
export * from './attendances.fixture';
export * from './reminders.fixture';

import {
  testEventPublic,
  testEventMembersOnly,
  testEventEntitlementGated,
} from './events.fixture';
import {
  testRsvpUserYes,
  testRsvpAgentYes,
} from './rsvps.fixture';
import { testAttendance } from './attendances.fixture';
import {
  testReminderScheduled,
  testReminderSent,
} from './reminders.fixture';

// Parse-validate all fixtures against their schemas at module load.
// If a schema changes without updating fixtures, this will throw at import time.
Event.parse(testEventPublic);
Event.parse(testEventMembersOnly);
Event.parse(testEventEntitlementGated);
RSVP.parse(testRsvpUserYes);
RSVP.parse(testRsvpAgentYes);
Attendance.parse(testAttendance);
Reminder.parse(testReminderScheduled);
Reminder.parse(testReminderSent);
