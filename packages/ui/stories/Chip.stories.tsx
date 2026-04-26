import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Chip, ChipGroup } from '../src/components/Chip';

const meta: Meta<typeof Chip> = { title: 'Primitives/Chip', component: Chip, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Chip>;

export const Filters: Story = {
  render: () => {
    const [active, setActive] = React.useState('all');
    const items = [
      { id: 'all', label: 'All', count: 8 },
      { id: 'draft', label: 'Draft', count: 2 },
      { id: 'scheduled', label: 'Scheduled', count: 2 },
      { id: 'sending', label: 'Sending', count: 1 },
      { id: 'sent', label: 'Sent', count: 3 },
    ];
    return (
      <ChipGroup>
        {items.map((i) => (
          <Chip key={i.id} active={active === i.id} count={i.count} onClick={() => setActive(i.id)}>
            {i.label}
          </Chip>
        ))}
      </ChipGroup>
    );
  },
};
