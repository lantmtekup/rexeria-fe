'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';
import { findFont } from '@/lib/fonts';

import type {
  BlockBackground,
  CiteFlowIntroContent,
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
import { useMotionAttributes } from '../motion/useMotionAttributes';

interface CiteFlowIntroProps {
  content: CiteFlowIntroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const DEFAULT_EYEBROW = 'Ecopark Onsen';
const DEFAULT_HEADING =
  "Life Style Redefined. It's a first of its kind concept in Vietnam set within Ecopark's larger vision of green, sustainable urban living";
const DEFAULT_PLAY_ICON_URL = '/cite-flow/play-button.svg';

const MEDIA_SCALE_FROM = 0.9;
const MEDIA_APPEAR_PROGRESS = 0.6;

const HEADING_FONT_FAMILY = findFont('abril-fatface').family;

export function CiteFlowIntro({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: CiteFlowIntroProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [hasAppeared, setHasAppeared] = React.useState(false);
  const rootRef = React.useRef<HTMLElement>(null);
  const mediaRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playButtonRef = React.useRef<HTMLButtonElement>(null);
  const { hasRoot, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || DEFAULT_EYEBROW;
  const heading = content.heading?.trim() || DEFAULT_HEADING;
  const posterUrl = content.posterUrl?.trim() || '';
  const videoUrl = content.videoUrl?.trim() || '';
  const playIconUrl = content.playIconUrl?.trim() || DEFAULT_PLAY_ICON_URL;

  const showPlayButton = isCanvas || hasAppeared;

  useMotionAttributes(rootRef, [isCanvas]);

  const handlePlay = () => {
    if (isCanvas) return;
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    gsap.to(imageRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'sine.inOut',
    });
    gsap.to(video, { opacity: 1, duration: 0.6, ease: 'sine.inOut' });
    gsap.to(playButtonRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'sine.out',
    });
  };

  const handleEnded = () => {
    const video = videoRef.current;
    gsap.to(video, { opacity: 0, duration: 0.6, ease: 'sine.inOut' });
    gsap.to(imageRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: 'sine.inOut',
      onComplete: () => {
        video?.pause();
        setIsPlaying(false);
      },
    });
    gsap.to(playButtonRef.current, {
      opacity: 1,
      duration: 0.4,
      delay: 0.25,
      ease: 'sine.out',
    });
  };

  React.useEffect(() => {
    if (!hasAppeared || isCanvas || !playButtonRef.current) return;
    gsap.fromTo(
      playButtonRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'sine.out' }
    );
  }, [hasAppeared, isCanvas]);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const media = mediaRef.current;
      if (!media) return;
      if (!hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.set(media, { scale: MEDIA_SCALE_FROM });
      gsap.to(media, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: media,
          scroller,
          start: 'top bottom',
          end: '+=900',
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: self => {
            if (self.progress >= MEDIA_APPEAR_PROGRESS) setHasAppeared(true);
          },
        },
      });
    },
    [hasRoot, isCanvas]
  );

  return (
    <section
      ref={rootRef}
      style={blockBackgroundStyle(background)}
      className={cn(
        '@container relative flex h-min w-full flex-none flex-col items-center rounded-t-xl bg-neutral-100',
        className
      )}
    >
      <div className='relative mx-auto flex h-min w-full max-w-[1720px] flex-none flex-col place-content-center items-center gap-10 overflow-hidden px-5 @2xl:py-15 @4xl:gap-15 @4xl:rounded-t-3xl @4xl:py-25'>
        <div className='relative flex h-min w-full flex-col place-content-center items-center gap-1.25 overflow-hidden py-34.25'>
          <div className='flex w-full max-w-256.25'>
            <div className='flex flex-1'>
              <h2
                data-element-key='eyebrow'
                data-motion='word-blur-up-reveal'
                data-motion-once='true'
                style={composeStyle(
                  {
                    color: '#1a1919',
                    fontFamily: HEADING_FONT_FAMILY,
                    fontWeight: 400,
                    lineHeight: 1.2,
                  },
                  styleOf('eyebrow')
                )}
                className={selectableClass(
                  activeKey === 'eyebrow',
                  'w-full text-center text-[40px] @2xl:text-[50px] @4xl:text-right'
                )}
              >
                {eyebrow}
              </h2>
            </div>
          </div>
          <div className='max-w-256.25'>
            <h2
              data-element-key='heading'
              data-motion='word-blur-up-reveal'
              data-motion-once='true'
              style={composeStyle(
                {
                  color: '#1a1919',
                  fontFamily: HEADING_FONT_FAMILY,
                  fontWeight: 400,
                  lineHeight: 1.2,
                },
                styleOf('heading')
              )}
              className={selectableClass(
                activeKey === 'heading',
                'w-full text-center text-[40px] @2xl:text-[50px] @4xl:text-left'
              )}
            >
              {heading}
            </h2>
          </div>
        </div>

        <div
          ref={mediaRef}
          className='relative h-100.25 w-full overflow-hidden rounded-3xl @4xl:h-screen'
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            data-element-key='posterUrl'
            src={posterUrl || undefined}
            alt='Ecopark Onsen pools'
            onLoad={requestRefresh}
            style={composeStyle({ objectFit: 'cover' }, styleOf('posterUrl'))}
            className={selectableClass(
              activeKey === 'posterUrl',
              'absolute inset-0 h-full w-full'
            )}
            draggable={false}
          />
          <video
            ref={videoRef}
            data-element-key='videoUrl'
            src={videoUrl || undefined}
            muted
            playsInline
            onEnded={handleEnded}
            onLoadedData={requestRefresh}
            style={composeStyle({ objectFit: 'cover' }, styleOf('videoUrl'))}
            className={selectableClass(
              activeKey === 'videoUrl',
              'absolute inset-0 h-full w-full opacity-0'
            )}
          />

          {showPlayButton && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                isPlaying && 'pointer-events-none'
              )}
            >
              <button
                ref={playButtonRef}
                type='button'
                onClick={handlePlay}
                className='h-15 w-15 cursor-pointer @4xl:h-30 @4xl:w-30'
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key='playIconUrl'
                  src={playIconUrl}
                  alt='Play button'
                  onLoad={requestRefresh}
                  style={styleOf('playIconUrl')}
                  className={selectableClass(
                    activeKey === 'playIconUrl',
                    'h-full w-full'
                  )}
                  draggable={false}
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
