'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerRealEstate02OverviewContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface Props {
  content: FramerRealEstate02OverviewContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const FONT_STACK =
  '"Inter", "Inter Placeholder", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const COLORS = {
  bg: '#565440',
  accent: '#c49f8a',
  cream: '#e9e4dc',
} as const;

const IMAGE_PARALLAX_SLOPE = 0.05;

const TITLE_OVER_OFFSET = -59.4;
const TITLE_VIEW_OFFSET = 80;
const TITLE_REVEAL_DURATION = 1.4;
const TITLE_REVEAL_EASE = 'power3.inOut';
const TITLE_TRIGGER_START = 'top 34%';

const SUBHEADING1_OFFSET = 101;
const SUBHEADING2_OFFSET = -60.6;
const SUBHEADING3_OFFSET = 89.4;
const SUBHEADING_TRIGGER_START = 'top 14%';

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: COLORS.bg,
};

const CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '375px',
  aspectRatio: '375 / 948',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
  fontFamily: FONT_STACK,
};

const TOWER_WRAP_STYLE: React.CSSProperties = {
  height: '261px',
  left: '197px',
  overflow: 'hidden',
  position: 'absolute',
  top: 0,
  width: '178px',
};

const TOWER_INNER_WRAP_STYLE: React.CSSProperties = {
  inset: '-30px -25px -42px -24px',
  overflow: 'hidden',
  position: 'absolute',
  willChange: 'transform',
  opacity: 1,
};

const TOWER_OVERLAY_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const PERSON_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  width: '178px',
  height: '142px',
  overflow: 'hidden',
};

const PERSON_INNER_WRAP_STYLE: React.CSSProperties = {
  willChange: 'transform',
  opacity: 1,
  height: '222px',
  left: '-100px',
  overflow: 'hidden',
  position: 'absolute',
  right: 0,
  top: '-100px',
};

const TOWER_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

const PERSON_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

const TITLE_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  margin: 0,
  fontWeight: 300,
  fontSize: '64.6px',
  lineHeight: 0.9015,
  letterSpacing: '-1.3px',
  textTransform: 'uppercase',
  color: COLORS.accent,
  whiteSpace: 'nowrap',
};

const TITLE_CONTAINER_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '177px',
  width: '185px',
  height: '126px',
};

const TITLE1_STYLE: React.CSSProperties = {
  ...TITLE_BASE_STYLE,
  left: 'unset',
  top: '1px',
  right: 0,
};

const TITLE2_STYLE: React.CSSProperties = {
  ...TITLE_BASE_STYLE,
  right: 0,
  top: '68px',
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: '25.0667%',
  top: '37.2363%',
  width: '63.2%',
  margin: 0,
  fontWeight: 400,
  fontSize: '11px',
  lineHeight: 1.4545,
  letterSpacing: '0.44px',
  textTransform: 'uppercase',
  color: COLORS.cream,
};

const SUBHEADING_BASE_STYLE: React.CSSProperties = {
  position: 'absolute',
  margin: 0,
  fontWeight: 300,
  fontSize: '28.4px',
  lineHeight: 1.1095,
  letterSpacing: '0.55px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const SUBHEADING1_STYLE: React.CSSProperties = {
  ...SUBHEADING_BASE_STYLE,
  left: '15.04%',
  top: '52.0042%',
  color: COLORS.accent,
};

const SUBHEADING2_STYLE: React.CSSProperties = {
  ...SUBHEADING_BASE_STYLE,
  left: '0%',
  top: '55.274%',
  color: COLORS.accent,
};

const SUBHEADING3_STYLE: React.CSSProperties = {
  ...SUBHEADING_BASE_STYLE,
  left: '37.712%',
  top: '58.439%',
  color: COLORS.cream,
};

const PANORAMA_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  bottom: 0,
  width: '100%',
  height: '29.6414%',
  overflow: 'hidden',
};

