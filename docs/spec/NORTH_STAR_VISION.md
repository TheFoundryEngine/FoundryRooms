# FoundryRooms — North-Star Vision

## Status

Vision document. This is the north star — the full picture of what FoundryRooms
becomes. It sits above the high-level spec and below the company mission.

It is not a release plan. It is the conceptual anchor that every ADR, feature
decision, and design choice should be traceable back to.

## Design standard

FoundryRooms must look and feel like a product crafted by a world-class design
team — not like an AI-generated prototype. Every visual decision, interaction
pattern, and content surface should reflect the polish, intentionality, and
taste that engineers expect from premium developer tools.

**Claude Design** is the design team behind FoundryRooms. All visual identity,
component design, spatial rendering, and user experience flows are owned and
crafted by Claude Design. The engineering teams implement against Claude
Design's specifications — they do not improvise visual decisions.

This means:
- No generic, template-looking UI. The product should feel distinctive.
- No "AI-generated" aesthetic — clean typography, intentional spacing,
  considered color, purposeful motion. Every pixel earns its place.
- Design specs from Claude Design are treated as contracts, not suggestions.
  Team D (Design & UX) translates Claude Design's work into the token system
  and component specs that Team B implements.
- The spatial metaphor (section 5) must feel architectural and considered,
  not gamified or cartoonish. Think "beautiful virtual building," not
  "pixel art game."

---

## 1. The Problem

Engineers don't have a community platform built for them.

What exists today is fragmented across tools that each solve part of the problem
but none of which solve the whole one:

- **Discord/Slack** — real-time chat, but conversations disappear into a scroll.
  No structure, no knowledge persistence, no relationship depth. A new member
  joining a 10,000-person Discord feels like arriving in a crowded room where
  everyone already knows each other.
- **GitHub** — where code lives, but not where relationships form. Issues and
  PRs are transactional, not relational. You know someone's code, not the person.
- **Reddit/HN/Lobsters** — link aggregation and discussion, but no belonging.
  No membership, no identity continuity, no community ownership.
- **Circle/Mighty/Patreon** — community platforms built for creators, not
  engineers. No code, no artifacts, no collaborative building.
- **Twitter/X** — broadcast, not community. Following is not belonging.

The result: engineers form communities in tools that weren't designed for
community. Knowledge is lost. Relationships are shallow. Onboarding is
overwhelming. Community health is invisible. And when someone wants to build
something with the people they've met, they leave the community platform and
go somewhere else.

---

## 2. The Vision

**FoundryRooms is the community platform where engineers belong, learn, and build together.**

It is not a chat app with extra features. It is not a forum. It is not a code
hosting platform. It is a **relational community operating system** designed
for the specific way engineers connect, share, and create.

The vision has three layers, each building on the last:

### Layer 1: Relational Foundation
A community where members are people, not avatars in a scroll. Where joining
a community means being introduced, not dropped into a channel. Where your
history, contributions, and relationships are visible and persistent. Where
community health is measured in relationships formed, not messages sent.

### Layer 2: AI-Native Community Operations
AI agents as first-class community participants — not chatbots, but active
members of the community operations team. They onboard new members, surface
relevant discussions, moderate with context, generate community health
reports, and help community leaders make decisions. The AI doesn't replace
human connection — it removes the operational overhead that prevents it.

### Layer 3: Collaborative Building
When engineers meet in a community and want to build something together, they
don't leave the platform. FoundryRooms evolves from a community platform into
a collaborative builder — real-time rooms where engineers can pair program,
review code, co-author documents, and build shared artifacts. The community
becomes the workspace.

---

## 3. Why This Hasn't Been Done

The reason no platform combines all three is that each layer is a complete
product on its own:

- Building a **relational community platform** is a full product (Circle, Mighty,
  Heartbeat). Most stop here.
- Adding **AI-native operations** requires deep integration with community
  data, member behavior, and content — not a bolt-on chatbot. Most platforms
  treat AI as a feature, not a participant.
- Adding **collaborative building** requires real-time infrastructure, code
  execution, artifact management, and a fundamentally different interaction
  model. Most community platforms don't attempt this at all.

