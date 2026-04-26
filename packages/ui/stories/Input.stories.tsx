import type { Meta, StoryObj } from '@storybook/react';
import { Search } from 'lucide-react';
import { Input, Textarea } from '../src/components/Input';

const meta: Meta<typeof Input> = {
  title: 'Forms/Input',
  component: Input,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: 'Name', placeholder: 'Spring Launch — Wave 2', helper: "Internal name, recipients won't see this." },
};

export const Error: Story = {
  args: {
    label: 'Subject',
    defaultValue: "Don't miss this — your early access to the Spring Launch begins tomorrow at 9am",
    counter: '82 / 78',
    error: true,
    helper: 'Keep subject lines under 78 characters.',
  },
};

export const WithLeftSlot: Story = {
  args: { placeholder: 'Search by name or subject', leftSlot: <Search className="h-4 w-4" /> },
};

export const TextareaMono: Story = {
  render: () => (
    <Textarea
      label="Body"
      mono
      rows={8}
      defaultValue={"Hi {{first_name}},\n\nSpring Launch starts tomorrow…"}
      helper="Use {{first_name}} for personalization."
    />
  ),
};
