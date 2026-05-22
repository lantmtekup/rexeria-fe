'use client';

/**
 * "Add from system catalog" picker for `/admin/blocks` (and the brand
 * portal mirror at `/portal/blocks`). Lists the 14 built-in block types
 * with a search bar; clicking one seeds a `SavedBlock` from the factory
 * and writes it into the user's local library so they can customise +
 * reuse it later.
 *
 * Built-ins are the FE catalog (factory.ts) — no BE call needed. When BE
 * ships server-backed saved-blocks (be-todo.md P1.5), the save call will
 * automatically use that layer because the savedBlocks helper hides the
 * storage.
 */

import * as React from 'react';
import { Loader2, Plus, Search, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { createBlock } from '@/components/modules/CanvasTemplate/block-editor/factory';
import { saveBlock } from '@/components/modules/CanvasTemplate/block-editor/savedBlocks';
import type { BlockType } from '@/components/modules/CanvasTemplate/block-editor/types';
import { cn } from '@/lib/cn';

interface CatalogItem {
  type: BlockType;
  label: string;
  description: string;
  gradient: string;
}

const CATALOG: CatalogItem[] = [
  {
    type: 'hero_split',
    label: 'Hero Split',
    description: 'Tiêu đề + ảnh chia đôi màn hình, có CTA + stats.',
    gradient: 'from-rose-400 to-red-500',
  },
  {
    type: 'hero_overlay',
    label: 'Hero Overlay',
    description: 'Ảnh nền full-width + tag + tiêu đề + CTA chính.',
    gradient: 'from-zinc-700 to-zinc-900',
  },
  {
    type: 'feature_section',
    label: 'Tiện ích nổi bật',
    description: '3 cột feature có icon + label + body — đặt sau hero.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    type: 'photo_gallery',
    label: 'Thư viện ảnh',
    description: 'Grid ảnh dạng mosaic, lightbox khi click.',
    gradient: 'from-pink-400 to-fuchsia-500',
  },
  {
    type: 'booking_form',
    label: 'Đặt chỗ / Booking',
    description: 'Form thu lead — tên, sđt, ngày tham quan.',
    gradient: 'from-blue-500 to-violet-500',
  },
  {
    type: 'cta_section',
    label: 'CTA Section',
    description: 'Khối kêu gọi hành động cuối trang, single + outline buttons.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    type: 'image_carousel',
    label: 'Slide ảnh',
    description: 'Carousel ngang có chấm điều hướng + caption mỗi slide.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    type: 'stories',
    label: 'Stories',
    description: 'Instagram-style slides chuyển động, tap để next.',
    gradient: 'from-orange-400 to-pink-500',
  },
  {
    type: 'split_screen',
    label: 'Split Screen',
    description: '2 tab view chia đôi, click chuyển nội dung.',
    gradient: 'from-slate-500 to-zinc-600',
  },
  {
    type: 'quiz',
    label: 'Quiz',
    description: 'Hỏi-đáp tương tác có kết quả phân loại người dùng.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    type: 'poll',
    label: 'Bình chọn',
    description: 'Vote nhanh nhiều lựa chọn, hiện tỉ lệ real-time.',
    gradient: 'from-indigo-500 to-blue-600',
  },
  {
    type: 'carousel_3d',
    label: 'Coverflow 3D',
    description: 'Carousel 3D xoay cover-style — showcase sản phẩm cao cấp.',
    gradient: 'from-fuchsia-500 to-pink-600',
  },
  {
    type: 'flipbook',
    label: 'Flipbook',
    description: 'Lật trang như sách — catalog PDF-style cho brochure.',
    gradient: 'from-amber-500 to-yellow-500',
  },
  {
    type: 'panorama',
    label: 'Panorama 360°',
    description: 'Ảnh xoay 360 độ drag-to-rotate cho real estate / tour.',
    gradient: 'from-sky-500 to-cyan-600',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires after a built-in block is added to the saved-blocks library. */
  onAdded?: (id: string) => void;
}

export function AddBuiltinBlockDialog({ open, onClose, onAdded }: Props) {
  const [search, setSearch] = React.useState('');
  const [adding, setAdding] = React.useState<BlockType | null>(null);

  React.useEffect(() => {
    if (open) setSearch('');
  }, [open]);

  if (!open) return null;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? CATALOG.filter(
        c =>
          c.label.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    : CATALOG;

  const handleAdd = (item: CatalogItem) => {
    setAdding(item.type);
    try {
      const block = createBlock(item.type);
      const saved = saveBlock(item.label, block);
      toast.success(`Đã thêm "${saved.name}" vào thư viện`);
      onAdded?.(saved.id);
      onClose();
    } catch (err) {
      toast.error(
        `Không thêm được: ${err instanceof Error ? err.message : 'unknown'}`
      );
    } finally {
      setAdding(null);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-8 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
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

        {/* Search */}
        <div className='border-b border-zinc-100 bg-zinc-50/30 px-5 py-3'>
          <div className='relative max-w-md'>
            <Search className='absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-zinc-400' />
            <input
              type='text'
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Tìm theo tên / type / mô tả…'
              className='w-full rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8 text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </div>
        </div>

        {/* Grid */}
        <div className='max-h-[60vh] overflow-y-auto p-5'>
          {filtered.length === 0 ? (
            <div className='py-12 text-center text-sm text-zinc-500'>
              Không có block khớp tìm kiếm.
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {filtered.map(item => {
                const isAdding = adding === item.type;
                return (
                  <button
                    key={item.type}
                    type='button'
                    onClick={() => handleAdd(item)}
                    disabled={isAdding}
                    className={cn(
                      'group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md disabled:cursor-wait disabled:opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'relative h-24 bg-gradient-to-br',
                        item.gradient,
                        'flex items-center justify-center'
                      )}
                    >
                      <span className='font-mono text-[10px] font-bold tracking-widest text-white/80 uppercase'>
                        {item.type}
                      </span>
                    </div>
                    <div className='flex flex-1 flex-col gap-1 p-3'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-[13px] font-semibold text-zinc-800'>
                          {item.label}
                        </span>
                        {isAdding ? (
                          <Loader2 className='size-3.5 animate-spin text-zinc-500' />
                        ) : (
                          <Plus className='size-3.5 text-zinc-300 group-hover:text-indigo-500' />
                        )}
                      </div>
                      <p className='line-clamp-2 text-[11.5px] leading-snug text-zinc-500'>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className='border-t border-zinc-100 bg-zinc-50/40 px-5 py-2 text-[11px] text-zinc-500'>
          Sau khi thêm, block sẽ xuất hiện trong thư viện. Click{' '}
          <em>Sửa trong canvas</em> để mở editor và tuỳ chỉnh nội dung.
        </div>
      </div>
    </div>
  );
}
