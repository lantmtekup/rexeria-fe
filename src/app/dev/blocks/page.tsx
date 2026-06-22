'use client';

/**
 * DEV preview cho DATA-BLOCK (src/components/modules/block-editor/blocks/*).
 *
 * Layout: top bar (không đè block) + vùng cuộn riêng làm SCROLLER → block render
 * qua RenderBlock + content mặc định (createBlock) trong LandingMotionRoot
 * (scroller = vùng cuộn). Sticky/pin/scrub của block neo đúng vào vùng cuộn (như
 * PreviewMode / /p), không bị toolbar che. Sửa file block → save → hot-reload.
 *
 * URL: /dev/blocks?type=mint_vault_collection
 */
import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

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
  const [type, setType] = React.useState<BlockType>('mint_vault_hero');
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
    <div className='flex h-screen flex-col bg-neutral-900'>
      {/* ── Top bar (không đè block) ───────────────────────────────── */}
      <header className='flex h-12 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d0d10] px-4 text-white'>
        <span className='text-[10px] font-bold tracking-[0.22em] text-amber-400/90 uppercase'>
          Dev · Block
        </span>

        <select
          value={type}
          onChange={e => setType(e.target.value as BlockType)}
          className='h-8 max-w-[300px] min-w-[220px] rounded-md border border-white/15 bg-white/5 px-2 text-sm text-white outline-none focus:border-amber-400'
        >
          {TYPES.map(t => (
            <option key={t} value={t} className='bg-[#0d0d10]'>
              {BLOCK_TYPE_META[t]?.label ?? t}
            </option>
          ))}
        </select>

        <code className='hidden text-xs text-white/40 sm:block'>{type}</code>

        <div className='ml-auto flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5'>
          {DEVICES.map(({ id, icon: Icon, w }) => (
            <button
              key={id}
              type='button'
              onClick={() => setDevice(id)}
              title={`${id}${w ? ` · ${w}px` : ' · full'}`}
              className={`flex size-7 items-center justify-center rounded transition-colors ${
                device === id
                  ? 'bg-amber-400 text-neutral-900'
                  : 'text-white/60 hover:bg-white/10'
              }`}
            >
              <Icon className='size-4' />
            </button>
          ))}
        </div>
      </header>

      {/* ── Vùng cuộn = scroller cho block (sticky/pin neo vào đây) ──── */}
      <div
        ref={scrollerRef}
        className='relative flex-1 overflow-auto bg-neutral-200'
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
