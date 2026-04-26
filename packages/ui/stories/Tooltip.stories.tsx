import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';
import { Tooltip } from '../src/components/Tooltip';

const meta: Meta<typeof Tooltip> = { title: 'Primitives/Tooltip', component: Tooltip, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip content="SMTP 550 · mailbox unavailable">
      <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border text-sm">
        <Info className="h-3.5 w-3.5" /> Hover me
      </button>
    </Tooltip>
  ),
};
