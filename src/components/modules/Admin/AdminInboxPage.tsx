'use client';

/**
 * Staff workload inbox — `/admin/inbox`.
 *
 * Lists items requiring staff action (new comment, publish request, brand
 * onboarding, ...). Staff can "Take" (claim) → "Done" (mark resolved).
 *
 * Endpoints (already wired in rexerApi.staffInbox):
 *   GET  /v1/admin/inbox?status=&kind=&assignee_id=
 *   POST /v1/admin/inbox/{id}/take
 *   POST /v1/admin/inbox/{id}/done
 */

import * as React from 'react';
import {
  CheckCircle2,
  Filter,
  Inbox,
  Loader2,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { StaffInboxItem } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type StatusFilter = 'all' | 'open' | 'claimed' | 'done';

const KIND_META: Record<string, { label: string; icon: string; chip: string }> =
  {
    comment_new: {
      label: 'Comment mới',
      icon: '💬',
      chip: 'bg-rose-100 text-rose-700',
    },
    publish_request: {
      label: 'Yêu cầu publish',
      icon: '🚀',
      chip: 'bg-emerald-100 text-emerald-700',
    },
    brand_onboard: {
      label: 'Onboard brand',
      icon: '🏢',
      chip: 'bg-blue-100 text-blue-700',
    },
    workspace_setup: {
      label: 'Setup workspace',
      icon: '📂',
      chip: 'bg-violet-100 text-violet-700',
    },
    feedback_review: {
      label: 'Review feedback',
      icon: '✍️',
      chip: 'bg-amber-100 text-amber-700',
    },
  };

const STATUS_META: Record<string, { label: string; chip: string }> = {
  open: {
    label: 'Mở',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  claimed: {
    label: 'Đang xử lý',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  done: {
    label: 'Xong',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function relativeTime(iso?: string): string {
  if (!iso) return '-';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diffMin = Math.round((Date.now() - t) / 60_000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  return `${Math.round(diffH / 24)} ngày trước`;
}

export function AdminInboxPage() {
  const [items, setItems] = React.useState<StaffInboxItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('open');
  const [kindFilter, setKindFilter] = React.useState<string>('all');
  const [acting, setActing] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await rexerApi.staffInbox.list({
        status: statusFilter === 'all' ? undefined : statusFilter,
        kind: kindFilter === 'all' ? undefined : kindFilter,
      });
      setItems(r.items ?? []);
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, kindFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const counts = React.useMemo(() => {
    const m = { open: 0, claimed: 0, done: 0 };
    for (const it of items) {
      const s = it.status as 'open' | 'claimed' | 'done';
      if (s in m) m[s] += 1;
    }
    return m;
  }, [items]);

  const distinctKinds = React.useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(it.kind);
    return Array.from(s).sort();
  }, [items]);

  const handleTake = async (id: string) => {
    setActing(id);
    try {
      const updated = await rexerApi.staffInbox.take(id);
      setItems(prev => prev.map(it => (it.id === id ? updated : it)));
      toast.success('Đã nhận item, bắt đầu xử lý');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'TAKE_FAILED';
      toast.error(`Nhận thất bại: ${msg}`);
    } finally {
      setActing(null);
    }
  };

  const handleDone = async (id: string) => {
    setActing(id);
    try {
      const updated = await rexerApi.staffInbox.done(id);
      setItems(prev => prev.map(it => (it.id === id ? updated : it)));
      toast.success('Đã đóng item');
    } catch (err) {
      const msg =
        err instanceof RxApiError ? err.code || err.message : 'DONE_FAILED';
      toast.error(`Đóng thất bại: ${msg}`);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className='flex flex-col gap-4 p-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <div className='text-3xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
            <Inbox className='size-3' /> Staff inbox
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Workload queue
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Items yêu cầu Rexer staff xử lý: comment mới, publish request,
            onboard brand, v.v. Click <strong>Nhận</strong> để claim →{' '}
            <strong>Đóng</strong> khi xong.
          </p>
        </div>
        <Button
          type='button'
          variant='neutral'
          size='sm'
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats strip */}
      <div className='grid grid-cols-3 gap-3'>
        <StatCard
          label='Open'
          value={counts.open}
          icon={<Inbox className='size-3.5' />}
          accent='amber'
        />
        <StatCard
          label='Đang xử lý'
          value={counts.claimed}
          icon={<UserCheck className='size-3.5' />}
          accent='blue'
        />
        <StatCard
          label='Đã đóng'
          value={counts.done}
          icon={<CheckCircle2 className='size-3.5' />}
          accent='emerald'
        />
      </div>

      {/* Filters */}
      <div className='border-border bg-card flex flex-wrap items-center gap-2 rounded-2xl border p-2 shadow-sm'>
        <span className='text-3xs text-muted-foreground inline-flex items-center gap-1 px-2 font-semibold tracking-[0.18em] uppercase'>
          <Filter className='size-3' /> Status
        </span>
        {(['all', 'open', 'claimed', 'done'] as const).map(s => (
          <Chip
            key={s}
            size='sm'
            selected={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'Tất cả' : (STATUS_META[s]?.label ?? s)}
          </Chip>
        ))}

        {distinctKinds.length > 0 && (
          <>
            <span className='bg-border ml-2 hidden h-4 w-px sm:block' />
            <span className='text-3xs text-muted-foreground inline-flex items-center gap-1 px-2 font-semibold tracking-[0.18em] uppercase'>
              Kind
            </span>
            <select
              value={kindFilter}
              onChange={e => setKindFilter(e.target.value)}
              className='text-2xs border-border text-content-muted hover:bg-muted bg-background rounded-lg border px-2 py-1 font-medium outline-none'
            >
              <option value='all'>Tất cả</option>
              {distinctKinds.map(k => (
                <option key={k} value={k}>
                  {KIND_META[k]?.label ?? k}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {error && (
        <div className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-xs'>
          {error}
        </div>
      )}

      {/* List */}
      {loading && items.length === 0 ? (
        <div className='text-content-muted flex items-center justify-center py-16 text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải inbox…
        </div>
      ) : items.length === 0 ? (
        <div className='border-border bg-card rounded-2xl border border-dashed p-12 text-center'>
          <Inbox className='text-muted-foreground mx-auto size-8' />
          <p className='text-content-muted mt-3 text-sm font-semibold'>
            Inbox sạch
          </p>
          <p className='text-content-muted mt-1 text-xs'>
            Không có item nào khớp filter, staff team đã catch up.
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {items.map(item => (
            <InboxRow
              key={item.id}
              item={item}
              acting={acting === item.id}
              onTake={() => handleTake(item.id)}
              onDone={() => handleDone(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Row ────────────────────────────────────────────────────────────── */

function InboxRow({
  item,
  acting,
  onTake,
  onDone,
}: {
  item: StaffInboxItem;
  acting: boolean;
  onTake: () => void;
  onDone: () => void;
}) {
  const kind = KIND_META[item.kind] ?? {
    label: item.kind,
    icon: '📌',
    chip: 'bg-muted text-content-muted',
  };
  const status = STATUS_META[item.status] ?? {
    label: item.status,
    chip: 'bg-muted text-content-muted border-border',
  };
  const subject = (item.meta as { subject?: string } | undefined)?.subject;
  const summary = (item.meta as { summary?: string } | undefined)?.summary;
  return (
    <div className='border-border bg-card flex flex-wrap items-start gap-3 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md'>
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-sm',
          kind.chip
        )}
      >
        <span aria-hidden>{kind.icon}</span>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-foreground text-sm font-semibold'>
            {subject ?? kind.label}
          </span>
          <span
            className={cn(
              'text-3xs inline-flex items-center rounded-full border px-1.5 py-0.5 font-bold tracking-wider uppercase',
              status.chip
            )}
          >
            {status.label}
          </span>
          <span className='text-3xs bg-muted text-content-muted inline-flex items-center rounded-full px-1.5 py-0.5 font-mono'>
            {item.kind}
          </span>
        </div>
        {summary && (
          <p className='text-content-muted mt-1 line-clamp-2 text-xs'>
            {summary}
          </p>
        )}
        <div className='text-3xs text-content-muted mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5'>
          <span>Tạo {relativeTime(item.created_at)}</span>
          {item.claimed_at && (
            <span>· Nhận {relativeTime(item.claimed_at)}</span>
          )}
          {item.done_at && <span>· Đóng {relativeTime(item.done_at)}</span>}
          {item.brand_id && (
            <span className='font-mono'>
              · brand <code>{item.brand_id.slice(0, 8)}…</code>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-2'>
        {item.status === 'open' && (
          <button
            type='button'
            onClick={onTake}
            disabled={acting}
            className='bg-foreground text-background hover:bg-foreground/85 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium disabled:cursor-wait disabled:opacity-60'
          >
            {acting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <UserCheck className='size-3.5' />
            )}
            Nhận
          </button>
        )}
        {item.status === 'claimed' && (
          <button
            type='button'
            onClick={onDone}
            disabled={acting}
            className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60'
          >
            {acting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <CheckCircle2 className='size-3.5' />
            )}
            Đóng
          </button>
        )}
        {item.status === 'done' && (
          <span className='inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700'>
            <CheckCircle2 className='size-3.5' />
            Đã đóng
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: 'amber' | 'blue' | 'emerald';
}) {
  const palette: Record<typeof accent, string> = {
    amber: 'border-amber-100 bg-amber-50/40 text-amber-700',
    blue: 'border-blue-100 bg-blue-50/40 text-blue-700',
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
  };
  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 shadow-sm', palette[accent])}
    >
      <div className='text-3xs flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='text-foreground mt-1 font-mono text-xl font-bold tabular-nums'>
        {value}
      </div>
    </div>
  );
}