FoundryRooms is designed from the ground up to support all three. The
architecture (modular monolith, bounded contexts, contract-first) was chosen
specifically so that each layer can be built without rewriting the previous one.
The community structure (Layer 1) is the foundation. AI agents (Layer 2) plug
into the same event system and bounded contexts. Collaborative rooms (Layer 3)
are a future bounded context, not a separate product.

---

## 4. Core Philosophy

### 4.1 Relationships over feeds
The fundamental unit of a community is a relationship, not a post. The platform
should help members form, maintain, and deepen relationships — not just
broadcast content at them.

**Implications:**
- Member profiles are rich, persistent, and contribution-aware
- Onboarding is structured — new members are introduced, not dumped in
- The platform tracks relationship formation, not just message volume
- Community health metrics measure connection depth, not engagement metrics
- "Who should I talk to?" is a first-class question the platform answers

### 4.2 Knowledge has a home
In Discord, a great answer is lost in 500 messages by tomorrow. In FoundryRooms,
knowledge emerges from conversations and has a permanent home.

**Implications:**
- Discussions can be elevated to resources — a thread becomes a document
- Community knowledge accumulates over time, organized by the community
- Search is a first-class capability, not an afterthought
- The platform remembers what the community has learned
- Experts are discoverable — "who knows about X" is answerable

### 4.3 AI as a community member, not a tool
AI agents participate in the community's operations. They are not a chatbot
in a channel. They are active participants who:
- Welcome new members with context-aware introductions
- Surface relevant discussions to members who would care
- Moderate with understanding of community norms, not keyword matching
- Generate community health reports for leaders
- Identify at-risk members and suggest outreach
- Help members find the right people to talk to

**Implications:**
- AI agents have identities, roles, and permissions — just like human members
- Agent actions are auditable and reviewable by community leaders
- Agents operate within bounded contexts — they don't have god access
- The community can configure what agents do and don't do
- Agent behavior is governed by the same contract system as everything else

### 4.4 Building happens where belonging is
When engineers want to build something together, they shouldn't have to leave
the community to do it. The community platform should evolve into the
collaborative workspace.

**Implications:**
- Rooms are a future bounded context, not a separate product
- A room can be spawned from a discussion, an event, or a project
- Room participants are community members — no separate identity
- Room artifacts (code, documents, diagrams) belong to the community
- The community's knowledge graph includes what was built, not just what was said

### 4.5 Community-owned, not platform-owned
The community belongs to its leaders and members, not to FoundryRooms. The
platform is infrastructure. The community is the product of its people.

**Implications:**
- Community data is exportable
- Community leaders control their community's rules, structure, and moderation
- The platform doesn't lock communities in
- Self-hosting is a first-class option, not an afterthought
- The platform's success is measured by community health, not platform metrics

---

## 5. The Spatial Community Metaphor

### 5.1 Why spatial

Every existing community platform is a feed. Discord is a scrolling chat. Circle
is a scrolling post list. Reddit is a scrolling link list. The feed is the
default — and the feed is the problem. Feeds optimize for consumption, not
connection. You scroll past people, you don't sit with them.

FoundryRooms treats the community as a **place**, not a feed. Members enter
spaces, see who's present, find resources on the walls, join discussions at
tables, and build things in workshops. The spatial metaphor makes community
feel like belonging somewhere, not consuming something.

This is not a game engine. It's a UI metaphor that makes the community feel
like a place you *are* rather than a stream you *watch*.

### 5.2 Hybrid rendering

Every space in FoundryRooms can be experienced in two modes:

**List view (default, always available):**
- Clean, fast, information-dense
- Discussions as structured threads
- Resources as organized lists
- Presence as "active now" indicators
- This is the productivity view — for when you want to get things done

**Spatial view (optional, per-space):**
- The space renders as a visual room — a 2D environment with areas
- Members who are currently active appear as avatars in the space
- Resources are displayed on "walls" — visible when you enter
- Discussions happen at "tables" — you can see who's in a conversation
- Events have a "stage" area — scheduled gatherings have a visual home
- This is the belonging view — for when you want to feel the community

Members can switch between modes per space. Some spaces default to list view
(technical discussions, resources). Some default to spatial view (events,
casual hangout spaces, collaborative rooms). The community leader configures
the default per space.

### 5.3 Presence as a first-class concept

The spatial metaphor is powered by **presence** — knowing who's in a space
right now.

