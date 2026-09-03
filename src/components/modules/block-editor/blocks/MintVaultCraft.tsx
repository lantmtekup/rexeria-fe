'use client';

/**
 * Data-block "Vault · Craft" (tách từ apps/mint2026 Hồi III — The Craft).
 *
 * Heading + AccordionMedia (proof points). Heading fade-up qua useBlockMotion.
 * @container + data-element-key cho inline-edit; mỗi mục `items` sửa được
 * (title/description/imageUrl) + style trên canvas.
 *
 * Canvas editor: lưới phẳng hiện đủ 4 mục để chọn/sửa dễ (accordion ẩn mô tả
 * mục không active). PreviewMode + /p: accordion hover-expand thật.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultCraftContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { AccordionMedia } from './AccordionMedia';

interface Props {
  content: MintVaultCraftContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVaultCraft({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const items = Array.isArray(content.items) ? content.items : [];

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;
      const head = root.querySelector<HTMLElement>('.vault-craft-head');
      if (head) {
        gsap.fromTo(
          head,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: head,
              scroller,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [isCanvas]
  );

  const Heading = (
    <div className='vault-craft-head mx-auto mb-12 max-w-6xl text-center'>
      <p
        data-element-key='eyebrow'
        style={styleOf('eyebrow')}
        className={selectableClass(
          activeKey === 'eyebrow',
          'text-[11px] tracking-[0.3em] text-[#c9a96e] uppercase'
        )}
      >
        {content.eyebrow}
      </p>
      <h2
        data-element-key='title'
        style={composeStyle(
          {
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(28px, 4.5cqi, 44px)',
          },
          styleOf('title')
        )}
        className={selectableClass(
          activeKey === 'title',
          'mt-3 leading-tight font-light'
        )}
      >
        {content.title}
      </h2>
    </div>
  );

  // ── Canvas editor: lưới phẳng hiện đủ các mục để chọn/sửa từng field.
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className='@container mx-auto w-full bg-[#08070a] px-6 py-16 text-white'
      >
        {Heading}
        <div
          data-element-key='items'
          className={selectableClass(
            activeKey === 'items',
            'mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 @2xl:grid-cols-2'
          )}
          style={styleOf('items')}
        >
          {items.map((item, i) => {
            const imgKey = `items[${i}].imageUrl`;
            const titleKey = `items[${i}].title`;
            const descKey = `items[${i}].description`;
            return (
              <article
                key={i}
                className='overflow-hidden rounded-lg bg-[#0e0f13]'
              >
                <div className='relative aspect-video w-full overflow-hidden'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    data-element-key={imgKey}
                    src={item.imageUrl}
                    alt={item.title}
                    style={styleOf(imgKey)}
                    className={selectableClass(
                      activeKey === imgKey,
                      'absolute inset-0 h-full w-full object-cover'
                    )}
                  />
                </div>
                <div className='p-4'>
                  <h3
                    data-element-key={titleKey}
                    style={composeStyle(
                      {
                        fontSize: 'clamp(16px, 2.4cqi, 20px)',
                        fontWeight: 600,
                        color: '#ffffff',
                      },
                      styleOf(titleKey)
                    )}
                    className={selectableClass(activeKey === titleKey, '')}
                  >
                    {item.title}
                  </h3>
                  <p
                    data-element-key={descKey}
                    style={composeStyle(
                      {
                        marginTop: 6,
                        fontSize: 'clamp(13px, 1.8cqi, 14px)',
                        color: 'rgba(255,255,255,0.7)',
                      },
                      styleOf(descKey)
                    )}
                    className={selectableClass(activeKey === descKey, '')}
                  >
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: accordion hover-expand thật.
  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container mx-auto w-full bg-[#08070a] px-6 py-24 text-white @2xl:py-32'
    >
      {Heading}
      <div
        data-element-key='items'
        className={selectableClass(
          activeKey === 'items',
          'mx-auto w-full max-w-6xl'
        )}
        style={styleOf('items')}
      >
        <AccordionMedia
          content={{ items }}
          keyPrefix='items'
          activeKey={activeKey}
          styleOf={styleOf}
        />
      </div>
    </section>
  );
}
