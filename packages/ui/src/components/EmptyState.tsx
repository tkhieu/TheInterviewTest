import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '../lib/cn';
import { ActionButton, type ActionButtonProps } from './ActionButton';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Lucide icon component (e.g. `MailPlus`). Defaults to Inbox. */
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  /** Primary action label + onClick. Hidden if omitted. */
  cta?: { label: string; onClick?: () => void; iconLeft?: React.ReactNode };
  /** Override the entire CTA with a custom node. */
  action?: React.ReactNode;
  /** Tighter padding for inline contexts (e.g. inside a card). */
  compact?: boolean;
}

/**
 * Friendly empty state — circle icon + headline + optional description + single CTA.
 * Use the `action` slot for custom buttons (e.g. `asChild` linking to a route).
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon: Icon = Inbox, title, description, cta, action, compact, className, ...props }, ref) => {
    const ctaProps: ActionButtonProps | undefined = cta && {
      onClick: cta.onClick,
      iconLeft: cta.iconLeft,
      children: cta.label,
    };
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center text-center rounded-lg border border-border bg-surface',
          compact ? 'p-6' : 'p-12',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'rounded-full bg-surface-2 flex items-center justify-center mb-3',
            compact ? 'h-10 w-10' : 'h-14 w-14'
          )}
        >
          <Icon className={cn('text-fg-subtle', compact ? 'h-5 w-5' : 'h-6 w-6')} />
        </div>
        <div className={cn('font-semibold text-fg', compact ? 'text-sm' : 'text-[15px]')}>{title}</div>
        {description && (
          <div className={cn('text-fg-subtle mt-1 max-w-sm', compact ? 'text-xs' : 'text-[13px]')}>
            {description}
          </div>
        )}
        {action ? (
          <div className="mt-4">{action}</div>
        ) : ctaProps ? (
          <div className="mt-5">
            <ActionButton {...ctaProps} />
          </div>
        ) : null}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';
