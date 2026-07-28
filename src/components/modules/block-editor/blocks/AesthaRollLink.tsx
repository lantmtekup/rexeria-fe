'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { composeStyle, selectableClass } from './applyStyle';
import { useAesthaLink } from './aesthaLink';

export interface AesthaRollLinkProps {
  /** Nhãn ở trạng thái nghỉ. */
  label: string;
  /** Nhãn hiện khi hover. Rỗng → tái dùng `label`. */
  hoverLabel?: string;
  /** Link thô — `useAesthaLink` tự phân loại. Rỗng = `href='#'`, không nhảy. */
  href?: string;
  /** `data-element-key` của nhãn nghỉ (vd `wordmark` / `heading`). */
  labelKey: string;
  /** `data-element-key` của nhãn hover (vd `headingHoverLabel`). */
  hoverLabelKey: string;
  activeKey?: string | null;
  isCanvas: boolean;
  /** `styleOf` của block — áp cho nhãn hover (nhãn nghỉ do `<h1>` cha lo). */
  styleOf: (key: string) => React.CSSProperties | undefined;
  /** Thời lượng roll (giây). Đổi ở đây hoặc sửa default trong motionLibrary. */
  duration?: number;
  className?: string;
}

export function AesthaRollLink({
  label,
  hoverLabel,
  href,
  labelKey,
  hoverLabelKey,
  activeKey,
  isCanvas,
  styleOf,
  duration = 0.5,
  className,
}: AesthaRollLinkProps) {
  const linkProps = useAesthaLink();
  const hover = hoverLabel?.trim() || label;
  const dur = String(duration);

  return (
    /* `color: inherit` bắt buộc: anchor luôn có href (kể cả '#' cho a11y) nên
       UA sẽ nhuộm xanh + gạch chân nếu không đè. */
    <a
      {...linkProps(href)}
      style={{ color: 'inherit', textDecoration: 'none' }}
      className={cn(
        'aestha-roll-link relative grid rounded-sm outline-none focus-visible:ring-2',
        isCanvas ? 'justify-items-start gap-1' : 'overflow-hidden',
        className
      )}
    >
      <span
        data-element-key={labelKey}
        data-motion='hover-roll-down'
        data-motion-duration={dur}
        data-motion-trigger-target='closest:.aestha-roll-link'
        className={selectableClass(
          activeKey === labelKey,
          'col-start-1 row-start-1'
        )}
      >
        {label}
      </span>
      <span
        data-element-key={hoverLabelKey}
        aria-hidden={isCanvas ? undefined : 'true'}
        data-motion='hover-roll-down'
        data-motion-duration={dur}
        data-motion-trigger-target='closest:.aestha-roll-link'
        className={selectableClass(
          activeKey === hoverLabelKey,
          cn('col-start-1', isCanvas ? 'row-start-2 opacity-50' : 'row-start-1')
        )}
        style={composeStyle(
          isCanvas ? undefined : { translate: '0 -100%' },
          styleOf(hoverLabelKey)
        )}
      >
        {hover}
      </span>
    </a>
  );
}
