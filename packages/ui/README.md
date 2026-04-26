# @campaign-manager/ui

Reusable React component library for the Campaign Manager product. Built shadcn/ui-style: **Tailwind + cn() utility + Radix primitives**.

## Quick start

```bash
npm install @campaign-manager/ui
```

In your app's Tailwind config:

```js
// tailwind.config.cjs
module.exports = {
  presets: [require('@campaign-manager/ui/tailwind.preset.cjs')],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@campaign-manager/ui/src/**/*.{ts,tsx}',
  ],
};
```

In your root CSS:

```css
@import "@campaign-manager/ui/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Use:

```tsx
import { StatusBadge, ActionButton, ProgressBar } from '@campaign-manager/ui';

<StatusBadge status="sending" />
<ActionButton variant="primary" iconLeft={<Send />}>Send now</ActionButton>
<ProgressBar label="Send rate" value={46} total={50} />
```

## Components

| Component | Purpose |
|---|---|
| `StatusBadge` | Campaign lifecycle pill — `draft / scheduled / sending / sent / failed` |
| `ActionButton` | Primary / secondary / destructive / ghost button with `loading` + `iconLeft/Right` |
| `ProgressBar` | Labelled bar with percentage + ratio readout |
| `EmptyState` | Icon + headline + description + CTA |
| `Input` / `Textarea` | Form fields with label, helper, error, counter |
| `Chip` / `ChipGroup` | Filter chips (segmented control) |
| `StatCard` | Big number + Lucide icon + sparkline + footer |
| `Tooltip` | Radix tooltip with our styling |
| `Accordion` | Radix accordion with our styling |
| `RecipientTagInput` | Email tag input with validation |
| `Avatar` | Image + initials fallback |
| `TopBar` | App-level navigation |
| `CampaignTable` | Composite — full campaign list table |

## Theming

Light + Dark via `[data-theme="dark"]` on `<html>` or any ancestor. Tokens defined in `tokens.css`:

```html
<html data-theme="dark">
```

All semantic colors (`bg`, `surface`, `fg`, `border`, `accent`, `status-*`) read from CSS variables, so toggle is instant and SSR-safe.

## Storybook

```bash
npm run storybook
```

Stories live in `stories/*.stories.tsx`. The `addon-themes` lets you flip light/dark from the toolbar.

## File map

```
packages/ui/
├── package.json
├── tsconfig.json
├── tailwind.preset.cjs        # consumed by apps
├── tailwind.config.cjs        # for storybook + this package
├── postcss.config.cjs
├── tokens.css                 # CSS variables (light + dark)
├── README.md
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── storybook.css
├── src/
│   ├── index.ts               # public API
│   ├── lib/cn.ts
│   └── components/*.tsx
└── stories/*.stories.tsx
```

## Interactive HTML preview

Open `demo/index.html` (no install required) — runs all components in the browser via Babel for a quick gallery + interactive demos.
