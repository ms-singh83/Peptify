# Peptify — How to Orchestrate Claude + Cursor (fast, high quality, low tokens)

## The model: 3 lanes, 1 contract, 1 gate

```
                    ┌──────────────────────────────┐
                    │  CONTRACT (written once)      │
                    │  AGENTS.md · PRD · ARCH ·     │
                    │  DESIGN · types/domain.ts     │
                    └──────────────┬───────────────┘
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
 LANE A  Claude Code         LANE B  Cursor             LANE C  Claude (cheap)
 logic · DB · schedule ·     screens · components ·     content JSON · legal ·
 notifications · payments    styling · forms            store copy · marketing
 worktree: ../peptify-a      worktree: ../peptify-b     no code worktree needed
        └──────────────────────────┼──────────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │ GATE: typecheck · lint · test │
                    │ /review subagent · sim check  │
                    └──────────────┬───────────────┘
                                   ▼
                                 main
```

**Why this is fast:** the contract (types + docs) is written first, so UI and logic are built at the same time without waiting on each other. **Why it's high quality:** every merge passes the same gate. **Why it saves tokens:** each agent session reads a few small docs + only the files for one task.

## Setup (once, ~10 min)

```bash
# parallel checkouts so Claude and Cursor never edit the same files at the same time
git worktree add ../peptify-a -b lane-a
git worktree add ../peptify-b -b lane-b
cp .env ../peptify-a/ ; cp .env ../peptify-b/
(cd ../peptify-a && npm ci) ; (cd ../peptify-b && npm ci)
```

- Open `../peptify-b` in **Cursor**. Run `claude` in `../peptify-a`.
- Keep `npx expo run:ios` running from **one** checkout only (usually `peptify-b`, the UI lane). After merging lane A, pull it into lane B and the simulator hot-reloads.
- Merge each lane into `main` at least twice a day (`git merge lane-a` from main, then `git merge main` back into each lane).

If worktrees feel like too much: work in one folder, but never have Claude and Cursor run tasks at the same time.

## The loop for every task

1. **Pick** — next unblocked task in `docs/TASKS.md`.
2. **Build** — Claude: `/task T-201`. Cursor: paste the Cursor prompt template below.
3. **Check** — `npx tsc --noEmit && npm run lint && npm test`.
4. **Review** — in Claude: `/review` (runs the `reviewer` subagent on the diff).
5. **Try** — 60 seconds on the iPhone 14 simulator (light + dark).
6. **Commit** — `feat(T-201): schedule engine`. Tick the box in TASKS.md.
7. **Clear** — `/clear` in Claude, new chat in Cursor. Never carry an old chat into a new task.

## Which tool / model for what

| Work | Tool | Model | Why |
|---|---|---|---|
| Schedule engine, DB, notifications, purchases, tricky bugs | Claude Code | Opus | Logic-heavy, multi-file, gets it right first time |
| Normal feature tasks with clear spec | Claude Code | Sonnet | Fast + cheaper |
| Screens, components, styling, small edits | Cursor | Auto / Sonnet | Inline, visual, cheap |
| Content JSON, legal, store copy, marketing | Claude (`content-writer` agent) | Haiku/Sonnet | Bulk text, low reasoning |
| Code review | `reviewer` subagent | Sonnet | Fresh context, catches what the builder missed |
| QA checklist | `qa` subagent + you on simulator | Sonnet | Structured, repeatable |

Switch model in Claude Code with `/model`.

## Token-saving rules

1. One task per session, then `/clear`.
2. Point to docs, don't paste them: "Follow docs/DESIGN.md §Today".
3. Ask for a plan first on big tasks ("plan only, max 10 lines"), approve, then build — prevents expensive wrong turns.
4. When debugging, paste only the error + the one relevant file.
5. Ask for edits/diffs, not whole-file rewrites.
6. Let tests define behavior for logic: write the test cases in the prompt, have the agent make them pass.
7. Don't let agents run `expo start` or browse docs repeatedly — you run the simulator.

## Prompt templates

**Claude Code (lane A):**
```
/task T-201
```
(the command loads AGENTS.md + the task and enforces the definition of done)

**Cursor (lane B)** — Composer/Agent mode:
```
Read AGENTS.md and docs/DESIGN.md. Do task T-203 from docs/TASKS.md only.
Use components from src/components/ui and hooks from src/features/protocols.
Do not modify src/lib, src/db or other tasks' files.
When done: list files changed and how to test on the simulator.
```

**Bug fix (either tool):**
```
Bug: <one line>. Steps: <1,2,3>. Expected: <x>. Actual: <y>.
Error: <paste>. Likely file: <path>. Fix minimally, add a test if it's in src/lib.
```

## Claude Code building blocks in this repo

| Path | What |
|---|---|
| `.claude/commands/task.md` | `/task T-xxx` — build one task to definition of done |
| `.claude/commands/review.md` | `/review` — reviewer subagent on current diff |
| `.claude/commands/qa.md` | `/qa` — runs QA checklist, writes bugs to TASKS.md |
| `.claude/commands/standup.md` | `/standup` — status of the day vs ROADMAP, what's next per lane |
| `.claude/agents/reviewer.md` | Read-only code reviewer against AGENTS.md rules |
| `.claude/agents/qa.md` | QA planner/checker |
| `.claude/agents/content-writer.md` | Peptide library + store/legal/marketing text |
| `.cursor/rules/peptify.mdc` | Makes Cursor always obey AGENTS.md |

## Daily rhythm

- **Morning (10 min):** `/standup` → pick tasks for each lane.
- **Build blocks:** 90 min focused, both lanes running.
- **Midday + evening merge:** merge lanes → main, run full checks, simulator smoke test.
- **End of day:** `/standup` again, push `main`, write tomorrow's first task.
