# Peptify — Compliance & Store-Policy Guardrails

Peptide apps sit in a sensitive spot for Apple (Guideline 1.4.1 physical harm, 5.1 privacy) and Google (Health apps policy, unapproved substances). Follow these rules to get approved and stay approved.

## Positioning (use everywhere)

> Peptify is a personal tracking and education tool. It does not provide medical advice, diagnosis, or treatment, and does not recommend any substance or dose. Always consult a licensed healthcare professional.

- Category: **Health & Fitness** (not Medical).
- The user enters **their own** protocol. The app never suggests a dose, a peptide or a "stack".
- The calculator is math only: it converts numbers the user typed in.

## Never in the app, store listing or ads

- "Recommended dose", "best peptide for…", "cures/treats/heals", before/after body claims.
- Links to vendors, prices, discount codes, "where to buy", or research-chemical sellers.
- Mentions of injecting for weight loss as a promise. GLP-1 brand names only as neutral tracking examples, never as an endorsement.

## Library content rules

- Neutral summaries of what has been **studied**, with citations. Use "has been studied for", never "helps with".
- Every entry shows the disclaimer.
- Typical research dosing ranges are **not** shown in the MVP (largest rejection risk). Revisit after approval.

## Privacy

- All health data stays on the device in SQLite. No account, no analytics in the MVP.
- RevenueCat receives an anonymous app user id + purchase receipts only.
- **Apple privacy label:** "Purchases" (linked to purchase only, not used for tracking). **Google Data safety:** "Purchase history" collected, not shared. Health data: not collected (on-device only).
- Health data must never be sent to analytics/ads if you add them later. Get consent first.

## Required in app

- Disclaimer accepted during onboarding (stored with a timestamp) and visible in Settings.
- Privacy Policy + Terms links: Settings, paywall, store listing.
- Restore Purchases button (Apple requirement).
- Subscription terms on paywall: price, period, auto-renew, how to cancel.

## Review notes to send Apple/Google

> Peptify is a personal log and education app. Users record their own schedule and doses. The app does not sell, recommend, or link to any substance, and shows a medical disclaimer during onboarding and on every educational page. All data is stored locally on the device.
