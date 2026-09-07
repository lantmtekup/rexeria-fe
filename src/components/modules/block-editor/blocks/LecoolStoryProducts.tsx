'use client';

/**
 * Panel 3 (Products) của block `lecool_story` — SUB-COMPONENT, không đăng ký
 * BlockType. Port từ apps/ecommerce-landing ProductsPanel.tsx.
 *
 * Khác apps:
 * - `lg:` → `isDesktop` đo theo container; `100svh` → `100dvh`.
 * - Canvas editor: dùng layout dọc (bản mobile) và bỏ click, để mọi ô đều nằm
 *   trong luồng và bấm là chọn element.
 *
 * Lưu ý nội dung: tên màu chỉ hiện tên của swatch ĐANG CHỌN (giống apps), nên
 * trên canvas chỉ bấm được `productColors[0].name`; các màu còn lại sửa trong
 * panel Lớp.
 */
import * as React from 'react';

import { cn } from '@/lib/cn';

import { composeStyle, selectableClass } from './applyStyle';
import {
  IconBag,
  IconBox,
  IconCheck,
  IconChevron,
  IconHeart,
} from './lecoolStoryIcons';
import {
  resolveProductActions,
  resolveProductColors,
  resolveProductImages,
  resolveProductSpecs,
  type LecoolStoryPanelProps,
} from './lecoolStoryData';
import {
  LECOOL_BODY_FONT,
  LECOOL_DISPLAY_FONT,
  LECOOL_GOLD,
  LECOOL_HEADER_H,
  LECOOL_PAPER,
} from './lecoolTheme';

/** Mốc `mt` của 2 cột hai bên: 14.3% chiều cao một màn (Figma). */
const COLUMN_TOP = `calc((100dvh - ${LECOOL_HEADER_H}px) * 0.143)`;

const NAME_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: LECOOL_DISPLAY_FONT,
  fontSize: 24,
  lineHeight: '32px',
  fontWeight: 400,
  color: '#000000',
};

const COLOR_NAME_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 12,
  lineHeight: '10px',
  fontWeight: 600,
  color: '#000000',
};

const SPEC_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 10,
  lineHeight: '10px',
  fontWeight: 600,
  color: '#000000',
  textTransform: 'uppercase',
};

const SPEC_VALUE_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 12,
  lineHeight: '10px',
  fontWeight: 600,
  color: '#000000',
};

const ACTION_TITLE_STYLE: React.CSSProperties = {
  ...SPEC_LABEL_STYLE,
};

const ACTION_SUB_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 8,
  lineHeight: '10px',
  fontWeight: 500,
  color: '#000000',
};

const CART_LABEL_STYLE: React.CSSProperties = {
  fontFamily: LECOOL_BODY_FONT,
  fontSize: 12,
  lineHeight: '10px',
  fontWeight: 600,
  color: '#FFFFFF',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
};

