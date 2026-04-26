import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../src/components/Accordion';

const meta: Meta<typeof Accordion> = { title: 'Primitives/Accordion', component: Accordion, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Accordion>;

export const SingleCollapsible: Story = {
  render: () => (
    <Accordion type="single" collapsible className="max-w-2xl">
      <AccordionItem value="body">
        <AccordionTrigger>Body preview</AccordionTrigger>
        <AccordionContent>
          <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed text-fg-muted">
{`Hi {{first_name}},

Spring Launch starts tomorrow at 9am PT — your 12-hour head start is live.`}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
