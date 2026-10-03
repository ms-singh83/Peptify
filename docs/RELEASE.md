# Peptify — Release Runbook (Play Store first, then App Store)

## 0. Identity (already set in app.json)

- Android package / iOS bundle id: `com.nirvanalabs.peptify` · EAS project id set · `appVersionSource: remote`, `autoIncrement` on production.

## 1. RevenueCat (Day 5)

1. RevenueCat project → add **Play Store** app (needs a service-account JSON from Google Cloud with Play Console access) and **App Store** app (App Store Connect in-app purchase key `.p8`).
2. Create products in the stores first:
   - Play Console → Monetize → Subscriptions: `peptify_pro_monthly`, `peptify_pro_yearly` (base plans + 3-day free trial offer on yearly).
   - App Store Connect → Subscriptions → group "Peptify Pro": same two ids, intro offer 3-day free trial on yearly.
3. RevenueCat: entitlement `pro` ← attach both products; offering `default` with packages `$rc_monthly`, `$rc_annual`; build the paywall in the RevenueCat Paywall editor.
4. Public SDK keys → `.env` (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`) and to EAS: `eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxx --environment production` (same for iOS).
5. Note: Play subscriptions can only be bought from a build uploaded to a testing track. Add your Gmail as a **license tester** in Play Console.

## 2. Android — Google Play

```bash
eas build -p android --profile production     # produces .aab, EAS manages the keystore
eas submit -p android --latest                # first time: upload the .aab manually in Play Console
```

1. Play Console → Create app → fill App content: privacy policy URL, ads (No), app access (no login), content rating questionnaire, target audience 18+, **data safety** (see COMPLIANCE.md), **Health apps declaration**, government/financial: no.
2. Store listing from `docs/STORE_LISTING.md` (icon 512, feature graphic 1024×500, ≥ 4 phone screenshots).
3. **Testing → Closed testing:** upload build, add ≥ 12 testers (email list or Google Group). **Personal accounts:** testers must stay opted in for 14 days before you can apply for production.
4. Apply for production → rollout 100%.

## 3. iOS — App Store

```bash
eas build -p ios --profile production
eas submit -p ios --latest
```

1. App Store Connect → new app (same bundle id), category Health & Fitness, age 17+ (references to injectable substances — choose the "Medical/Treatment Information" frequent option honestly).
2. App Privacy labels (COMPLIANCE.md), subscription screenshot + review notes for the two IAPs.
3. TestFlight internal test on a real iPhone (purchases in sandbox).
4. Submit with the review notes from COMPLIANCE.md. Typical review: 24–48 h.

## 4. Every release after

- Bump nothing by hand (remote versioning). Run `docs/QA.md`. `eas build --platform all --profile production` → `eas submit`.
- JS-only fixes can go out with `eas update` once you add `expo-updates` (post-MVP).

## eas.json notes

Production profile already exists. Add `"channel": "production"` later when you add EAS Update.
