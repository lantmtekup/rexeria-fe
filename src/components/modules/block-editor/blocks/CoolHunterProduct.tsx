'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
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
 * bgWrap (xám + mask) scale + title + product scale/offset + panelFill scale.
 * Khác apps: pin → sticky track, matchMedia → useContainerMobile.
 */

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const DEFAULT_TITLE = 'Interior Design';
const DEFAULT_BG = '/cool-hunter/bg-product.png';
const DEFAULT_PRODUCT = '/cool-hunter/product.png';
const DEFAULT_PRODUCT_ALT =
  'A round dining table with a whitewashed top and stone pedestal base';
const DEFAULT_BODY =
  "There's a version of this project that could have been beautiful and forgettable, another polished lake house with good bones and safe choices. What makes the Lake Wehapa retreat compelling is its refusal of the obvious at every turn. The architecture looks settled, as though it grew there; the interiors feel both scholarly and deeply liveable. The whole compound earns what Brown calls its rate of return: they live in every square inch of that house.";

const V = {
  mobile: {
    bgFrom: 0.1,
    bgScale: 8.5,
    titleLeft: '5%',
    titleScale: 1,
    prodY: '32%',
  },
  desktop: {
    bgFrom: 0.1,
    bgScale: 6,
    titleLeft: '7%',
    titleScale: 1.25,
    prodY: '8%',
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

/** Desktop: dịch bàn sao cho tâm ảnh trùng cạnh phải khung panel. */
const getDesktopProdX = (
  stage: HTMLElement,
  panelWrap: HTMLElement
): number => {
  const stageRect = stage.getBoundingClientRect();
  const panelRect = panelWrap.getBoundingClientRect();
  const productCenterAtRest = stageRect.left + stageRect.width / 2;
  return panelRect.right - productCenterAtRest;
};

/** Desktop: đáy khung trắng trùng chân ảnh bàn (đo sau khi product ở vị trí cuối). */
const syncDesktopPanelTop = (
  stage: HTMLElement,
  product: HTMLElement,
  panelWrap: HTMLElement
) => {
  const stageRect = stage.getBoundingClientRect();
  const productRect = product.getBoundingClientRect();
  const panelH = panelWrap.offsetHeight;
  if (stageRect.height <= 0 || panelH <= 0) return;

  const footY = productRect.bottom - stageRect.top;
  const topPx = Math.max(0, footY - panelH);
  gsap.set(panelWrap, { top: `${(topPx / stageRect.height) * 100}%` });
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
  const bgWrapRef = React.useRef<HTMLDivElement>(null);
  const productRef = React.useRef<HTMLImageElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);
  const panelWrapRef = React.useRef<HTMLDivElement>(null);
  const panelFillRef = React.useRef<HTMLDivElement>(null);
  const panelTextRef = React.useRef<HTMLParagraphElement>(null);
  const isMobile = useContainerMobile(rootRef);
  const isWideDesktop = !useContainerMobile(rootRef, 1024);

  const isCanvas = useIsCanvasEdit(rootRef);

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
  const v = isMobile ? V.mobile : V.desktop;

  // Căn đáy panel trắng = chân ảnh bàn (desktop preview + /p). Tách khỏi
  // useBlockMotion — tránh ScrollTrigger.refresh ↔ listener vòng lặp vô hạn.
  React.useLayoutEffect(() => {
    if (isCanvas || isMobile) return;

    const stage = stageRef.current;
    const product = productRef.current;
    const panelWrap = panelWrapRef.current;
    if (!stage || !product || !panelWrap) return;

    const prodYFraction = parseFloat(V.desktop.prodY) / 100;
    const prodY = () => prodYFraction * stage.offsetHeight;

    const layoutPanel = () => {
      gsap.set(product, {
        x: getDesktopProdX(stage, panelWrap),
        y: prodY(),
        scale: 1,
        visibility: 'visible',
      });
      syncDesktopPanelTop(stage, product, panelWrap);
      gsap.set(product, {
        x: 0,
        y: 0,
        scale: V.desktop.bgFrom,
        visibility: 'visible',
      });
    };

    layoutPanel();

    const ro = new ResizeObserver(() => layoutPanel());
    ro.observe(stage);

    const handleLoad = () => layoutPanel();
    if (!product.complete) {
      product.addEventListener('load', handleLoad, { once: true });
    }

    return () => {
      ro.disconnect();
      product.removeEventListener('load', handleLoad);
    };
  }, [isCanvas, isMobile, productUrl, body, isWideDesktop, title]);

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const bgWrap = bgWrapRef.current;
      const panelWrap = panelWrapRef.current;
      const panelFill = panelFillRef.current;
      const panelText = panelTextRef.current;
      const product = productRef.current;
      const titleEl = titleRef.current;
      if (
        !root ||
        !stage ||
        !bgWrap ||
        !panelWrap ||
        !panelFill ||
        !panelText ||
        !product ||
        !titleEl ||
        isCanvas
      )
        return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const getProdX = () => (isMobile ? 0 : getDesktopProdX(stage, panelWrap));
      const prodY = () => (parseFloat(v.prodY) / 100) * stage.offsetHeight;

      gsap.set(bgWrap, {
        xPercent: -50,
        yPercent: -26,
        scale: v.bgFrom,
        transformOrigin: '50% 26%',
        visibility: 'visible',
      });
      gsap.set(product, {
        xPercent: -50,
        yPercent: -50,
        scale: v.bgFrom,
        transformOrigin: '50% 40%',
        visibility: 'visible',
      });
      gsap.set(titleEl, { xPercent: -50 });
      gsap.set(panelFill, { scale: 0, transformOrigin: 'left top' });
      gsap.set(panelText, { autoAlpha: 0 });

      const onImgLoad = () => requestRefresh();

      bgWrap.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', onImgLoad, { once: true });
        }
      });
      if (!product.complete) {
        product.addEventListener('load', onImgLoad, { once: true });
      }

      if (reduce) {
        gsap.set(bgWrap, { scale: v.bgScale });
        gsap.set(titleEl, {
          autoAlpha: 1,
          left: v.titleLeft,
          xPercent: 0,
          color: '#111111',
          scale: v.titleScale,
          transformOrigin: 'left center',
        });
        gsap.set(product, { x: getProdX(), y: prodY(), scale: 1 });
        if (!isMobile) {
          syncDesktopPanelTop(stage, product, panelWrap);
        }
        gsap.set(panelFill, { scale: 1, transformOrigin: 'left top' });
        gsap.set(panelText, { autoAlpha: 1 });
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

      tl.fromTo(bgWrap, { scale: v.bgFrom }, { scale: v.bgScale, duration: 1 })
        .fromTo(product, { scale: v.bgFrom }, { scale: 1, duration: 1 }, '<')
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
        .to(product, { x: getProdX, y: prodY, duration: 1 }, '<')
        .fromTo(
          panelFill,
          { scale: 0, transformOrigin: 'left top' },
          { scale: 1, duration: 0.8 },
          '<0.3'
        )
        .fromTo(
          panelText,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5 },
          '<0.25'
        );
    },
    [
      isCanvas,
      isMobile,
      v.bgFrom,
      v.bgScale,
      v.prodY,
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
      : 'clamp(2.5rem, 7cqi, 4.75rem)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    color: '#6b7280',
    opacity: 0,
  };

  const productBase: React.CSSProperties = {
    position: 'absolute',
    top: isMobile ? '54%' : '56%',
    left: '50%',
    zIndex: 30,
    width: isMobile ? '76cqw' : '36cqw',
    maxWidth: '100%',
    visibility: 'hidden',
  };

  const bgWrapBase: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '185cqh',
        maxWidth: 'none',
        aspectRatio: '1440 / 840',
        visibility: 'hidden',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100cqw',
        height: '100cqh',
        maxWidth: 'none',
        visibility: 'hidden',
      };

  const panelWrapStyle: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '18%',
        left: '5%',
        zIndex: 20,
        width: '90%',
        padding: '5cqi',
      }
    : isWideDesktop
      ? {
          position: 'absolute',
          left: '7%',
          zIndex: 20,
          width: '60cqw',
          padding: '5rem 4rem',
        }
      : {
          position: 'absolute',
          left: '6%',
          zIndex: 20,
          width: '64cqw',
          padding: '3.5rem 3rem',
        };

  const bodyBase: React.CSSProperties = {
    position: 'relative',
    margin: 0,
    fontFamily: DISPLAY_FONT,
    fontSize: isMobile
      ? 'clamp(0.875rem, 3cqi, 0.9375rem)'
      : 'clamp(1rem, 2cqi, 1.25rem)',
    lineHeight: 1.625,
    color: '#171717',
    maxWidth: isMobile ? '100%' : isWideDesktop ? '70%' : '72%',
    opacity: 0,
  };

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
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-section='architecture'
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: isMobile ? '275dvh' : '360dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          ref={bgWrapRef}
          style={bgWrapBase}
          className={selectableClass(activeKey === 'bgUrl')}
        >
          <div
            className='absolute inset-0'
            style={{ backgroundColor: '#f1f1f2' }}
            aria-hidden
          />
          <img
            src={bgUrl}
            alt=''
            aria-hidden
            data-element-key='bgUrl'
            className='absolute inset-0 h-full w-full object-cover'
            style={styleOf('bgUrl')}
          />
        </div>

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

        <div ref={panelWrapRef} style={panelWrapStyle}>
          <div
            ref={panelFillRef}
            aria-hidden
            className='absolute inset-0 origin-top-left'
            style={{ backgroundColor: '#ffffff' }}
          />
          <p
            ref={panelTextRef}
            data-element-key='body'
            className={selectableClass(activeKey === 'body')}
            style={composeStyle(bodyBase, styleOf('body'))}
          >
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
