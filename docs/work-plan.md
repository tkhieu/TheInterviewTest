# Mini Campaign Manager — Team Work Plan

**Mode**: Team execution (2 streams: BE + FE) with optional 3rd reviewer/QA.
**Time budget**: 4–8h *wall-clock* with 2 parallel streams ≈ 6–10 *person-hours* aggregate.
**Spec source of truth**: Spec phiên bản 2 (mới hơn). Conflict reconciled in §2 Decisions.
**Status**: **FINAL** — Consensus approved (Architect PASS-WITH-NOTES, Critic APPROVE) at iteration 2 of 5 (ralplan).

---

## 0. Changelog

### 2026-04-26 (rev 1) — UI library pre-built (`packages/ui/`)
(Original solo-mode pivot for the pre-built `@campaign-manager/ui` library: 5-status enum parity, drop `packages/shared`, new T1.0 smoke check, transformResponse adapter pattern, BE↔UI shape contract via RTK Query. See solo-baseline historical context — same 17 decisions D1–D17 inherit unchanged.)

### 2026-04-26 (rev 2) — **Team-mode pivot**
- Added §3 Team Composition, §4 Parallel DAG, §5 Ownership Matrix
- Added §6 API Contract (single source of truth for BE↔FE handoff)
- Added §7 Mock-first FE (MSW)
- Added §8 Branch & PR Strategy, §9 Definition of Done, §10 Communication, §11 Onboarding
- Added 5 team-mode decisions (D18–D22)
- Time budget recalculated as person-hours vs wall-clock; risk register expanded; ADR appended

### 2026-04-26 (rev 3) — **Consensus iteration 2 (Architect + Critic) — APPROVED**
Iteration-1 fixes (Architect + Critic ITERATE feedback):
- Principle #3 reworded to "Mock-first parallelism with adapter-boundary validation" — resolves tension with hard rule #1
- Sync pt 2 promoted to fire after BE merges T1.4 (was T2.1) — FE switches list endpoint to real BE; MSW remains for T2.1 send/poll only
- NEW T1.6 ticket: RTK Query `transformResponse` adapter conformance test (FE, 20m)
- MSW-drift mitigation in §12 replaced with concrete artifact: `mocks/contract-conformance.test.ts`
- §6 contract holes filled: recipients array bound, `POST /campaigns` rejects `scheduled_at`, cross-user 404 (anti-enumeration)
- §13 T2.4 estimate bumped 20m → 30m
- §15 added 3 team-mode verification rows (MSW match, adapter test, PR cross-stream audit)
- §16 wall-clock recalibrated 4.0h → 4.5h; FE person-hours 1.7 → 2.6 (banks adapter test + Playwright)
- ADR added "Principle #3 reconciliation" sub-section

