import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  /** Render an error border + ring; pair with `helper` to explain. */
  error?: boolean;
  /** Helper or error text under the field. */
  helper?: React.ReactNode;
  /** End-of-row counter (e.g. "82 / 78") — auto-styled red when error. */
  counter?: React.ReactNode;
  /** Slot rendered inside the input on the left. */
  leftSlot?: React.ReactNode;
  /** Wrapper className (label + input + helper). */
  wrapperClassName?: string;
}

/**
 * Single-line text input with label, helper, error and counter slots.
 * Mirrors the pattern from the Campaign Manager form (Subject + char counter).
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, counter, leftSlot, wrapperClassName, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const fieldId = id ?? reactId;
    return (
      <div className={cn('w-full', wrapperClassName)}>
        {(label || counter) && (
          <div className="flex items-baseline justify-between">
            {label && (
              <label htmlFor={fieldId} className="text-[13px] font-medium text-fg block mb-1.5">
                {label}
              </label>
            )}
            {counter && (
              <span
                className={cn(
                  'text-[12px] tabular-nums',
                  error ? 'text-rose-600' : 'text-fg-subtle'
                )}
              >
                {counter}
              </span>
            )}
          </div>
        )}
        <div className="relative">
          {leftSlot && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none">
              {leftSlot}
            </div>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error || undefined}
            className={cn(
              'w-full h-9 px-3 text-sm bg-surface text-fg border border-border rounded-md transition-colors',
              'placeholder:text-fg-subtle',
              'focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              leftSlot && 'pl-9',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
        </div>
        {helper && (
          <div
            className={cn(
              'mt-1.5 text-[12px] flex items-start gap-1.5',
              error ? 'text-rose-600' : 'text-fg-subtle'
            )}
          >
            {error && <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />}
            <span>{helper}</span>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: boolean;
  helper?: React.ReactNode;
  /** Use monospace font (good for raw email body / templates). */
  mono?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helper, mono, className, id, ...props }, ref) => {
    const reactId = React.useId();
    const fieldId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className="text-[13px] font-medium text-fg block mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error || undefined}
          className={cn(
            'w-full px-3 py-2.5 text-sm bg-surface text-fg border border-border rounded-md leading-relaxed transition-colors',
            'placeholder:text-fg-subtle',
            'focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20',
            mono && 'font-mono text-[13px]',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        />
        {helper && (
          <div
            className={cn(
              'mt-1.5 text-[12px]',
              error ? 'text-rose-600' : 'text-fg-subtle'
            )}
          >
            {helper}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
