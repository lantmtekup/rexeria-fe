'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  CoolHunterStoryContent,
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

interface CoolHunterStoryProps {
  content: CoolHunterStoryContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Cool Hunter Story — port từ apps/cool-hunter StorySection.tsx.
 *
 * 4-beat scrub: text1 vào → ảnh vào / text1 lệch → text1 thoát / ảnh nở →
 * ảnh co + text2 hiện. Mobile chạy trục dọc; desktop trục ngang.
 *
 * Khác apps: pin → sticky (outer track 360/400dvh), viewport matchMedia →
 * useContainerMobile, vw/vh tween → đo theo stage (offsetWidth/offsetHeight).
 */

const DEFAULT_IMAGE = '/cool-hunter/section-2.png';
const DEFAULT_IMAGE_ALT =
  'A calm living room with a fireplace, oak cabinetry and leaded windows';

const DEFAULT_TEXT_1 =
  "There's a house on a peninsula in rural Alabama that watches the water from three sides. Its architect, Jeffrey Dungan, says he thought of it as a camera, a device for framing and cropping the world outside. Inside, designer Betsy Brown stripped everything back until only the essential remained. What they produced together is something rare: a family home that feels both deeply rooted in place and entirely its own.";

const DEFAULT_TEXT_2 =
  "Lake Wehapa isn't a name you'll find on many design world itineraries. That's part of the point. Dungan's Birmingham-based practice has long been drawn to the particular poetry of the American South, its craft traditions, its materials, its slow pace, and this project, a retreat conceived around the rhythms of rest, connection, and multi-generational gathering, distils that sensibility down to something almost elemental.";

const DISPLAY_FONT = "'Fraunces', 'Playfair Display', 'Times New Roman', serif";

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  backgroundColor: '#ffffff',
  containerType: 'size',
};

