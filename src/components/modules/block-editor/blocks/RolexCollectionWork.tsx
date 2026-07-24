'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Wallpaper } from 'lucide-react';
import SplitType from 'split-type';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { getMotionEffect } from '../motion/motionLibrary';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  RolexCollectionWorkContent,
  RolexCollectionWorkStage,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { FONT_BODY, FONT_CSS, FONT_HEADING } from './rolexFonts';

interface Props {
  content: RolexCollectionWorkContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

const STAGE_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
};

const CTA_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 344,
  transform: 'translateX(-50%)',
  margin: 0,
  fontFamily: FONT_BODY,
  fontWeight: 400,
  color: '#ffffff',
  textAlign: 'center',
  zIndex: 30,
};

const watchDepthForDistance = (distance: number): number => {
  if (distance === 0) return 0;
  const magnitude = 200 + 50 * Math.abs(distance);
  return distance > 0 ? -magnitude : magnitude;
};

const SCROLL_PX_PER_STAGE = 120;

const WATCH_HEIGHT_PER_WIDTH = 490 / 350;

const PREFIX_CENTER = 'translate(-50%, -50%) ';

const BG_TRANSITION = 'background-color 300ms ease';
const CONTAINER_TRANSITION = 'transform 450ms ease';
const IMAGE_TRANSITION = 'width 250ms ease, height 250ms ease';
const TITLE_TRANSITION = 'opacity 300ms ease, transform 300ms ease';

