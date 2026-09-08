'use client';

/**
 * Preset transition `snap` — một cú vuốt = một section.
 *
 * Chỉ là mặt tiền mỏng: toàn bộ engine nằm ở `motion/useSnapScroll.ts` (dùng
 * chung với block `page_snap`). Ở đây section = con trực tiếp của stack.
 *
 * Chạy ở `/p`, PreviewMode, LivePreviewCanvas. KHÔNG chạy trên canvas soạn
 * thảo — `PageCanvas`/`BlockPreview` không render `TemplateTransitions`.
 *
 * DOM y hệt `PlainStack` — Fragment, KHÔNG bọc wrapper quanh item: wrapper đổi
 * containing block của `position: sticky` (hero) và đổi flex-item identity.
 */

import * as React from 'react';

import { cn } from '@/lib/cn';

import { useSnapScroll } from '../motion/useSnapScroll';

interface Props {
  items: React.ReactNode[];
  className?: string;
}

export function SnapStack({ items, className }: Props) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  useSnapScroll({
    getSections: React.useCallback(
      () =>
        rootRef.current
          ? (Array.from(rootRef.current.children) as HTMLElement[])
          : [],
      []
    ),
  });

  return (
    <div ref={rootRef} className={cn('flex flex-col', className)}>
      {items.map((node, i) => (
        <React.Fragment key={i}>{node}</React.Fragment>
      ))}
    </div>
  );
}
