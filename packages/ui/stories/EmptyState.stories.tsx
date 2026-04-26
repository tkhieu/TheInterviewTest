import type { Meta, StoryObj } from '@storybook/react';
import { MailPlus, Inbox, Users } from 'lucide-react';
import { EmptyState } from '../src/components/EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Primitives/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoCampaigns: Story = {
  args: {
    icon: MailPlus,
    title: 'No campaigns yet',
    description: "Draft your first email, choose recipients, and we'll handle the rest. Average setup time: under a minute.",
    cta: { label: 'Create your first campaign' },
  },
};

export const Compact: Story = {
  args: { icon: Inbox, title: 'No results', compact: true, description: 'Try a different filter.' },
};

export const NoRecipients: Story = {
  args: { icon: Users, title: 'No recipients yet', description: 'Add emails or upload a CSV to begin.' },
};
