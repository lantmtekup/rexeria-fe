'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowHeroContent,
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

interface CiteFlowHeroProps {
  content: CiteFlowHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ENTRANCE_SCALE = 1.15;
const ENTRANCE_DURATION = 1.4;
const HEADING_DELAY = 0.45;
const DESKTOP_TIER_BREAKPOINT = 896;

const DEFAULT_IMAGE_URL = '/cite-flow/hero-bg.webp';
const DEFAULT_IMAGE_ALT = 'Cite Flow development aerial view';
const DEFAULT_HEADING = 'Live with Nature\nBathe in Serenity';
const HEADING_FONT_FAMILY = findFont('abril-fatface').family;

export function CiteFlowHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowHeroProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const { hasRoot, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isBelowDesktop = useContainerMobile(rootRef, DESKTOP_TIER_BREAKPOINT);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const imageUrl = content.backgroundImageUrl?.trim() || DEFAULT_IMAGE_URL;
  const imageAlt = content.backgroundImageAlt?.trim() || DEFAULT_IMAGE_ALT;
  const heading = content.heading?.trim() || DEFAULT_HEADING;

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const image = imageRef.current;
      const headingEl = headingRef.current;
      if (!root || !image || !headingEl) return;
      if (!hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(image, { scale: ENTRANCE_SCALE, force3D: true });
      gsap.set(headingEl, { opacity: 0 });

      const entrance = gsap.timeline();
      entrance.to(image, {
        scale: 1,
        duration: ENTRANCE_DURATION,
        ease: 'power3.out',
      });
      entrance.to(
        headingEl,
        { opacity: 1, duration: ENTRANCE_DURATION, ease: 'sine.out' },
        HEADING_DELAY
      );

      // Chỉ đúng ở tier desktop — tablet không đủ rộng nên parallax kéo Hero
      // đè lên section kế tiếp (CiteFlowIntro).
      if (isBelowDesktop) return;

      gsap.to(root, {
        y: window.innerHeight * 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    [hasRoot, isCanvas, isBelowDesktop]
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative h-dvh w-full overflow-hidden bg-neutral-950',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        data-element-key='backgroundImageUrl'
        src={imageUrl}
        alt={imageAlt}
        onLoad={requestRefresh}
        style={composeStyle(
          { objectFit: 'cover' },
          styleOf('backgroundImageUrl')
        )}
        className={selectableClass(
          activeKey === 'backgroundImageUrl',
          'absolute inset-0 h-full w-full will-change-transform'
        )}
        draggable={false}
      />

      <div className='relative flex h-full flex-col items-center justify-center px-5 @4xl:items-start @4xl:justify-end @4xl:px-16 @4xl:pt-15 @4xl:pb-12.5'>
        <h1
          ref={headingRef}
          data-element-key='heading'
          style={composeStyle(
            {
              color: '#ffffff',
              lineHeight: 1.1,
              fontFamily: HEADING_FONT_FAMILY,
            },
            styleOf('heading')
          )}
          className={selectableClass(
            activeKey === 'heading',
            'relative w-full max-w-225 text-center text-[40px] whitespace-pre-line @4xl:w-204.75 @4xl:text-left @4xl:text-[85px]'
          )}
        >
          {heading}
        </h1>
      </div>
    </section>
  );
}
