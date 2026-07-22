'use client';

/**
 * Block "Story - Editorial" (port từ section `.details` của delvaux-clone).
 *
 * Bố cục căn giữa: tiêu đề lớn (mask reveal từ dưới lên) + 2 đoạn mô tả
 * (fade-up stagger). Style gốc: h1 64/72 #000, p 16/24 #111, cột giữa 50%.
 * Animation đi qua useBlockMotion (GSAP R1–R6) — không Lenis/plugin trong block.
 *
 * Canvas editor: skip SplitType + scrub (title/body luôn visible, DOM không
 * bị tách) — PreviewMode + `/p` giữ production motion.
 */
import * as React from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

import { useBlockMotion } from '../motion/LandingMotion';
import {
  DELVAUX_BG,
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_CSS,
  DELVAUX_FONT_HEADING,
} from './delvauxTheme';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  DelvauxDetailsContent,
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

interface Props {
  content: DelvauxDetailsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function DelvauxDetails({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const splitsRef = React.useRef<SplitType[]>([]);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const revertSplits = () => {
    splitsRef.current.forEach(s => s.revert());
    splitsRef.current = [];
  };

  React.useEffect(() => () => revertSplits(), []);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      // Teardown SplitType trước mọi rebuild (canvas ↔ preview / content đổi).
      revertSplits();
      // Editor canvas: không SplitType (phá DOM edit) / không ẩn body opacity 0.
      if (isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const title = root.querySelector<HTMLElement>('.delvaux-details-title');
      const bodies = root.querySelectorAll<HTMLElement>(
        '.delvaux-details-body'
      );

      // Gốc: `data-splitting data-effect-one` — từng KÝ TỰ trượt lên từ dưới
      // (mask overflow-hidden), stagger nhẹ. Dùng SplitType (như MintV2Works).
      if (title) {
        const split = new SplitType(title, { types: 'words,chars' });
        splitsRef.current.push(split);
        // mask theo TỪ: chars trượt trong khung word (overflow hidden)
        if (split.words?.length) {
          gsap.set(split.words, {
            overflow: 'hidden',
            display: 'inline-block',
            verticalAlign: 'top',
          });
        }
        if (split.chars?.length) {
          gsap.fromTo(
            split.chars,
            { yPercent: 110 },
            {
              yPercent: 0,
              stagger: 0.02,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                scroller,
                start: 'top 95%',
                end: 'top 40%',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }

      if (bodies.length) {
        gsap.fromTo(
          bodies,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 92%',
              end: 'top 70%',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [isCanvas, content.title, content.body1, content.body2]
  );

  return (
    <section
      ref={rootRef}
      id='description'
      data-canvas-edit={isCanvas ? 'true' : undefined}
      style={composeStyle(
        { background: DELVAUX_BG },
        blockBackgroundStyle(background)
      )}
      className='delvaux-details @container relative w-full overflow-hidden'
    >
      <style>{DELVAUX_FONT_CSS}</style>
      <div
        className='mx-auto flex flex-col items-center text-center'
        style={{
          // gốc: cột offset-lg-3 col-lg-6 = 50% giữa, padding 120px 0 0
          maxWidth: 'min(92%, 720px)',
          paddingTop: 'clamp(64px, 12cqi, 120px)',
          paddingBottom: '0px',
        }}
      >
        {/* mask reveal: wrapper overflow-hidden, tiêu đề trượt từ dưới lên */}
        <div className='delvaux-details-title-mask w-full overflow-hidden'>
          <h1
            data-element-key='title'
            style={composeStyle(
              {
                margin: 0,
                // gốc: h1 Genath 64/72
                fontFamily: DELVAUX_FONT_HEADING,
                fontWeight: 400,
                fontSize: 'clamp(32px, 6.6cqi, 64px)',
                lineHeight: 1.125,
                color: '#000000',
              },
              styleOf('title')
            )}
            className={selectableClass(
              activeKey === 'title',
              'delvaux-details-title'
            )}
          >
            {content.title}
          </h1>
        </div>

        <p
          data-element-key='body1'
          style={composeStyle(
            {
              marginTop: 'clamp(20px, 3cqi, 24px)',
              marginBottom: 0,
              // gốc: p Atlas Grotesk 16/24
              fontFamily: DELVAUX_FONT_BODY,
              fontSize: 'clamp(14px, 1.6cqi, 16px)',
              lineHeight: 1.5,
              color: '#111111',
            },
            styleOf('body1')
          )}
          className={selectableClass(
            activeKey === 'body1',
            'delvaux-details-body'
          )}
        >
          {content.body1}
        </p>

        <p
          data-element-key='body2'
          style={composeStyle(
            {
              marginTop: 'clamp(16px, 2.2cqi, 20px)',
              marginBottom: 0,
              fontFamily: DELVAUX_FONT_BODY,
              fontSize: 'clamp(14px, 1.6cqi, 16px)',
              lineHeight: 1.5,
              color: '#111111',
            },
            styleOf('body2')
          )}
          className={selectableClass(
            activeKey === 'body2',
            'delvaux-details-body'
          )}
        >
          {content.body2}
        </p>
      </div>
    </section>
  );
}
