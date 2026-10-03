# Peptify — Task Board

Status: `[ ]` todo · `[~]` in progress · `[x]` done. Lane: **A** = Claude Code (logic), **B** = Cursor (UI), **C** = Claude cheap model (content/ops), **You** = needs a human.
Give an agent exactly one task ID at a time: `/task T-104`.
A task's "Needs" must be done first. Tasks without a shared "Needs" can run in parallel.

## Day 1 — Foundation

- [ ] **T-101** (A) Install deps from ARCHITECTURE.md, add jest-expo config + `test`/`typecheck` scripts, `.env.example`. *Done when:* `npm test` runs a sample test.
- [ ] **T-102** (A) `src/types/domain.ts`: Vial, Protocol, Dose, Schedule, InjectionSite, Peptide types + zod schemas. *Needs:* —
- [ ] **T-103** (A) `src/db/migrations.ts` (v1 schema from ARCHITECTURE) + `SQLiteProvider` in root layout + repository skeletons. *Needs:* T-101, T-102
- [ ] **T-104** (A) `src/lib/recon.ts` + `units.ts` with tests (5mg/2mL/250mcg → 10 units; invalid input → null). *Needs:* T-101
- [ ] **T-105** (B) Remove template screens/components not needed; theme tokens from DESIGN.md into `constants/theme.ts`. *Needs:* —
- [ ] **T-106** (B) UI kit: Screen, Text, Button, Card, ListRow, Chip, SegmentedControl, NumberField, EmptyState, ProBadge. *Needs:* T-105
- [ ] **T-107** (B) `(tabs)` layout with 5 NativeTabs + placeholder screens. *Needs:* T-105
- [ ] **T-108** (B) Calculator screen + SVG syringe using `lib/recon`. *Needs:* T-104, T-106
- [ ] **T-109** (C) `src/content/peptides.json` — 25 entries (schema in `docs/CONTENT.md`), 5 marked `free: true`.
- [ ] **T-110** (C) Fill `legal/privacy-policy.md`, `legal/terms.md` placeholders (company name, email, date).

## Day 2 — Protocols

- [ ] **T-201** (A) `lib/schedule.ts`: `occurrences(protocol, fromDate, toDate)` for daily/weekdays/interval/cycle + tests incl. DST and end dates. *Needs:* T-102
- [ ] **T-202** (A) `protocolsRepo` CRUD + react-query hooks (`useProtocols`, `useProtocol`, mutations). *Needs:* T-103
- [ ] **T-203** (B) Protocol form (create/edit) with zod validation. *Needs:* T-106, T-202
- [ ] **T-204** (B) Protocols list (Active/Paused/Ended) + detail screen. *Needs:* T-202
- [ ] **T-205** (A) `useToday()` hook: occurrences + doses merged → slots with status. *Needs:* T-201, T-202
- [ ] **T-206** (B) Today screen with Taken/Skip buttons (wired in T-302). *Needs:* T-205
- [ ] **T-207** (C) Store listing copy draft → `docs/STORE_LISTING.md`.

## Day 3 — Logging & inventory

- [ ] **T-301** (A) `dosesRepo` + `vialsRepo`; log dose transaction decrements vial. Tests for vial math. *Needs:* T-103
- [ ] **T-302** (B) Dose sheet (time, amount, site grid, note) + wire Today buttons. *Needs:* T-301
- [ ] **T-303** (A) `lib/sites.ts`: suggest least-recently-used site + tests. *Needs:* T-102
- [ ] **T-304** (B) History screen: month calendar dots + day list. *Needs:* T-301
- [ ] **T-305** (B) Vials list + form + detail (remaining bar, expiry warnings). *Needs:* T-301
- [ ] **T-306** (C) Onboarding copy + paywall copy.

## Day 4 — Reminders, library, onboarding

- [ ] **T-401** (A) `lib/notifications.ts`: permission, schedule next 14 days per protocol, cancel, reschedule on foreground/edit; notification tap → `dose/[id]`. *Needs:* T-201
- [ ] **T-402** (B) Library list (search, categories, locks) + detail. *Needs:* T-109, T-106
- [ ] **T-403** (B) Onboarding flow (goal, experience, notifications, disclaimer) gated by kv-store flag. *Needs:* T-401
- [ ] **T-404** (You/C) Host privacy policy + terms + support page; put URLs in `src/constants/links.ts`.

## Day 5 — Money

- [ ] **T-501** (You) RevenueCat: entitlement `pro`, offering `default`, products monthly/yearly in App Store Connect + Play Console; paste API keys into `.env`.
- [ ] **T-502** (A) `lib/purchases.ts`: configure, `useIsPro()`, offline cache, restore. *Needs:* T-501
- [ ] **T-503** (B) Paywall modal (RevenueCatUI) + `ProGate` component + all gates from PRD §4. *Needs:* T-502
- [ ] **T-504** (B) Settings screen. *Needs:* T-502, T-404
- [ ] **T-505** (A) CSV export via share sheet (Pro). *Needs:* T-301
- [ ] **T-506** (You) First `eas build -p android --profile production` → Play closed testing; invite testers.

## Day 6 — Quality

- [ ] **T-601** (A) Run `/qa` checklist on iOS sim + Android; file bugs below as T-6xx.
- [ ] **T-602** (B) Empty/error/loading states everywhere, dark mode pass, accessibility labels.
- [ ] **T-603** (You/C) App icon, splash, 6 screenshots per store (DESIGN.md + STORE_LISTING.md).
- [ ] **T-604** (A) `/review` on whole app; fix P0/P1.

## Day 7 — Ship

- [ ] **T-701** (You) `eas build --platform all --profile production` → `eas submit`.
- [ ] **T-702** (You) Store listings, data safety (Play), privacy nutrition labels (Apple), age rating, review notes (from `docs/RELEASE.md`).
- [ ] **T-703** (C) Launch content from `docs/MARKETING.md`.

## Bugs

_(add as `- [ ] **T-6xx** P0/P1/P2 short description — steps to reproduce`)_

## Parking lot (not in MVP)

- Half-life chart · body map · check-ins & trends · blends · badges · cloud sync
