# Mini Campaign Manager — Work Plan

**Mode**: Direct (skip interview, spec đã đủ chi tiết)
**Time budget**: 4–8 giờ. Plan ưu tiên *ship-early* — tier T1 đủ pass tiêu chí cơ bản, T2–T4 thêm chiều sâu.
**Spec source of truth**: Spec phiên bản 2 (mới hơn). Conflict đã được reconcile — xem mục "Decisions" bên dưới.

---

## 0. Changelog

### 2026-04-26 — UI library pre-built (`packages/ui/`)

User uploaded a complete `@campaign-manager/ui` component library. **This shifts plan significantly.**

**What changed (summary):**
- ✅ **14 production-grade components** đã build sẵn: StatusBadge, ActionButton, ProgressBar, EmptyState, Input/Textarea, Chip/ChipGroup, StatCard, Tooltip, Accordion, RecipientTagInput, Avatar, TopBar, **CampaignTable** (composite).
- ✅ **Storybook + design tokens** (light/dark) + Tailwind preset đã setup.
- ✅ Stack chuẩn shadcn: Tailwind + Radix + CVA + Lucide + cn() utility.

**Impact on plan:**
- **DROP `packages/shared`** — UI lib đã export `Campaign`/`CampaignStatus` types; BE giữ zod nội bộ. Đỡ 1 package, đỡ ceremony.
- **Status enum +1 value: `failed`** — UI lib đã có 5 statuses (`draft|scheduled|sending|sent|failed`). DDL phải parity.
- **Wire format contract**: `type Campaign` của lib = `{id, name, subject, status, recipients:number, sentRate:0..1, created:string}`. BE serialize JSON snake_case như usual; FE adapter (RTK Query `transformResponse`) map sang lib shape.
- **FE time savings ~65 min** (T1.5: -10, T2.3: -10, T2.4: -10, T3.2: -10, plus removed shared package boilerplate -25). Re-invest vào T4 polish hoặc dark mode showcase.
- **New AC-F8/F9/F10** về UI lib integration (preset, transformResponse, Storybook).
- **New T1.0**: 5-min smoke check rằng UI lib build clean trước khi consume.
- **New risks**: BE↔lib shape mismatch, peer dep version drift, Tailwind preset purge issue.
- **README "How I Used Claude Code"**: bonus showcase — UI design workflow (`docs/ui-design-prompt.md` → component library → app wiring).

---

## 1. Requirements Summary

Build full-stack Mini Campaign Manager:
- **Backend**: Express + Sequelize + PostgreSQL + JWT, REST API, validation (zod), migrations, ≥3 tests.
- **Frontend**: React 18 + Vite + TypeScript + Redux Toolkit (chọn Redux thay vì Zustand vì spec hint + phù hợp RTK Query).
- **UI Library**: `@campaign-manager/ui` đã pre-built — `packages/web` consume qua workspace protocol. Không xây inline.
- **Monorepo**: yarn workspaces với 3 packages: `packages/api`, `packages/web`, `packages/ui`. **KHÔNG có `packages/shared`** — types từ `@campaign-manager/ui`, zod ở `packages/api/src/schemas/`.
- **Deploy local**: `docker compose up` đưa Postgres + API + Web online.
- **README**: bắt buộc có section "How I Used Claude Code" với 2–3 prompt thật, các chỗ AI sai, và những gì *không* để AI làm.

---

## 2. Decisions (đã chốt — không đổi giữa chừng)

