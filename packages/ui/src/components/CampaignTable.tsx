import * as React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/cn';
import { StatusBadge, type CampaignStatus } from './StatusBadge';

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  recipients: number;
  /** 0..1 */
  sentRate: number;
  /** Display string, e.g. "2 min ago". */
  created: string;
}

export interface CampaignTableProps extends React.HTMLAttributes<HTMLDivElement> {
  campaigns: Campaign[];
  onRowClick?: (c: Campaign) => void;
  onActionClick?: (c: Campaign, e: React.MouseEvent) => void;
}

const Header = () => (
  <thead>
    <tr className="bg-surface-2 text-fg-subtle text-[12px] uppercase tracking-wider">
      <th className="text-left font-medium px-4 py-2.5 w-[40%]">Campaign</th>
      <th className="text-left font-medium px-4 py-2.5">Status</th>
      <th className="text-right font-medium px-4 py-2.5">Recipients</th>
      <th className="text-left font-medium px-4 py-2.5 w-[18%]">Sent rate</th>
      <th className="text-left font-medium px-4 py-2.5">Created</th>
      <th className="text-right font-medium px-4 py-2.5 w-12" aria-label="Actions" />
    </tr>
  </thead>
);

/**
 * Dense campaign list table. Composable: pass a slice already filtered/paged by the parent.
 * Sending rows pulse via StatusBadge; long names truncate.
 */
export const CampaignTable = React.forwardRef<HTMLDivElement, CampaignTableProps>(
  ({ campaigns, onRowClick, onActionClick, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border border-border rounded-lg overflow-hidden bg-surface shadow-soft', className)}
      {...props}
    >
      <table className="w-full text-[13.5px]">
        <Header />
        <tbody className="divide-y divide-border">
          {campaigns.map((c) => {
            const pct = Math.round(c.sentRate * 100);
            return (
              <tr
                key={c.id}
                className="h-14 transition-colors hover:bg-surface-2 cursor-pointer"
                onClick={() => onRowClick?.(c)}
              >
                <td className="px-4 align-middle">
                  <div className="font-medium text-fg truncate max-w-[420px]">{c.name}</div>
                  <div className="text-[12.5px] text-fg-subtle truncate max-w-[420px]">{c.subject}</div>
                </td>
                <td className="px-4 align-middle">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 align-middle text-right tabular-nums text-fg">
                  {c.recipients === 0 ? <span className="text-fg-subtle">—</span> : c.recipients.toLocaleString()}
                </td>
                <td className="px-4 align-middle">
                  {c.status === 'draft' ? (
                    <span className="text-fg-subtle">—</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full bg-accent transition-[width] duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-[12px] text-fg-muted w-8 text-right">{pct}%</span>
                    </div>
                  )}
                </td>
                <td className="px-4 align-middle text-fg-subtle">{c.created}</td>
                <td className="px-4 align-middle text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick?.(c, e);
                    }}
                    aria-label="Row actions"
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-subtle hover:bg-surface-2 hover:text-fg"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
);
CampaignTable.displayName = 'CampaignTable';
