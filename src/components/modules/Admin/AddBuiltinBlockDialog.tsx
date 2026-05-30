'use client';

/**
 * "Add from system catalog" picker for `/admin/blocks` (and the brand
 * portal mirror at `/portal/blocks`). Lists the 14 built-in block types
 * with category filter + search, and shows a real `BlockMiniPreview`
 * thumbnail per card so the user previews what they're adding instead of
 * just reading the type name.
 *
 * Built-ins are the FE catalog (factory.ts) — no BE call needed. When BE
 * ships server-backed saved-blocks (be-todo.md P1.5), the save call will
 * automatically use that layer because the savedBlocks helper hides the
 * storage.
 */

import * as React from 'react';
import { Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { BlockMiniPreview } from '@/components/modules/CanvasTemplate/block-editor/BlockMiniPreview';
import { createBlock } from '@/components/modules/CanvasTemplate/block-editor/factory';
import type {
  Block,
  BlockType,
} from '@/components/modules/CanvasTemplate/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

type Category =
  | 'all'
  | 'hero'
  | 'content'
  | 'media'
  | 'interactive'
  | 'advanced';

interface CatalogItem {
  type: BlockType;
  label: string;
  description: string;
  gradient: string;
  category: Exclude<Category, 'all'>;
}

const CATALOG: CatalogItem[] = [
  {
    type: 'hero_split',
    label: 'Hero Split',
    description: 'Tiêu đề + ảnh chia đôi màn hình, có CTA + stats.',
    gradient: 'from-rose-400 to-red-500',
    category: 'hero',
  },
  {
    type: 'hero_overlay',
    label: 'Hero Overlay',
    description: 'Ảnh nền full-width + tag + tiêu đề + CTA chính.',
    gradient: 'from-zinc-700 to-zinc-900',
    category: 'hero',
  },
  {
    type: 'feature_section',
    label: 'Tiện ích nổi bật',
    description: '3 cột feature có icon + label + body — đặt sau hero.',
    gradient: 'from-emerald-400 to-teal-500',
    category: 'content',
  },
  {
    type: 'cta_section',
    label: 'CTA Section',
    description: 'Khối kêu gọi hành động cuối trang, single + outline buttons.',
    gradient: 'from-amber-400 to-orange-500',
    category: 'content',
  },
  {
    type: 'photo_gallery',
    label: 'Thư viện ảnh',
    description: 'Grid ảnh dạng mosaic, lightbox khi click.',
    gradient: 'from-pink-400 to-fuchsia-500',
    category: 'media',
  },
  {
    type: 'image_carousel',
    label: 'Slide ảnh',
    description: 'Carousel ngang có chấm điều hướng + caption mỗi slide.',
    gradient: 'from-cyan-400 to-blue-500',
    category: 'media',
  },
  {
    type: 'panorama',
    label: 'Panorama 360°',
    description: 'Ảnh xoay 360 độ drag-to-rotate cho real estate / tour.',
    gradient: 'from-sky-500 to-cyan-600',
    category: 'media',
  },
  {
    type: 'booking_form',
    label: 'Đặt chỗ / Booking',
    description: 'Form thu lead — tên, sđt, ngày tham quan.',
    gradient: 'from-blue-500 to-violet-500',
    category: 'interactive',
  },
  {
    type: 'quiz',
    label: 'Quiz',
    description: 'Hỏi-đáp tương tác có kết quả phân loại người dùng.',
    gradient: 'from-violet-500 to-purple-600',
    category: 'interactive',
  },
  {
    type: 'poll',
    label: 'Bình chọn',
    description: 'Vote nhanh nhiều lựa chọn, hiện tỉ lệ real-time.',
    gradient: 'from-indigo-500 to-blue-600',
    category: 'interactive',
  },
  {
    type: 'stories',
    label: 'Stories',
    description: 'Instagram-style slides chuyển động, tap để next.',
    gradient: 'from-orange-400 to-pink-500',
    category: 'advanced',
  },
  {
    type: 'split_screen',
    label: 'Split Screen',
    description: '2 tab view chia đôi, click chuyển nội dung.',
    gradient: 'from-slate-500 to-zinc-600',
    category: 'advanced',
  },
  {
    type: 'carousel_3d',
    label: 'Coverflow 3D',
    description: 'Carousel 3D xoay cover-style — showcase sản phẩm cao cấp.',
    gradient: 'from-fuchsia-500 to-pink-600',
    category: 'advanced',
  },
  {
    type: 'flipbook',
    label: 'Flipbook',
    description: 'Lật trang như sách — catalog PDF-style cho brochure.',
    gradient: 'from-amber-500 to-yellow-500',
    category: 'advanced',
  },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'hero', label: 'Hero' },
  { id: 'content', label: 'Nội dung' },
  { id: 'media', label: 'Media' },
  { id: 'interactive', label: 'Tương tác' },
  { id: 'advanced', label: 'Nâng cao' },
];

