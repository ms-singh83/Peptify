---
description: Review the current diff against AGENTS.md using the reviewer subagent
---

Use the `reviewer` subagent to review the uncommitted changes plus commits not yet on `main` (`git diff main...HEAD` and `git diff`).
Show me the findings grouped as **Blocking** / **Should fix** / **Nit**. Then fix all Blocking ones and re-run typecheck, lint and tests.
