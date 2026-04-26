import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5 transition-colors',
  {
    variants: {
      status: {
        draft: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
        scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
        sending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        sent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
      },
    },
    defaultVariants: { status: 'draft' },
  }
);

const dot = cva('h-1.5 w-1.5 rounded-full', {
  variants: {
    status: {
      draft: 'bg-status-draft',
      scheduled: 'bg-status-scheduled',
      sending: 'bg-status-sending animate-soft-pulse',
      sent: 'bg-status-sent',
      failed: 'bg-status-failed',
    },
  },
  defaultVariants: { status: 'draft' },
});

const LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
};

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof badge> {
  status: CampaignStatus;
  /** Override default label ("Draft" → "Pending review") */
  label?: string;
}

/**
 * Campaign lifecycle pill. Color + label always paired (a11y).
 * `sending` dot pulses to convey live activity.
 */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, className, ...props }, ref) => (
    <span ref={ref} className={cn(badge({ status }), className)} {...props}>
      <span className={dot({ status })} aria-hidden />
      {label ?? LABELS[status]}
    </span>
  )
);
StatusBadge.displayName = 'StatusBadge';
