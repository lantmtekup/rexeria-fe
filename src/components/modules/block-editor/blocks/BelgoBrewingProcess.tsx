'use client';

/**
 * Belgo · Brewing Process — video nền full-viewport + text reveal GSAP +
 * cup overlay fixed (clip-path reveal theo scroll). Port từ
 * apps/belgo BrewingProcess.tsx.
 *
 * Canvas: layout phẳng (hiện cup inline) — bỏ fixed overlay + motion.
 * Preview + /p: giữ UX production (portal cup khi cần, clip-path scroll).
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { BlockMedia } from '../BlockMedia';
import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type { BelgoBrewingProcessContent } from '../types';
import type { BlockRenderProps } from './_registry/types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import {
  BELGO_CREAM,
  BELGO_FONT_BODY,
  BELGO_FONT_CSS,
  BELGO_FONT_DISPLAY,
} from './belgoTheme';
import { useContainerMobile } from './useContainerMobile';

const DEFAULT_VIDEO = '/belgo/videos/cup.mp4';
const DEFAULT_CUP = '/belgo/section-3/cup.png';
const CUP_CLIP_HIDDEN = 'inset(100% 0px 0px 0px)';
const Z_CUP = 45;

export function BelgoBrewingProcess({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: BlockRenderProps<BelgoBrewingProcessContent>) {
  const rootRef = React.useRef<HTMLElement>(null);
  const cupWrapRef = React.useRef<HTMLDivElement>(null);
  const cupInnerRef = React.useRef<HTMLDivElement>(null);

  const { hasRoot } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);
  const [mounted, setMounted] = React.useState(false);
  const [isCanvas, setIsCanvas] = React.useState(true);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!hasRoot) {
      setIsCanvas(false);
      setPortalHost(document.body);
      return;
    }
    const canvas = !!root.closest('[data-testid="active-block-preview"]');
    setIsCanvas(canvas);
    setPortalHost(resolveDrawerPortalHost(root));
  }, [hasRoot]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const videoUrl = content.videoUrl?.trim() || DEFAULT_VIDEO;
  const cupImageUrl = content.cupImageUrl?.trim() || DEFAULT_CUP;
  const eyebrow = content.eyebrow?.trim() || 'BREWING PROCESS';
  const title =
    content.title?.trim() ||
    'THE ART OF BELGIAN BREWING – A LEGACY IN EVERY DROP';
  const body =
    content.body?.trim() ||
    'From carefully selected malt to the final pour, every step in our brewing process is crafted for perfection. Milled grains, precise mashing, controlled fermentation, and expert conditioning ensure a smooth, flavorful beer. Whether bottled or on tap, each sip embodies true Belgian craftsmanship.';

  const titleFontSize = isMobile
    ? 'clamp(2rem, 10cqi, 3rem)'
    : 'clamp(2.5rem, 8cqi, 4.5rem)';
  const cupWidth = isMobile
    ? 'clamp(140px, 52cqi, 220px)'
    : 'clamp(180px, 40cqi, 280px)';

  useBlockMotion(
    rootRef,
    ({ scroller, isMobile: motionMobile, requestRefresh }) => {
      if (isCanvas) return;

      const root = rootRef.current;
      const cupWrap = cupWrapRef.current;
      const cupInner = cupInnerRef.current;
      if (!root) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const leftCol = root.querySelector<HTMLElement>('[data-reveal-left]');
      const rightCol = root.querySelector<HTMLElement>('[data-reveal-right]');
      const leftParts = gsap.utils.toArray<HTMLElement>(
        '[data-reveal-left-part]',
        root
      );

      if (!reduce && leftCol && rightCol) {
        const tl = gsap.timeline({
          paused: true,
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 72%',
            end: 'bottom 28%',
            toggleActions: 'restart reverse restart reverse',
          },
        });

        tl.from(leftCol, {
          x: motionMobile ? 0 : -56,
          duration: 0.9,
          ease: 'power3.out',
        })
          .from(
            leftParts,
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
              x: motionMobile ? 0 : 56,
              y: 32,
              duration: 0.9,
              ease: 'power3.out',
            },
            0.2
          );
      } else if (leftCol && rightCol) {
        gsap.set([leftCol, rightCol, ...leftParts], {
          autoAlpha: 1,
          x: 0,
          y: 0,
        });
      }

      if (!cupWrap || !cupInner) return;

      const host =
        portalHost ??
        root.closest<HTMLElement>('[data-device-frame]') ??
        document.body;
      const viewportHeight = isDeviceFrameHost(host)
        ? host.clientHeight
        : window.innerHeight;

      cupWrap.style.clipPath = CUP_CLIP_HIDDEN;

      const updateCup = () => {
        const r = root.getBoundingClientRect();
        if (r.top > 0) {
          cupInner.style.transform = 'translateY(0px)';
          cupWrap.style.clipPath = `inset(${Math.min(viewportHeight, r.top)}px 0px 0px 0px)`;
        } else {
          cupInner.style.transform = `translateY(${r.top}px)`;
          cupWrap.style.clipPath = 'inset(0px 0px 0px 0px)';
        }
      };

      if (reduce) {
        cupWrap.style.clipPath = 'inset(0px 0px 0px 0px)';
        cupInner.style.transform = 'translateY(0px)';
        return;
      }

      ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onEnter: updateCup,
        onEnterBack: updateCup,
        onUpdate: updateCup,
        onRefresh: updateCup,
        onLeave: () => {
          cupWrap.style.clipPath = CUP_CLIP_HIDDEN;
        },
        onLeaveBack: () => {
          cupWrap.style.clipPath = CUP_CLIP_HIDDEN;
        },
      });

      updateCup();
      requestRefresh();
    },
    [isCanvas, portalHost]
  );

  const renderVideo = () =>
    videoUrl ? (
      <BlockMedia
        key={videoUrl}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        className='h-full w-full object-cover'
      />
    ) : null;

  const cupImage = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cupImageUrl}
      alt=''
      decoding='async'
      style={{ width: cupWidth, objectFit: 'contain' }}
    />
  );

  const cupOverlay =
    !isCanvas && mounted ? (
      <div
        ref={cupWrapRef}
        aria-hidden='true'
        className='belgo-brewing-cup-wrap pointer-events-none'
        style={{
          position:
            hasRoot && portalHost && isDeviceFrameHost(portalHost)
              ? 'absolute'
              : 'fixed',
          inset: 0,
          zIndex: Z_CUP,
          clipPath: CUP_CLIP_HIDDEN,
        }}
      >
        <div
          ref={cupInnerRef}
          className='absolute inset-0 flex items-center justify-center'
          style={{ willChange: 'transform' }}
        >
          <div
            data-element-key='cupImageUrl'
            className={selectableClass(
              activeKey === 'cupImageUrl',
              'flex items-center justify-center'
            )}
            style={styleOf('cupImageUrl')}
          >
            {cupImage}
          </div>
        </div>
      </div>
    ) : null;

  const portaledCup =
    cupOverlay && hasRoot && portalHost
      ? createPortal(cupOverlay, portalHost)
      : cupOverlay;

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        id='brewing-process'
        data-canvas-edit='true'
        style={composeStyle(
          {
            position: 'relative',
            backgroundColor: '#0a0705',
            minHeight: 'clamp(520px, 90cqi, 720px)',
          },
          blockBackgroundStyle(background)
        )}
        className={cn('@container relative w-full overflow-hidden', className)}
      >
        <style>{BELGO_FONT_CSS}</style>

        <div
          data-element-key='videoUrl'
          className={selectableClass(
            activeKey === 'videoUrl',
            'absolute inset-0 h-full w-full'
          )}
          style={composeStyle(
            { position: 'absolute', inset: 0 },
            styleOf('videoUrl')
          )}
        >
          {renderVideo()}
        </div>

        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        />

        <div className='relative z-10 grid min-h-[inherit] gap-8 px-6 py-10 @4xl:grid-cols-2 @4xl:items-center @4xl:gap-8 @4xl:px-20'>
          <div className='max-w-xl min-w-0'>
            <p
              data-element-key='eyebrow'
              className={selectableClass(activeKey === 'eyebrow', 'block')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: 'clamp(12px, 1.4cqi, 14px)',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  color: BELGO_CREAM,
                },
                styleOf('eyebrow')
              )}
            >
              {eyebrow}
            </p>
            <h2
              data-element-key='title'
              className={selectableClass(activeKey === 'title', 'block')}
              style={composeStyle(
                {
                  margin: 'clamp(12px, 2cqi, 24px) 0 0',
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: titleFontSize,
                  fontWeight: 400,
                  lineHeight: 0.95,
                  color: BELGO_CREAM,
                },
                styleOf('title')
              )}
            >
              {title}
            </h2>
          </div>

          <div className='flex flex-col items-center gap-8 @4xl:items-end'>
            <div
              data-element-key='cupImageUrl'
              className={selectableClass(
                activeKey === 'cupImageUrl',
                'flex shrink-0 items-center justify-center'
              )}
              style={styleOf('cupImageUrl')}
            >
              {cupImage}
            </div>

            <p
              data-element-key='body'
              className={selectableClass(
                activeKey === 'body',
                'block max-w-sm min-w-0'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: 'clamp(14px, 1.6cqi, 16px)',
                  fontWeight: 600,
                  lineHeight: 1.625,
                  color: 'rgba(237, 230, 214, 0.9)',
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
    <>
      <section
        ref={rootRef}
        id='brewing-process'
        style={composeStyle(
          {
            position: 'relative',
            zIndex: 40,
            height: '100dvh',
            backgroundColor: '#0a0705',
          },
          blockBackgroundStyle(background)
        )}
        className={cn(
          '@container relative z-40 w-full overflow-x-hidden',
          className
        )}
      >
        <style>{BELGO_FONT_CSS}</style>

        <div
          data-element-key='videoUrl'
          className={selectableClass(
            activeKey === 'videoUrl',
            'absolute inset-0 h-full w-full'
          )}
          style={composeStyle(
            { position: 'absolute', inset: 0 },
            styleOf('videoUrl')
          )}
        >
          {renderVideo()}
        </div>

        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        />

        <div className='relative z-10 flex h-full min-w-0 flex-col justify-between px-6 pt-20 pb-10 @4xl:grid @4xl:grid-cols-2 @4xl:items-center @4xl:gap-8 @4xl:px-20 @4xl:py-0'>
          <div data-reveal-left className='max-w-xl min-w-0 shrink-0'>
            <p
              data-reveal-left-part
              data-element-key='eyebrow'
              className={selectableClass(activeKey === 'eyebrow', 'block')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: BELGO_FONT_BODY,
                  fontSize: 'clamp(12px, 1.4cqi, 14px)',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  color: BELGO_CREAM,
                },
                styleOf('eyebrow')
              )}
            >
              {eyebrow}
            </p>
            <h2
              data-reveal-left-part
              data-element-key='title'
              className={selectableClass(activeKey === 'title', 'block')}
              style={composeStyle(
                {
                  margin: 'clamp(12px, 2cqi, 24px) 0 0',
                  fontFamily: BELGO_FONT_DISPLAY,
                  fontSize: titleFontSize,
                  fontWeight: 400,
                  lineHeight: 0.95,
                  color: BELGO_CREAM,
                },
                styleOf('title')
              )}
            >
              {title}
            </h2>
          </div>

          <p
            data-reveal-right
            data-element-key='body'
            className={selectableClass(
              activeKey === 'body',
              'block max-w-sm min-w-0 shrink-0 @4xl:mt-[200px] @4xl:justify-self-end'
            )}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: BELGO_FONT_BODY,
                fontSize: 'clamp(14px, 1.6cqi, 16px)',
                fontWeight: 600,
                lineHeight: 1.625,
                color: 'rgba(237, 230, 214, 0.9)',
              },
              styleOf('body')
            )}
          >
            {body}
          </p>
        </div>
      </section>

      {portaledCup}
    </>
  );
}
