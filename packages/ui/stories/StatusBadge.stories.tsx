import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../src/components/StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'Primitives/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: { control: 'select', options: ['draft', 'scheduled', 'sending', 'sent', 'failed'] },
  },
};
export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Draft: Story = { args: { status: 'draft' } };
export const Scheduled: Story = { args: { status: 'scheduled' } };
export const Sending: Story = { args: { status: 'sending' } };
export const Sent: Story = { args: { status: 'sent' } };
export const Failed: Story = { args: { status: 'failed' } };

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="draft" />
      <StatusBadge status="scheduled" />
      <StatusBadge status="sending" />
      <StatusBadge status="sent" />
      <StatusBadge status="failed" />
    </div>
  ),
};

export const CustomLabel: Story = { args: { status: 'draft', label: 'Pending review' } };
