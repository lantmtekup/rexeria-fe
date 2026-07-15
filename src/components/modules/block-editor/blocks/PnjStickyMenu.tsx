'use client';

/**
 * PNJ · Sticky Menu — thanh điều hướng cố định đáy viewport / device frame.
 * Port từ apps/pnj StickyMenu.tsx.
 *
 * - Link không chứa https → scroll tới section (id / #id)
 * - Link có https → mở tab mới
 * - /p: `fixed` đáy viewport
 * - PreviewMode: portal `absolute` đáy → `[data-device-frame]`
 * - Editor canvas: in-flow
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PnjStickyMenuContent,
  PnjStickyMenuItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

type LenisLike = {
  scroll: number;
  scrollTo: (
    target: number | string | HTMLElement,
    opts?: { duration?: number; immediate?: boolean }
  ) => void;
  on: (event: string, cb: () => void) => void;
  off: (event: string, cb: () => void) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isPnjExternalLink = (link: string): boolean =>
  /https?:\/\//i.test(link.trim());

export const resolvePnjSectionId = (link: string): string =>
  link.trim().replace(/^#/, '');

const elementOffsetTop = (
  el: HTMLElement,
  scroller: HTMLElement | null
): number => {
  if (scroller) {
    const scrollerRect = scroller.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.top - scrollerRect.top + scroller.scrollTop;
  }
  return el.getBoundingClientRect().top + window.scrollY;
};

// Tìm section TRONG scroller hiện tại. KHÔNG dùng document.getElementById
// toàn cục: id có thể trùng giữa các bản render (PreviewMode là overlay,
// editor canvas bên dưới vẫn mounted và cũng render section cùng id) →
// getElementById trả bản NGOÀI overlay, offset sai → scroll "nhích 1 xíu".
const findSection = (
  id: string,
  scroller: HTMLElement | null
): HTMLElement | null => {
  if (!id) return null;
  const root: ParentNode = scroller ?? document;
  try {
    return root.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
  } catch {
    return null;
  }
};

// PNJ không dùng ScrollTrigger pinning → range chỉ cần offset thật của element.
// Đo cùng hệ toạ độ với getScrollY (lenis.scroll / scrollTop / window.scrollY).
const getSectionRange = (
  id: string,
  scroller: HTMLElement | null
): { start: number; end: number } | null => {
  const el = findSection(id, scroller);
  if (!el) return null;
  const start = elementOffsetTop(el, scroller);
  return { start, end: start + el.offsetHeight };
};

const getScrollY = (scroller: HTMLElement | null): number => {
  const lenis = getLenis();
  if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
  if (scroller) return scroller.scrollTop;
  return window.scrollY;
};

interface Props {
  content: PnjStickyMenuContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PnjStickyMenu({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const { scroller, hasRoot } = useLandingMotion();
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // Thanh active trượt dưới list — toạ độ content (bù scrollLeft vì list
  // cuộn ngang được trên mobile).
  const [bar, setBar] = React.useState<{ left: number; width: number } | null>(
    null
  );

  const items = React.useMemo(() => content.items ?? [], [content.items]);
  const ctaText = content.ctaText?.trim() || 'Buy now';
  const ctaLink = content.ctaLink?.trim() || 'contact';

  const internalItems = React.useMemo(
    () =>
      items.filter(item => item.link?.trim() && !isPnjExternalLink(item.link)),
    [items]
  );

  React.useEffect(() => setMounted(true), []);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play (cũng có scroller).
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const updateActive = React.useCallback(() => {
    const y = getScrollY(scroller);
    let next: string | null = null;

    for (const item of internalItems) {
      const id = resolvePnjSectionId(item.link);
      const range = getSectionRange(id, scroller);
      if (!range) continue;
      if (y >= range.start - 2) next = item.key || id;
    }

    setActiveId(prev => (prev === next ? prev : next));
  }, [internalItems, scroller]);

  React.useEffect(() => {
    if (!mounted || internalItems.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    updateActive();

    const onScroll = () => updateActive();
    const onRefresh = () => updateActive();

    const spy = ScrollTrigger.create({
      scroller: scroller ?? undefined,
      start: 0,
      end: 'max',
      onUpdate: onScroll,
      onRefresh: onRefresh,
    });
    ScrollTrigger.addEventListener('refresh', onRefresh);

    scroller?.addEventListener('scroll', onScroll, { passive: true });

    let lenis: LenisLike | undefined;
    let tries = 0;
    let retryId = 0;
    const bindLenis = () => {
      lenis = getLenis();
      if (lenis) {
        lenis.on('scroll', onScroll);
        return;
      }
      if (!scroller && tries < 20) {
        tries += 1;
        retryId = window.setTimeout(bindLenis, 50);
      }
    };
    bindLenis();

    return () => {
      spy.kill();
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      scroller?.removeEventListener('scroll', onScroll);
      lenis?.off('scroll', onScroll);
      window.clearTimeout(retryId);
    };
  }, [mounted, updateActive, internalItems, scroller]);

  // Đo thanh active trượt theo link đang active. Re-measure khi list đổi size
  // (font load, resize, đổi label) qua ResizeObserver.
  const itemsSig = items.map(i => `${i.key}|${i.label}|${i.link}`).join(';');
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      if (!activeId) {
        setBar(null);
        return;
      }
      const el = list.querySelector<HTMLElement>(
        `a[data-nav-key="${CSS.escape(activeId)}"]`
      );
      if (!el) {
        setBar(null);
        return;
      }
      const listRect = list.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setBar({
        left: rect.left - listRect.left + list.scrollLeft,
        width: rect.width,
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeId, itemsSig, mounted]);

  const scrollToSection = (link: string) => {
    const id = resolvePnjSectionId(link);
    const el = findSection(id, scroller);
    if (!el) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[PnjStickyMenu] không tìm thấy section id="${id}" — bỏ qua link "${link}"`
        );
      }
      return;
    }

    const reduced = prefersReducedMotion();
    const lenis = getLenis();
    if (lenis) {
      // Truyền thẳng element: Lenis tự tính offset trong hệ toạ độ của nó.
      lenis.scrollTo(el, reduced ? { immediate: true } : { duration: 1.2 });
    } else if (scroller) {
      // Scroller là element lồng nhau → offset tương đối (elementOffsetTop).
      scroller.scrollTo({
        top: elementOffsetTop(el, scroller),
        behavior: reduced ? 'auto' : 'smooth',
      });
    } else {
      el.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
    }

    const item = internalItems.find(i => resolvePnjSectionId(i.link) === id);
    setActiveId(item?.key ?? id);
  };

  const handleItemClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: PnjStickyMenuItem
  ) => {
    const link = item.link?.trim() ?? '';
    if (!link) return;
    if (isPnjExternalLink(link)) return;
    e.preventDefault();
    scrollToSection(link);
  };

  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    item: PnjStickyMenuItem
  ) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const link = item.link?.trim() ?? '';
    if (!link || isPnjExternalLink(link)) return;
    e.preventDefault();
    scrollToSection(link);
  };

  const handleCtaClick = () => {
    if (!ctaLink) return;
    if (isPnjExternalLink(ctaLink)) return;
    scrollToSection(ctaLink);
  };

  const handleCtaKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (!ctaLink || isPnjExternalLink(ctaLink)) return;
    e.preventDefault();
    scrollToSection(ctaLink);
  };

  const pill = (
    <nav
      className={cn(
        'pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 bg-white py-1.5 pr-1.5 pl-3 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5 @2xl:gap-6 @2xl:py-2 @2xl:pr-2 @2xl:pl-6',
        className
      )}
      aria-label='Page sections'
    >
      <ul
        ref={listRef}
        data-element-key='items'
        style={styleOf('items')}
        className={selectableClass(
          activeKey === 'items',
          'relative flex min-w-0 [scrollbar-width:none] items-center gap-3 overflow-x-auto [-ms-overflow-style:none] @2xl:gap-6 [&::-webkit-scrollbar]:hidden'
        )}
      >
        {items.map((item, i) => {
          const link = item.link?.trim() ?? '';
          const external = isPnjExternalLink(link);
          const sectionId = external ? '' : resolvePnjSectionId(link);
          const isActive = !external && activeId === (item.key || sectionId);

          return (
            <li key={item.key || `${sectionId}-${i}`} className='shrink-0'>
              <a
                href={external ? link : link ? `#${sectionId}` : '#'}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer noopener' : undefined}
                data-element-key={`items[${i}].label`}
                data-cta-id={`nav-${item.key || sectionId}`}
                data-nav-key={external ? undefined : item.key || sectionId}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
                tabIndex={0}
                onClick={e => handleItemClick(e, item)}
                onKeyDown={e => handleItemKeyDown(e, item)}
                style={styleOf(`items[${i}].label`)}
                className={selectableClass(
                  activeKey === `items[${i}].label`,
                  cn(
                    'inline-block py-0.5 text-xs whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 @2xl:py-1 @2xl:text-sm',
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-800'
                  )
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}

        {/* Thanh active trượt — đo qua effect, trượt bằng translateX/width. */}
        <li
          aria-hidden='true'
          className='pointer-events-none absolute bottom-0 left-0 h-[2px] bg-neutral-900 transition-[transform,width,opacity] duration-300 ease-out'
          style={{
            width: bar?.width ?? 0,
            transform: `translateX(${bar?.left ?? 0}px)`,
            opacity: bar ? 1 : 0,
          }}
        />
      </ul>

      {ctaText ? (
        isPnjExternalLink(ctaLink) ? (
          <a
            href={ctaLink}
            target='_blank'
            rel='noreferrer noopener'
            data-element-key='ctaText'
            data-cta-id='nav-buy-now'
            aria-label={ctaText}
            tabIndex={0}
            style={styleOf('ctaText')}
            className={selectableClass(
              activeKey === 'ctaText',
              'shrink-0 bg-black px-3.5 py-2.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase no-underline transition-colors duration-200 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 @2xl:px-7 @2xl:py-3.5 @2xl:text-sm'
            )}
          >
            {ctaText}
          </a>
        ) : (
          <button
            type='button'
            data-element-key='ctaText'
            data-cta-id='nav-buy-now'
            aria-label={ctaText}
            tabIndex={0}
            onClick={handleCtaClick}
            onKeyDown={handleCtaKeyDown}
            style={styleOf('ctaText')}
            className={selectableClass(
              activeKey === 'ctaText',
              'shrink-0 bg-black px-3.5 py-2.5 text-[10px] font-medium tracking-[0.12em] text-white uppercase transition-colors duration-200 outline-none hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 @2xl:px-7 @2xl:py-3.5 @2xl:text-sm'
            )}
          >
            {ctaText}
          </button>
        )
      ) : null}
    </nav>
  );

  const overlayAside = (
    <aside
      className={cn(
        'pointer-events-none inset-x-0 bottom-0 z-[49] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] @2xl:px-4 @2xl:pb-4 @4xl:px-6',
        inFrame ? 'absolute' : 'fixed'
      )}
      aria-hidden={false}
    >
      {pill}
    </aside>
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'pnj-sticky-menu @container relative w-full',
        useFixed && 'h-0 overflow-visible'
      )}
    >
      {useFixed && portalHost
        ? createPortal(overlayAside, portalHost)
        : !useFixed && (
            <aside
              className='flex w-full justify-center px-3 py-3 @2xl:px-4 @4xl:px-6'
              aria-hidden={false}
            >
              {pill}
            </aside>
          )}
    </section>
  );
}
