import type { Meta, StoryObj } from '@storybook/react';
import { CampaignTable, type Campaign } from '../src/components/CampaignTable';

const campaigns: Campaign[] = [
  { id: '1', name: 'Spring Launch — Wave 2', subject: "Don't miss this — your early access begins tomorrow at 9am PT", status: 'sending', recipients: 547, sentRate: 0.92, created: '2 min ago' },
  { id: '2', name: 'Welcome series · Day 1 of 5 (long-tail customer onboarding flow auto-send)', subject: "Welcome to the team, {{first_name}}", status: 'sent', recipients: 1284, sentRate: 1, created: 'Yesterday' },
  { id: '3', name: 'Q2 changelog roundup', subject: 'What shipped this quarter — 14 new features', status: 'sent', recipients: 4203, sentRate: 1, created: '2 days ago' },
  { id: '4', name: 'Win-back · 90-day inactives', subject: "We've been busy — here's what you missed", status: 'scheduled', recipients: 612, sentRate: 0, created: 'Apr 24' },
  { id: '5', name: 'Pricing update notice', subject: 'An important update to your plan, effective May 1', status: 'draft', recipients: 0, sentRate: 0, created: 'Apr 23' },
  { id: '6', name: 'Beta invite · Tagging v2', subject: "You're in — early access to recipient tagging", status: 'scheduled', recipients: 88, sentRate: 0, created: 'Apr 22' },
];

const meta: Meta<typeof CampaignTable> = { title: 'Composites/CampaignTable', component: CampaignTable, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof CampaignTable>;

export const Populated: Story = { args: { campaigns } };
export const Empty: Story = { args: { campaigns: [] } };
