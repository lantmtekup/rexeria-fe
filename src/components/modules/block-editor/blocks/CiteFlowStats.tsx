'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowStatsContent,
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
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { useContainerMobile } from './useContainerMobile';
import { CITE_FLOW_FONT_CSS, CITE_FLOW_FONT_HEADING } from './citeFlowTheme';

interface CiteFlowStatsProps {
  content: CiteFlowStatsContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const CITE_FLOW_STATS_BREAKPOINT = 1280;

const DEFAULT_IMAGE_DESKTOP = '/cite-flow/stats-bg.jpg';
const DEFAULT_IMAGE_MOBILE = '/cite-flow/stats-md-bg.avif';
const DEFAULT_IMAGE_ALT = 'Ecopark Onsen garden boardwalk';

interface StatField {
  key: 'stat1' | 'stat2' | 'stat3' | 'stat4';
  value: string;
  suffix: string;
  label: string;
}

const DEFAULT_STATS: StatField[] = [
  {
    key: 'stat1',
    value: '500',
    suffix: ' ha',
    label: 'The scale behind the project',
  },
  {
    key: 'stat2',
    value: '20',
    suffix: ' %+',
    label: 'Land devoted to water and greenery',
  },
  { key: 'stat3', value: '13', suffix: '', label: 'Therapeutic soaking pools' },
  {
    key: 'stat4',
    value: '8.2',
    suffix: '+ B USD',
    label: 'Financial investment for project',
  },
];

const resolveStats = (content: CiteFlowStatsContent): StatField[] => [
  {
    key: 'stat1',
    value: content.stat1Value?.trim() || DEFAULT_STATS[0].value,
    suffix: content.stat1Suffix ?? DEFAULT_STATS[0].suffix,
    label: content.stat1Label?.trim() || DEFAULT_STATS[0].label,
  },
  {
    key: 'stat2',
    value: content.stat2Value?.trim() || DEFAULT_STATS[1].value,
    suffix: content.stat2Suffix ?? DEFAULT_STATS[1].suffix,
    label: content.stat2Label?.trim() || DEFAULT_STATS[1].label,
  },
  {
    key: 'stat3',
    value: content.stat3Value?.trim() || DEFAULT_STATS[2].value,
    suffix: content.stat3Suffix ?? DEFAULT_STATS[2].suffix,
    label: content.stat3Label?.trim() || DEFAULT_STATS[2].label,
  },
  {
    key: 'stat4',
    value: content.stat4Value?.trim() || DEFAULT_STATS[3].value,
    suffix: content.stat4Suffix ?? DEFAULT_STATS[3].suffix,
    label: content.stat4Label?.trim() || DEFAULT_STATS[3].label,
  },
];

const VALUE_FONT_FAMILY = findFont('abril-fatface').family;

const VALUE_BASE_STYLE: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 400,
  fontFamily: VALUE_FONT_FAMILY,
};

const LABEL_BASE_STYLE: React.CSSProperties = {
  color: '#ffffff',
  fontWeight: 400,
  fontFamily: CITE_FLOW_FONT_HEADING,
};

