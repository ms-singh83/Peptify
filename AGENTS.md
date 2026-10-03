# Peptify — rules for every AI agent (Claude Code, Cursor, subagents)

Read this file fully before writing code. It is short on purpose.

## Versions (source of truth = package.json)

- **Expo SDK 54**, React Native 0.81, React 19.1, expo-router 6, TypeScript 5.9.
- Read the versioned docs before using any Expo API: https://docs.expo.dev/versions/v54.0.0/
- Never upgrade the SDK or add packages with `npm install`. Use `npx expo install <pkg>` so versions match SDK 54.
- The app runs as a **development build** (`expo-dev-client`, `npx expo run:ios`), not Expo Go, because RevenueCat is native.

## What we are building

A privacy-first peptide **tracking + education** app (MVP in 7 days). Read in this order:
1. `docs/PRD.md` — what the product does, free vs Pro, what is OUT of scope.
2. `docs/ARCHITECTURE.md` — folders, data model, where code goes.
3. `docs/DESIGN.md` — colors, components, screen layouts.
4. `docs/TASKS.md` — the task board. Work only on the task you were given.

## Hard rules

1. **Scope:** build only what the task says. No extra features, no refactors outside the task. Ideas go to `docs/TASKS.md` → "Parking lot".
2. **No medical advice.** Never write copy that recommends a peptide, a dose, or a treatment. The library describes, the calculator calculates, the user decides. See `docs/COMPLIANCE.md`.
3. **Local-first.** All user data lives in SQLite on the device (`src/db`). No network calls except RevenueCat. Supabase is installed but **not used in the MVP**.
4. **Pure logic is tested.** Anything with math or dates (`src/lib/*`) is a pure function with a unit test next to it in `src/lib/__tests__`.
5. **Types first.** Domain types live in `src/types/domain.ts`. Validate user input with `zod` at the form boundary.
6. **UI uses the design system.** Use components from `src/components/ui` and tokens from `src/constants/theme.ts`. No hard-coded hex colors or magic spacing in screens.
7. **Every screen** handles loading, empty, and error states and works in light + dark mode.
8. **Accessibility:** every touchable has `accessibilityRole` and `accessibilityLabel`; tap targets ≥ 44pt.
9. **No secrets in code.** Keys go in `.env` (see `.env.example`) as `EXPO_PUBLIC_*`.
10. Keep files under ~250 lines; split into components/hooks when bigger.

## Definition of done (every task)

- `npx tsc --noEmit` passes, `npm run lint` passes, `npm test` passes.
- Checked on the iPhone simulator (light + dark) and, for anything native, on Android.
- `docs/TASKS.md` checkbox ticked, with one line of notes if something was deferred.
- One commit per task: `feat(T-012): add dose logging sheet`.

## Token discipline

- Read only the files the task touches. Don't scan the whole repo.
- Prefer small diffs over rewriting whole files.
- If a task is unclear, stop and ask one question instead of guessing.
