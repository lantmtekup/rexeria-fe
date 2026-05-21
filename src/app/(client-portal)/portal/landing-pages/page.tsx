'use client';

import {
  Eye,
  ExternalLink,
  LayoutTemplate,
  MessageSquare,
  Search,
  Send,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { FAKE_TEMPLATES, fmtNum, type PortalTemplate } from '../_data';
import { ApiStatusLabel, loadTemplates } from '../_remote';
import { PortalShell } from '../_shell';
import { useActiveWorkspace } from '../_workspace';

const STATUS_META = {
  published: {
    label: '✓ Published',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  draft: {
    label: 'Draft',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  archived: {
    label: 'Archived',
    chip: 'bg-zinc-100 text-zinc-600',
    dot: 'bg-zinc-400',
  },
};

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

export default function PortalTemplatesPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const activeWs = useActiveWorkspace();
  const [templates, setTemplates] = useState<PortalTemplate[]>(FAKE_TEMPLATES);
  const [source, setSource] = useState<'live' | 'fake'>('fake');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    loadTemplates().then(res => {
      if (cancelled) return;
      setTemplates(res.data);
      setSource(res.source);
      setLoadError(res.error);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scopedTemplates = templates.filter(
    t => !t.workspace_id || t.workspace_id === activeWs.id
  );
  const filtered = scopedTemplates.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <PortalShell>
      <section className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
            <LayoutTemplate className='size-3' /> Landing pages
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            Tất cả landing pages
          </h1>
          <p className='mt-1 text-[13px] text-zinc-500'>
            Workspace <strong>{activeWs.name}</strong> có{' '}
            <strong>{scopedTemplates.length}</strong> landing page (/
            {templates.length} tổng client). Click để xem analytics chi tiết.
          </p>
        </div>
        {source === 'live' && (
          <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700'>
            <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
            LIVE BE
          </span>
        )}
      </section>

      <ApiStatusLabel source={source} error={loadError} />

      {/* Filter bar */}
      <div className='mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm'>
        <div className='flex flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 lg:max-w-sm'>
          <Search className='size-3.5 text-zinc-400' />
          <input
            type='text'
            placeholder='Tìm theo tên...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='flex-1 bg-transparent text-[13px] outline-none placeholder:text-zinc-400'
          />
        </div>
        <div className='inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5'>
          {(['all', 'published', 'draft', 'archived'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                filter === s
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {s === 'all'
                ? `Tất cả · ${scopedTemplates.length}`
                : STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {filtered.length === 0 ? (
          <div className='col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500'>
            Không có template nào khớp filter.
          </div>
        ) : (
          filtered.map(t => <TemplateCard key={t.id} t={t} />)
        )}
      </div>
    </PortalShell>
  );
}

function TemplateCard({ t }: { t: PortalTemplate }) {
  const status = STATUS_META[t.status];
  const ctr = t.views_30d > 0 ? (t.clicks_30d / t.views_30d) * 100 : 0;
  return (
    <div className='group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Thumbnail */}
      <div
        className={`relative aspect-[16/9] bg-gradient-to-br ${t.thumbnail_gradient}`}
      >
        <div className='absolute inset-0 bg-black/10' />
        <div className='absolute top-3 left-3 flex items-center gap-1.5'>
          <span
            className={`flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold backdrop-blur ${status.chip}`}
          >
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {t.status}
          </span>
        </div>
        {t.open_comments > 0 && (
          <div className='absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-rose-700 backdrop-blur'>
            <MessageSquare className='size-2.5' /> {t.open_comments} open
          </div>
        )}
        {/* Decorative fake content */}
        <div className='absolute inset-x-6 bottom-6'>
          <div className='h-2.5 w-2/3 rounded bg-white/40' />
          <div className='mt-2 h-1.5 w-1/2 rounded bg-white/30' />
          <div className='mt-3 h-5 w-20 rounded-md bg-white/80' />
        </div>
      </div>

      {/* Body */}
      <div className='p-4'>
        <h3 className='line-clamp-1 text-[14px] font-bold tracking-tight'>
          {t.name}
        </h3>
        <p className='mt-0.5 text-[10.5px] text-zinc-400'>
          Cập nhật bởi{' '}
          <span className='font-semibold text-zinc-600'>
            {t.last_updated_by.name}
          </span>
          {' · '}
          {new Date(t.last_updated_at).toLocaleDateString('vi-VN')}
        </p>

        {/* Stats row */}
        {t.status === 'published' ? (
          <div className='mt-3 grid grid-cols-4 gap-1 text-center'>
            <Stat label='Views' value={fmtNum(t.views_30d)} icon={Eye} />
            <Stat label='Clicks' value={fmtNum(t.clicks_30d)} icon={Zap} />
            <Stat label='CTR' value={`${ctr.toFixed(1)}%`} icon={Zap} />
            <Stat label='Leads' value={fmtNum(t.leads_30d)} icon={Send} />
          </div>
        ) : (
          <div className='mt-3 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-[11px] text-zinc-500'>
            Chưa publish — chưa có số liệu
          </div>
        )}

        {/* Actions */}
        <div className='mt-4 flex items-center gap-2'>
          <Link
            href={`/overview/analytics/templates/${t.id}?range=30d`}
            className='flex-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-zinc-700'
          >
            Xem analytics
          </Link>
          {t.status === 'published' && (
            <a
              href={`/p/${t.id}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
            >
              <ExternalLink className='size-3' />
              Xem live
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  return (
    <div className='rounded-md bg-zinc-50 py-1.5'>
      <Icon className='mx-auto size-3 text-zinc-400' />
      <div className='mt-0.5 font-mono text-[12px] font-bold text-zinc-900'>
        {value}
      </div>
      <div className='font-mono text-[9px] text-zinc-500'>{label}</div>
    </div>
  );
}
