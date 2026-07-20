'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  CoolHunterProductContent,
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
import { useContainerMobile } from './useContainerMobile';

interface CoolHunterProductProps {
  content: CoolHunterProductContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Product — port từ apps/cool-hunter ProductSection.tsx.
 *
 * Mask bg scale (cửa sổ ellipse nở) + title fade/slide + product offset +
 * panel copy. Khác apps: pin → sticky (360dvh), matchMedia → useContainerMobile,
 * vw/vh → stage offsetWidth/Height + cqw/cqh.
 */

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const DEFAULT_TITLE = 'Interior Design';
const DEFAULT_LABEL = '03 - Architecture';
const DEFAULT_BG = '/cool-hunter/bg-product.png';
const DEFAULT_PRODUCT = '/cool-hunter/product.png';
const DEFAULT_PRODUCT_ALT =
  'A round dining table with a whitewashed top and stone pedestal base';
const DEFAULT_BODY =
  "There's a version of this project that could have been beautiful and forgettable, another polished lake house with good bones and safe choices. What makes the Lake Wehapa retreat compelling is its refusal of the obvious at every turn. The architecture looks settled, as though it grew there; the interiors feel both scholarly and deeply liveable. The whole compound earns what Brown calls its rate of return: they live in every square inch of that house.";

/** Motion constants — prodX/Y as % of stage (apps used vw/vh). */
const V = {
  mobile: {
    bgFrom: 1.55,
    bgScale: 8.5,
    titleLeft: '5%',
    titleScale: 1,
    prodXPct: 38,
    prodYPct: 28,
  },
  desktop: {
    bgFrom: 1,
    bgScale: 6,
    titleLeft: '7%',
    titleScale: 1.25,
    prodXPct: 24,
    prodYPct: 10,
  },
};

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  backgroundColor: '#ffffff',
  containerType: 'size',
};

