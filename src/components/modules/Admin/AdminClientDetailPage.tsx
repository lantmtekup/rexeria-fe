'use client';

/**
 * Admin detail page for a single customer (client). Loads everything that
 * belongs to the brand: workspaces, landing pages, blocks, products, and
 * members. Renders as a header + stats strip + tabbed body. Each tab loads
 * lazily so the initial paint only blocks on `/clients/{id}`.
 */

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  LayoutTemplate,
  Loader2,
  Mail,
  Package,
  Users,
  Users2,
} from 'lucide-react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  CanvasTemplate,
  Client,
  ClientUser,
  Product,
  SavedBlockServer,
  Workspace,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { gradientForId, initialsOf } from './_avatar';

interface Props {
  clientId: string;
}

type TabKey = 'workspaces' | 'landings' | 'blocks' | 'products' | 'members';

const TABS: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: 'workspaces', label: 'Workspaces', icon: Building2 },
  { id: 'landings', label: 'Landing pages', icon: LayoutTemplate },
  { id: 'blocks', label: 'Blocks', icon: Bookmark },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'members', label: 'Members', icon: Users },
];

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-rose-100 text-rose-700',
  inactive: 'bg-zinc-100 text-zinc-600',
};

interface Counts {
  workspaces?: number;
  landings?: number;
  blocks?: number;
  products?: number;
  members?: number;
}

export function AdminClientDetailPage({ clientId }: Props) {
  const [client, setClient] = React.useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<TabKey>('workspaces');
  const [copied, setCopied] = React.useState(false);

  // Counts driven by each tab loader as it completes
  const [counts, setCounts] = React.useState<Counts>({});

  React.useEffect(() => {
    let cancelled = false;
    setLoadingClient(true);
    setError(null);
    rexerApi.clients
      .get(clientId)
      .then(c => {
        if (cancelled) return;
        setClient(c);
      })
      .catch(err => {
        if (cancelled) return;
        setError(
          err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingClient(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const copyId = () => {
    navigator.clipboard.writeText(clientId).then(
      () => {
        setCopied(true);
        toast.success('Đã copy client ID');
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error('Copy thất bại')
    );
  };

  if (loadingClient && !client) {
    return (
      <div className='flex items-center justify-center p-16 text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className='mx-auto max-w-2xl p-8'>
        <Link
          href='/admin/users'
          className='inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900'
        >
          <ArrowLeft className='size-3.5' /> Quay lại
        </Link>
        <div className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <p className='text-[14px] font-semibold text-rose-900'>
            Không load được khách hàng
          </p>
          <p className='mt-1 font-mono text-[11px] text-rose-700'>
            {error || 'NOT_FOUND'}
          </p>
        </div>
      </div>
    );
  }

  const statusClass =
    STATUS_CHIP[client.status?.toLowerCase()] ?? 'bg-zinc-100 text-zinc-600';

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-5 p-6'>
      {/* Breadcrumb */}
      <Link
        href='/admin/users'
        className='group inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900 hover:text-zinc-900'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        Khách hàng
      </Link>

      {/* Header card */}
      <section className='relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-50/80 to-transparent'
        />
        <div className='relative flex flex-wrap items-start gap-5 p-6 sm:p-7'>
          <div
            className={cn(
              'flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-mono text-2xl font-bold text-white shadow-md',
              gradientForId(client.id)
            )}
          >
            {initialsOf(client.name)}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='truncate text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl'>
                {client.name}
              </h1>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10.5px] font-bold tracking-wider uppercase',
                  statusClass
                )}
              >
                {client.status || '—'}
              </span>
            </div>
            <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-500'>
              <button
                type='button'
                onClick={copyId}
                className='group inline-flex items-center gap-1.5 font-mono hover:text-zinc-900'
                title='Click để copy client ID'
              >
                <span>{client.id}</span>
                {copied ? (
                  <Check className='size-3 text-emerald-600' />
                ) : (
                  <Copy className='size-3 text-zinc-400 group-hover:text-zinc-700' />
                )}
              </button>
              <span className='inline-flex items-center gap-1.5'>
                <Calendar className='size-3' />
                Tạo {new Date(client.created_at).toLocaleDateString('vi-VN')}
              </span>
              {'owner_id' in client &&
                (client as { owner_id?: string }).owner_id && (
                  <span className='inline-flex items-center gap-1.5 font-mono'>
                    <Users2 className='size-3' />
                    Owner{' '}
                    {(client as { owner_id?: string }).owner_id?.slice(0, 8)}…
                  </span>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
        <StatCard
          label='Workspaces'
          icon={<Building2 className='size-3.5' />}
          value={counts.workspaces}
        />
        <StatCard
          label='Landing pages'
          icon={<LayoutTemplate className='size-3.5' />}
          value={counts.landings}
        />
        <StatCard
          label='Blocks'
          icon={<Bookmark className='size-3.5' />}
          value={counts.blocks}
        />
        <StatCard
          label='Products'
          icon={<Package className='size-3.5' />}
          value={counts.products}
        />
        <StatCard
          label='Members'
          icon={<Users className='size-3.5' />}
          value={counts.members}
        />
      </section>

      {/* Tabs */}
      <nav className='flex flex-wrap items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm'>
        {TABS.map(t => {
          const Icon = t.icon;
          const count = counts[t.id];
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type='button'
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                active
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100'
              )}
            >
              <Icon className='size-3.5' />
              {t.label}
              {typeof count === 'number' && (
                <span
                  className={cn(
                    'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 font-mono text-[10px] tabular-nums',
                    active
                      ? 'bg-white/15 text-white/90'
                      : 'bg-zinc-100 text-zinc-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab body */}
      <section className='rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        {tab === 'workspaces' && (
          <WorkspacesTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, workspaces: n }))}
          />
        )}
        {tab === 'landings' && (
          <LandingsTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, landings: n }))}
          />
        )}
        {tab === 'blocks' && (
          <BlocksTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, blocks: n }))}
          />
        )}
        {tab === 'products' && (
          <ProductsTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, products: n }))}
          />
        )}
        {tab === 'members' && (
          <MembersTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, members: n }))}
          />
        )}
      </section>
    </div>
  );
}

