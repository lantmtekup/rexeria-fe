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
  ExternalLink,
  Eye,
  HelpCircle,
  ImagePlus,
  Loader2,
  Info,
  LayoutTemplate,
  MessageSquare,
  Search,
  Send,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { rexerApi } from '@/services/rexer/endpoints';

import { FAKE_TEMPLATES, fmtNum, type PortalTemplate } from '../_data';
import { ApiStatusLabel, loadTemplates, uploadProductImage } from '../_remote';
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
    chip: 'bg-muted text-content-muted',
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
          <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
            <LayoutTemplate className='size-3' /> Landing pages
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight'>
            Tất cả landing pages
          </h1>
          <p className='text-content-muted mt-1 text-sm'>
            Workspace <strong>{activeWs.name}</strong> có{' '}
            <strong>{scopedTemplates.length}</strong> landing page
            <span className='text-muted-foreground'>
              {' '}
              · {countByStatus.published} published · {countByStatus.draft}{' '}
              draft · {countByStatus.archived} archived
            </span>
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setHelpOpen(o => !o)}
            className='border-border text-content-muted hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-medium'
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
      <div className='border-border mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-muted-foreground size-3.5' />
          <input
            type='text'
            placeholder='Tìm theo tên...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <div className='border-border inline-flex items-center rounded-lg border bg-white p-0.5'>
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
                    : 'text-content-muted hover:bg-muted'
                }`}
              >
                {s === 'all' ? 'Tất cả' : STATUS_META[s].label}
                <span
                  className={`text-3xs inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 font-mono tabular-nums ${
                    filter === s
                      ? 'bg-white/15 text-white/90'
                      : 'bg-muted text-content-muted'
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
          <div className='border-border text-content-muted col-span-full rounded-2xl border border-dashed bg-white p-10 text-center text-sm'>
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

  const [thumb, setThumb] = useState<string | null>(t.thumbnail_url ?? null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload ảnh → media asset → PATCH page.thumbnail_asset_id → BE trả
  // thumbnail_url. Cập nhật ảnh tại chỗ, không reload cả list.
  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    setBusy(true);
    uploadProductImage(file)
      .then(asset =>
        rexerApi.pages
          .update(t.id, { thumbnail_asset_id: asset.id })
          .then(p => p.thumbnail_url ?? asset.public_url ?? null)
      )
      .then(url => {
        setThumb(url);
        toast.success('Đã cập nhật ảnh thumbnail');
      })
      .catch(err =>
        toast.error(err instanceof Error ? err.message : 'Upload thất bại')
      )
      .finally(() => setBusy(false));
  };

  return (
    <div className='group border-border overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md'>
      {/* Thumbnail */}
      <div
        className={`relative aspect-[16/9] ${thumb ? 'bg-muted' : `bg-gradient-to-br ${t.thumbnail_gradient}`}`}
      >
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={t.name}
            className='absolute inset-0 size-full object-cover'
          />
        ) : (
          <>
            <div className='absolute inset-0 bg-black/10' />
            {/* Decorative fake content (placeholder khi chưa có ảnh) */}
            <div className='absolute inset-x-6 bottom-6'>
              <div className='h-2.5 w-2/3 rounded bg-white/40' />
              <div className='mt-2 h-1.5 w-1/2 rounded bg-white/30' />
              <div className='mt-3 h-5 w-20 rounded-md bg-white/80' />
            </div>
          </>
        )}

        <div className='absolute top-3 left-3 flex items-center gap-1.5'>
          <span
            className={`text-3xs flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-bold backdrop-blur ${status.chip}`}
          >
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {t.status}
          </span>
        </div>
        {t.open_comments > 0 && (
          <div className='text-3xs absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 font-bold text-rose-700 backdrop-blur'>
            <MessageSquare className='size-2.5' /> {t.open_comments} open
          </div>
        )}

        {/* Đổi ảnh thumbnail — hiện khi hover (hoặc khi đang upload) */}
        <button
          type='button'
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className='text-2xs absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1.5 font-medium text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 disabled:cursor-wait disabled:opacity-100'
          title='Tải ảnh thumbnail mới'
        >
          {busy ? (
            <Loader2 className='size-3.5 animate-spin' />
          ) : (
            <ImagePlus className='size-3.5' />
          )}
          {busy ? 'Đang tải…' : 'Đổi ảnh'}
        </button>
        <input
          ref={fileRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handlePick}
        />
      </div>

      {/* Body */}
      <div className='p-4'>
        <h3 className='line-clamp-1 text-sm font-bold tracking-tight'>
          {t.name}
        </h3>
        <p className='text-3xs text-muted-foreground mt-0.5'>
          Cập nhật bởi{' '}
          <span className='text-content-muted font-semibold'>
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
            className={`text-2xs mt-3 rounded-lg border border-dashed px-3 py-2 text-center ${
              isArchived
                ? 'border-border bg-muted text-content-muted'
                : 'border-amber-200 bg-amber-50/50 text-amber-700'
            }`}
          >
            {status.descShort}
          </div>
        )}

        {/* Actions — brand chỉ Preview + Analytics (Phase 1 review-only) */}
        <div className='mt-4 grid grid-cols-2 gap-2'>
          {t.external_url ? (
            // Landing loại "extension" → mở thẳng URL ngoài (tab mới), giống
            // nút "Mở link" ở admin. Không có trang Preview nội bộ để render.
            <a
              href={t.external_url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700'
              title={`Mở link ngoài: ${t.external_url}`}
            >
              <ExternalLink className='size-3.5' />
              Mở link
            </a>
          ) : (
            <Link
              href={`/portal/landing-pages/${t.id}/preview`}
              aria-disabled={isArchived}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isArchived
                  ? 'border-border bg-muted text-muted-foreground pointer-events-none border'
                  : 'bg-zinc-900 text-white hover:bg-zinc-700'
              }`}
              title='Xem trước landing — render chính xác như khách sẽ thấy'
            >
              <Eye className='size-3.5' />
              Preview
            </Link>
          )}

          <Link
            href={`/portal/landing-pages/${t.id}/analytics`}
            aria-disabled={!isPublished}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              isPublished
                ? 'border-border text-content-muted hover:bg-muted bg-white'
                : 'border-border bg-muted text-muted-foreground pointer-events-none'
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
    <div className='bg-muted rounded-md py-1.5'>
      <Icon className='text-muted-foreground mx-auto size-3' />
      <div className='text-foreground mt-0.5 font-mono text-xs font-bold'>
        {value}
      </div>
      <div className='text-3xs text-content-muted font-mono'>{label}</div>
    </div>
  );
}

/* ─── Lifecycle help drawer ─────────────────────────────────────────── */

function LifecycleHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className='mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-2'>
        <div className='text-2xs flex items-center gap-2 font-semibold tracking-[0.18em] text-blue-700 uppercase'>
          <Info className='size-3.5' />
          Vòng đời landing page
        </div>
        <button
          type='button'
          onClick={onClose}
          className='text-2xs text-content-muted hover:text-foreground'
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

      <div className='text-2xs border-border text-content-muted mt-4 rounded-xl border bg-white p-3 leading-relaxed'>
        <strong className='text-foreground'>Phase 1 managed-service:</strong>{' '}
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
    <div className='border-border rounded-xl border bg-white p-3 shadow-sm'>
      <div className='flex items-center gap-2'>
        <span className={`size-2 rounded-full ${dot}`} />
        <span className='text-foreground text-xs font-semibold'>{name}</span>
      </div>
      <p className='text-2xs text-content-muted mt-1.5 leading-snug'>{help}</p>
      <div className='mt-2 flex flex-wrap gap-1'>
        {actions.map(a => (
          <span
            key={a}
            className='text-3xs bg-muted text-content-muted rounded-full px-1.5 py-0.5 font-mono'
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
