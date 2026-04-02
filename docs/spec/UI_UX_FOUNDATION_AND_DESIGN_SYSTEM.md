# FoundryRooms — UI/UX Foundation and Design System

## Status

Proposed foundation document.

This document defines the UI/UX principles, design-system direction, frontend structure rules, and MVP interface priorities for FoundryRooms.

It is intended to sit above detailed screen specs and below the high-level product spec.

---

## 1. Purpose

FoundryRooms is a community product.
That means the interface is not decoration layered on top of the product. The interface *is* a major part of the product value.

This document exists to ensure:
- the product feels coherent across all modules
- the three delivery teams build within one visual and interaction system
- the frontend stays compatible with a Nuxt-based application model
- the UI avoids SSR/hydration pitfalls while still feeling lively and modern
- design decisions can be turned into screen specs, component work, and feature work without drift

---

## 2. Design goals

The UI must communicate five qualities:

1. **Clarity**  
   Users should understand where they are, what is new, and what they can do next.

2. **Structure**  
   Community spaces, rooms, events, documents, and membership state must feel organized rather than noisy.

3. **Liveliness**  
   The product should feel active and responsive without becoming visually chaotic.

4. **Trust**  
   Access rules, privacy, paid areas, roles, and moderation state should be legible in the interface.

5. **Mobility**  
   The experience must work cleanly on mobile web and PWA form factors, not only on desktop.

---

## 3. UX principles

### 3.1 Information architecture first
The shell must immediately answer:
- what community am I in?
- where are the discussions?
- where are events?
- where are resources?
- what is new for me?
- what access do I have?

### 3.2 Participation must be obvious
At any point, the user should understand:
- can I post here?
- can I comment here?
- can I join this?
- can I see this?
- what happens if I upgrade or join?

### 3.3 Realtime must be calm, not noisy
Live updates should improve awareness, not create distraction.
Unread counts, presence, and refresh hints should be subtle and reliable.

### 3.4 Mobile is first-class
The product must be designed for touch, constrained width, and installable web use.
PWA is the initial mobile strategy.

### 3.5 Reading quality matters
FoundryRooms is not only an action app. It is also a reading environment for posts, events, resources, and onboarding content.
Typography and spacing are product features.

---

## 4. Frontend architecture rule (Nuxt-compatible)

If Nuxt is selected, framework-required directories remain in `frontend/app/`, while actual feature logic lives under `frontend/src/`.

Recommended structure:

```text
/frontend
├── app/
│   ├── pages/
│   ├── layouts/
│   ├── middleware/
│   ├── plugins/
│   └── app.vue
└── src/
    ├── features/
    ├── components/
    ├── composables/
    ├── services/
    ├── contracts/
    └── utils/
```

### Rules
- `app/pages/` files are route entrypoints, not feature containers.
- `app/layouts/` contains app shell/layout structures.
- `src/features/` contains the real screen and feature logic.
- `src/services/` owns HTTP, SSE, and WebSocket clients.
- `src/contracts/` reflects typed frontend-facing contracts.
- UI logic should not be scattered across route files.

---

## 5. Design system direction

### 5.1 Current recommendation
If Nuxt remains the frontend direction, the recommended UI foundation is:
- Nuxt
- Tailwind CSS
- Nuxt UI as the starting component library/design-system base

This is a recommendation, not a final lock.

### 5.2 Why this is a good fit
The current Nuxt UI system is CSS-first and built around Tailwind-based design tokens and semantic colors, which fits a reusable design-system approach and cross-team consistency. It also provides a broad accessible component set for Vue/Nuxt applications.  
See Nuxt UI’s design-system guidance and component library overview.  
Sources: <https://ui.nuxt.com/docs/getting-started/theme/design-system>, <https://ui.nuxt.com/>

### 5.3 Design tokens
The product should define tokens for:
- typography
- spacing
- radius
- shadows
- borders
- semantic colors
- surface/background layers
- status colors
- breakpoints
- motion duration and easing

No feature team should hard-code visual decisions repeatedly where a token should exist.

---

## 6. Product shell model

The product should use a small number of consistent shell patterns.

### 6.1 Primary shell
For authenticated member/admin use:
- left navigation for community/space structure
- top bar for search, create actions, profile, notifications
- main content area
- optional right rail for contextual activity, event detail, or member presence

### 6.2 Content shell
For resource/document/event detail experiences:
- tighter reading width
- stronger typography hierarchy
- secondary actions clearly separated from main content

### 6.3 Mobile shell
For mobile/PWA use:
- compact top bar
- bottom navigation or compact switcher where appropriate
- simplified secondary navigation
- composer and notifications optimized for touch

---

## 7. Core navigation model

The navigation should separate three kinds of movement:

1. **Global movement**  
   Between major product areas such as home, inbox, events, resources, settings.

2. **Community movement**  
   Between spaces, rooms, or content groups.

3. **Local movement**  
   Within a page: tabs, filters, sort, thread navigation, and context panels.

This should be visually obvious so users are never unsure whether they are switching context or simply changing a filter.

---

## 8. MVP-first screen set

The first design pass should cover these screens before later long-tail features:

