# MyAuditionPal — Design Ideas

_Last updated: 2026-06-14_

---

## What Is This App?

A mobile-first application for classical musicians who audition. It aggregates audition listings from across the web, lets musicians track the auditions they're interested in, and builds a personal history of every audition they've ever taken.

---

## Core User Flow (as described)

1. **Opening / Instrument Selection Screen**
   - User selects their instrument from a list of classical instruments.
   - Selection filters all subsequent content to that instrument.

2. **Audition Listings Page**
   - Pulls from multiple external websites to compile a comprehensive list of auditions available for the selected instrument.
   - Each listing shows relevant details (orchestra/ensemble, position, location, deadline, date, pay/tier, etc.).
   - User can "heart" / save auditions they're interested in.

3. **My Auditions / Tracking**
   - User marks which auditions they've signed up for.
   - App maintains a timeline of all auditions — past, present, and future — for that user.
   - History is persistent and personal to each user account.

---

## Key Features (initial list)

- Instrument-based filtering
- Web scraping / aggregation from multiple audition listing sites
- "Heart" / wishlist system for auditions of interest
- Sign-up tracking (applied, scheduled, completed)
- Personal audition history (chronological log)
- Mobile-first (iOS/Android), developed initially on macOS

---

## Decisions Locked (2026-06-14)

- **Authentication:** Guest mode first — anyone can browse listings without an account, but saving ("hearting"), tracking, and history require signing in. (Apple/Google social login favored later for low-friction mobile onboarding.)
- **Monetization:** Free at launch. Architecture must leave the door open for a future paid/freemium tier without a rewrite.
- **Team:** Solo developer, early in their dev journey. Favor simpler stacks, managed services, and well-explained steps.
- **Core value (PRIMARY):** **Active tracking** — managing in-flight auditions (deadlines, prep, status) is the day-to-day hook.
  - **Long-term moat:** the historical record (permanent personal archive of every audition taken).
  - **Later enhancement:** discovery (web-scraped aggregated listings) — most valuable for acquisition but hardest to build/maintain; deferred past the first version.
  - Insight: active tracking and historical record share the *same underlying data model* (an audition record with a status field), so building one largely delivers the other.

---

## UX Decisions (2026-06-14)

### Audition lifecycle (the backbone data model)
A single audition record moves through stages over time via a `status` field:
`Interested (hearted) → Applied → Confirmed/Scheduled → Attended → Result (advanced / cut / offer / declined / accepted)`
- "Active tracking" = everything before Result. "History" = Result stage. Same data, two lenses.

### Navigation: bottom tab bar, four tabs
1. **🎯 My Auditions** (home / default screen) — Upcoming (deadlines & dates approaching) + In progress (applied, awaiting word). Each row shows ensemble, position, and the next thing that matters.
2. **➕ Add / Browse** — v1: manually add an audition via a form. Later: becomes the discovery feed once scraping exists. (Build the slot now, fill later.)
3. **📜 History** — completed auditions, newest first; results, private notes, rep prepared. Empty at first, fills naturally, becomes the sticky archive.
4. **👤 Profile / Settings** — instrument(s), account, preferences. Added once accounts exist.

### Instrument handling
- **Captured first** during onboarding (the first thing a new user picks).
- **Stored as a profile setting** (changeable later in Settings).
- **Used to filter discovery** once that feature ships — a cellist never sees trumpet auditions. (Strong user requirement: eliminate irrelevant cross-instrument listings.)
- In v1 (no discovery yet) instrument mainly personalizes the app and prepares for scraping.

### v1 scope insight
Version 1 needs NO web scraping. A musician gets real value by manually adding auditions they know about and letting the app organize, remind, and remember. Scraping/discovery is a "make it magical later" enhancement, not a launch dependency.

### First-run experience (solving the empty-state problem)
A brand-new user has empty tracking + empty history, so the app could feel useless on day one. Solution — a **friendly first-run prompt** right after instrument selection:

> _"Add an audition you're preparing for, or one you've already taken."_

- Offering **"already taken"** is key: it lets the user populate History immediately by reflecting on a *past* audition, so the app delivers value in the first minute even before they have anything upcoming.
- This turns onboarding into instant payoff: pick instrument → add a first audition → the app is already "theirs."
- The prompt should feel encouraging and low-pressure, not like a required form wall.

---

## Visual Design / Color Scheme (2026-06-14)

**Goal:** A neutral, calm color scheme — pinks, beiges, and whites — to make the interface feel soothing. Auditioning is stressful; the app should feel like a reassuring companion, not another source of pressure.

**Proposed starter palette** (to be refined; hex values are a starting point):
- **Background / base:** soft white / warm off-white — e.g. `#FDFBF7` (warm white), `#F7F1E8` (light beige)
- **Surface / cards:** pale beige — e.g. `#F3E9DD`
- **Primary accent:** muted/dusty pink — e.g. `#E8B4B8` or `#D9A5A0`
- **Secondary accent / deeper pink:** e.g. `#C98A8A` for buttons/highlights
- **Text:** soft dark brown/charcoal (avoid harsh pure black) — e.g. `#4A3F3A`
- **Subtle status colors:** keep gentle/desaturated even for alerts (e.g. dusty terracotta for deadlines rather than alarming red).

**Principles:**
- Low contrast where calm matters; sufficient contrast where readability/accessibility matters (meet WCAG AA for text).
- Avoid harsh, saturated, or alarming colors — even deadline warnings stay gentle.
- Generous whitespace and rounded corners reinforce the calm feel.

---

## Open Questions & Ideas to Discuss

- Which audition listing websites should be scraped/integrated?
- Should users create accounts, or can some features work anonymously?
- What additional data should be tracked per audition (notes, results, round reached, etc.)?
- Should there be notification/reminder support for upcoming deadlines?
- Could users share or compare audition lists with peers?
- Is there value in a community feed or "others are auditioning for this too" signal?
- Should the app support multiple instruments per user (doubling musicians, etc.)?
- Role-based use: student vs. professional vs. teacher tracking students?

---

## Platform

- **Primary target:** Mobile (iOS first, then Android)
- **Development machine:** MacBook (macOS)
- **Build approach:** TBD — React Native / Expo likely candidate for cross-platform mobile

---

## Notes

_This file is a living document. Add new ideas here as they emerge._
