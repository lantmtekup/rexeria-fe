'use client';

/**
 * Le Cool Move Collection — port từ apps/ecommerce-landing CollectionSection.tsx.
 *
 * Lưới thẻ sản phẩm; mỗi thẻ xếp chồng sẵn đủ ảnh của các màu rồi cross-fade
 * bằng opacity khi đổi swatch (không load lại ảnh khi bấm).
 *
 * Layout production = layout canvas (lưới phẳng, mọi field trong luồng) → chỉ
 * cần chặn ENTRANCE trên canvas: apps set `autoAlpha: 0` cho thẻ rồi mới reveal
 * theo ScrollTrigger, không chặn thì editor mở ra là lưới trống.
 *
 * Khác apps:
 * - `ScrollTrigger.batch` nhận `scroller` của LandingMotion.
 * - `sm:`/`lg:` → `@2xl:`/`@4xl:`; `vw` → `cqi`.
 * - Màu trỏ bằng chỉ số vào 2 mảng dùng chung → mỗi thẻ giữ trọn danh sách màu.
 * - `<a href='#products'>` → tách `allProductsLabel` + `allProductsHref`
 *   (`fieldType: 'link'`) để canvas mở được link picker 4 dạng.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { LecoolCollectionContent, LecoolCollectionItem } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useLecoolAnchorScroll } from './lecoolAnchorScroll';
import { resolveCollectionItems } from './lecoolCollectionData';
import {
  IconArrowRight,
  IconCheck,
  IconHeart,
  IconHeartOutline,
} from './lecoolStoryIcons';
import {
  LECOOL_BODY_FONT,
  LECOOL_DISPLAY_FONT,
  LECOOL_GOLD,
} from './lecoolTheme';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const CARD_W = 330;
const CARD_IMG_H = 373;

/** Nhịp reveal của apps — giữ nguyên. */
const REVEAL_Y = 32;
const REVEAL_DUR = 0.7;
const REVEAL_STAGGER = 0.12;
const REVEAL_START = 'top 88%';

const WISH_RED = '#DC2626';

const TITLE_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 4,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 'clamp(28px, 2.8cqi, 40px)',
  fontWeight: 400,
  lineHeight: 1.2,
  color: '#000000',
};

const SUBTITLE_STYLE: React.CSSProperties = {
  margin: 0,
  marginTop: 12,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 'clamp(14px, 1.15cqi, 16px)',
  fontWeight: 500,
  lineHeight: '26px',
  color: '#000000',
};

const ALL_PRODUCTS_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 13,
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 12,
  lineHeight: '10px',
  fontWeight: 600,
  color: '#000000',
  textTransform: 'uppercase',
};

const MATERIAL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 11,
  lineHeight: '10px',
  fontWeight: 500,
  color: LECOOL_GOLD,
};

const NAME_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 24,
  lineHeight: '32px',
  fontWeight: 400,
  color: '#000000',
};

const PRICE_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 16,
  lineHeight: '26px',
  fontWeight: 500,
  color: '#000000',
};

const CART_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 12,
  lineHeight: '10px',
  fontWeight: 600,
  color: LECOOL_GOLD,
  textTransform: 'uppercase',
};

type StyleOf = (key: string) => React.CSSProperties | undefined;

