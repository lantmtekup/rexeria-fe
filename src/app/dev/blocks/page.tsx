'use client';

/**
 * DEV preview cho DATA-BLOCK (src/components/modules/block-editor/blocks/*).
 *
 * Render thẳng 1 block qua RenderBlock + content mặc định (createBlock) trong
 * LandingMotionRoot (window scroll + Lenis) → xem như 1 page thật: full-bleed,
 * scroll-animation (scrub/pin/reveal) chạy đúng, KHÔNG cần DB/publish/editor.
 * Sửa file block → save → hot-reload thấy ngay. Đổi block bằng dropdown (lưu ?type).
 *
 * URL: /dev/blocks?type=mint_vault_collection
 */
import * as React from 'react';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/block-editor/factory';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  BLOCK_TYPE_META,
  type BlockType,
} from '@/components/modules/block-editor/types';

const TYPES = (Object.keys(BLOCK_TYPE_META) as BlockType[]).sort();
const DEVICE_W: Record<string, number | null> = {
  desktop: null,
  tablet: 834,
  mobile: 390,
};

export default function DevBlocksPage() {
  const [type, setType] = React.useState<BlockType>('mint_vault_hero');
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>(
    'desktop'
  );

  // Khởi tạo type từ ?type= (nếu có) + ghi lại khi đổi (reload giữ lựa chọn).
  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('type');
    if (q && (TYPES as string[]).includes(q)) setType(q as BlockType);
  }, []);
  React.useEffect(() => {
    const u = new URL(window.location.href);
    u.searchParams.set('type', type);
    window.history.replaceState(null, '', u.toString());
  }, [type]);

  const block = React.useMemo(() => createBlock(type), [type]);
  const width = DEVICE_W[device];

  return (
    <div className='min-h-screen bg-white'>
      {/* Toolbar nổi — không chắn block (fixed). */}
      <div className='fixed top-3 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur'>
        <span className='text-[10px] font-semibold tracking-[0.18em] text-neutral-400 uppercase'>
          dev
        </span>
        <select
          value={type}
          onChange={e => setType(e.target.value as BlockType)}
          className='h-8 max-w-[260px] rounded-md border border-black/10 bg-white px-2 text-sm outline-none'
        >
          {TYPES.map(t => (
            <option key={t} value={t}>
              {BLOCK_TYPE_META[t]?.label ?? t} — {t}
            </option>
          ))}
        </select>
        <div className='flex gap-0.5'>
          {(['desktop', 'tablet', 'mobile'] as const).map(d => (
            <button
              key={d}
              type='button'
              onClick={() => setDevice(d)}
              className={`rounded px-2 py-1 text-[11px] ${device === d ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
            >
              {d[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Render block như 1 page — window scroll + Lenis → scroll-anim chạy. */}
      <LandingMotionRoot enableSmooth>
        <div
          className='mx-auto'
          style={width ? { maxWidth: width } : undefined}
        >
          <RenderBlock
            key={`${type}:${device}`}
            block={block}
            content={block.contentVi.desktop}
          />
        </div>
      </LandingMotionRoot>
    </div>
  );
}