- When you enter a space, you're visible to others in that space
- You can see who else is currently in the space with you
- Presence is passive — you don't have to post to be "there"
- Presence creates serendipity — "oh, Sarah's in the Rust space, I've been
  meaning to ask her about that PR"
- Presence is respectful — you can go "invisible" or "focus mode" when you
  want to read without being disturbed

This is the hallway conversation effect — the most valuable interactions in
any community are the unplanned ones. Feeds don't create hallway conversations.
Spatial presence does.

### 5.4 How the spatial metaphor scales across the three layers

**Layer 1 (Relational Foundation):**
- Spaces feel like rooms — you enter, you see who's here, you see what's on
  the walls
- Presence indicators show active members per space
- Resources are visually "pinned" in spaces
- List view is the default for most spaces
- Spatial view is available but optional

**Layer 2 (AI-Native Operations):**
- AI agents have visible presence in spaces — you can see which agents are
  active and what they're doing
- An AI agent can "greet" you when you enter a space, like a host at a building
- Community health is visualized as "building health" — a spatial dashboard
  showing which spaces are thriving, which are quiet, which need attention
- The AI can suggest "you should visit the Systems space — there's an active
  discussion about exactly the problem you mentioned yesterday"

**Layer 3 (Collaborative Building):**
- Collaborative rooms are the natural home of the spatial view
- You "walk into" a room and see who's there, what's being built, what's on
  the screen
- Room artifacts are "placed" in the community space after the session —
  visible to others, linked to the discussion that spawned them
- The spatial view becomes the primary interface for collaborative work
- Avatars, cursors, and real-time presence make the room feel alive

### 5.5 What we are not doing

- **Not a 3D world** — 2D spatial rendering, not a metaverse
- **Not avatar customization as a feature** — avatars are functional (presence,
  identity), not a dress-up game
- **Not XP or levels** — reputation is earned through contribution and
  recognized by the community, not awarded by a points system
- **Not mandatory spatial** — the list view is always available and always
  complete. No one is forced into the spatial view.
- **Not a game** — the spatial metaphor serves community connection, not
  entertainment. There are no quests, no scores, no winners.
- **Not AI-generated aesthetics** — the spatial rendering and all visual design
  is crafted by Claude Design to feel architectural, polished, and intentional.
  No generic templates, no "default Tailwind" look, no cartoonish gamification.

### 5.6 Reputation and progression (engineer-respected)

Engineers don't respect badges. They respect contribution. FoundryRooms
recognizes contribution through **community-earned reputation**, not
gamification mechanics:

- **Contribution history** — your profile shows what you've built, answered,
  and contributed. This is your reputation. It's factual, not a score.
- **Community recognition** — other members can "vouch" for your expertise in
  a topic. Vouches are public and come from people, not algorithms.
- **Progressive access** — as you contribute, more capabilities unlock
  (create resources, host events, spawn rooms). This is about trust, not
  levels.
- **Community health visualization** — leaders see the community as a living
  space: which areas are thriving, which need attention, who's contributing
  where. This is operational intelligence, not a leaderboard.

The spatial metaphor makes this visible — you can see who the community
relies on, not because they have a badge, but because they're the ones
consistently in the space, helping, building, and connecting.

---

## 6. The Engineer Community Experience

### 5.1 What a new member experiences

A new engineer joins a FoundryRooms community. They don't land in a chat
channel with 500 people they don't know.

1. **Guided onboarding** — The platform walks them through the community's
   structure: what spaces exist, what's discussed where, who the key people are.
2. **AI introduction** — An AI agent reads their profile, their interests, and
   the community's current state, then introduces them to 2-3 members with
   shared interests and suggests 2-3 discussions or resources to start with.
3. **Progressive access** — They start with read access to public spaces. As
   they participate, they earn access to more areas (or the community leader
   grants it). The platform makes the access journey visible.
4. **First contribution** — The platform suggests low-friction ways to
   contribute: answer a question, react to a post, join an event. The first
   contribution is celebrated.
5. **Relationship formation** — Within their first week, the platform has
   helped them have at least one real interaction with another member. This
   is the metric that matters.

### 5.2 What a daily experience looks like

An engineer opens FoundryRooms in the morning.

