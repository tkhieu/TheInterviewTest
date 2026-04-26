import * as React from 'react';
import { cn } from '../lib/cn';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Subtle muted count after the label, e.g. "All  8". */
  count?: number | string;
}

/**
 * Filter chip (segmented-control style). Use as a group with shared state.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ active, count, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-active={active || undefined}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border text-[13px] transition-colors',
        active
          ? 'bg-fg text-bg border-fg'
          : 'bg-surface text-fg-muted border-border hover:bg-surface-2',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            'tabular-nums text-[12px]',
            active ? 'text-bg/70' : 'text-fg-subtle'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
);
Chip.displayName = 'Chip';

export interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
);
ChipGroup.displayName = 'ChipGroup';
