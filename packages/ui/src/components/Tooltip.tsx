import * as React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../lib/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** ms before the tooltip appears. Default 150. */
  delayDuration?: number;
  className?: string;
}

/**
 * Thin wrapper around Radix Tooltip — handles Provider so consumers don't need to.
 * For perf at scale, render a single <TooltipProvider> at the app root and use
 * Radix primitives directly.
 */
export const Tooltip = ({ content, children, side = 'top', delayDuration = 150, className }: TooltipProps) => (
  <RadixTooltip.Provider delayDuration={delayDuration}>
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 rounded-md bg-fg text-bg px-2 py-1 text-[11.5px] shadow-pop',
            'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
            className
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-fg" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  </RadixTooltip.Provider>
);
