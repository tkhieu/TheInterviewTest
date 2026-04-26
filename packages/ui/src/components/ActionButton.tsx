import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/cn';

const button = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed [&_svg]:shrink-0 hover:-translate-y-px',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-accent-fg shadow-soft hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:bg-slate-100 disabled:text-fg-subtle disabled:shadow-none disabled:hover:translate-y-0',
        secondary:
          'bg-surface text-fg border border-border hover:bg-surface-2 disabled:text-fg-subtle disabled:hover:translate-y-0',
        destructive:
          'bg-surface text-rose-700 border border-rose-200 hover:bg-rose-50 dark:bg-transparent dark:text-rose-400 dark:border-rose-900/50 dark:hover:bg-rose-950/30',
        ghost:
          'bg-transparent text-fg hover:bg-surface-2 disabled:text-fg-subtle disabled:hover:translate-y-0',
      },
      size: {
        sm: 'h-8 px-2.5 text-[12.5px] [&_svg]:size-3.5',
        md: 'h-9 px-3.5 text-sm [&_svg]:size-4',
        lg: 'h-10 px-4 text-sm [&_svg]:size-4',
        icon: 'h-9 w-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  /** Render into a custom child element (Radix Slot pattern). */
  asChild?: boolean;
  /** Show spinner + disable interactions. */
  loading?: boolean;
  /** Convenience: icon node placed before children. */
  iconLeft?: React.ReactNode;
  /** Convenience: icon node placed after children. */
  iconRight?: React.ReactNode;
}

/**
 * Primary / secondary / destructive / ghost button.
 * Use `loading` for inline spinners (e.g. "Signing in…"); button is auto-disabled.
 */
export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    { className, variant, size, asChild, loading, disabled, iconLeft, iconRight, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(button({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" /> : iconLeft}
        {children}
        {!loading && iconRight}
      </Comp>
    );
  }
);
ActionButton.displayName = 'ActionButton';
