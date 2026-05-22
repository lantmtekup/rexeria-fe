'use client';

/**
 * Standalone block-detail view used by the brand-portal route
 * `/portal/blocks/[id]`. Replaces the side-drawer pattern in /admin/blocks
 * for the portal context, so the URL stays under /portal even while editing
 * metadata. The "Sửa trong canvas" action opens the full canvas editor via
 * the in-portal wrapper at /portal/blocks/[id]/edit.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  Copy,
  Hash,
  Pencil,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
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
      <div className='mx-auto max-w-3xl p-8'>
        <Button variant='outline' onClick={() => router.push(backHref)}>
          <ArrowLeft className='size-3.5' />
          Quay lại danh sách
        </Button>
        <div className='mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center'>
          <p className='text-[14px] font-semibold text-amber-900'>
            Không tìm thấy block với id <code>{blockId}</code>
          </p>
          <p className='mt-1 text-[12px] text-amber-700'>
            Block có thể đã bị xoá hoặc chưa tồn tại trong storage của bạn.
          </p>
        </div>
      </div>
    );
  }

  const type = block.block.blockType;
  const gradient = BLOCK_TYPE_GRADIENT[type] ?? 'from-zinc-400 to-zinc-600';
  const label = BLOCK_TYPE_LABEL[type] ?? type;
  const tags = block.tags ?? [];

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

  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-6 p-6'>
      {/* Top bar */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => router.push(backHref)}
          className='inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-900'
        >
          <ArrowLeft className='size-4' />
          Quay lại danh sách
        </button>
        <div className='font-mono text-[10.5px] text-zinc-400'>{block.id}</div>
      </div>

      {/* Header card */}
      <div className='rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        <div className='flex items-start gap-5 p-5'>
          <div className='min-w-0 flex-1'>
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
                className='w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xl font-semibold outline-none focus:ring-2 focus:ring-zinc-900/10'
              />
            ) : (
              <button
                type='button'
                onClick={() => setEditingName(true)}
                className='group flex items-center gap-2 text-left'
                title='Click để đổi tên'
              >
                <span className='text-2xl font-bold tracking-tight'>
                  {block.name}
                </span>
                <Pencil className='size-3.5 text-zinc-300 group-hover:text-zinc-600' />
              </button>
            )}
            <div className='mt-2 flex flex-wrap items-center gap-3 text-[12px] text-zinc-500'>
              <span
                className={cn(
                  'rounded bg-gradient-to-br px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-white/95 uppercase shadow-sm',
                  gradient
                )}
              >
                {label}
              </span>
              <span className='inline-flex items-center gap-1'>
                <Hash className='size-3' />
                <code className='font-mono text-[11px]'>{type}</code>
              </span>
              <span className='inline-flex items-center gap-1'>
                <Calendar className='size-3' />
                {fmtDate(block.createdAt)}
              </span>
              {block.updatedAt && (
                <span className='inline-flex items-center gap-1'>
                  Cập nhật {fmtDate(block.updatedAt)}
                </span>
              )}
              <span className='inline-flex items-center gap-1'>
                <Bookmark className='size-3' />
                {block.block.extraElements?.length ?? 0} extras
              </span>
              <span className='text-zinc-400'>
                {block.block.contentVi?.mobile
                  ? '📱 desktop + mobile'
                  : '🖥 desktop only'}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Button
              variant='primary'
              onClick={handleEdit}
              disabled={editing}
              className='whitespace-nowrap'
            >
              <Pencil className='size-3.5' />
              {editing ? 'Đang mở…' : 'Sửa trong canvas'}
            </Button>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDuplicate}
                className='flex-1'
              >
                <Copy className='size-3.5' />
                Duplicate
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDelete}
                className='flex-1'
              >
                <Trash2 className='size-3.5 text-rose-600' />
                Xoá
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className='rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm'>
        <div className='overflow-hidden rounded-xl'>
          <BlockMiniPreview block={block.block} aspect='16 / 9' />
        </div>
      </div>

      {/* Tags */}
      <div className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
        <div className='mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          <Tag className='size-3' />
          Tags
        </div>
        <div className='flex flex-wrap items-center gap-1.5'>
          {tags.length === 0 && (
            <span className='text-[12px] text-zinc-400'>Chưa có tag</span>
          )}
          {tags.map(t => (
            <button
              key={t}
              type='button'
              onClick={() => removeTag(t)}
              className='group flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11.5px] font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-700'
              title='Click để xoá tag'
            >
              {t}
              <X className='size-2.5 opacity-0 group-hover:opacity-100' />
            </button>
          ))}
        </div>
        <div className='mt-3 flex max-w-md items-center gap-1.5'>
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
            className='flex-1 rounded-md border border-zinc-200 px-3 py-1.5 text-[12px] outline-none focus:border-zinc-400'
          />
          <button
            type='button'
            onClick={addTag}
            disabled={!tagInput.trim()}
            className='rounded-md bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-zinc-700 disabled:opacity-40'
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