/* ─── Stat card ─────────────────────────────────────────────────────── */

function StatCard({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: number | undefined;
}) {
  return (
    <div className='rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm'>
      <div className='flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
        {icon}
        {label}
      </div>
      <div className='mt-1 font-mono text-2xl font-bold text-zinc-900 tabular-nums'>
        {value ?? <span className='text-zinc-300'>—</span>}
      </div>
    </div>
  );
}

/* ─── Tab: Workspaces ───────────────────────────────────────────────── */

function WorkspacesTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <LazyList<Workspace>
      load={() => rexerApi.workspaces.listForClient(clientId)}
      onCount={onCount}
      empty='Chưa có workspace nào'
      render={ws => (
        <div className='flex items-center justify-between border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50/50'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-lg bg-gradient-to-br font-mono text-[11px] font-bold text-white',
                gradientForId(ws.id)
              )}
            >
              {initialsOf(ws.name)}
            </div>
            <div>
              <div className='text-[13px] font-semibold text-zinc-900'>
                {ws.name}
                {ws.is_default && (
                  <span className='ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-emerald-700 uppercase'>
                    default
                  </span>
                )}
              </div>
              <div className='font-mono text-[10.5px] text-zinc-400'>
                {ws.slug ?? ws.id.slice(0, 12)}
              </div>
            </div>
          </div>
          <div className='font-mono text-[10.5px] text-zinc-400'>
            {ws.created_at
              ? new Date(ws.created_at).toLocaleDateString('vi-VN')
              : '—'}
          </div>
        </div>
      )}
    />
  );
}

/* ─── Tab: Landing pages ────────────────────────────────────────────── */

function LandingsTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <LazyList<CanvasTemplate>
      load={async () => {
        const r = await rexerApi.canvasTemplates.list({
          client_id: clientId,
          limit: 50,
        });
        return r;
      }}
      onCount={onCount}
      empty='Chưa có landing nào được assign cho khách hàng này'
      render={t => (
        <Link
          href={`/canvas-templates/${t.id}`}
          className='flex items-start gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50/50'
        >
          <div className='aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {t.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.thumbnail_url}
                alt={t.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex h-full items-center justify-center text-zinc-300'>
                <LayoutTemplate className='size-4' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='truncate text-[13px] font-semibold text-zinc-900'>
                {t.name}
              </span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase',
                  t.is_active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-zinc-100 text-zinc-500'
                )}
              >
                {t.is_active ? 'active' : 'inactive'}
              </span>
            </div>
            <div className='mt-0.5 font-mono text-[10px] text-zinc-400'>
              {t.id.slice(0, 12)}…
            </div>
          </div>
          <ExternalLink className='mt-1 size-3.5 text-zinc-300' />
        </Link>
      )}
    />
  );
}

