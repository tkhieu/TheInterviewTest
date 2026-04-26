# UI Design Brief — Mini Campaign Manager

> **Purpose**: Prompt sử dụng để generate UI mockups cho Mini Campaign Manager qua Claude.ai (Artifacts), Claude Code (`frontend-design` skill), V0.dev, hoặc Lovable.
>
> **Status**: Draft — chờ review trước khi gửi vào tool design.
>
> **Owner**: tr.kimhieu@gmail.com
> **Last updated**: 2026-04-26

---

## Cách dùng tài liệu này

1. **Review** mục "Design Prompt" bên dưới — đây là nội dung sẽ paste vào tool.
2. **Adjust** nếu cần (vd: đổi vibe reference, thêm/bớt screen, điều chỉnh palette).
3. **Run** trên tool đã chọn:
   - **Claude.ai Artifacts** (recommended cho visual preview): paste full prompt → nhận HTML artifact.
   - **Claude Code**: `/everything-claude-code:frontend-design` rồi paste prompt.
   - **V0.dev / Lovable**: paste để generate React + shadcn code thẳng.
4. **Iterate** 2–3 lần với refinement prompts (xem mục "Refinement playbook" cuối tài liệu).
5. **Capture** screenshots vào `docs/mockups/` để làm reference khi build React components.

---

## Context (cho người review)

| Field | Value |
|-------|-------|
| Product | Mini Campaign Manager — MarTech tool quản lý email campaigns |
| Pages cần design | `/login`, `/campaigns` (list), `/campaigns/new` (create), `/campaigns/:id` (detail) |
| Tech stack target | React 18 + TypeScript + Tailwind CSS + shadcn/ui |
| Status enum | `draft` (grey) → `scheduled` (blue) → `sending` (amber, animated) → `sent` (emerald) |
| Chiều rộng target | 1280px desktop (không làm mobile cho v1) |
| Target reviewer | Recruiter đánh giá "Frontend quality (UX polish, error/loading states)" |

---

## Design Prompt (paste nguyên block dưới đây vào tool)

````markdown
# Role
You are a senior product designer specializing in MarTech SaaS dashboards. Design a polished, production-grade UI for "Mini Campaign Manager" — a tool marketers use to create, schedule, and track email campaigns.

# Output format
Produce **a single self-contained HTML file** with Tailwind CSS (CDN) and Lucide icons (CDN). Show all 4 screens stacked vertically with section dividers labeled by route. Use shadcn/ui design tokens (slate/zinc neutrals, rounded-lg, subtle shadows, focus-visible rings). Include realistic mock data — no Lorem Ipsum.

# Design language
- **Vibe**: Modern MarTech — think Resend dashboard meets Linear's information density. Clean, confident, no chrome bloat.
- **Palette**: White background, slate-50 surfaces, slate-900 text. Accent = indigo-600. Status colors: slate (draft), blue-600 (scheduled), amber-500 (sending), emerald-600 (sent).
- **Typography**: Inter, tight tracking on headers, generous line-height for body. Numeric stats in tabular-nums.
- **Density**: Comfortable but not airy. List rows ~56px tall. Cards have 16–24px padding.
- **Motion** (CSS only): subtle hover translate-y-[-1px], 150ms transitions. No big animations.
- **Empty states**: friendly illustration (use a Lucide icon in a subtle circle), one-line headline, single CTA.
- **Accessibility**: visible focus rings, 4.5:1 contrast, status conveyed by both color + label.

# Reference vibe
Resend dashboard, Customer.io campaigns view, Linear's table density. NOT Mailchimp (too consumer-y) or Salesforce (too enterprise-cluttered).

# Screens to design

## 1. /login
- Centered card (max-w-md), app logo + name "Campaign Manager"
- Email + Password fields, "Sign in" primary button, "Create account" secondary link
- Error state example: invalid credentials inline alert above the form
- Loading state: button shows spinner + "Signing in…"
- Mock: prefilled `demo@example.com`

## 2. /campaigns (list)
- Top bar: app logo, nav (Campaigns, Recipients), user avatar dropdown
- Page header: "Campaigns" title, "+ New campaign" primary CTA right-aligned
- Filter row: search input, status filter chips (All / Draft / Scheduled / Sending / Sent), result count
- **Table** (8 mock rows mixing all statuses):
  - Columns: Name (bold) + subject (muted line-2), Status badge, Recipients count, Sent rate (mini progress), Created (relative), Actions (kebab menu)
  - Status badges: rounded-full, dot + label, the 4 colors above
  - Sending row: animated pulse on the badge dot
  - Hover row: subtle bg-slate-50
- Pagination at bottom (1 of 3 pages)
- **Empty state variant**: show below the populated table, marked "// Empty state →" — circle icon + "No campaigns yet" + "Create your first campaign" button
- **Loading state variant**: 5 skeleton rows

