import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RecipientTagInput } from '../src/components/RecipientTagInput';

const meta: Meta<typeof RecipientTagInput> = {
  title: 'Forms/RecipientTagInput',
  component: RecipientTagInput,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof RecipientTagInput>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([
      'amelia.chen@northwind.io',
      'marco.del-rosario@helmstad.com',
      'this-is-not-an-email',
      'priya.shah@bluewren.dev',
    ]);
    return <div className="max-w-xl"><RecipientTagInput value={value} onChange={setValue} /></div>;
  },
};
