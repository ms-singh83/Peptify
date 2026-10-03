# Peptify — QA Checklist

Run on **iPhone 14 simulator** (light + dark) and **one Android device/emulator** before every store build.
P0 = crash/data loss/payment broken · P1 = core flow broken or wrong number · P2 = cosmetic.

## Automated

- [ ] `npx tsc --noEmit` · `npm run lint` · `npm test` all green
- [ ] No hex colors outside `src/constants/theme.ts`, no `console.log`, no TODO in shipped code

## Core flows

1. **Fresh install:** onboarding shows once → disclaimer must be accepted → notification permission prompt → paywall dismissible → lands on Today (empty state).
2. **Calculator:** 5 mg + 2 mL + 250 mcg → 10 units / 0.10 mL / 2,500 mcg/mL / 20 doses. Empty or 0 input shows no result, no crash. Switching mcg↔mg updates correctly.
3. **Protocol:** create daily 08:00 → appears on Today. Edit time → Today + reminder update. Pause → disappears from Today, no reminder. Free user creating a 2nd active protocol → paywall.
4. **Schedules:** weekdays (Mon/Wed/Fri), every 3 days, cycle 5 on / 2 off all show on correct dates for the next 14 days.
5. **Log dose:** Taken → green, site saved, vial remaining drops by the dose. Skip → yellow. Past slot with no log shows "missed" in history. Unscheduled dose logs correctly.
6. **Site rotation:** suggested site = least recently used.
7. **Reminders:** set a protocol 2 min ahead → notification fires (app in background and killed). Tap → opens dose sheet for that slot.
8. **Vials:** remaining bar accurate; low stock (< 3 doses) + expiry (< 3 days) warnings.
9. **Library:** search works; free entries open; locked entry → paywall for free user.
10. **Purchase (sandbox):** buy yearly → all gates unlock immediately. Kill app, airplane mode, reopen → still Pro. Restore on second device/reinstall works.
11. **Settings:** links open; CSV export (Pro) shares a valid file.
12. **Data persistence:** kill + relaunch keeps everything. Upgrading from previous build keeps data (migrations).

## Look & feel

- [ ] Dark mode on every screen · Dynamic Type XL doesn't break layouts · small screen (iPhone SE) OK
- [ ] Every screen has empty / loading / error state · keyboard never covers inputs · haptics on log
- [ ] VoiceOver reads buttons meaningfully

## Store-readiness

- [ ] Disclaimer visible on calculator, library detail and onboarding
- [ ] Privacy policy + terms links work in app and on paywall
- [ ] App icon, splash, version/build number bumped
