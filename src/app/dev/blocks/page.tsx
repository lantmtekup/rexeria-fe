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
import { LayoutGrid, Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { BlockMiniPreview } from '@/components/modules/block-editor/BlockMiniPreview';
import { DevicePreviewFrame } from '@/components/modules/block-editor/DevicePreviewFrame';
import { DeviceSwitcher } from '@/components/modules/block-editor/DeviceSwitcher';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/block-editor/factory';
import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
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
  type Device,
} from '@/components/modules/block-editor/types';

const TYPES = (Object.keys(BLOCK_TYPE_META) as BlockType[]).sort((a, b) =>
  (BLOCK_TYPE_META[a]?.label ?? a).localeCompare(BLOCK_TYPE_META[b]?.label ?? b)
);

/** Parse `Block.settings` (BE) → editor Block. FE ghi nguyên editor Block vào
 *  settings lúc tạo nên round-trip được. Null nếu shape không hợp lệ. */
function parseEditorBlock(
  settings: Record<string, unknown> | undefined
): Block | null {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  // migrate thay vì cast thẳng: settings dạng cũ (content phẳng) được bọc
  // {desktop} — no-op với block đã đúng shape.
  return migrateBlockV1toV2(settings);
}

export default function DevBlocksPage() {
  const [routeReady, setRouteReady] = React.useState(false);
  const [device, setDevice] = React.useState<Device>('desktop');
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Chế độ render: 'type' (default content theo type) hoặc 'id' (block thật).
  const [mode, setMode] = React.useState<'type' | 'id'>('type');
  const [type, setType] = React.useState<BlockType>('framer_arpeggio_hero_v2');
  const [blockId, setBlockId] = React.useState<string | null>(null);
  const [fetched, setFetched] = React.useState<Block | null>(null);
  const [loadErr, setLoadErr] = React.useState<string | null>(null);

  // View 'gallery' = lưới design CHƯA mapping (0 instance trong DB) để duyệt +
  // xử lý gọn. `usedCodes` = type_code đã có ≥1 block (fetch từ BE 1 lần).
  const [view, setView] = React.useState<'single' | 'gallery'>('single');
  const [usedCodes, setUsedCodes] = React.useState<Set<string> | null>(null);
  const [galleryErr, setGalleryErr] = React.useState<string | null>(null);

  // Đọc query sớm (layout effect) — TRƯỚC mọi effect khác, và KHÔNG ghi đè `?id=`
  // bằng `?type=` (effect sync type cũ gây race → mọi preview rơi về arpeggio).
  React.useLayoutEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('view') === 'unmapped') {
      setView('gallery');
      setRouteReady(true);
      return;
    }
    const id = sp.get('id');
    if (id) {
      setMode('id');
      setBlockId(id);
      setRouteReady(true);
      return;
    }
    const q = sp.get('type');
    if (q && (TYPES as string[]).includes(q)) setType(q as BlockType);
    setRouteReady(true);
  }, []);

  // Gallery: fetch type_code đã dùng (mọi scope, phân trang) — 1 lần khi mở.
  React.useEffect(() => {
    if (view !== 'gallery' || usedCodes !== null) return;
    let alive = true;
    setGalleryErr(null);
    (async () => {
      try {
        const used = new Set<string>();
        for (let p = 1; p <= 20; p++) {
          const r = await rexerApi.blocks.list({ limit: 100, page: p });
          const items = r.items ?? [];
          for (const b of items) used.add(b.type_code);
          if (items.length < 100) break;
        }
        if (alive) setUsedCodes(used);
      } catch (e) {
        if (alive)
          setGalleryErr(e instanceof Error ? e.message : 'Lỗi tải danh sách.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [view, usedCodes]);

  // Design chưa mapping = type trong code mà 0 block nào dùng.
  const unmappedTypes = React.useMemo(
    () => (usedCodes ? TYPES.filter(t => !usedCodes.has(t)) : []),
    [usedCodes]
  );

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

  // Đổi dropdown / click card gallery → về single + type-mode (default content).
  const onPickType = (t: BlockType) => {
    setView('single');
    setMode('type');
    setBlockId(null);
    setFetched(null);
    setLoadErr(null);
    setType(t);
    const u = new URL(window.location.href);
    u.searchParams.set('type', t);
    u.searchParams.delete('id');
    window.history.replaceState(null, '', u.toString());
  };

  // Block để render: id-mode dùng block fetch về; type-mode dùng default.
  const block = React.useMemo<Block | null>(
    () => (mode === 'id' ? fetched : createBlock(type)),
    [mode, fetched, type]
  );

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

        {/* Toggle gallery "Chưa mapping" */}
        <button
          type='button'
          onClick={() => setView(v => (v === 'gallery' ? 'single' : 'gallery'))}
          aria-pressed={view === 'gallery'}
          title='Design chưa mapping'
          className={cn(
            'ml-auto flex h-[18px] shrink-0 items-center gap-1 rounded border px-1.5 text-[9px] leading-none transition-colors',
            view === 'gallery'
              ? 'border-amber-400 bg-amber-400 text-neutral-900'
              : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
          )}
        >
          <LayoutGrid className='size-2.5' />
          Chưa mapping
        </button>

        <DeviceSwitcher
          device={device}
          onChange={setDevice}
          variant='preview'
        />
      </header>

      {/* ── Gallery: design CHƯA mapping ─────────────────────────────── */}
      {view === 'gallery' ? (
        <div className='h-screen overflow-auto bg-neutral-950 px-4 pt-10 pb-16'>
          <div className='mx-auto max-w-6xl'>
            {galleryErr ? (
              <p className='py-12 text-center text-sm text-red-400'>
                {galleryErr}
              </p>
            ) : usedCodes === null ? (
              <p className='flex items-center justify-center gap-2 py-12 text-sm text-white/50'>
                <Loader2 className='size-4 animate-spin' /> Đang đối chiếu DB…
              </p>
            ) : (
              <>
                <div className='mb-4 flex items-baseline gap-2'>
                  <h1 className='text-sm font-semibold text-white'>
                    Design chưa mapping
                  </h1>
                  <span className='text-xs text-white/40'>
                    {unmappedTypes.length} / {TYPES.length} type · 0 instance
                  </span>
                </div>
                {unmappedTypes.length === 0 ? (
                  <p className='py-12 text-center text-sm text-white/50'>
                    Mọi design đều đã được mapping 🎉
                  </p>
                ) : (
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                    {unmappedTypes.map(t => (
                      <button
                        key={t}
                        type='button'
                        onClick={() => onPickType(t)}
                        title={t}
                        className='group flex flex-col gap-1.5 overflow-hidden rounded-lg border border-white/10 bg-white/3 p-2 text-left transition-colors hover:border-amber-400/60 hover:bg-white/6'
                      >
                        <div className='overflow-hidden rounded-md border border-white/10 bg-white'>
                          <BlockMiniPreview
                            block={createBlock(t)}
                            aspect='16 / 10'
                          />
                        </div>
                        <span className='truncate px-0.5 text-[11px] font-medium text-white/80 group-hover:text-white'>
                          {BLOCK_TYPE_META[t]?.label ?? t}
                        </span>
                        <span className='truncate px-0.5 text-[9px] text-white/30'>
                          {t}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* ── Device frame = scroller (căn giữa) ───────────────────────── */}
      <div
        hidden={view === 'gallery'}
        className='relative h-screen overflow-hidden bg-neutral-200 pt-7'
      >
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <DevicePreviewFrame
            device={device}
            chromeOffset='1.75rem'
            scrollerRef={scrollerRef}
          >
            {!routeReady ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-400'>
                Đang chuẩn bị preview…
              </div>
            ) : mode === 'id' && loadErr ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-500'>
                {loadErr}
              </div>
            ) : mode === 'id' && !block ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-400'>
                Đang tải block…
              </div>
            ) : block && resolved ? (
              <MotionProvider
                key={`${mode}:${block.id ?? type}:${device}`}
                mode='preview'
                motion={resolved.motion}
                scrollerEl={scrollerRef.current}
              >
                <MotionBlockRoot className='h-full'>
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
          </DevicePreviewFrame>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
