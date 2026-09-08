'use client';

/**
 * Page Snap — block hành vi: bật cuộn snap từng section cho CẢ trang.
 * Không có giao diện (root `h-0`), giống nhóm chrome `PnjHeader`/`BelgoHeader`
 * và block cấp trang `CoolHunterSectionProgress`.
 *
 * Section = mọi `[data-block-id]` trong scroller (mỏ neo có ở cả 4 surface:
 * `/p`, 2 PreviewMode, LivePreviewCanvas) — nên không phụ thuộc wrapper của
 * TemplateTransitions. Chính block này cũng nằm trong danh sách đó nhưng cao 0
 * nên bị dedupe loại.
 *
 * - Editor canvas: `useIsCanvasEdit` → tắt hẳn (đang sửa thì không cướp scroll)
 *   và hiện một thẻ giải thích để tác giả biết block này làm gì.
 * - Trùng lặp: engine dùng cờ `data-snap-owner` trên scroller nên bật cả preset
 *   transition `snap` lẫn block (hoặc lỡ thả 2 block) cũng chỉ một cái arm.
 * - Engine + mọi bẫy (mốc bottom-align, `data-lenis-prevent`, cổng cử chỉ
 *   trackpad): `motion/useSnapScroll.ts`.
 */

import * as React from 'react';

import { cn } from '@/lib/cn';

import {
  SNAP_DEFAULT_DURATION,
  SNAP_DEFAULT_MIN_WIDTH,
  useSnapScroll,
} from '../motion/useSnapScroll';
import { useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  PageSnapContent,
} from '../types';
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: PageSnapContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function PageSnap({
  content,
  styles,
  background: _background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  void _background;
  const rootRef = React.useRef<HTMLElement>(null);
  const { scroller } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const label = content.label?.trim() || 'Cuộn snap từng section';
  const note = content.note?.trim() || '';
  const minWidth =
    Number(content.minWidth) > 0
      ? Number(content.minWidth)
      : SNAP_DEFAULT_MIN_WIDTH;
  const duration =
    Number(content.duration) > 0
      ? Number(content.duration)
      : SNAP_DEFAULT_DURATION;

  useSnapScroll({
    enabled: !isCanvas && content.enabled !== false,
    minWidth,
    duration,
    getSections: React.useCallback(() => {
      const root = scroller ?? document.body;
      return Array.from(root.querySelectorAll<HTMLElement>('[data-block-id]'));
    }, [scroller]),
  });

  // Trên canvas: thẻ giải thích để tác giả không tưởng block hỏng.
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn(
          'page-snap @container relative flex w-full flex-col items-start gap-2 border border-dashed p-5',
          className
        )}
        style={{ borderColor: '#c7c7c7', backgroundColor: '#fafafa' }}
      >
        <span
          data-element-key='label'
          className={selectableClass(activeKey === 'label')}
          style={composeStyle(
            {
              fontSize: 14,
              fontWeight: 600,
              color: '#111111',
            },
            styleOf('label')
          )}
        >
          {label}
        </span>
        <span
          data-element-key='note'
          className={selectableClass(activeKey === 'note')}
          style={composeStyle(
            { fontSize: 12, lineHeight: 1.5, color: '#6b6b6b' },
            styleOf('note')
          )}
        >
          {note ||
            `Block này không hiển thị gì trên trang thật. Nó bật cuộn snap cho cả trang: mỗi cú vuốt nhảy đúng một section. Chỉ chạy khi khung rộng ≥ ${minWidth}px và người xem không bật "giảm chuyển động". Bấm ▶ để xem thử.`}
        </span>
      </section>
    );
  }

  // Production: không chiếm layout.
  return (
    <section
      ref={rootRef}
      aria-hidden='true'
      className={cn(
        'page-snap relative m-0 h-0 min-h-0 w-full overflow-visible border-0 p-0',
        className
      )}
    />
  );
}