1. **"What's new for you"** — Not a firehose feed. A personalized view of:
   - discussions they'd care about (based on interests, past participation)
   - replies to their posts and comments
   - events coming up
   - members who've joined or reached out
2. **Deep work in spaces** — They navigate to a space they care about. The
   discussion view is structured: pinned content, active threads, knowledge
   that's been elevated to resources. They can read, contribute, or start
   a new discussion.
3. **Real-time when it matters** — Live updates are calm: unread counts,
   presence indicators, "new replies" hints. Not a constant stream of
   notifications.
4. **Building together** — When a discussion turns into "let's build this,"
   they spawn a room. The room is a collaborative space: shared code editor,
   document co-authoring, artifact sharing. The room is linked back to the
   discussion that spawned it. When the work is done, the artifact becomes a
   community resource.
5. **Community health visibility** — Community leaders see a health dashboard:
   new member retention, relationship formation rate, contribution distribution,
   at-risk members, knowledge growth. Not vanity metrics.

### 5.3 What a community leader experiences

A community leader runs a 500-engineer community.

1. **Community setup** — They define spaces, access rules, membership tiers,
   and community norms. The platform guides them through best practices.
2. **AI-assisted operations** — AI agents handle routine moderation, welcome
   new members, flag concerning patterns, and draft community updates. The
   leader reviews and approves, not does from scratch.
3. **Health dashboard** — They see:
   - Are new members staying? (retention)
   - Are relationships forming? (connection depth)
   - Is knowledge accumulating? (resource growth)
   - Is participation distributed or concentrated? (health distribution)
   - Who's at risk of leaving? (engagement decline)
4. **Event hosting** — They create events (AMAs, workshops, pair-programming
   sessions). The platform handles RSVP, reminders, attendance tracking, and
   post-event follow-up.
5. **Monetization** — If they run a paid community, they manage memberships,
   tiers, gated content, and entitlements — all in the same platform. Commerce
   is a first-class part of community operations, not a separate tool.

---

## 6. The Three Layers in Detail

### Layer 1: Relational Foundation (v1)

**What it is:** A complete community platform built around relationships,
knowledge, and structured engagement.

**What it is not:** A chat app. A forum. A social network.

**Core capabilities:**

| Capability | What it does | Why it matters |
|-----------|-------------|----------------|
| Member identity | Rich profiles with skills, interests, contribution history | Members are people, not avatars |
| Community structure | Spaces, channels, and content organized by purpose | Reduces noise, increases signal |
| Discussions | Posts, threads, reactions, mentions — structured, not chaotic | Knowledge emerges from conversation |
| Resources | Documents and links that persist and are organized | Knowledge has a home |
| Events | Scheduled gatherings with RSVP and reminders | Community forms around shared time |
| Memberships | Free and paid tiers with gated access | Communities can sustain themselves |
| Notifications | Calm, relevant, preference-controlled | Awareness without overwhelm |
| Moderation | Progressive, role-based, auditable | Communities stay healthy |
| Admin & reporting | Community health dashboard for leaders | Leaders can steer, not just react |

**What makes it different:**
- Onboarding is structured, not "good luck in the channel"
- Member profiles show contribution history, not just a bio
- Discussions can be elevated to permanent resources
- Community health is measured in relationships, not message volume
- The platform is designed for engineers (code blocks, technical formatting,
  project links, artifact references)

**Status:** In active development. Wave-1 foundation complete (auth, frontend
shell, worker runtime, design system). See `HIGH_LEVEL_SPEC.md` for the full
v1 spec.

### Layer 2: AI-Native Community Operations (v2)

**What it is:** AI agents as first-class community participants that handle
operational overhead and enhance human connection.

**What it is not:** A chatbot. A "summarize this thread" feature. A bolt-on LLM.

**Core capabilities:**

| Capability | What it does | Why it matters |
|-----------|-------------|----------------|
| AI onboarding | Personalized introductions, suggested connections, content recommendations | New members don't get lost |
| AI moderation | Context-aware content moderation, norm enforcement, spam detection | Communities stay healthy at scale |
| AI matchmaking | "Who should I talk to?" — surfaces members with shared interests | Relationships form faster |
| AI knowledge curation | Elevates valuable discussions to resources, tags and organizes content | Knowledge doesn't get lost |
| AI community health | Pattern detection, at-risk member identification, leader recommendations | Leaders can act before problems escalate |
| AI event assistance | Drafts event descriptions, suggests timing, generates post-event summaries | Events are easier to run |
| AI content assistance | Helps members draft posts, format code, structure questions | Participation friction drops |

