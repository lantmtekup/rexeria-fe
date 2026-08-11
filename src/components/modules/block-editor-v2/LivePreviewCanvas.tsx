'use client';

/**
 * The block list of a preview, without any chrome.
 *
 * Extracted from `PreviewMode` so the same render path serves both the legacy
 * dark overlay and the shopper-view shell's `/embed/canvas` frame. Everything
 * that decides *fidelity* lives here — lang/device variant resolution, link
 * resolution, template transitions, `MotionProvider(mode='preview')`. Callers
 * own the frame, the scroller and `LandingMotionRoot`.
 *
 * Page navigation is internal state because a CTA click inside a block goes
 * through `LinkNav`, not through the caller.
 */

import * as React from 'react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import { LinkNav } from '@/components/modules/block-editor/links/LinkNav';
import { blockAnchorId } from '@/components/modules/block-editor/links/linkToken';
import { resolveLinksDeep } from '@/components/modules/block-editor/links/resolveLinks';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import type { EditorPage } from '@/components/modules/block-editor/serialize';
import {
  TemplateTransitions,
  asTransition,
} from '@/components/modules/block-editor/transitions/TemplateTransitions';
import {
  readVariant,
  type Block,
  type Device,
  type Lang,
} from '@/components/modules/block-editor/types';

import { ScrollRoomPlaceholder } from './ScrollRoomPlaceholder';

interface LivePreviewCanvasProps {
  /** Flat list — used when `pages` is absent (single-block harnesses). */
  blocks: Block[];
  lang: Lang;
  device: Device;
  /** Preset transition cấp template (none/fade/roll-up/swipe/tabs/parallax). */
  transition?: string;
  /** Every page of the template, so CTAs can be clicked through. */
  pages?: EditorPage[];
  initialPageId?: string;
  /** Scroll container for ScrollTrigger. Omit → window (iframe/`/p` render). */
  scrollerEl?: HTMLElement | null;
  /** Called on page navigation so the caller can reset its scroller. */
  onNavigate?: () => void;
  /** Fired once the first block list is mounted — clears the host overlay. */
  onPainted?: () => void;
}

export function LivePreviewCanvas({
  blocks,
  lang,
  device,
  transition,
  pages,
  initialPageId,
  scrollerEl,
  onNavigate,
  onPainted,
}: LivePreviewCanvasProps) {
  const [activePageId, setActivePageId] = React.useState<string | null>(
    initialPageId ?? null
  );

  const multiPage = !!pages && pages.length > 0;
  const activePage = multiPage
    ? (pages.find(p => p.id === activePageId) ??
      pages.find(p => p.isHome) ??
      pages[0])
    : null;
  const pageBlocks = activePage ? activePage.blocks : blocks;

  const linkCtx = React.useMemo(
    () => ({
      pages: (pages ?? []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        isHome: p.isHome,
        blocks: p.blocks,
      })),
      // Preview has no public URL; `resolveLinksDeep` in `preview` mode never
      // builds a path, so the root slug is only a placeholder.
      rootSlug: '',
      mode: 'preview' as const,
    }),
    [pages]
  );

  const handleNavigatePage = React.useCallback(
    (id: string) => {
      setActivePageId(id);
      onNavigate?.();
    },
    [onNavigate]
  );

  const onPaintedRef = React.useRef(onPainted);
  onPaintedRef.current = onPainted;
  React.useEffect(() => {
    onPaintedRef.current?.();
  }, []);

  const visible = pageBlocks.filter(b => b.isVisible);

  return (
    <LinkNav
      mode='preview'
      onNavigatePage={handleNavigatePage}
      // Remount the whole list on page change so every MotionProvider and
      // gsap.context is rebuilt cleanly instead of being reused across two
      // different block sets.
      key={activePage?.id ?? 'single'}
    >
      {/* Mirror BlockPreview: resolve `token:*` colors/fonts in Play. */}
      <div style={brandKitToCssVars(DEFAULT_PREVIEW_KIT)}>
        {visible.length === 0 ? (
          <div className='flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500'>
            {activePage
              ? `Trang "${activePage.name}" chưa có block nào hiển thị.`
              : 'Chưa có block nào hiển thị.'}
          </div>
        ) : (
          <>
            {/* 1 block: thêm room trên/dưới để sticky/scrub chạy được. */}
            {visible.length === 1 ? (
              <ScrollRoomPlaceholder
                label='Scroll vào block'
                scrollHint='down'
              />
            ) : null}
            <TemplateTransitions
              transition={asTransition(transition)}
              className='gap-0!'
              items={visible.map(block => {
                const langContent =
                  lang === 'vi' ? block.contentVi : block.contentEn;
                const content = resolveLinksDeep(
                  readVariant(langContent, device) ?? langContent.desktop,
                  linkCtx
                );
                const styles = readVariant(block.elementStyles, device);
                const background = readVariant(block.background, device);
                const order = readVariant(block.elementOrder, device);
                const motion = readVariant(block.motion, device) as
                  BlockMotion | undefined;
                return (
                  <MotionProvider
                    key={`${block.id}:${device}`}
                    mode='preview'
                    motion={motion}
                    scrollerEl={scrollerEl}
                  >
                    {/* Neo `#blk-<id>` giống `/p` — link "Cuộn tới block"
                        (`#block:` → `#blk-…`) chỉ cuộn được khi có phần tử
                        mang đúng id này. */}
                    <div
                      id={blockAnchorId(block.id)}
                      data-block-id={block.id}
                      data-block-type={block.blockType}
                    >
                      <MotionBlockRoot>
                        <RenderBlock
                          block={block}
                          content={content}
                          styles={styles}
                          background={background}
                          order={order}
                        />
                      </MotionBlockRoot>
                    </div>
                  </MotionProvider>
                );
              })}
            />
            {visible.length === 1 ? (
              <ScrollRoomPlaceholder label='Scroll thoát block' />
            ) : null}
          </>
        )}
      </div>
    </LinkNav>
  );
}