Iteration-2 applied improvements (Architect PASS-WITH-NOTES + Critic APPROVE):
- Replaced all "minute 90 / 90 minutes" references with canonical "~2h mark (sync pt 2)" wording across D20, §10, §12, principle #3, and ADR
- §13 T1.6 AC: specified fixture-capture workflow (curl command + path + regen trigger)
- §5 T2.3 row dependency loosened from "T1.5, T1.6" to "T1.5 + sync pt 2" (T1.6 doesn't logically gate T2.3 which uses MSW for send only)
- §9 DoD added item 7 (fixture-regen gate on response-shape PRs)
- §16 "Why 4.5h" derivation rewritten to acknowledge BE critical path drives sync pt 2 timing (not a fixed 90m clock)

---

## 1. Requirements Summary

Build full-stack Mini Campaign Manager:
- **Backend**: Express + Sequelize + PostgreSQL + JWT, REST API, validation (zod), migrations, ≥3 tests.
- **Frontend**: React 18 + Vite + TypeScript + Redux Toolkit + RTK Query.
- **UI Library**: `@campaign-manager/ui` đã pre-built — `packages/web` consume qua workspace protocol. Không xây inline.
- **Monorepo**: yarn workspaces với 3 packages: `packages/api`, `packages/web`, `packages/ui`. **KHÔNG có `packages/shared`** — types từ `@campaign-manager/ui`, zod ở `packages/api/src/schemas/`.
- **Deploy local**: `docker compose up` đưa Postgres + API + Web online.
- **README**: bắt buộc có section "How I Used Claude Code".

Team-mode additions:
- **Target team**: 2 engineers (BE + FE) — or 2 AI agent worktrees + 1 coordinator. Optional 3rd for QA / DevOps.
- **Person-hours total**: 6–10h (vs 4–8h wall-clock with parallelism).
- **Coordination model**: trunk-based with short-lived feature branches; squash-merge to `main` per ticket; cross-stream PR review (BE reviews FE, FE reviews BE).

---

## 2. Decisions (D1–D22)

D1–D17: unchanged from solo plan baseline (Express, Sequelize+raw SQL for stats, 5-status enum, async send via setImmediate, JWT in Redux memory, zod BE-only, raw SQL migrations, RTK Query, `@campaign-manager/ui` workspace, decimal 0..1 rates, REST conventions, embedded stats in detail, recipient lookup-or-create, drop `packages/shared`, transformResponse adapter, skip dark mode v1).

New for team mode:

| # | Decision | Rationale |
|---|----------|-----------|
| D18 | **Team composition = 2 streams** (Stream A: BE, Stream B: FE). T1.1 bootstrap and T-FINAL README are *Shared* (one owner does, the other reviews). | 2 streams maximizes parallelism with minimum coordination overhead in 4–8h. Tri-stream adds review queues without proportional throughput gain at this scope. |
| D19 | **Trunk-based + short-lived feature branches** per ticket; PRs squash-merged to `main`. Branch naming: `feature/T<tier>.<num>-<slug>`. | Keeps `main` always demoable; squash keeps history readable; single-commit-per-ticket maps cleanly to acceptance criteria. |
| D20 | **Mock-first FE with adapter-boundary validation** via MSW. FE switches list endpoint to real BE *immediately after T1.4 merges* (sync pt 2 ~ 2h mark). MSW remains only for T2.1 send/poll polling. | Resolves principle/hard-rule tension: FE blocks on BE only at adapter boundary. Catches contract drift at ~2h mark (sync pt 2), not at full integration (~3h+). |
| D21 | **Definition of Done** = AC ticked + tests green + 1 cross-stream review approval + squash-merged to main + `docker compose up` still works + (if response shape changed) fixture regenerated. No "almost done" state. | Eliminates WIP ambiguity; reviewer evaluates atomic units. |
| D22 | **Communication = PR descriptions + tier-prefixed commits + 4 mandatory sync points** (Kickoff, MSW→Real-list, Full-integration, Final). No standups for this scope. | Sync points are deterministic (event-driven, not time-driven) → fits flexible 4–8h windows. PR descriptions are durable artifacts (recruiter-readable). |

---

## 3. Team Composition & Roles

### Stream A — Backend Engineer
- **Primary**: Express + Sequelize models + auth + REST endpoints + business rules + DB migrations + integration tests + seed script
- **Tickets owned**: T1.2, T1.3, T1.4, T2.1, T2.2, T3.1, T3.3
- **Person-hours**: ~4.0h
- **Reviews**: All FE PRs (catches contract drift)

### Stream B — Frontend Engineer
- **Primary**: Vite/React/TS scaffold + Redux/RTK Query store + UI lib integration + 4 pages + MSW mocks + adapter test + UI polish
- **Tickets owned**: T1.0, T1.5, T1.6, T2.3, T2.4, T3.2, T4 Playwright (banked into idle window)
- **Person-hours**: ~2.6h
- **Reviews**: All BE PRs (catches API shape drift)

### Shared (both)
- **Tickets**: T1.1 Bootstrap (one owner does, other reviews), T-FINAL README (BE writes API/DB/tests sections; FE writes UI/UX section + acts as "README editor-in-chief" for coherence; both write "How I Used Claude Code" honestly)
- **Person-hours**: ~0.75h
- **Other duties**: §6 API contract sign-off (both), final integration smoke (both)

### AI-agent mapping (if both streams = Claude Code agents)
```
git worktree add ../mcm-be feature/be-stream    # Agent A (BE)
git worktree add ../mcm-fe feature/fe-stream    # Agent B (FE)
# Coordinator: stays on main, merges PRs, runs `docker compose up` integration smoke
```

---

## 4. Parallel DAG (Task Graph)

```
                    ┌──────────────────────┐
                    │ T1.1 Bootstrap       │ shared, 15m
                    │ (root configs)       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                                 ▼
      ┌───────────────────┐           ┌───────────────────┐
      │   STREAM A: BE    │           │   STREAM B: FE    │
      └───────────────────┘           └───────────────────┘
              │                                 │
      ┌───────▼───────────┐           ┌─────────▼─────────┐
      │ T1.2 DB+Docker    │           │ T1.0 UI lib smoke │ 15m
      │ 25m               │           │ + MSW handler     │
      └───────┬───────────┘           │ scaffold          │
              │                       └─────────┬─────────┘
      ┌───────▼───────────┐                     │
      │ T1.3 API+Auth     │ 40m  ┄┄┄ §6 API ┄┄┄│ contract
      │                   │      ┄┄┄ contract ┄┄│ sign-off
      │                   │      ┄┄┄ (sync pt 1)│
      └───────┬───────────┘                     │
              │                       ┌─────────▼─────────┐
      ┌───────▼───────────┐           │ T1.5 Login+List   │
      │ T1.4 CRUD         │ 45m       │ (vs MSW) 30m      │
      └───────┬───────────┘           └─────────┬─────────┘
              │                                 │
              └───── sync pt 2 ─────────────────┤  ~2h mark
              FE swaps list endpoint to real    │ (BE-paced)
              BE; runs T1.6 adapter test        │
                                                │
                                       ┌────────▼─────────┐
                                       │ T1.6 transformResp │ 20m
                                       │ adapter conform   │
                                       │ test (FE)         │
                                       └────────┬─────────┘
              │                                 │
      ┌───────▼───────────┐           ┌─────────▼─────────┐
      │ T2.1 Sched+Send   │ 45m       │ T2.3 New page     │ 20m
      │ async             │           │ (vs MSW for send) │
      └───────┬───────────┘           └─────────┬─────────┘
              │                                 │
      ┌───────▼───────────┐           ┌─────────▼─────────┐
      │ T2.2 Recipients   │ 15m       │ T2.4 Detail page  │ 30m
      │                   │           │ (poll vs real BE  │
      └───────┬───────────┘           │  after T2.1)      │
              │                       └─────────┬─────────┘
              └────── sync pt 3 ────────────────┤
              full integration smoke             │
              (all endpoints, real BE)          │
                                                │
      ┌───────▼───────────┐           ┌─────────▼─────────┐
      │ T3.1 Tests (3)    │ 45m       │ T3.2 Polish       │ 20m
      │ T3.3 Seed         │ 15m       │ + T4 Playwright   │ 30m
      │                   │           │   (during idle)   │
      └───────┬───────────┘           └─────────┬─────────┘
              └────────────────┬────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Final integration    │ sync pt 4
                    │ smoke + T-FINAL      │ 30m
                    │ README (shared)      │
                    └──────────────────────┘
```

### Critical path & wall-clock
- **BE critical path**: T1.1 → T1.2 → T1.3 → T1.4 → T2.1 → T2.2 → T3.1 → T3.3 → T-FINAL ≈ **4.0h coding**
- **FE critical path**: T1.1 → T1.0 → T1.5 → T1.6 → T2.3 → T2.4 → T3.2 → T-FINAL ≈ **2.6h coding** (Playwright in idle window)
- **Sync overhead**: 4 sync points × ~7.5m = 30m blocking time
- **Wall-clock realistic**: BE coding + sync overhead ≈ **4.5h**

### Sync points (mandatory, event-driven)
1. **Kickoff** (T = 0): 5m — task assignments confirmed, branches created, §6 contract reviewed
2. **MSW→Real (list)** (BE merges T1.4): 5m — FE swaps `GET /campaigns` from MSW to real BE; runs T1.6 adapter test against real fixture; **principle #3 reconciliation point — adapter-boundary validation lands at ~2h mark (sync pt 2), not full integration**
3. **Full integration smoke** (BE merges T2.1 + FE merges T2.4): 10m — all endpoints real; FE polls real BE for `sending` campaigns; verify `failed` transition path
4. **Final** (T3.x complete): 10m — full smoke + README review + push

---

## 5. Ownership Matrix (RACI)

R = Responsible | A = Accountable | C = Consulted | I = Informed

| Task | R | A | C | I | Time | Blocked by | Unblocks |
|------|---|---|---|---|------|-----------|----------|
| T1.1 Bootstrap (root configs) | BE *or* FE | other stream | — | — | 15m | — | All |
| T1.0 UI lib smoke + MSW scaffold | FE | FE | — | BE | 15m | T1.1 | T1.5 |
| T1.2 DB + Docker + migrations | BE | BE | — | FE | 25m | T1.1 | T1.3 |
| T1.3 API skeleton + Auth | BE | BE | FE (re §6) | FE | 40m | T1.2 | T1.4, sync pt 1 |
| T1.4 Campaign CRUD | BE | BE | FE | FE | 45m | T1.3 | T2.1, **triggers sync pt 2** |
| T1.5 FE login + list (vs MSW) | FE | FE | BE (re §6) | BE | 30m | T1.0 + sync pt 1 | T1.6, T2.3 |
| **T1.6** transformResponse adapter test | FE | FE | BE | BE | 20m | T1.4 + sync pt 2 | sync pt 3 readiness |
| T2.1 Schedule + Send (async) | BE | BE | FE (polling spec) | FE | 45m | T1.4 | T2.4 polling, T3.1, **triggers sync pt 3** |
| T2.2 Recipients endpoints | BE | BE | — | FE | 15m | T1.3 | independent |
| T2.3 FE New page (vs MSW for send only) | FE | FE | BE | BE | 20m | **T1.5 + sync pt 2** | T2.4 |
| T2.4 FE Detail page (poll vs real BE) | FE | FE | BE | BE | 30m | T2.3, T2.1 | sync pt 3 |
| T3.1 Three integration tests | BE | BE | FE (re business rules) | FE | 45m | T2.1 | T-FINAL |
| T3.2 FE wiring polish | FE | FE | — | BE | 20m | T2.4 | T-FINAL |
| **T4-FE** Playwright smoke (idle banked) | FE | FE | BE | BE | 30m | T2.4 | T-FINAL |
| T3.3 Seed script | BE | BE | — | FE | 15m | T1.4 | T-FINAL |
| T-FINAL README + submission | Both (FE = editor-in-chief) | Both | — | — | 30m | All | Submission |

**Convention**: PRs reviewed by *opposite* stream when "C" or "I" lists them.

---

## 6. API Contract (single source of truth)

> **Critical**: Both streams agree on this before T1.3 starts. Any change requires a §6 update + ping in PR description + (per D21 / §9 DoD item 7) fixture regeneration.

### Auth
**`POST /auth/register`**
```http
Request:  { "email": "user@example.com", "password": "min12chars", "name": "Demo User" }
Response 201: { "user": { "id": "uuid", "email": "...", "name": "..." }, "token": "<jwt>" }
Response 409: { "error": { "code": "EMAIL_EXISTS", "message": "Email already registered" } }
Response 400: { "error": { "code": "VALIDATION", "message": "...", "details": { "field": "..." } } }
```

**`POST /auth/login`**
```http
Request:  { "email": "...", "password": "..." }
Response 200: { "user": {...}, "token": "<jwt>" }
Response 401: { "error": { "code": "INVALID_CREDENTIALS", "message": "..." } }
```

### Campaigns (all require `Authorization: Bearer <jwt>`)

**`GET /campaigns?page=1&limit=20`**
```http
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Q4 Newsletter",
      "subject": "Big news for you",
      "status": "draft",          // draft | scheduled | sending | sent | failed
      "recipients_count": 50,
      "send_rate": 0.0,            // 0..1
      "created_at": "2026-04-26T10:00:00Z"
    }
  ],
  "page": 1, "limit": 20, "total": 5
}
Response 401: { "error": { "code": "UNAUTHORIZED", ... } }
```

**`POST /campaigns`** — *Note: does NOT accept `scheduled_at`. Always returns `status: draft`. To schedule, use `POST /campaigns/:id/schedule` separately.*
```http
Request: { "name": "...", "subject": "...", "body": "...", "recipient_emails": ["a@x.com", ...] }
Response 201: { "id": "uuid", ..., "status": "draft", "scheduled_at": null, "recipients_count": 2 }
Response 400: { "error": { "code": "VALIDATION", "message": "scheduled_at not allowed on create; use /schedule endpoint" } }
```

**`GET /campaigns/:id`** — *Note: returns 404 (not 403) if campaign exists but belongs to a different user, to prevent enumeration. `recipients` array is unpaginated and capped at the seed maximum (~50 per AC-R3); for >50 recipients in a future scope, add cursor pagination.*
```http
Response 200:
{
  "id": "uuid", "name": "...", "subject": "...", "body": "...",
  "status": "sent",
  "scheduled_at": null,
  "created_at": "...", "updated_at": "...",
  "stats": {
    "total": 50, "sent": 47, "failed": 3, "opened": 18,
    "send_rate": 0.94,    // sent / total
    "open_rate": 0.383    // opened / sent (D11)
  },
  "recipients": [          // full array, max ~50 at this scope
    { "id": "uuid", "email": "...", "name": "...", "status": "sent", "sent_at": "...", "opened_at": null }
  ]
}
Response 404: { "error": { "code": "NOT_FOUND", "message": "Campaign not found" } }   // also returned for cross-user access (anti-enumeration)
```

**`PATCH /campaigns/:id`** (only when status=draft)
```http
Request:  { "name"?: "...", "subject"?: "...", "body"?: "..." }
Response 200: <updated campaign object>
Response 409: { "error": { "code": "INVALID_STATUS", "message": "Can only edit draft campaigns" } }
```

**`DELETE /campaigns/:id`** (only when status=draft)
```http
Response 204: <empty>
Response 409: { "error": { "code": "INVALID_STATUS", ... } }
```

**`POST /campaigns/:id/schedule`**
```http
Request:  { "scheduled_at": "2026-04-27T10:00:00Z" }
Response 200: <updated campaign with status=scheduled>
Response 400: { "error": { "code": "VALIDATION", "message": "scheduled_at must be in the future" } }
Response 409: { "error": { "code": "INVALID_STATUS", ... } }
```

**`POST /campaigns/:id/send`** (async)
```http
Response 202: { "id": "uuid", "status": "sending" }
Response 409: { "error": { "code": "INVALID_STATUS", "message": "Already sending or completed" } }
```
After 2–4s background work, status transitions to `sent` (≥1 recipient sent) or `failed` (0 sent). FE polls `GET /campaigns/:id` every 3s while status=`sending`. *No BE rate-limit guard at this scope (single user, polling self-throttles).*

### Recipients
**`GET /recipients?page=1&limit=20`** — `{ data, page, limit, total }`
**`POST /recipients`** — `{ email, name }` → 201 or 409 EMAIL_EXISTS

### Error envelope (universal)
```json
{ "error": { "code": "MACHINE_READABLE_CODE", "message": "Human-readable", "details": { /* optional */ } } }
```

---

## 7. Mock-first FE Strategy (MSW) — adapter-boundary validation

MSW gets *progressively retired* as BE endpoints land:
- T1.0–T1.5: full MSW for login + list (FE develops without BE)
- **Sync pt 2 (after T1.4 merges, ~2h mark)**: list endpoint switches to real BE; T1.6 adapter test runs against real BE fixture, validates `transformResponse` mapping
- T2.3 develops with MSW for `POST /campaigns/:id/send` (BE T2.1 not done yet)
- **Sync pt 3 (after T2.1 merges)**: full integration; MSW retired entirely; remaining FE work runs against real BE

```ts
// packages/web/src/mocks/handlers.ts
import { rest } from 'msw';

const mockCampaigns = [
  { id: 'c1', name: 'Q4 Newsletter', subject: 'Big news', status: 'draft',
    recipients_count: 50, send_rate: 0, created_at: '2026-04-26T10:00:00Z' },
  // ... 4 more covering all 5 statuses
];

export const handlers = [
  rest.post('/auth/login', (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ user: { id: 'u1', email: 'demo@example.com', name: 'Demo' }, token: 'mock-jwt' }))),

  rest.get('/campaigns', (req, res, ctx) =>
    res(ctx.json({ data: mockCampaigns, page: 1, limit: 20, total: mockCampaigns.length }))),

  rest.get('/campaigns/:id', (req, res, ctx) => {
    const c = mockCampaigns.find(x => x.id === req.params.id);
    if (!c) return res(ctx.status(404), ctx.json({ error: { code: 'NOT_FOUND', message: '...' } }));
    return res(ctx.json({ ...c, body: 'Mock body...', stats: { total: 50, sent: 47, failed: 3, opened: 18, send_rate: 0.94, open_rate: 0.383 }, recipients: [] }));
  }),

  rest.post('/campaigns/:id/send', (req, res, ctx) =>
    res(ctx.status(202), ctx.json({ id: req.params.id, status: 'sending' }))),
];

// browser.ts
import { setupWorker } from 'msw';
import { handlers } from './handlers';
export const worker = setupWorker(...handlers);

// main.tsx
if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === '1') {
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'warn' });
}
```

**Endpoint-level switching** post-sync-pt-2:
```bash
# .env.development.local
VITE_USE_MSW_LIST=0      # real BE for list
VITE_USE_MSW_SEND=1      # MSW for send until T2.1 merges
```

---

## 8. Branch & PR Strategy

### Branches
- `main`: protected, only squash-merged via PR. Always demoable.
- Feature branches: `feature/T<tier>.<num>-<short-slug>`
  - Examples: `feature/T1.3-api-auth`, `feature/T1.5-fe-login-list`, `feature/T1.6-adapter-test`

### PR title format
`<type>(<scope>): T<tier>.<num> — <imperative description>`

### Review rules
- 1 approval required from cross-stream reviewer (BE PR → FE reviews; FE PR → BE reviews)
- "Same-day SLA" — review turnaround should be ≤ 1h within session window
- Manual squash-merge after approval (no CI in this scope)

(See Appendix C for full PR template.)

---

## 9. Definition of Done (per ticket)

A ticket is **DONE** only when ALL of:

1. ✅ All acceptance criteria from §3 are checked (PR description shows ticked boxes)
2. ✅ Tests added if ticket is BE business logic (T1.4, T2.1 minimum) or contract-binding (T1.6 adapter test)
3. ✅ Cross-stream review approved (1 approval from opposite stream)
4. ✅ PR squash-merged to `main` with conventional commit message + tier prefix
5. ✅ `docker compose up` from clean state still works after merge
6. ✅ For UI tickets: Storybook stories still pass (no regression to UI lib)
7. ✅ **(rev3 NEW — fixture-regen gate)**: If PR modifies any §6 response shape, regenerate `packages/web/src/mocks/__fixtures__/real-be-snapshot.json` (per T1.6 fixture-capture workflow in §13) and re-run `yarn workspace @campaign-manager/web test:contract` in same PR.

**Not DONE**: "PR open but unmerged", "tests passing locally but not committed", "works in dev but breaks docker", "response shape changed but fixture stale".

---

## 10. Communication & Sync Cadence

| Sync | Trigger | Duration | Output |
|------|---------|----------|--------|
| **1. Kickoff** | Session start | 5m | Branches created, §6 reviewed, T1.1 owner picked |
| **2. MSW→Real (list)** | BE merges T1.4 (~2h mark, BE-paced) | 5m | FE swaps list to real BE; **T1.6 adapter test runs**; principle #3 reconciliation point |
| **3. Full integration** | BE merges T2.1 + FE merges T2.4 | 10m | All endpoints real; FE polls real BE; verify `failed` transition |
| **4. Final** | T3.x done | 10m | Full smoke (all 4 pages), README review, push tag |

### Asynchronous communication
- **PR description**: primary durable artifact
- **Commit messages**: tier-prefixed (`T1.3: ...`)
- **Blockers**: GitHub Issue with `blocker` label + ping cross-stream owner; SLA: 30min response
- **Decision changes**: any change to §2 or §6 requires *separate* PR updating `docs/work-plan.md` first

### Status visibility
- Progress = PR list (`gh pr list --state all`)
- Blockers = open issues with `blocker` label
- No standups, no Slack channel needed at this scope.

---

## 11. Onboarding (≤ 30 sec to productive)

```bash
# 1. Clone + install
git clone <repo> && cd <repo> && yarn install

# 2. Storybook (familiarize with UI lib)
yarn workspace @campaign-manager/ui storybook   # → :6006

# 3. Read in this order:
#    README.md → CLAUDE.md → docs/work-plan.md (§3 role, §5 tickets, §6 contract, §8 PR, §9 DoD)
#    BE deep-dive: Appendix A (DDL), §14 Tests
#    FE deep-dive: packages/ui/README.md, §7 MSW

# 4. Bring up local stack
docker compose up

# 5. Pick first ticket from §5, branch:
git checkout -b feature/T1.0-ui-smoke
```

---

## 12. Risk Register (with owners)

| Risk | Severity | Owner | Mitigation |
|------|----------|-------|------------|
| Async send race condition (double-send) | **High** | BE | UPDATE WHERE status guard + check rowcount; T3.1 test 2 covers |
| Sequelize learning curve cho stats | Medium | BE | `sequelize.query(rawSql)` thay associations |
| Time blowout trên FE polish | **High** | FE | Tier ordering nghiêm ngặt — không vào T3.2 trước T1+T2 ship |
| Monorepo TypeScript path setup | Medium | T1.1 owner | Workspace protocol; không tsconfig project refs |
| Postgres COUNT bigint as string | Medium | BE | Cast `CAST(COUNT(*) AS INTEGER)`; T3.1 test 3 covers |
| README "How I Used Claude Code" fabrication | **High** | both | Track real prompts + corrections; không ngụy tạo |
| BE↔UI shape mismatch breaks FE table | **High** | BE+FE | §6 = single source of truth; transformResponse adapts in 1 place; MSW handlers mirror §6 |
| **MSW handlers drift from real API** | **High** | FE | **Concrete artifact**: FE writes `packages/web/src/mocks/contract-conformance.test.ts` (T1.6) that asserts MSW responses pass the same `transformResponse` adapter as real BE responses (using captured fixture from live `curl` after T1.4). Drift fails the suite, blocks T-FINAL. Run `yarn workspace @campaign-manager/web test:contract`. |
| Cross-stream PR review delays | **Medium** | both | "1h SLA" within session; emergency: same-stream self-review with note in PR. Track via `gh pr list --search "is:open updated:<1h"`. |
| Merge conflicts on root configs | **Medium** | T1.1 owner | T1.1 done first; minimize root-level changes after; conflict resolution = later PR rebases |
| API contract §6 evolves mid-stream | **High** | both | Any §6 change requires *separate* PR updating `docs/work-plan.md` before any code PR; D21/§9-DoD item 7 enforces fixture regen |
| FE finishes T2.4 before BE T2.1 → blocked | Low | FE | FE banks idle into T1.6 adapter test + T4 Playwright smoke |
| BE async send fake state under MSW | Medium | FE | Resolved by sync pt 2 promotion: T2.4 polling runs against *real* BE |
| **Principle #3 vs Hard Rule #1 tension** | Medium | both | Reconciled by D20: FE blocks on BE only at adapter boundary. T1.6 adapter test forces validation against real BE at ~2h mark. |
| Fixture snapshot ages | Medium | both | §9 DoD item 7 + §15 row 8 — any §6 response-shape change triggers fixture regen + test rerun in same PR |

---

## 13. Tier-based Task Breakdown

### T1 — MUST SHIP (~2.0h critical path on BE)

| Ticket | Owner | Time | Acceptance criteria |
|--------|-------|------|---------------------|
| **T1.1** Repo bootstrap | Either (one) | 15m | Root `package.json` workspaces, `tsconfig.base.json`, `.editorconfig`, `.env.example`. NO `packages/shared`. |
| **T1.0** UI lib smoke + MSW scaffold | FE | 15m | `cd packages/ui && yarn typecheck` passes; `packages/web/src/mocks/{handlers,browser}.ts` skeleton committed |
| **T1.2** DB + Docker + migrations | BE | 25m | `docker compose up` cold-start spins postgres + api; migrations auto-apply; AC-B1 |
| **T1.3** API skeleton + Auth | BE | 40m | AC-B2, AC-B3, AC-B4 — register/login/JWT middleware; PR description includes §6 contract conformance checkboxes |
| **T1.4** Campaign CRUD | BE | 45m | AC-B5, AC-B6, AC-B7, AC-B11 (partial), AC-B13 — POST/GET/PATCH/DELETE per §6; **triggers sync pt 2 on merge** |
| **T1.5** FE login + list (vs MSW) | FE | 30m | AC-F1, AC-F2, AC-F3 — `<TopBar>` + `<CampaignTable>` with RTK Query polling MSW endpoints |
| **T1.6** transformResponse adapter conformance test | FE | 20m | `mocks/contract-conformance.test.ts` runs both MSW + real-BE captured fixture through the same adapter; assertion: same output Campaign objects. **Fixture-capture workflow**: BE owner runs `curl -H 'Authorization: Bearer <seed-jwt>' http://localhost:4000/campaigns \| jq > packages/web/src/mocks/__fixtures__/real-be-snapshot.json` against T3.3 seed data, immediately after T1.4 merges. Repeat for `/campaigns/:id` (single campaign fixture). Regenerate whenever §6 response shape changes (per §9 DoD item 7). Run `yarn workspace @campaign-manager/web test:contract` before sync pt 3. |

### T2 — HIGH-VALUE (~1.6h critical path on BE)

| Ticket | Owner | Time | Acceptance criteria |
|--------|-------|------|---------------------|
| **T2.1** Schedule + Send async | BE | 45m | AC-B8, AC-B9, AC-B10 — atomic transitions, idempotent guard, 90/10 random per recipient; **triggers sync pt 3 on merge** |
| **T2.2** Recipients endpoints | BE | 15m | `GET /recipients`, `POST /recipients` per §6 |
| **T2.3** FE Campaign New page (vs MSW for send only) | FE | 20m | AC-F5 — `<Input>`, `<Textarea>`, `<RecipientTagInput>` from lib; client-side validation; submit → redirect |
| **T2.4** FE Detail page (poll vs real BE post-T2.1) | FE | 30m | AC-F4, AC-F6, AC-F7 — `<StatCard>` × 4, `<ProgressBar>` × 2, `<Accordion>`, `<StatusBadge>` for 5 statuses, conditional `<ActionButton>` cluster, real-BE polling |

### T3 — POLISH & TESTS (~1.3h)

| Ticket | Owner | Time | Acceptance criteria |
|--------|-------|------|---------------------|
| **T3.1** Three integration tests | BE | 45m | AC-B14 — see §14 |
| **T3.2** FE wiring polish | FE | 20m | `<EmptyState>` for empty list; skeleton loaders; sonner toasts; React error boundary; Avatar logout dropdown |
| **T3.3** Seed script | BE | 15m | AC-R3 — `demo@example.com` + 5 campaigns covering 5 statuses + ~20 recipients |

### T4 — NICE-TO-HAVE

| Ticket | Owner | Time |
|--------|-------|------|
| **T4-FE Playwright smoke** (banked into FE idle window) | FE | 30m |
| Pagination/infinite scroll on `/campaigns` | FE | 20m |
| Charts (recharts) replacing progress bar | FE | 30m |
| `POST /campaigns/:id/recipients/:rid/open` (tracking pixel) | BE | 20m |
| Dark mode toggle (lib already supports) | FE | 15m |
| Storybook deploy to Vercel/GH Pages | Either | 20m |

### T-FINAL — README & Submission (BOTH, 30m)
- BE writes API/DB/tests sections
- FE writes UI/UX sections + acts as "README editor-in-chief" for coherence
- Both write "How I Used Claude Code" honestly
- Push to public GitHub
- Walkthrough summary

---

## 14. Three Most Valuable Tests (BE owner)

### Test 1 — Campaign Edit/Delete restrictions
**File**: `packages/api/tests/campaign-edit-rules.test.ts` (1 fixture, 4 assertions: PATCH draft → 200; PATCH scheduled → 409; DELETE draft → 204; DELETE sent → 409)

### Test 2 — Send state machine + idempotency
**File**: `packages/api/tests/send-state-machine.test.ts` (Send draft → 202 sending; double-send → 409; wait → sent or failed; send sent → 409)

### Test 3 — Stats aggregation correctness
**File**: `packages/api/tests/stats-aggregation.test.ts` (0 recipients → no NaN; 10 recipients with mixed status → correct rates; numeric types not strings)

Plus **T1.6 contract-conformance test** (FE) per §13.

---

## 15. Verification & Sign-off (team)

| # | Step | Owner | Action |
|---|------|-------|--------|
| 1 | Cold start | both | `docker compose down -v && docker compose up` works |
| 2 | UI lib health | FE | `yarn workspace @campaign-manager/ui typecheck && yarn workspace @campaign-manager/ui build-storybook` clean |
| 3 | Manual E2E | both | Register → create campaign → schedule → send → poll → verify stats; try editing `sent` → 409 |
| 4 | BE tests | BE | `yarn workspace @campaign-manager/api test` — 3 integration tests pass |
| 5 | FE build | FE | `yarn workspace @campaign-manager/web build` — production build clean |
| 6 | README review | both | Setup correct, "How I Used Claude Code" honest, links work |
| 7 | Repo cleanliness | both | Public, no secrets in `.env`, no `.env` committed |
| 8 | **MSW conformance** | FE | `yarn workspace @campaign-manager/web test:contract` — `mocks/contract-conformance.test.ts` passes; MSW responses match real BE shape after passing through `transformResponse` |
| 9 | **Adapter test against real BE** | FE | T1.6 test re-runs against captured real-BE fixture (`mocks/__fixtures__/real-be-snapshot.json`); passes |
| 10 | **Cross-stream PR audit** | both | `gh pr list --state merged --json number,reviews` shows all 14+ tickets had ≥1 cross-stream approval; no self-merges (or self-merges flagged with reason) |

---

## 16. Time Budget — Team Allocation

| Stream | Tickets | Person-hours |
|--------|---------|--------------|
| BE | T1.2, T1.3, T1.4, T2.1, T2.2, T3.1, T3.3 | 4.0h |
| FE | T1.0, T1.5, T1.6, T2.3, T2.4 (30m), T3.2, T4 Playwright | 2.6h |
| Shared | T1.1, T-FINAL, sync points | 0.75h |
| **Total person-hours** | | **7.35h** |
| **Wall-clock realistic** | BE coding + sync overhead ≈ | **~4.5h** |

**Why 4.5h not 4.0h** (rev3 derivation):
- **BE critical path drives sync pt 2 timing**: T1.1 + T1.2 + T1.3 + T1.4 = 125m (~2h) before sync pt 2 fires. Sync pt 2 is BE-paced, *not a fixed clock* — if BE finishes T1.4 faster, sync pt 2 fires sooner.
- 4 sync points × ~7.5m = 30m of *blocking* time during which both streams pause
- Realistic wall-clock: BE 4.0h coding + 30m sync overhead = ~4.5h. FE work + idle banking (T1.6 + Playwright) fits inside this window with margin.

**Hard deadline gates** (wall-clock):
- 2h mark → T1 done; sync pt 2 fires; T1.6 adapter test running. If BE behind, FE pivots to T3.2 polish scaffolding with placeholder data.
- 3h mark → T2 done; sync pt 3 fires; if MSW-vs-real mismatch surfaces, allocate buffer.
- 4h mark → T3 done; freeze scope; T4 Playwright complete or forfeit.
- 4.5h mark → README + push only.

---

## Appendix A — Schema (PostgreSQL DDL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns: 5 statuses (parity với @campaign-manager/ui CampaignStatus type)
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, subject TEXT NOT NULL, body TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_user_status ON campaigns(created_by, status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';

-- Recipients
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL, name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CampaignRecipient
CREATE TYPE cr_status AS ENUM ('pending', 'sent', 'failed');
CREATE TABLE campaign_recipients (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE RESTRICT,
  status cr_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ, opened_at TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, recipient_id)
);
CREATE INDEX idx_cr_campaign_status ON campaign_recipients(campaign_id, status);
```

---

## Appendix B — README "How I Used Claude Code" Template

```markdown
## How I Used Claude Code

### What I delegated
- Designing & building `@campaign-manager/ui` library (14 components) via `docs/ui-design-prompt.md` → mockup → Storybook implementation
- Boilerplate (Sequelize models, Express middleware, RTK Query setup)
- Planning (tier-based plan + team-mode pivot via /ralplan)
- Async send simulator + transformResponse adapter

### Real prompts used
1. (Planning) "/ralplan review docs/work-plan.md, make it detailed enough to work with a team"
2. (UI design) Full prompt at `docs/ui-design-prompt.md`
3. (Implementation) "Implement async send simulator: mark sending, setImmediate iterate recipients with 90/10 sent/failed random. Campaign goes 'sent' if any succeed else 'failed'. Use one transaction per recipient."

### Where Claude Code was wrong / needed correction
- First send-simulator draft used `setTimeout(0)` inside loop → N concurrent transactions. Fixed by `for…of` + `await`.
- Initial UI mockup too airy → "reduce density, target Linear-style row heights" iteration.
- Stats SQL returned `COUNT(*)` as JS string → cast `CAST(COUNT(*) AS INTEGER)` + unit test guards.
- AI suggested JWT in `localStorage` → overrode for memory-only Redux storage.

### What I did NOT let Claude Code do
- Final business-rule verification
- Test case selection
- README authorship
- Production secrets/config
- Final monorepo shape (AI suggested `packages/shared`; dropped after seeing UI lib types)
```

---

## Appendix C — PR Template (`.github/pull_request_template.md`)

```markdown
## Tier
T<n>.<m>

## Acceptance criteria addressed
- [x] AC-B<n>: ...

## API contract changes (§6)
- None

## How to verify
\`\`\`bash
# specific commands
\`\`\`

## Demo
<screenshot or curl output>

## Cross-stream notes
<anything the opposite stream should know>
```

---

## Appendix D — Worktree quick-reference (AI-agent execution)

```bash
git worktree add ../mcm-be feature/be-stream    # Agent A (BE)
git worktree add ../mcm-fe feature/fe-stream    # Agent B (FE)
# Coordinator merges PRs, runs integration smoke
```

---

## ADR — Why this team-plan structure (RALPLAN-DR consensus)

### Decision
**Adopt 2-stream pair-stream (BE + FE) with mock-first FE *with adapter-boundary validation*, trunk-based + short-lived branches, cross-stream PR review, and 4 event-driven sync points.**

### Drivers
1. **Time-box (4–8h wall-clock)**
2. **AI-collaboration showcase** — recruiter evaluates judgment; PR descriptions + commits + README are durable signal
3. **Parallelization vs coordination overhead** — sweet spot is 2 streams

### Principles
1. **Ship-early shape**: at any cut-off, `main` is demoable
2. **Single source of truth**: §6 API contract; UI lib types; one BE↔FE adapter
3. **Mock-first parallelism with adapter-boundary validation** (rev2/3): FE blocks on BE *only at adapter boundary*; T1.6 adapter test runs against real BE at ~2h mark (sync pt 2). MSW remains for genuinely async work (T2.1 send/poll) until BE catches up.
4. **Atomic ownership**: one person owns one ticket end-to-end
5. **Defensible signal over volume**: clean commits + thoughtful PRs + honest README beats ticket count

### Alternatives considered
- **Tri-stream (BE + FE + DevOps/QA)**: Rejected — adds review queue without proportional throughput at 4–8h. Suitable for week-long projects.
- **Pipeline (sequential by tier)**: Rejected — wastes capacity in T3 (only BE work).
- **GitHub Issues per ticket**: Rejected — overhead exceeds value at this scope.
- **Solo execution with 4-tier**: *Steelmanned* (Architect rev1): "Solo beats 2-stream when FE coding time (1.7h) < FE coordination tax." Counter: with adapter test promoted to T1.6 + sync pt 2 at ~2h mark, FE coordination is bounded to 4 sync points × 7.5m = 30m, NOT continuous overhead. FE banks idle into adapter test + Playwright (genuine signal value). Solo remains valid degraded mode.
- **Full upfront §6 contract**: *Steelmanned* (Architect rev1): "§6 will drift; pay contract tax 3 times." Counter: §6 is *thin* by design — 8 endpoints with concrete shapes, not full OpenAPI. Drift detected automatically by T1.6 adapter test. Drift cost amortized.
- **T1.6 fixture-vs-static-snapshot ages** (Architect rev2 steelman): "Fixture freezes after capture, decorative thereafter." Counter: §9 DoD item 7 + §15 row 8 force fixture regen on any §6 response-shape PR. Snapshot stays current.

### Why chosen
- ~1.8x speedup on wall-clock (4.5h vs 7.4h solo) with minimum coordination
- Cross-stream PR review = quality gate AND knowledge transfer
- §6 API contract upfront forces clarity (forcing function for good design)
- Plan degrades gracefully to solo (drop §5, run tier-by-tier)

### Principle #3 reconciliation
Original principle #3 ("FE never blocks on BE") contradicted hard rule #1 from `CLAUDE.md` ("single transformResponse adapter point"). If FE never blocks on BE, the adapter is built against MSW (a fiction the FE itself authored), unvalidated until full integration at sync pt 3 — too late to find drift cheaply.

**Resolution**: rephrase principle #3 to allow blocking *only at the adapter boundary*. Concretely:
- T1.6 adapter conformance test owned by FE, runs at sync pt 2 (~2h mark, BE-paced)
- Test asserts: MSW response → adapter → Campaign object equals real-BE response → adapter → Campaign object
- Drift detected at ~2h mark, with ~2.5h of buffer to fix
- Snapshot freshness enforced by §9 DoD item 7 (fixture regen on response-shape PRs)

This preserves mock-first parallelism for the *expensive* parts (full UI build, send simulator) while validating the *fragile seam* (snake↔camel boundary, Postgres bigint, null/missing fields) against real BE early.

### Consequences
- BE has more coding hours than FE (4.0 vs 2.6); FE absorbs adapter test + Playwright into idle window — net signal to reviewer is stronger (FE delivers 2 tests not 0)
- Shared tickets (T1.1, T-FINAL) require sync point coordination — handled by event-driven sync (not blocking standup)
- MSW adds 1 dev dependency (~50KB) and ~10min setup — paid back many times over by FE not blocking on BE
- Cross-stream review means each engineer sees the other's domain — initial overhead, high learning ROI
- Wall-clock 4.5h = BE critical path 4.0h + 30m sync overhead — budget honestly stated, not hidden

### Follow-ups (post-MVP, not in scope)
- Add CI (GitHub Actions) running `yarn test && yarn build` on PRs
- Add Codecov for coverage tracking
- Migrate to auto-merge on green CI + 1 approval
- If revisited as longer project: tri-stream once T1+T2 stabilize; add OpenAPI spec generated from BE types via `openapi-typescript`

---

## Final Checklist (trước khi tag complete)

- [ ] T1 + T2 đầy đủ + 3 integration tests pass + T1.6 contract test pass
- [ ] `docker compose up` cold start works
- [ ] **UI lib parity**: 5 statuses render đúng, `<CampaignTable>` consume BE shape qua adapter, `<RecipientTagInput>` work end-to-end
- [ ] Storybook chạy được tại `:6006` (link trong README)
- [ ] README có "How I Used Claude Code" honest section + link sang `docs/ui-design-prompt.md`
- [ ] All 14+ PRs squash-merged with cross-stream approval visible in `git log`
- [ ] Repo public on GitHub, no secrets
- [ ] Walkthrough summary chuẩn bị

---

## Applied Improvements Log (consensus iteration 2)

Per ralplan step 6d — record of improvements merged from Architect iter2 + Critic iter2 APPROVE:

| # | Source | Improvement | Applied to |
|---|--------|-------------|------------|
| 1 | Architect iter2 + Critic iter2 #1 | Reconcile "minute 90" vs "2h mark" — canonical phrase "~2h mark (sync pt 2)" everywhere | D20, §10 sync pt 2, §12 MSW-drift, principle #3, ADR reconciliation |
| 2 | Architect iter2 + Critic iter2 #2 | Specify fixture-capture workflow (curl command + path + regen trigger) | §13 T1.6 AC |
| 3 | Architect iter2 + Critic iter2 #3 | Loosen T2.3 dependency: "T1.5 + sync pt 2" (drop T1.6 hard gate; T1.6 doesn't logically gate T2.3) | §5 RACI row T2.3 |
| 4 | Architect iter2 synthesis + Critic iter2 #4 | Add §9 DoD item 7: fixture-regen gate on response-shape PRs | §9 |
| 5 | Architect iter2 steelman #2 + Critic iter2 #5 | Rewrite §16 "Why 4.5h" derivation: BE critical path drives sync pt 2 timing (not fixed 90m clock) | §16 |

---

*Plan saved to `docs/work-plan.md`*
*Status: FINAL — Consensus approved at iteration 2 of max 5 (ralplan).*
*Last updated: 2026-04-26.*