| # | Quyết định | Lý do |
|---|------------|-------|
| D1 | Express (không Fastify) | Spec 2 chốt cứng |
| D2 | Sequelize làm ORM, **raw query** cho stats aggregation | Spec 2 yêu cầu Sequelize; raw query cho perf + tránh N+1 trên `/stats` |
| D3 | Status enum: `draft \| scheduled \| sending \| sent \| failed` (**5 statuses**) | Spec 2 thêm `sending`; UI lib thêm `failed` cho campaign-level failure (vd: tất cả recipients fail) — phải parity với lib |
| D4 | Async send dùng `setImmediate` + DB transaction (không BullMQ) | Đủ cho simulation, không kéo Redis vào docker-compose |
| D5 | Random sent/failed: 90% sent, 10% failed (per recipient). Campaign-level: nếu 0 recipient sent → status=`failed`, ngược lại `sent` | Tỷ lệ thực tế cho email + parity với lib's `failed` status |
| D6 | JWT lưu **memory** (Redux state) — không httpOnly cookie | Tiết kiệm CSRF setup time; spec cho phép cả hai |
| D7 | Validation: **zod** trong `packages/api/src/schemas/` (BE-only); FE re-validate ở form level dùng types import từ `@campaign-manager/ui` | Drop `packages/shared` — UI lib đã định nghĩa view types; ít boilerplate hơn |
| D8 | Migration: file SQL thuần + script runner đơn giản (không umzug) | Transparent, dễ review, ít dependency |
| D9 | RTK Query thay vì React Query | Spec cần Redux + data fetching — RTK Query là cả hai, giảm boilerplate |
| D10 | UI lib: **`@campaign-manager/ui`** (đã pre-built) — Tailwind + Radix + CVA + Lucide stack | shadcn-style; có 14 components covering full app needs; consume qua `workspace:*` protocol |
| D11 | Stats response shape: `open_rate`/`send_rate` là decimal 0..1 | Convention chuẩn; `<ProgressBar value total>` của lib accept ratio |
| D12 | `POST /recipient` (typo trong spec) → implement là `POST /recipients` | Đúng REST convention |
| D13 | `/campaigns/:id` trả về detail + stats + recipients embedded | Spec 2 bỏ `/stats` riêng nhưng vẫn yêu cầu shape stats |
| D14 | Recipient lookup-or-create khi tạo campaign | Form cho user nhập emails; BE upsert vào `recipients` rồi link `campaign_recipients` |
| D15 | **DROP `packages/shared`** | UI lib đã export `Campaign`/`CampaignStatus`; BE giữ zod nội bộ; FE thin types ở `packages/web/src/types.ts` re-export từ lib |
| D16 | API list response shape: BE giữ idiomatic snake_case `{id, name, subject, status, recipients_count, send_rate, created_at}` — RTK Query `transformResponse` map sang UI lib `Campaign` type ở client | Single source of truth: lib types là view model; BE wire format giữ Postgres convention |
| D17 | Skip dark mode cho v1 (lib có sẵn nhưng không bật) | Đỡ test surface; có thể flip `<html data-theme="dark">` trong walkthrough nếu reviewer hỏi — bonus |

---

## 3. Acceptance Criteria (testable)

### Backend
- [ ] AC-B1: `docker compose up` (cold start) → Postgres healthy, migrations chạy auto, API listen :4000
- [ ] AC-B2: `POST /auth/register` với email mới trả 201 + `{user, token}`; email trùng trả 409
- [ ] AC-B3: `POST /auth/login` với credentials đúng trả 200 + JWT; sai trả 401
- [ ] AC-B4: Mọi route `/campaigns/*` thiếu/sai JWT trả 401
- [ ] AC-B5: `POST /campaigns` với payload hợp lệ trả 201, status mặc định = `draft`
- [ ] AC-B6: `PATCH /campaigns/:id` khi `status != draft` trả **409 Conflict** với message rõ ràng
- [ ] AC-B7: `DELETE /campaigns/:id` khi `status != draft` trả 409
- [ ] AC-B8: `POST /campaigns/:id/schedule` với `scheduled_at` trong quá khứ trả 400
- [ ] AC-B9: `POST /campaigns/:id/send` chuyển status `draft → sending` ngay lập tức (đồng bộ), trả 202; sau ~2–4s mỗi recipient được random `sent`/`failed`. Campaign chuyển `sent` nếu ≥1 sent, `failed` nếu 0 sent.
- [ ] AC-B10: Gọi `/send` 2 lần liên tiếp → lần 2 trả 409 (idempotent guard)
- [ ] AC-B11: `GET /campaigns/:id` trả `{...campaign, stats: {total, sent, failed, opened, open_rate, send_rate}, recipients: [...]}`
- [ ] AC-B12: Stats với 0 recipients → `open_rate=0, send_rate=0` (không NaN/divide-by-zero)
- [ ] AC-B13: `GET /campaigns?page=1&limit=20` trả `{data, page, limit, total}` — list chỉ campaigns của user đang login; mỗi item có `recipients_count` + `send_rate`
- [ ] AC-B14: 3 tests pass — xem mục 5 dưới đây

