'use client';

/**
 * Editorial-studio block-detail view used by the brand-portal route
 * `/portal/blocks/[id]`. The preview is the hero, metadata reads like a
 * curator's placard, and the sticky right rail keeps primary actions in
 * reach without competing with the artwork.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Hash,
  Layers,
  Lightbulb,
  Monitor,
  Pencil,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { BlockMiniPreview } from '@/components/modules/CanvasTemplate/block-editor/BlockMiniPreview';
import {
  deleteSavedBlock,
  duplicateSavedBlock,
  getSavedBlock,
  renameSavedBlock,
  subscribeSavedBlocks,
  updateSavedBlockTags,
  type SavedBlock,
} from '@/components/modules/CanvasTemplate/block-editor/savedBlocks';
import { serializeCanvas } from '@/components/modules/CanvasTemplate/block-editor/serialize';
import type { BlockType } from '@/components/modules/CanvasTemplate/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  hero_split: 'Hero Split',
  hero_overlay: 'Hero Overlay',
  feature_section: 'Features',
  photo_gallery: 'Photo Gallery',
  booking_form: 'Booking Form',
  cta_section: 'CTA',
  image_carousel: 'Carousel',
  stories: 'Stories',
  split_screen: 'Split Screen',
  quiz: 'Quiz',
  poll: 'Poll',
  carousel_3d: 'Carousel 3D',
  flipbook: 'Flipbook',
  panorama: 'Panorama',
  legacy_embed: 'Legacy block',
};

const BLOCK_TYPE_GRADIENT: Record<BlockType, string> = {
  hero_split: 'from-rose-400 to-red-500',
  hero_overlay: 'from-zinc-700 to-zinc-900',
  feature_section: 'from-emerald-400 to-teal-500',
  photo_gallery: 'from-pink-400 to-fuchsia-500',
  booking_form: 'from-blue-500 to-violet-500',
  cta_section: 'from-amber-400 to-orange-500',
  image_carousel: 'from-cyan-400 to-blue-500',
  stories: 'from-orange-400 to-pink-500',
  split_screen: 'from-slate-500 to-zinc-600',
  quiz: 'from-violet-500 to-purple-600',
  poll: 'from-indigo-500 to-blue-600',
  carousel_3d: 'from-fuchsia-500 to-pink-600',
  flipbook: 'from-amber-500 to-yellow-500',
  panorama: 'from-sky-500 to-cyan-600',
  legacy_embed: 'from-slate-500 to-slate-700',
};

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fmtRelative(iso?: string): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'vừa xong';
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  if (day < 30) return `${Math.floor(day / 7)} tuần trước`;
  return fmtDate(iso);
}

interface Props {
  blockId: string;
  /**
   * Where to send the user after deletion or via the back button. Defaults
   * to `/portal/blocks` because that's the only current consumer.
   */
  backHref?: string;
}

