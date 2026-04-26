/**
 * Tailwind preset for @campaign-manager/ui
 *
 * Apps that consume the library should add this preset to their tailwind.config:
 *
 *   module.exports = {
 *     presets: [require('@campaign-manager/ui/tailwind.preset.cjs')],
 *     content: [
 *       './src/**\/*.{ts,tsx}',
 *       './node_modules/@campaign-manager/ui/src/**\/*.{ts,tsx}',
 *     ],
 *   }
 */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // semantic tokens — read from CSS vars in tokens.css
        bg: 'rgb(var(--cm-bg) / <alpha-value>)',
        surface: 'rgb(var(--cm-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--cm-surface-2) / <alpha-value>)',
        border: 'rgb(var(--cm-border) / <alpha-value>)',
        ring: 'rgb(var(--cm-ring) / <alpha-value>)',
        fg: 'rgb(var(--cm-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--cm-fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--cm-fg-subtle) / <alpha-value>)',
        accent: 'rgb(var(--cm-accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--cm-accent-fg) / <alpha-value>)',
        'status-draft': 'rgb(var(--cm-draft) / <alpha-value>)',
        'status-scheduled': 'rgb(var(--cm-scheduled) / <alpha-value>)',
        'status-sending': 'rgb(var(--cm-sending) / <alpha-value>)',
        'status-sent': 'rgb(var(--cm-sent) / <alpha-value>)',
        'status-failed': 'rgb(var(--cm-failed) / <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--cm-radius-lg)',
        md: 'var(--cm-radius-md)',
        sm: 'var(--cm-radius-sm)',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        pop: '0 6px 16px -6px rgb(15 23 42 / 0.12), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
      },
      keyframes: {
        'soft-pulse': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.55', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'soft-pulse': 'soft-pulse 1.4s ease-in-out infinite',
        shimmer: 'shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [],
};