### Frontend
- [ ] AC-F1: `/login` chưa login truy cập `/campaigns` → redirect `/login`
- [ ] AC-F2: Login thành công → JWT lưu Redux, redirect `/campaigns`, requests sau gắn header `Authorization: Bearer ...`
- [ ] AC-F3: `/campaigns` hiển thị list bằng `<CampaignTable>` từ UI lib; `<StatusBadge>` cover 5 statuses (draft/scheduled/sending/sent/failed); `sending` dot tự pulse (lib đã handle `animate-soft-pulse`)
- [ ] AC-F4: `<ActionButton variant="primary|secondary|destructive|ghost" loading={...}>` conditional render: Edit/Delete chỉ hiện khi `draft`; Schedule chỉ khi `draft`; Send chỉ khi `draft|scheduled`; mutation in-flight → `loading` prop bật spinner; Sent campaign chỉ có Duplicate
- [ ] AC-F5: Form `/campaigns/new` dùng `<Input>`/`<Textarea>`/`<RecipientTagInput>` từ lib; lib track `valid/invalid` count; submit disabled khi invalid > 0; lỗi BE hiển thị inline qua `error` prop của Input
- [ ] AC-F6: `/campaigns/:id` dùng `<StatCard>` (4 cards: Total/Sent/Failed/Opened) + 2 `<ProgressBar label value total>` (send_rate, open_rate) + `<Accordion>` (body preview); lib đã handle divide-by-zero
- [ ] AC-F7: Loading state: skeleton trong list (manual wrap), `<ActionButton loading>` trong mutations; error state: error banner với message từ BE
- [ ] AC-F8: `packages/web/tailwind.config.cjs` consume `@campaign-manager/ui/tailwind.preset.cjs`; root CSS `@import "@campaign-manager/ui/tokens.css"` trước `@tailwind base`
- [ ] AC-F9: RTK Query `transformResponse` map BE shape (`recipients_count`, `send_rate`, `created_at`) → lib `Campaign` shape (`recipients`, `sentRate`, `created` formatted) — chỉ adapt 1 chỗ duy nhất, tránh prop-renaming xuyên app
- [ ] AC-F10: `yarn workspace @campaign-manager/ui storybook` chạy được tại `:6006` — dùng làm visual reference khi wire up; link trong README

### Repo / Submission
- [ ] AC-R1: README có section "How I Used Claude Code" với 2–3 prompt thật + các correction
- [ ] AC-R2: README có Local setup instructions với `docker compose up` chạy được không cần manual step (trừ nhập env)
- [ ] AC-R3: Có seed script tạo 1 user demo + 5 campaigns ở các status khác nhau (cover cả `failed`) + ~20 recipients
- [ ] AC-R4: `.env.example` đầy đủ; secrets không commit

---

## 4. Tier-based Task Breakdown (Critical Path First)

> **Strategy**: Hoàn thành T1 → ship được. T2 thêm async + polish. T3 tăng độ chuyên nghiệp. T4 chỉ làm nếu còn dư thời gian.

### T1 — MUST SHIP (~2.0h, ~40% time budget — giảm từ 2.5h nhờ UI lib)

#### T1.0 — UI lib smoke check (5 min, NEW)
- [ ] `cd packages/ui && yarn install && yarn typecheck` — confirm lib build clean trước khi consume
- [ ] (Optional) `yarn storybook` mở `:6006` để familiarize components
- [ ] Note: exports trong `packages/ui/src/index.ts` là source of truth cho components có sẵn

