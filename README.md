# Peptify

Privacy-first peptide tracker: protocols, dose logging, reminders, reconstitution calculator, vial inventory and an education library. Expo SDK 54 · RevenueCat · local SQLite.

## Run it (iPhone simulator)

```bash
npm ci
cp .env.example .env          # add RevenueCat keys on Day 5
npx expo run:ios              # dev build on the iPhone 14 simulator
npx expo run:android          # Android emulator / device
```

## Docs — read in this order

| Doc | What it's for |
|---|---|
| [AGENTS.md](AGENTS.md) | Rules every AI agent (Claude, Cursor) follows |
| [docs/PRD.md](docs/PRD.md) | What we build, free vs Pro, out of scope |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, folders, data model, flows |
| [docs/DESIGN.md](docs/DESIGN.md) | Design tokens, components, screens |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 7-day plan |
| [docs/TASKS.md](docs/TASKS.md) | Task board (T-101 … T-703) |
| [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md) | How to run Claude + Cursor in parallel lanes |
| [docs/QA.md](docs/QA.md) | Test checklist before every build |
| [docs/COMPLIANCE.md](docs/COMPLIANCE.md) | Store-policy and medical-claim guardrails |
| [docs/CONTENT.md](docs/CONTENT.md) | Peptide library JSON spec |
| [docs/RELEASE.md](docs/RELEASE.md) | RevenueCat, Play Store, App Store runbook |
| [docs/STORE_LISTING.md](docs/STORE_LISTING.md) | Listing copy, keywords, screenshots |
| [docs/MARKETING.md](docs/MARKETING.md) | Launch and first-30-days growth plan |
| [legal/](legal/) | Privacy policy + terms templates |

## Claude Code commands

`/task T-xxx` build one task · `/review` review diff · `/qa` QA pass · `/standup` daily status.
Subagents: `reviewer`, `qa`, `content-writer` (in `.claude/agents`). Cursor rules: `.cursor/rules/peptify.mdc`.
