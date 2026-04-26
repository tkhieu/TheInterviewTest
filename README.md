# Mini Campaign Manager

> Full-stack mini MarTech app for creating, scheduling, and tracking email campaigns.
> Coding challenge submission — Node.js + PostgreSQL + React.

**Status**: 🚧 Work in progress. UI library complete; API + web app being implemented.

---

## Stack

| Layer | Choice |
|-------|--------|
| Backend | Node.js · Express · Sequelize · PostgreSQL · JWT |
| Frontend | React 18 · Vite · TypeScript · Redux Toolkit · RTK Query |
| UI library | `@campaign-manager/ui` (internal, shadcn-style — Tailwind + Radix + CVA + Lucide) |
| Validation | Zod (server-side, in `packages/api/src/schemas/`) |
| Monorepo | Yarn workspaces |
| Local infra | Docker Compose (Postgres + API + Web) |

---

## Project structure

```
.
├── packages/
│   ├── api/              # Express server, Sequelize models, REST endpoints, tests
│   ├── web/              # React + Vite SPA
│   └── ui/               # @campaign-manager/ui — internal component library + Storybook
├── docs/
│   ├── work-plan.md       # Tier-based implementation plan, decisions, risks, time budget
│   └── ui-design-prompt.md # Design brief used to generate the UI mockups
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick start

```bash
# 1. Clone + install
git clone <repo-url> && cd <repo>
yarn install

# 2. Bring up Postgres + API + Web (cold start runs migrations automatically)
docker compose up