const stageBackgroundStyle = (
  stage: { backgroundColor?: string; backgroundImageUrl?: string } | undefined,
  fallback: string
): React.CSSProperties => {
  const imageUrl = stage?.backgroundImageUrl?.trim();
  if (imageUrl) {
    return {
      backgroundImage: `url("${imageUrl.replace(/"/g, '%22')}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { backgroundColor: stage?.backgroundColor?.trim() || fallback };
};

const boxStyle = (width: number): React.CSSProperties => ({
  position: 'absolute',
  width,
  height: width * WATCH_HEIGHT_PER_WIDTH,
  top: '50%',
  left: '50%',
});

const DEFAULT_STAGES: RolexCollectionWorkStage[] = [
  {
    title: 'OYSTER',
    imageUrl: '/rolex-collection/watch-oyster.webp',
  },
  {
    title: 'PERPETUAL',
    backgroundColor: '#cc1d1d',
    imageUrl: '/rolex-collection/watch-perpetual.webp',
  },
  {
    title: 'DAYTONA',
    backgroundColor: '#743dff',
    imageUrl: '/rolex-collection/watch-daytona.webp',
  },
  {
    title: 'SUBMARINER',
    backgroundColor: '#1bcc82',
    imageUrl: '/rolex-collection/watch-submariner.webp',
  },
  {
    title: 'SEA DWELER',
    backgroundColor: '#ff8e3d',
    imageUrl: '/rolex-collection/watch-seadweller.webp',
  },
  {
    title: 'DEEP SEA',
    backgroundColor: '#ff8080',
    imageUrl: '/rolex-collection/watch-deepsea.webp',
  },
  {
    title: 'GMT MASTER',
    backgroundColor: '#1d45cc',
    imageUrl: '/rolex-collection/watch-gmtmaster.webp',
  },
];

const resolveStages = (
  raw: RolexCollectionWorkStage[] | undefined
): RolexCollectionWorkStage[] => {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_STAGES;
  return raw.map((stage, i) => {
    const fallback = DEFAULT_STAGES[i] ?? DEFAULT_STAGES[0];
    return {
      title: stage.title?.trim() || fallback.title,
      backgroundColor: stage.backgroundColor?.trim() || undefined,
      backgroundImageUrl: stage.backgroundImageUrl?.trim() || undefined,
      imageUrl: stage.imageUrl?.trim() || fallback.imageUrl,
    };
  });
};

export function RolexCollectionWork({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const isCanvas = useIsCanvasEdit(rootRef);
  useMotionAttributes(rootRef);
  const activeIndexRef = React.useRef(0);
  const restoredRef = React.useRef(false);
  const { scroller } = useLandingMotion();
  const scrollerLiveRef = React.useRef(scroller);
  scrollerLiveRef.current = scroller;

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const stages = React.useMemo(
    () => resolveStages(content.stages),
    [content.stages]
  );

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage || isCanvas) return;

      const bg = stage.querySelector<HTMLElement>('[data-rcw-bg]');
      const swings = gsap.utils.toArray<HTMLElement>('[data-rcw-swing]', stage);
      const titles = gsap.utils.toArray<HTMLElement>('[data-rcw-title]', stage);
      if (!bg || !swings.length) return;

      const containers = swings.map(
        swing => swing.querySelector<HTMLElement>('[data-rcw-container]')!
      );
      const images = swings.map(
        swing => swing.querySelector<HTMLElement>('[data-rcw-image]')!
      );

      stage.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });

      const reduce = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      const splits = titles.map(title =>
        title ? new SplitType(title, { types: 'chars' }) : null
      );
      titles.forEach(title => {
        if (!title) return;
        title.style.opacity = '1';
        title.style.transform = 'translate(-50%, -50%)';
      });

      const stageCount = swings.length;
      const lastStage = stageCount - 1;
      const ROT_BAND = 1;
      const WIDTH_INACTIVE = 200;
      const WIDTH_ACTIVE = 350;

      let lastActiveIndex = -1;
      let introPlayed = false;
      let introTween: gsap.core.Tween | null = null;
      const playIntro = () => {
        if (introPlayed) return;
        introPlayed = true;
        const introChars = splits[0]?.chars;
        const effect = getMotionEffect('char-blur-up-reveal');
        if (!introChars?.length || !effect) return;
        introTween = gsap.fromTo(introChars, effect.from, {
          ...effect.to,
          duration: 1.4,
          ease: effect.defaults.ease,
          stagger: 0.08,
        });
      };

      const applyStack = (scrollPos: number, instant = false) => {
        const activeIndex = Math.max(
          0,
          Math.min(stageCount - 1, Math.round(scrollPos))
        );
        activeIndexRef.current = activeIndex;
        if (activeIndex !== 0 && introTween) {
          introTween.kill();
          introTween = null;
          const introChars = splits[0]?.chars;
          if (introChars?.length)
            gsap.set(introChars, { clearProps: 'filter' });
        }
        if (activeIndex === lastActiveIndex && !instant) return;
        lastActiveIndex = activeIndex;

        if (instant) {
          bg.style.transition = 'none';
          containers.forEach(el => {
            el.style.transition = 'none';
          });
          images.forEach(el => {
            el.style.transition = 'none';
          });
        }

        const activeImageUrl = stages[activeIndex]?.backgroundImageUrl?.trim();
        if (activeImageUrl) {
          bg.style.backgroundColor = 'transparent';
          bg.style.backgroundImage = `url("${activeImageUrl.replace(/"/g, '%22')}")`;
          bg.style.backgroundSize = 'cover';
          bg.style.backgroundPosition = 'center';
        } else {
          bg.style.backgroundImage = 'none';
          bg.style.backgroundColor =
            stages[activeIndex]?.backgroundColor?.trim() || 'transparent';
        }

        swings.forEach((swing, j) => {
          const distance = j - activeIndex;
          const absDistance = Math.abs(distance);
          const rotFactor = Math.min(1, absDistance / ROT_BAND);
          const depth = watchDepthForDistance(distance);
          const sign = distance > 0 ? -1 : 1;

          const imgWidth =
            j === 0 || j === activeIndex ? WIDTH_ACTIVE : WIDTH_INACTIVE;
          const imgHeight = imgWidth * WATCH_HEIGHT_PER_WIDTH;
          images[j].style.width = `${imgWidth}px`;
          images[j].style.height = `${imgHeight}px`;

          swing.style.zIndex = String(Math.round(1000 - absDistance * 10));

          swing.style.transform = `${PREFIX_CENTER}rotateX(90deg)`;
          containers[j].style.transform =
            `${PREFIX_CENTER}translateZ(${depth}px) rotateX(${sign * 90 * rotFactor}deg)`;
          images[j].style.transform = `${PREFIX_CENTER}rotateX(-90deg)`;
        });

        splits.forEach((split, i) => {
          if (!split?.chars) return;
          const isActive = i === activeIndex;
          const opacity = isActive ? 1 : 0;
          const yPercent = isActive ? 0 : i > activeIndex ? 130 : -130;
          split.chars.forEach(char => {
            char.style.transition = instant ? 'none' : TITLE_TRANSITION;
            char.style.opacity = String(opacity);
            char.style.transform = `translateY(${yPercent}%)`;
          });
        });

        if (instant) {
          void stage.offsetHeight;
          requestAnimationFrame(() => {
            bg.style.transition = BG_TRANSITION;
            containers.forEach(el => {
              el.style.transition = CONTAINER_TRANSITION;
            });
            images.forEach(el => {
              el.style.transition = IMAGE_TRANSITION;
            });
          });
        }
      };

      if (reduce) {
        applyStack(0, true);
        return () => splits.forEach(s => s?.revert());
      }

      const proxy = { pos: 0 };
      const tween = gsap.to(proxy, {
        pos: lastStage,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
          invalidateOnRefresh: true,
          onRefresh: self => {
            applyStack(self.progress * lastStage, true);
            playIntro();
          },
        },
        onUpdate: () => applyStack(proxy.pos),
      });

      requestRefresh();

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        splits.forEach(s => s?.revert());
      };
    },
    [isCanvas, stages.length]
  );

  React.useEffect(() => {
    if (isCanvas) return;
    const key = `rcw-active:${window.location.pathname}`;

    const saveActiveIndex = () => {
      try {
        sessionStorage.setItem(key, String(activeIndexRef.current));
      } catch {}
    };
    window.addEventListener('beforeunload', saveActiveIndex);
    window.addEventListener('pagehide', saveActiveIndex);

    let saved: number | null = null;
    try {
      const raw = sessionStorage.getItem(key);
      const n = raw !== null ? Number(raw) : NaN;
      if (Number.isInteger(n) && n > 0) saved = n;
    } catch {}

    const lastStage = stages.length - 1;
    let restoreTimer: number | null = null;
    if (saved !== null && saved <= lastStage) {
      restoreTimer = window.setTimeout(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;

        const root = rootRef.current;
        if (!root) return;
        const currentScroller = scrollerLiveRef.current;
        const rootRect = root.getBoundingClientRect();
        const viewportH = currentScroller
          ? currentScroller.clientHeight
          : window.innerHeight;
        const scrollerTop = currentScroller
          ? currentScroller.getBoundingClientRect().top
          : 0;
        const scrollerScrollTop = currentScroller
          ? currentScroller.scrollTop
          : window.scrollY;
        const start = rootRect.top - scrollerTop + scrollerScrollTop;
        const end = start + (root.scrollHeight - viewportH);
        const target = start + (saved / lastStage) * (end - start);
        (currentScroller || window).scrollTo({
          top: target,
          behavior: 'smooth',
        });
      }, 900);
    }

    return () => {
      window.removeEventListener('beforeunload', saveActiveIndex);
      window.removeEventListener('pagehide', saveActiveIndex);
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
    };
  }, [isCanvas, stages.length]);

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className='rcw @container relative'
        style={composeStyle(blockBackgroundStyle(background))}
      >
        <style>{FONT_CSS}</style>
        <div className='flex flex-col gap-6 px-[4cqi] py-[4cqi]'>
          <p
            data-element-key='ctaLabel'
            style={composeStyle(
              { fontFamily: FONT_BODY, color: 'black', margin: 0 },
              styleOf('ctaLabel')
            )}
            className={selectableClass(activeKey === 'ctaLabel', 'text-4xl')}
          >
            {content.ctaLabel}
          </p>

          <div
            data-element-key='introBackgroundUrl'
            className={selectableClass(
              activeKey === 'introBackgroundUrl',
              'relative h-170 w-full shrink-0 overflow-hidden rounded-xl'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.introBackgroundUrl}
              alt='intro backdrop'
              className='h-full w-full object-cover'
            />
          </div>

          <div className='flex items-start gap-6'>
            <div className='min-w-0 flex-1 overflow-x-auto'>
              <div className='grid grid-cols-3 gap-6'>
                {stages.map((stage, i) => {
                  const titleKey = `stages[${i}].title`;
                  const bgKey = `stages[${i}].backgroundColor`;
                  const bgImgKey = `stages[${i}].backgroundImageUrl`;
                  const imgKey = `stages[${i}].imageUrl`;
                  return (
                    <div
                      key={titleKey}
                      className='relative flex w-full shrink-0 flex-col items-center gap-4 overflow-hidden rounded-xl p-6'
                      style={stageBackgroundStyle(stage, '#111111')}
                    >
                      <div
                        data-element-key={bgImgKey}
                        className={selectableClass(
                          activeKey === bgImgKey,
                          'absolute top-6 right-6 z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-white/10'
                        )}
                      >
                        {stage.backgroundImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={stage.backgroundImageUrl}
                            alt=''
                            className='h-full w-full object-cover'
                          />
                        ) : (
                          <Wallpaper className='h-8 w-8 text-white/70' />
                        )}
                      </div>
                      <div
                        data-element-key={imgKey}
                        className={selectableClass(
                          activeKey === imgKey,
                          'relative aspect-4/5 w-full overflow-hidden rounded'
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stage.imageUrl}
                          alt={stage.title}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <p
                        data-element-key={titleKey}
                        style={composeStyle(
                          {
                            fontFamily: FONT_HEADING,
                            fontWeight: 400,
                            color: '#ffffff',
                            margin: 0,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                          },
                          styleOf(titleKey)
                        )}
                        className={selectableClass(
                          activeKey === titleKey,
                          'text-[44px]'
                        )}
                      >
                        {stage.title}
                      </p>
                      <p
                        data-element-key={bgKey}
                        style={composeStyle(
                          {
                            fontFamily: FONT_BODY,
                            color: '#ffffff',
                            margin: 0,
                          },
                          styleOf(bgKey)
                        )}
                        className={selectableClass(
                          activeKey === bgKey,
                          'w-full truncate text-center text-[11px] opacity-80'
                        )}
                      >
                        {stage.backgroundColor || '(mặc định)'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className='rcw @container relative w-full'
      style={composeStyle(
        {
          height: `calc(100dvh + ${(stages.length - 1) * SCROLL_PX_PER_STAGE}px)`,
          backgroundColor: '#050505',
        },
        blockBackgroundStyle(background)
      )}
    >
      <style>{FONT_CSS}</style>
      <div ref={stageRef} style={STAGE_STYLE}>
        <div
          data-element-key='introBackgroundUrl'
          className={selectableClass(
            activeKey === 'introBackgroundUrl',
            'absolute inset-0 z-0 overflow-hidden'
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.introBackgroundUrl}
            alt=''
            className='h-full w-full object-cover'
          />
        </div>

        <div
          data-rcw-bg
          className='absolute inset-0'
          style={{
            zIndex: 1,
            transition: BG_TRANSITION,
            ...stageBackgroundStyle(stages[0], 'transparent'),
          }}
        />

        <div
          className='absolute inset-0'
          style={{ zIndex: 10, perspective: 500 }}
        >
          {stages.map((stage, i) => {
            const imgKey = `stages[${i}].imageUrl`;
            const box = boxStyle(200);
            const boxImg = boxStyle(i === 0 ? 350 : 200);
            return (
              <div
                key={`swing-${i}`}
                data-rcw-swing
                className='flex items-center justify-center'
                style={{
                  ...box,
                  zIndex: Math.round(1000 - i * 10),
                  transformStyle: 'preserve-3d',
                  transform: `${PREFIX_CENTER}rotateX(90deg)`,
                  willChange: 'transform',
                }}
              >
                <div
                  data-rcw-container
                  style={{
                    ...box,
                    transformStyle: 'preserve-3d',
                    transform: `${PREFIX_CENTER}${
                      i === 0
                        ? 'translateZ(0px) rotateX(0deg)'
                        : `translateZ(${watchDepthForDistance(i)}px) rotateX(-90deg)`
                    }`,
                    transition: CONTAINER_TRANSITION,
                    willChange: 'transform',
                  }}
                >
                  <div
                    data-rcw-image
                    data-element-key={imgKey}
                    className={selectableClass(
                      activeKey === imgKey,
                      'overflow-hidden'
                    )}
                    style={{
                      ...boxImg,
                      transform: `${PREFIX_CENTER}rotateX(-90deg)`,
                      transition: IMAGE_TRANSITION,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        borderRadius: 'inherit',
                        inset: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stage.imageUrl}
                        alt={stage.title}
                        className='h-full w-full object-cover'
                        style={{ borderRadius: 'inherit' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {stages.map((stage, i) => {
          const titleKey = `stages[${i}].title`;
          return (
            <p
              key={`title-${i}`}
              data-rcw-title
              data-element-key={titleKey}
              style={composeStyle(
                {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translateY(${i === 0 ? 0 : 130}%)`,
                  opacity: i === 0 ? 1 : 0,
                  margin: 0,
                  fontFamily: FONT_HEADING,
                  fontWeight: 400,
                  fontSize: '76px',
                  color: '#ffffff',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  zIndex: 20,
                },
                styleOf(titleKey)
              )}
              className={selectableClass(activeKey === titleKey)}
            >
              {stage.title}
            </p>
          );
        })}

        <p
          data-element-key='ctaLabel'
          data-motion='word-blur-up-reveal'
          data-motion-trigger='load'
          data-motion-delay='0.4'
          data-motion-duration='0.7'
          style={composeStyle(CTA_STYLE, styleOf('ctaLabel'))}
          className={selectableClass(
            activeKey === 'ctaLabel',
            'text-[12px] @2xl:text-[14px]'
          )}
        >
          {content.ctaLabel}
        </p>
      </div>
    </section>
  );
}
