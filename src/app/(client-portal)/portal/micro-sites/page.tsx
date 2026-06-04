'use client';

import {
  BarChart3,
  ExternalLink,
  Globe,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';

import { fmtNum } from '../_data';
import { PortalShell } from '../_shell';
import { CreateMicroSiteDialog } from './_CreateMicroSiteDialog';
import {
  FAKE_MICROSITES,
  STATUS_META,
  type MicroSite,
  type MicroSiteStatus,
} from './_data';

type StatusFilter = 'all' | MicroSiteStatus;

export default function PortalMicroSitesPage() {
  const [sites, setSites] = useState<MicroSite[]>(FAKE_MICROSITES);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MicroSite | null>(null);

  const stats = useMemo(() => {
    const live = sites.filter(s => s.status === 'live').length;
    const dev = sites.filter(s => s.status === 'dev').length;
    const views = sites.reduce((a, s) => a + s.views_30d, 0);
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
  const handleSave = (s: MicroSite) =>
    setSites(prev => {
      const i = prev.findIndex(x => x.id === s.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = s;
        return next;
      }
      return [s, ...prev];
    });
  const handleDelete = (s: MicroSite) => {
    if (!window.confirm(`Xoá micro site "${s.name}"?`)) return;
    setSites(prev => prev.filter(x => x.id !== s.id));
    toast.success(`Đã xoá "${s.name}"`);
  };

  return (
    <PortalShell>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <Globe className='size-3' /> Micro site
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>Micro site</h1>
          <p className='text-content-muted mt-1 text-sm'>
            Site Rexer code riêng cho khách (domain riêng). Click 1 site để xem
            analytics.
          </p>
        </div>
        <button
          onClick={openCreate}
          className='bg-primary hover:bg-primary-dark inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white shadow-sm'
        >
          <Plus className='size-3.5' /> Thêm micro site
        </button>
      </section>

      <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800'>
        <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
        <span>
          Demo data — BE chưa ship <code>/v1/portal/micro-sites</code> +
          analytics (Rexer tự track qua script nhúng). UI sẵn sàng wire khi BE
          có endpoint.
        </span>
      </div>

      {/* Stats */}
      <section className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard label='Tổng site' value={String(stats.total)} />
        <StatCard label='Live' value={String(stats.live)} accent='emerald' />
        <StatCard label='Đang dev' value={String(stats.dev)} accent='amber' />
        <StatCard label='Views / 30d' value={fmtNum(stats.views)} />
      </section>

      {/* Filter */}
      <div className='border-border mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-content-muted size-3.5' />
          <input
            type='text'
            placeholder='Tìm tên / domain…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='placeholder:text-content-muted flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {(['all', 'live', 'dev', 'paused'] as StatusFilter[]).map(f => (
            <FilterBtn
              key={f}
              label={f === 'all' ? 'Tất cả' : STATUS_META[f].label}
              active={filter === f}
              onClick={() => setFilter(f)}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filtered.length === 0 ? (
          <div className='border-border text-content-muted col-span-full rounded-2xl border border-dashed bg-white p-12 text-center text-sm'>
            Không có micro site nào khớp filter.
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

      <CreateMicroSiteDialog
        open={dialogOpen}
        site={editing}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
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
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = STATUS_META[site.status];
  const up = site.views_trend_pct >= 0;

  return (
    <div className='group border-border overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Cover */}
      <Link
        href={`/portal/micro-sites/${site.id}`}
        className={cn(
          'relative flex aspect-[16/8] items-center justify-center bg-gradient-to-br',
          site.cover_gradient
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
                chưa có URL
              </span>
            )}
          </div>
          <div className='relative'>
            <button
              onClick={() => setMenuOpen(o => !o)}
              onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
              className='text-content-muted hover:bg-muted rounded p-1'
              aria-label='Tuỳ chọn'
            >
              <MoreVertical className='size-4' />
            </button>
            {menuOpen && (
              <div className='border-border absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border bg-white shadow-lg'>
                <button
                  onClick={onEdit}
                  className='hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-xs'
                >
                  <Pencil className='size-3' /> Sửa
                </button>
                <button
                  onClick={onDelete}
                  className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50'
                >
                  <Trash2 className='size-3' /> Xoá
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Views */}
        <div className='border-border mt-3 flex items-center gap-2 border-t py-2'>
          <span className='text-2xs text-content-muted font-semibold tracking-wider uppercase'>
            Views 30d
          </span>
          <span className='font-mono text-sm font-bold'>
            {site.views_30d ? fmtNum(site.views_30d) : '—'}
          </span>
          {site.views_30d > 0 && (
            <span
              className={cn(
                'text-3xs ml-auto inline-flex items-center gap-0.5 font-semibold',
                up ? 'text-emerald-600' : 'text-rose-600'
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
          className='bg-foreground hover:bg-foreground/85 mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white'
        >
          <BarChart3 className='size-3.5' /> Xem analytics
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
    <div className='border-border rounded-2xl border bg-white px-4 py-3 shadow-sm'>
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
    <button
      onClick={onClick}
      className={cn(
        'text-2xs rounded-full px-2.5 py-1 font-medium transition-all',
        active
          ? 'bg-foreground text-white shadow-sm'
          : 'border-border text-content-muted hover:bg-muted border bg-white'
      )}
    >
      {label}
    </button>
  );
}
