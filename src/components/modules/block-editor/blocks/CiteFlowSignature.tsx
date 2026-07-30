'use client';

import * as React from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  CiteFlowSignatureContent,
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
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';

interface CiteFlowSignatureProps {
  content: CiteFlowSignatureContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

CustomEase.create(
  'panelRevealY',
  '0,0 0.047,0.0085 0.094,0.0181 0.141,0.0278 0.188,0.0373 0.235,0.0467 0.282,0.056 0.329,0.0658 0.376,0.0753 0.423,0.0848 0.47,0.0943 0.517,0.1037 0.564,0.1205 0.611,0.2107 0.658,0.3063 0.705,0.4022 0.752,0.4984 0.799,0.5973 0.846,0.6933 0.893,0.7893 0.94,0.8832 1,1'
);
CustomEase.create(
  'panelRevealX',
  '0,0 0.047,0.0125 0.094,0.0264 0.141,0.0406 0.188,0.0545 0.235,0.0683 0.282,0.0818 0.329,0.0961 0.376,0.1101 0.423,0.1239 0.47,0.1377 0.517,0.1515 0.564,0.1718 0.611,0.2583 0.658,0.3496 0.705,0.4411 0.752,0.533 0.799,0.6274 0.846,0.7191 0.893,0.8107 0.94,0.9004 1,1'
);
CustomEase.create(
  'titleReveal',
  '0,0 0.047,0.032 0.094,0.0678 0.141,0.1043 0.188,0.1399 0.235,0.1753 0.282,0.21 0.329,0.2467 0.376,0.2827 0.423,0.3182 0.47,0.3537 0.517,0.389 0.564,0.4258 0.611,0.4872 0.658,0.5495 0.705,0.6117 0.752,0.6742 0.799,0.7385 0.846,0.8009 0.893,0.8632 0.94,0.9242 1,1'
);

const PANEL_Y_PX = 670;
const PANEL_X_PX = 1070;
const TITLE_TOP_Y_PX = { large: 422, small: 352 };
const TITLE_BOTTOM_Y_PX = { large: 439, small: 249 };
const SERVICE_HIDDEN_PX = { large: 150, small: 100 };
const SERVICE_HIDE_MARGIN_PX = 24;
const ENTRANCE_OFFSET = 350;
const MOBILE_BREAKPOINT = 768;
const LARGE_TIER_BREAKPOINT = 1200;

const DEFAULT_TITLE_TOP = 'Explore a new paradigm';
const DEFAULT_TITLE_BOTTOM = 'In Residential Wellness';
const DEFAULT_SERVICE_TITLE = 'Signature Experiences';
const DEFAULT_IMAGE_URL = '/cite-flow/onsen-pools.webp';
const DEFAULT_IMAGE_ALT = 'Ecopark Onsen wellness pavilion';

const TITLE_BASE_STYLE: React.CSSProperties = {
  fontFamily: CITE_FLOW_FONT_HEADING,
  fontWeight: 400,
  lineHeight: 1,
};

export function CiteFlowSignature({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowSignatureProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const imageWrapRef = React.useRef<HTMLDivElement>(null);
  const topWhiteRef = React.useRef<HTMLDivElement>(null);
  const bottomWhiteRef = React.useRef<HTMLDivElement>(null);
  const leftWhiteRef = React.useRef<HTMLDivElement>(null);
  const rightWhiteRef = React.useRef<HTMLDivElement>(null);
  const titleTopRef = React.useRef<HTMLHeadingElement>(null);
  const titleBottomRef = React.useRef<HTMLHeadingElement>(null);
  const serviceTitleRef = React.useRef<HTMLHeadingElement>(null);

  const { requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef, MOBILE_BREAKPOINT);
  const isLarge = !useContainerMobile(rootRef, LARGE_TIER_BREAKPOINT);

  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  React.useLayoutEffect(() => {
    const el = imageWrapRef.current;
    if (!el) return;
    const sync = (w: number, h: number) => {
      const width = Math.round(w / 8) * 8;
      const height = Math.round(h / 8) * 8;
      setImageSize(prev =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height }
      );
    };
    sync(el.clientWidth, el.clientHeight);
    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      sync(rect.width, rect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [fontsReady, setFontsReady] = React.useState(false);
  React.useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const titleTop = content.titleTop?.trim() || DEFAULT_TITLE_TOP;
  const titleBottom = content.titleBottom?.trim() || DEFAULT_TITLE_BOTTOM;
  const serviceTitle = content.serviceTitle?.trim() || DEFAULT_SERVICE_TITLE;
  const imageUrl = content.imageUrl?.trim() || DEFAULT_IMAGE_URL;
  const imageAlt = content.imageAlt?.trim() || DEFAULT_IMAGE_ALT;

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const imageWrap = imageWrapRef.current;
      const panels = [
        topWhiteRef.current,
        bottomWhiteRef.current,
        leftWhiteRef.current,
        rightWhiteRef.current,
      ];
      if (!root || !imageWrap) return;

      const imageRect = imageWrap.getBoundingClientRect();
      const panelYPx = imageRect.height ? imageRect.height / 2 + 4 : PANEL_Y_PX;
      const panelXPx = imageRect.width ? imageRect.width / 2 + 4 : PANEL_X_PX;
      const tier = isLarge ? 'large' : 'small';
      const titleTopFinal = TITLE_TOP_Y_PX[tier];
      const titleBottomFinal = TITLE_BOTTOM_Y_PX[tier];

      gsap.set(topWhiteRef.current, {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      });
      gsap.set(bottomWhiteRef.current, {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      });
      gsap.set(leftWhiteRef.current, {
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
      });
      gsap.set(rightWhiteRef.current, {
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
      });
      gsap.set(panels, { x: 0, y: 0, autoAlpha: 0 });
      gsap.set(serviceTitleRef.current, { y: 0 });
      if (isMobile) gsap.set(stageRef.current, { padding: '1.25rem' });

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(titleTopRef.current, { x: 0, y: -titleTopFinal });
        gsap.set(titleBottomRef.current, { x: 0, y: titleBottomFinal });
        return;
      }

      const serviceHiddenFinal = isLarge
        ? SERVICE_HIDDEN_PX.large
        : (serviceTitleRef.current?.offsetHeight ?? SERVICE_HIDDEN_PX.small) +
          SERVICE_HIDE_MARGIN_PX;
      const entranceOffset = isMobile
        ? ENTRANCE_OFFSET * 0.45
        : ENTRANCE_OFFSET;

      gsap.set(topWhiteRef.current, {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      });
      gsap.set(bottomWhiteRef.current, {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      });
      gsap.set(leftWhiteRef.current, {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      });
      gsap.set(rightWhiteRef.current, {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      });
      gsap.set(panels, { x: 0, y: 0, autoAlpha: 1 });
      gsap.set(titleTopRef.current, { x: -entranceOffset, y: 0 });
      gsap.set(titleBottomRef.current, { x: entranceOffset, y: 0 });
      gsap.set(serviceTitleRef.current, { y: -serviceHiddenFinal });
      if (isMobile) gsap.set(stageRef.current, { padding: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 60%',
            toggleActions: 'play none none none',
            invalidateOnRefresh: true,
          },
        })
        .to(titleTopRef.current, { x: 0, duration: 1.1, ease: 'power2.out' }, 0)
        .to(
          titleBottomRef.current,
          { x: 0, duration: 1.1, ease: 'power2.out' },
          0
        );

      const revealTl = gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(
          topWhiteRef.current,
          { y: -panelYPx * 0.7928, ease: 'panelRevealY', duration: 0.532 },
          0
        )
        .to(
          topWhiteRef.current,
          { y: -panelYPx, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          bottomWhiteRef.current,
          { y: panelYPx * 0.7928, ease: 'panelRevealY', duration: 0.532 },
          0
        )
        .to(
          bottomWhiteRef.current,
          { y: panelYPx, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          leftWhiteRef.current,
          { x: -panelXPx * 0.7928, ease: 'panelRevealX', duration: 0.532 },
          0
        )
        .to(
          leftWhiteRef.current,
          { x: -panelXPx, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          rightWhiteRef.current,
          { x: panelXPx * 0.7928, ease: 'panelRevealX', duration: 0.532 },
          0
        )
        .to(
          rightWhiteRef.current,
          { x: panelXPx, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          titleTopRef.current,
          {
            y: -titleTopFinal * 0.8533,
            ease: 'titleReveal',
            duration: 0.532,
          },
          0
        )
        .to(
          titleTopRef.current,
          { y: -titleTopFinal, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          titleBottomRef.current,
          {
            y: titleBottomFinal * 0.8533,
            ease: 'titleReveal',
            duration: 0.532,
          },
          0
        )
        .to(
          titleBottomRef.current,
          { y: titleBottomFinal, ease: 'power2.out', duration: 0.1 },
          0.532
        )
        .to(
          panels,
          { autoAlpha: 0, ease: 'sine.inOut', duration: 0.235 },
          0.585
        )
        .to(
          serviceTitleRef.current,
          { y: 0, ease: 'sine.inOut', duration: 0.235 },
          0.585
        )
        .set(panels, {}, 1);

      if (isMobile) {
        revealTl.to(
          stageRef.current,
          { padding: '1.25rem', ease: 'sine.inOut', duration: 0.235 },
          0.585
        );
      }
    },
    [isCanvas, isMobile, isLarge, imageSize, fontsReady]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className={cn(
          '@container relative flex w-full flex-col items-center gap-6 bg-neutral-100 p-5',
          className
        )}
      >
        <style>{CITE_FLOW_FONT_CSS}</style>

        <div className='flex w-full flex-col items-center gap-1 text-center'>
          <h1
            data-element-key='titleTop'
            style={composeStyle(
              { ...TITLE_BASE_STYLE, color: '#1a1919' },
              styleOf('titleTop')
            )}
            className={selectableClass(
              activeKey === 'titleTop',
              'inline-block text-[2.5rem] whitespace-pre-line @2xl:text-[3rem] @4xl:text-[3.75rem]'
            )}
          >
            {titleTop}
          </h1>
          <h1
            data-element-key='titleBottom'
            style={composeStyle(
              { ...TITLE_BASE_STYLE, color: '#1a1919' },
              styleOf('titleBottom')
            )}
            className={selectableClass(
              activeKey === 'titleBottom',
              'inline-block text-[2.5rem] whitespace-pre-line @2xl:text-[3rem] @4xl:text-[3.75rem]'
            )}
          >
            {titleBottom}
          </h1>
        </div>

        <div className='relative aspect-6/5 w-full max-w-175 overflow-hidden rounded-2xl'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='imageUrl'
            src={imageUrl}
            alt={imageAlt}
            onLoad={requestRefresh}
            style={composeStyle({ objectFit: 'cover' }, styleOf('imageUrl'))}
            className={selectableClass(
              activeKey === 'imageUrl',
              'absolute inset-0 h-full w-full'
            )}
            draggable={false}
          />
        </div>

        <h1
          data-element-key='serviceTitle'
          style={composeStyle(
            { ...TITLE_BASE_STYLE, color: '#1a1919' },
            styleOf('serviceTitle')
          )}
          className={selectableClass(
            activeKey === 'serviceTitle',
            'inline-block text-center text-[2.5rem] whitespace-pre-line @2xl:text-[3rem] @4xl:text-[3.75rem]'
          )}
        >
          {serviceTitle}
        </h1>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative h-[234dvh] w-full bg-neutral-100',
        className
      )}
    >
      <style>{CITE_FLOW_FONT_CSS}</style>
      <div
        ref={stageRef}
        className='W sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden @2xl:p-5'
      >
        <div ref={imageWrapRef} className='absolute inset-5'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='imageUrl'
            src={imageUrl}
            alt={imageAlt}
            onLoad={requestRefresh}
            style={composeStyle({ objectFit: 'cover' }, styleOf('imageUrl'))}
            className={selectableClass(
              activeKey === 'imageUrl',
              'absolute inset-0 h-full w-full rounded-2xl'
            )}
            draggable={false}
          />

          <div
            ref={topWhiteRef}
            className='absolute -top-1 -right-1 -left-1 h-[calc(50%+4px)] bg-neutral-100'
          />
          <div
            ref={bottomWhiteRef}
            className='absolute -right-1 -bottom-1 -left-1 h-[calc(50%+4px)] bg-neutral-100'
          />
          <div
            ref={leftWhiteRef}
            className='absolute -top-1 -bottom-1 -left-1 w-[calc(50%+4px)] bg-neutral-100'
          />
          <div
            ref={rightWhiteRef}
            className='absolute -top-1 -right-1 -bottom-1 w-[calc(50%+4px)] bg-neutral-100'
          />
        </div>

        <div className='relative flex h-full w-full flex-col items-center justify-center gap-3.75'>
          <div className='w-full overflow-hidden text-center'>
            <h1
              ref={titleTopRef}
              data-element-key='titleTop'
              style={composeStyle(
                { ...TITLE_BASE_STYLE, color: '#1a1919' },
                styleOf('titleTop')
              )}
              className={selectableClass(
                activeKey === 'titleTop',
                'inline-block text-[3.75rem] whitespace-pre-line @2xl:text-[60px] @4xl:text-[5.625rem]'
              )}
            >
              {titleTop}
            </h1>
          </div>
          <div className='w-full overflow-hidden text-center'>
            <h1
              ref={titleBottomRef}
              data-element-key='titleBottom'
              style={composeStyle(
                { ...TITLE_BASE_STYLE, color: '#1a1919' },
                styleOf('titleBottom')
              )}
              className={selectableClass(
                activeKey === 'titleBottom',
                'inline-block text-[3.75rem] whitespace-pre-line @2xl:text-[60px] @4xl:text-[5.625rem]'
              )}
            >
              {titleBottom}
            </h1>
          </div>
        </div>

        <div className='absolute top-1/2 left-1/2 w-[85%] -translate-x-1/2 -translate-y-1/2 overflow-hidden text-center @2xl:w-full @4xl:w-max'>
          <h1
            ref={serviceTitleRef}
            data-element-key='serviceTitle'
            style={composeStyle(
              { ...TITLE_BASE_STYLE, color: '#f5f5f4' },
              styleOf('serviceTitle')
            )}
            className={selectableClass(
              activeKey === 'serviceTitle',
              'inline-block text-[3.75rem] whitespace-pre-line @2xl:text-[60px] @4xl:text-[5.625rem]'
            )}
          >
            {serviceTitle}
          </h1>
        </div>
      </div>
    </section>
  );
}