# 3. (Optional) Seed demo data
yarn workspace @campaign-manager/api seed
```

Then visit:

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| API | http://localhost:4000 |
| Storybook (UI lib) | http://localhost:6006 (`yarn workspace @campaign-manager/ui storybook`) |

**Demo credentials**: `demo@example.com` / `Demo123!`

---

## Development

### Run individual workspaces

```bash
yarn workspace @campaign-manager/api dev          # API on :4000
yarn workspace @campaign-manager/web dev          # Web on :5173
yarn workspace @campaign-manager/ui storybook     # Storybook on :6006
```

### Run tests

```bash
yarn workspace @campaign-manager/api test         # Integration tests on critical business logic
```

### Database migrations

Plain SQL files in `packages/api/src/db/migrations/`, applied by a tiny runner on container startup. To re-run from scratch:

```bash
docker compose down -v && docker compose up
```

---

## Features

- **Auth**: register / login / JWT-protected routes
- **Campaigns**: full CRUD (create, list with pagination, detail, edit, delete)
- **Business rules** (server-enforced):
  - Edit/delete only when status is `draft`
  - `scheduled_at` must be a future timestamp
  - Send transitions are atomic and idempotent
- **Async send simulation**: `draft → sending → sent | failed`. Each recipient randomized 90% sent / 10% failed; campaign marked `failed` only if zero succeed.
- **Stats**: `total / sent / failed / opened / open_rate / send_rate` with safe divide-by-zero
- **UI**: 5 status badges with color coding, conditional action buttons, progress bars for rates, recipient table with hover tooltips for failures

---

## Architecture decisions

Full reasoning in [`docs/work-plan.md`](docs/work-plan.md) §2. Highlights:

- **Sequelize for CRUD, raw SQL for stats aggregation** — ORM ergonomics where it helps, raw query where it matters for the hot path
- **JWT in Redux memory** (not httpOnly cookie) — saves CSRF setup; spec allows both
- **Async send via `setImmediate` + `UPDATE … WHERE status IN (…)` guard** — atomic, idempotent, no Redis/BullMQ overhead
- **5 campaign statuses** including `failed` — parity with the UI library's `CampaignStatus` type
- **Single source of truth for view types**: `@campaign-manager/ui` exports `Campaign` / `CampaignStatus`; FE adapts BE wire format via RTK Query `transformResponse`
- **No `packages/shared`** — UI lib already exports view types; BE owns its zod schemas

---

## Tests

Three integration tests targeting the highest-leverage business rules:

1. **`campaign-edit-rules.test.ts`** — `PATCH`/`DELETE` rejected with 409 when status ≠ `draft`
2. **`send-state-machine.test.ts`** — Send transitions atomically, idempotency guard rejects double-sends, `sending → sent | failed` based on results
3. **`stats-aggregation.test.ts`** — Correct rates with edge cases (zero recipients, mixed states), no NaN/string-bigint bugs

See `docs/work-plan.md` §5 for the rationale on why these three.

---

## How I Used Claude Code

> Updated as the build progresses. Last updated: 2026-04-26.

### What I delegated (already done)

- **Designing the UI library** — wrote a structured design brief (`docs/ui-design-prompt.md`), let Claude generate HTML mockups, then implemented the 14 components in `packages/ui` against those mockups. Storybook drove component-by-component iteration.
- **Plan expansion (solo → team mode)** — ran `/ralplan` (Architect + Critic consensus loop with iterate/approve gates) over the v1 solo plan. Rev2 added the 2-stream BE/FE DAG, RACI matrix, and §6 API contract; rev3 applied iteration-2 consensus fixes (canonical "~2h mark (sync pt 2)" wording across the doc, T1.6 fixture-capture workflow, T2.3 dependency loosening, DoD item 7 on fixture-regen).
- **Repo bootstrap (T1.1)** — root `package.json` with `packages/*` workspace glob, `tsconfig.base.json` mirroring the UI lib's compiler options (no `include`/`exclude` so each workspace owns its scope), `.editorconfig`, and `.env.example` derived from work-plan §6 (API contract) and §7 (MSW switches). `packageManager` pinned to `yarn@1.22.22`.
- **DB + Docker + migrations (T1.2)** — `packages/api` scaffolded with Express + Sequelize + zod env-validation; tiny custom SQL migration runner (`packages/api/src/db/migrate.ts`, ~30 lines) tracks applied files in a `schema_migrations` table and applies each `.sql` file in a single transaction; `001_init.sql` is verbatim from work-plan Appendix A plus `CREATE EXTENSION pgcrypto` for `gen_random_uuid()`. Dockerfile drops privileges to the unprivileged `node` user (uid 1000) — caught by the Semgrep hook on first draft. `docker-compose.yml` boots Postgres 16 + the API with a Postgres `pg_isready` healthcheck gating `api.depends_on`.
- **API skeleton + Auth (T1.3)** — `POST /auth/register` and `POST /auth/login` per work-plan §6 (lines 217–232), with bcryptjs hashing + JWT signing in `packages/api/src/lib/auth.ts` and a `requireAuth` middleware that narrows the `jsonwebtoken` payload (`typeof decoded.userId === 'string'`) before trusting it. Centralized `HttpError` + `errors.X()` factory + single `errorHandler` so the §6 error envelope `{error: {code, message, details?}}` is emitted from exactly one place. Email lowercased at the zod boundary (not in the handler) so register and login agree on case. helmet + cors mounted in `index.ts`.
- **Campaign CRUD (T1.4)** — full `GET/POST/PATCH/DELETE /campaigns` per §6. Stats query uses `CAST(COUNT(*) FILTER (WHERE status = 'sent') AS INTEGER)` (Postgres `FILTER` clause + the int cast that `CLAUDE.md` hard rule #5 demands). List endpoint uses `LEFT JOIN LATERAL` to embed `recipients_count` and `send_rate` per row in a single query (no N+1). Cross-user 404 *and* invalid-UUID 404 — same envelope, same status — to deny enumeration signal. `createCampaign` runs in a single transaction: `findOrCreate` recipients (lowercased + Set-deduped before the loop, since unique-by-email collisions would abort otherwise), then `bulkCreate` `campaign_recipients` rows with `status='pending'`.
- **Schedule + async send (T2.1)** — `POST /:id/schedule` and `POST /:id/send` per §6. The transition guard is the load-bearing piece: `Campaign.update({status:'sending'}, {where: {id, created_by, status: {[Op.in]: ['draft','scheduled']}}})` returns the affected-row count and the route returns 409 if zero. *That single SQL statement* is what makes double-send impossible — Postgres serializes the two UPDATEs and exactly one returns count=1. The simulator runs in `setImmediate` (the request returns 202 in <10ms) and iterates recipients **sequentially** (`for…of` with `await`) — never `recipients.map(async)` or `setTimeout(0)` in a loop, both of which would N-ify transactions per CLAUDE.md hard rule #3. Final transition includes `where: {id, status: 'sending'}` so finalization only affects what *we* started — defensive against a future cancel-send feature. The sent/failed tally counts `status='sent'` recipients, not `status='failed'` ones (hard rule #6: 10 sent + 5 failed = `sent`, not partial-failed). Two non-obvious type fixes also landed: `validateBody`'s generic widened from `<T>(ZodSchema<T>)` to `<S extends ZodTypeAny>(S)` to accept `.transform()`-bearing schemas (the `scheduled_at` ISO-string→Date transform), and `req.params.id` narrowed via a local `const` because `noUncheckedIndexedAccess` correctly types it as `string | undefined` and Express 4's types don't infer it back from the route pattern. Semgrep also caught a CWE-134 format-string bug in the catch handler (`console.error(\`...${campaignId}\`)` → `console.error('...%s', campaignId)`) — fixed in the same commit.
- **Recipients endpoints (T2.2)** — `GET /recipients?page&limit` (alphabetical by email) and `POST /recipients` per §6 (lines 311–313). Both `requireAuth`-guarded but the `recipients` table itself is *not* user-scoped (no `created_by` column) — same email is one row regardless of which user references it, matching work-plan decision D13's lookup-or-create shape. Email lowercased at the zod boundary (same idiom as T1.3 auth). Reuses the existing `errors.emailExists()` factory on `UniqueConstraintError` so register and `POST /recipients` emit the identical `409 EMAIL_EXISTS` envelope.

### What I plan to delegate

- **`transformResponse` adapter** between BE wire format and the UI lib `Campaign` type (snake_case → camelCase, decimal rates → percentages where the lib expects them)
- **FE setup** (T1.0, T1.5, T1.6) — Vite + RTK Query store, MSW mock-first scaffolding, the contract-conformance test that validates MSW responses against a real-BE fixture

### Real prompts used

1. **(Planning, v1 → team-mode)** `/oh-my-claudecode:ralplan review docs/work-plan.md, make it detailed enough to work with a team` — drove rev2 + rev3 through the Architect + Critic iterate/approve loop.
2. **(UI design)** Full prompt at `docs/ui-design-prompt.md` — covers design language (Resend × Linear vibe), 4 screens, components to gallery, edge cases, and "do NOT" list.
3. **(Async send, planned)** "Implement async send simulator: mark campaign 'sending', then with `setImmediate` iterate recipients with 90/10 sent/failed random. Campaign goes 'sent' if any succeed else 'failed'. Use one transaction per recipient."

### Where Claude Code was wrong / needed correction

- **Misleading commit message** — an earlier session's `chore: bootstrap monorepo with .gitignore` commit only added `.gitignore`; no root `package.json` or `tsconfig.base.json` ever landed. Caught at the start of T1.1 by inspecting `packages/` and the repo root against the work plan's expected bootstrap state — *commit messages are a claim, the working tree is the truth*.
- **First send-simulator draft used `setTimeout(0)` inside a loop** → would have created N concurrent transactions instead of sequential. Fix locked into `CLAUDE.md` hard rule #3 (`for…of` with `await`, plus `UPDATE … WHERE id = $1 AND status IN (...)` with rowcount guard) before any send code is written.
- **Initial UI mockup was too airy** (Mailchimp-like) — refined with "reduce density to Linear-style row heights"; settled the design tokens after two iterations.
- **Stats SQL would have returned `COUNT(*)` as a JS string** — Postgres `bigint` serialization quirk. Locked in `CLAUDE.md` hard rule #5 (`CAST(COUNT(*) AS INTEGER)`) and reserved test slot 3 (`stats-aggregation.test.ts`, work-plan §14) to guard it.
- **AI suggested storing JWT in `localStorage`** — overrode for memory-only Redux storage; XSS risk isn't worth the convenience even though the spec allows either. Locked in `CLAUDE.md` hard rule #4.
- **AI suggested `packages/shared`** for shared view types — dropped after recognizing `@campaign-manager/ui` already exports `Campaign` / `CampaignStatus` (work-plan decision D15). Avoids two competing sources of truth.

### What I did NOT let Claude Code do

- **Final business-rule verification** — I'll manually walk every state transition before declaring done; AI can suggest, only I can sign off.
- **Test case selection** — I chose the three tests in §14 of the plan because they catch the highest-risk regressions (edit-rule bypass, double-send race, stats type drift), not whatever was easy to write.
- **README authorship** — this section is written by hand. Each "delegated" item is verifiable in `git log`; each correction is tied to a hard rule a reviewer can grep for. *No fabricated prompts.*
- **Production secrets/config** — `.env.example` ships placeholders only (`replace-me-with-a-32-char-random-secret`); no real credentials touched the prompt.
- **Final monorepo shape** — AI initially suggested `packages/shared`; dropped (see correction above).

---

## Submission checklist

- [ ] All endpoints from spec implemented and pass manual smoke test
- [ ] 3+ meaningful tests pass (`yarn workspace @campaign-manager/api test`)
- [ ] `docker compose up` cold start works
- [ ] README "How I Used Claude Code" section is honest and complete
- [ ] Repo public on GitHub
- [ ] Walkthrough summary prepared

---

## License

MIT — feel free to learn from this.