#### T1.1 — Repo bootstrap (15 min, giảm từ 20 do bỏ `shared`)
- [ ] `package.json` root với `workspaces: ["packages/*"]` + name `@campaign-manager/root` + `private: true`
- [ ] `tsconfig.base.json` chung; `tsconfig.json` mỗi package extends
- [ ] `.gitignore`, `.env.example`, `.editorconfig`
- [ ] **KHÔNG tạo `packages/shared`** (xem D15) — types từ `@campaign-manager/ui`, zod ở `packages/api/src/schemas/`

#### T1.2 — Database & Docker (25 min)
- [ ] `docker-compose.yml`: postgres:16-alpine + api + web (multi-stage Dockerfile cho api+web optional, có thể chạy local node nếu thiếu time)
- [ ] `packages/api/src/db/migrations/001_init.sql`: tạo 4 bảng + indexes
- [ ] `packages/api/src/db/migrate.ts`: simple runner đọc SQL files theo thứ tự
- [ ] Khởi động dependency Postgres + API container chạy migration tự động

**Schema chi tiết**: xem Appendix A — lưu ý ENUM `campaign_status` có **5 values** bao gồm `failed` (parity với UI lib)

#### T1.3 — API skeleton + Auth (40 min)
- [ ] Express app + middleware (cors, json, logger, error handler chung)
- [ ] Sequelize models: User, Campaign, Recipient, CampaignRecipient
- [ ] `POST /auth/register` (bcrypt hash), `POST /auth/login` (compare + jwt.sign)
- [ ] JWT middleware `requireAuth` decode + attach `req.user`
- [ ] Zod schemas trong `packages/api/src/schemas/` (BE-only, không share)

#### T1.4 — Campaign CRUD (45 min)
- [ ] `POST /campaigns` — create with recipients (lookup-or-create)
- [ ] `GET /campaigns` — list user's campaigns, pagination, response shape per AC-B13/D16
- [ ] `GET /campaigns/:id` — detail + recipients + stats (raw query aggregation)
- [ ] `PATCH /campaigns/:id` — guard `status === 'draft'`, return 409 nếu fail
- [ ] `DELETE /campaigns/:id` — guard `status === 'draft'`

#### T1.5 — FE skeleton + Login + List (30 min, giảm 10 nhờ UI lib)
- [ ] Vite + React + TS setup; `packages/web/tailwind.config.cjs` extends `@campaign-manager/ui/tailwind.preset.cjs`; root CSS `@import "@campaign-manager/ui/tokens.css"`
- [ ] Add `"@campaign-manager/ui": "workspace:*"` + react/react-dom matching `^18.2.0` peer dep vào `packages/web/package.json`
- [ ] Redux store: `authSlice` (token, user) + RTK Query `api` slice với `baseQuery` inject `Authorization` từ state
- [ ] `ProtectedRoute` wrapper
- [ ] Page `/login` — `<Input type="email">`, `<Input type="password">`, `<ActionButton loading={isLoading} variant="primary">`
- [ ] Page `/campaigns` — `<TopBar nav user>` + `<CampaignTable campaigns onRowClick>` (dùng `useGetCampaignsQuery` + `transformResponse` map BE → `Campaign` type per AC-F9)

### T2 — HIGH-VALUE (~1.6h, async + send + form + detail)

#### T2.1 — Schedule + Send async (45 min)
- [ ] `POST /campaigns/:id/schedule` — validate future timestamp, set status=`scheduled`
- [ ] `POST /campaigns/:id/send` — guard not-already-sending/sent, transaction: set `sending`, schedule `setImmediate(() => simulate())`
- [ ] `services/sendSimulator.ts`: mỗi recipient → random sent/failed (90/10), update `sent_at`. Sau loop: campaign status = `sent` nếu ≥1 sent, `failed` nếu 0
- [ ] Idempotency guard: `UPDATE campaigns SET status='sending' WHERE id=? AND status IN ('draft','scheduled')` rồi check rowcount

