# Session: Team C W0 — Commerce Contracts

**Date:** 2026-05-07  
**Task:** Task 02 — Issues #6, #7, #11  
**Author:** Matt (odin-i session)

---

## What landed

- Commerce API contracts: `contracts/api/commerce/` (6 schema files + barrel)
- Commerce event contracts: `contracts/events/commerce/` (4 event files + barrel)
- Commerce fixtures: `contracts/fixtures/commerce/` (5 fixture files + validating barrel)
- Updated `contracts/events/base.event.ts` — 5 new aggregate types
- Updated `contracts/index.ts` — 3 new namespace exports

## Files created

**API contracts (`contracts/api/commerce/`)**
- `plan.contract.ts` — `PlanId`, `BillingInterval`, `PlanTier`, `Plan`, `PlanSummary`, `CreatePlanRequest`, `UpdatePlanRequest`
- `offer.contract.ts` — `OfferId`, `Offer`, `OfferSummary`, `CreateOfferRequest`
- `subscription.contract.ts` — `SubscriptionId`, `SubscriptionStatus`, `Subscription`, `SubscriptionSummary` — Actor-keyed (`actorId`, not `userId`)
- `purchase.contract.ts` — `PurchaseId`, `PurchaseStatus`, `Purchase` (with `purchaserUserId` + `granteeActorId`), `PurchaseSummary`, `PurchasePlanRequest`, `PurchasePlanResponse`
- `entitlement.contract.ts` — `EntitlementId`, `EntitlementType` (5 values), `EntitlementSource` (5 values), `Entitlement`, `EntitlementSummary`, `GrantEntitlementRequest`, `RevokeEntitlementRequest`, `CheckEntitlementRequest`, `CheckEntitlementResponse` — Actor-keyed
- `refund.contract.ts` — `RefundId`, `RefundStatus`, `Refund`, `RefundSummary`, `RefundPurchaseRequest`
- `index.ts` — barrel

**Event contracts (`contracts/events/commerce/`)**
- `purchase.events.ts` — `PurchaseInitiated`, `PurchaseCompleted`, `PurchaseFailed`
- `subscription.events.ts` — `SubscriptionActivated`, `SubscriptionRenewed`, `SubscriptionCancelled`, `SubscriptionPastDue`
- `entitlement.events.ts` — `EntitlementGranted`, `EntitlementRevoked`, `EntitlementExpired`
- `refund.events.ts` — `RefundIssued`, `RefundFailed`
- `index.ts` — barrel

**Fixtures (`contracts/fixtures/commerce/`)**
- `plans.fixture.ts` — 3 plans (pro/basic/annual) + 1 offer + tier list
- `subscriptions.fixture.ts` — active (user), cancelled (user), trialing (agent actor)
- `purchases.fixture.ts` — user→agent purchase, user self-purchase
- `entitlements.fixture.ts` — paid_membership, agent_capability (system), expired, gated_channel_access
- `refunds.fixture.ts` — processed, pending
- `index.ts` — barrel + `Schema.parse(fixture)` for all 15 fixtures at module load

**Modified**
- `contracts/events/base.event.ts` — added `'plan'`, `'offer'`, `'subscription'`, `'purchase'`, `'refund'` to `AggregateType`
- `contracts/index.ts` — `CommerceApi`, `CommerceEvents`, `CommerceFixtures` namespace exports

## Conventions followed

- Nick's pattern: `export const X = z.object(...)` + `export type X = z.infer<typeof X>`
- `createEventSchema()` helper for all events — all inherit `BaseEvent`
- Relative imports within contracts package (no `@foundry/contracts` alias inside the package)
- `actorId` (not `userId`) on all Subscription and Entitlement schemas

## Deviations

- `PurchaseStatus` and `RefundStatus` added as named exports (not explicitly in spec) — needed by request/response schemas; consistent with pattern
- Event files export `*EventTypes` const objects — matches `IdentityAccessEventTypes` precedent from Nick
- Fixture UUIDs required valid hex-only characters — initial agent used `p`, `s`, `r`, `o`, `u` prefixes (not valid hex); corrected to `b`, `c`, `d`, `e`, `f`, `a` ranges

## Verification

- `npm run typecheck` — pre-existing error only (`authenticate-api-key.use-case.test.ts`, unrelated)
- `npm test` — 433 tests, 20 files, all pass

## Open questions

- None blocking this task

## Next task

Task 03 — Events contracts (Issue #8, #12): Event/RSVP/Attendance/Reminder schemas + event-domain events
