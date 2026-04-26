import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../src/components/Avatar';

const meta: Meta<typeof Avatar> = { title: 'Primitives/Avatar', component: Avatar, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Initials: Story = { args: { name: 'Mai Nguyen' } };
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Amelia Chen" size="sm" />
      <Avatar name="Marco Del Rosario" size="md" />
      <Avatar name="Linnéa Holm" size="lg" />
    </div>
  ),
};
