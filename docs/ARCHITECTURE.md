# Peptify — Architecture

## Stack

| Concern | Choice | Why |
|---|---|---|
| App | Expo SDK 54 + expo-router 6 (file routes), dev client | Already running on your simulator |
| Storage | `expo-sqlite` (SQLiteProvider + `useSQLiteContext`) | Local-first, private, fast, no backend to build |
| Key-value | `expo-sqlite/kv-store` | Settings, onboarding flags |
| Server state | `@tanstack/react-query` wrapping repository calls | Caching + invalidation after writes |
| UI state | `zustand` (only ephemeral UI state, e.g. form drafts) | Already installed |
| Validation | `zod` | Form input boundary |
| Dates | `date-fns` | Schedule math |
| Notifications | `expo-notifications` (local only) | Reminders |
| Payments | `react-native-purchases` + `react-native-purchases-ui` | RevenueCat paywall + entitlements |
| Charts/syringe | `react-native-svg` | Syringe graphic, v1.1 charts |
| Lists | `@shopify/flash-list` | History + library performance |
| Feedback | `expo-haptics`, `expo-store-review` | Polish + ratings |
| Tests | `jest-expo` + `@types/jest` | Pure logic unit tests |
| Builds | EAS Build + EAS Submit | Store binaries |

All of these are installed (T-101). To add a new Expo package later, always use `npx expo install <pkg>` so the version matches SDK 54.

Scripts: `npm test` (jest-expo), `npm run typecheck`, `npm run lint` (eslint-config-expo), `npm run check` (all three).

## Folder structure (target)

```
src/
  app/                          # routes only — thin, compose feature components
    _layout.tsx                 # providers: SQLite, QueryClient, Purchases, Theme
    (onboarding)/               # welcome, goal, experience, notifications, disclaimer
    (tabs)/
      _layout.tsx               # NativeTabs: Today · Protocols · Calculator · Library · Settings
      index.tsx                 # Today
      protocols.tsx
      calculator.tsx
      library.tsx
      settings.tsx
    protocol/new.tsx            # create/edit (modal)
    protocol/[id].tsx           # detail + history for one protocol
    dose/[id].tsx               # log/edit dose (sheet)
    vials/index.tsx, vials/[id].tsx
    history.tsx
    library/[slug].tsx
    paywall.tsx                 # modal
  components/ui/                # Button, Card, Text, Input, Chip, Sheet, EmptyState, ProBadge ...
  features/<feature>/           # feature components + hooks (protocols, doses, vials, library, calculator)
  db/
    migrations.ts               # PRAGMA user_version migrations
    repositories/*.ts           # protocolsRepo, dosesRepo, vialsRepo — the ONLY place with SQL
  lib/                          # pure, tested logic
    recon.ts                    # reconstitution math
    schedule.ts                 # occurrences for a date range from a protocol
    sites.ts                    # next suggested injection site
    units.ts                    # mg/mcg/IU conversions
    notifications.ts            # schedule/cancel local notifications (side effects)
    purchases.ts                # RevenueCat init + useIsPro()
    __tests__/
  content/peptides.json         # library content (static, bundled)
  types/domain.ts               # shared domain types
  constants/theme.ts            # design tokens
```

**Rule:** screens → feature hooks → repositories → SQLite. Screens never contain SQL. `lib/` never imports React.

## Data model (SQLite, migration v1)

```sql
CREATE TABLE vials (
  id TEXT PRIMARY KEY,
  peptide_slug TEXT, custom_name TEXT,
  total_mg REAL NOT NULL,
  water_ml REAL,                       -- null = not reconstituted yet
  reconstituted_at TEXT, expires_at TEXT,
  remaining_mcg REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active | empty | discarded
  created_at TEXT NOT NULL
);

CREATE TABLE protocols (
  id TEXT PRIMARY KEY,
  peptide_slug TEXT, custom_name TEXT,
  dose_amount REAL NOT NULL,
  dose_unit TEXT NOT NULL,             -- mcg | mg | iu
  schedule_type TEXT NOT NULL,         -- daily | weekdays | interval | cycle
  weekdays TEXT,                       -- JSON [1..7] for 'weekdays'
  interval_days INTEGER,               -- for 'interval'
  cycle_on_days INTEGER, cycle_off_days INTEGER,
  times TEXT NOT NULL,                 -- JSON ["08:00","20:00"]
  start_date TEXT NOT NULL, end_date TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | paused | ended
  vial_id TEXT REFERENCES vials(id),
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE doses (
  id TEXT PRIMARY KEY,
  protocol_id TEXT REFERENCES protocols(id),   -- null = unscheduled dose
  scheduled_for TEXT,                          -- ISO datetime of the planned slot
  taken_at TEXT,
  status TEXT NOT NULL,                        -- taken | skipped
  amount REAL, unit TEXT,
  site TEXT,                                   -- see lib/sites.ts
  notes TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (protocol_id, scheduled_for)
);
CREATE INDEX idx_doses_taken_at ON doses(taken_at);
```

"Missed" is **derived**, not stored: a scheduled occurrence in the past with no `doses` row.

Dates are stored as ISO strings in local time; all schedule math goes through `lib/schedule.ts`.

## Key flows

- **Today:** `schedule.occurrences(protocols, today)` merged with today's `doses` rows → list of {slot, status}.
- **Log dose:** insert `doses` row → if protocol has `vial_id`, decrement `vials.remaining_mcg` in the same transaction → invalidate `['today']`, `['history']`, `['vials']`.
- **Reminders:** on protocol create/edit/pause → cancel that protocol's notifications → schedule the next 14 days of occurrences (iOS limit is 64 pending). Re-schedule on app foreground.
- **Pro check:** `useIsPro()` reads RevenueCat `customerInfo.entitlements.active.pro`; cache last value in kv-store so gating works offline.

## Environments / secrets

`.env` (never committed):

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxx
```
