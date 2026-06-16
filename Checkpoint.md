# MyAuditionPal — Checkpoint / Handoff

_Last updated: 2026-06-15_
_Purpose: A handoff for the next agent. Read this first, then `Planning/ImplementationPlan.md` and `Planning/Ideas.md` for the original vision._

GitHub: https://github.com/violarocks16-pro/MyAuditionPal (branch `main`; latest commit `60fe328`).

---

## What this app is

A mobile app for classical musicians to **track auditions** (the day-to-day core), keep a permanent **history**, and **discover** real audition listings filtered to their instrument. Built by a **solo, beginner developer** on a MacBook who wants plain-language explanations and room to ask questions. Free at launch. Primary target: iOS first (via Expo Go for now), then Android.

## Tech stack

- **React Native + Expo (SDK 54) + TypeScript**, expo-router (file-based routing).
- **Supabase** backend: Postgres (listings + auditions tables) + Auth (email/password). Client in `lib/supabase.ts` (publishable key — safe to ship; protected by RLS).
- **Local storage** (AsyncStorage) for guest data + profile; cloud takes over when signed in.
- App lives in **`MyAuditionPalApp/`**; planning docs in **`Planning/`**.

### ⚠️ Gotchas (important)
- **Pinned to Expo SDK 54 on purpose** — the user's App Store Expo Go supports SDK 54; newer SDKs fail with "incompatible version." Don't upgrade unless their Expo Go supports it.
- **After any `npx expo install`, do a clean restart**: `Ctrl+C` → `npx expo start -c` → fully close & reopen Expo Go. (A stale app once made a tab "disappear.")
- **Connect in Expo Go via "Enter URL manually"** (`exp://…`) — the QR was finicky on this machine.
- Run `npx tsc --noEmit` after changes; it's been kept green throughout.

## How to run it
```bash
cd MyAuditionPalApp
npx expo start
```

---

## Status — what's DONE

### Phase 0 — Setup ✅
Homebrew, Node 26, VS Code installed. Expo project created (SDK 54), runs on the user's phone. Calm **color palette** (warm whites / beiges / dusty pinks, + `success` green) in `constants/theme.ts` — light + warm dark variants.

### Phase 1 — Tracking ✅
- **Data model** `types/audition.ts`: status lifecycle **Interested → Applied → Attended** (simplified from the original 5-stage idea). `result` is free text (e.g. "semi-finals"), shown when Attended. `isActive()` = not yet attended. Fields incl. `repertoirePhotoUri`, `reminderNotificationId`, `attendNudgeDismissed`, `sourceListingId`.
- **Four tabs** (`app/(tabs)/`): 🎯 My Auditions (`index.tsx`), 🔎 Browse (`browse.tsx`), 📜 History (`history.tsx`), 👤 Profile (`profile.tsx`). **Add is no longer a tab** — it's a modal (`app/add.tsx`) opened by the pink **+** in the Browse header (and the My Auditions empty-state button); it has a Close button and dismisses on save.
- **Add/Edit** share `components/audition-form.tsx`. Tap a card → edit screen `app/audition/[id].tsx` (change status, edit fields, delete). Form clears after saving.
- **My Auditions**: grouped **Interested / Applied** sections, soonest-deadline first. Cards (`components/audition-card.tsx`) show separate "Application deadline" + "Audition date" lines (deadline highlighted within 7 days, not when past); **status badge is a dropdown popover** (also on History); **"Did you attend?"** nudge on past-date cards → "How did it go?" result box → moves to History. Long-press to delete.
- **History**: attended auditions, newest first; reuses the card.
- **Onboarding** (`app/onboarding.tsx`): first launch with no instrument → instrument **dropdown** (`components/instrument-dropdown.tsx`); then the My Auditions empty-state prompt.
- **Deadline reminders** `lib/notifications.ts` (expo-notifications): local reminder at 9 AM the day before `applicationDeadline`; id stored on the audition, cancelled/rescheduled on edit/delete.
- **Calendar date picker** `components/date-field.tsx` (@react-native-community/datetimepicker); dates stored `YYYY-MM-DD`, shown "Month D, YYYY" via `lib/date.ts`.
- **Branding**: display name **MyAuditionPal** (`app.json`); custom **app icon** (cream 5-point star on dusty pink + terracotta note) — all variants in `assets/images/`, generated from SVGs via `rsvg-convert` (librsvg). Icon/name only show in a real build, not Expo Go.