/* ─── Tab: Blocks ───────────────────────────────────────────────────── */

function BlocksTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <LazyList<SavedBlockServer>
      load={() => rexerApi.savedBlocks.list({ client_id: clientId, limit: 50 })}
      onCount={onCount}
      empty='Khách hàng chưa save block nào lên thư viện'
      render={b => (
        <div className='flex items-start gap-3 border-b border-zinc-100 px-4 py-3 last:border-0'>
          <div className='aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {b.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.thumbnail_url}
                alt={b.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex h-full items-center justify-center text-zinc-300'>
                <Bookmark className='size-4' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-[13px] font-semibold text-zinc-900'>
              {b.name}
            </div>
            <div className='mt-0.5 flex flex-wrap items-center gap-2 text-[10.5px] text-zinc-500'>
              {b.scope && (
                <span className='rounded-full bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase'>
                  {b.scope}
                </span>
              )}
              {b.tags?.slice(0, 3).map(t => (
                <span
                  key={t}
                  className='rounded-full bg-zinc-50 px-1.5 py-0.5 text-[9.5px]'
                >
                  {t}
                </span>
              ))}
              {typeof b.usage_count === 'number' && (
                <span className='font-mono'>{b.usage_count} dùng</span>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}

/* ─── Tab: Products ─────────────────────────────────────────────────── */

function ProductsTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <LazyList<Product>
      load={() => rexerApi.products.list({ client_id: clientId, limit: 50 })}
      onCount={onCount}
      empty='Khách hàng chưa có product nào'
      render={p => (
        <div className='flex items-start gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 hover:bg-zinc-50/50'>
          <div className='aspect-square w-12 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {p.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.thumbnail_url}
                alt={p.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex h-full items-center justify-center text-zinc-300'>
                <Package className='size-4' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='truncate text-[13px] font-semibold text-zinc-900'>
              {p.name}
            </div>
            <div className='mt-0.5 flex flex-wrap items-center gap-2 text-[10.5px] text-zinc-500'>
              {p.sku && (
                <code className='font-mono text-[10px] text-zinc-600'>
                  {p.sku}
                </code>
              )}
              {p.status && (
                <span className='rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9.5px] tracking-wider uppercase'>
                  {p.status}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    />
  );
}

/* ─── Tab: Members ──────────────────────────────────────────────────── */

function MembersTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <LazyList<ClientUser>
      load={() => rexerApi.clients.users(clientId)}
      onCount={onCount}
      empty='Chưa có member nào trong workspace của khách hàng'
      render={u => (
        <div className='flex items-center justify-between border-b border-zinc-100 px-4 py-3 last:border-0'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-full bg-gradient-to-br font-mono text-[11px] font-bold text-white',
                gradientForId(u.id)
              )}
            >
              {initialsOf(u.display_name || u.email)}
            </div>
            <div>
              <div className='text-[13px] font-semibold text-zinc-900'>
                {u.display_name || '(không tên)'}
              </div>
              <div className='flex items-center gap-1.5 text-[10.5px] text-zinc-500'>
                <Mail className='size-2.5' />
                {u.email}
              </div>
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
              STATUS_CHIP[u.status?.toLowerCase()] ??
                'bg-zinc-100 text-zinc-600'
            )}
          >
            {u.status || '—'}
          </span>
        </div>
      )}
    />
  );
}

/* ─── LazyList helper ───────────────────────────────────────────────── */

interface ListResponse<T> {
  items?: T[] | null;
  total?: number;
}

function LazyList<T extends { id: string }>({
  load,
  render,
  empty,
  onCount,
}: {
  load: () => Promise<ListResponse<T>>;
  render: (item: T) => React.ReactNode;
  empty: string;
  onCount: (n: number) => void;
}) {
  const [items, setItems] = React.useState<T[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load()
      .then(r => {
        if (cancelled) return;
        const arr = r.items ?? [];
        setItems(arr);
        onCount(r.total ?? arr.length);
      })
      .catch(err => {
        if (cancelled) return;
        setError(
          err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12 text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
      </div>
    );
  }
  if (error) {
    return (
      <div className='px-4 py-6 text-center text-[12.5px] text-rose-700'>
        {error}
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className='px-4 py-10 text-center text-[13px] text-zinc-500'>
        {empty}
      </div>
    );
  }
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{render(item)}</div>
      ))}
    </div>
  );
}
