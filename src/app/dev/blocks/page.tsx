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
 *  - `?inline=<key>`     → đọc 1 `Block` JSON đã stash vào `localStorage[key]`
 *    (không fetch BE). Dùng cho block SỐNG TRONG TEMPLATE (bản copy inline
 *    trong canvas_blueprint, không có id ở thư viện Blocks) — ví dụ nút "xem
 *    block" ở danh sách block-của-template trong Admin Templates.
 *
 * Layout: top bar fixed (gọn) + vùng cuộn full viewport làm SCROLLER → block
 * render qua RenderBlock trong LandingMotionRoot (scroller = vùng cuộn).
 * Sticky/pin/scrub neo đúng vào vùng cuộn (như PreviewMode / /p). Motion config
 * của block thật được áp qua MotionProvider giống PreviewMode.
 * Placeholder `min-h-[100dvh]` trên/dưới block tạo room để cuộn vào/thoát block.
 *
 * URL: /dev/blocks?type=framer_arpeggio_hero_v2  hoặc  /dev/blocks?id=<uuid>
 *      hoặc /dev/blocks?inline=<localStorage key>
 */
import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';
import { BlockMiniPreview } from '@/components/modules/block-editor/BlockMiniPreview';
import { BlockReviewNoteDialog } from '@/components/modules/Blocks/BlockReviewNoteDialog';
import { DevPreviewToolbar } from '@/components/modules/block-editor/DevPreviewToolbar';
import { DevicePreviewFrame } from '@/components/modules/block-editor/DevicePreviewFrame';
import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { createBlock } from '@/components/modules/block-editor/factory';
import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import {
  LandingMotionRoot,
  useLandingMotion,
} from '@/components/modules/block-editor/motion/LandingMotion';
import {
  MotionProvider,
  MotionBlockRoot,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import { ScrollRoomPlaceholder } from '@/components/modules/block-editor/ScrollRoomPlaceholder';
import {
  BLOCK_TYPE_META,
  readVariant,
  type Block,
  type BlockType,
  type Device,
} from '@/components/modules/block-editor/types';
import type { Block as ApiBlock } from '@/services/rexer/types';

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

/** Reset scroll + refresh ScrollTrigger khi toggle scroll room (DOM height đổi). */
function DevPreviewScrollSync({
  showScrollRoom,
  scrollerRef,
}: {
  showScrollRoom: boolean;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { requestRefresh } = useLandingMotion();

  React.useLayoutEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
    requestRefresh();
  }, [showScrollRoom, requestRefresh, scrollerRef]);

  return null;
}

export default function DevBlocksPage() {
  const [routeReady, setRouteReady] = React.useState(false);
  const [device, setDevice] = React.useState<Device>('desktop');
  const [showScrollRoom, setShowScrollRoom] = React.useState(true);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Chế độ render: 'type' (default content theo type), 'id' (block thật từ
  // BE) hoặc 'inline' (Block JSON stash sẵn ở localStorage — block-của-template).
  const [mode, setMode] = React.useState<'type' | 'id' | 'inline'>('type');
  const [type, setType] = React.useState<BlockType>('framer_arpeggio_hero_v2');
  const [blockId, setBlockId] = React.useState<string | null>(null);
  const [inlineKey, setInlineKey] = React.useState<string | null>(null);
  const [fetched, setFetched] = React.useState<Block | null>(null);
  const [apiBlock, setApiBlock] = React.useState<ApiBlock | null>(null);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
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
    const inline = sp.get('inline');
    if (inline) {
      setMode('inline');
      setInlineKey(inline);
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

  // inline-mode: đọc Block JSON stash sẵn ở localStorage (không fetch BE) —
  // dùng cho block-của-template (bản copy, không có id thư viện). Dọn key
  // sau khi đọc — chỉ dùng 1 lần cho 1 tab.
  React.useEffect(() => {
    if (mode !== 'inline' || !inlineKey) return;
    setLoadErr(null);
    setFetched(null);
    try {
      const raw = window.localStorage.getItem(inlineKey);
      if (!raw) {
        setLoadErr('Không tìm thấy dữ liệu block (đã đọc hoặc hết hạn).');
        return;
      }
      const editor = parseEditorBlock(JSON.parse(raw));
      if (!editor) {
        setLoadErr('Dữ liệu block không hợp lệ để preview.');
        return;
      }
      setFetched(editor);
      setType(editor.blockType);
    } catch {
      setLoadErr('Lỗi đọc dữ liệu block.');
    } finally {
      window.localStorage.removeItem(inlineKey);
    }
  }, [mode, inlineKey]);

  // id-mode: fetch block thật, parse settings → editor Block.
  React.useEffect(() => {
    if (mode !== 'id' || !blockId) return;
    let alive = true;
    setLoadErr(null);
    setFetched(null);
    setApiBlock(null);
    rexerApi.blocks
      .get(blockId)
      .then(b => {
        if (!alive) return;
        setApiBlock(b);
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
    setInlineKey(null);
    setFetched(null);
    setApiBlock(null);
    setLoadErr(null);
    setType(t);
    const u = new URL(window.location.href);
    u.searchParams.set('type', t);
    u.searchParams.delete('id');
    u.searchParams.delete('inline');
    window.history.replaceState(null, '', u.toString());
  };

  // Block để render: id/inline-mode dùng block fetch/stash về; type-mode dùng default.
  const block = React.useMemo<Block | null>(
    () => (mode === 'id' || mode === 'inline' ? fetched : createBlock(type)),
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
      {view !== 'gallery' ? (
        <DevPreviewToolbar
          device={device}
          onDeviceChange={setDevice}
          showScrollRoom={showScrollRoom}
          onToggleScrollRoom={() => setShowScrollRoom(v => !v)}
          onFeedback={
            mode === 'id' && apiBlock ? () => setFeedbackOpen(true) : undefined
          }
          hasFeedbackNote={!!apiBlock?.review_note?.trim()}
        />
      ) : null}

      <BlockReviewNoteDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        block={apiBlock}
        onSaved={setApiBlock}
      />

      {/* ── Gallery: design CHƯA mapping (?view=unmapped) ──────────────── */}
      {view === 'gallery' ? (
        <div className='h-screen overflow-auto bg-neutral-950 px-4 py-6 pb-16'>
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
        className='relative h-screen overflow-hidden bg-neutral-200'
      >
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <DevicePreviewFrame
            device={device}
            chromeOffset='0px'
            scrollerRef={scrollerRef}
          >
            {!routeReady ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-400'>
                Đang chuẩn bị preview…
              </div>
            ) : (mode === 'id' || mode === 'inline') && loadErr ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-500'>
                {loadErr}
              </div>
            ) : (mode === 'id' || mode === 'inline') && !block ? (
              <div className='flex min-h-screen items-center justify-center px-6 text-center text-sm text-neutral-400'>
                Đang tải block…
              </div>
            ) : block && resolved ? (
              <>
                <DevPreviewScrollSync
                  showScrollRoom={showScrollRoom}
                  scrollerRef={scrollerRef}
                />
                {showScrollRoom ? (
                  <ScrollRoomPlaceholder
                    label='Scroll vào block'
                    scrollHint='down'
                  />
                ) : null}
                <MotionProvider
                  key={`${mode}:${block.id ?? type}:${device}:scroll-${showScrollRoom ? 1 : 0}`}
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
                {showScrollRoom ? (
                  <ScrollRoomPlaceholder label='Scroll thoát block' />
                ) : null}
              </>
            ) : null}
          </DevicePreviewFrame>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
