export * from './event.events';
export * from './rsvp.events';
export * from './attendance.events';
export * from './reminder.events';

export const EventsEventTypes = {
  EVENT_CREATED: 'events.event.created',
  EVENT_SCHEDULED: 'events.event.scheduled',
  EVENT_UPDATED: 'events.event.updated',
  EVENT_CANCELLED: 'events.event.cancelled',
  RSVPED: 'events.rsvp.created',
  RSVP_CANCELLED: 'events.rsvp.cancelled',
  ATTENDANCE_MARKED: 'events.attendance.marked',
  REMINDER_SCHEDULED: 'events.reminder.scheduled',
  REMINDER_SENT: 'events.reminder.sent',
  REMINDER_FAILED: 'events.reminder.failed',
  REMINDER_CANCELLED: 'events.reminder.cancelled',
} as const;
