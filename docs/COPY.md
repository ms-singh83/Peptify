# Peptify — In-App Copy (T-306)

All text below is final copy for Day 4/5 code. Each string shows its key name (for code constants) and character count (for length-limited fields). Follow COMPLIANCE.md strictly: no medical advice, no outcome claims, no dosing suggestions.

---

## Onboarding

### Screen 1: Welcome

| Key | Value | Count |
|---|---|---|
| `onboarding.welcome.title` | Track your protocol | 19 |
| `onboarding.welcome.subline` | Log every dose, never miss a reminder, and master vial math—all privately on your phone. | 90 |

### Screen 2: Goal Question

**Question:**
```
onboarding.goal.question = "What brings you here?"
```

**Options (id + label):**

| Key | Label | Count |
|---|---|---|
| `onboarding.goal.options.stay_consistent.id` | `stay-consistent` | — |
| `onboarding.goal.options.stay_consistent.label` | Stay consistent with doses | 27 |
| `onboarding.goal.options.organize_protocols.id` | `organize-protocols` | — |
| `onboarding.goal.options.organize_protocols.label` | Organize multiple peptides | 26 |
| `onboarding.goal.options.master_calculations.id` | `master-calculations` | — |
| `onboarding.goal.options.master_calculations.label` | Master vial calculations | 24 |
| `onboarding.goal.options.track_sites.id` | `track-sites` | — |
| `onboarding.goal.options.track_sites.label` | Track injection sites | 21 |

### Screen 3: Experience Question

**Question:**
```
onboarding.experience.question = "How experienced are you with tracking?"
```

**Options (id + label):**

| Key | Label | Count |
|---|---|---|
| `onboarding.experience.options.beginner.id` | `beginner` | — |
| `onboarding.experience.options.beginner.label` | New to peptides | 15 |
| `onboarding.experience.options.intermediate.id` | `intermediate` | — |
| `onboarding.experience.options.intermediate.label` | I've logged before | 18 |
| `onboarding.experience.options.advanced.id` | `advanced` | — |
| `onboarding.experience.options.advanced.label` | I'm detail-oriented | 19 |

### Screen 4: Reminders Permission

| Key | Value | Count |
|---|---|---|
| `onboarding.reminders.title` | Never miss a dose | 17 |
| `onboarding.reminders.body` | Reminders help you stay on schedule. You can customize or turn them off anytime. | 81 |
| `onboarding.reminders.primaryButton` | Enable Notifications | 20 |
| `onboarding.reminders.secondaryButton` | Not now | 7 |

### Screen 5: Disclaimer Acceptance

| Key | Value | Count |
|---|---|---|
| `onboarding.disclaimer.title` | Important legal notice | 22 |
| `onboarding.disclaimer.body` | Peptify is a personal tracking and education tool. It does not provide medical advice, diagnosis, or treatment, and does not recommend any substance or dose. Always consult a licensed healthcare professional before starting, changing, or stopping any protocol. | 280 |
| `onboarding.disclaimer.checkboxLabel` | I understand that Peptify is for tracking only and does not provide medical advice | 82 |
| `onboarding.disclaimer.acceptButton` | I Agree | 7 |

---

## Paywall

| Key | Value | Count |
|---|---|---|
| `paywall.headline` | Unlock Peptify Pro | 18 |
| `paywall.subheadline` | Manage unlimited protocols, track vials, access the full library and more. | 75 |

### Benefit Bullets

| Key | Value | Count |
|---|---|---|
| `paywall.benefits[0]` | Unlimited active protocols | 26 |
| `paywall.benefits[1]` | Reminders for all protocols | 27 |
| `paywall.benefits[2]` | Track and manage vials | 22 |
| `paywall.benefits[3]` | Full library and history | 24 |

### Trial & CTA

| Key | Value | Count |
|---|---|---|
| `paywall.trialLine` | Try free for 3 days | 19 |
| `paywall.buttonTrial` | Start 3-Day Free Trial | 21 |
| `paywall.buttonNonTrial` | Subscribe Monthly | 16 |
| `paywall.restoreButton` | Restore Purchases | 16 |

### Legal Footer

| Key | Value | Count |
|---|---|---|
| `paywall.legal.prefix` | Your subscription automatically renews unless cancelled at least 24 hours before the end of your billing period. You can manage your subscription in your device account settings.  | 188 |
| `paywall.legal.termsLink` | Terms | 5 |
| `paywall.legal.privacyLink` | Privacy | 7 |

---

## Contextual Paywall Triggers

Shown above paywall when user hits a Pro-only feature. Each is a single-line reason (≤60 chars).

| Trigger | Key | Message | Count |
|---|---|---|---|
| End of onboarding | `paywall.trigger.onboarding` | Upgrade to Pro to run multiple protocols | 39 |
| Second protocol | `paywall.trigger.secondProtocol` | Pro lets you run unlimited protocols | 34 |
| Vials tab | `paywall.trigger.vials` | Track vials with Pro | 19 |
| Locked library entry | `paywall.trigger.libraryLocked` | Pro unlocks the full library | 27 |
| History >7 days | `paywall.trigger.historyLimit` | View full history with Pro | 25 |
| CSV export | `paywall.trigger.csvExport` | Export your data with Pro | 24 |

---

## Empty States

### History Empty

| Key | Value | Count |
|---|---|---|
| `emptyState.history.title` | No doses logged yet | 19 |
| `emptyState.history.body` | Log your first dose from Today to see your history. | 51 |

### Vials Empty

| Key | Value | Count |
|---|---|---|
| `emptyState.vials.title` | No vials yet | 12 |
| `emptyState.vials.body` | Create a protocol or add a vial from Settings to track inventory. | 65 |

---

## Error States

### Generic Error

| Key | Value | Count |
|---|---|---|
| `errorState.generic.title` | Something went wrong | 20 |
| `errorState.generic.body` | Please try again. | 16 |
| `errorState.generic.retryButton` | Retry | 5 |

---

## Notes

- All text follows COMPLIANCE.md: no medical claims, no dose recommendations, no outcome promises.
- Goal options focus on tracking organization (dates, sites, inventory) rather than health outcomes.
- Onboarding disclaimer is adapted from STORE_LISTING.md and COMPLIANCE.md.
- Paywall benefits map to PRD §3 Pro features: F2 (unlimited), F7 (reminders), F8 (vials), F6+F9 (history+library).
- Legal footer uses auto-renew language from STORE_LISTING.md with placeholders for Terms and Privacy link labels.
- Empty states guide users to next action without negativity; error state is minimal and forgiving.
