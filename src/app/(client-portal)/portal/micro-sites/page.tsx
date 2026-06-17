'use client';

import {
  BarChart3,
  ExternalLink,
  Globe,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';

import { fmtNum } from '../_data';
import { PortalShell } from '../_shell';
import { CreateMicroSiteDialog } from './_CreateMicroSiteDialog';
import {
  STATUS_META,
  gradientFor,
  statusMeta,
  type MicroSite,
  type MicroSiteStatus,
} from './_data';

type StatusFilter = 'all' | MicroSiteStatus;

/**
 * Danh sách micro-site (site Rexer code riêng cho khách, domain riêng). Wire API
 * thật `rexerApi.microSites.*`: list + CRUD (tạo/sửa/xoá). Click 1 site → trang
 * analytics riêng `/portal/micro-sites/[id]`.
 */
export default function PortalMicroSitesPage() {
  const t = useTranslations('portal');
  const [sites, setSites] = useState<MicroSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MicroSite | null>(null);

  // brand_id để tạo mới: lấy từ workspace mặc định của user (create cần brand_id).
  const memberships = useRexer(() => rexerApi.workspaces.myMemberships(), []);
  const brandId = useMemo(() => {
    const ws = (memberships.data ?? []).map(m => m.workspace);
    return (ws.find(w => w.is_default) ?? ws[0])?.brand_id ?? '';
  }, [memberships.data]);

  useEffect(() => {
    let cancelled = false;
    rexerApi.microSites
      .list({ limit: 100 })
      .then(res => !cancelled && setSites(res.items ?? []))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const live = sites.filter(s => s.status === 'live').length;
    const dev = sites.filter(s => s.status === 'dev').length;
    const views = sites.reduce((a, s) => a + (s.views_30d ?? 0), 0);
    return { total: sites.length, live, dev, views };
  }, [sites]);

  const filtered = sites.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.url.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (s: MicroSite) => {
    setEditing(s);
    setDialogOpen(true);
  };
  const handleSaved = (s: MicroSite) =>
    setSites(prev => {
      const i = prev.findIndex(x => x.id === s.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = s;
        return next;
      }
      return [s, ...prev];
    });
  const handleDelete = async (s: MicroSite) => {
    if (!window.confirm(t('microSites.confirmDelete', { name: s.name })))
      return;
    try {
      await rexerApi.microSites.remove(s.id);
      setSites(prev => prev.filter(x => x.id !== s.id));
      toast.success(t('microSites.deletedToast', { name: s.name }));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('microSites.deleteFailed')
      );
    }
  };

  return (
    <PortalShell>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <Globe className='size-3' /> {t('microSites.eyebrow')}
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            {t('microSites.title')}
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            {t('microSites.subtitle')}
          </p>
        </div>
        <Button size='sm' onClick={openCreate}>
          <Plus className='size-3.5' /> {t('microSites.addBtn')}
        </Button>
      </section>

      {/* Stats */}
      <section className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label={t('microSites.statTotal')}
          value={String(stats.total)}
        />
        <StatCard
          label={t('microSites.statLive')}
          value={String(stats.live)}
          accent='emerald'
        />
        <StatCard
          label={t('microSites.statDev')}
          value={String(stats.dev)}
          accent='amber'
        />
        <StatCard
          label={t('microSites.statViews30d')}
          value={fmtNum(stats.views)}
        />
      </section>

      {/* Filter */}
      <div className='border-border bg-card mt-5 flex flex-wrap items-center gap-3 rounded-2xl border p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-content-muted size-3.5' />
          <input
            type='text'
            placeholder={t('microSites.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {(['all', 'live', 'dev', 'paused'] as StatusFilter[]).map(f => (
            <FilterBtn
              key={f}
              label={
                f === 'all' ? t('microSites.filterAll') : STATUS_META[f].label
              }
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className='text-content-muted mt-10 flex items-center justify-center gap-2 text-sm'>
          <Loader2 className='size-4 animate-spin' /> {t('microSites.loading')}
        </div>
      ) : (
        <section className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.length === 0 ? (
            <div className='border-border text-content-muted bg-card col-span-full rounded-2xl border border-dashed p-12 text-center text-sm'>
              {sites.length === 0
                ? t('microSites.emptyNone')
                : t('microSites.emptyFilter')}
            </div>
          ) : (
            filtered.map(s => (
              <SiteCard
                key={s.id}
                site={s}
                onEdit={() => openEdit(s)}
                onDelete={() => handleDelete(s)}
              />
            ))
          )}
        </section>
      )}

      <CreateMicroSiteDialog
        open={dialogOpen}
        site={editing}
        brandId={brandId}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />
    </PortalShell>
  );
}