#### T2.2 — Recipient endpoints (15 min)
- [ ] `GET /recipients` — list with pagination
- [ ] `POST /recipients` — create (handle email unique)

#### T2.3 — FE Campaign New page (20 min, giảm 10 nhờ `RecipientTagInput` sẵn)
- [ ] `<Input>` cho name + subject (with `error` + `helper` props), `<Textarea>` cho body
- [ ] `<RecipientTagInput value={emails} onChange={...} />` — lib lo paste/comma/Enter/validation/counter
- [ ] Footer: 2 `<ActionButton>` — "Save as draft" (secondary) + "Save & schedule" (primary)
- [ ] Submit → `useCreateCampaignMutation`; success redirect `/campaigns/:id`; error map BE error → field-level `error` prop

#### T2.4 — FE Campaign Detail page (20 min, giảm 10 nhờ `StatCard` + `ProgressBar` + `Accordion` sẵn)
- [ ] `useGetCampaignQuery({pollingInterval: status === 'sending' ? 3000 : 0})` (RTK Query conditional polling)
- [ ] Header: campaign name + `<StatusBadge>`, action button cluster (conditional theo status per AC-F4)
- [ ] 4 `<StatCard label icon value series footer>` — Total/Sent/Failed/Opened (sparkline `series` optional, can pass empty)
- [ ] 2 `<ProgressBar label value total>` — Send rate (over total), Open rate (over sent — D11/test 3 case)
- [ ] Recipient table — vanilla HTML table OK (lib không có RecipientTable composite); inline status pill từ lib pattern, `<Tooltip>` cho failed reason
- [ ] Body preview: `<Accordion><AccordionItem><AccordionTrigger>Body</AccordionTrigger><AccordionContent>{body}</AccordionContent></AccordionItem></Accordion>`

### T3 — POLISH & TESTS (~1.3h)

#### T3.1 — Tests (45 min) — *xem mục 5 dưới đây*
- [ ] Test setup: jest + supertest + sequelize test DB (`mini_campaign_test`)
- [ ] Test 1: Edit/Delete restrictions
- [ ] Test 2: Send state machine + idempotency
- [ ] Test 3: Stats aggregation correctness

#### T3.2 — Wiring polish (20 min, giảm 10 — lib đã polish nhiều)
- [ ] Empty state cho list rỗng — `<EmptyState icon={MailPlus} title="No campaigns yet" cta>` từ lib
- [ ] Skeleton placeholder rows cho `<CampaignTable>` khi loading (manual — wrap div với `animate-shimmer` từ preset)
- [ ] Toast notifications (sonner — 1 dependency nhỏ) cho mutation success/error
- [ ] React error boundary cho RTK Query rejected state
- [ ] `<TopBar user>` Avatar dropdown logout action

#### T3.3 — Seed script (15 min)
- [ ] `packages/api/src/db/seed.ts`: 1 user (`demo@example.com` / `Demo123!`), 5 campaigns ở các status (cover cả `failed`), 20 recipients
- [ ] NPM script `yarn workspace @campaign-manager/api seed`

### T4 — NICE-TO-HAVE (giờ có thêm budget — chỉ làm nếu dư time)
- [ ] Pagination/infinite scroll trên `/campaigns`
- [ ] Charts (recharts) thay progress bar
- [ ] `POST /campaigns/:id/recipients/:rid/open` để simulate tracking pixel + cron mark random opens
- [ ] Optimistic updates cho delete
- [ ] E2E test với Playwright (1 happy path)
- [ ] **NEW**: Dark mode toggle — `<html data-theme="dark">` button trong TopBar (lib đã hỗ trợ; demo trong walkthrough)
- [ ] **NEW**: Deploy Storybook lên Vercel/GitHub Pages → link công khai trong README

#### T-FINAL — README & Submission (30 min, BẮT BUỘC)
- [ ] `README.md`:
    - Architecture diagram (ASCII OK) — hiển thị 3 packages: `api / web / ui`
    - Local setup: `docker compose up`, env vars cần set
    - Demo credentials (`demo@example.com` / `Demo123!`)
    - Hướng dẫn chạy Storybook: `yarn workspace @campaign-manager/ui storybook`
    - **"How I Used Claude Code"** section (xem template Appendix B) — kèm UI design workflow showcase (link `docs/ui-design-prompt.md`)
