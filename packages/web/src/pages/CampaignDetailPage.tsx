import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActionButton,
  ProgressBar,
  StatCard,
  StatusBadge,
} from '@campaign-manager/ui';
import { AlertCircle, CheckCircle2, Eye, Mail, Send, Trash2 } from 'lucide-react';
import {
  useDeleteCampaignMutation,
  useGetCampaignDetailQuery,
  useSendCampaignMutation,
} from '../api.js';
import { Skeleton } from '../components/Skeleton.js';

export function CampaignDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Dynamic polling: while the BE simulator is mid-send, refetch every 3s.
  // Reading data?.status from the hook's own prior-render data is the
  // canonical RTK Query pattern -- starts on its own when status flips to
  // 'sending', stops when it flips to 'sent' / 'failed'. No useEffect, no
  // manual setInterval, no cleanup glue.
  const result = useGetCampaignDetailQuery(id);
  const detail = result.data;
  useGetCampaignDetailQuery(id, {
    pollingInterval: detail?.status === 'sending' ? 3_000 : 0,
    skip: !detail,
  });

  const [sendCampaign, { isLoading: isSending }] = useSendCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  if (result.isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6 space-y-3">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (result.error || !detail) {
    const isNotFound =
      result.error &&
      'status' in result.error &&
      (result.error as { status: number }).status === 404;
    return (
      <div className="p-8">
        <p className="text-rose-600 mb-4" role="alert">
          {isNotFound ? 'Campaign not found.' : 'Failed to load campaign.'}
        </p>
        <ActionButton variant="secondary" asChild>
          <Link to="/">Back to campaigns</Link>
        </ActionButton>
      </div>
    );
  }

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (
      err &&
      typeof err === 'object' &&
      'data' in err &&
      err.data &&
      typeof err.data === 'object' &&
      'error' in err.data
    ) {
      const inner = (err.data as { error: { message?: string } }).error;
      if (inner?.message) return inner.message;
    }
    return fallback;
  };

  const onSend = async () => {
    try {
      await sendCampaign(id).unwrap();
      toast.success('Sending started — refreshing while it runs…');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not start send'));
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await deleteCampaign(id).unwrap();
      toast.success('Campaign deleted');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not delete campaign'));
    }
  };

  const canSend = detail.status === 'draft' || detail.status === 'scheduled';
  const canDelete = detail.status === 'draft';
  const sendDenominator = detail.stats.sent === 0 ? 1 : detail.stats.sent;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-[-0.011em] text-fg truncate">
              {detail.name}
            </h1>
            <StatusBadge status={detail.status} />
          </div>
          <p className="text-[13.5px] text-fg-muted mt-1.5">{detail.subject}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canSend && (
            <ActionButton
              onClick={onSend}
              loading={isSending}
              disabled={isSending}
              iconLeft={<Send />}
            >
              Send
            </ActionButton>
          )}
          {canDelete && (
            <ActionButton
              variant="destructive"
              onClick={onDelete}
              loading={isDeleting}
              disabled={isDeleting}
              iconLeft={<Trash2 />}
            >
              Delete
            </ActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Recipients" value={detail.stats.total.toLocaleString()} icon={Mail} />
        <StatCard
          label="Sent"
          value={detail.stats.sent.toLocaleString()}
          icon={CheckCircle2}
          iconClassName="text-status-sent"
        />
        <StatCard
          label="Failed"
          value={detail.stats.failed.toLocaleString()}
          icon={AlertCircle}
          iconClassName="text-status-failed"
        />
        <StatCard label="Opened" value={detail.stats.opened.toLocaleString()} icon={Eye} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ProgressBar
          label="Send rate"
          value={detail.stats.sent}
          total={detail.stats.total === 0 ? 1 : detail.stats.total}
          tone="success"
          helper={detail.stats.total === 0 ? 'No recipients yet' : undefined}
        />
        <ProgressBar
          label="Open rate"
          value={detail.stats.opened}
          total={sendDenominator}
          tone="accent"
          helper={detail.stats.sent === 0 ? 'No sends yet' : undefined}
        />
      </div>

      <Accordion type="multiple" defaultValue={['body', 'recipients']} className="space-y-2">
        <AccordionItem value="body">
          <AccordionTrigger>Body</AccordionTrigger>
          <AccordionContent>
            <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-fg-muted bg-surface-2 rounded-md p-4 mx-4 mb-4">
              {detail.body}
            </pre>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="recipients">
          <AccordionTrigger>Recipients ({detail.recipients.length})</AccordionTrigger>
          <AccordionContent>
            <ul className="divide-y divide-border border-t border-border">
              {detail.recipients.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-5 py-2.5 text-[13px]"
                >
                  <span className="text-fg truncate min-w-0">{r.email}</span>
                  <span className="shrink-0 text-fg-muted text-[12.5px] capitalize ml-4">
                    {r.status}
                  </span>
                </li>
              ))}
              {detail.recipients.length === 0 && (
                <li className="px-5 py-3 text-[13px] text-fg-muted">No recipients.</li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
