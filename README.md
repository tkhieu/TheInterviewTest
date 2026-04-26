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

### What I delegated

- **Designing the UI library**: wrote a structured design brief (`docs/ui-design-prompt.md`), let Claude generate HTML mockups, then implemented the 14 components in `packages/ui` against those mockups. Storybook was used for fast component-by-component iteration.
- **Boilerplate**: Sequelize models from SQL DDL, Express middleware (CORS, error handler, validation wrapper), RTK Query slice scaffolding, Redux store setup
- **Planning**: tier-based work plan with risk analysis, time budget, and acceptance criteria
- **Async send simulator and the `transformResponse` adapter** between BE wire format and UI lib `Campaign` type

### Real prompts used

1. **(Planning)** "Analyze this challenge spec and use /plan with ultrathink to break down the work tasks. Time budget 4–8h. Optimize for ship-early — tier T1 must be standalone-shippable."
2. **(UI design)** Full prompt at `docs/ui-design-prompt.md` — covers design language (Resend × Linear vibe), 4 screens, components to gallery, edge cases, and "do NOT" list.
3. **(Implementation)** "Implement async send simulator: mark campaign 'sending', then with `setImmediate` iterate recipients with 90/10 sent/failed random. Campaign goes 'sent' if any succeed else 'failed'. Use one transaction per recipient."

### Where Claude Code was wrong / needed correction

- **First send-simulator draft used `setTimeout(0)` inside a loop** → created N concurrent transactions instead of sequential. Fixed by `for…of` with `await`.
- **Initial UI mockup was too airy** (Mailchimp-like) — refined with "reduce density to Linear-style row heights" — needed two design iterations before settling on the final tokens.
- **Stats SQL returned `COUNT(*)` as a JS string** — Postgres bigint serialization quirk. Cast `CAST(COUNT(*) AS INTEGER)` and a unit test now guards it.
- **AI suggested storing JWT in `localStorage`** — overrode for memory-only Redux storage; XSS risk wasn't worth the convenience even though the spec allowed it.

### What I did NOT let Claude Code do

- **Final business-rule verification** — manually walked through state transitions before declaring done
- **Test case selection** — chose three tests that catch the highest-risk regressions, not just whatever was convenient
- **README authorship** — wrote this section by hand to give an honest account of AI involvement
- **Production secrets/config** — `.env.example` placeholders only; never asked AI to fill real values
- **Final monorepo shape** — AI initially suggested `packages/shared`; I dropped it after seeing the UI lib already exports the view types (avoid duplicate truth)

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