## 3. /campaigns/new
- Two-column layout: form left (60%), live preview right (40%)
- Form fields:
  - Name (required, helper "Internal name, recipients won't see this")
  - Subject (required, char counter / 78 best practice hint)
  - Body (textarea, ~12 rows, monospace, placeholder shows {{first_name}} hint)
  - Recipients: tag input — paste comma/newline separated emails, chips appear, invalid emails go red, helper shows count
- Footer: "Save as draft" secondary, "Save & schedule" primary
- Validation error example shown on Subject field
- Right preview: email-shaped card showing live render of subject + body, "From: demo@example.com" header

## 4. /campaigns/:id (detail)
- Breadcrumb: Campaigns / [name]
- Header row: Name (h1) + status badge, action buttons cluster:
  - Show all 4 button states across mock variants (use 3 mini cards labeled "draft view", "scheduled view", "sent view")
  - Draft: Edit, Schedule, Send now, Delete (destructive)
  - Scheduled: Send now, Cancel schedule, Delete (disabled)
  - Sending: only "View progress" (disabled others), with live pulse
  - Sent: Duplicate (only)
- **Stats grid** (4 cards): Total / Sent / Failed / Opened — big number + sparkline-ish footer
- **Two progress bars** below stats: Send rate (e.g. 92%, 46/50) and Open rate (e.g. 38%, 17/46) — labeled, smooth, accent indigo
- **Recipients table**: email, name, status pill (pending/sent/failed), sent_at, opened_at — 6 mock rows with mixed states
- **Body preview accordion** at the bottom: collapsed by default, expands to show campaign body

# Components to design explicitly (reusable)
1. `<StatusBadge status="draft|scheduled|sending|sent" />` — show all 4 in the header of the file as a mini component gallery
2. `<ProgressBar label="Send rate" value={92} total={50} />` — show 0%, 50%, 100% variants
3. `<EmptyState icon="..." title="..." cta="..." />`
4. `<ActionButton variant="primary|secondary|destructive|disabled" />` — show all 4

# Edge cases to surface
- Send rate = 0% (just-sent campaign, not yet processed)
- Open rate = 0% on a 100% sent campaign (no one opened yet)
- Long campaign name truncation in table
- 500+ recipients (show "showing 50 of 547")
- Failed recipients with hover tooltip showing error reason

# Do NOT
- No gradients, no glassmorphism, no dark mode (single light theme)
- No emojis in UI text
- No fake brand logos beyond a simple "□ Campaign Manager" wordmark
- No multi-tenant/team/billing UI — out of scope

# Final deliverable checklist
- [ ] All 4 screens visible
- [ ] All 4 status colors correctly mapped
- [ ] Action buttons shown in all relevant states
- [ ] Loading + empty + error states represented
- [ ] Component gallery at the top of the file
- [ ] Responsive at 1280px desktop (don't waste effort on mobile for v1)
````

---

## Refinement playbook (sau khi nhận output đầu tiên)

Output đầu hiếm khi hoàn hảo. Dùng 1–3 follow-up sau:

### Density / spacing
> "Reduce table row height by 20% and tighten the padding on cards. Aim for Linear-style density."

### Color refinement
> "The amber for sending feels too warm next to indigo accent. Try amber-400 or switch to violet-500 for the sending state."

### State coverage
> "Add a 'failed campaign' variant where send_rate is only 30% and most recipients show error tooltips."

### Component polish
> "The status badge looks generic. Add a small pulsing dot for `sending` status and a tiny check icon for `sent`."

### Information hierarchy
> "On the detail page, the stats cards are competing with the progress bars. Make stats cards more subtle (smaller numbers, thinner borders) so progress bars become the hero."

### Mock data realism
> "Replace generic campaign names with realistic ones: 'Black Friday teaser', 'Q4 Newsletter — Nov', 'Welcome series — Day 1', etc."

---

## Decision log (cập nhật khi review)

| Date | Change | Reason |
|------|--------|--------|
| 2026-04-26 | Initial draft | First version of design brief |
| _(pending review)_ | _(your edits here)_ | _(reasoning)_ |

---

## Open questions cho reviewer

- [ ] Reference vibe: Resend + Linear OK, hay muốn vibe khác (vd: Notion, Vercel, Stripe)?
- [ ] Có cần dark mode không? (Hiện đang skip để giảm scope)
- [ ] Recipient management có cần page riêng `/recipients` không, hay chỉ cần endpoint API là đủ?
- [ ] Có muốn thêm onboarding/empty-state cho first-time user không?
- [ ] Logo/branding: giữ wordmark đơn giản "□ Campaign Manager" hay có brand riêng cần áp dụng?

---

## Next steps (sau khi prompt được approve)

1. Run prompt trên Claude.ai Artifacts → save HTML output to `docs/mockups/v1.html`
2. Screenshot 4 screens → `docs/mockups/screenshots/{login,list,new,detail}.png`
3. Iterate 2–3 lần dùng refinement playbook → final → `docs/mockups/v-final.html`
4. Reference mockup khi implement React components ở T1.5 + T2.3 + T2.4 (xem `.omc/plans/mini-campaign-manager-plan.md`)
5. Trong README "How I Used Claude Code" section: document prompt + ít nhất 1 correction cycle
