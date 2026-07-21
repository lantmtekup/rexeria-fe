'use client';

/**
 * Cool Hunter · Section Progress — rail sticky bên phải, một thanh đen liên tục
 * scrub theo tiến độ scroll qua 4 section có `data-section`.
 * Port từ apps/cool-hunter SectionProgress.tsx.
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  CoolHunterSectionProgressContent,
  CoolHunterSectionProgressItem,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useContainerMobile } from './useContainerMobile';

type ProgressState = {
  index: number;
  heightPct: number;
};

type LenisLike = {
  on: (event: 'scroll', handler: () => void) => void;
  off: (event: 'scroll', handler: () => void) => void;
};

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

const DEFAULT_SECTIONS: CoolHunterSectionProgressItem[] = [
  { sectionId: 'welcome', label: '01 - Welcome' },
  { sectionId: 'lake-wehapa', label: '02 - Lake Wehapa' },
  { sectionId: 'architecture', label: '03 - Architecture' },
  { sectionId: 'interior-design', label: '04 - Interior Design' },
];

const findSection = (
  id: string,
  scroller: HTMLElement | null
): HTMLElement | null => {
  if (!id) return null;
  const root: ParentNode = scroller ?? document;
  try {
    return root.querySelector<HTMLElement>(
      `[data-section="${CSS.escape(id)}"]`
    );
  } catch {
    return null;
  }
};

/** Host dùng sticky track (Ndvh) thay GSAP pin — đo trực tiếp outer section. */
const getSectionTrack = (
  id: string,
  scroller: HTMLElement | null
): HTMLElement | null => {
  const el = findSection(id, scroller);
  if (!el) return null;
  const parent = el.parentElement;
  if (parent?.classList.contains('pin-spacer')) return parent;
  return el;
};

const getViewportMetrics = (
  scroller: HTMLElement | null
): { mid: number; height: number } => {
  if (scroller) {
    const rect = scroller.getBoundingClientRect();
    return { mid: rect.top + rect.height / 2, height: rect.height };
  }
  return { mid: window.innerHeight * 0.5, height: window.innerHeight };
};

const resolveProgress = (
  sections: CoolHunterSectionProgressItem[],
  scroller: HTMLElement | null
): ProgressState | null => {
  const { mid, height: viewportHeight } = getViewportMetrics(scroller);
  let totalRange = 0;
  const ranges: number[] = [];
  const boxes: DOMRect[] = [];
  const indices: number[] = [];

  for (let i = 0; i < sections.length; i++) {
    const track = getSectionTrack(sections[i].sectionId, scroller);
    if (!track) continue;

    const box = track.getBoundingClientRect();
    const range = Math.max(0, box.height - viewportHeight);
    ranges.push(range);
    boxes.push(box);
    indices.push(i);
    totalRange += range;
  }

  if (indices.length === 0 || totalRange <= 0) return null;

  let passed = 0;

  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    const range = ranges[i];

    if (box.top <= mid && box.bottom > mid) {
      const local = range > 0 ? Math.min(1, Math.max(0, -box.top / range)) : 1;
      const overall = (passed + local * range) / totalRange;

      return {
        index: indices[i],
        heightPct: Math.max(3, overall * 100),
      };
    }

    if (box.bottom <= mid) passed += range;
  }

  // Hero / khoảng trống giữa các section — ẩn rail (khớp apps).
  return null;
};

const resolveSections = (
  raw: CoolHunterSectionProgressItem[] | undefined
): CoolHunterSectionProgressItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_SECTIONS;
  return raw.map((item, i) => {
    const fallback = DEFAULT_SECTIONS[i] ?? DEFAULT_SECTIONS[0];
    return {
      sectionId: item.sectionId?.trim() || fallback.sectionId,
      label: item.label?.trim() || fallback.label,
    };
  });
};

