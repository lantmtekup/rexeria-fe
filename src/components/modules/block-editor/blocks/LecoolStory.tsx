'use client';

/**
 * Le Cool Move Story — port từ apps/ecommerce-landing ProductStorySection.tsx
 * (+ StoryMenu, DesignPanel, DetailsPanel, ProductsPanel).
 *
 * GỘP MỘT BLOCK, không tách 3: rail menu nằm CÙNG HÀNG flex với cột panel và
 * `active` của nó do IntersectionObserver trên chính 3 panel quyết định — tách
 * thành 3 block riêng thì rail mất chỗ bám và mất luôn trạng thái chung.
 * 3 panel + menu là sub-component (file cạnh đây), KHÔNG đăng ký BlockType.
 *
 * Khác apps:
 * - IntersectionObserver + `window.scrollTo` → `scroller` của LandingMotion
 *   (editor cuộn trong khung canvas, không phải window).
 * - `lg:` → `isDesktop` đo theo container; rail/tab bar chọn bằng JS chứ không
 *   ẩn/hiện bằng CSS (hai bản cùng `data-element-key` sẽ phá selection).
 * - `#story { --story-gutter }` ở globals.css của apps → biến inline trên root.
 * - Canvas editor: xếp phẳng menu + 3 panel theo chiều dọc, bỏ sticky/scrub/
 *   zoom; PreviewMode và `/p` giữ nguyên bố cục production.
 */
import * as React from 'react';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import type { LecoolStoryContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
} from './applyStyle';
import { LecoolStoryDesign } from './LecoolStoryDesign';
import { LecoolStoryDetails } from './LecoolStoryDetails';
import {
  LecoolStoryMenuFlat,
  LecoolStoryRail,
  LecoolStoryTabBar,
} from './LecoolStoryMenu';
import { LecoolStoryProducts } from './LecoolStoryProducts';
import { resolveMenuLabels } from './lecoolStoryData';
import {
  LECOOL_HEADER_H,
  LECOOL_NO_SCROLLBAR_CSS,
  LECOOL_PAPER,
  LECOOL_STAGE_H,
} from './lecoolTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

/** `@4xl` — mốc đổi sang bố cục 2 cột (thay `lg:` = 1024px của apps). */
const DESKTOP_BREAKPOINT = 896;

/**
 * Gutter ngang dùng chung cho cả 3 panel. Figma vẽ mỗi panel một mốc x riêng;
 * gom về một biến để mép nội dung không nhảy khi cuộn qua nhau.
 */
const ROOT_STYLE = {
  '--story-gutter': 'clamp(24px, 4.4%, 64px)',
  backgroundColor: LECOOL_PAPER,
} as React.CSSProperties;

export function LecoolStory({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolStoryContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const panelRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = React.useState(0);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isDesktop = !useContainerMobile(rootRef, DESKTOP_BREAKPOINT);
  const { scroller } = useLandingMotion();

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const labels = React.useMemo(() => resolveMenuLabels(content), [content]);

  // Panel nào cắt ngang giữa khung nhìn thì mục đó sáng trên menu.
  React.useEffect(() => {
    if (isCanvas) return;
    const nodes = panelRefs.current.filter(
      (node): node is HTMLDivElement => node !== null
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const index = nodes.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) setActive(index);
        });
      },
      {
        // Editor: khung cuộn là phần tử canvas, không phải viewport.
        root: scroller ?? null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [isCanvas, scroller, labels.length]);

  const scrollToPanel = React.useCallback(
    (index: number) => {
      const node = panelRefs.current[index];
      if (!node) return;
      const nodeTop = node.getBoundingClientRect().top;
      if (scroller) {
        const top =
          nodeTop -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          LECOOL_HEADER_H;
        scroller.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      window.scrollTo({
        top: nodeTop + window.scrollY - LECOOL_HEADER_H,
        behavior: 'smooth',
      });
    },
    [scroller]
  );

  const panelProps = {
    content,
    styleOf,
    activeKey,
    isCanvas,
    isDesktop,
  } as const;

  const panels = [
    <LecoolStoryDesign key='design' {...panelProps} />,
    <LecoolStoryDetails key='details' {...panelProps} />,
    <LecoolStoryProducts key='products' {...panelProps} />,
  ];

  /** Panel 2 và 3 chiếm đúng một màn ở desktop; panel 1 tự tính chiều cao. */
  const panelHeight = (index: number) =>
    !isCanvas && isDesktop && index > 0 ? LECOOL_STAGE_H : undefined;

  const panelColumn = (
    <div className='min-w-0 flex-1'>
      {panels.map((panel, i) => (
        <div
          key={panel.key}
          ref={node => {
            panelRefs.current[i] = node;
          }}
          className='w-full'
          style={{ scrollMarginTop: LECOOL_HEADER_H, height: panelHeight(i) }}
        >
          {panel}
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      style={composeStyle(ROOT_STYLE, blockBackgroundStyle(background))}
    >
      <style>{LECOOL_NO_SCROLLBAR_CSS}</style>

      {isCanvas ? (
        <LecoolStoryMenuFlat
          labels={labels}
          crownUrl={content.crownUrl}
          styleOf={styleOf}
          activeKey={activeKey}
        />
      ) : null}

      {!isCanvas && !isDesktop ? (
        <LecoolStoryTabBar
          labels={labels}
          activeIndex={active}
          onSelect={scrollToPanel}
          styleOf={styleOf}
          activeKey={activeKey}
          isCanvas={isCanvas}
        />
      ) : null}

      <div className='flex items-start'>
        {!isCanvas && isDesktop ? (
          <LecoolStoryRail
            labels={labels}
            crownUrl={content.crownUrl}
            activeIndex={active}
            onSelect={scrollToPanel}
            styleOf={styleOf}
            activeKey={activeKey}
            isCanvas={isCanvas}
          />
        ) : null}

        {panelColumn}
      </div>
    </section>
  );
}