export function CoolHunterProduct({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterProductProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const bgRef = React.useRef<HTMLImageElement>(null);
  const productRef = React.useRef<HTMLImageElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);

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

  const title = content.title?.trim() || DEFAULT_TITLE;
  const body = content.body?.trim() || DEFAULT_BODY;
  const bgUrl = content.bgUrl?.trim() || DEFAULT_BG;
  const productUrl = content.productUrl?.trim() || DEFAULT_PRODUCT;
  const productAlt = content.productAlt?.trim() || DEFAULT_PRODUCT_ALT;
  const label = content.label?.trim() || DEFAULT_LABEL;
  const v = isMobile ? V.mobile : V.desktop;

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const bg = bgRef.current;
      const product = productRef.current;
      const titleEl = titleRef.current;
      const panel = panelRef.current;
      if (!root || !stage || !bg || !product || !titleEl || !panel || isCanvas)
        return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const prodX = () => (v.prodXPct / 100) * stage.offsetWidth;
      const prodY = () => (v.prodYPct / 100) * stage.offsetHeight;

      // Căn giữa bằng GSAP — không dùng Tailwind translate (TW4 cộng dồn).
      gsap.set(bg, {
        xPercent: -50,
        yPercent: -50,
        scale: v.bgFrom,
        transformOrigin: '50% 26%',
        visibility: 'visible',
      });
      gsap.set(product, {
        xPercent: -50,
        yPercent: -50,
        visibility: 'visible',
      });
      gsap.set(titleEl, { xPercent: -50 });

      const onImgLoad = () => requestRefresh();
      for (const img of [bg, product]) {
        if (!img.complete) {
          img.addEventListener('load', onImgLoad, { once: true });
        }
      }

      if (reduce) {
        gsap.set(bg, { scale: v.bgScale });
        gsap.set(titleEl, {
          autoAlpha: 1,
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
        });
        gsap.set(product, { x: prodX, y: prodY });
        gsap.set(panel, { autoAlpha: 1 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.fromTo(bg, { scale: v.bgFrom }, { scale: v.bgScale, duration: 1 })
        .fromTo(
          titleEl,
          { autoAlpha: 0, y: -40 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          '<0.2'
        )
        .to(titleEl, {
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
          duration: 1,
        })
        .to(product, { x: prodX, y: prodY, duration: 1 }, '<')
        .fromTo(
          panel,
          { autoAlpha: 0, y: 60 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '<0.3'
        );
    },
    [
      isCanvas,
      isMobile,
      v.bgFrom,
      v.bgScale,
      v.prodXPct,
      v.prodYPct,
      v.titleLeft,
      v.titleScale,
      bgUrl,
      productUrl,
    ]
  );

  const titleBase: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '6%' : '8%',
    left: '50%',
    zIndex: 10,
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(1.5rem, 6cqi, 1.875rem)'
      : 'clamp(2.5rem, 7cqi, 4.5rem)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: '#6b7280',
    opacity: 0,
  };

  const productBase: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '54%' : '56%',
    left: '50%',
    zIndex: isMobile ? 30 : 10,
    width: isMobile ? '82cqw' : '36cqw',
    visibility: 'hidden',
  };

  const bgBase: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: 'auto',
        width: '185cqh',
        maxWidth: 'none',
        visibility: 'hidden',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        height: '100cqh',
        width: '100cqw',
        maxWidth: 'none',
        objectFit: 'cover',
        visibility: 'hidden',
      };

  const panelWrap: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '18%',
        left: '5%',
        zIndex: 20,
        width: '68%',
        backgroundColor: '#ffffff',
        padding: 20,
        opacity: 0,
      }
    : {
        position: 'absolute',
        top: '32%',
        left: '7.5%',
        zIndex: 20,
        width: '50cqw',
        backgroundColor: '#ffffff',
        padding: 'clamp(2rem, 4cqi, 3rem)',
        opacity: 0,
      };

  const bodyBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(0.875rem, 3cqi, 0.9375rem)'
      : 'clamp(1rem, 2cqi, 1.25rem)',
    lineHeight: 1.625,
    color: '#171717',
  };

  const labelBase: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: 24,
    zIndex: 20,
    transform: 'translateY(-50%)',
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: '#262626',
    writingMode: 'vertical-rl',
  };

  // ── Editor canvas: flat, mọi field bấm được ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full bg-white', className)}
        style={composeStyle(
          { minHeight: 420 },
          blockBackgroundStyle(background)
        )}
      >
        <div className='flex flex-col gap-6 px-[6cqi] py-[6cqi]'>
          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: '16 / 9', backgroundColor: '#f1f1f2' }}
          >
            <img
              src={bgUrl}
              alt=''
              aria-hidden
              data-element-key='bgUrl'
              className={selectableClass(
                activeKey === 'bgUrl',
                'h-full w-full object-cover'
              )}
              style={styleOf('bgUrl')}
            />
          </div>

          <h2
            data-element-key='title'
            className={selectableClass(activeKey === 'title')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontSize: 'clamp(1.5rem, 5cqi, 2.5rem)',
                fontWeight: 500,
                color: '#111111',
              },
              styleOf('title')
            )}
          >
            {title}
          </h2>

          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: '4 / 3' }}
          >
            <img
              src={productUrl}
              alt={productAlt}
              data-element-key='productUrl'
              className={selectableClass(
                activeKey === 'productUrl',
                'h-full w-full object-contain'
              )}
              style={styleOf('productUrl')}
            />
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '4cqi' }}>
            <p
              data-element-key='body'
              className={selectableClass(activeKey === 'body')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: DISPLAY_FONT,
                  fontSize: 'clamp(0.9375rem, 2.8cqi, 1.125rem)',
                  lineHeight: 1.625,
                  color: '#171717',
                },
                styleOf('body')
              )}
            >
              {body}
            </p>
          </div>

          <span
            data-element-key='label'
            className={selectableClass(activeKey === 'label', 'self-start')}
            style={composeStyle(
              {
                fontFamily:
                  "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#262626',
              },
              styleOf('label')
            )}
          >
            {label}
          </span>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: sticky stage + scrub ──
  return (
    <section
      ref={rootRef}
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: '360dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          className='absolute inset-0'
          style={{ backgroundColor: '#f1f1f2' }}
        />

        <img
          ref={bgRef}
          src={bgUrl}
          alt=''
          aria-hidden
          data-element-key='bgUrl'
          className={selectableClass(activeKey === 'bgUrl')}
          style={composeStyle(bgBase, styleOf('bgUrl'))}
        />

        <h2
          ref={titleRef}
          data-element-key='title'
          className={selectableClass(activeKey === 'title')}
          style={composeStyle(titleBase, styleOf('title'))}
        >
          {title}
        </h2>

        <img
          ref={productRef}
          src={productUrl}
          alt={productAlt}
          data-element-key='productUrl'
          className={selectableClass(activeKey === 'productUrl')}
          style={composeStyle(productBase, styleOf('productUrl'))}
        />

        <div ref={panelRef} style={panelWrap}>
          <p
            data-element-key='body'
            className={selectableClass(activeKey === 'body')}
            style={composeStyle(bodyBase, styleOf('body'))}
          >
            {body}
          </p>
        </div>

        {!isMobile && (
          <span
            data-element-key='label'
            className={selectableClass(activeKey === 'label')}
            style={composeStyle(labelBase, styleOf('label'))}
          >
            {label}
          </span>
        )}
      </div>
    </section>
  );
}
