'use client';

/**
 * DEV preview cho DATA-BLOCK (src/components/modules/block-editor/blocks/*).
 *
 * Layout: top bar fixed (gọn, không chiếm layout) + vùng cuộn full viewport làm SCROLLER → block render
 * qua RenderBlock + content mặc định (createBlock) trong LandingMotionRoot
 * (scroller = vùng cuộn). Sticky/pin/scrub của block neo đúng vào vùng cuộn (như
 * PreviewMode / /p), không bị toolbar che. Sửa file block → save → hot-reload.
 *
 * URL: /dev/blocks?type=framer_arpeggio_hero_v2
 */
import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import { cn } from '@/lib/cn';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/block-editor/factory';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  BLOCK_TYPE_META,
  type BlockType,
} from '@/components/modules/block-editor/types';

const TYPES = (Object.keys(BLOCK_TYPE_META) as BlockType[]).sort((a, b) =>
  (BLOCK_TYPE_META[a]?.label ?? a).localeCompare(BLOCK_TYPE_META[b]?.label ?? b)
);
const DEVICES = [
  { id: 'desktop', icon: Monitor, w: null as number | null },
  { id: 'tablet', icon: Tablet, w: 834 },
  { id: 'mobile', icon: Smartphone, w: 390 },
] as const;
type DeviceId = (typeof DEVICES)[number]['id'];

export default function DevBlocksPage() {
  const [type, setType] = React.useState<BlockType>('framer_arpeggio_hero_v2');
  const [device, setDevice] = React.useState<DeviceId>('desktop');
  const scrollerRef = React.useRef<HTMLDivElement>(null);

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
  const width = DEVICES.find(d => d.id === device)!.w;

  return (
    <div className='relative h-screen bg-neutral-900'>
      {/* ── Top bar fixed, gọn — không chiếm chiều cao layout ───────── */}
      <header className='fixed inset-x-0 top-0 z-50 flex h-7 items-center gap-2 border-b border-white/10 bg-[#0d0d10]/90 px-2 backdrop-blur-sm'>
        <span className='shrink-0 text-[8px] font-bold tracking-[0.16em] text-amber-400/90 uppercase'>
          Dev
        </span>

        <select
          value={type}
          onChange={e => setType(e.target.value as BlockType)}
          aria-label='Block type'
          className='h-[18px] max-w-[200px] min-w-0 flex-1 truncate rounded border border-white/15 bg-white/5 px-1 py-0 text-[9px]! leading-none text-white outline-none focus:border-amber-400 sm:max-w-[240px] sm:min-w-[160px] sm:flex-none'
        >
          {TYPES.map(t => (
            <option key={t} value={t} className='bg-[#0d0d10] text-[9px]'>
              {BLOCK_TYPE_META[t]?.label ?? t}
            </option>
          ))}
        </select>

        <code className='hidden max-w-[120px] truncate text-[8px] text-white/35 md:block'>
          {type}
        </code>

        <div className='ml-auto flex shrink-0 items-center gap-0.5 rounded border border-white/10 bg-white/5 p-px'>
          {DEVICES.map(({ id, icon: Icon, w }) => (
            <button
              key={id}
              type='button'
              onClick={() => setDevice(id)}
              title={`${id}${w ? ` · ${w}px` : ' · full'}`}
              aria-label={`${id} preview`}
              aria-pressed={device === id}
              className={cn(
                'flex size-5 items-center justify-center rounded-sm transition-colors',
                device === id
                  ? 'bg-amber-400 text-neutral-900'
                  : 'text-white/60 hover:bg-white/10'
              )}
            >
              <Icon className='size-3' />
            </button>
          ))}
        </div>
      </header>

      {/* ── Vùng cuộn full viewport = scroller cho block ─────────────── */}
      <div
        ref={scrollerRef}
        className='relative h-screen overflow-auto bg-neutral-200'
      >
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <div
            className='mx-auto bg-white'
            style={
              width
                ? { maxWidth: width, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }
                : undefined
            }
          >
            <RenderBlock
              key={`${type}:${device}`}
              block={block}
              content={block.contentVi.desktop}
            />
          </div>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