export function CoolHunterStory({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CoolHunterStoryProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const p1Ref = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const p2Ref = React.useRef<HTMLDivElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const text1 = content.text1?.trim() || DEFAULT_TEXT_1;
  const text2 = content.text2?.trim() || DEFAULT_TEXT_2;
  const imageUrl = content.imageUrl?.trim() || DEFAULT_IMAGE;
  const imageAlt = content.imageAlt?.trim() || DEFAULT_IMAGE_ALT;

  const text1Base: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '10%',
        left: '7%',
        width: '86%',
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontSize: 'clamp(1rem, 3.6cqi, 1.125rem)',
        lineHeight: 1.625,
        color: '#171717',
      }
    : {
        position: 'absolute',
        top: '22%',
        left: '51%',
        width: '32%',
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontSize: 'clamp(1.25rem, 2.4cqi, 1.5rem)',
        lineHeight: 1.625,
        color: '#171717',
      };

  const text2Base: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: '58%',
        left: '7%',
        width: '86%',
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontSize: 'clamp(0.9375rem, 3.2cqi, 1rem)',
        lineHeight: 1.625,
        color: '#171717',
        opacity: 0,
      }
    : {
        position: 'absolute',
        top: '30%',
        left: '66%',
        width: '26%',
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontSize: 'clamp(1.125rem, 2cqi, 1.25rem)',
        lineHeight: 1.625,
        color: '#171717',
        opacity: 0,
      };

  const frameBase: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        left: '7%',
        width: '86%',
        overflow: 'hidden',
      }
    : {
        position: 'absolute',
        overflow: 'hidden',
      };

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const p1 = p1Ref.current;
      const frame = frameRef.current;
      const p2 = p2Ref.current;
      if (!root || !stage || !p1 || !frame || !p2 || isCanvas) return;

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const stageH = () => stage.offsetHeight;
      const stageW = () => stage.offsetWidth;

      const img = frame.querySelector('img');
      if (img && !img.complete) {
        img.addEventListener('load', requestRefresh, { once: true });
      }

      if (isMobile) {
        gsap.set(frame, { top: '52%', height: '40%', yPercent: 0 });

        if (reduce) {
          gsap.set(p1, { autoAlpha: 0 });
          gsap.set(frame, { top: '12%', height: '42%' });
          gsap.set(p2, { autoAlpha: 1 });
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

        tl.from(p1, { y: () => stageH() * 0.8, duration: 1 })
          .to(p1, { y: () => -stageH() * 0.3, duration: 1 }, '+=0.4')
          .from(frame, { yPercent: 120, duration: 1 }, '<')
          .to(p1, { x: () => -stageW(), duration: 0.8 }, '+=0.4')
          .to(frame, { top: '12%', height: '74%', duration: 1 }, '<')
          .to(frame, { height: '42%', duration: 1 }, '+=0.4')
          .fromTo(
            p2,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            '<0.3'
          );
        return;
      }

      gsap.set(frame, {
        left: '105%',
        top: '21%',
        width: '47%',
        height: '58%',
      });

      if (reduce) {
        gsap.set(p1, { autoAlpha: 0 });
        gsap.set(frame, { left: '9%', width: '50%' });
        gsap.set(p2, { autoAlpha: 1 });
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

      tl.from(p1, { y: () => stageH() * 0.9, duration: 1 })
        .to(p1, { x: () => -stageW() * 0.47, duration: 1 }, '+=0.4')
        .to(frame, { left: '48%', duration: 1 }, '<')
        .to(p1, { x: () => -stageW() * 1.1, duration: 1 }, '+=0.4')
        .to(frame, { left: '9%', width: '83%', duration: 1 }, '<')
        .to(frame, { width: '50%', duration: 1 }, '+=0.4')
        .fromTo(
          p2,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 0.8 },
          '<0.3'
        );
    },
    [isCanvas, isMobile, text1, text2, imageUrl]
  );

  // ── Editor canvas: stacked, mọi field bấm được ──
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
          <p
            data-element-key='text1'
            className={selectableClass(activeKey === 'text1')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontSize: 'clamp(1rem, 3.2cqi, 1.25rem)',
                lineHeight: 1.625,
                color: '#171717',
              },
              styleOf('text1')
            )}
          >
            {text1}
          </p>

          <div
            className='relative w-full overflow-hidden'
            style={{ aspectRatio: '4 / 3' }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              data-element-key='imageUrl'
              className={selectableClass(
                activeKey === 'imageUrl',
                'h-full w-full object-cover'
              )}
              style={styleOf('imageUrl')}
            />
          </div>

          <p
            data-element-key='text2'
            className={selectableClass(activeKey === 'text2')}
            style={composeStyle(
              {
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontSize: 'clamp(0.9375rem, 2.8cqi, 1.125rem)',
                lineHeight: 1.625,
                color: '#171717',
              },
              styleOf('text2')
            )}
          >
            {text2}
          </p>
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: sticky stage + 4-beat scrub ──
  return (
    <section
      ref={rootRef}
      data-section='welcome'
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        {
          height: isMobile ? '400dvh' : '360dvh',
          backgroundColor: '#ffffff',
        },
        blockBackgroundStyle(background)
      )}
    >
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          ref={p1Ref}
          data-element-key='text1'
          className={selectableClass(activeKey === 'text1')}
          style={composeStyle(text1Base, styleOf('text1'))}
        >
          {text1}
        </div>

        <div ref={frameRef} style={frameBase}>
          <img
            src={imageUrl}
            alt={imageAlt}
            data-element-key='imageUrl'
            className={selectableClass(
              activeKey === 'imageUrl',
              'h-full w-full object-cover'
            )}
            style={styleOf('imageUrl')}
          />
        </div>

        <div
          ref={p2Ref}
          data-element-key='text2'
          className={selectableClass(activeKey === 'text2')}
          style={composeStyle(text2Base, styleOf('text2'))}
        >
          {text2}
        </div>
      </div>
    </section>
  );
}