const PANORAMA_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  height: '100%',
  maxWidth: 'none',
  objectFit: 'cover',
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Overview({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);

  const [isCanvas, setIsCanvas] = React.useState(true);

  React.useLayoutEffect(() => {
    setIsCanvas(
      !!rootRef.current?.closest('[data-testid="active-block-preview"]')
    );
  }, []);

  const panoramaWrapRef = React.useRef<HTMLDivElement>(null);
  const panoramaTrackRef = React.useRef<HTMLDivElement>(null);
  const panoramaImgRef = React.useRef<HTMLImageElement>(null);
  const panoramaBoundsRef = React.useRef(0);
  const panoramaXRef = React.useRef(0);
  const panoramaXToRef = React.useRef<gsap.QuickToFunc | null>(null);
  const panoramaDragRef = React.useRef<{
    startClientX: number;
    baseX: number;
    pointerId: number;
  } | null>(null);
  const [panoramaImgWidth, setPanoramaImgWidth] = React.useState<number | null>(
    null
  );
  const panoramaWidthStyle: React.CSSProperties = {
    width: panoramaImgWidth ?? '100%',
  };

  React.useEffect(() => {
    if (isCanvas) return;
    const track = panoramaTrackRef.current;
    if (!track) return;
    panoramaXToRef.current = gsap.quickTo(track, 'x', {
      duration: 0.45,
      ease: 'power3',
    });
    return () => {
      panoramaXToRef.current = null;
    };
  }, [isCanvas]);

  React.useEffect(() => {
    if (isCanvas) return;
    const wrap = panoramaWrapRef.current;
    const img = panoramaImgRef.current;
    if (!wrap || !img) return;

    const measure = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const wrapRect = wrap.getBoundingClientRect();
      const scaledWidth = Math.max(
        wrapRect.width,
        wrapRect.height * (img.naturalWidth / img.naturalHeight)
      );
      setPanoramaImgWidth(scaledWidth);
      const max = Math.max(0, scaledWidth - wrapRect.width);
      panoramaBoundsRef.current = max;
      const clamped = Math.min(0, Math.max(-max, panoramaXRef.current));
      panoramaXRef.current = clamped;
      panoramaXToRef.current?.(clamped);
    };

    if (img.complete) measure();
    else img.addEventListener('load', measure, { once: true });

    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      img.removeEventListener('load', measure);
    };
  }, [isCanvas, content.panoramaImageUrl]);

  const handlePanoramaPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCanvas || panoramaBoundsRef.current <= 0) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    panoramaDragRef.current = {
      startClientX: e.clientX,
      baseX: panoramaXRef.current,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePanoramaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = panoramaDragRef.current;
    if (!drag) return;
    const max = panoramaBoundsRef.current;
    const next = Math.min(
      0,
      Math.max(-max, drag.baseX + (e.clientX - drag.startClientX))
    );
    panoramaXRef.current = next;
    panoramaXToRef.current?.(next);
  };

  const handlePanoramaPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = panoramaDragRef.current;
    if (!drag) return;
    e.currentTarget.releasePointerCapture?.(drag.pointerId);
    panoramaDragRef.current = null;
  };

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      if (isCanvas) return;
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = prefersReducedMotion();
      const sub1 = root.querySelector<HTMLElement>('.freo-subheading-1');
      const sub2 = root.querySelector<HTMLElement>('.freo-subheading-2');
      const sub3 = root.querySelector<HTMLElement>('.freo-subheading-3');
      const titleOver = root.querySelector<HTMLElement>('.freo-title-over');
      const titleView = root.querySelector<HTMLElement>('.freo-title-view');
      const tower = root.querySelector<HTMLElement>('.freo-tower-parallax');
      const person = root.querySelector<HTMLElement>('.freo-person-parallax');

      if (reduceMotion) {
        if (sub1) gsap.set(sub1, { x: 0 });
        if (sub2) gsap.set(sub2, { x: 0 });
        if (sub3) gsap.set(sub3, { x: 0 });
        if (titleOver) gsap.set(titleOver, { x: 0 });
        if (titleView) gsap.set(titleView, { x: 0 });
        if (tower) gsap.set(tower, { y: 0 });
        if (person) gsap.set(person, { y: 0 });
        return;
      }

      if (titleOver && titleView) {
        const titleTl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: TITLE_TRIGGER_START,
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        titleTl.from(
          titleOver,
          {
            x: TITLE_OVER_OFFSET,
            duration: TITLE_REVEAL_DURATION,
            ease: TITLE_REVEAL_EASE,
          },
          0
        );
        titleTl.from(
          titleView,
          {
            x: TITLE_VIEW_OFFSET,
            duration: TITLE_REVEAL_DURATION,
            ease: TITLE_REVEAL_EASE,
          },
          0
        );
      }

      if (sub1 && sub2 && sub3) {
        const subheadingTl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            scroller,
            start: SUBHEADING_TRIGGER_START,
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        });
        subheadingTl.from(
          sub1,
          {
            x: SUBHEADING1_OFFSET,
            duration: TITLE_REVEAL_DURATION,
            ease: TITLE_REVEAL_EASE,
          },
          0
        );
        subheadingTl.from(
          sub2,
          {
            x: SUBHEADING2_OFFSET,
            duration: TITLE_REVEAL_DURATION,
            ease: TITLE_REVEAL_EASE,
          },
          0
        );
        subheadingTl.from(
          sub3,
          {
            x: SUBHEADING3_OFFSET,
            duration: TITLE_REVEAL_DURATION,
            ease: TITLE_REVEAL_EASE,
          },
          0
        );
      }

      if (tower) {
        ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 0,
          end: 'max',
          onUpdate: self => {
            gsap.set(tower, {
              y: -IMAGE_PARALLAX_SLOPE * self.scroll(),
              force3D: false,
            });
          },
        });
      }
      if (person) {
        ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 0,
          end: 'max',
          onUpdate: self => {
            gsap.set(person, {
              y: IMAGE_PARALLAX_SLOPE * self.scroll(),
              force3D: false,
            });
          },
        });
      }
    },
    [isCanvas]
  );

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-overview'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('freo-root', className)}
    >
      <div style={CARD_STYLE} className='freo-card @container'>
        <div style={TOWER_WRAP_STYLE}>
          <div style={TOWER_INNER_WRAP_STYLE} className='freo-tower-parallax'>
            <div style={TOWER_OVERLAY_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.towerImageUrl}
                alt=''
                data-element-key='towerImageUrl'
                style={composeStyle(
                  TOWER_IMAGE_STYLE,
                  styleOf('towerImageUrl')
                )}
                className={selectableClass(
                  activeKey === 'towerImageUrl',
                  'freo-tower-img'
                )}
              />
            </div>
          </div>
        </div>

        <div style={PERSON_WRAP_STYLE}>
          <div style={PERSON_INNER_WRAP_STYLE} className='freo-person-parallax'>
            <div style={TOWER_OVERLAY_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.personImageUrl}
                alt=''
                data-element-key='personImageUrl'
                style={composeStyle(
                  PERSON_IMAGE_STYLE,
                  styleOf('personImageUrl')
                )}
                className={selectableClass(
                  activeKey === 'personImageUrl',
                  'freo-person-img'
                )}
              />
            </div>
          </div>
        </div>

        <div style={TITLE_CONTAINER_STYLE}>
          <p
            data-element-key='title1'
            style={composeStyle(TITLE1_STYLE, styleOf('title1'))}
            className={selectableClass(
              activeKey === 'title1',
              'freo-title-over'
            )}
          >
            {content.title1}
          </p>

          <p
            data-element-key='title2'
            style={composeStyle(TITLE2_STYLE, styleOf('title2'))}
            className={selectableClass(
              activeKey === 'title2',
              'freo-title-view'
            )}
          >
            {content.title2}
          </p>
        </div>

        <p
          data-element-key='description'
          style={composeStyle(DESCRIPTION_STYLE, styleOf('description'))}
          className={selectableClass(
            activeKey === 'description',
            'freo-description'
          )}
        >
          {content.description}
        </p>

        <p
          data-element-key='subheadingLine1'
          style={composeStyle(SUBHEADING1_STYLE, styleOf('subheadingLine1'))}
          className={selectableClass(
            activeKey === 'subheadingLine1',
            'freo-subheading-1'
          )}
        >
          {content.subheadingLine1}
        </p>

        <p
          data-element-key='subheadingLine2'
          style={composeStyle(SUBHEADING2_STYLE, styleOf('subheadingLine2'))}
          className={selectableClass(
            activeKey === 'subheadingLine2',
            'freo-subheading-2'
          )}
        >
          {content.subheadingLine2}
        </p>

        <p
          data-element-key='subheadingLine3'
          style={composeStyle(SUBHEADING3_STYLE, styleOf('subheadingLine3'))}
          className={selectableClass(
            activeKey === 'subheadingLine3',
            'freo-subheading-3'
          )}
        >
          {content.subheadingLine3}
        </p>

        <div
          ref={panoramaWrapRef}
          style={PANORAMA_WRAP_STYLE}
          className={cn(
            !isCanvas && 'cursor-grab touch-pan-y active:cursor-grabbing'
          )}
          onPointerDown={handlePanoramaPointerDown}
          onPointerMove={handlePanoramaPointerMove}
          onPointerUp={handlePanoramaPointerUp}
          onPointerCancel={handlePanoramaPointerUp}
        >
          <div
            ref={panoramaTrackRef}
            style={{
              display: 'inline-block',
              height: '100%',
              willChange: 'transform',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={panoramaImgRef}
              src={content.panoramaImageUrl}
              alt=''
              draggable={false}
              data-element-key='panoramaImageUrl'
              style={composeStyle(
                PANORAMA_IMAGE_STYLE,
                panoramaWidthStyle,
                styleOf('panoramaImageUrl')
              )}
              className={selectableClass(activeKey === 'panoramaImageUrl')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
