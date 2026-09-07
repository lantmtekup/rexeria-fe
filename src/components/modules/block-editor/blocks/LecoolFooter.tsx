'use client';

/**
 * Le Cool Move Footer — port từ apps/ecommerce-landing Footer.tsx.
 *
 * Không animation, không sticky, mọi field nằm trong luồng → layout canvas
 * giống hệt production, KHÔNG cần nhánh `isCanvas` riêng. `isCanvas` chỉ dùng
 * để chặn điều hướng khi author bấm chọn nút CTA.
 *
 * Khác apps:
 * - `vw` → `cqi`; token Tailwind (`text-black`, `text-[clamp()]`, `font-display`)
 *   → inline base để toolbar đè được.
 * - `<a href='#products'>Shop now</a>` → tách `ctaLabel` + `ctaHref`
 *   (`fieldType: 'link'`) cho link picker 4 dạng.
 */
import * as React from 'react';

import { cn } from '@/lib/cn';

import type { LecoolFooterContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  LECOOL_BODY_FONT,
  LECOOL_DISPLAY_FONT,
  LECOOL_PAPER,
} from './lecoolTheme';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const HEADLINE_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 'clamp(40px, 5cqi, 64px)',
  maxWidth: 900,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(24px, 2.8cqi, 40px)',
  fontWeight: 400,
  lineHeight: 1.2,
  color: '#000000',
};

/** Khung nút: viền + padding nằm trên `<a>` (field link). */
const CTA_BUTTON_STYLE: React.CSSProperties = {
  marginTop: 'clamp(28px, 3.4cqi, 44px)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(0,0,0,0.4)',
  paddingInline: 48,
  paddingBlock: 12,
};

/** Chữ trong nút nằm trên `<span>` (field text). */
const CTA_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 11,
  lineHeight: '10px',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'inherit',
};

const COPYRIGHT_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 'clamp(32px, 4cqi, 56px)',
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 13,
  lineHeight: '26px',
  fontWeight: 500,
  color: 'rgba(0,0,0,0.7)',
};

export function LecoolFooter({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolFooterContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const ctaLabel = content.ctaLabel ?? '';
  const ctaHref = content.ctaHref ?? '';

  return (
    <footer
      ref={rootRef}
      aria-label='Site footer'
      className={cn('@container relative w-full px-6', className)}
      style={composeStyle(
        {
          backgroundColor: LECOOL_PAPER,
          paddingTop: 'clamp(28px, 3cqi, 40px)',
          paddingBottom: 'clamp(40px, 4cqi, 56px)',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div className='mx-auto flex w-full flex-col items-center text-center'>
        <div className='flex w-full items-center gap-6'>
          <span
            aria-hidden
            className='h-px flex-1'
            style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
          />
          {/* `data-crown-slot` — điểm dừng cuối của CrownTraveler bên apps. */}
          <img
            src={content.crownUrl ?? ''}
            alt=''
            aria-hidden
            data-crown-slot='footer'
            data-element-key='crownUrl'
            className={selectableClass(
              activeKey === 'crownUrl',
              'h-auto shrink-0'
            )}
            style={composeStyle(
              { width: 'clamp(46px, 4.3cqi, 62px)' },
              styleOf('crownUrl')
            )}
          />
          <span
            aria-hidden
            className='h-px flex-1'
            style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
          />
        </div>

        <h2
          data-element-key='headline'
          className={selectableClass(activeKey === 'headline')}
          style={composeStyle(HEADLINE_STYLE, styleOf('headline'))}
        >
          {content.headline}
        </h2>

        <a
          data-element-key='ctaHref'
          href={isCanvas ? undefined : ctaHref || '#'}
          onClick={isCanvas ? e => e.preventDefault() : undefined}
          aria-label={ctaLabel}
          className={selectableClass(
            activeKey === 'ctaHref',
            'text-black transition-colors hover:bg-black hover:text-white'
          )}
          style={composeStyle(CTA_BUTTON_STYLE, styleOf('ctaHref'))}
        >
          <span
            data-element-key='ctaLabel'
            className={selectableClass(activeKey === 'ctaLabel')}
            style={composeStyle(CTA_LABEL_STYLE, styleOf('ctaLabel'))}
          >
            {ctaLabel}
          </span>
        </a>

        <p
          data-element-key='copyright'
          className={selectableClass(activeKey === 'copyright')}
          style={composeStyle(COPYRIGHT_STYLE, styleOf('copyright'))}
        >
          {content.copyright}
        </p>
      </div>
    </footer>
  );
}
