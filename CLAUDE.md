# CLAUDE.md — Mini Campaign Manager

Project-specific guidance for Claude Code sessions in this repo.
**Read [`docs/work-plan.md`](docs/work-plan.md) before any non-trivial change.** It is the source of truth for decisions, acceptance criteria, and task ordering. This file just enforces the most-broken rules.

---

## Project context

Coding-challenge submission: full-stack Mini Campaign Manager (MarTech tool for email campaigns). Time budget 4–8 hours total. Reviewer evaluates: backend correctness, API design, frontend quality, code quality, AI collaboration judgment, and test coverage.

The plan in `docs/work-plan.md` is tier-organized so the project remains shippable at any cut-off point — preserve that property when modifying scope.

---

## Tech stack (locked — do NOT change)

- **Backend**: Express + Sequelize + PostgreSQL + JWT — *not* Fastify, *not* Prisma
- **Frontend**: React 18 + Vite + TypeScript + Redux Toolkit + RTK Query — *not* React Query
- **UI**: `@campaign-manager/ui` (already built — see `packages/ui/`); consume via workspace protocol
- **Validation**: Zod (BE-only, in `packages/api/src/schemas/`)
- **Migrations**: raw SQL files in `packages/api/src/db/migrations/` + tiny runner — *not* umzug, *not* Sequelize sync
- **Monorepo**: yarn workspaces

---

## Repo conventions

- **Three packages only**: `api`, `web`, `ui`. **Do NOT create `packages/shared`** — `@campaign-manager/ui` already exports view types (`Campaign`, `CampaignStatus`).
- **Package names**: `@campaign-manager/{api,web,ui}`
- **Tests**: `packages/api/tests/*.test.ts` (no co-located `__tests__`)
- **DB columns**: `snake_case`. **TypeScript identifiers**: `camelCase`. The boundary is the RTK Query `transformResponse` adapter on the FE.
- **API errors**: shape is `{ error: { code: string, message: string, details?: unknown } }`. HTTP status reflects the error class (400/401/403/404/409/500).

---

## Hard rules (enforced by tests + reviewer)

1. **Don't break the UI lib API contract.** The `Campaign` type exported from `packages/ui/src/components/CampaignTable.tsx` is the wire format the FE renders against. BE serializes idiomatic snake_case; FE adapter (in RTK Query `transformResponse`) maps to lib shape — adapt in **one place**, never per-component.
2. **Status enum has 5 values**: `draft | scheduled | sending | sent | failed`. The Postgres `campaign_status` ENUM, the Sequelize model, and the lib's `CampaignStatus` type must all match. Adding/removing requires a migration + lib update + test update.
3. **Async send must be idempotent.** Use `UPDATE campaigns SET status='sending' WHERE id = $1 AND status IN ('draft','scheduled')` and check rowcount before scheduling work. Never fire `setTimeout(0)` inside a loop without `await` — that creates N concurrent transactions.
4. **JWT in memory only** (Redux state). Never `localStorage`, never `sessionStorage`, never plain cookies.
5. **Stats SQL casts `COUNT(*)` to `INTEGER`.** Postgres bigint serializes as a JS string otherwise — that breaks `open_rate` / `send_rate` math silently. Test 3 (`stats-aggregation.test.ts`) guards this.
6. **Send-result transition logic**: ≥1 recipient sent ⇒ campaign `sent`; 0 sent ⇒ `failed`. Don't conflate `failed` recipients with `failed` campaign.

---

## Common commands

```bash
# Bootstrap
yarn install

# Dev servers
yarn workspace @campaign-manager/api dev          # API on :4000
yarn workspace @campaign-manager/web dev          # Web on :5173
yarn workspace @campaign-manager/ui storybook     # Storybook on :6006

# Tests
yarn workspace @campaign-manager/api test
yarn workspace @campaign-manager/api test --watch

# Type check
yarn workspace @campaign-manager/ui typecheck
yarn workspace @campaign-manager/web tsc --noEmit
yarn workspace @campaign-manager/api tsc --noEmit

# DB
yarn workspace @campaign-manager/api seed         # Seeds 1 user + 5 campaigns + 20 recipients
docker compose down -v && docker compose up       # Reset + cold start

# Build
yarn workspace @campaign-manager/web build
yarn workspace @campaign-manager/ui build-storybook
```

---

## Plan + task tracking

- Work tasks live in `docs/work-plan.md` §4 (T1.0 → T-FINAL).
- The plan is a snapshot, not a live tracker. Don't edit it for routine task completion. Update it only when a decision changes (e.g. dropping/adding a tier, changing the stack).
- The 17 decisions in `docs/work-plan.md` §2 are *load-bearing* — they're referenced by acceptance criteria and tests. Question them, but document the change before code changes.

---

## Style

- **Comments**: only when the *why* is non-obvious. Don't narrate what the code does.
- **No emoji** in source code or commit messages
- **Naming**: snake_case in DB, camelCase in TS, PascalCase for React components and types
- **Error responses**: always JSON, never plain text
- **Imports**: third-party first, then internal, separated by blank line

---

## Standing authorizations (user pre-approved)

- **`--no-gpg-sign` is permitted** for `git commit` in this repo. Local git config has `commit.gpgsign=true` with 1Password as the SSH signing agent, but the agent socket isn't reachable from this WSL2 environment. Signed history is not required for this scratch interview submission.
  - Apply **per-commit**: `git commit --no-gpg-sign -m "..."`
  - Do **NOT** modify global or local `commit.gpgsign` config — keep the user's signing setup intact for other repos.

---

## What NOT to do

- Don't add `packages/shared` — see decision D15 in `docs/work-plan.md`
- Don't switch from Sequelize to Prisma (spec was contradictory; Sequelize won, see decision D2)
- Don't add Redis / BullMQ for the send simulator — `setImmediate` is enough for this scope
- Don't create commits without explicit user request
- Don't modify `commit.gpgsign` config (global or local) or use `-c commit.gpgsign=false` — only the per-commit `--no-gpg-sign` flag is authorized (see Standing authorizations above)
- Don't skip git hooks (`--no-verify`)
- Don't fabricate prompts/corrections in the README "How I Used Claude Code" section — it's a judgment-evaluation criterion, fabrication is the worst possible signal
- Don't expand UI lib component APIs without a corresponding test + Storybook story update
- Don't deploy or expose anything publicly without user request — local Docker only by default
