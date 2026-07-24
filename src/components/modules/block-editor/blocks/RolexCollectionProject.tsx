'use client';

import * as React from 'react';

import { useMotionAttributes } from '../motion/useMotionAttributes';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionProjectContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING } from './rolexFonts';

interface Props {
  content: RolexCollectionProjectContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

interface MediaProps {
  elementKey: string;
  src: string;
  active: boolean;
  aspectClass: string;
}

function Media({ elementKey, src, active, aspectClass }: MediaProps) {
  return (
    <div
      data-element-key={elementKey}
      className={selectableClass(
        active,
        `relative w-full overflow-hidden rounded-lg ${aspectClass}`
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=''
          className='absolute inset-0 h-full w-full object-cover'
        />
      ) : (
        <div className='absolute inset-0 bg-neutral-200' />
      )}
    </div>
  );
}

const PAGE_BG_STYLE: React.CSSProperties = {
  backgroundColor: '#ffffff',
  backgroundImage: "url('/rolex-collection/contact-bg.png')",
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

/** Rolex "project details" — dựng lại nguyên trang gốc (5 section) làm 1
 *  block duy nhất, tỷ lệ ảnh lấy đúng số đo thật từ recon (desktop 1440 /
 *  tablet 768 / mobile 375). Không có nav — dùng chung block
 *  `rolex_collection_nav` đã có sẵn, đặt trước block này trên canvas.
 *  Animation: CHỈ heading `title` chạy per-char reveal khi tải trang (không
 *  gắn animation theo scroll cho phần còn lại).
 *
 *  Lưu ý breakpoint: CHỈ dùng `@3xl` cho reflow 2-cột — `@3xl` có bug âm
 *  thầm không kích hoạt ở preset Tablet 834px thật (container lồng nhau),
 *  xem docs/canvas-block-responsive-spec.md. Đừng đổi sang `@3xl`. */
export function RolexCollectionProject({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  useMotionAttributes(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  return (
    <section
      ref={rootRef}
      className='@container relative w-full'
      style={composeStyle(PAGE_BG_STYLE, blockBackgroundStyle(background))}
    >
      <style>{FONT_CSS}</style>
      <div className='mx-auto flex flex-col gap-2.25 px-4 pt-20 pb-51.5 @3xl:max-w-317 @3xl:gap-1.5 @3xl:px-6 @3xl:pb-39'>
        {/* Section 1 — Hero split (631×900 desktop / 343×403 mobile) */}
        <div className='grid grid-cols-1 gap-2.25 @3xl:grid-cols-2 @3xl:items-stretch @3xl:gap-1.5'>
          <Media
            elementKey='heroImageUrl'
            src={content.heroImageUrl}
            active={activeKey === 'heroImageUrl'}
            aspectClass='aspect-[343/403] @3xl:aspect-[631/900]'
          />
          <div className='flex flex-col items-center justify-center gap-6 rounded-lg bg-white px-6 py-16 text-center @3xl:px-16'>
            {content.eyebrow ? (
              <p
                data-element-key='eyebrow'
                style={composeStyle(
                  {
                    fontFamily: FONT_BODY,
                    fontWeight: 400,
                    color: '#000000',
                    margin: 0,
                  },
                  styleOf('eyebrow')
                )}
                className={selectableClass(activeKey === 'eyebrow', 'text-sm')}
              >
                {content.eyebrow}
              </p>
            ) : null}

            <h2
              data-element-key='title'
              data-motion='char-blur-up-reveal'
              data-motion-trigger='load'
              style={composeStyle(
                {
                  fontFamily: FONT_HEADING,
                  fontWeight: 400,
                  color: '#000000',
                  margin: 0,
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                },
                styleOf('title')
              )}
              className={selectableClass(
                activeKey === 'title',
                'text-[clamp(32px,8cqi,52px)]'
              )}
            >
              {content.title}
            </h2>

            {content.description ? (
              <p
                data-element-key='description'
                style={composeStyle(
                  {
                    fontFamily: FONT_BODY,
                    fontWeight: 400,
                    color: 'rgba(0, 0, 0, 0.44)',
                    margin: 0,
                    letterSpacing: '0.3px',
                    lineHeight: 1.4,
                  },
                  styleOf('description')
                )}
                className={selectableClass(
                  activeKey === 'description',
                  'max-w-sm text-[15px]'
                )}
              >
                {content.description}
              </p>
            ) : null}
          </div>
        </div>

        {/* Section 2 — full-width band (1268×540 desktop / 343×487 mobile) */}
        <Media
          elementKey='bandImageUrl1'
          src={content.bandImageUrl1}
          active={activeKey === 'bandImageUrl1'}
          aspectClass='aspect-[343/487] @3xl:aspect-[1268/540]'
        />

        {/* Section 3 — 2 ảnh cạnh nhau (631×540 mỗi ảnh desktop) */}
        <div className='grid grid-cols-1 gap-2.25 @3xl:grid-cols-2 @3xl:gap-1.5'>
          <Media
            elementKey='pairImageLeftUrl'
            src={content.pairImageLeftUrl}
            active={activeKey === 'pairImageLeftUrl'}
            aspectClass='aspect-[343/241] @3xl:aspect-[631/540]'
          />
          <Media
            elementKey='pairImageRightUrl'
            src={content.pairImageRightUrl}
            active={activeKey === 'pairImageRightUrl'}
            aspectClass='aspect-[343/241] @3xl:aspect-[631/540]'
          />
        </div>

        {/* Section 4 — full-width band (giống Section 2) */}
        <Media
          elementKey='bandImageUrl2'
          src={content.bandImageUrl2}
          active={activeKey === 'bandImageUrl2'}
          aspectClass='aspect-[343/487] @3xl:aspect-[1268/540]'
        />

        {/* Section 5 — Đóng bài, split (631×540 desktop / 343×178 mobile) */}
        <div className='grid grid-cols-1 gap-2.25 @3xl:grid-cols-2 @3xl:items-stretch @3xl:gap-1.5'>
          <Media
            elementKey='closingImageUrl'
            src={content.closingImageUrl}
            active={activeKey === 'closingImageUrl'}
            aspectClass='aspect-[343/178] @3xl:aspect-[631/540]'
          />
          <div className='flex flex-col items-center justify-center gap-6 rounded-lg bg-white px-8 py-11 text-center @3xl:pt-6'>
            {content.closingSubheading ? (
              <p
                data-element-key='closingSubheading'
                style={composeStyle(
                  {
                    fontFamily: FONT_BODY,
                    fontWeight: 400,
                    color: '#000000',
                    margin: 0,
                  },
                  styleOf('closingSubheading')
                )}
                className={selectableClass(
                  activeKey === 'closingSubheading',
                  'max-w-xs text-sm'
                )}
              >
                {content.closingSubheading}
              </p>
            ) : null}

            {content.closingParagraph ? (
              <p
                data-element-key='closingParagraph'
                style={composeStyle(
                  {
                    fontFamily: FONT_BODY,
                    fontWeight: 400,
                    color: '#000000',
                    margin: 0,
                    lineHeight: 1.4,
                  },
                  styleOf('closingParagraph')
                )}
                className={selectableClass(
                  activeKey === 'closingParagraph',
                  'max-w-sm text-[15px] whitespace-pre-line'
                )}
              >
                {content.closingParagraph}
              </p>
            ) : null}

            {content.symbol ? (
              <span
                data-element-key='symbol'
                style={composeStyle(
                  { fontFamily: FONT_BODY, color: '#000000', margin: 0 },
                  styleOf('symbol')
                )}
                className={selectableClass(activeKey === 'symbol', 'text-sm')}
              >
                {content.symbol}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
