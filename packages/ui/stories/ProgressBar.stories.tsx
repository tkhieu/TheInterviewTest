import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar } from '../src/components/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'Primitives/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['accent', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { label: 'Send rate', value: 46, total: 50 },
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {};
export const ZeroPercent: Story = { args: { value: 0, total: 50, helper: "Just queued — worker hasn't started." } };
export const FiftyPercent: Story = { args: { value: 25, total: 50 } };
export const Complete: Story = { args: { value: 50, total: 50, tone: 'success' } };

export const Gallery: Story = {
  render: () => (
    <div className="space-y-5 max-w-md">
      <ProgressBar label="Send rate" value={0} total={50} helper="Just queued." />
      <ProgressBar label="Send rate" value={25} total={50} />
      <ProgressBar label="Send rate" value={46} total={50} />
      <ProgressBar label="Send rate" value={50} total={50} tone="success" />
      <ProgressBar label="Bounce rate" value={3} total={547} tone="danger" />
    </div>
  ),
};