export function CiteFlowStats({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowStatsProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const imageWrapRef = React.useRef<HTMLDivElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  const isCompact = useContainerMobile(rootRef, CITE_FLOW_STATS_BREAKPOINT);
  const { requestRefresh } = useLandingMotion();

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const stats = React.useMemo(() => resolveStats(content), [content]);
  const imageDesktop =
    content.backgroundImageDesktopUrl?.trim() || DEFAULT_IMAGE_DESKTOP;
  const imageMobile =
    content.backgroundImageMobileUrl?.trim() || DEFAULT_IMAGE_MOBILE;
  const imageAlt = content.backgroundImageAlt?.trim() || DEFAULT_IMAGE_ALT;

  useMotionAttributes(rootRef, [isCompact, isCanvas]);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const imageWrap = imageWrapRef.current;
      if (!root || !imageWrap || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(imageWrap, { scale: 0.9 });
      gsap.to(imageWrap, {
        scale: 1,
        ease: 'sine.out',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'top top',
          scrub: true,
        },
      });

      const inners = gsap.utils.toArray<HTMLElement>('.cfs-stat-inner', root);
      if (inners.length === 0) return;

      if (isCompact) {
        gsap.set(inners, { yPercent: 0 });
        return;
      }

      gsap.set(inners, { yPercent: 100 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
      inners.forEach(el => {
        tl.to(el, { yPercent: 0, ease: 'sine.out', duration: 1 });
      });
    },
    [isCanvas, isCompact]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        style={blockBackgroundStyle(background)}
        className={cn(
          '@container relative w-full bg-neutral-100 p-5',
          className
        )}
      >
        <style>{CITE_FLOW_FONT_CSS}</style>
        <div className='grid grid-cols-2 gap-2'>
          <div
            data-element-key='backgroundImageDesktopUrl'
            style={composeStyle({}, styleOf('backgroundImageDesktopUrl'))}
            className={selectableClass(
              activeKey === 'backgroundImageDesktopUrl',
              'relative aspect-video overflow-hidden rounded-lg'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDesktop}
              alt={imageAlt}
              className='h-full w-full object-cover'
              draggable={false}
            />
            <span className='pointer-events-none absolute top-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white'>
              Desktop
            </span>
          </div>
          <div
            data-element-key='backgroundImageMobileUrl'
            style={composeStyle({}, styleOf('backgroundImageMobileUrl'))}
            className={selectableClass(
              activeKey === 'backgroundImageMobileUrl',
              'relative aspect-video overflow-hidden rounded-lg'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageMobile}
              alt={imageAlt}
              className='h-full w-full object-cover'
              draggable={false}
            />
            <span className='pointer-events-none absolute top-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white'>
              Mobile
            </span>
          </div>
        </div>

        <div className='mt-4 grid grid-cols-1 gap-4 rounded-lg bg-neutral-900 p-5 @2xl:grid-cols-4'>
          {stats.map(stat => (
            <div key={stat.key} className='flex flex-col items-start gap-2.5'>
              <p
                data-element-key={`${stat.key}Value`}
                style={composeStyle(
                  VALUE_BASE_STYLE,
                  styleOf(`${stat.key}Value`)
                )}
                className={selectableClass(
                  activeKey === `${stat.key}Value`,
                  'text-[40px] leading-12'
                )}
              >
                {stat.value}
                {stat.suffix}
              </p>
              <p
                data-element-key={`${stat.key}Label`}
                style={composeStyle(
                  LABEL_BASE_STYLE,
                  styleOf(`${stat.key}Label`)
                )}
                className={selectableClass(
                  activeKey === `${stat.key}Label`,
                  'text-[16px] leading-[22.4px]'
                )}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative w-full bg-neutral-100',
        isCompact ? 'h-dvh' : 'h-[400dvh]',
        className
      )}
    >
      <style>{CITE_FLOW_FONT_CSS}</style>
      <div className='sticky top-0 flex h-dvh w-full items-center justify-center overflow-hidden'>
        <div
          ref={imageWrapRef}
          className='absolute inset-5 overflow-hidden rounded-2xl'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='backgroundImageMobileUrl'
            src={imageMobile}
            alt={imageAlt}
            onLoad={requestRefresh}
            style={composeStyle({}, styleOf('backgroundImageMobileUrl'))}
            className={selectableClass(
              activeKey === 'backgroundImageMobileUrl',
              'absolute inset-0 h-full w-full object-cover @4xl:hidden'
            )}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-element-key='backgroundImageDesktopUrl'
            src={imageDesktop}
            alt={imageAlt}
            onLoad={requestRefresh}
            style={composeStyle({}, styleOf('backgroundImageDesktopUrl'))}
            className={selectableClass(
              activeKey === 'backgroundImageDesktopUrl',
              'absolute inset-0 hidden h-full w-full object-cover @4xl:block'
            )}
            draggable={false}
          />
        </div>

        <div className='relative z-10 flex w-full max-w-275 flex-col items-center gap-5 px-5 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-0 @4xl:px-0'>
          {stats.map(stat => (
            <div key={stat.key} className='overflow-hidden'>
              <div className='cfs-stat-inner flex flex-col items-center gap-2.5 @4xl:items-start @4xl:gap-3'>
                <p
                  data-element-key={`${stat.key}Value`}
                  data-motion={isCompact ? 'counter' : undefined}
                  data-motion-once='true'
                  style={composeStyle(
                    VALUE_BASE_STYLE,
                    styleOf(`${stat.key}Value`)
                  )}
                  className={selectableClass(
                    activeKey === `${stat.key}Value`,
                    'text-[40px] leading-12 tabular-nums @4xl:text-[50px] @4xl:leading-15'
                  )}
                >
                  {stat.value}
                  {stat.suffix}
                </p>
                <p
                  data-element-key={`${stat.key}Label`}
                  style={composeStyle(
                    LABEL_BASE_STYLE,
                    styleOf(`${stat.key}Label`)
                  )}
                  className={selectableClass(
                    activeKey === `${stat.key}Label`,
                    'text-center text-[16px] leading-[22.4px] @4xl:text-left @4xl:text-[18px] @4xl:leading-6.75'
                  )}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