function CollectionCard({
  item,
  index,
  addToCartLabel,
  styleOf,
  activeKey,
  isCanvas,
}: {
  item: LecoolCollectionItem;
  index: number;
  addToCartLabel: string;
  styleOf: StyleOf;
  activeKey?: string | null;
  isCanvas: boolean;
}) {
  const [color, setColor] = React.useState(0);
  const [wished, setWished] = React.useState(false);

  const colors = item.colors ?? [];
  const active = Math.min(color, Math.max(0, colors.length - 1));

  return (
    <li className='flex flex-col border border-black/20 bg-white'>
      <div
        className='relative w-full'
        style={{ aspectRatio: `${CARD_W} / ${CARD_IMG_H}` }}
      >
        {/* Xếp chồng đủ ảnh, chỉ đổi opacity → bấm swatch không phải tải lại */}
        {colors.map((swatch, j) => {
          const key = `items[${index}].colors[${j}].imageUrl`;
          const isActive = j === active;
          return (
            <img
              key={key}
              src={swatch.imageUrl ?? ''}
              alt={isActive ? `${item.name ?? ''} — ${swatch.name ?? ''}` : ''}
              aria-hidden={!isActive}
              data-element-key={key}
              className={selectableClass(
                activeKey === key,
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none'
              )}
              style={composeStyle({ opacity: isActive ? 1 : 0 }, styleOf(key))}
            />
          );
        })}

        <button
          type='button'
          onClick={isCanvas ? undefined : () => setWished(w => !w)}
          aria-label={wished ? 'Bỏ khỏi wishlist' : 'Thêm vào wishlist'}
          aria-pressed={wished}
          className='absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white transition-colors'
          style={{ color: wished ? WISH_RED : '#000000' }}
        >
          {wished ? (
            <IconHeart className='h-[14px] w-4' />
          ) : (
            <IconHeartOutline className='h-[14px] w-4' />
          )}
        </button>
      </div>

      <div className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <span
            data-element-key={`items[${index}].material`}
            className={selectableClass(
              activeKey === `items[${index}].material`
            )}
            style={composeStyle(
              MATERIAL_STYLE,
              styleOf(`items[${index}].material`)
            )}
          >
            {item.material}
          </span>

          <div className='flex items-center justify-between gap-3'>
            <h3
              data-element-key={`items[${index}].name`}
              className={selectableClass(activeKey === `items[${index}].name`)}
              style={composeStyle(NAME_STYLE, styleOf(`items[${index}].name`))}
            >
              {item.name}
            </h3>

            <div className='flex shrink-0 items-center gap-[11px]'>
              {colors.map((swatch, j) => (
                <button
                  key={`swatch-${j}-${swatch.name ?? ''}`}
                  type='button'
                  onClick={isCanvas ? undefined : () => setColor(j)}
                  aria-label={`${item.name ?? ''} — ${swatch.name ?? ''}`}
                  aria-pressed={j === active}
                  className='relative flex h-5 w-5 items-center justify-center rounded-full'
                  style={{
                    boxShadow: j === active ? 'inset 0 0 0 1px #000' : 'none',
                  }}
                >
                  <span
                    className='flex h-[14px] w-[14px] items-center justify-center rounded-full'
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${swatch.from ?? '#ccc'} 0%, ${swatch.to ?? '#333'} 100%)`,
                    }}
                  >
                    {j === active ? (
                      <IconCheck className='h-[5px] w-[6px] text-white' />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <span
            data-element-key={`items[${index}].price`}
            className={selectableClass(activeKey === `items[${index}].price`)}
            style={composeStyle(PRICE_STYLE, styleOf(`items[${index}].price`))}
          >
            {item.price}
          </span>
        </div>

        <button
          type='button'
          className='flex h-[46px] w-full items-center justify-center border transition-colors'
          style={{ borderColor: LECOOL_GOLD }}
        >
          <span
            data-element-key='addToCartLabel'
            className={selectableClass(activeKey === 'addToCartLabel')}
            style={composeStyle(CART_LABEL_STYLE, styleOf('addToCartLabel'))}
          >
            {addToCartLabel}
          </span>
        </button>
      </div>
    </li>
  );
}

export function LecoolCollection({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<LecoolCollectionContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = React.useMemo(() => resolveCollectionItems(content), [content]);
  const addToCartLabel = content.addToCartLabel ?? '';
  const allProductsLabel = content.allProductsLabel ?? '';
  const allProductsHref = content.allProductsHref ?? '';
  const onAnchorClick = useLecoolAnchorScroll(isCanvas);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const list = listRef.current;
      // Canvas: KHÔNG set autoAlpha 0 — nếu trigger không chạy thì lưới trống.
      if (!list || isCanvas) return;
      const cards = gsap.utils.toArray<HTMLLIElement>(list.children);
      if (cards.length === 0) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(cards, { autoAlpha: 0, y: REVEAL_Y });

      ScrollTrigger.batch(cards, {
        scroller,
        start: REVEAL_START,
        once: true,
        onEnter: targets =>
          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration: REVEAL_DUR,
            ease: 'power2.out',
            stagger: REVEAL_STAGGER,
          }),
      });
    },
    [isCanvas, items.length]
  );

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          fontFamily: LECOOL_BODY_FONT,
          backgroundColor: '#FFFFFF',
          paddingBlock: 'clamp(48px, 5cqi, 64px)',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div className='mx-auto w-full px-6'>
        <div className='relative flex flex-col items-center text-center'>
          {/* `data-crown-slot` — điểm dừng thứ 4 của CrownTraveler bên apps. */}
          <img
            src={content.crownUrl ?? ''}
            alt=''
            aria-hidden
            data-crown-slot='collection'
            data-element-key='crownUrl'
            className={selectableClass(activeKey === 'crownUrl', 'h-auto')}
            style={composeStyle({ width: 73 }, styleOf('crownUrl'))}
          />

          <h2
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(TITLE_STYLE, styleOf('title'))}
          >
            {content.title}
          </h2>

          <p
            data-element-key='subtitle'
            className={selectableClass(activeKey === 'subtitle')}
            style={composeStyle(SUBTITLE_STYLE, styleOf('subtitle'))}
          >
            {content.subtitle}
          </p>

          <a
            data-element-key='allProductsHref'
            href={isCanvas ? undefined : allProductsHref || '#'}
            onClick={e => onAnchorClick(e, allProductsHref)}
            aria-label={allProductsLabel}
            className={selectableClass(
              activeKey === 'allProductsHref',
              'mt-6 transition-opacity hover:opacity-60 @4xl:absolute @4xl:right-0 @4xl:bottom-0 @4xl:mt-0'
            )}
            style={composeStyle(ALL_PRODUCTS_STYLE, styleOf('allProductsHref'))}
          >
            <span
              data-element-key='allProductsLabel'
              className={selectableClass(activeKey === 'allProductsLabel')}
              style={styleOf('allProductsLabel')}
            >
              {allProductsLabel}
            </span>
            <IconArrowRight className='h-[6px] w-3 shrink-0' />
          </a>
        </div>

        <ul
          ref={listRef}
          className='mt-10 grid list-none grid-cols-1 gap-6 p-0 @2xl:grid-cols-2 @4xl:grid-cols-4'
        >
          {items.map((item, i) => (
            <CollectionCard
              key={`item-${i}`}
              item={item}
              index={i}
              addToCartLabel={addToCartLabel}
              styleOf={styleOf}
              activeKey={activeKey}
              isCanvas={isCanvas}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