### 8.1 Auth and onboarding
- sign in
- sign up / invite acceptance
- email verification / password reset
- initial profile setup
- first community join flow

### 8.2 Community home
- personalized feed / community landing
- what is new
- upcoming events
- suggested areas / rooms

### 8.3 Space/channel view
- list of discussions or room activity
- pinned content
- room metadata and access state
- post composer entry

### 8.4 Discussion thread
- original post
- replies/comments
- reactions
- moderation affordances
- “new replies” or live update hinting

### 8.5 Events
- event list
- event detail
- RSVP state
- schedule / host / attendance cues

### 8.6 Resources and documents
- resource list or library
- document detail
- gated/unlocked state

### 8.7 Notifications / inbox
- in-app notification center
- unread state
- grouped activity

### 8.8 Settings and profile
- member profile
- preferences
- notification settings
- billing/access summary where relevant

### 8.9 Admin/community setup
- community configuration basics
- member management
- roles/access overview
- moderation / operations entrypoints

---

## 9. Core interaction patterns

### 9.1 Composer pattern
Composers should be consistent across:
- new posts
- replies/comments
- event comments
- admin notes where applicable

### 9.2 Status patterns
Every feature should use consistent states for:
- loading
- empty
- error
- success
- partial access / gated access
- syncing / background processing

### 9.3 Access and entitlement patterns
Paid, restricted, invite-only, and role-limited states must have a common visual language.
The user should understand whether they:
- lack access
- can request access
- can upgrade
- already have access

### 9.4 Moderation patterns
Moderation actions should be visible but not visually dominant for ordinary users.
Admin/moderator affordances should appear progressively based on role.

---

## 10. Realtime UX rules

FoundryRooms should distinguish between:
- stable page content loaded over HTTP
- one-way live UI updates
- true bidirectional realtime interaction

### 10.1 One-way live updates
Use these for:
- unread count changes
- notification stream updates
- “new content available” prompts
- background job/progress hints

### 10.2 Bidirectional realtime
Use these for:
- live chat/room activity
- presence
- typing indicators
- video room signaling or room-state activity

### 10.3 Design rule
Realtime should augment page state, not replace the page’s initial data model.
The UI should not assume that every screen is a live socket-driven surface.

---

## 11. Nuxt SSR and hydration rules

Nuxt uses file-based routing and supports server/client rendering patterns, so the UI architecture must avoid hydration mismatches and overuse of plugins.  
Sources: <https://nuxt.com/docs/getting-started/routing>, <https://nuxt.com/docs/3.x/guide/best-practices/hydration>, <https://nuxt.com/docs/3.x/guide/best-practices/plugins>

### Rules
- SSR renders the initial stable page state.
- Browser-only realtime connections start after hydration on the client.
- Avoid rendering browser-only state into SSR output.
- Use client-only rendering only where truly necessary.
- Keep plugins focused and limited; do not treat plugins as a dumping ground.
- Above-the-fold content should not rely on delayed hydration to feel usable.

Nuxt’s docs explicitly warn that hydration mismatches can break interactivity and create inconsistent state, and its plugin guidance warns that improper plugin use can create performance bottlenecks.  
Sources: <https://nuxt.com/docs/3.x/guide/best-practices/hydration>, <https://nuxt.com/docs/3.x/guide/best-practices/plugins>

---

## 12. Accessibility baseline

The design system must assume:
- keyboard accessibility
- visible focus states
- sufficient contrast
- semantic headings and landmarks
- screen-reader sensible navigation labels
- accessible dialog, menu, popover, and form patterns

This is not a phase-two concern.

---

## 13. Motion and feedback

Motion should communicate:
- hierarchy
- transitions
- success
- loading/progress
- panel changes

Motion should not:
- slow down frequent actions
- cause layout instability
- obscure state changes

Default motion should be subtle and fast.
Reduced-motion preferences must be respected.

---

## 14. Content design rules

### 14.1 Discussion content
- readable width
- clear author and timestamp hierarchy
- subtle reaction and moderation affordances
- good reply threading cues

### 14.2 Event content
- date/time prominence
- timezone clarity
- location/room clarity
- RSVP state near the primary action

### 14.3 Resource content
- clear metadata
- access state clarity
- related content links where useful

---

## 15. Cross-team design governance

To avoid three teams inventing three interfaces, the following rules apply:
- all shared visual tokens are centralized
- shared shell/navigation components are centralized
- no team creates competing component variants without review
- reusable components must be documented before broad reuse
- page-level design changes that affect other teams must be reviewed centrally

The governor owns the baseline design system and shell rules until a dedicated design function exists.

---

## 16. Recommended next design artifacts

This document should be followed by:
- screen inventory
- navigation map
- component inventory
- state pattern catalog
- design token file
- low-fidelity wireframes for the MVP-first screen set
- high-fidelity shell and design-system explorations

---

## 17. Summary

FoundryRooms should use:
- a consistent app shell
- a central design system
- feature-based frontend logic
- Nuxt route conventions without letting route files become the app architecture
- hydration-safe realtime patterns
- mobile/PWA-aware layouts from the start

The UI should feel structured, alive, and trustworthy.
