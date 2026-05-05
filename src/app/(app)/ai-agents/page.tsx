'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Globe,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Campaign, Product } from '@/services/rexer/types';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function AiOrb() {
  return (
    <div
      aria-hidden
      className='relative mx-auto size-48'
      style={{
        background:
          'radial-gradient(circle at 30% 30%, #c9f0ff 0%, #b9d8ff 30%, #d9c4ff 55%, transparent 70%)',
        filter: 'blur(8px)',
        borderRadius: '9999px',
      }}
    />
  );
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-sky-100 text-sky-700',
};

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

function CampaignCard({
  campaign,
  product,
  onDelete,
  deleting,
}: {
  campaign: Campaign;
  product?: Product;
  onDelete: (campaign: Campaign) => void;
  deleting: boolean;
}) {
  const tone = STATUS_TONE[campaign.status ?? 'draft'] ?? STATUS_TONE.draft;
  // Detail page lives in /product scope (where Launch flow redirects to).
  const href = `/product/${campaign.product_id}/marketing/${campaign.id}`;
  return (
    <Link
      href={href}
      className='border-border bg-background hover:border-primary group relative flex flex-col gap-3 rounded-xl border px-5 py-4 transition-colors'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='text-foreground truncate pr-6 text-base font-semibold'>
            {campaign.name}
          </p>
          {product?.name && (
            <p className='text-muted-foreground mt-0.5 truncate text-xs'>
              for {product.name}
            </p>
          )}
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
              tone
            )}
          >
            {campaign.status ?? 'draft'}
          </span>
          <button
            type='button'
            disabled={deleting}
            aria-label={`Xoá campaign ${campaign.name}`}
            title='Xoá campaign'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(campaign);
            }}
            className='text-muted-foreground flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50'
          >
            <Trash2 className='size-3.5' />
          </button>
        </div>
      </div>

      <div className='text-muted-foreground flex flex-wrap items-center gap-3 text-xs'>
        {campaign.objective && (
          <span className='inline-flex items-center gap-1 capitalize'>
            <Target className='size-3' /> {campaign.objective}
          </span>
        )}
        {campaign.channels && campaign.channels.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {campaign.channels.slice(0, 4).map(c => (
              <Badge key={c} variant='secondary' className='capitalize'>
                {c}
              </Badge>
            ))}
            {campaign.channels.length > 4 && (
              <span className='text-[10px]'>
                +{campaign.channels.length - 4}
              </span>
            )}
          </div>
        )}
        {campaign.tracked_url && (
          <span className='inline-flex items-center gap-1 text-emerald-700'>
            <Globe className='size-3' /> Live
          </span>
        )}
      </div>

      <div className='text-muted-foreground flex items-center justify-between border-t border-neutral-100 pt-3 text-xs'>
        <span>Tạo {formatDate(campaign.created_at)}</span>
        <span className='group-hover:text-primary inline-flex items-center gap-1 font-medium'>
          Mở <ArrowRight className='size-3' />
        </span>
      </div>
    </Link>
  );
}

export default function AiAgentsListPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [productMap, setProductMap] = React.useState<Record<string, Product>>(
    {}
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (c: Campaign) => {
    if (!window.confirm(`Xoá campaign "${c.name}"? Không thể hoàn tác.`))
      return;
    setDeletingId(c.id);
    try {
      await rexerApi.campaigns.remove(c.id);
      setCampaigns(prev => prev.filter(x => x.id !== c.id));
      toast.success(`Đã xoá "${c.name}"`);
    } catch (err) {
      toast.error(`Xoá thất bại: ${rxErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await rexerApi.campaigns.list({ limit: 50 });
        if (!alive) return;
        const items = r.items ?? [];
        setCampaigns(items);

        // Hydrate product names for unique product_ids in parallel.
        const ids = Array.from(new Set(items.map(c => c.product_id))).filter(
          Boolean
        );
        const fetched = await Promise.all(
          ids.map(id =>
            rexerApi.products.get(id).then(
              res => [id, res.product] as const,
              () => null
            )
          )
        );
        if (!alive) return;
        const map: Record<string, Product> = {};
        fetched.forEach(entry => {
          if (entry) map[entry[0]] = entry[1];
        });
        setProductMap(map);
      } catch (err) {
        if (!alive) return;
        const msg = rxErrorMessage(err);
        setError(msg);
        toast.error(`Không tải được danh sách: ${msg}`);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className='mx-auto w-full max-w-[1100px] px-6 py-8'>
      <header className='mb-6 flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
            <Sparkles className='-mt-1 mr-2 inline size-5' />
            AI-Agents
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Lịch sử mỗi lần chạy wizard — mỗi entry là 1 campaign đã launch.
          </p>
        </div>
        <Button asChild variant='pill' size='md'>
          <Link href='/ai-agents/start'>
            <Plus className='size-4' /> Create new agent
          </Link>
        </Button>
      </header>

      {loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : error ? (
        <EmptyState
          icon={<Sparkles className='size-10' />}
          title='Không tải được danh sách'
          description={error}
        />
      ) : campaigns.length === 0 ? (
        <div className='flex flex-col items-center gap-6 py-12'>
          <AiOrb />
          <EmptyState
            title='Chưa có agent nào'
            description={<>Tạo agent đầu tiên — wizard dẫn qua 4 step.</>}
            actions={
              <Button asChild variant='pill' size='md'>
                <Link href='/ai-agents/start'>
                  <Plus className='size-4' /> Create new agent
                </Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {campaigns.map(c => (
            <CampaignCard
              key={c.id}
              campaign={c}
              product={productMap[c.product_id]}
              onDelete={handleDelete}
              deleting={deletingId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