interface Props {
  content: CoolHunterSectionProgressContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function CoolHunterSectionProgress({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { scroller, hasRoot } = useLandingMotion();
  const isCompact = useContainerMobile(rootRef, 768);
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [progress, setProgress] = React.useState<ProgressState | null>(null);

  const sections = React.useMemo(
    () => resolveSections(content.sections),
    [content.sections]
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setIsCanvas(!!root.closest('[data-testid="active-block-preview"]'));
    setPortalHost(resolveDrawerPortalHost(root));
  }, [mounted, hasRoot]);

  const useFixed = mounted && hasRoot && !isCanvas;
  const inFrame = isDeviceFrameHost(portalHost);
  const showRail = !isCompact;

  const syncProgress = React.useCallback(() => {
    if (!showRail) {
      setProgress(null);
      return;
    }
    setProgress(resolveProgress(sections, scroller));
  }, [sections, scroller, showRail]);

  React.useEffect(() => {
    if (!mounted || !showRail) {
      setProgress(null);
      return;
    }

    const bootTimers = [0, 250, 800].map(delay =>
      window.setTimeout(() => {
        ScrollTrigger.refresh();
        syncProgress();
      }, delay)
    );

    const onScroll = () => syncProgress();

    scroller?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    ScrollTrigger.addEventListener('refresh', onScroll);

    let lenis: LenisLike | undefined;
    let retryId: number | undefined;
    let tries = 0;

    const bindLenis = () => {
      lenis = getLenis();
      if (lenis && !scroller) {
        lenis.on('scroll', onScroll);
        return;
      }
      if (!scroller && tries < 20) {
        tries += 1;
        retryId = window.setTimeout(bindLenis, 50);
      }
    };
    bindLenis();

    const observeRoot = scroller ?? document.body;
    let mutateTimer: number | undefined;
    const onMutate = () => {
      if (mutateTimer) window.clearTimeout(mutateTimer);
      mutateTimer = window.setTimeout(onScroll, 120);
    };
    const mutationObserver = new MutationObserver(onMutate);
    mutationObserver.observe(observeRoot, { childList: true, subtree: true });

    return () => {
      bootTimers.forEach(id => window.clearTimeout(id));
      if (retryId) window.clearTimeout(retryId);
      if (mutateTimer) window.clearTimeout(mutateTimer);
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      ScrollTrigger.removeEventListener('refresh', onScroll);
      lenis?.off('scroll', onScroll);
      mutationObserver.disconnect();
    };
  }, [mounted, syncProgress, scroller, showRail]);

  const activeIndex = progress?.index ?? 0;
  const label =
    progress !== null
      ? (sections[progress.index]?.label ?? '')
      : (sections[0]?.label ?? '');
  const visible = showRail && (isCanvas || progress !== null);
  const heightPct = progress?.heightPct ?? 0;

  const labelBase: React.CSSProperties = {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#06070C',
    writingMode: 'vertical-rl',
    whiteSpace: 'nowrap',
  };

  const rail = (
    <div
      className={cn(
        'pointer-events-none flex items-center gap-3 transition-opacity duration-300',
        className
      )}
      style={{
        opacity: visible ? 1 : 0,
        height: 'min(26vh, 200px)',
      }}
      aria-hidden={!visible}
    >
      <span
        data-element-key={`sections[${activeIndex}].label`}
        className={selectableClass(
          activeKey === `sections[${activeIndex}].label`
        )}
        style={composeStyle(
          labelBase,
          styleOf(`sections[${activeIndex}].label`)
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className='relative h-full w-px'
        style={{ backgroundColor: '#e5e5e5' }}
      >
        <span
          className='absolute inset-x-0 top-0 will-change-[height]'
          style={{
            height: `${isCanvas ? 35 : heightPct}%`,
            backgroundColor: '#171717',
          }}
        />
      </span>
    </div>
  );

  const overlayAside = (
    <aside
      className={cn(
        'pointer-events-none top-1/2 right-6 z-50 flex -translate-y-1/2',
        inFrame ? 'absolute' : 'fixed'
      )}
      aria-hidden={!visible}
    >
      {rail}
    </aside>
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        'cool-hunter-section-progress @container relative w-full',
        useFixed && 'h-0 overflow-visible'
      )}
    >
      {useFixed && portalHost ? (
        createPortal(overlayAside, portalHost)
      ) : (
        <aside
          className={cn(
            'flex w-full',
            isCanvas ? 'justify-end px-[6cqi] py-[4cqi]' : 'justify-center py-3'
          )}
          aria-hidden={false}
        >
          {rail}
        </aside>
      )}
    </section>
  );
}
