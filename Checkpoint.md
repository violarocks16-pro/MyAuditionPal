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

---

## NEXT IDEAS (not yet built)

In rough priority / as discussed with the user:

1. **Onboarding first-run flow** — capture instrument FIRST on first launch (no instrument set → show an instrument picker before the tabs), then the friendly prompt: _"Add one you're preparing for, or one you've already taken."_ This is the planned "instant payoff" onboarding.
2. **Tap to view & edit an audition** — currently status is fixed at creation; there's NO way to advance Interested → Applied → Attended or edit fields without delete + re-add. A detail/edit screen is the biggest gap in the core tracking loop. (`updateAudition` already exists in the context, ready to use.)
3. **Deadline alerts** — the user specifically wants the app to notify them as an application deadline approaches. Local notifications via Expo Notifications (no backend needed). Needs permissions + scheduling tied to `applicationDeadline`.
4. **Polish / later**: proper date picker (dates are plain `YYYY-MM-DD` text right now); My Auditions "upcoming vs in-progress" grouping; richer history. For standalone builds, add expo-image-picker permission strings to `app.json` config plugin.

## Working notes for the next agent

- The user is a **beginner** — explain each step in plain language, expect follow-up questions, and walk through anything they must run themselves (interactive terminal commands).
- Keep files small and readable with teaching comments (matches the established style).
- Run `npx tsc --noEmit` after changes; keep it green.
- More context lives in the agent memory (MEMORY.md): SDK pin, restart-after-install, user dev experience, tech stack.
