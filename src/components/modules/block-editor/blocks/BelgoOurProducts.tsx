'use client';

/**
 * Belgo · Our Products — 2 card bottle/glass với hover flip desktop + layout
 * xếp dọc mobile. Port từ apps/belgo OurProducts.tsx.
 *
 * Canvas: layout stacked (hiện đủ field hover) — bỏ hover-only + motion.
 * Preview + /p: giữ UX production (hover flip + GSAP reveal 3 cột).
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type { BelgoOurProductItem, BelgoOurProductsContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { resolveBelgoOurProducts } from './_registry/defs/belgoOurProducts';
import { BELGO_FONT_BODY, BELGO_FONT_DISPLAY } from './belgoTheme';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

const SURFACE = '#e4ddcf';
const INK = '#1A1A1A';
const WIDE_BREAKPOINT = 1024;

type StyleOf = (key: string) => React.CSSProperties | undefined;

interface ProductCardProps {
  product: BelgoOurProductItem;
  index: number;
  side?: 'left' | 'right';
  showStacked: boolean;
  isCanvas: boolean;
  activeKey?: string | null;
  styleOf: StyleOf;
}

const CTA_BUTTON_BASE: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  textDecoration: 'none',
  backgroundColor: SURFACE,
  color: INK,
};

function ProductCtaLink({
  product,
  ctaKey,
  hrefKey,
  href,
  isCanvas,
  activeKey,
  styleOf,
  className,
  style,
}: {
  product: BelgoOurProductItem;
  ctaKey: string;
  hrefKey: string;
  href: string;
  isCanvas: boolean;
  activeKey?: string | null;
  styleOf: StyleOf;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <a
      data-element-key={hrefKey}
      href={isCanvas ? undefined : href || '#'}
      onClick={isCanvas ? e => e.preventDefault() : undefined}
      aria-label={product.cta}
      className={selectableClass(activeKey === hrefKey, className)}
      style={composeStyle(CTA_BUTTON_BASE, style, styleOf(hrefKey))}
    >
      <span
        data-element-key={ctaKey}
        className={selectableClass(activeKey === ctaKey)}
        style={composeStyle(
          {
            fontFamily: BELGO_FONT_BODY,
            fontSize: '0.875rem',
            letterSpacing: '0.1em',
            color: INK,
          },
          styleOf(ctaKey)
        )}
      >
        {product.cta}
      </span>
    </a>
  );
}

function ProductCard({
  product,
  index,
  side,
  showStacked,
  isCanvas,
  activeKey,
  styleOf,
}: ProductCardProps) {
  const prefix = `products[${index}]`;
  const revealProps =
    side === 'left'
      ? { 'data-reveal-left': '' }
      : side === 'right'
        ? { 'data-reveal-right': '' }
        : {};

  const labelKey = `${prefix}.label`;
  const imageKey = `${prefix}.imageUrl`;
  const hoverImageKey = `${prefix}.hoverImageUrl`;
  const hoverTitleKey = `${prefix}.hoverTitle`;
  const ctaKey = `${prefix}.cta`;
  const hrefKey = `${prefix}.href`;

  const imageUrl = product.imageUrl?.trim();
  const hoverImageUrl = product.hoverImageUrl?.trim();
  const href = product.href?.trim() || '#';

  if (showStacked) {
    return (
      <div
        {...revealProps}
        className='mx-auto w-full'
        style={{ maxWidth: 410 }}
      >
        <div
          className='flex flex-col items-center justify-center border bg-black'
          style={{
            aspectRatio: '3 / 4',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            padding: '2.5rem 1.5rem 2rem',
          }}
        >
          <div className='flex flex-1 items-center justify-center'>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={product.label}
                data-element-key={imageKey}
                className={selectableClass(
                  activeKey === imageKey,
                  'w-auto object-contain'
                )}
                style={composeStyle(
                  { maxHeight: 'min(52cqi, 220px)' },
                  styleOf(imageKey)
                )}
                decoding='async'
                loading='lazy'
              />
            ) : null}
          </div>
          <p
            data-element-key={labelKey}
            className={selectableClass(activeKey === labelKey, 'shrink-0')}
            style={composeStyle(
              {
                margin: 0,
                marginTop: '1.25rem',
                fontFamily: BELGO_FONT_DISPLAY,
                fontSize: '1.125rem',
                letterSpacing: '0.08em',
                color: SURFACE,
              },
              styleOf(labelKey)
            )}
          >
            {product.label}
          </p>
        </div>

        <div className='flex flex-col bg-black' style={{ padding: '0.75rem' }}>
          <div
            className='relative overflow-hidden'
            style={{ aspectRatio: '4 / 3' }}
          >
            {hoverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hoverImageUrl}
                alt=''
                aria-hidden='true'
                data-element-key={hoverImageKey}
                className={selectableClass(
                  activeKey === hoverImageKey,
                  'h-full w-full object-cover object-center'
                )}
                style={styleOf(hoverImageKey)}
                decoding='async'
                loading='lazy'
              />
            ) : null}
            <div
              aria-hidden='true'
              className='pointer-events-none absolute inset-x-0 bottom-0'
              style={{
                height: '40%',
                background:
                  'linear-gradient(to top, #000 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              }}
            />
            <h3
              data-element-key={hoverTitleKey}
              className={selectableClass(
                activeKey === hoverTitleKey,
                'absolute inset-x-0 bottom-0'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  padding: '0 1rem 1rem',
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: 'clamp(1.5rem, 6cqi, 1.875rem)',
                  lineHeight: 0.95,
                  color: SURFACE,
                },
                styleOf(hoverTitleKey)
              )}
            >
              {product.hoverTitle}
            </h3>
          </div>
          <ProductCtaLink
            product={product}
            ctaKey={ctaKey}
            hrefKey={hrefKey}
            href={href}
            isCanvas={isCanvas}
            activeKey={activeKey}
            styleOf={styleOf}
            style={{
              marginTop: '0.75rem',
              padding: '1rem 0',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      {...revealProps}
      className='group relative mx-auto w-full overflow-hidden border bg-black'
      style={{
        maxWidth: 410,
        aspectRatio: '3 / 4.5',
        borderColor: 'rgba(255, 255, 255, 0.12)',
      }}
    >
      <div
        className='absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ease-out group-hover:opacity-0'
        style={{ padding: '4rem 2rem 3.5rem' }}
      >
        <div className='flex flex-1 items-center justify-center'>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.label}
              data-element-key={imageKey}
              className={selectableClass(
                activeKey === imageKey,
                'max-h-full w-auto object-contain'
              )}
              style={styleOf(imageKey)}
              decoding='async'
              loading='lazy'
            />
          ) : null}
        </div>
        <p
          data-element-key={labelKey}
          className={selectableClass(activeKey === labelKey, 'shrink-0')}
          style={composeStyle(
            {
              margin: 0,
              marginTop: '1.5rem',
              fontFamily: BELGO_FONT_DISPLAY,
              fontSize: '1.25rem',
              letterSpacing: '0.08em',
              color: SURFACE,
            },
            styleOf(labelKey)
          )}
        >
          {product.label}
        </p>
      </div>

      <div
        className='absolute inset-0 flex flex-col bg-black opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100'
        style={{ padding: '1rem' }}
      >
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          {hoverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hoverImageUrl}
              alt=''
              aria-hidden='true'
              data-element-key={hoverImageKey}
              className={selectableClass(
                activeKey === hoverImageKey,
                'h-full w-full object-cover object-center'
              )}
              style={styleOf(hoverImageKey)}
              decoding='async'
              loading='lazy'
            />
          ) : null}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0'
            style={{
              height: '40%',
              background:
                'linear-gradient(to top, #000 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
            }}
          />
          <h3
            data-element-key={hoverTitleKey}
            className={selectableClass(
              activeKey === hoverTitleKey,
              'absolute inset-x-0 bottom-0'
            )}
            style={composeStyle(
              {
                margin: 0,
                padding: '0 1.25rem 1.25rem',
                fontFamily: BELGO_FONT_DISPLAY,
                fontSize: '1.875rem',
                lineHeight: 0.95,
                color: SURFACE,
              },
              styleOf(hoverTitleKey)
            )}
          >
            {product.hoverTitle}
          </h3>
        </div>
        <ProductCtaLink
          product={product}
          ctaKey={ctaKey}
          hrefKey={hrefKey}
          href={href}
          isCanvas={isCanvas}
          activeKey={activeKey}
          styleOf={styleOf}
          className='shrink-0'
          style={{
            marginTop: '1rem',
            padding: '1.25rem 0',
          }}
        />
      </div>
    </div>
  );
}

export function BelgoOurProducts({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<BelgoOurProductsContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isWide = !useContainerMobile(rootRef, WIDE_BREAKPOINT);
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const [leftProduct, rightProduct] = React.useMemo(
    () => resolveBelgoOurProducts(content),
    [content]
  );
  const showStacked = isCanvas || !isWide;

  const eyebrow = content.eyebrow?.trim() || 'OUR PRODUCTS';
  const title =
    content.title?.trim() ||
    'ONE BOTTLE, ONE GLASS – A WORLD OF CRAFT BEER IN YOUR HANDS!';
  const body =
    content.body?.trim() ||
    'Experience the rich flavors of Belgian craft beer. Order your favorite bottle or visit our restaurant for the perfect pairing of beer and cuisine!';

  useBlockMotion(
    rootRef,
    ({ scroller, isMobile: motionMobile, requestRefresh }) => {
      if (isCanvas) return;

      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const leftCol = root.querySelector<HTMLElement>('[data-reveal-left]');
      const centerCol = root.querySelector<HTMLElement>('[data-reveal-center]');
      const rightCol = root.querySelector<HTMLElement>('[data-reveal-right]');
      const centerParts = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-center-part]',
        root
      );

      root.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      if (!leftCol || !centerCol || !rightCol) return;

      if (reduce) {
        gsap.set([leftCol, centerCol, rightCol, ...centerParts], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
        return;
      }

      const tl = gsap.timeline({
        paused: true,
        scrollTrigger: {
          trigger: root,
          scroller,
          start: motionMobile ? 'top 88%' : 'top 72%',
          end: motionMobile ? 'bottom 12%' : 'bottom 28%',
          toggleActions: motionMobile
            ? 'play none none none'
            : 'restart reverse restart reverse',
        },
      });

      if (motionMobile) {
        tl.from(centerParts, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        })
          .from(
            leftCol,
            {
              autoAlpha: 0,
              y: 32,
              duration: 0.7,
              ease: 'power3.out',
            },
            '-=0.25'
          )
          .from(
            rightCol,
            {
              autoAlpha: 0,
              y: 32,
              duration: 0.7,
              ease: 'power3.out',
            },
            '-=0.45'
          );
        return;
      }

      tl.from(leftCol, {
        x: -56,
        duration: 0.9,
        ease: 'power3.out',
      })
        .from(
          centerParts,
          {
            autoAlpha: 0,
            y: 28,
            duration: 0.65,
            stagger: 0.1,
            ease: 'power2.out',
          },
          0.12
        )
        .from(
          rightCol,
          {
            autoAlpha: 0,
            x: 56,
            y: 32,
            duration: 0.9,
            ease: 'power3.out',
          },
          0.2
        );
    },
    [isCanvas]
  );

  const titleFontSize = isWide
    ? 'clamp(2.25rem, 7cqi, 3.75rem)'
    : 'clamp(2rem, 8cqi, 3rem)';

  return (
    <section
      ref={rootRef}
      id='our-products'
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn('@container w-full bg-black', className)}
      style={composeStyle(
        {
          paddingTop: showStacked ? '3.5rem' : isWide ? 0 : '3.5rem',
          paddingBottom: showStacked ? '3.5rem' : '2.5rem',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div
        className={cn(
          'mx-auto grid w-full items-center',
          isWide && !isCanvas && 'grid-cols-[1.1fr_0.9fr_1.1fr]'
        )}
        style={{
          gap: '2.5rem',
          paddingLeft: isMobile ? '1.5rem' : '4cqi',
          paddingRight: isMobile ? '1.5rem' : '4cqi',
        }}
      >
        {leftProduct ? (
          <ProductCard
            product={leftProduct}
            index={0}
            side='left'
            showStacked={showStacked}
            isCanvas={isCanvas}
            activeKey={activeKey}
            styleOf={styleOf}
          />
        ) : null}

        <div
          data-reveal-center
          className='mx-auto max-w-md text-center'
          style={{
            order: showStacked ? -1 : undefined,
            color: SURFACE,
          }}
        >
          <p
            data-reveal-center-part
            data-element-key='eyebrow'
            className={selectableClass(activeKey === 'eyebrow')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: BELGO_FONT_DISPLAY,
                fontSize: '0.875rem',
                letterSpacing: '0.12em',
                color: SURFACE,
              },
              styleOf('eyebrow')
            )}
          >
            {eyebrow}
          </p>
          <h2
            data-reveal-center-part
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(
              {
                margin: 0,
                marginTop: isWide ? '2rem' : '1.25rem',
                fontFamily: BELGO_FONT_DISPLAY,
                fontSize: titleFontSize,
                lineHeight: 0.95,
                color: SURFACE,
              },
              styleOf('title')
            )}
          >
            {title}
          </h2>
          <p
            data-reveal-center-part
            data-element-key='body'
            className={selectableClass(activeKey === 'body')}
            style={composeStyle(
              {
                margin: 0,
                marginTop: isWide ? '2rem' : '1.25rem',
                marginLeft: 'auto',
                marginRight: 'auto',
                maxWidth: '24rem',
                fontFamily: BELGO_FONT_BODY,
                fontSize: '1rem',
                fontWeight: 600,
                lineHeight: 1.625,
                color: 'rgba(228, 221, 207, 0.85)',
              },
              styleOf('body')
            )}
          >
            {body}
          </p>
        </div>

        {rightProduct ? (
          <ProductCard
            product={rightProduct}
            index={1}
            side='right'
            showStacked={showStacked}
            isCanvas={isCanvas}
            activeKey={activeKey}
            styleOf={styleOf}
          />
        ) : null}
      </div>
    </section>
  );
}
