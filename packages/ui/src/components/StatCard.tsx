import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  /** Right-aligned icon, typically Lucide. */
  icon?: LucideIcon;
  iconClassName?: string;
  /** Optional sparkline series (0–1 values, normalized internally). 8–24 points works best. */
  series?: number[];
  /** Color of sparkline path. CSS color or Tailwind-resolved value. */
  seriesColor?: string;
  /** Footer text under the sparkline. */
  footer?: React.ReactNode;
}

function buildPath(series: number[], w = 120, h = 28) {
  if (series.length === 0) return { line: '', area: '' };
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = w / Math.max(series.length - 1, 1);
  const points = series.map((v, i) => {
    const x = i * stepX;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return [x, y] as const;
  });
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area =
    `M${points[0]![0]},${h} ` +
    points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') +
    ` L${w},${h} Z`;
  return { line, area };
}

/**
 * Big number + Lucide icon + sparkline + footer.
 * Use for at-a-glance campaign stats (Total / Sent / Failed / Opened).
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { label, value, icon: Icon, iconClassName, series, seriesColor = 'rgb(var(--cm-accent))', footer, className, ...props },
    ref
  ) => {
    const { line, area } = React.useMemo(() => buildPath(series ?? []), [series]);
    return (
      <div
        ref={ref}
        className={cn('border border-border rounded-lg p-5 bg-surface shadow-soft', className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="text-[12px] uppercase tracking-wider text-fg-subtle font-medium">{label}</div>
          {Icon && <Icon className={cn('h-4 w-4 text-fg-subtle', iconClassName)} />}
        </div>
        <div className="text-[30px] font-semibold tracking-[-0.022em] tabular-nums mt-1 text-fg leading-tight">
          {value}
        </div>
        {series && series.length > 1 && (
          <svg className="mt-2 w-full" viewBox="0 0 120 28" preserveAspectRatio="none" height={28}>
            <path d={area} fill={seriesColor} fillOpacity={0.08} />
            <path d={line} fill="none" stroke={seriesColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {footer && <div className="text-[11.5px] text-fg-subtle mt-1">{footer}</div>}
      </div>
    );
  }
);
StatCard.displayName = 'StatCard';
