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
  if (!iso) return '—';
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
      toast.success('Đã nhận item — bắt đầu xử lý');
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
          <div className='flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            <Inbox className='size-3' /> Staff inbox
          </div>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
            Workload queue
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Items yêu cầu Rexer staff xử lý — comment mới, publish request,
            onboard brand, v.v. Click <strong>Nhận</strong> để claim →{' '}
            <strong>Đóng</strong> khi xong.
          </p>
        </div>
        <button
          type='button'
          onClick={load}
          disabled={loading}
          className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50'
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </button>
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
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <span className='inline-flex items-center gap-1 px-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
          <Filter className='size-3' /> Status
        </span>
        {(['all', 'open', 'claimed', 'done'] as const).map(s => (
          <button
            key={s}
            type='button'
            onClick={() => setStatusFilter(s)}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors',
              statusFilter === s
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
            )}
          >
            {s === 'all' ? 'Tất cả' : (STATUS_META[s]?.label ?? s)}
          </button>
        ))}

        {distinctKinds.length > 0 && (
          <>
            <span className='ml-2 hidden h-4 w-px bg-zinc-200 sm:block' />
            <span className='inline-flex items-center gap-1 px-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
              Kind
            </span>
            <select
              value={kindFilter}
              onChange={e => setKindFilter(e.target.value)}
              className='rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 outline-none hover:bg-zinc-50'
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
        <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
          {error}
        </div>
      )}

      {/* List */}
      {loading && items.length === 0 ? (
        <div className='flex items-center justify-center py-16 text-sm text-zinc-500'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải inbox…
        </div>
      ) : items.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
          <Inbox className='mx-auto size-8 text-zinc-300' />
          <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
            Inbox sạch
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            Không có item nào khớp filter — staff team đã catch up.
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
    chip: 'bg-zinc-100 text-zinc-700',
  };
  const status = STATUS_META[item.status] ?? {
    label: item.status,
    chip: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  };
  const subject = (item.meta as { subject?: string } | undefined)?.subject;
  const summary = (item.meta as { summary?: string } | undefined)?.summary;
  return (
    <div className='flex flex-wrap items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'>
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
          <span className='text-[13px] font-semibold text-zinc-900'>
            {subject ?? kind.label}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
              status.chip
            )}
          >
            {status.label}
          </span>
          <span className='inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-600'>
            {item.kind}
          </span>
        </div>
        {summary && (
          <p className='mt-1 line-clamp-2 text-[12px] text-zinc-600'>
            {summary}
          </p>
        )}
        <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] text-zinc-500'>
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
            className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60'
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
      <div className='flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='mt-1 font-mono text-xl font-bold text-zinc-900 tabular-nums'>
        {value}
      </div>
    </div>
  );
}
