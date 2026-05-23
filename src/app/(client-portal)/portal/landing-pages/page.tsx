'use client';

/**
 * Brand-portal landing-pages list. Lifecycle:
 *
 *    draft ──(publish)──→ published ──(unpublish)──→ draft
 *      ↓                       ↓                       ↓
 *   archive                archive                  archive
 *                             ↑                       ↑
 *                          (restore)              (restore)
 *
 * Phase 1 managed-service: Rexer staff owns content (create, edit, publish).
 * Brand is a **review-only** persona — they get Preview + Analytics on every
 * card, nothing else. No Edit, no public-URL link, no publish controls. When
 * Phase 2 opens self-serve, more buttons return.
 *
 * Preview = /portal/landing-pages/[id]/preview — auth-gated mirror of /p
 * that brand can open before staff publishes.
 */

import {
  BarChart3,
  Eye,
  HelpCircle,
  Info,
  LayoutTemplate,
  MessageSquare,
  Search,
  Send,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { FAKE_TEMPLATES, fmtNum, type PortalTemplate } from '../_data';
import { ApiStatusLabel, loadTemplates } from '../_remote';
import { PortalShell } from '../_shell';
import { useActiveWorkspace } from '../_workspace';

type LandingStatus = PortalTemplate['status'];

const STATUS_META: Record<
  LandingStatus,
  { label: string; chip: string; dot: string; descShort: string }
> = {
  published: {
    label: '✓ Đã publish',
    chip: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    descShort: 'Khách công khai vào được URL /p/[id]/[token]',
  },
  draft: {
    label: 'Bản nháp',
    chip: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    descShort: 'Chỉ brand thấy. Click Preview để xem trước khi publish',
  },
  archived: {
    label: 'Lưu trữ',
    chip: 'bg-zinc-100 text-zinc-600',
    dot: 'bg-zinc-400',
    descShort: 'Đã lưu trữ — URL public hết hiệu lực. Restore để khôi phục',
  },
};

type StatusFilter = 'all' | LandingStatus;

export default function PortalLandingPagesPage() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const activeWs = useActiveWorkspace();
  const [templates, setTemplates] = useState<PortalTemplate[]>(FAKE_TEMPLATES);
  const [source, setSource] = useState<'live' | 'fake'>('fake');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [helpOpen, setHelpOpen] = useState(false);

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

  const scopedTemplates = useMemo(
    () =>
      templates.filter(t => !t.workspace_id || t.workspace_id === activeWs.id),
    [templates, activeWs.id]
  );
  const filtered = useMemo(
    () =>
      scopedTemplates.filter(t => {
        if (filter !== 'all' && t.status !== filter) return false;
        if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [scopedTemplates, filter, search]
  );

  const countByStatus = useMemo(() => {
    const m: Record<LandingStatus, number> = {
      published: 0,
      draft: 0,
      archived: 0,
    };
    for (const t of scopedTemplates) m[t.status] = (m[t.status] ?? 0) + 1;
    return m;
  }, [scopedTemplates]);

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
            <strong>{scopedTemplates.length}</strong> landing page
            <span className='text-zinc-400'>
              {' '}
              · {countByStatus.published} published · {countByStatus.draft}{' '}
              draft · {countByStatus.archived} archived
            </span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          {source === 'live' && (
            <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700'>
              <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
              LIVE BE
            </span>
          )}
          <button
            type='button'
            onClick={() => setHelpOpen(o => !o)}
            className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50'
            title='Hướng dẫn trạng thái'
          >
            <HelpCircle className='size-3.5' />
            Hướng dẫn
          </button>
        </div>
      </section>

      {helpOpen && <LifecycleHelp onClose={() => setHelpOpen(false)} />}

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
          {(['all', 'published', 'draft', 'archived'] as const).map(s => {
            const count =
              s === 'all'
                ? scopedTemplates.length
                : countByStatus[s as LandingStatus];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  filter === s
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {s === 'all' ? 'Tất cả' : STATUS_META[s].label}
                <span
                  className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 font-mono text-[10px] tabular-nums ${
                    filter === s
                      ? 'bg-white/15 text-white/90'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates grid */}
      <div className='mt-5 grid grid-cols-1 gap-4 md:grid-cols-2'>
        {filtered.length === 0 ? (
          <div className='col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500'>
            Không có landing nào khớp filter.
          </div>
        ) : (
          filtered.map(t => <TemplateCard key={t.id} t={t} />)
        )}
      </div>
    </PortalShell>
  );
}

/* ─── Card ──────────────────────────────────────────────────────────── */

function TemplateCard({ t }: { t: PortalTemplate }) {
  const status = STATUS_META[t.status];
  const ctr = t.views_30d > 0 ? (t.clicks_30d / t.views_30d) * 100 : 0;
  const isArchived = t.status === 'archived';
  const isPublished = t.status === 'published';

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

        {/* Stats / status hint */}
        {isPublished ? (
          <div className='mt-3 grid grid-cols-4 gap-1 text-center'>
            <Stat label='Views' value={fmtNum(t.views_30d)} icon={Eye} />
            <Stat label='Clicks' value={fmtNum(t.clicks_30d)} icon={Zap} />
            <Stat label='CTR' value={`${ctr.toFixed(1)}%`} icon={Zap} />
            <Stat label='Leads' value={fmtNum(t.leads_30d)} icon={Send} />
          </div>
        ) : (
          <div
            className={`mt-3 rounded-lg border border-dashed px-3 py-2 text-center text-[11px] ${
              isArchived
                ? 'border-zinc-200 bg-zinc-50 text-zinc-500'
                : 'border-amber-200 bg-amber-50/50 text-amber-700'
            }`}
          >
            {status.descShort}
          </div>
        )}

        {/* Actions — brand chỉ Preview + Analytics (Phase 1 review-only) */}
        <div className='mt-4 grid grid-cols-2 gap-2'>
          <Link
            href={`/portal/landing-pages/${t.id}/preview`}
            aria-disabled={isArchived}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isArchived
                ? 'pointer-events-none border border-zinc-200 bg-zinc-50 text-zinc-400'
                : 'bg-zinc-900 text-white hover:bg-zinc-700'
            }`}
            title='Xem trước landing — render chính xác như khách sẽ thấy'
          >
            <Eye className='size-3.5' />
            Preview
          </Link>

          <Link
            href={`/portal/landing-pages/${t.id}/analytics`}
            aria-disabled={!isPublished}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isPublished
                ? 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                : 'pointer-events-none border-zinc-200 bg-zinc-50 text-zinc-400'
            }`}
            title={
              isPublished
                ? 'Xem thống kê click, view, dwell theo từng block'
                : 'Chưa publish — chưa có data analytics'
            }
          >
            <BarChart3 className='size-3.5' />
            Analytics
          </Link>
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

/* ─── Lifecycle help drawer ─────────────────────────────────────────── */

function LifecycleHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className='mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-blue-700 uppercase'>
          <Info className='size-3.5' />
          Vòng đời landing page
        </div>
        <button
          type='button'
          onClick={onClose}
          className='text-[11px] text-zinc-500 hover:text-zinc-900'
        >
          Ẩn
        </button>
      </div>

      <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <StateCard
          dot='bg-amber-500'
          name='Bản nháp (draft)'
          help='Rexer staff đang dựng. Bạn click Preview để xem WIP và phản hồi qua comment trước khi staff publish.'
          actions={['Preview']}
        />
        <StateCard
          dot='bg-emerald-500'
          name='Đã publish'
          help='Landing đã live cho khách công khai. Bạn xem thiết kế qua Preview và theo dõi data thật qua Analytics.'
          actions={['Preview', 'Analytics']}
        />
        <StateCard
          dot='bg-zinc-400'
          name='Lưu trữ'
          help='Đã ngưng hoạt động. URL public hết hiệu lực. Cần restore? Liên hệ Rexer staff.'
          actions={[]}
        />
      </div>

      <div className='mt-4 rounded-xl border border-zinc-200 bg-white p-3 text-[11.5px] leading-relaxed text-zinc-600'>
        <strong className='text-zinc-900'>Phase 1 managed-service:</strong>{' '}
        Rexer staff phụ trách thiết kế, sửa, và publish landing pages. Bạn
        review qua <kbd>Preview</kbd>, để lại comment khi cần chỉnh, và theo dõi
        hiệu quả qua <kbd>Analytics</kbd> sau khi staff publish.
      </div>
    </div>
  );
}

function StateCard({
  dot,
  name,
  help,
  actions,
}: {
  dot: string;
  name: string;
  help: string;
  actions: string[];
}) {
  return (
    <div className='rounded-xl border border-zinc-200 bg-white p-3 shadow-sm'>
      <div className='flex items-center gap-2'>
        <span className={`size-2 rounded-full ${dot}`} />
        <span className='text-[12px] font-semibold text-zinc-900'>{name}</span>
      </div>
      <p className='mt-1.5 text-[11px] leading-snug text-zinc-600'>{help}</p>
      <div className='mt-2 flex flex-wrap gap-1'>
        {actions.map(a => (
          <span
            key={a}
            className='rounded-full bg-zinc-100 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-600'
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