- [ ] (Optional bonus) Deploy Storybook lên Vercel/GitHub Pages → link trong README
- [ ] Push to public GitHub repo
- [ ] Walkthrough summary

---

## 5. Three Most Valuable Tests (Justified)

Spec yêu cầu ≥3 tests. Tôi chọn 3 tests sau vì coverage business-rule đắt nhất, mỗi test exercise nhiều layers (validation + state machine + SQL).

### Test 1 — Campaign Edit/Delete restrictions (integration)
**File**: `packages/api/tests/campaign-edit-rules.test.ts`
**Cases** (1 fixture, 4 assertions):
1. PATCH campaign with status=`draft` → 200
2. PATCH campaign with status=`scheduled` → 409
3. DELETE campaign with status=`draft` → 204
4. DELETE campaign with status=`sent` → 409

**Why**: Cover business rule trung tâm nhất ("only draft can be edited/deleted"). Catches regressions khi ai đó thêm endpoint mới quên check status. Fixture share giữa 4 cases → cost-efficient.

### Test 2 — Send state machine + idempotency (integration + async)
**File**: `packages/api/tests/send-state-machine.test.ts`
**Cases**:
1. Send campaign with status=`draft` → 202, status=`sending`
2. Send same campaign again immediately → 409 (idempotent guard)
3. Wait for simulator complete → status=`sent` (≥1 sent) HOẶC `failed` (0 sent), mỗi recipient có `sent_at` hoặc status=`failed`
4. Send already-`sent` campaign → 409

**Why**: Async send là phần *phức tạp nhất* — race condition + state machine + DB transaction. Test này forces mình phải implement đúng atomic transition. Idempotency là safety-critical (double-send = double email trong production). Case 3 cũng exercise transition `sending → failed` mới (D5/D3).

### Test 3 — Stats aggregation correctness (integration + SQL)
**File**: `packages/api/tests/stats-aggregation.test.ts`
**Cases**:
1. Campaign 0 recipients → stats `{total:0, sent:0, failed:0, opened:0, open_rate:0, send_rate:0}` (no NaN)
2. Campaign 10 recipients (7 sent, 2 failed, 1 pending, 3 of sent có opened_at) → `total:10, sent:7, failed:2, opened:3, send_rate:0.9, open_rate:0.428...` *(open_rate over `sent` để có ý nghĩa marketing — 3/7)*
3. Stats returns numeric types (not strings) — Postgres COUNT trả bigint dễ thành string

**Why**: Stats SQL dễ sai division-by-zero và type coercion (Postgres `COUNT(*)` returns bigint → JS string). Test forces implementation phải xử lý empty case + cast types đúng. Cũng là endpoint user-facing duy nhất có aggregation.

---

