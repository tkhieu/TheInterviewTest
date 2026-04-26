import type { Meta, StoryObj } from '@storybook/react';
import { Users, CheckCircle2, AlertTriangle, MailOpen } from 'lucide-react';
import { StatCard } from '../src/components/StatCard';

const meta: Meta<typeof StatCard> = { title: 'Primitives/StatCard', component: StatCard, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof StatCard>;

export const Single: Story = {
  args: {
    label: 'Sent',
    value: '503 / 547',
    icon: CheckCircle2,
    series: [10, 12, 14, 18, 22, 30, 38, 44, 50, 56, 60],
    footer: '+44 in last minute',
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 max-w-5xl">
      <StatCard label="Total" value="547" icon={Users} series={[5,6,8,9,11,14,18,22,27,30,33,36]} footer="Recipients in segment" />
      <StatCard label="Sent" value={<>503 <span className="text-fg-subtle text-[14px] font-normal">/ 547</span></>} icon={CheckCircle2} iconClassName="text-emerald-500" series={[10,12,14,18,22,30,38,44,50,56,60]} footer="+44 in last minute" />
      <StatCard label="Failed" value="3" icon={AlertTriangle} iconClassName="text-rose-500" seriesColor="rgb(244 63 94)" series={[1,1,2,2,2,3,3,3,3,3,3]} footer="2 bounce, 1 unsubscribed" />
      <StatCard label="Opened" value="191" icon={MailOpen} iconClassName="text-indigo-500" series={[2,5,12,28,52,80,110,140,160,178,191]} footer="38% open rate" />
    </div>
  ),
};
