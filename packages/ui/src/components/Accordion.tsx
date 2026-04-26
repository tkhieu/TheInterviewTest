import * as React from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

/**
 * Collapsible section. Re-exports Radix's Root with our default styling.
 *
 *   <Accordion type="single" collapsible>
 *     <AccordionItem value="body">
 *       <AccordionTrigger>Body preview</AccordionTrigger>
 *       <AccordionContent>…</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 */
export const Accordion = RadixAccordion.Root;

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Item>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Item>
>(({ className, ...props }, ref) => (
  <RadixAccordion.Item
    ref={ref}
    className={cn('border border-border rounded-lg bg-surface shadow-soft overflow-hidden', className)}
    {...props}
  />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Trigger>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Header className="flex">
    <RadixAccordion.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between px-5 py-4 text-left text-[14px] font-medium text-fg transition-colors hover:bg-surface-2',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 text-fg-subtle transition-transform duration-150 group-data-[state=open]:rotate-180" />
    </RadixAccordion.Trigger>
  </RadixAccordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof RadixAccordion.Content>,
  React.ComponentPropsWithoutRef<typeof RadixAccordion.Content>
>(({ className, children, ...props }, ref) => (
  <RadixAccordion.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-[acc-up_150ms_ease-out] data-[state=open]:animate-[acc-down_150ms_ease-out]"
    {...props}
  >
    <div className={cn('px-5 pb-5 pt-0 border-t border-border', className)}>{children}</div>
  </RadixAccordion.Content>
));
AccordionContent.displayName = 'AccordionContent';
