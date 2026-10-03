# Peptify — Product Requirements (MVP v1.0)

## 1. One-liner

**Peptify helps people who run peptide protocols log every dose, never miss a reminder, do vial math in seconds, and learn what they are taking — privately, on their phone.**

Category: Health & Fitness · Education + tracking only (not medical advice).
Reference product: PeptIQ (~$14k MRR, Expo + RevenueCat). We match its core loop, not its whole feature list.

## 2. Target user

- **Primary:** 25–45, fitness/biohacking/GLP-1 users running 1–4 peptides (e.g. BPC-157, TB-500, CJC/Ipamorelin, GLP-1s). They currently use notes apps, spreadsheets, or memory.
- **Pain:** "Did I already inject today?", "How many units do I draw?", "Which site did I use last?", "When does this vial run out?"
- **Job to be done:** stay consistent and confident with a protocol.

## 3. MVP scope

### Must-have (ships in v1.0)

| # | Feature | What it does | Free | Pro |
|---|---|---|---|---|
| F1 | **Reconstitution calculator** | vial mg + water mL + dose (mcg/mg) → concentration, units to draw on a U-100 syringe, doses per vial. Visual syringe. | ✅ unlimited | ✅ |
| F2 | **Protocols** | Create a protocol: peptide (from library or custom), dose + unit, schedule (daily / specific weekdays / every N days / cycle X on Y off), time(s) of day, start/end date, linked vial. Pause / resume / end. | 1 active | Unlimited |
| F3 | **Today screen** | List of today's scheduled doses with one-tap "Taken" / "Skip". Shows streak. | ✅ | ✅ |
| F4 | **Dose logging** | Log taken/skipped with time, actual dose, injection site, note. Also "log an unscheduled dose". | ✅ | ✅ |
| F5 | **Injection site rotation** | Pick from 8 sites (abdomen L/R upper/lower, thigh L/R, deltoid L/R). Suggests the least-recently used site. | ✅ | ✅ |
| F6 | **History** | Month calendar with colored dots (taken / skipped / missed) + per-day list. | Last 7 days | Full |
| F7 | **Reminders** | Local notifications at each scheduled dose time. Tap → opens dose sheet. | 1 protocol | All |
| F8 | **Vials / inventory** | Track vials: peptide, mg, water added, reconstituted date, expiry. Remaining amount auto-decreases on each logged dose. Low-stock + expiry warnings. | — | ✅ |
| F9 | **Peptide library** | 25 peptides: overview, common research areas, typical storage, half-life, references. Search + categories. | 5 entries | All |
| F10 | **Onboarding** | 4 screens: goal → experience → reminder permission → disclaimer acceptance → paywall (dismissible). | ✅ | ✅ |
| F11 | **Paywall + subscriptions** | RevenueCat paywall: monthly + yearly with 3-day free trial on yearly. Restore purchases. | — | — |
| F12 | **Settings** | Units preference, reminder defaults, export CSV (Pro), disclaimer, privacy policy, terms, contact support, restore purchases, rate app. | ✅ | ✅ |

### v1.1 (week 2 — only after first paying users)

Half-life decay chart · visual body map · wellness check-ins (weight, mood, energy, sleep) + trends · streak badges · blends (one protocol, multiple peptides).

### Out of scope (do not build)

Cloud sync / accounts / login · web app · Apple Health / Oura · lab uploads · label printing · AI chat · vendor links or prices · social/community.

## 4. Monetization

- **Model:** freemium + subscription via RevenueCat (entitlement id: `pro`).
- **Products (launch prices, test later):** `peptify_pro_monthly` $9.99/mo · `peptify_pro_yearly` $49.99/yr with 3-day free trial.
- **Paywall triggers:** end of onboarding (dismissible), 2nd protocol, vials tab, locked library entry, history older than 7 days, CSV export.
- **North-star metric:** trial → paid conversion. Secondary: D7 retention, doses logged per active user per week.

## 5. Success criteria for MVP

- A new user can install → onboard → create a protocol → get a reminder → log a dose in **< 3 minutes**.
- Calculator result matches hand math to 2 decimals (unit tested).
- Zero crashes in a 30-minute QA session on iPhone 14 simulator + one Android device.
- Purchase, restore and entitlement checks work in sandbox on both stores.
- Approved on Google Play (closed testing → production) and App Store.

## 6. Non-functional

- Works fully offline. Cold start < 2s on iPhone 14. Light + dark mode. Dynamic type up to XL without broken layouts.
- Data never leaves the device (except anonymous purchase info via RevenueCat).