export function LecoolStoryProducts({
  content,
  styleOf,
  activeKey,
  isCanvas,
  isDesktop,
}: LecoolStoryPanelProps) {
  const [image, setImage] = React.useState(0);
  const [color, setColor] = React.useState(0);

  const images = React.useMemo(() => resolveProductImages(content), [content]);
  const colors = React.useMemo(() => resolveProductColors(content), [content]);
  const specs = React.useMemo(() => resolveProductSpecs(content), [content]);
  const actions = React.useMemo(
    () => resolveProductActions(content),
    [content]
  );

  // Canvas dùng layout dọc để mọi ô nằm trong luồng.
  const wide = isDesktop && !isCanvas;
  const activeImage = images[Math.min(image, images.length - 1)] ?? '';
  const activeColor = colors[Math.min(color, colors.length - 1)];
  const colorNameKey = `productColors[${Math.min(color, colors.length - 1)}].name`;

  return (
    <div
      className={cn(
        'relative flex w-full flex-col',
        wide && 'flex-row items-start overflow-hidden'
      )}
      style={{
        backgroundColor: LECOOL_PAPER,
        height: wide ? '100%' : undefined,
        paddingInline: wide ? 'var(--story-gutter)' : undefined,
      }}
    >
      {/* Dải thumbnail — mobile nằm dưới ảnh chính, desktop thành cột trái */}
      <div
        className={cn(
          'lecool-no-scrollbar flex gap-2',
          wide ? 'shrink-0 flex-col' : 'order-2 overflow-x-auto px-6 py-4'
        )}
        style={
          wide
            ? { marginTop: COLUMN_TOP, width: 'clamp(48px, 5.6cqi, 88px)' }
            : undefined
        }
      >
        {images.map((src, i) => {
          const key = `productImages[${i}]`;
          return (
            <button
              key={key}
              type='button'
              onClick={isCanvas ? undefined : () => setImage(i)}
              aria-label={`Ảnh ${i + 1}`}
              aria-pressed={i === image}
              className={cn(
                'relative aspect-square shrink-0 border bg-white transition-colors',
                wide ? 'w-full' : 'w-12'
              )}
              style={{
                borderColor: i === image ? LECOOL_GOLD : 'rgba(0,0,0,.2)',
              }}
            >
              <img
                src={src}
                alt=''
                aria-hidden
                data-element-key={key}
                className={selectableClass(
                  activeKey === key,
                  'h-full w-full object-cover'
                )}
                style={styleOf(key)}
              />
            </button>
          );
        })}
      </div>

      {/* Ảnh chính */}
      <div
        className={cn('relative w-full', wide && 'h-full min-w-0 flex-1')}
        style={wide ? undefined : { order: 1 }}
      >
        <div
          className='relative w-full'
          style={
            wide
              ? { position: 'absolute', inset: 0 }
              : { aspectRatio: '1086 / 840' }
          }
        >
          <img
            key={activeImage}
            src={activeImage}
            alt={`${content.productName ?? ''} — ${activeColor?.name ?? ''}`}
            className='h-full w-full object-contain'
          />
        </div>

        {wide ? (
          <div className='absolute bottom-[3.7%] left-1/2 flex -translate-x-1/2 items-center gap-3'>
            {images.map((src, i) => (
              <span
                key={`tick-${i}-${src}`}
                className='h-px bg-black transition-[width] duration-500'
                style={{ width: i === image ? 120 : 24 }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Thẻ thông tin */}
      <div
        className={cn('w-full', wide ? 'shrink-0' : 'order-3 mx-auto mb-6')}
        style={
          wide
            ? { marginTop: COLUMN_TOP, width: 330, maxWidth: '34%' }
            : { width: 'min(330px, calc(100% - 3rem))' }
        }
      >
        <div className='bg-white px-6 py-6'>
          <h3
            data-element-key='productName'
            className={selectableClass(activeKey === 'productName')}
            style={composeStyle(NAME_STYLE, styleOf('productName'))}
          >
            {content.productName}
          </h3>

          <hr className='mt-5 border-t border-black' />

          <div className='mt-10 flex items-center justify-between'>
            <span
              data-element-key={colorNameKey}
              className={selectableClass(activeKey === colorNameKey)}
              style={composeStyle(COLOR_NAME_STYLE, styleOf(colorNameKey))}
            >
              {activeColor?.name}
            </span>
            <div className='flex items-center gap-[11px]'>
              {colors.map((swatch, i) => (
                <button
                  key={`swatch-${i}-${swatch.name ?? ''}`}
                  type='button'
                  onClick={isCanvas ? undefined : () => setColor(i)}
                  aria-label={swatch.name}
                  aria-pressed={i === color}
                  className='relative flex h-5 w-5 items-center justify-center rounded-full'
                  style={{
                    boxShadow: i === color ? 'inset 0 0 0 1px #000' : 'none',
                  }}
                >
                  <span
                    className='flex h-[14px] w-[14px] items-center justify-center rounded-full'
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${swatch.from ?? '#ccc'} 0%, ${swatch.to ?? '#333'} 100%)`,
                    }}
                  >
                    {i === color ? (
                      <IconCheck className='h-[5px] w-[6px] text-white' />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <hr className='mt-4 border-t border-black' />

          <div className='mt-5 flex flex-col gap-2'>
            {specs.map((spec, i) => {
              const labelKey = `productSpecs[${i}].label`;
              const valueKey = `productSpecs[${i}].value`;
              return (
                <div key={labelKey} className='flex flex-col gap-3'>
                  <div className='flex items-start gap-3'>
                    <IconBox name={spec.icon} />
                    <span className='flex flex-col gap-3'>
                      <span
                        data-element-key={labelKey}
                        className={selectableClass(activeKey === labelKey)}
                        style={composeStyle(
                          SPEC_LABEL_STYLE,
                          styleOf(labelKey)
                        )}
                      >
                        {spec.label}
                      </span>
                      <span
                        data-element-key={valueKey}
                        className={selectableClass(activeKey === valueKey)}
                        style={composeStyle(
                          SPEC_VALUE_STYLE,
                          styleOf(valueKey)
                        )}
                      >
                        {spec.value}
                      </span>
                    </span>
                  </div>
                  <hr className='border-t border-black' />
                </div>
              );
            })}
          </div>

          <div className='mt-5 flex flex-col gap-1'>
            {actions.map((action, i) => {
              const titleKey = `productActions[${i}].title`;
              const subKey = `productActions[${i}].sub`;
              return (
                <button
                  key={titleKey}
                  type='button'
                  className='flex h-10 items-center gap-2 border border-black p-1 pr-3 transition-colors hover:bg-black/[.03]'
                >
                  <IconBox name={action.icon} />
                  <span className='flex flex-1 flex-col items-start gap-1 text-left'>
                    <span
                      data-element-key={titleKey}
                      className={selectableClass(activeKey === titleKey)}
                      style={composeStyle(
                        ACTION_TITLE_STYLE,
                        styleOf(titleKey)
                      )}
                    >
                      {action.title}
                    </span>
                    <span
                      data-element-key={subKey}
                      className={selectableClass(activeKey === subKey)}
                      style={composeStyle(ACTION_SUB_STYLE, styleOf(subKey))}
                    >
                      {action.sub}
                    </span>
                  </span>
                  <IconChevron className='h-2 w-1 shrink-0 text-black' />
                </button>
              );
            })}
          </div>
        </div>

        <div
          className='flex h-[50px] items-center pr-5 pl-8'
          style={{ backgroundColor: LECOOL_GOLD }}
        >
          <button
            type='button'
            className='flex items-center gap-[70px] text-white'
          >
            <IconBag className='h-5 w-5 shrink-0' />
            <span
              data-element-key='addToCartLabel'
              className={selectableClass(activeKey === 'addToCartLabel')}
              style={composeStyle(CART_LABEL_STYLE, styleOf('addToCartLabel'))}
            >
              {content.addToCartLabel}
            </span>
          </button>
          <span className='ml-auto h-[10px] w-px bg-white/60' aria-hidden />
          <button
            type='button'
            aria-label='Thêm vào wishlist'
            className='ml-[17px] text-white'
          >
            <IconHeart className='h-[14px] w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