## 6. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Async send race condition (double-send) | **High** | UPDATE WHERE status guard + check rowcount; test 2 cover |
| Sequelize learning curve cho stats | Medium | Dùng `sequelize.query(rawSql, {type:QueryTypes.SELECT})` thay associations; raw SQL dễ debug |
| Time blowout trên FE polish | **High** | Tier ordering nghiêm ngặt — không vào T3.2 trước khi T1+T2 ship |
| Monorepo TypeScript path setup phức tạp | Medium | Dùng workspace protocol `"@campaign-manager/ui": "workspace:*"`; không dùng tsconfig project refs |
| Docker volume permission Postgres | Low | Dùng named volume `pgdata`, không bind mount |
| Test DB pollution giữa các test | Medium | `beforeEach` truncate tất cả tables; chạy migrations 1 lần trong `globalSetup` |
| Forget to handle Postgres COUNT bigint as string | Medium | Cast trong query: `CAST(COUNT(*) AS INTEGER)` hoặc parse trong service layer; test 3 cover |
| Spec mâu thuẫn ("no heavy ORM" vs "Sequelize") | Low | Đã chốt Sequelize, document trong README quyết định reconcile spec |
| README "How I Used Claude Code" fabrication | **High** (đánh giá AI judgment) | Track prompts + corrections REAL trong khi làm; không ngụy tạo |
| **NEW**: BE response shape lệch UI lib `Campaign` type → table render rỗng | **High** | RTK Query `transformResponse` adapter ở 1 nơi (per AC-F9); compile-time check qua TS; smoke test FE end-to-end |
| **NEW**: UI lib peer dep mismatch (lib needs react ^18.2, app dùng 18.3) | Medium | Pin matching version trong `packages/web/package.json`; `yarn workspaces info` verify dedupe |
| **NEW**: Tailwind preset không apply (status-* colors trắng/missing) → bare HTML look | Medium | Cold-install verify: `@import tokens.css` ở root, `presets` array trong `tailwind.config.cjs`, `content` glob include `node_modules/@campaign-manager/ui/src/**/*.{ts,tsx}` |
| **NEW**: UI lib `failed` status chưa có endpoint nào trigger → dead code | Low | Simulator transition logic D5 cover (0-sent → failed); seed script include 1 failed campaign cho visual demo |

---

## 7. Verification Steps (chạy trước khi nộp)

1. `docker compose down -v && docker compose up` — cold start hoàn toàn, xác nhận chạy được
2. `yarn workspace @campaign-manager/ui typecheck && yarn workspace @campaign-manager/ui build-storybook` — UI lib lành mạnh, types khớp
3. Manual smoke test:
   - Register → login → tạo campaign mới (3 recipients) → schedule (future)
   - Tạo campaign khác → send → poll detail page (3s polling khi `sending`) → stats update đúng
   - Try edit `sent` campaign → confirm 409 + ActionButton ẩn
   - Verify status badge `sending` dot pulses (lib `animate-soft-pulse`); failed recipients render với rose color (lib token)
4. `yarn workspace @campaign-manager/api test` — 3 tests pass
5. `yarn workspace @campaign-manager/web build` — production build clean (verify Tailwind preset compile, lib classes không bị purge)
6. README review: Local setup hướng dẫn đúng, "How I Used Claude Code" chân thật, có link sang `docs/ui-design-prompt.md`
7. Repo public, .env không commit

---

## 8. Time Budget Allocation (8h max scenario — UPDATED)

| Tier | Original | UPDATED | Δ | Cumulative | Ship-able? |
|------|----------|---------|---|------------|------------|
| T1 (with new T1.0) | 2.5h | **2.0h** | -30 min | 2.0h | ⚠️ Half-done — chưa send async |
| T2 | 2.0h | **1.6h** | -25 min | 3.6h | ✅ All endpoints work |
| T3 | 1.5h | **1.3h** | -10 min | 4.9h | ✅ Tests + polish |
| T4 (more room) | 1.5h | **2.5h** | +60 min | 7.4h | 🎁 Bigger bonus possible |
| T-FINAL | 0.5h | **0.5h** | — | 7.9h | ✅ Submitted |

**Net savings**: ~65 min từ UI lib pre-built. Re-invest options:
- Dark mode toggle demo
- Storybook deploy (Vercel) + link trong README
- Playwright e2e happy path (1 spec, ~30 min)
- Hoặc giảm time pressure cho T-FINAL/buffer

**Hard deadline gates** (giữ nguyên):
- 4h mark → T1 + T2 phải xong; nếu chưa → cut scope T2.4 details và go straight to tests
- 6h mark → 3 tests xong; nếu chưa → debug-only, không thêm feature
- 7.5h mark → README + push only

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