**Architectural implications:**
- AI agents are modeled as `ActorType: 'agent'` in the identity system (already
  built in Layer 1 — see `actor.entity.ts`)
- Agents operate through the same bounded contexts and contracts as human members
- Agent actions are auditable — every action is logged with agent identity
- Agent behavior is configurable per community — leaders control what agents do
- Agents consume domain events and produce domain events — they're part of the
  event-driven architecture, not a separate system
- The AI provider strategy is pluggable (OpenRouter, local models, etc.) —
  see reserved ADR-014

**What makes it different:**
- The AI is a participant, not a tool. It has an identity, a role, and
  accountability.
- The AI's intelligence comes from deep integration with community data —
  it knows the community's history, members, and norms.
- The AI enhances human connection rather than replacing it. It does the
  operational work so humans can focus on relationships.

### Layer 3: Collaborative Building (v3)

**What it is:** Real-time collaborative rooms where engineers build together
— code, documents, artifacts — without leaving the community.

**What it is not:** A full IDE. A GitHub replacement. A browser-based VS Code.

**Core capabilities:**

| Capability | What it does | Why it matters |
|-----------|-------------|----------------|
| Collaborative rooms | Real-time shared workspace: code editor, document co-authoring, whiteboard | Building happens where belonging is |
| Room spawning | Rooms spawn from discussions, events, or projects | Collaboration emerges from conversation |
| Artifact management | Room outputs become community resources | What was built belongs to the community |
| Pair programming | Shared code editing with presence and cursor awareness | Engineers can build together in real time |
| Code review | In-context review within rooms, linked to community discussions | Review is a community activity |
| Project spaces | Persistent rooms tied to ongoing projects | Projects have a home in the community |
| Room recording | Sessions can be recorded and shared as community resources | Knowledge from building persists |

**Architectural implications:**
- Rooms are a new bounded context (`collaboration`) — see reserved ADR-013
- Real-time infrastructure (WebSocket, CRDT) is added to the interaction model
  (currently HTTP + SSE per ADR-012)
- Room artifacts are stored in object storage and linked to community resources
- Room access is governed by the same entitlement system as everything else
- Room participants are community members — no separate identity or auth
- The room system is optional — communities can be great without ever using it

**What makes it different:**
- The room is not a separate product. It's a natural extension of the community.
- A room is spawned from a discussion, not from a separate "create workspace"
  flow. The context of why the room exists is preserved.
- When the work is done, the artifact becomes a community resource. The
  community's knowledge graph includes what was built, not just what was said.
- The community owns the artifacts, not the platform.

---

## 7. How the Layers Connect

The three layers are not three products. They are one product at three levels
of maturity:

```
Layer 3: Collaborative Building
    │  Rooms spawn from discussions
    │  Artifacts become community resources
    │  Building happens where belonging is
    │
Layer 2: AI-Native Operations
    │  Agents onboard, moderate, curate, matchmake
    │  AI removes operational overhead
    │  Human connection is enhanced, not replaced
    │
Layer 1: Relational Foundation
    │  Members are people, not avatars
    │  Knowledge has a home
    │  Community health is measured in relationships
    │
    └─── Foundation: modular monolith, bounded contexts,
         contract-first, governed delivery
```

**The key insight:** Each layer is built on the same architecture. The
modular monolith, bounded contexts, and contract-first design from Layer 1
are what make Layers 2 and 3 possible without rewrites.

- AI agents (Layer 2) plug into the event system and bounded contexts from
  Layer 1. They don't need a new architecture — they need new handlers for
  existing events.
- Collaborative rooms (Layer 3) are a new bounded context. They use the same
  identity, entitlement, and community structure systems from Layer 1. They
  don't need a new product — they need a new context.

---

## 8. Design Principles for the Vision

### 8.1 Calm technology
FoundryRooms should not compete for attention. Notifications are deliberate.
Real-time is calm. The platform should feel like a library with a workshop
in the back, not a casino.

### 8.2 Progressive depth
A new member can participate at surface level (read, react, comment). As they
go deeper, more capabilities unlock: post, create resources, host events,
spawn rooms. The depth is always available but never forced.

