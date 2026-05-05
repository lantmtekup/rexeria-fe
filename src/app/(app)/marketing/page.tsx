'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import {
  CreateMarketingDialog,
  type MarketingDraft,
} from '@/components/modules/Marketing/CreateMarketingDialog';
import { TopTabBar } from '@/components/organisms/TopTabBar';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Campaign, Product } from '@/services/rexer/types';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// Hardcoded member set — BE doesn't expose marketing teams yet.
const MOCK_MEMBERS = [
  { name: 'Anh' },
  { name: 'Bình' },
  { name: 'Châu' },
  { name: 'Dũng' },
];

const STATUS_TONE: Record<string, { dot: string; label: string }> = {
  active: { dot: 'bg-emerald-500', label: 'Active' },
  draft: { dot: 'bg-neutral-400', label: 'Draft' },
  paused: { dot: 'bg-amber-500', label: 'Paused' },
  completed: { dot: 'bg-sky-500', label: 'Completed' },
  stop: { dot: 'bg-rose-500', label: 'Stop' },
};

function MarketingCard({
  campaign,
  product,
  onDelete,
  deleting,
}: {
  campaign: Campaign;
  product?: Product;
  onDelete: (c: Campaign) => void;
  deleting: boolean;
}) {
  const tone =
    STATUS_TONE[(campaign.status ?? 'draft').toLowerCase()] ??
    STATUS_TONE.draft;
  // Detail page lives in /product scope (where wizard's Launch redirects to).
  const href = `/product/${campaign.product_id}/marketing/${campaign.id}`;

  return (
    <Link
      href={href}
      className='border-border bg-muted/40 hover:border-primary group relative flex flex-col gap-4 rounded-2xl border p-5 transition-colors'
    >
      <button
        type='button'
        disabled={deleting}
        aria-label={`Xoá ${campaign.name}`}
        title='Xoá'
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(campaign);
        }}
        className='text-muted-foreground absolute top-3 right-3 flex size-7 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50'
      >
        <Trash2 className='size-3.5' />
      </button>
      <div className='pr-8'>
        <p className='text-foreground text-base font-semibold'>
          {campaign.name}
        </p>
        <p className='text-muted-foreground mt-0.5 text-xs'>
          Create: {formatDate(campaign.created_at)}
          {product?.name ? ` · ${product.name}` : ''}
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {/* Member column */}
        <div className='flex flex-col gap-2'>
          <span className='text-muted-foreground text-xs'>Member</span>
          <div className='flex items-center'>
            {MOCK_MEMBERS.slice(0, 3).map((m, i) => (
              <Avatar
                key={i}
                src=''
                name={m.name}
                size='xs'
                className={cn('border-background border-2', i > 0 && '-ml-2')}
              />
            ))}
            <span className='border-background -ml-2 inline-flex size-6 items-center justify-center rounded-full border-2 bg-neutral-900 text-[10px] font-semibold text-white'>
              {MOCK_MEMBERS.length}
            </span>
          </div>
        </div>

        {/* Campaign count */}
        <div className='flex flex-col gap-2'>
          <span className='text-muted-foreground text-xs'>Campaign</span>
          <span className='text-foreground text-2xl font-semibold tracking-[-0.02em]'>
            {String(campaign.channels?.length ?? 1).padStart(2, '0')}
          </span>
        </div>

        {/* Status */}
        <div className='flex flex-col gap-2'>
          <span className='text-muted-foreground text-xs'>Status</span>
          <span className='text-foreground inline-flex items-center gap-1.5 text-sm font-medium'>
            <span className={cn('size-2 shrink-0 rounded-full', tone.dot)} />
            {tone.label}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MarketingListPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [productMap, setProductMap] = React.useState<Record<string, Product>>(
    {}
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
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

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.campaigns.list({ limit: 50 });
      const items = r.items ?? [];
      setCampaigns(items);
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
      const map: Record<string, Product> = {};
      fetched.forEach(entry => {
        if (entry) map[entry[0]] = entry[1];
      });
      setProductMap(map);
    } catch (err) {
      const msg = rxErrorMessage(err);
      setError(msg);
      toast.error(`Không tải được danh sách: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async (draft: MarketingDraft) => {
    // BE chưa có resource Marketing — persist as N campaigns, mỗi campaign
    // 1 dòng trong dialog. Tên dạng "<marketing> — <campaign>" để khi list
    // user vẫn thấy nhóm theo prefix.
    // Cần product_id → dùng product đầu tiên của user.
    let productId: string | undefined;
    let clientId: string | undefined;
    try {
      const r = await rexerApi.products.list({ limit: 1 });
      const first = r.items?.[0];
      if (!first) {
        toast.error('Cần ít nhất 1 sản phẩm trước khi tạo marketing');
        return;
      }
      productId = first.id;
      clientId = first.client_id;
    } catch (err) {
      toast.error(`Không lấy được sản phẩm: ${rxErrorMessage(err)}`);
      return;
    }

    const status = draft.status === 'active' ? 'active' : 'paused';
    let okCount = 0;
    for (const cName of draft.campaigns) {
      try {
        await rexerApi.campaigns.create({
          name: `${draft.name} — ${cName}`,
          product_id: productId,
          client_id: clientId,
          status,
        });
        okCount++;
      } catch (err) {
        toast.error(`"${cName}" thất bại: ${rxErrorMessage(err)}`);
      }
    }
    if (okCount > 0) {
      toast.success(
        `Đã tạo "${draft.name}" với ${okCount}/${draft.campaigns.length} campaign`
      );
      await reload();
    }
  };

  return (
    <div className='flex h-full flex-1 flex-col'>
      <header className='border-border bg-background flex h-14 items-center justify-between gap-4 border-b px-4'>
        <div className='flex items-center gap-3'>
          <Button asChild variant='ghost' size='icon' aria-label='Quay lại'>
            <Link href='/home'>
              <ArrowLeft className='size-4' />
            </Link>
          </Button>
          <TopTabBar
            tabs={[
              { key: 'product', label: 'Product', href: '/product' },
              { key: 'marketing', label: 'Marketing', href: '/marketing' },
            ]}
            activeKey='marketing'
          />
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCreateOpen(true)}
          >
            <Plus className='size-3.5' />
            Add more Marketing
          </Button>
          <Button variant='primary' size='sm' disabled>
            Save
          </Button>
        </div>
      </header>

      <div className='mx-auto w-full max-w-[1200px] px-6 py-6'>
        {loading ? (
          <div className='text-muted-foreground flex justify-center py-16'>
            <Spinner size={20} />
          </div>
        ) : error ? (
          <EmptyState title='Không tải được danh sách' description={error} />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title='Chưa có marketing nào'
            description='Tạo marketing đầu tiên để bắt đầu chiến dịch.'
            actions={
              <Button variant='pill' onClick={() => setCreateOpen(true)}>
                <Plus className='size-3.5' /> Create Marketing
              </Button>
            }
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {campaigns.map(c => (
              <MarketingCard
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

      <CreateMarketingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
