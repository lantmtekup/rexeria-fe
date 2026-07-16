'use client';

/**
 * Data-block "Vault · Reveal" (tách từ apps/mint2026 — cửa hầm mở).
 *
 * Sticky 180vh: Gallery3dDepth (3D card fly) + parallax drift/scale theo scroll.
 * RAF gốc (window scroll) → ScrollTrigger scrub qua useBlockMotion (scroller nền).
 *
 * Canvas editor: lưới phẳng hiện đủ ảnh để chọn/sửa từng field (card 3D ở
 * preview đang bay/mờ theo timeline, không bấm trúng). PreviewMode + /p: sticky
 * + parallax + gallery 3D thật.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintVaultRevealContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { Gallery3dDepth } from './Gallery3dDepth';

interface Props {
  content: MintVaultRevealContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function MintVaultReveal({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();
  const images = content.images ?? [];

  const [isCanvas, setIsCanvas] = React.useState(true);
  React.useLayoutEffect(() => {
    if (!hasRoot) {
      setIsCanvas(false);
      return;
    }
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, [hasRoot]);

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
      const inner = root.querySelector<HTMLElement>('.vault-reveal-inner');
      if (!inner) return;
      gsap.fromTo(
        inner,
        { y: 70, scale: 1.08 },
        {
          y: -70,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    },
    [isCanvas]
  );

  // ── Canvas editor: lưới phẳng hiện đủ ảnh để chọn/sửa từng field.
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className='@container w-full bg-[#08070a] px-6 py-16 text-white'
      >
        <div className='mx-auto mb-10 max-w-6xl text-center'>
          <p
            data-element-key='eyebrow'
            style={composeStyle(
              {
                fontSize: 'clamp(10px, 1.4cqi, 11px)',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
              },
              styleOf('eyebrow')
            )}
            className={selectableClass(activeKey === 'eyebrow', '')}
          >
            {content.eyebrow}
          </p>
          <h2
            data-element-key='title'
            style={composeStyle(
              {
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(24px, 4cqi, 40px)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: '#ffffff',
              },
              styleOf('title')
            )}
            className={selectableClass(activeKey === 'title', 'mt-2')}
          >
            {content.title}
          </h2>
        </div>
        <div className='mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 @2xl:grid-cols-3'>
          {images.map((src, i) => {
            const imgKey = `images[${i}]`;
            return (
              <div
                key={i}
                className='relative aspect-square overflow-hidden rounded-2xl bg-[#17131f]'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key={imgKey}
                  src={src}
                  alt=''
                  style={styleOf(imgKey)}
                  className={selectableClass(
                    activeKey === imgKey,
                    'absolute inset-0 h-full w-full object-cover'
                  )}
                />
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: sticky 180vh + parallax + gallery 3D thật.
  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className='@container relative h-[180vh] w-full bg-[#08070a]'
    >
      <div className='sticky top-0 h-screen overflow-hidden'>
        <div className='vault-reveal-inner absolute inset-0 will-change-transform'>
          <Gallery3dDepth
            content={{
              eyebrow: content.eyebrow,
              title: content.title,
              images,
            }}
            styles={styles}
            order={order}
            positions={positions}
            activeKey={activeKey}
            className='h-screen! min-h-screen! w-full! rounded-none!'
          />
        </div>
      </div>
    </section>
  );
}
