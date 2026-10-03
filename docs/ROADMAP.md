# Peptify — 7-Day MVP Roadmap

Each day ends with: all checks green, a commit/merge to `main`, and a 5-minute run on the iPhone 14 simulator.
Detailed tasks with IDs are in `docs/TASKS.md`.

```
          Lane A — Claude Code (logic/infra)   Lane B — Cursor (UI)            Lane C — Claude (cheap model: content/ops)
Day 0     ─ accounts & setup (you) ─────────────────────────────────────────────────────────────────────────────────────────
Day 1     deps, test setup, types, DB, recon   theme tokens, UI kit, tabs       peptide library JSON (25), legal pages
Day 2     schedule engine, protocol repo       protocol form + list + Today     store listing copy, keywords
Day 3     dose repo, vial math, site logic     dose sheet, history, vials       screenshots plan, onboarding copy
Day 4     notifications                        onboarding, library screens      privacy policy hosted, support page
Day 5     RevenueCat + gating + CSV export     paywall, settings, ProGate       RevenueCat products, Play closed test
Day 6     bug bash + perf                      polish: empty states, dark mode  screenshots + icon final
Day 7     EAS production builds + submit       last fixes from QA               launch posts, TikTok/IG first 3 videos
```

## Day 0 — before coding (you, ~2 hours, today)

- [ ] Google Play Console account ($25). **If personal account:** recruit 12 testers now — closed test must run 14 days before production access.
- [ ] Apple Developer Program ($99).
- [ ] RevenueCat account; create project "Peptify", iOS + Android apps.
- [ ] Expo account; `eas login`; project id already in `app.json`.
- [ ] Domain or free page for privacy policy + support (e.g. GitHub Pages / Notion).
- [ ] Decide final name check: search both stores for "Peptify" conflicts.

## Day 1 — Foundation

Clean the template, install deps, design tokens + UI kit, 5-tab layout, domain types, SQLite + migrations, calculator (logic + screen). **Demo:** calculator works on simulator; tabs navigate.

## Day 2 — Protocols

Schedule engine (tested), protocol repository, create/edit form, list, Today screen reading real data. **Demo:** create a daily protocol → appears on Today.

## Day 3 — Logging & inventory

Dose logging sheet, site rotation, history calendar, vials CRUD with auto-decrement. **Demo:** log a dose → vial remaining drops → history shows green dot.

## Day 4 — Reminders, library, onboarding

Local notifications (schedule/cancel/reschedule), notification tap → dose sheet, library list + detail, onboarding flow + disclaimer. **Demo:** fresh install → onboarding → reminder fires on simulator.

## Day 5 — Money

RevenueCat init, `useIsPro`, paywall modal, all gates from PRD §4, restore, settings screen, CSV export. Products created in both stores; sandbox purchase tested. Upload first Android build to **closed testing**. **Demo:** free user hits gate → buys in sandbox → unlocked.

## Day 6 — Quality

Full QA checklist (`docs/QA.md`) on iOS sim + Android, fix all P0/P1, empty/error states, accessibility pass, app icon + splash, store screenshots.

## Day 7 — Ship

`eas build --platform all --profile production`, `eas submit`, store listings filled from `docs/STORE_LISTING.md`, data-safety / privacy nutrition forms, submit for review. Start marketing plan (`docs/MARKETING.md`).

## Buffer rules (how we protect the week)

- Anything not in PRD "Must-have" goes to the parking lot — no exceptions.
- If a day slips by > 3 hours, cut from: CSV export → history calendar (use list) → vials expiry alerts. Never cut: calculator, protocols, logging, reminders, paywall.
- Store review time (Apple 1–2 days, Google closed-test 14 days for new personal accounts) is outside the 7 days — the **build** is done in 7.
