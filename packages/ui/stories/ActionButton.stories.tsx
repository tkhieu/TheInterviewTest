import type { Meta, StoryObj } from '@storybook/react';
import { Send, CalendarClock, Trash2, Plus } from 'lucide-react';
import { ActionButton } from '../src/components/ActionButton';

const meta: Meta<typeof ActionButton> = {
  title: 'Primitives/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'destructive', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'icon'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { children: 'Send now', iconLeft: <Send /> },
};
export default meta;
type Story = StoryObj<typeof ActionButton>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Schedule', iconLeft: <CalendarClock /> } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete', iconLeft: <Trash2 /> } };
export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel', iconLeft: undefined } };
export const Loading: Story = { args: { variant: 'primary', loading: true, children: 'Signing in…', iconLeft: undefined } };
export const Disabled: Story = { args: { variant: 'primary', disabled: true } };

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ActionButton variant="primary" iconLeft={<Send />}>Send now</ActionButton>
      <ActionButton variant="secondary" iconLeft={<CalendarClock />}>Schedule</ActionButton>
      <ActionButton variant="destructive" iconLeft={<Trash2 />}>Delete</ActionButton>
      <ActionButton variant="ghost">Cancel</ActionButton>
      <ActionButton variant="primary" disabled iconLeft={<Plus />}>Disabled</ActionButton>
      <ActionButton variant="primary" loading>Signing in…</ActionButton>
    </div>
  ),
};
