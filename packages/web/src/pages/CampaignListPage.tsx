import { Link, useNavigate } from 'react-router-dom';
import { ActionButton, CampaignTable, EmptyState } from '@campaign-manager/ui';
import { useListCampaignsQuery } from '../api.js';
import { Skeleton } from '../components/Skeleton.js';

export function CampaignListPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useListCampaignsQuery();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
          <div className="border-b border-border bg-surface-2 h-9" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 border-b border-border last:border-b-0 px-4 flex items-center gap-4"
            >
              <Skeleton className="h-4 flex-1 max-w-[40%]" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-1.5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-rose-600" role="alert">
        Failed to load campaigns.
      </div>
    );
  }
  if (!data || data.data.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="No campaigns yet"
          description="Create your first campaign to start sending."
        />
        <div className="mt-6 flex justify-center">
          <ActionButton asChild>
            <Link to="/campaigns/new">New campaign</Link>
          </ActionButton>
        </div>
      </div>
    );
  }
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold text-fg tracking-[-0.011em]">Campaigns</h1>
          <span className="text-[13px] text-fg-muted tabular-nums">{data.total} total</span>
        </div>
        <ActionButton asChild>
          <Link to="/campaigns/new">New campaign</Link>
        </ActionButton>
      </div>
      <CampaignTable
        campaigns={data.data}
        onRowClick={(c) => navigate(`/campaigns/${c.id}`)}
      />
    </div>
  );
}
