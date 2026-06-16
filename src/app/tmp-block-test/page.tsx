'use client';

// DEMO TẠM — verify transition cấp template (6 preset). Xoá khi xong.
import * as React from 'react';

import { RenderBlock } from '@/components/modules/CanvasTemplate/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/CanvasTemplate/block-editor/factory';
import { SmoothScroll } from '@/components/modules/CanvasTemplate/block-editor/transitions/SmoothScroll';
import {
  TemplateTransitions,
  isVerticalTransition,
  type TemplateTransition,
} from '@/components/modules/CanvasTemplate/block-editor/transitions/TemplateTransitions';
import { TransitionSelect } from '@/components/modules/CanvasTemplate/block-editor/transitions/TransitionSelect';
import {
  readVariant,
  type BlockType,
} from '@/components/modules/CanvasTemplate/block-editor/types';
import { COINS } from '../tmp-vault/coins';

// Ảnh coin (RCM 2026) để bơm vào các block gallery/trail thay ảnh mặc định.
const COIN_IMAGES = COINS.slice(0, 10).map(c => c.image);

// Override content cho 1 số block → hiển thị đồng tiền thay ảnh mẫu.
const COIN_CONTENT: Partial<Record<BlockType, Record<string, unknown>>> = {
  gallery_3d_depth: {
    eyebrow: 'RCM · 2026',
    title: 'Bộ sưu tập đồng tiền',
    images: COIN_IMAGES.slice(0, 6),
  },
  image_trail: {
    eyebrow: 'Di chuột qua',
    title: 'Khám phá đồng tiền nổi bật',
    images: COIN_IMAGES,
  },
};

// Tất cả block animation.
const TYPES: BlockType[] = [
  'card_showcase',
  'story_slides',
  'flip_showreel',
  'peel_reveal',
  'accordion_media',
  'pricing_table',
  'image_banner',
  'video_gallery',
  'spotlight',
  'process_steps',
  'dot_matrix',
  'interactive_grid',
  'pixel_reveal',
  'text_displace_hero',
  'gallery_3d_depth',
  'hover_reveal_list',
  'parallax_hero',
  'hover_grid_reveal',
  'hover_equalizer_heading',
  'image_trail',
  'image_explosion',
  'lightbox_flip',
  'letter_slider',
  'svg_morph_overlay',
  'gallery_pan_lens',
  'product_spec_sheet',
  'marquee_band',
  'seamless_scroll_gallery',
  'flip_gallery',
  'wheel_gallery',
  'sticky_scroll_cards',
];

function BlockNode({ type }: { type: BlockType }) {
  // nonce: bấm Replay → remount block → IO/rAF/timeline chạy lại từ đầu.
  const [nonce, setNonce] = React.useState(0);
  const block = React.useMemo(() => createBlock(type), [type]);
  const base = readVariant(block.contentVi, 'desktop')!;
  const content = COIN_CONTENT[type]
    ? { ...base, ...COIN_CONTENT[type] }
    : base;
  return (
    <div
      data-block={type}
      className='relative overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5'
    >
      <div className='pointer-events-none absolute top-2 right-2 z-50 flex items-center gap-2'>
        <span className='rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-white'>
          {type}
        </span>
        <button
          type='button'
          onClick={() => setNonce(n => n + 1)}
          className='pointer-events-auto rounded bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-black shadow hover:bg-white'
        >
          ↻ Replay
        </button>
      </div>
      <div key={nonce}>
        <RenderBlock block={block} content={content} />
      </div>
    </div>
  );
}

export default function TmpBlockTest() {
  const [t, setT] = React.useState<TemplateTransition>('fade');
  const items = React.useMemo(
    () => TYPES.map(type => <BlockNode key={type} type={type} />),
    []
  );

  return (
    <div className='min-h-screen bg-neutral-100'>
      <div className='sticky top-0 z-50 flex flex-wrap items-center gap-3 bg-neutral-900 px-6 py-3 text-white'>
        <span className='text-sm font-semibold'>Template transition demo</span>
        <span className='text-xs text-white/40'>· chọn ở góc dưới-trái</span>
      </div>
      <div className='fixed bottom-4 left-4 z-[60]'>
        <TransitionSelect value={t} onChange={setT} />
      </div>

      <SmoothScroll enabled={isVerticalTransition(t)}>
        <main
          key={t}
          className='@container mx-auto w-full max-w-[1280px] px-4 py-6 md:py-10'
        >
          <TemplateTransitions transition={t} items={items} />
        </main>
      </SmoothScroll>
    </div>
  );
}
