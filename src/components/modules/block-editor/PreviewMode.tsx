'use client';

/**
 * Full-viewport preview overlay — cùng layout/render path với `/dev/blocks`:
 * device frame = vùng cuộn (width cố định 390/834/1440), LandingMotionRoot +
 * MotionProvider(mode=preview) + RenderBlock. Sticky/pin/scrub neo vào frame.
 *
 * Khác `/dev/blocks`: nhận blocks live từ editor (chưa cần save), overlay
 * trong app (không mở tab mới).
 */

import * as React from 'react';
import { ChevronLeft, X } from 'lucide-react';

import { brandKitToCssVars, DEFAULT_PREVIEW_KIT } from '@/lib/brand-kit';

import { LinkNav } from './links/LinkNav';
import { resolveLinksDeep } from './links/resolveLinks';
import type { EditorPage } from './serialize';

import { DevicePreviewFrame } from './DevicePreviewFrame';
import { DeviceSwitcher } from './DeviceSwitcher';
import { DEVICE_FRAME_WIDTH } from './deviceFrame';
import { LandingMotionRoot } from './motion/LandingMotion';
import { RenderBlock } from './blocks/renderBlock';
import { MotionBlockRoot, MotionProvider } from './motion/runtime';
import type { BlockMotion } from './motion/types';
import {
  TemplateTransitions,
  asTransition,
} from './transitions/TemplateTransitions';
import { readVariant, type Block, type Device, type Lang } from './types';

/** PreviewMode chrome bar = h-7 */
const PREVIEW_CHROME = '1.75rem';

interface PreviewModeProps {
  blocks: Block[];
  lang: Lang;
  onClose: () => void;
  /** Preset transition cấp template (none/fade/roll-up/swipe/tabs/parallax). */
  transition?: string;
  /** Device đang chọn trên canvas editor — giữ khi mở preview. */
  initialDevice?: Device;
  /** Every page of the template, so CTAs can be clicked through. Optional:
   *  callers that only have a flat block list (`/dev/blocks`) keep working and
   *  simply get no page navigation. */
  pages?: EditorPage[];
  initialPageId?: string;
}

export function PreviewMode({
  blocks,
  lang,
  onClose,
  transition,
  initialDevice = 'desktop',
  pages,
  initialPageId,
}: PreviewModeProps) {
  const [device, setDevice] = React.useState<Device>(initialDevice);
  const [activePageId, setActivePageId] = React.useState<string | null>(
    initialPageId ?? null
  );
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDevice(initialDevice);
  }, [initialDevice]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const multiPage = !!pages && pages.length > 0;
  const activePage = multiPage
    ? (pages.find(p => p.id === activePageId) ??
      pages.find(p => p.isHome) ??
      pages[0])
    : null;
  const homeId = multiPage ? (pages.find(p => p.isHome) ?? pages[0]).id : null;
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

  const handleNavigatePage = React.useCallback((id: string) => {
    setActivePageId(id);
    scrollerRef.current?.scrollTo({ top: 0 });
  }, []);

  const visible = pageBlocks.filter(b => b.isVisible);

  return (
    <div
      className='fixed inset-0 z-50 bg-neutral-900'
      data-landing-preview='true'
    >
      {/* Top bar fixed, gọn — mirror /dev/blocks */}
      <header className='fixed inset-x-0 top-0 z-60 flex h-7 items-center gap-2 border-b border-white/10 bg-[#0d0d10]/90 px-2 backdrop-blur-sm'>
        <span className='shrink-0 text-[8px] font-bold tracking-[0.16em] text-amber-400/90 uppercase'>
          Preview
        </span>
        {activePage && activePage.id !== homeId && (
          <button
            type='button'
            onClick={() => homeId && handleNavigatePage(homeId)}
            className='flex shrink-0 items-center gap-0.5 rounded-sm px-1 text-[9px] text-white/60 transition-colors hover:bg-white/10 hover:text-white'
          >
            <ChevronLeft className='size-3' />
            Trang chủ
          </button>
        )}
        <span className='min-w-0 flex-1 truncate text-[9px] text-white/40'>
          {activePage ? `${activePage.name} · ` : ''}
          {visible.length}/{pageBlocks.length} block ·{' '}
          {DEVICE_FRAME_WIDTH[device]}px
        </span>
        <DeviceSwitcher
          device={device}
          onChange={setDevice}
          variant='preview'
        />
        <button
          type='button'
          onClick={onClose}
          aria-label='Đóng xem trước'
          className='flex size-5 shrink-0 items-center justify-center rounded-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white'
        >
          <X className='size-3.5' />
        </button>
      </header>

      {/* Outer: no scroll — device frame scrolls internally (centered). */}
      <div className='relative h-screen overflow-hidden bg-neutral-200 pt-7'>
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <DevicePreviewFrame
            device={device}
            chromeOffset={PREVIEW_CHROME}
            scrollerRef={scrollerRef}
          >
            {/* Mirror BlockPreview: resolve `token:*` colors/fonts in Play. */}
            <LinkNav
              mode='preview'
              onNavigatePage={handleNavigatePage}
              // Remount the whole list on page change so every MotionProvider
              // and gsap.context is rebuilt cleanly instead of being reused
              // across two different block sets.
              key={activePage?.id ?? 'single'}
            >
              <div style={brandKitToCssVars(DEFAULT_PREVIEW_KIT)}>
                {visible.length === 0 ? (
                  <div className='flex min-h-[60vh] items-center justify-center px-6 text-center text-sm text-neutral-500'>
                    {activePage
                      ? `Trang "${activePage.name}" chưa có block nào hiển thị.`
                      : 'Chưa có block nào hiển thị.'}
                  </div>
                ) : (
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
                        | BlockMotion
                        | undefined;
                      return (
                        <MotionProvider
                          key={`${block.id}:${device}`}
                          mode='preview'
                          motion={motion}
                          scrollerEl={scrollerRef.current}
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
                        </MotionProvider>
                      );
                    })}
                  />
                )}
              </div>
            </LinkNav>
          </DevicePreviewFrame>
        </LandingMotionRoot>
      </div>
    </div>
  );
}
