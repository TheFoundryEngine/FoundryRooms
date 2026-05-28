# Session Note — Team C Wave 0: Events Contracts

**Date:** 2026-05-21  
**Task:** 03 — Events Contracts (API + Events + Fixtures)  
**Branch:** feat/team-c/wave-0-events-contracts

## AggregateType Entries Added

Four new entries appended to `AggregateType` enum in `contracts/events/base.event.ts`:
- `event`
- `rsvp`
- `attendance`
- `reminder`

## Files Created (16 new files + 2 edits)

**API contracts (`contracts/api/events/`):**
- `event.contract.ts` — EventId, EventVisibility, Timezone, Event, EventSummary, CreateEventRequest, UpdateEventRequest, CancelEventRequest
- `rsvp.contract.ts` — RsvpStatus, RSVP, RsvpRequest, CancelRsvpRequest
- `attendance.contract.ts` — Attendance, MarkAttendedRequest
- `reminder.contract.ts` — ReminderStatus, Reminder, ReminderSummary
- `index.ts` — barrel re-export

**Domain events (`contracts/events/events/`):**
- `event.events.ts` — EventCreated, EventScheduled, EventUpdated, EventCancelled (aggregateType: 'event')
- `rsvp.events.ts` — RSVPed, RSVPCancelled (aggregateType: 'rsvp')
- `attendance.events.ts` — AttendanceMarked (aggregateType: 'attendance')
- `reminder.events.ts` — ReminderScheduled, ReminderSent, ReminderFailed, ReminderCancelled (aggregateType: 'reminder')
- `index.ts` — barrel re-export + EventsEventTypes const-map

**Fixtures (`contracts/fixtures/events/`):**
- `events.fixture.ts` — 3 Event values: public, members_only, entitlement_gated
- `rsvps.fixture.ts` — 2 RSVP values: user yes-RSVP + agent yes-RSVP (proves Actor model works for agents)
- `attendances.fixture.ts` — 1 Attendance value
- `reminders.fixture.ts` — 2 Reminder values: scheduled + sent
- `index.ts` — parse-validates all 8 fixtures at module load (L13 safety net)

**Modified files:**
- `contracts/events/base.event.ts` — AggregateType enum extended (only change)
- `contracts/index.ts` — 3 new namespace exports added

## Fixture Count
- 8 total fixture instances across 4 fixture files
- All cross-referenced by deterministic UUIDs (e1000001-... prefix for events)

## Conventions

All conventions match commerce precedent:
- camelCase field names throughout (zero snake_case)
- Actor fields end in `ActorId` (hostActorId, markedByActorId, targetActorId, actorId)
- Every domain event uses `createEventSchema(...)` factory — no manual BaseEvent extension
- Event type strings follow `events.<aggregate>.<action>` (e.g. `events.rsvp.created`)
- `EventsEventTypes` const-map at bottom of events barrel

## Decision: Timezone validation

Used `z.string().min(1)` fallback for `Timezone` field. `Intl.supportedValuesOf('timeZone')` is available at Node 20 runtime, but TypeScript's `lib: ["ES2022"]` target may not include the declaration depending on exact TS version. Fallback keeps typecheck clean without adding dependencies. Comment in source explains the trade-off.