### 8.3 Engineer-native defaults
Code blocks with syntax highlighting. Technical formatting. Project links.
Artifact references. Stack traces in discussions. These are defaults, not
plugins. The platform is designed for the way engineers communicate.

### 8.4 Community sovereignty
The community belongs to its people. Data is exportable. Self-hosting is
supported. The platform is infrastructure, not a landlord.

### 8.5 Honest metrics
The platform measures what matters: relationship formation, knowledge growth,
member retention, contribution distribution. Not DAU, not message volume, not
engagement theater.

### 8.6 AI transparency
AI agent actions are visible. Members know when they're interacting with an
agent. Agent decisions are reviewable. The community can audit what the AI
did and why.

---

## 9. Competitive Landscape

| Platform | Relational Depth | Knowledge Persistence | AI-Native | Collaborative Building | Engineer-Native |
|----------|-----------------|----------------------|-----------|----------------------|----------------|
| Discord | Low | None | Bolt-on | No | Partial |
| Slack | Low | None | Bolt-on | No | Partial |
| GitHub Discussions | Low | Medium | No | No | Yes |
| Circle/Mighty | Medium | Medium | No | No | No |
| Heartbeat | Medium | Medium | No | No | No |
| Reddit | Low | Low | No | No | Partial |
| **FoundryRooms** | **High** | **High** | **Native** | **Future** | **Yes** |

The gap: no platform combines relational depth, knowledge persistence, and
AI-native operations in a way designed for engineers. FoundryRooms is built
to own that gap.

---

## 10. Success Criteria

### Layer 1 success (Relational Foundation)
- A new member forms at least one meaningful connection in their first week
- Community knowledge grows over time (resources accumulate, not just messages)
- Community leaders can see and act on community health
- Members prefer FoundryRooms to Discord for their engineer community

### Layer 2 success (AI-Native Operations)
- Community leaders spend 80% less time on operational tasks (moderation,
  onboarding, content curation)
- New member retention improves by 30%+ due to AI-assisted onboarding
- Members report that AI recommendations helped them find relevant content
  and people
- AI agent actions are trusted and auditable — no "black box" concerns

### Layer 3 success (Collaborative Building)
- Engineers spawn rooms from discussions without leaving the community
- Room artifacts become permanent community resources
- Communities report that collaborative rooms deepened member relationships
- The community platform and the workspace are the same place

---

## 11. Relationship to Existing Specs

This vision document is the parent of:

- `HIGH_LEVEL_SPEC.md` — the v1 product and architecture spec (Layer 1)
- `UI_UX_FOUNDATION_AND_DESIGN_SYSTEM.md` — the UI/UX foundation for Layer 1
- `CAPABILITY_MAP_AND_EPIC_BREAKDOWN.md` — the capability breakdown across teams
- All global ADRs (ADR-001 through ADR-012) — the architectural law
- All feature ADRs — team-level implementation decisions

Future documents this vision will drive:

- Layer 2 spec — AI agent architecture, agent identity model, agent capability
  contracts, provider strategy (ADR-014)
- Layer 3 spec — Collaborative rooms architecture, real-time interaction model,
  artifact management (ADR-013)
- Community health metrics spec — how relational depth, knowledge growth, and
  member retention are measured

---

## 12. What This Vision Is Not

- It is not a chat app with AI and rooms bolted on
- It is not a GitHub competitor
- It is not an LMS or course platform
- It is not a social network
- It is not a "community for everyone" — it is a community platform for engineers
- It is not vaporware — Layer 1 is in active development with working code,
  tests, and architecture enforcement
- It is not a moonshot — each layer is a real product that delivers value
  independently

---

## 13. Summary

FoundryRooms is the community platform where engineers belong, learn, and
build together.

It starts with a relational foundation that treats members as people and
knowledge as permanent. It adds AI-native operations that remove the
overhead of running a community. It evolves into a collaborative builder
where engineers create together without leaving the community they belong to.

The architecture was designed for this from day one. The modular monolith,
bounded contexts, and contract-first delivery model are not accidents — they
are the foundation that makes the three-layer vision buildable without rewrites.

**The north star:** A community platform where the community is the product,
the AI is a participant, and the workspace is the community.