function SiteCard({
  site,
  onEdit,
  onDelete,
}: {
  site: MicroSite;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('portal');
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = statusMeta(site.status);
  const up = site.views_trend_pct >= 0;

  return (
    <div className='group border-border bg-card overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Cover */}
      <Link
        href={`/portal/micro-sites/${site.id}`}
        className={cn(
          'relative flex aspect-[16/8] items-center justify-center bg-gradient-to-br',
          site.thumbnail_url ? '' : gradientFor(site.id)
        )}
      >
        {site.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={site.thumbnail_url}
            alt={site.name}
            className='absolute inset-0 h-full w-full object-cover'
          />
        ) : (
          <Globe className='size-8 text-white/70' />
        )}
        <span
          className={cn(
            'text-3xs absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 font-bold backdrop-blur',
            meta.chip
          )}
        >
          <span className={cn('size-1.5 rounded-full', meta.dot)} />{' '}
          {meta.label}
        </span>
      </Link>

      {/* Body */}
      <div className='p-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <h3 className='truncate text-sm font-bold tracking-tight'>
              {site.name}
            </h3>
            {site.url ? (
              <a
                href={site.url}
                target='_blank'
                rel='noreferrer'
                onClick={e => e.stopPropagation()}
                className='text-content-muted hover:text-primary text-3xs mt-0.5 inline-flex items-center gap-1 font-mono'
              >
                <ExternalLink className='size-2.5' />
                {site.url.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span className='text-3xs text-content-muted mt-0.5 inline-block'>
                {t('microSites.noUrl')}
              </span>
            )}
          </div>
          <div className='relative'>
            <button
              onClick={() => setMenuOpen(o => !o)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className='text-content-muted hover:bg-muted rounded p-1'
              aria-label={t('microSites.optionsAria')}
            >
              <MoreVertical className='size-4' />
            </button>
            {menuOpen && (
              <div className='border-border bg-card absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border shadow-lg'>
                <button
                  onClick={onEdit}
                  className='hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
                >
                  <Pencil className='size-3' /> {t('microSites.edit')}
                </button>
                <button
                  onClick={onDelete}
                  className='text-destructive hover:bg-danger-bg flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
                >
                  <Trash2 className='size-3' /> {t('microSites.delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Views */}
        <div className='border-border mt-3 flex items-center gap-2 border-t py-2'>
          <span className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
            {t('microSites.views30d')}
          </span>
          <span className='font-mono text-sm font-bold'>
            {site.views_30d ? fmtNum(site.views_30d) : '-'}
          </span>
          {site.views_30d > 0 && (
            <span
              className={cn(
                'text-3xs ml-auto inline-flex items-center gap-0.5 font-semibold',
                up ? 'text-emerald-600' : 'text-destructive'
              )}
            >
              {up ? (
                <TrendingUp className='size-3' />
              ) : (
                <TrendingDown className='size-3' />
              )}
              {up ? '+' : ''}
              {site.views_trend_pct}%
            </span>
          )}
        </div>

        <Link
          href={`/portal/micro-sites/${site.id}`}
          className='bg-foreground hover:bg-foreground/85 text-background mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium'
        >
          <BarChart3 className='size-3.5' /> {t('microSites.viewAnalytics')}
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'emerald' | 'amber';
}) {
  return (
    <div className='border-border bg-card rounded-2xl border px-4 py-3 shadow-sm'>
      <div className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
        {label}
      </div>
      <div
        className={cn(
          'mt-1 font-mono text-xl font-bold tabular-nums',
          accent === 'emerald' && 'text-emerald-600',
          accent === 'amber' && 'text-amber-600'
        )}
      >
        {value}
      </div>
    </div>
  );
}

function FilterBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip size='sm' selected={active} onClick={onClick}>
      {label}
    </Chip>
  );
}