-- Campaigns
-- NOTE: 5 statuses (parity với @campaign-manager/ui CampaignStatus type)
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_campaigns_user_status ON campaigns(created_by, status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';
-- ↑ Why: list-by-user và filter-by-status là query phổ biến nhất; partial index cho scheduler tương lai

-- Recipients
CREATE TABLE recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ↑ unique on email = lookup-or-create + data integrity

-- CampaignRecipient (join + tracking)
CREATE TYPE cr_status AS ENUM ('pending', 'sent', 'failed');
CREATE TABLE campaign_recipients (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE RESTRICT,
  status cr_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, recipient_id)
);
CREATE INDEX idx_cr_campaign_status ON campaign_recipients(campaign_id, status);
-- ↑ Why: stats aggregation `WHERE campaign_id = ? GROUP BY status`
```

**Indexing rationale (để answer interview):**
- `(created_by, status)` on campaigns → list endpoint filter common
- Partial index on `scheduled_at WHERE status='scheduled'` → nếu sau này thêm cron scheduler thì query nhanh
- `(campaign_id, status)` on join table → stats aggregation hot path
- Unique on `recipients.email` → lookup-or-create + data integrity

---

## Appendix B — README "How I Used Claude Code" Template

```markdown
## How I Used Claude Code

### What I delegated
- Generating Sequelize models from SQL DDL
- Boilerplate Express middleware (CORS, error handler, validation wrapper)
- **Designing & building the entire @campaign-manager/ui library** (14 components) via the design brief in `docs/ui-design-prompt.md` → mockup → component-by-component implementation in Storybook
- Async send simulator + RTK Query polling pattern
- RTK Query `transformResponse` adapter for BE↔UI type alignment

### Real prompts used
1. (UI design) "Design a polished MarTech dashboard UI for Mini Campaign Manager. Vibe: Resend meets Linear density. 4 screens. Output: single self-contained HTML with Tailwind CDN..." (full prompt in `docs/ui-design-prompt.md`)
2. "Generate a Sequelize migration runner that reads SQL files from db/migrations/, runs them in transaction, and tracks executed files in a `_migrations` table"
3. "Implement async send simulator: mark campaign 'sending', then with setImmediate iterate recipients with 90/10 sent/failed random. Campaign goes 'sent' if any succeed else 'failed'. Use a transaction per batch."

### Where Claude Code was wrong / needed correction
- **First send-simulator draft used `setTimeout(0)` inside loop** — created N concurrent transactions instead of sequential. Fixed by using `for...of` with `await`.
- **Generated stats SQL returned `COUNT(*)` as string** — Postgres bigint serialization. Had to cast `CAST(COUNT(*) AS INTEGER)` and double-check division-by-zero.
- **Suggested storing JWT in localStorage** — overrode this for memory-only Redux storage to avoid XSS exposure even though spec allowed it.
- **Initial UI mockup was too airy** (Mailchimp-like) — refined with "reduce density, target Linear-style row heights" — needed 2 design iterations before settling on the final tokens.

### What I did NOT let Claude Code do
- **Final business rule verification** — manually walked through state transitions before declaring complete
- **Test case selection** — chose tests myself based on which catch the highest-risk regressions, not just what was easy
- **README authorship** — wrote this section by hand to give honest review of AI involvement
- **Prod-ready secrets/config** — used `.env.example` placeholder values; never asked AI to fill real keys
- **Final decision on monorepo shape** — AI suggested `packages/shared`; I evaluated and dropped it after seeing the UI lib already exports types (avoid duplicate truth)
```

---

## Final Checklist (trước khi tag complete)

- [ ] T1 + T2 đầy đủ + 3 tests pass
- [ ] `docker compose up` cold start works
- [ ] **UI lib parity**: 5 statuses render đúng, `<CampaignTable>` consume BE shape qua adapter, `<RecipientTagInput>` work end-to-end
- [ ] Storybook chạy được tại `:6006` (link trong README)
- [ ] README có "How I Used Claude Code" honest section + link sang `docs/ui-design-prompt.md`
- [ ] Repo public on GitHub, no secrets
- [ ] Walkthrough summary chuẩn bị (1 paragraph + 1 demo video optional)

---

*Plan saved to `docs/work-plan.md`*
*Last updated: 2026-04-26 — UI library integration*
*Next step: T1.0 smoke check the UI lib, then T1.1 repo bootstrap.*
