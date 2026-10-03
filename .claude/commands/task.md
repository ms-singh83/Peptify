---
description: Build exactly one task from docs/TASKS.md to the definition of done
argument-hint: T-xxx
---

You are building task **$ARGUMENTS** for Peptify.

1. Read `AGENTS.md`, then find $ARGUMENTS in `docs/TASKS.md`. Read only the doc sections and source files that task needs (PRD / ARCHITECTURE / DESIGN).
2. If any task listed under "Needs" is not `[x]`, stop and say which one blocks you.
3. Mark the task `[~]` in `docs/TASKS.md`.
4. For tasks with real logic, post a plan (max 8 lines) first, then implement. For simple tasks, implement straight away.
5. For anything in `src/lib`, write the tests first, then the code.
6. Run `npx tsc --noEmit`, `npm run lint`, `npm test`. Fix until green.
7. Use the `reviewer` subagent on your diff. Fix every blocking finding.
8. Tick the task `[x]` in `docs/TASKS.md`. Commit with `feat($ARGUMENTS): <summary>`.
9. Reply with: files changed, how to check it on the simulator in ≤ 3 steps, anything deferred.

Do not touch files outside this task's scope. Do not add dependencies the task doesn't mention.