### Phase 2 — Discovery + Accounts + Cloud sync ✅
- **Browse/Discovery** (`app/(tabs)/browse.tsx`, `components/listing-card.tsx`, `types/listing.ts`): lists audition postings filtered to the user's instrument; "♡ Add to Interested" creates an Interested audition linked via `sourceListingId` (prevents double-add). Reads live from Supabase via `lib/listings.ts` (pull-to-refresh, loading/error states).
- **Listings data — MANUAL CURATION** (user's choice; no scraping, link back to source). The Supabase `listings` table holds **real postings across ~14 instruments** (violin, viola, cello, double bass, flute, oboe, clarinet, bassoon, french horn, trumpet, trombone, bass trombone, percussion, timpani, + 1 harp), curated from **Musical Chairs** (plus a few CSO/BSO/Indianapolis/Houston direct links), each with a `url` back. Many have real `audition_date`s pulled from detail pages; the rest are genuinely TBD. Sources the user uses: Musical Chairs, The Audition Cafe (login), dbstrings, muvac (login).
- **Accounts** — Supabase email/password. `contexts/auth-context.tsx` (`useAuth()`), `app/sign-in.tsx` modal, Account section on Profile. Session persists (AsyncStorage + AppState auto-refresh in `lib/supabase.ts`). Sign-up handles email confirmation (shows "check your email" when a confirmation is required). Guest mode is the default.
- **Cloud sync** — `lib/cloud-auditions.ts` + auth-aware `contexts/audition-context.tsx`: guest → local; signed in → Supabase `auditions` table. On first sign-in, local auditions migrate up, then local clears **only after a confirmed cloud write** (a bug that cleared unconditionally and lost data when the table was missing has been fixed).

### Supabase project
- Tables: **`listings`** (RLS: public SELECT only) and **`auditions`** (RLS: per-user — `auth.uid() = user_id`, full CRUD for the owner).
- ✅ **Email confirmation is ON.** Site URL set to the GitHub repo as a valid redirect (Authentication → URL Configuration), so the confirm link lands on a real page instead of erroring. Confirm → return to app → sign in works. The app handles the confirm flow. (For real launch: a custom SMTP + a proper "confirmed" landing page — see next ideas.)

---

## UI / design overhaul (2026-06-15)

- **New theme** in `constants/theme.ts` (drives the whole app, light + dark): light = light-gray backdrop, white cards, black text; dark = black backdrop, gray cards, white text; **bright-pink (`#EC4899`)** accents (buttons, active tab, badges, links). Replaced the original warm beige/dusty-pink palette.
- **Cards** (`audition-card.tsx`, `listing-card.tsx`): soft floating shadow, bold title, **MaterialCommunityIcons outline icons** for meta (map-marker, checkbox-marked, music-note, trophy) that follow the text color. Status badge color-coded — Interested = pink outline (matches the View Details button), Applied = solid pink, Attended = green.
- **Browse** (`browse.tsx`): pinned white/gray **header band** "Upcoming {instrument} Auditions" with the **+** button; a **search bar** below it (live filter on ensemble/position/location); listing cards with a **heart toggle** (add ♡ / remove ♥ w/ confirm) and a **bright-pink outline "View Details"** button; full light/dark support (Browse hardcodes its own white/gray/black values to match the theme).
- My Auditions cards have a centered **"View Details"** button (opens the edit screen).

## Decisions on record
- **SDK 54 pin** (Expo Go compatibility). — see memory `expo-go-sdk-pin`.
- **Manual curation** of listings, link back, no scraping. — memory `audition-listing-sources`.
- **Social login (Google/Apple) deferred to the dev-build phase** (Apple also needs a paid Apple Developer account). — memory `social-login-deferred`.

## Post-audition reflection (2026-06-15)
When status = **Attended**, the form shows **Result**, **What went well**, and **What didn't go well / feedback** (`wentWell`, `wentPoorly` on the model + cloud columns `went_well`, `went_poorly`; also added `improvement_report` column for the future AI report). Run once in Supabase if not done: `alter table auditions add column if not exists went_well text, add column if not exists went_poorly text, add column if not exists improvement_report text;`

## Known limitations / NEXT IDEAS
1. **AI "improvement report"** (deferred) — summarize wentWell/wentPoorly into a coaching report. Needs an LLM via a backend (Supabase Edge Function holds the key). Paid option: Claude (Haiku, pennies). Free options to consider: Google Gemini free tier, Groq free tier, Cloudflare Workers AI — or a NO-LLM approach (structured reflection categories + cross-audition keyword/theme aggregation). The `improvement_report` column already exists.
2. **For real launch:** connect a custom SMTP (free-tier email is rate-limited) and a proper "you're confirmed — return to the app" landing page (or deep link, once there's a dev build). Email confirmation itself is already on and working.
2. **Development build** — unlocks: native **Google + Apple sign-in**, rock-solid notifications, App Store distribution. Apple needs the $99/yr Apple Developer account. (User has deferred this; revisit when heading to release.)
3. **Repertoire photo sync** across devices — currently a local file URI; would need Supabase Storage upload.
4. **Offline resilience** for signed-in writes (currently a failed cloud write just logs a warning).
5. **Listings growth** — more instruments/refresh over time; possibly user-submitted or (carefully, ToS permitting) automated later. For standalone builds, add notification config + expo-image-picker permission strings to `app.json`.

## Working notes for the next agent
- The user is a **beginner** — explain in plain language, expect questions, and walk through anything they must run themselves (interactive logins, Supabase SQL Editor pastes, etc.). The app can't write to Supabase tables from the dev machine (RLS/anon key is read-only); schema/data changes go through the SQL Editor.
- Keep files small and readable with teaching comments (matches the established style).
- Commit/push only when asked; end commit messages with the Co-Authored-By trailer. `node_modules` is gitignored — verify it's never staged.
- More context in agent memory (`MEMORY.md`): SDK pin, restart-after-install, listing sources, social-login-deferred, user dev experience, tech stack, project overview.