/**
 * Lazy cache of seeded `Block` instances so each thumbnail only builds once
 * for the lifetime of the page. Building 14 fresh blocks every open of the
 * dialog is wasted work — the factory output is deterministic per type.
 */
const PREVIEW_CACHE = new Map<BlockType, Block>();
function getPreviewBlock(type: BlockType): Block {
  let cached = PREVIEW_CACHE.get(type);
  if (!cached) {
    cached = createBlock(type);
    PREVIEW_CACHE.set(type, cached);
  }
  return cached;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires after a built-in block is added to the saved-blocks library. */
  onAdded?: (id: string) => void;
}

export function AddBuiltinBlockDialog({ open, onClose, onAdded }: Props) {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<Category>('all');
  const [adding, setAdding] = React.useState<BlockType | null>(null);

  React.useEffect(() => {
    if (open) {
      setSearch('');
      setCategory('all');
    }
  }, [open]);

  // Count per-category for the chip badges — driven off search so the badges
  // reflect what the user will actually see when toggling categories.
  const counts = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchSearch = (c: CatalogItem) =>
      !q ||
      c.label.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    const m: Record<Category, number> = {
      all: 0,
      hero: 0,
      content: 0,
      media: 0,
      interactive: 0,
      advanced: 0,
    };
    for (const c of CATALOG) {
      if (!matchSearch(c)) continue;
      m.all += 1;
      m[c.category] += 1;
    }
    return m;
  }, [search]);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const filtered = CATALOG.filter(c => {
    if (category !== 'all' && c.category !== category) return false;
    if (!q) return true;
    return (
      c.label.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const handleAdd = async (item: CatalogItem) => {
    setAdding(item.type);
    try {
      const block = createBlock(item.type);
      // BE Block.settings: JSONMap opaque — FE serializes the editor Block
      // shape so the canvas editor can reconstruct it on load.
      const created = await rexerApi.blocks.create({
        type_code: item.type,
        name: item.label,
        settings: block as unknown as Record<string, unknown>,
        scope: 'brand_private',
      });
      toast.success(`Đã thêm "${created.name}" vào thư viện`);
      onAdded?.(created.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'unknown';
      toast.error(`Không thêm được: ${msg}`);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-8 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <div className='leading-tight'>
              <h3 className='text-[15px] font-semibold'>
                Thêm block từ thư viện hệ thống
              </h3>
              <p className='text-[11px] text-zinc-500'>
                {filtered.length} / {CATALOG.length} block types
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Search + category filter */}
        <div className='space-y-3 border-b border-zinc-100 bg-zinc-50/40 px-5 py-3.5'>
          <div className='relative max-w-md'>
            <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-zinc-400' />
            <input
              type='text'
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Tìm theo tên / type / mô tả…'
              className='w-full rounded-lg border border-zinc-200 bg-white py-2 pr-3 pl-9 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </div>

          <div className='flex flex-wrap items-center gap-1.5'>
            {CATEGORIES.map(cat => {
              const count = counts[cat.id];
              const active = category === cat.id;
              const empty = count === 0;
              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => setCategory(cat.id)}
                  disabled={empty && cat.id !== 'all'}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11.5px] font-medium transition-all',
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
                    empty && !active && 'cursor-not-allowed opacity-40'
                  )}
                >
                  {cat.label}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className='max-h-[62vh] overflow-y-auto bg-zinc-50/30 p-5'>
          {filtered.length === 0 ? (
            <div className='py-16 text-center'>
              <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400'>
                <Search className='size-5' />
              </div>
              <p className='mt-3 text-[13px] font-semibold text-zinc-700'>
                Không có block khớp tìm kiếm
              </p>
              <p className='mt-1 text-[11.5px] text-zinc-500'>
                Đổi từ khoá hoặc category để xem các block khác.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map(item => (
                <CatalogCard
                  key={item.type}
                  item={item}
                  adding={adding === item.type}
                  onAdd={() => handleAdd(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className='border-t border-zinc-100 bg-white px-5 py-2.5 text-[11px] text-zinc-500'>
          Sau khi thêm, block sẽ xuất hiện trong thư viện. Click{' '}
          <em className='text-zinc-700'>Sửa trong canvas</em> để mở editor và
          tuỳ chỉnh nội dung.
        </div>
      </div>
    </div>
  );
}

/* ─── Catalog card ─────────────────────────────────────────────────────── */

function CatalogCard({
  item,
  adding,
  onAdd,
}: {
  item: CatalogItem;
  adding: boolean;
  onAdd: () => void;
}) {
  // Wrapper is a div role=button — BlockMiniPreview contains carousel prev/next
  // <button>s for image_carousel/carousel_3d items; nesting <button> inside
  // <button> is invalid HTML + raises hydration warning.
  return (
    <div
      role='button'
      tabIndex={adding ? -1 : 0}
      aria-disabled={adding}
      onClick={() => {
        if (!adding) onAdd();
      }}
      onKeyDown={e => {
        if (adding) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd();
        }
      }}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5',
        adding && 'cursor-wait opacity-60'
      )}
    >
      {/* Real preview thumbnail — same renderer the saved-blocks library
          uses. Wrapped in a soft mat so heterogeneous block backgrounds
          (pure white hero vs dark overlay) still look intentional. */}
      <div className='relative aspect-[4/3] overflow-hidden border-b border-zinc-100 bg-gradient-to-br from-zinc-100 to-zinc-50'>
        <BlockMiniPreview block={getPreviewBlock(item.type)} aspect='4 / 3' />

        {/* Type pill — small accent so users can still scan block type at
            a glance, but no longer dominates the card the way the giant
            gradient hero did. */}
        <span
          className={cn(
            'absolute bottom-2 left-2 inline-flex items-center rounded-md bg-gradient-to-br px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.15em] text-white/95 uppercase shadow-sm',
            item.gradient
          )}
        >
          {item.type}
        </span>

        {/* Subtle overlay so the thumbnail dims slightly on hover, drawing
            attention to the explicit "+ add" affordance below. */}
        <div className='pointer-events-none absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10' />
      </div>

      <div className='flex flex-1 flex-col gap-1 p-3.5'>
        <div className='flex items-center justify-between gap-2'>
          <span className='text-[13.5px] font-semibold text-zinc-800'>
            {item.label}
          </span>
          {adding ? (
            <Loader2 className='size-4 animate-spin text-zinc-500' />
          ) : (
            <span className='flex size-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-400 transition-all group-hover:border-indigo-500 group-hover:bg-indigo-500 group-hover:text-white'>
              <Plus className='size-3' strokeWidth={2.5} />
            </span>
          )}
        </div>
        <p className='line-clamp-2 text-[11.5px] leading-snug text-zinc-500'>
          {item.description}
        </p>
      </div>
    </div>
  );
}
