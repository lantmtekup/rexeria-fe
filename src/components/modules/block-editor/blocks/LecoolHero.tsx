'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import { BlockMedia } from '../BlockMedia';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import type { LecoolHeroContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { LECOOL_BODY_FONT, LECOOL_DISPLAY_FONT } from './lecoolTheme';
import { resolvePnjHeroTitleLines } from './pnjHeroTitleLines';

/**
 * Le Cool Move Hero — port từ apps/ecommerce-landing Hero.tsx.
 *
 * Layout production = layout canvas (không sticky/pin/scrub, mọi field đều nằm
 * trong luồng và bấm chọn được) → KHÔNG cần nhánh `isCanvas` riêng.
 *
 * Khác apps:
 * - `gsap.matchMedia` + SplitText viết tay → `data-motion` (char-blur-up-reveal /
 *   line-reveal khớp đúng from/to/ease của apps); runtime tự skip trên
 *   edit-canvas và khi prefers-reduced-motion.
 * - `vw` → `cqi` (docs/canvas-block-responsive-spec.md R1), `md:` → `@2xl:`.
 * - Token Tailwind (`text-white`, `text-[clamp(...)]`, `font-display`) → inline
 *   base để ElementToolbar đè được color/font/size.
 * - Font `--font-display` / `--font-montserrat` chỉ có trong apps → lấy stack
 *   inline từ `lecoolTheme.ts`.
 */

const DEFAULT_BACKGROUND = '/lecool/hero-bg.jpg';
const DEFAULT_EMBLEM = '/lecool/hero-emblem.png';

const BRAND_HIGHLIGHT = '#FCF5BD';

/**
 * `height` giữ nguyên mốc của apps: header Le Cool Move là `sticky` cao 72px
 * nên hero + header vừa đúng một màn. Đứng một mình thì hero chỉ hụt 72px.
 */
const ROOT_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  position: 'relative',
  height: 840,
  maxHeight: 'calc(100dvh - 72px)',
  minHeight: 560,
};

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  maxWidth: 738,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(40px, 5.9cqi, 84px)',
  fontWeight: 400,
  lineHeight: 1,
  color: '#FFFFFF',
};

const INTRO_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(18px, 1.7cqi, 24px)',
  fontWeight: 400,
  lineHeight: 'normal',
  color: '#FFFFFF',
};

const BODY_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(15px, 1.25cqi, 18px)',
  fontWeight: 400,
  lineHeight: '24px',
  color: '#FFFFFF',
};

export function LecoolHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolHeroContent>) {
  const rootRef = React.useRef<HTMLElement>(null);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleLines = React.useMemo(
    () => resolvePnjHeroTitleLines(content),
    [content]
  );
  const backgroundUrl = content.backgroundUrl?.trim() || DEFAULT_BACKGROUND;
  const backgroundAlt = content.backgroundAlt?.trim() ?? '';
  const emblemUrl = content.emblemUrl?.trim() || DEFAULT_EMBLEM;
  const introPrefix = content.introPrefix ?? '';
  const introBrand = content.introBrand ?? '';
  const bodyLead = content.bodyLead ?? '';
  const bodyRest = content.bodyRest ?? '';

  // Rebuild SplitText khi số dòng tiêu đề / nội dung đổi (author sửa trên canvas).
  useMotionAttributes(rootRef, [
    titleLines.join('|'),
    introPrefix,
    introBrand,
    bodyLead,
    bodyRest,
  ]);

  return (
    <section
      ref={rootRef}
      className={cn(
        '@container relative isolate w-full overflow-hidden',
        className
      )}
      style={composeStyle(ROOT_STYLE, blockBackgroundStyle(background))}
    >
      <div
        data-element-key='backgroundUrl'
        className={selectableClass(
          activeKey === 'backgroundUrl',
          'absolute inset-0'
        )}
        style={composeStyle(
          { position: 'absolute', inset: 0, zIndex: 0 },
          styleOf('backgroundUrl')
        )}
      >
        {backgroundUrl ? (
          <BlockMedia
            key={backgroundUrl}
            src={backgroundUrl}
            alt={backgroundAlt}
            aria-hidden={backgroundAlt ? undefined : true}
            autoPlay
            muted
            loop
            playsInline
            className='h-full w-full object-cover object-center'
          />
        ) : null}
      </div>

      <div className='relative z-10 flex h-full flex-col items-center justify-center px-6 text-center'>
        {/* `data-crown-slot` — điểm dừng đầu của CrownTraveler (apps) nếu block
            đó được port sau; không có traveler thì attribute nằm im. */}
        <img
          src={emblemUrl}
          alt=''
          aria-hidden
          data-crown-slot='hero'
          data-element-key='emblemUrl'
          className={selectableClass(activeKey === 'emblemUrl', 'shrink-0')}
          style={composeStyle(
            { width: 'clamp(96px, 11cqi, 159px)', height: 'auto' },
            styleOf('emblemUrl')
          )}
        />

        <h1
          data-motion='char-blur-up-reveal'
          data-motion-trigger='load'
          data-motion-delay='0.15'
          data-motion-duration='0.9'
          data-motion-stagger='0.03'
          style={TITLE_STYLE}
        >
          {titleLines.map((line, i) => {
            const key = `titleLines[${i}]`;
            return (
              <span
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key, 'block')}
                style={composeStyle({ display: 'block' }, styleOf(key))}
              >
                {line}
              </span>
            );
          })}
        </h1>

        <div
          className='flex w-full flex-col'
          style={{
            marginTop: 'clamp(40px, 8cqi, 104px)',
            maxWidth: 694,
            gap: 16,
          }}
        >
          <p
            data-motion='char-blur-up-reveal'
            data-motion-trigger='load'
            data-motion-delay='0.55'
            data-motion-duration='1.2'
            data-motion-stagger='0.05'
            style={INTRO_STYLE}
          >
            <span
              data-element-key='introPrefix'
              className={selectableClass(activeKey === 'introPrefix')}
              style={styleOf('introPrefix')}
            >
              {introPrefix}
            </span>{' '}
            <span
              data-element-key='introBrand'
              className={selectableClass(activeKey === 'introBrand')}
              style={composeStyle(
                { color: BRAND_HIGHLIGHT },
                styleOf('introBrand')
              )}
            >
              {introBrand}
            </span>
          </p>

          <p
            data-motion='line-reveal'
            data-motion-trigger='load'
            data-motion-delay='0.8'
            data-motion-duration='0.9'
            data-motion-stagger='0.1'
            style={BODY_STYLE}
          >
            <span
              data-element-key='bodyLead'
              className={selectableClass(activeKey === 'bodyLead')}
              style={styleOf('bodyLead')}
            >
              {bodyLead}
            </span>{' '}
            {/* Từ @2xl trở lên câu dẫn chiếm trọn một dòng. Apps dùng
                `md:block`, nhưng con block-level bên trong <p> làm SplitText
                type='lines' đo dư 1 dòng — và host KHÔNG revert split sau khi
                chạy như apps, nên sai đó nằm lại luôn. `<br>` ẩn/hiện theo
                container cho cùng kết quả mà vẫn là inline flow.
                Node phải LUÔN có trong DOM (chỉ đổi display): SplitText
                re-parent DOM, React mà gỡ node đi sẽ ném NotFoundError. */}
            <br aria-hidden className='hidden @2xl:inline' />
            <span
              data-element-key='bodyRest'
              className={selectableClass(activeKey === 'bodyRest')}
              style={styleOf('bodyRest')}
            >
              {bodyRest}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
