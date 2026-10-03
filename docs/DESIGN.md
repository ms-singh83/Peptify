# Peptify — Design System & Screens

Goal: clean, clinical-but-friendly, iOS-native feel. Think Apple Health meets a premium habit tracker.

## Brand

- **Name:** Peptify · **Tagline:** "Track smarter. Stay consistent."
- **Voice:** calm, precise, never hype, never medical. "Logged." not "Great job, warrior!"

## Tokens (put in `src/constants/theme.ts`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | `#0F9D8A` | `#2DD4BF` | Buttons, active tab, links |
| `primaryMuted` | `#E6F6F3` | `#0B2E2A` | Selected chips, highlights |
| `background` | `#FFFFFF` | `#000000` | Screen |
| `surface` | `#F4F5F7` | `#16181B` | Cards |
| `border` | `#E3E5E8` | `#2A2D31` | Dividers |
| `text` | `#0B0D0E` | `#F5F7F8` | Body |
| `textSecondary` | `#60646C` | `#A1A6AD` | Captions |
| `success` | `#16A34A` | `#22C55E` | Taken |
| `warning` | `#D97706` | `#F59E0B` | Low stock, skipped |
| `danger` | `#DC2626` | `#EF4444` | Missed, delete |
| `pro` | `#7C3AED` | `#A78BFA` | Pro badge, paywall accents |

Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48. Radius: 8 (chips) · 14 (cards) · 999 (pills). Font: system (SF Pro / Roboto), sizes 34/28/22/17/15/13. Numbers in the calculator use tabular figures.

## Components (`src/components/ui`)

`Screen` (safe area + scroll + max width) · `Text` (variants: largeTitle, title, headline, body, caption, mono) · `Button` (primary, secondary, ghost, destructive; loading state) · `Card` · `ListRow` (icon, title, subtitle, accessory) · `Chip` / `SegmentedControl` · `NumberField` (decimal keypad, unit suffix) · `TimePicker` · `Sheet` (bottom sheet via router modal `presentation: 'formSheet'`) · `EmptyState` (icon, title, body, CTA) · `ProBadge` · `ProGate` (wraps content, shows lock + opens paywall) · `StatusDot` · `Disclaimer` (small footer text).

Icons: `expo-symbols` (SF Symbols on iOS) with Material fallback on Android.

## Tabs

`Today` (calendar.day.timeline.left) · `Protocols` (list.bullet.rectangle) · `Calculator` (function) · `Library` (books.vertical) · `Settings` (gearshape)

## Screens (layout notes)

1. **Today** — large title "Today" + date. Streak pill. Cards grouped by time ("Morning 08:00"). Each card: peptide name, dose, vial remaining bar, buttons **Taken** (primary) / **Skip** (ghost). Tapping Taken → haptic success + card turns green with ✓ and site used. Empty: "No doses scheduled today — Add a protocol".
2. **Protocols** — segmented: Active / Paused / Ended. Row: name, "250 mcg · Daily · 08:00", adherence % last 7 days. FAB/“+” in header → `protocol/new`.
3. **Protocol form** — Peptide (search library or "custom"), Dose (NumberField + unit segment), Schedule (segment: Daily / Weekdays / Every N days / Cycle) with conditional fields, Times (add multiple), Start/End date, Link vial, Notes. Sticky Save.
4. **Protocol detail** — header stats (adherence, doses taken, next dose), history list, Pause/Resume/End actions.
5. **Dose sheet** — time (default now), amount (prefilled), site picker grid with "Suggested" badge on least-recently-used, note. Save.
6. **Calculator** — 3 NumberFields (Vial mg, Water mL, Dose mcg/mg) → big result: **"Draw 10 units (0.10 mL)"**, concentration, doses per vial. SVG syringe filled to the units mark. "Save as vial" (Pro). Disclaimer footer.
7. **Vials** (from Protocols header or Settings) — cards with remaining bar, days left, expiry; warning colors.
8. **History** — month calendar with dots, tap day → list.
9. **Library** — search bar, category chips (Recovery, GH secretagogues, Metabolic/GLP-1, Cognitive, Skin/Hair, Sleep), rows with lock for non-free entries. Detail: overview, research areas, half-life, storage, references, disclaimer.
10. **Settings** — Pro status row, units, reminders default, Vials, Export CSV, Rate, Contact, Privacy, Terms, Disclaimer, Restore purchases, version.
11. **Onboarding** — full-bleed, one question per screen, progress dots, primary CTA bottom.
12. **Paywall** — RevenueCat Paywall (configured in dashboard) with: headline "Unlock Peptify Pro", 4 benefit bullets (unlimited protocols, all reminders, vial inventory, full library + history), yearly preselected with "3 days free", restore + terms + privacy links.

## App icon & splash

Simple vial/droplet glyph in `primary` on white (light) — export 1024×1024, Android adaptive foreground with 66% safe zone. Replace files in `assets/images/`.
