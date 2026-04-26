import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from '../src/components/TopBar';

const meta: Meta<typeof TopBar> = { title: 'Layout/TopBar', component: TopBar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  args: {
    appName: 'Campaign Manager',
    nav: [
      { label: 'Campaigns', active: true },
      { label: 'Recipients' },
    ],
    user: { name: 'Mai N.' },
    onSearchClick: () => {},
    onNotificationsClick: () => {},
  },
};
