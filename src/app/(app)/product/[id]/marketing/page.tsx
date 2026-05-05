'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Megaphone, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Campaign } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-neutral-200 text-neutral-700',
  active: 'bg-emerald-100 text-emerald-700',
  running: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  ended: 'bg-neutral-100 text-neutral-500',
};

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function CampaignTile({
  campaign,
  basePath,
}: {
  campaign: Campaign;
  basePath: string;
}) {
  const tone =
    (campaign.status && STATUS_TONE[campaign.status]) ??
    'bg-neutral-200 text-neutral-700';
  return (
    <Link
      href={`${basePath}/marketing/${campaign.id}`}
      className='border-border bg-background hover:border-primary group flex flex-col gap-3 rounded-xl border p-5 transition-colors'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate text-base font-semibold'>
            {campaign.name}
          </p>
          <p className='text-muted-foreground text-xs'>
            {campaign.objective ?? '—'} · {formatDate(campaign.created_at)}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${tone}`}
        >
          {campaign.status ?? 'draft'}
        </span>
      </div>
      <div className='flex flex-wrap items-center gap-1'>
        {(campaign.channels ?? []).slice(0, 4).map(c => (
          <Badge key={c} variant='secondary' className='capitalize'>
            {c}
          </Badge>
        ))}
        {(campaign.channels ?? []).length > 4 && (
          <span className='text-muted-foreground text-xs'>
            +{(campaign.channels ?? []).length - 4}
          </span>
        )}
      </div>
      <div className='text-muted-foreground flex items-center justify-between text-xs'>
        <span>
          Budget:{' '}
          <strong className='text-foreground'>
            {campaign.budget_amount != null
              ? `${campaign.budget_amount} ${campaign.budget_currency ?? 'USD'}`
              : '—'}
          </strong>
        </span>
        <span>{campaign.kpis?.length ?? 0} KPI(s)</span>
      </div>
    </Link>
  );
}

export default function ProductMarketingListPage({ params }: PageProps) {
  const { id } = use(params);
  const basePath = `/product/${id}`;
  const isNew = id === 'new';

  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(!isNew);

  React.useEffect(() => {
    if (isNew) return;
    let alive = true;
    setLoading(true);
    rexerApi.campaigns
      .list({ product_id: id, limit: 50 })
      .then(r => {
        if (alive) setCampaigns(r.items);
      })
      .catch(err => {
        if (alive)
          toast.error(`Failed to load campaigns: ${rxErrorMessage(err)}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName='Marketing'
      scope='product'
      section='marketing'
      actions={
        <>
          {!isNew && (
            <Button variant='ai' size='sm' asChild>
              <Link href={`/ai-agents/${id}/campaign`}>
                <Sparkles className='size-3.5' /> Plan with AI
              </Link>
            </Button>
          )}
          {!isNew && (
            <Button variant='pill' size='sm' asChild>
              <Link href={`${basePath}/marketing/new`}>
                <Plus className='size-3.5' /> New campaign
              </Link>
            </Button>
          )}
        </>
      }
    >
      <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
        {isNew ? (
          <EmptyState
            icon={<Megaphone className='size-10' />}
            title='Save the product first'
            description='Marketing campaigns are scoped to a product. Save your product before adding campaigns.'
          />
        ) : loading ? (
          <div className='text-muted-foreground flex justify-center py-16'>
            <Spinner size={20} />
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<Megaphone className='size-10' />}
            title='No campaigns yet'
            description='Plan your first campaign manually or let AI draft one for you.'
            actions={
              <>
                <Button variant='ai' asChild>
                  <Link href={`/ai-agents/${id}/campaign`}>
                    <Sparkles className='size-3.5' /> Plan with AI
                  </Link>
                </Button>
                <Button variant='pill' asChild>
                  <Link href={`${basePath}/marketing/new`}>
                    <Plus className='size-3.5' /> New campaign
                  </Link>
                </Button>
              </>
            }
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {campaigns.map(c => (
              <CampaignTile key={c.id} campaign={c} basePath={basePath} />
            ))}
          </div>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