export function BlockDetailView({
  blockId,
  backHref = '/portal/blocks',
}: Props) {
  const router = useRouter();
  const [block, setBlock] = React.useState<SavedBlock | null>(
    () => getSavedBlock(blockId) ?? null
  );
  const [editingName, setEditingName] = React.useState(false);
  const [nameInput, setNameInput] = React.useState(block?.name ?? '');
  const [tagInput, setTagInput] = React.useState('');
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    setBlock(getSavedBlock(blockId) ?? null);
    return subscribeSavedBlocks(() => {
      setBlock(getSavedBlock(blockId) ?? null);
    });
  }, [blockId]);

  React.useEffect(() => {
    if (block) setNameInput(block.name);
  }, [block?.id, block?.name]);

  if (!block) {
    return (
      <div className='mx-auto max-w-3xl px-6 pt-10'>
        <button
          type='button'
          onClick={() => router.push(backHref)}
          className='group border-border text-content-muted hover:border-border hover:text-foreground inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all'
        >
          <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
          Quay lại thư viện
        </button>
        <div className='mt-8 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white p-10 text-center shadow-sm'>
          <div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700'>
            <X className='size-6' strokeWidth={2.5} />
          </div>
          <p className='mt-4 text-base font-semibold text-amber-900'>
            Không tìm thấy block
          </p>
          <p className='mt-1.5 text-xs text-amber-800/80'>
            Block với id <code className='font-mono'>{blockId}</code> không tồn
            tại trong storage — có thể đã bị xoá hoặc chưa sync.
          </p>
        </div>
      </div>
    );
  }

  const type = block.block.blockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? type;
  const tags = block.tags ?? [];
  const extraCount = block.block.extraElements?.length ?? 0;
  const hasMobile = !!block.block.contentVi?.mobile;

  const commitName = () => {
    if (nameInput.trim() && nameInput !== block.name) {
      renameSavedBlock(block.id, nameInput.trim());
      toast.success('Đã đổi tên');
    }
    setEditingName(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput('');
      return;
    }
    updateSavedBlockTags(block.id, [...tags, t]);
    toast.success('Đã thêm tag');
    setTagInput('');
  };

  const removeTag = (t: string) => {
    updateSavedBlockTags(
      block.id,
      tags.filter(x => x !== t)
    );
  };

  const handleDuplicate = () => {
    const dup = duplicateSavedBlock(block.id);
    if (!dup) {
      toast.error('Không clone được');
      return;
    }
    toast.success(`Đã clone — "${dup.name}"`);
    router.push(`${backHref}/${dup.id}`);
  };

  const handleDelete = () => {
    if (!window.confirm(`Xoá "${block.name}"?`)) return;
    deleteSavedBlock(block.id);
    toast.success('Đã xoá');
    router.push(backHref);
  };

  const handleEdit = async () => {
    setEditing(true);
    const t = toast.loading('Đang tạo canvas tạm để chỉnh sửa…');
    try {
      const canvasData = serializeCanvas([block.block], block.block.id);
      const created = await rexerApi.canvasTemplates.create({
        name: `[Editing] ${block.name}`,
        width: 800,
        height: 600,
        engine: 'fabric',
        engine_version: '5.3.0',
        canvas_data: canvasData,
        is_template: false,
      });
      toast.success('Mở editor — sửa xong dùng 🔖 để cập nhật bản gốc', {
        id: t,
      });
      router.push(`/portal/blocks/${block.id}/edit?canvas_id=${created.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Tạo canvas thất bại: ${msg}`, { id: t });
    } finally {
      setEditing(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(block.id).then(
      () => {
        setCopied(true);
        toast.success('Đã copy block ID');
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error('Copy thất bại')
    );
  };

  return (
    <div className='relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-6 pb-16 sm:px-6'>
      {/* Soft ambient blur behind hero — adds atmosphere without competing
          with the preview. Sits behind everything via -z-10. */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-80 w-[90%] max-w-5xl rounded-[50%] bg-gradient-to-br from-zinc-200/40 via-zinc-100/20 to-transparent blur-3xl'
      />

      {/* ── Top utility bar ─────────────────────────────────────────────── */}
      <header className='flex flex-wrap items-center justify-between gap-3'>
        <button
          type='button'
          onClick={() => router.push(backHref)}
          className='group border-border text-content-muted hover:text-foreground inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900'
        >
          <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
          Thư viện blocks
        </button>
        <button
          type='button'
          onClick={copyId}
          className='group text-3xs border-border text-content-muted hover:border-border hover:text-foreground inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-2.5 py-1 font-mono shadow-sm backdrop-blur transition-colors hover:bg-white'
          title='Click để copy block ID'
        >
          <Hash className='size-3' />
          <span className='hidden sm:inline'>{block.id}</span>
          <span className='sm:hidden'>{block.id.slice(0, 12)}…</span>
          {copied ? (
            <Check className='size-3 text-emerald-600' />
          ) : (
            <Copy className='text-muted-foreground group-hover:text-content-muted size-3' />
          )}
        </button>
      </header>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <section className='border-border relative overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.12)]'>
        {/* Soft gradient wash inside the hero card */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-zinc-50/80 via-white/40 to-transparent'
        />

        <div className='relative p-6 sm:p-8'>
          {/* Type pill row */}
          <div className='flex flex-wrap items-center gap-2'>
            <span
              className={cn(
                'text-3xs inline-flex items-center rounded-full bg-gradient-to-br px-2.5 py-1 font-mono font-bold tracking-[0.18em] text-white/95 uppercase shadow-sm',
                gradient
              )}
            >
              {label}
            </span>
            <span className='text-3xs text-muted-foreground font-mono tracking-wider uppercase'>
              {type}
            </span>
            <span className='text-3xs text-muted-foreground ml-auto inline-flex items-center gap-1 font-medium tracking-wider uppercase'>
              {hasMobile ? (
                <>
                  <Smartphone className='size-3' /> Desktop + Mobile
                </>
              ) : (
                <>
                  <Monitor className='size-3' /> Desktop only
                </>
              )}
            </span>
          </div>

          {/* Title — inline editable */}
          <div className='mt-4'>
            {editingName ? (
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitName();
                  if (e.key === 'Escape') {
                    setNameInput(block.name);
                    setEditingName(false);
                  }
                }}
                className='w-full max-w-2xl rounded-xl border-2 border-zinc-900 bg-white px-3 py-2 text-2xl font-bold tracking-tight outline-none sm:text-3xl'
              />
            ) : (
              <button
                type='button'
                onClick={() => setEditingName(true)}
                className='group inline-flex items-baseline gap-2 text-left'
                title='Click để đổi tên'
              >
                <h1 className='text-foreground text-2xl font-bold tracking-tight sm:text-3xl'>
                  {block.name}
                </h1>
                <Pencil className='text-muted-foreground group-hover:text-content-muted size-3.5 transition-colors' />
              </button>
            )}
          </div>

          {/* Meta line */}
          <div className='text-content-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs'>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='size-3' />
              Tạo {fmtDate(block.createdAt)}
            </span>
            {block.updatedAt && (
              <>
                <span className='text-muted-foreground'>·</span>
                <span>Cập nhật {fmtRelative(block.updatedAt)}</span>
              </>
            )}
            <span className='text-muted-foreground'>·</span>
            <span>
              {extraCount > 0 ? `${extraCount} extras` : 'không có extras'}
            </span>
          </div>

          {/* Preview — matted frame */}
          <figure className='mt-7 overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 p-2.5 ring-1 ring-zinc-200/80 ring-inset'>
            <div className='overflow-hidden rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_24px_-12px_rgba(0,0,0,0.15)] ring-1 ring-zinc-900/5'>
              <BlockMiniPreview block={block.block} aspect='16 / 9' />
            </div>
          </figure>
        </div>
      </section>

      {/* ── 2-col grid: details/tags + actions rail ─────────────────────── */}
      <section className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left col — Details + Tags */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Details */}
          <div className='border-border rounded-2xl border bg-white p-6 shadow-sm'>
            <SectionHeader icon={<Layers className='size-3.5' />}>
              Chi tiết
            </SectionHeader>
            <dl className='mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3'>
              <DefRow
                label='Block type'
                value={
                  <code className='text-2xs bg-muted text-content-muted rounded px-1.5 py-0.5 font-mono'>
                    {type}
                  </code>
                }
              />
              <DefRow label='Saved' value={fmtDate(block.createdAt)} />
              <DefRow
                label='Updated'
                value={block.updatedAt ? fmtRelative(block.updatedAt) : '—'}
              />
              <DefRow label='Extras' value={`${extraCount} elements`} />
              <DefRow
                label='Layout'
                value={hasMobile ? 'Desktop + Mobile' : 'Desktop only'}
              />
              <DefRow
                label='Tags'
                value={
                  tags.length === 0 ? (
                    <span className='text-muted-foreground'>—</span>
                  ) : (
                    `${tags.length} tag${tags.length > 1 ? 's' : ''}`
                  )
                }
              />
            </dl>
          </div>

          {/* Tags editor */}
          <div className='border-border rounded-2xl border bg-white p-6 shadow-sm'>
            <SectionHeader icon={<Tag className='size-3.5' />}>
              Tags
            </SectionHeader>
            <div className='mt-4 flex flex-wrap items-center gap-1.5'>
              {tags.length === 0 && (
                <span className='text-muted-foreground text-xs italic'>
                  Chưa có tag — thêm để dễ filter trong thư viện
                </span>
              )}
              {tags.map(t => (
                <button
                  key={t}
                  type='button'
                  onClick={() => removeTag(t)}
                  className='group text-2xs border-border bg-muted text-content-muted inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
                  title='Click để xoá tag'
                >
                  <span>{t}</span>
                  <X className='text-muted-foreground size-2.5 group-hover:text-rose-500' />
                </button>
              ))}
            </div>
            <div className='mt-4 flex max-w-md items-center gap-2'>
              <div className='relative flex-1'>
                <Tag className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder='Thêm tag (Enter)…'
                  className='border-border bg-muted w-full rounded-lg border py-2 pr-3 pl-9 text-xs transition-colors outline-none focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/5'
                />
              </div>
              <button
                type='button'
                onClick={addTag}
                disabled={!tagInput.trim()}
                className='rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40'
              >
                Thêm
              </button>
            </div>
          </div>
        </div>

        {/* Right col — Sticky action rail */}
        <aside className='lg:sticky lg:top-6 lg:self-start'>
          <div className='border-border rounded-2xl border bg-white p-5 shadow-sm'>
            <SectionHeader icon={<Sparkles className='size-3.5' />}>
              Hành động
            </SectionHeader>

            {/* Primary CTA — opens canvas editor */}
            <button
              type='button'
              onClick={() => void handleEdit()}
              disabled={editing}
              className='group relative mt-4 flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-4 py-3 text-left text-white shadow-lg shadow-zinc-900/10 transition-all hover:from-zinc-800 hover:to-zinc-700 hover:shadow-zinc-900/20 disabled:opacity-60'
            >
              {/* Subtle inner highlight */}
              <span
                aria-hidden
                className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent'
              />
              <div className='min-w-0'>
                <div className='text-sm font-semibold'>
                  {editing ? 'Đang mở editor…' : 'Sửa trong canvas'}
                </div>
                <div className='text-3xs text-white/55'>
                  Editor full-screen + tất cả tooling
                </div>
              </div>
              <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-transform group-hover:translate-x-0.5'>
                <Pencil className='size-3.5' />
              </div>
            </button>

            {/* Secondary actions */}
            <div className='mt-2 grid grid-cols-2 gap-2'>
              <button
                type='button'
                onClick={handleDuplicate}
                className='group border-border text-content-muted hover:text-foreground inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium transition-all hover:border-zinc-900'
              >
                <Copy className='size-3.5' />
                Duplicate
              </button>
              <button
                type='button'
                onClick={handleDelete}
                className='group border-border text-content-muted inline-flex items-center justify-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-xs font-medium transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
              >
                <Trash2 className='size-3.5' />
                Xoá
              </button>
            </div>

            {/* Tip card */}
            <div className='mt-5 flex gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 p-3.5'>
              <Lightbulb className='size-4 shrink-0 text-amber-600' />
              <div className='text-2xs leading-relaxed text-amber-900/90'>
                <strong className='text-2xs block font-semibold text-amber-900'>
                  Mẹo
                </strong>
                Sau khi sửa xong trong canvas → click 🔖 bookmark icon để cập
                nhật bản gốc trong thư viện.
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ─── Subcomponents ──────────────────────────────────────────────────── */

function SectionHeader({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='text-3xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.2em] uppercase'>
      <span className='bg-muted text-content-muted flex size-6 items-center justify-center rounded-md'>
        {icon}
      </span>
      {children}
    </div>
  );
}

function DefRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-1'>
      <dt className='text-3xs text-muted-foreground font-semibold tracking-[0.15em] uppercase'>
        {label}
      </dt>
      <dd className='text-foreground text-sm leading-snug'>{value}</dd>
    </div>
  );
}
