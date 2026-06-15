# MyAuditionPal — Checkpoint / Handoff

_Last updated: 2026-06-14_
_Purpose: A handoff for the next agent. Read this first, then `Planning/ImplementationPlan.md` and `Planning/Ideas.md` for full context._

---

## What this app is (one paragraph)

A mobile app for classical musicians to **track auditions** (the core value) and build a permanent **history** of every audition taken. Built by a **solo, beginner developer** on a MacBook who wants detailed, plain-language explanations and room to ask questions. Free at launch; discovery/web-scraping is deferred to a later phase. Primary target: iOS first (via Expo Go for now), then Android.

## Tech stack (confirmed)

- **React Native + Expo (SDK 54) + TypeScript**, expo-router (file-based routing).
- **On-device storage** via AsyncStorage (no backend yet). Supabase + accounts planned for Phase 2.
- App lives in **`MyAuditionPalApp/`** (subfolder); planning docs in **`Planning/`**.
- ⚠️ **Pinned to Expo SDK 54 on purpose** — the user's App Store Expo Go only supports SDK 54; newer SDKs (55/56) fail with "incompatible version." Do NOT upgrade the SDK unless their Expo Go supports it.
- ⚠️ **After any `npx expo install`, do a clean restart**: `Ctrl+C` → `npx expo start -c` → fully close & reopen Expo Go. (A stale app once made a tab "disappear.")

## How to run it

```bash
cd MyAuditionPalApp
npx expo start          # then connect in Expo Go
# In Expo Go: "Enter URL manually" with the exp://... address is the most reliable
# (the QR was finicky on this machine)
```
Typecheck before declaring done: `npx tsc --noEmit` (kept clean throughout).

---

## Status — DONE so far

**Phase 0 — Setup ✅**
- Homebrew, Node 26, VS Code installed. Expo project created (SDK 54). Runs on the user's phone via Expo Go. Live edit→reload loop confirmed.
- Calm **color palette** (warm whites / beiges / dusty pinks) in `MyAuditionPalApp/constants/theme.ts` — light + warm dark variants. Extra named colors: `surface, primary, secondary, deadline, border, muted`.

**Phase 1 core ✅**
- **Data model** `types/audition.ts`: `Audition` record with status lifecycle **Interested → Applied → Attended** (simplified by user from the original 5-stage idea). `result` is **free text** (e.g. "semi-finals"), shown only when status is Attended. Includes `repertoirePhotoUri`. Helpers: `STATUS_ORDER`, `STATUS_LABELS`, `isActive()` (active = not yet attended).
- **Storage + shared state**: `lib/storage.ts` (the only file that touches AsyncStorage) + `lib/id.ts`. Auditions via `contexts/audition-context.tsx` (`useAuditions()` → `auditions, loading, addAudition, updateAudition, deleteAudition`). Profile via `contexts/profile-context.tsx` (`useProfile()` → `profile, loading, setInstrument`). Both providers wrap the app in `app/_layout.tsx`.
- **Four tabs** (`app/(tabs)/`): 🎯 My Auditions (`index.tsx`), ➕ Add (`add.tsx`), 📜 History (`history.tsx`), 👤 Profile (`profile.tsx`).
  - **Add**: full form, ensemble/position required; optional location/dates/repertoire/notes; status chips; optional Result box (when Attended); **repertoire photo** (take/upload via expo-image-picker, copied to doc dir via expo-file-system/legacy); validation; saves + redirects.
  - **My Auditions**: lists active auditions, reusable `components/audition-card.tsx`, loading + empty states, long-press to delete.
  - **History**: lists attended auditions newest-first, reuses the card.
  - **Profile**: instrument picker (`constants/instruments.ts`), persists choice.

Everything persists across app restarts. `npx tsc --noEmit` is clean.

**Added since first checkpoint (2026-06-14):**
- **Onboarding first-run flow**: no instrument saved → `app/(tabs)/_layout.tsx` redirects to `app/onboarding.tsx`. Instrument chosen via reusable **dropdown** `components/instrument-dropdown.tsx` (Modal-based, used on onboarding + Profile).
- **Deadline reminders**: `lib/notifications.ts` (expo-notifications) schedules a local reminder at 9 AM the day before `applicationDeadline`; id stored on the audition, cancelled on delete; wired into the audition context. (Tested working via a temporary test-mode that has since been removed.)
- **Calendar date picker**: `components/date-field.tsx` (@react-native-community/datetimepicker). Dates stored as `YYYY-MM-DD`, displayed spelled-out "Month D, YYYY" via `lib/date.ts` (form + cards).

---

## NEXT IDEAS (not yet built)

In rough priority / as discussed with the user:

1. **Polish / later**: My Auditions "upcoming vs in-progress" grouping; richer history; for standalone builds add notification config + expo-image-picker permission strings to `app.json`; consider a development build for more reliable notifications.
2. **Phase 2 (per ImplementationPlan)**: Supabase + accounts + cloud sync.

**Done since this file was first written:** onboarding, instrument dropdown, deadline alerts, calendar date picker, and **tap-to-edit** — tapping a card opens `app/audition/[id].tsx`; Add + Edit share `components/audition-form.tsx`; `updateAudition` reconciles the deadline reminder. The core Phase 1 tracking loop is complete.

## Working notes for the next agent

- The user is a **beginner** — explain each step in plain language, expect follow-up questions, and walk through anything they must run themselves (interactive terminal commands).
- Keep files small and readable with teaching comments (matches the established style).
- Run `npx tsc --noEmit` after changes; keep it green.
- More context lives in the agent memory (MEMORY.md): SDK pin, restart-after-install, user dev experience, tech stack.
