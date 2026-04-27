import { Link, useNavigate } from 'react-router-dom';
import { ActionButton, CampaignTable, EmptyState } from '@campaign-manager/ui';
import { useListCampaignsQuery } from '../api.js';

export function CampaignListPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useListCampaignsQuery();

  if (isLoading) {
    return <div className="p-8 text-fg-muted">Loading campaigns…</div>;
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
