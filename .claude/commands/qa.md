---
description: Run the QA checklist and record bugs in docs/TASKS.md
---

Use the `qa` subagent on `docs/QA.md`:
1. Run the automatable checks (typecheck, lint, tests, grep for hard-coded colors, missing accessibilityLabel, console.log, TODO).
2. Turn the manual checklist into a short numbered list I can do on the iPhone 14 simulator and on Android (≤ 25 steps).
3. Add every failure as a bug under "## Bugs" in `docs/TASKS.md` with priority P0/P1/P2.
