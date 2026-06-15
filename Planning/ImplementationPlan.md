# MyAuditionPal — Implementation Plan

_Last updated: 2026-06-14_
_Status: Stack CONFIRMED (2026-06-14) — React Native + Expo + TypeScript, with Supabase added in Phase 2. Phase 0 in progress._

This plan is written for a solo developer early in their journey, building on a MacBook, targeting mobile (iOS first, then Android), free at launch, with **active tracking** as the core value.

---

## Part 1 — Recommended Tech Stack (with plain-language reasoning)

### The mobile app: **React Native + Expo**

- **React Native** = a framework that lets you write ONE codebase (in JavaScript/TypeScript) that runs as a real app on BOTH iPhone and Android. You don't write the app twice.
- **Expo** = a toolkit built on top of React Native that removes most of the painful setup. Crucially for a beginner: you can run your app on your *own phone* by scanning a QR code (via the free "Expo Go" app) — no complicated Xcode/Android Studio configuration to get started.
- **Why this and not alternatives:**
  - _Flutter_ (Google's option) is excellent but uses the Dart language, which is less widely transferable and has fewer beginner resources than JavaScript.
  - _Native (Swift for iOS)_ means building the Android version separately later — double the work for a solo dev.
  - React Native skills also transfer to **React** (web), so what you learn is reusable.
- **Language:** TypeScript (JavaScript with type-checking — it catches mistakes before you run the app; very beginner-friendly once set up).

### Data storage — phased on purpose

- **Phase 1 (MVP): on-device storage only.** All audition data lives ON the phone. We'll likely use **SQLite** (a small database that lives inside the app) via Expo's SQLite support, or a simpler local store to start.
  - **Why:** It means NO backend server to build for v1. Guest mode is automatic (there are no accounts yet). You ship something real and usable while learning the fundamentals. The hardest infrastructure is deferred.
  - **Trade-off / risk:** data lives only on the device — if the phone is lost or the app deleted, the history is gone. We accept this for v1 and fix it in Phase 2.
- **Phase 2: cloud backend + accounts.** Add **Supabase** (a "Backend-as-a-Service" — a hosted service that gives you a database, user login, and an API without running your own server).
  - **Why Supabase:** It's built on **PostgreSQL** (a real, industry-standard relational database — great for our structured audition records, and the SQL you learn is transferable). It has built-in authentication including Apple/Google login (which we want for low-friction mobile sign-in), and a generous free tier (fits "free at launch").
  - This is when the "career log" becomes permanent and syncs across devices.

### Reminders / notifications

- **Expo Notifications** can schedule *local* notifications (reminders that fire on the device) WITHOUT a backend — so deadline reminders can appear as early as Phase 1.

### Discovery / web scraping (deferred — Phase 3)

- The hardest, most maintenance-heavy part. Built later as a small backend service that fetches/aggregates listings from audition sites and filters by instrument. Deliberately NOT in early phases.

---

## Part 2 — Phased Build

Each phase produces a **working app** you can actually use — we never spend months with nothing to show.

### Phase 0 — Setup & Foundations (learning + scaffolding)
- ✅ Install tools (2026-06-14): Homebrew 6.0.1, Node.js 26.3.0 / npm 11.16.0, VS Code 1.124.2 (`code` command linked). Xcode Command Line Tools already present.
- ✅ Install Expo Go on your phone (supports SDK 54).
- ✅ Create the Expo project (2026-06-14): `MyAuditionPalApp/`, **Expo SDK 54** (~54.0.34, RN 0.81.5) + expo-router + TypeScript. Tabs in `app/(tabs)/`; theme palette will live in `constants/theme.ts`. Pinned to SDK 54 because the user's App Store Expo Go supports SDK 54 (npm "latest" was SDK 56 — too new). Use SDK 54 until the App Store Expo Go catches up.
- ✅ Get the starter running on your own phone (2026-06-14) — loads in Expo Go via "Enter URL manually"; live edit→reload loop confirmed.
- ✅ Set up the calm pink/beige color palette as reusable theme values (2026-06-14) in `constants/theme.ts` — keys: text, background, surface, tint, primary, secondary, deadline, border, muted, icon, tabIcon*; light + warm dark variants. Tab bar uses active/inactive palette colors. Typecheck clean. (Final exact hex values still tunable.)
- Set up the project structure, TypeScript, and the color palette as reusable theme values.
- **Outcome:** A blank but running app on your phone. You understand the dev loop (edit code → see it update).

### Phase 1 — MVP: Manual Tracking (the core value, no backend)
- ✅ **Onboarding** (2026-06-14): first-run flow — if no instrument saved, `app/(tabs)/_layout.tsx` redirects to `app/onboarding.tsx` (Welcome + instrument dropdown, Continue disabled until chosen). After Continue → My Auditions, whose empty state shows the friendly prompt ("add one you're preparing for, or one you've already taken"). Instrument selection uses a reusable **dropdown** (`components/instrument-dropdown.tsx`) on both onboarding and Profile.
- ✅ **The audition record + status lifecycle** (2026-06-14): data model in `types/audition.ts` — status **Interested → Applied → Attended** (simplified from original 5-stage idea); `result` is now free-text (e.g. "semi-finals"), `isActive` = not yet attended; includes `repertoirePhotoUri`. On-device storage via AsyncStorage (`lib/storage.ts`, `lib/id.ts`) + shared React context (`contexts/audition-context.tsx`, `useAuditions()`) wired in root layout. Typecheck clean.
- ✅ **Four-tab navigation** (2026-06-14): My Auditions / Add / History / Profile — placeholder screens wired in `app/(tabs)/`, typecheck clean. Each tab still needs its real content.
- ✅ **My Auditions tab** (2026-06-14): `app/(tabs)/index.tsx` lists active auditions (`isActive` = not yet attended) via reusable `components/audition-card.tsx`; loading spinner, friendly empty state with "Add an audition" CTA, long-press to delete. Reads from `useAuditions()`.
- ✅ **Add tab** (2026-06-14): manual "add audition" form in `app/(tabs)/add.tsx` — ensemble/position required; optional location/dates/repertoire/notes; **status chips Interested · Applied · Attended** (lifecycle simplified per user — no confirmed/result status); when **Attended**, an optional free-text **Result** box appears (e.g. "semi-finals"); **repertoire photo** (take/upload via expo-image-picker, copied to document dir via expo-file-system/legacy) so users don't type long rep lists; validation; saves via `useAuditions().addAudition`; confirmation + redirect to My Auditions. **Dates use a calendar picker** (`components/date-field.tsx`, @react-native-community/datetimepicker); stored as `YYYY-MM-DD` but displayed spelled-out "Month D, YYYY" via `lib/date.ts` (on form + cards). NOTE: for standalone builds, add expo-image-picker permission strings (camera/photo) to app.json config plugin.
- ✅ **Tap to view & edit** (2026-06-14): tapping a card (My Auditions or History) opens `app/audition/[id].tsx` — edit any field incl. status (advances Interested → Applied → Attended, moving it between tabs), Save or Delete, Back to cancel. Add + Edit share one `components/audition-form.tsx`. `updateAudition` now reconciles the deadline reminder (cancel old + schedule new).
- ✅ **History tab** (2026-06-14): `app/(tabs)/history.tsx` lists attended auditions (`!isActive`), newest first (by auditionDate, else createdAt), reuses `AuditionCard` (shows result note), loading + empty states, long-press delete.
- ✅ **Profile tab** (2026-06-14): `app/(tabs)/profile.tsx` — instrument picker (list from `constants/instruments.ts`), shows/changes current instrument. Persisted via `Profile` context (`contexts/profile-context.tsx`, `useProfile()`) + `lib/storage.ts` (loadProfile/saveProfile, key `myauditionpal:profile`). `types/profile.ts`. ProfileProvider wraps app in root layout.
- ✅ **Local notifications** for deadline reminders (2026-06-14): `lib/notifications.ts` (expo-notifications) — schedules a reminder at 9:00 AM the day before `applicationDeadline`; permission requested on first scheduled audition; reminder id stored on the audition (`reminderNotificationId`), cancelled on delete; Android channel configured. Wired into `contexts/audition-context.tsx` (schedule on add, cancel on delete). NOTE: Expo Go can be flaky for notifications (dev build recommended later); standalone builds need notification config in `app.json`. Reschedule-on-edit will be needed once tap-to-edit exists.
- **Outcome:** A genuinely useful app a musician can rely on — fully working, on-device.

### Phase 2 — Accounts & Cloud Sync (make the log permanent)
- Add Supabase: database schema, user authentication (Apple + Google login).
- Sign-in flow; keep guest browsing as the default, prompt to sign in when saving/tracking.
- Migrate local data to the cloud on first sign-in; sync across devices.
- **Outcome:** The career log is safe, permanent, and follows the user to any device.

### Phase 3 — Discovery (the "magic" layer)
- Backend aggregation service that pulls audition listings from selected sources.
- Instrument-filtered discovery feed (lives in the Add/Browse tab).
- "Heart" a listing → it drops into tracking as "Interested."
- **Outcome:** The app now *finds* auditions for you, not just remembers them.

### Phase 4 — Polish & Growth
- Richer history (results analytics, rep prepared, reflections).
- Possible paid/premium tier (the architecture from Phase 2 already allows it).
- Dark mode (designed deliberately for the soft palette, not auto-inverted).
- App Store + Google Play release.

---

## Part 3 — Key Decisions Still Open
- ✅ **Stack confirmed (2026-06-14):** React Native + Expo + TypeScript; Supabase added in Phase 2.
- Specific audition data sources for Phase 3.
- Exact final color hex values.
- Dark mode: yes/no and when.

---

## Part 4 — Immediate Next Steps (once stack is confirmed)
1. Walk through installing the development tools on your MacBook (Node, Expo, VS Code).
2. Create the Expo project and get it running on your phone.
3. Build the audition data model and the four-tab shell.

_We'll take Phase 0 slowly and explain each tool as we install it._
