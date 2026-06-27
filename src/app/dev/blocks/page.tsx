'use client';

/**
 * DEV preview cho DATA-BLOCK (src/components/modules/block-editor/blocks/*).
 *
 * Hai chế độ qua query string:
 *  - `?type=<blockType>` → render DEFAULT content của type đó (createBlock) để
 *    dev xem nhanh 1 loại block. Dùng dropdown để duyệt qua các type.
 *  - `?id=<blockId>`     → fetch block thật từ BE rồi render đúng SETTINGS đã lưu
 *    (mỗi block 1 thiết kế riêng — quan trọng cho các type dùng chung như
 *    hero_split). Đây là cái nút Preview ở danh sách block mở ra.
 *
 * Layout: top bar fixed (gọn) + vùng cuộn full viewport làm SCROLLER → block
 * render qua RenderBlock trong LandingMotionRoot (scroller = vùng cuộn).
 * Sticky/pin/scrub neo đúng vào vùng cuộn (như PreviewMode / /p). Motion config
 * của block thật được áp qua MotionProvider giống PreviewMode.
 *
 * URL: /dev/blocks?type=framer_arpeggio_hero_v2  hoặc  /dev/blocks?id=<uuid>
 */
import * as React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/block-editor/factory';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  MotionProvider,
  MotionBlockRoot,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import {
  BLOCK_TYPE_META,
  readVariant,
  type Block,
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

/** Parse `Block.settings` (BE) → editor Block. FE ghi nguyên editor Block vào
 *  settings lúc tạo nên round-trip được. Null nếu shape không hợp lệ. */
function parseEditorBlock(
  settings: Record<string, unknown> | undefined
): Block | null {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  return settings as unknown as Block;
}

export default function DevBlocksPage() {
  const [device, setDevice] = React.useState<DeviceId>('desktop');
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Chế độ render: 'type' (default content theo type) hoặc 'id' (block thật).
  const [mode, setMode] = React.useState<'type' | 'id'>('type');
  const [type, setType] = React.useState<BlockType>('framer_arpeggio_hero_v2');
  const [blockId, setBlockId] = React.useState<string | null>(null);
  const [fetched, setFetched] = React.useState<Block | null>(null);
  const [loadErr, setLoadErr] = React.useState<string | null>(null);

  // Đọc query 1 lần khi mount → quyết định chế độ.
  React.useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get('id');
    if (id) {
      setMode('id');
      setBlockId(id);
      return;
    }
    const q = sp.get('type');
    if (q && (TYPES as string[]).includes(q)) setType(q as BlockType);
  }, []);

  // id-mode: fetch block thật, parse settings → editor Block.
  React.useEffect(() => {
    if (mode !== 'id' || !blockId) return;
    let alive = true;
    setLoadErr(null);
    setFetched(null);
    rexerApi.blocks
      .get(blockId)
      .then(b => {
        if (!alive) return;
        const editor = parseEditorBlock(b.settings);
        if (!editor) {
          setLoadErr(
            'Block này không có canvas data (settings rỗng / shape không tương thích) để preview.'
          );
          return;
        }
        setFetched(editor);
        setType(editor.blockType); // đồng bộ dropdown cho có ngữ cảnh
      })
      .catch(e => {
        if (alive)
          setLoadErr(e instanceof Error ? e.message : 'Lỗi tải block.');
      });
    return () => {
      alive = false;
    };
  }, [mode, blockId]);

  // type-mode: giữ URL ?type=… sync khi đổi dropdown.
  React.useEffect(() => {
    if (mode !== 'type') return;
    const u = new URL(window.location.href);
    u.searchParams.set('type', type);
    u.searchParams.delete('id');
    window.history.replaceState(null, '', u.toString());
  }, [type, mode]);

  // Đổi dropdown → luôn về type-mode (duyệt default content).
  const onPickType = (t: BlockType) => {
    setMode('type');
    setBlockId(null);
    setFetched(null);
    setLoadErr(null);
    setType(t);
  };

  // Block để render: id-mode dùng block fetch về; type-mode dùng default.
  const block = React.useMemo<Block | null>(
    () => (mode === 'id' ? fetched : createBlock(type)),
    [mode, fetched, type]
  );

  const width = DEVICES.find(d => d.id === device)!.w;
  const dev = device; // 'desktop' | 'tablet' | 'mobile' khớp Device

  // Resolve content/styles/bg/order/motion theo device (giống PreviewMode).
  const resolved = React.useMemo(() => {
    if (!block) return null;
    const content =
      readVariant(block.contentVi, dev) ?? block.contentVi.desktop;
    return {
      content,
      styles: readVariant(block.elementStyles, dev),
      background: readVariant(block.background, dev),
      order: readVariant(block.elementOrder, dev),
      motion: readVariant(block.motion, dev) as BlockMotion | undefined,
    };
  }, [block, dev]);

  return (
    <div className='relative h-screen bg-neutral-900'>
      {/* ── Top bar fixed, gọn — không chiếm chiều cao layout ───────── */}
      <header className='fixed inset-x-0 top-0 z-50 flex h-7 items-center gap-2 border-b border-white/10 bg-[#0d0d10]/90 px-2 backdrop-blur-sm'>
        <span className='shrink-0 text-[8px] font-bold tracking-[0.16em] text-amber-400/90 uppercase'>
          Dev
        </span>

        <select
          value={type}
          onChange={e => onPickType(e.target.value as BlockType)}
          aria-label='Block type'
          className='h-[18px] max-w-[200px] min-w-0 flex-1 truncate rounded border border-white/15 bg-white/5 px-1 py-0 text-[9px]! leading-none text-white outline-none focus:border-amber-400 sm:max-w-[240px] sm:min-w-[160px] sm:flex-none'
        >
          {TYPES.map(t => (
            <option key={t} value={t} className='bg-[#0d0d10] text-[9px]'>
              {BLOCK_TYPE_META[t]?.label ?? t}
            </option>
          ))}
        </select>

        <code className='hidden max-w-[160px] truncate text-[8px] text-white/35 md:block'>
          {mode === 'id' ? (fetched ? `id · ${fetched.name}` : 'id · …') : type}
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
            className='@container mx-auto bg-white'
            style={
              width
                ? { maxWidth: width, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }
                : undefined
            }
          >
            {mode === 'id' && loadErr ? (
              <div className='flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500'>
                {loadErr}
              </div>
            ) : mode === 'id' && !block ? (
              <div className='flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-400'>
                Đang tải block…
              </div>
            ) : block && resolved ? (
              <MotionProvider
                key={`${mode}:${block.id ?? type}:${device}`}
                mode='preview'
                motion={resolved.motion}
                scrollerEl={scrollerRef.current}
              >
                <MotionBlockRoot>
                  <RenderBlock
                    block={block}
                    content={resolved.content}
                    styles={resolved.styles}
                    background={resolved.background}
                    order={resolved.order}
                  />
                </MotionBlockRoot>
              </MotionProvider>
            ) : null}
          </div>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
