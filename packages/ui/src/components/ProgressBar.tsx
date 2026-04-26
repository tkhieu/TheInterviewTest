import * as React from 'react';
import * as RadixProgress from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const fill = cva('h-full transition-[width] duration-500 ease-out', {
  variants: {
    tone: {
      accent: 'bg-accent',
      success: 'bg-status-sent',
      warning: 'bg-status-sending',
      danger: 'bg-status-failed',
    },
  },
  defaultVariants: { tone: 'accent' },
});

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof fill> {
  /** Above-bar label, e.g. "Send rate". Omit for unlabelled. */
  label?: React.ReactNode;
  /** Numerator. */
  value: number;
  /** Denominator. Required to compute percentage and show "x / y". */
  total: number;
  /** Render the "n / total" stat next to the percentage. Default true. */
  showCount?: boolean;
  /** Optional helper line under the bar. */
  helper?: React.ReactNode;
  /** Bar height. Default 8 (h-2). */
  size?: 'sm' | 'md' | 'lg';
}

const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' } as const;

/**
 * Labelled progress bar with percentage + ratio readout.
 * Edge case: value=0 renders 0% — let `helper` explain ("Just queued…").
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ label, value, total, tone, showCount = true, helper, size = 'md', className, ...props }, ref) => {
    const safeTotal = Math.max(total, 0);
    const safeValue = Math.min(Math.max(value, 0), safeTotal);
    const pct = safeTotal === 0 ? 0 : Math.round((safeValue / safeTotal) * 100);

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {(label !== undefined || showCount) && (
          <div className="flex items-baseline justify-between mb-1.5">
            {label !== undefined && <div className="text-[13px] text-fg">{label}</div>}
            {showCount && (
              <div className="text-[12px] text-fg-subtle tabular-nums">
                <span className="font-medium text-fg">{pct}%</span>
                <span> · {safeValue.toLocaleString()} / {safeTotal.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
        <RadixProgress.Root
          value={pct}
          className={cn('relative w-full overflow-hidden rounded-full bg-surface-2', heights[size])}
          aria-label={typeof label === 'string' ? label : 'progress'}
        >
          <RadixProgress.Indicator className={fill({ tone })} style={{ width: `${pct}%` }} />
        </RadixProgress.Root>
        {helper && <div className="text-[12px] text-fg-subtle mt-1.5">{helper}</div>}
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';
