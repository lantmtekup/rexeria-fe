'use client';

/**
 * Admin detail page for a single brand. Loads everything that belongs to
 * the brand: workspaces, landing pages, blocks, products, and members.
 * Renders as a header + stats strip + tabbed body. Each tab loads lazily
 * so the initial paint only blocks on `/brands/{id}`.
 *
 * Migrated to canonical API in Wave 2 of FE canonical cutover
 * (docs/fe-canonical-cutover-migration-plan.md). Route prop is still
 * `clientId` for URL compatibility; internal state uses `Brand`.
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
  Globe,
  LayoutTemplate,
  Loader2,
  Mail,
  Megaphone,
  MoreVertical,
  MousePointerClick,
  Package,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  Users,
  Users2,
} from 'lucide-react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

import { AdminAddLandingForClientDialog } from './AdminAddLandingForClientDialog';
import { AdsTab } from './client-tabs/AdsTab';
import { CurateTab } from './client-tabs/CurateTab';
import { MicroSitesTab } from './client-tabs/MicroSitesTab';
import type {
  Block,
  Brand,
  BrandUser,
  Page,
  Product,
  Workspace,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

import { gradientForId, initialsOf } from './_avatar';

interface Props {
  clientId: string;
}

type TabKey =
  | 'workspaces'
  | 'landings'
  | 'blocks'
  | 'products'
  | 'members'
  | 'ads'
  | 'microsites'
  | 'curate';

const TABS: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: 'workspaces', label: 'Workspaces', icon: Building2 },
  { id: 'landings', label: 'Landing pages', icon: LayoutTemplate },
  { id: 'blocks', label: 'Blocks', icon: Bookmark },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'ads', label: 'Quảng cáo', icon: Megaphone },
  { id: 'microsites', label: 'Microsite', icon: Globe },
  { id: 'curate', label: 'Curate', icon: MousePointerClick },
];

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-rose-100 text-rose-700',
  inactive: 'bg-muted text-content-muted',
};

interface Counts {
  workspaces?: number;
  landings?: number;
  blocks?: number;
  products?: number;
  members?: number;
  ads?: number;
  microsites?: number;
  curate?: number;
}

export function AdminClientDetailPage({ clientId }: Props) {
  const [client, setClient] = React.useState<Brand | null>(null);
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
    rexerApi.brands
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
        toast.success('Đã copy brand ID');
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error('Copy thất bại')
    );
  };

  if (loadingClient && !client) {
    return (
      <div className='text-content-muted flex items-center justify-center p-16 text-sm'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className='mx-auto max-w-2xl p-8'>
        <Link
          href='/admin/users'
          className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm'
        >
          <ArrowLeft className='size-3.5' /> Quay lại
        </Link>
        <div className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <p className='text-sm font-semibold text-rose-900'>
            Không load được khách hàng
          </p>
          <p className='text-2xs mt-1 font-mono text-rose-700'>
            {error || 'NOT_FOUND'}
          </p>
        </div>
      </div>
    );
  }

  const statusClass =
    STATUS_CHIP[client.status?.toLowerCase()] ?? 'bg-muted text-content-muted';

  return (
    <div className='mx-auto flex max-w-6xl flex-col gap-5 p-6'>
      {/* Breadcrumb */}
      <Link
        href='/admin/users'
        className='group border-border text-content-muted hover:text-foreground inline-flex items-center gap-2 self-start rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        Khách hàng
      </Link>

      {/* Header card */}
      <section className='border-border relative overflow-hidden rounded-3xl border bg-white shadow-sm'>
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
              <h1 className='text-foreground truncate text-2xl font-bold tracking-tight sm:text-3xl'>
                {client.name}
              </h1>
              <span
                className={cn(
                  'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
                  statusClass
                )}
              >
                {client.status || '—'}
              </span>
            </div>
            <div className='text-content-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
              <button
                type='button'
                onClick={copyId}
                className='group hover:text-foreground inline-flex items-center gap-1.5 font-mono'
                title='Click để copy client ID'
              >
                <span>{client.id}</span>
                {copied ? (
                  <Check className='size-3 text-emerald-600' />
                ) : (
                  <Copy className='text-muted-foreground group-hover:text-content-muted size-3' />
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
      <nav className='border-border flex flex-wrap items-center gap-1 rounded-2xl border bg-white p-1 shadow-sm'>
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
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-content-muted hover:bg-muted'
              )}
            >
              <Icon className='size-3.5' />
              {t.label}
              {typeof count === 'number' && (
                <span
                  className={cn(
                    'text-3xs inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 font-mono tabular-nums',
                    active
                      ? 'bg-white/15 text-white/90'
                      : 'bg-muted text-content-muted'
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
      <section className='border-border rounded-2xl border bg-white shadow-sm'>
        {tab === 'workspaces' && (
          <WorkspacesTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, workspaces: n }))}
          />
        )}
        {tab === 'landings' && (
          <LandingsTab
            client={client}
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
        {tab === 'ads' && (
          <AdsTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, ads: n }))}
          />
        )}
        {tab === 'microsites' && (
          <MicroSitesTab
            clientId={clientId}
            onCount={n => setCounts(c => ({ ...c, microsites: n }))}
          />
        )}
        {tab === 'curate' && (
          <CurateTab onCount={n => setCounts(c => ({ ...c, curate: n }))} />
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
    <div className='border-border rounded-2xl border bg-white px-4 py-3 shadow-sm'>
      <div className='text-3xs text-content-muted flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase'>
        {icon}
        {label}
      </div>
      <div className='text-foreground mt-1 font-mono text-2xl font-bold tabular-nums'>
        {value ?? <span className='text-muted-foreground'>—</span>}
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
      load={() => rexerApi.brands.workspaces.list(clientId)}
      onCount={onCount}
      empty='Chưa có workspace nào'
      render={ws => (
        <div className='border-border hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 last:border-0'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'text-2xs flex size-9 items-center justify-center rounded-lg bg-gradient-to-br font-mono font-bold text-white',
                gradientForId(ws.id)
              )}
            >
              {initialsOf(ws.name)}
            </div>
            <div>
              <div className='text-foreground text-sm font-semibold'>
                {ws.name}
                {ws.is_default && (
                  <span className='text-3xs ml-2 rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold tracking-wider text-emerald-700 uppercase'>
                    default
                  </span>
                )}
              </div>
              <div className='text-3xs text-muted-foreground font-mono'>
                {ws.slug ?? ws.id.slice(0, 12)}
              </div>
            </div>
          </div>
          <div className='text-3xs text-muted-foreground font-mono'>
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
  client,
  onCount,
}: {
  client: Brand;
  onCount: (n: number) => void;
}) {
  const [items, setItems] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  // Pages are workspace-scoped in canonical API. List all brand's workspaces
  // then fan out one /workspaces/:wsId/pages call per workspace and merge.
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const wsRes = await rexerApi.brands.workspaces.list(client.id);
      const workspaces = wsRes.items ?? [];
      const pagesByWs = await Promise.all(
        workspaces.map(ws =>
          rexerApi.pages.list(ws.id, { type: 'landing', limit: 50 })
        )
      );
      const arr = pagesByWs.flatMap(r => r.items ?? []);
      setItems(arr);
      onCount(arr.length);
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (item: Page) => {
    if (
      !window.confirm(
        `Xoá landing "${item.name}"?\n\nLanding sẽ chuyển sang archived (có thể restore).`
      )
    )
      return;
    const tid = toast.loading('Đang archive…');
    try {
      await rexerApi.pages.archive(item.id);
      toast.success('Đã archive', { id: tid });
      load();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'DELETE_FAILED';
      toast.error(`Archive thất bại: ${msg}`, { id: tid });
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <div className='border-border flex items-center justify-between border-b px-4 py-3'>
        <div className='text-content-muted text-xs'>
          {loading
            ? 'Đang tải…'
            : `${items.length} landing đã assign cho khách`}
        </div>
        <button
          type='button'
          onClick={() => setAddOpen(true)}
          className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700'
        >
          <Plus className='size-3.5' />
          Tạo landing mới
        </button>
      </div>

      {error && (
        <div className='border-border border-b bg-rose-50 px-4 py-2 text-xs text-rose-800'>
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className='text-content-muted flex items-center justify-center py-12 text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
        </div>
      ) : items.length === 0 ? (
        <div className='text-content-muted px-4 py-10 text-center text-sm'>
          Khách hàng chưa có landing nào được assign — bấm{' '}
          <strong>Tạo landing mới</strong> để bắt đầu.
        </div>
      ) : (
        <div>
          {items.map(t => (
            <LandingRow
              key={t.id}
              item={t}
              onDelete={() => handleDelete(t)}
              onReload={load}
            />
          ))}
        </div>
      )}

      <AdminAddLandingForClientDialog
        open={addOpen}
        client={client}
        onClose={() => setAddOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}

function LandingRow({
  item,
  onDelete,
  onReload,
}: {
  item: Page;
  onDelete: () => void;
  onReload: () => void;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  // Canonical publish flow: POST /pages/:id/publish snapshots
  // page_revisions.config_json + canvas_blueprint into an immutable
  // page_releases row and flips status to 'published'. Unpublish
  // deactivates the release and reverts status to 'draft'.
  const togglePublish = async (publish: boolean) => {
    setMenuOpen(false);
    const tid = toast.loading(publish ? 'Đang publish…' : 'Đang unpublish…');
    try {
      if (publish) {
        await rexerApi.pages.publish(item.id);
      } else {
        await rexerApi.pages.unpublish(item.id);
      }
      toast.success(publish ? 'Đã publish landing' : 'Đã unpublish', {
        id: tid,
      });
      onReload();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'PUBLISH_FAILED';
      toast.error(`Thao tác thất bại: ${msg}`, { id: tid });
    }
  };

  return (
    <div className='border-border hover:bg-muted/50 flex items-start gap-3 border-b px-4 py-3 last:border-0'>
      <Link
        href={`/canvas-templates/${item.id}`}
        className='border-border aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md border bg-gradient-to-br from-zinc-100 to-zinc-200'
      >
        {item.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className='size-full object-cover'
          />
        ) : (
          <div className='text-muted-foreground flex h-full items-center justify-center'>
            <LayoutTemplate className='size-4' />
          </div>
        )}
      </Link>

      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <Link
            href={`/canvas-templates/${item.id}`}
            className='text-foreground truncate text-sm font-semibold hover:underline'
          >
            {item.name}
          </Link>
          <span
            className={cn(
              'text-3xs rounded-full px-1.5 py-0.5 font-bold tracking-wider uppercase',
              item.status === 'published'
                ? 'bg-emerald-100 text-emerald-700'
                : item.status === 'archived'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-muted text-content-muted'
            )}
          >
            {item.status}
          </span>
        </div>
        <div className='text-3xs text-muted-foreground mt-0.5 font-mono'>
          {item.id.slice(0, 12)}… ·{' '}
          {item.updated_at
            ? new Date(item.updated_at).toLocaleDateString('vi-VN')
            : '—'}
        </div>
      </div>

      {/* Action menu */}
      <div ref={menuRef} className='relative'>
        <button
          type='button'
          onClick={() => setMenuOpen(o => !o)}
          className='text-content-muted hover:bg-muted hover:text-foreground inline-flex size-7 items-center justify-center rounded-md'
          aria-label='Hành động'
        >
          <MoreVertical className='size-3.5' />
        </button>
        {menuOpen && (
          <div className='border-border absolute top-9 right-0 z-20 w-52 overflow-hidden rounded-lg border bg-white shadow-lg'>
            <Link
              href={`/canvas-templates/${item.id}`}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              onClick={() => setMenuOpen(false)}
            >
              <Pencil className='text-content-muted size-3.5' />
              Mở canvas editor
            </Link>
            <button
              type='button'
              onClick={() => togglePublish(true)}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              title='Publish landing — sinh share_token + URL public'
            >
              <Rocket className='size-3.5 text-emerald-600' />
              Publish
            </button>
            <button
              type='button'
              onClick={() => togglePublish(false)}
              className='text-content-muted hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
              title='Unpublish — invalidate share_token, URL 404'
            >
              <Rocket className='text-content-muted size-3.5 rotate-180' />
              Unpublish
            </button>
            <div className='bg-muted h-px' />
            <button
              type='button'
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
              Xoá landing
            </button>
          </div>
        )}
      </div>
    </div>
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
    <LazyList<Block>
      load={() =>
        rexerApi.blocks.list({
          brand_id: clientId,
          scope: 'brand_private',
          limit: 50,
        })
      }
      onCount={onCount}
      empty='Brand chưa save block nào lên thư viện'
      render={b => (
        <div className='border-border flex items-start gap-3 border-b px-4 py-3 last:border-0'>
          <div className='border-border aspect-[4/3] w-14 shrink-0 overflow-hidden rounded-md border bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {b.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={b.thumbnail_url}
                alt={b.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                <Bookmark className='size-4' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-foreground truncate text-sm font-semibold'>
              {b.name}
            </div>
            <div className='text-3xs text-content-muted mt-0.5 flex flex-wrap items-center gap-2'>
              {b.scope && (
                <span className='text-3xs bg-muted rounded-full px-1.5 py-0.5 font-mono tracking-wider uppercase'>
                  {b.scope}
                </span>
              )}
              {b.tags?.slice(0, 3).map(t => (
                <span
                  key={t}
                  className='text-3xs bg-muted rounded-full px-1.5 py-0.5'
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
      load={() => rexerApi.products.list({ brand_id: clientId, limit: 50 })}
      onCount={onCount}
      empty='Khách hàng chưa có product nào'
      render={p => (
        <div className='border-border hover:bg-muted/50 flex items-start gap-3 border-b px-4 py-3 last:border-0'>
          <div className='border-border aspect-square w-12 shrink-0 overflow-hidden rounded-md border bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {p.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.thumbnail_url}
                alt={p.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='text-muted-foreground flex h-full items-center justify-center'>
                <Package className='size-4' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-foreground truncate text-sm font-semibold'>
              {p.name}
            </div>
            <div className='text-3xs text-content-muted mt-0.5 flex flex-wrap items-center gap-2'>
              {p.sku && (
                <code className='text-3xs text-content-muted font-mono'>
                  {p.sku}
                </code>
              )}
              {p.status && (
                <span className='text-3xs bg-muted rounded-full px-1.5 py-0.5 tracking-wider uppercase'>
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
    <LazyList<BrandUser>
      load={() => rexerApi.brands.users(clientId)}
      onCount={onCount}
      empty='Chưa có member nào trong brand'
      render={u => (
        <div className='border-border flex items-center justify-between border-b px-4 py-3 last:border-0'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'text-2xs flex size-9 items-center justify-center rounded-full bg-gradient-to-br font-mono font-bold text-white',
                gradientForId(u.id)
              )}
            >
              {initialsOf(u.display_name || u.email)}
            </div>
            <div>
              <div className='text-foreground text-sm font-semibold'>
                {u.display_name || '(không tên)'}
              </div>
              <div className='text-3xs text-content-muted flex items-center gap-1.5'>
                <Mail className='size-2.5' />
                {u.email}
              </div>
            </div>
          </div>
          <span
            className={cn(
              'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
              STATUS_CHIP[u.status?.toLowerCase()] ??
                'bg-muted text-content-muted'
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
      <div className='text-content-muted flex items-center justify-center py-12 text-sm'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
      </div>
    );
  }
  if (error) {
    return (
      <div className='px-4 py-6 text-center text-xs text-rose-700'>{error}</div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className='text-content-muted px-4 py-10 text-center text-sm'>
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
