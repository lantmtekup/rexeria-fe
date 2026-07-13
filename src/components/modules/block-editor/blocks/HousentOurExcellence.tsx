'use client';

import * as React from 'react';
import gsap from 'gsap';
import {
  ShieldCheck,
  BarChart3,
  Sun,
  MapPin,
  KeyRound,
  Briefcase,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

import { useBlockMotion, useLandingMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentOurExcellenceContent,
  HousentOurExcellenceItem,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

interface HousentOurExcellenceProps {
  content: HousentOurExcellenceContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * Housent Our Excellence — radial layout port từ housent.webflow.io.
 *
 * Content phẳng + groupId (ScrollMattis / Readymag Cases):
 *   item1Label / item1Icon … item8Label / item8Icon.
 * Editor canvas → lưới editable (không sticky/scrub ẩn satellites).
 */

const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  BarChart3,
  Sun,
  MapPin,
  KeyRound,
  Briefcase,
  Leaf,
  TrendingUp,
};

const DEFAULT_ITEMS: HousentOurExcellenceItem[] = [
  { label: 'Verified Legality', icon: 'ShieldCheck' },
  { label: 'Market Stability', icon: 'BarChart3' },
  { label: 'Future Appreciation', icon: 'Sun' },
  { label: 'Strategic Location', icon: 'MapPin' },
  { label: 'Seamless Closing', icon: 'KeyRound' },
  { label: 'Portfolio Diversification', icon: 'Briefcase' },
  { label: 'Sustainable Growth', icon: 'Leaf' },
  { label: 'High Yield Potential', icon: 'TrendingUp' },
];

const ITEM_KEYS = [
  { label: 'item1Label', icon: 'item1Icon' },
  { label: 'item2Label', icon: 'item2Icon' },
  { label: 'item3Label', icon: 'item3Icon' },
  { label: 'item4Label', icon: 'item4Icon' },
  { label: 'item5Label', icon: 'item5Icon' },
  { label: 'item6Label', icon: 'item6Icon' },
  { label: 'item7Label', icon: 'item7Icon' },
  { label: 'item8Label', icon: 'item8Icon' },
] as const;

type ItemFieldKey =
  (typeof ITEM_KEYS)[number][keyof (typeof ITEM_KEYS)[number]];

const pick = (content: HousentOurExcellenceContent, key: ItemFieldKey) =>
  content[key]?.trim() || '';

const resolveItems = (
  content: HousentOurExcellenceContent
): HousentOurExcellenceItem[] => {
  const legacy = Array.isArray(content.items) ? content.items : [];
  const resolved = ITEM_KEYS.map((keys, i) => {
    const prev = legacy[i] ?? DEFAULT_ITEMS[i];
    return {
      label: pick(content, keys.label) || prev?.label || '',
      icon: pick(content, keys.icon) || prev?.icon || 'ShieldCheck',
    };
  }).filter(it => it.label || it.icon);
  return resolved.length > 0 ? resolved : DEFAULT_ITEMS;
};

const SECTION_BASE_STYLE: React.CSSProperties = {
  fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif",
};

const OUTER_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '220dvh',
  backgroundColor: '#ffffff',
};

const STICKY_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
};

const BADGE_WRAPPER_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '4px 8px',
  borderRadius: 4,
  backgroundColor: '#f1e6df',
};

const BADGE_DOT_STYLE: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '20%',
  backgroundColor: '#ff810a',
  flexShrink: 0,
};

const BADGE_TEXT_STYLE: React.CSSProperties = {
  fontFamily: "'Lilex', 'Google Sans Flex', sans-serif",
  fontSize: 'clamp(12px, 1.2cqi, 14px)',
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#3b322d',
  margin: 0,
};

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(32px, 6.5cqi, 64px)',
  fontWeight: 500,
  lineHeight: 1.2,
  letterSpacing: '-0.024em',
  color: '#3b322d',
  margin: '12px 0 0',
  textAlign: 'center',
};

const BODY_STYLE: React.CSSProperties = {
  fontFamily: "'Google Sans Flex', 'Inter', system-ui, sans-serif",
  fontSize: 'clamp(14px, 1.5cqi, 18px)',
  fontWeight: 400,
  lineHeight: 1.6,
  color: '#6c645f',
  margin: '36px auto 0',
};

const ITEM_ICON_BTN_STYLE: React.CSSProperties = {
  width: 'clamp(48px, 6cqi, 64px)',
  height: 'clamp(48px, 6cqi, 64px)',
  borderRadius: '50%',
  border: '1px solid #e7dfdb',
  backgroundColor: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#3b322d',
  flexShrink: 0,
  zIndex: 10,
};

const ITEM_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "'Lilex', 'Google Sans Flex', sans-serif",
  fontSize: 'clamp(16px, 1.5cqi, 20px)',
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '0.02em',
  color: '#3b322d',
  textTransform: 'uppercase',
  margin: 0,
  whiteSpace: 'nowrap',
};

const RADIUS_CLAMP = 'clamp(220px, 36cqi, 360px)';

function satellitePosition(index: number, total: number): React.CSSProperties {
  const angleDeg = -90 + (360 / total) * index;
  const rad = (angleDeg * Math.PI) / 180;
  const x = `calc(50% + ${RADIUS_CLAMP} * ${Math.cos(rad).toFixed(4)})`;
  const y = `calc(50% + ${RADIUS_CLAMP} * ${Math.sin(rad).toFixed(4)})`;
  return {
    position: 'absolute',
    left: x,
    top: y,
    willChange: 'opacity, transform',
    zIndex: 3,
    isolation: 'isolate',
  };
}

function labelRadialOffset(
  index: number,
  total: number,
  distance = 64
): string {
  const angleDeg = -90 + (360 / total) * index;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = (Math.cos(rad) * distance).toFixed(2);
  const dy = (Math.sin(rad) * distance).toFixed(2);
  const eps = 0.05;
  const anchorX =
    Math.cos(rad) > eps ? '-10%' : Math.cos(rad) < -eps ? '-90%' : '-50%';
  return `translate(${anchorX}, -50%) translate(${dx}px, ${dy}px)`;
}

export function HousentOurExcellence({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: HousentOurExcellenceProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const desktopInnerRef = React.useRef<HTMLDivElement>(null);
  const desktopCenterRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();

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

  const items = React.useMemo(() => resolveItems(content), [content]);

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const inner = desktopInnerRef.current;
      const center = desktopCenterRef.current;
      if (!root || !inner || !center || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (!window.matchMedia('(min-width: 896px)').matches) return;

      const satellites = gsap.utils.toArray<HTMLElement>(
        '.hoe-satellite-desktop',
        inner
      );

      const badge = center.querySelector<HTMLElement>('.hoe-badge');
      const heading = center.querySelector<HTMLElement>('.hoe-heading');
      const body = center.querySelector<HTMLElement>('.hoe-body');

      if (badge) gsap.set(badge, { opacity: 1, y: 0 });
      if (heading) gsap.set(heading, { opacity: 1, y: 0 });
      if (body) gsap.set(body, { opacity: 1, y: 0 });
      if (satellites.length > 0)
        gsap.set(satellites, { opacity: 0, scale: 0.8 });

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

      if (satellites.length > 0) {
        const step = 1 / satellites.length;
        satellites.forEach((el, i) => {
          tl.to(
            el,
            {
              opacity: 1,
              scale: 1,
              duration: step,
              ease: 'power1.out',
            },
            i * step
          );
        });
      }
    },
    [items.length, isCanvas]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(min-width: 896px)').matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      });

      const badge = root.querySelector<HTMLElement>('.hoe-badge');
      const heading = root.querySelector<HTMLElement>('.hoe-heading');
      const body = root.querySelector<HTMLElement>('.hoe-body');
      const satellites = gsap.utils.toArray<HTMLElement>(
        '.hoe-satellite',
        root
      );

      if (badge) {
        gsap.set(badge, { opacity: 0, y: 16 });
        tl.to(
          badge,
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          0
        );
      }
      if (heading) {
        gsap.set(heading, { opacity: 0, y: 24 });
        tl.to(
          heading,
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
          0.1
        );
      }
      if (body) {
        gsap.set(body, { opacity: 0, y: 16 });
        tl.to(
          body,
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          0.25
        );
      }
      if (satellites.length > 0) {
        gsap.set(satellites, { opacity: 0, scale: 0.8 });
        tl.to(
          satellites,
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.08,
          },
          0.4
        );
      }
    },
    [items.length, isCanvas]
  );

  const renderItemRow = (item: HousentOurExcellenceItem, i: number) => {
    const keys = ITEM_KEYS[i];
    if (!keys) return null;
    const Icon = ICONS[item.icon] ?? ShieldCheck;
    return (
      <div key={`stk-${i}`} className='hoe-satellite flex items-center gap-4'>
        <span
          data-element-key={keys.icon}
          className={selectableClass(
            activeKey === keys.icon,
            'flex items-center justify-center rounded-full border'
          )}
          style={composeStyle(ITEM_ICON_BTN_STYLE, styleOf(keys.icon))}
        >
          <Icon
            style={{ width: 22, height: 22, pointerEvents: 'none' }}
            strokeWidth={1.5}
          />
        </span>
        <p
          data-element-key={keys.label}
          className={selectableClass(activeKey === keys.label, 'p-4')}
          style={composeStyle(ITEM_LABEL_STYLE, styleOf(keys.label))}
        >
          {item.label}
        </p>
      </div>
    );
  };

  // ── Editor canvas: hiện đủ badge/heading/body + 8 items ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        className={cn('@container relative w-full bg-white py-10', className)}
        style={composeStyle(
          SECTION_BASE_STYLE,
          { minHeight: 420 },
          blockBackgroundStyle(background)
        )}
      >
        <div
          className='mx-auto flex w-full max-w-lg flex-col items-center px-6'
          style={{ width: 'clamp(280px, 100%, 580px)' }}
        >
          <div
            data-element-key='badge'
            className={selectableClass(activeKey === 'badge', 'hoe-badge')}
            style={composeStyle(BADGE_WRAPPER_STYLE, styleOf('badge'))}
          >
            <span style={BADGE_DOT_STYLE} aria-hidden='true' />
            <p style={BADGE_TEXT_STYLE}>{content.badge}</p>
          </div>

          <h2
            data-element-key='heading'
            className={selectableClass(activeKey === 'heading', 'hoe-heading')}
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
          >
            {content.heading}
          </h2>

          <p
            data-element-key='body'
            className={selectableClass(
              activeKey === 'body',
              'hoe-body text-center'
            )}
            style={composeStyle(BODY_STYLE, styleOf('body'))}
          >
            {content.body}
          </p>
        </div>

        <div className='mx-auto mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 px-6 @2xl:grid-cols-2'>
          {items.map((item, i) => renderItemRow(item, i))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className={cn('relative w-full bg-white py-24 @4xl:py-0', className)}
      style={composeStyle(SECTION_BASE_STYLE, blockBackgroundStyle(background))}
    >
      {/* Mobile / tablet */}
      <div
        className='mx-auto block w-full max-w-md px-6 @3xl:max-w-xl @4xl:hidden'
        style={SECTION_BASE_STYLE}
      >
        <div
          className='relative z-10 flex w-full flex-col items-start @3xl:items-center'
          style={{ width: 'clamp(280px, 100%, 580px)' }}
        >
          <div
            data-element-key='badge'
            className={selectableClass(activeKey === 'badge', 'hoe-badge')}
            style={composeStyle(BADGE_WRAPPER_STYLE, styleOf('badge'))}
          >
            <span style={BADGE_DOT_STYLE} aria-hidden='true' />
            <p style={BADGE_TEXT_STYLE}>{content.badge}</p>
          </div>

          <h2
            data-element-key='heading'
            className={selectableClass(activeKey === 'heading', 'hoe-heading')}
            style={composeStyle(HEADING_STYLE, styleOf('heading'))}
          >
            {content.heading}
          </h2>

          <p
            data-element-key='body'
            className={selectableClass(
              activeKey === 'body',
              'hoe-body text-left @3xl:text-center'
            )}
            style={composeStyle(BODY_STYLE, styleOf('body'))}
          >
            {content.body}
          </p>
        </div>

        <div className='mt-12 grid w-full grid-cols-1 gap-6 @3xl:grid-cols-2'>
          {items.map((item, i) => renderItemRow(item, i))}
        </div>
      </div>

      {/* Desktop radial */}
      <section
        aria-label='Housent Our Excellence (radial)'
        className='hoe-desktop hidden @4xl:block'
        style={OUTER_STYLE}
      >
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .hoe-desktop { height: 100dvh !important; }
            .hoe-desktop .hoe-badge,
            .hoe-desktop .hoe-heading,
            .hoe-desktop .hoe-body,
            .hoe-desktop .hoe-satellite-desktop {
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>

        <div ref={desktopInnerRef} className='@container' style={STICKY_STYLE}>
          <div
            aria-hidden='true'
            className='hoe-ring pointer-events-none'
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `calc(${RADIUS_CLAMP} * 2)`,
              height: `calc(${RADIUS_CLAMP} * 2)`,
              transform: 'translate(-50%, -50%)',
              border: '1px solid #e7dfdb',
              borderRadius: '50%',
              zIndex: 1,
            }}
          />

          <div
            ref={desktopCenterRef}
            className='absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center'
            style={{ width: 'clamp(280px, 50cqi, 580px)' }}
          >
            <div
              data-element-key='badge'
              className={selectableClass(activeKey === 'badge', 'hoe-badge')}
              style={composeStyle(BADGE_WRAPPER_STYLE, styleOf('badge'))}
            >
              <span style={BADGE_DOT_STYLE} aria-hidden='true' />
              <p style={BADGE_TEXT_STYLE}>{content.badge}</p>
            </div>

            <h2
              data-element-key='heading'
              className={selectableClass(
                activeKey === 'heading',
                'hoe-heading'
              )}
              style={composeStyle(HEADING_STYLE, styleOf('heading'))}
            >
              {content.heading}
            </h2>

            <p
              data-element-key='body'
              className={selectableClass(
                activeKey === 'body',
                'hoe-body text-center'
              )}
              style={composeStyle(BODY_STYLE, styleOf('body'))}
            >
              {content.body}
            </p>
          </div>

          <div className='absolute inset-0'>
            {items.map((item, i) => {
              const keys = ITEM_KEYS[i];
              if (!keys) return null;
              const Icon = ICONS[item.icon] ?? ShieldCheck;
              const wrapperStyle = satellitePosition(
                i,
                Math.max(items.length, 1)
              );
              const labelOffset = labelRadialOffset(
                i,
                Math.max(items.length, 1)
              );
              return (
                <div
                  key={`rad-${i}`}
                  className='hoe-satellite-desktop'
                  style={wrapperStyle}
                >
                  <span
                    data-element-key={keys.icon}
                    style={composeStyle(
                      ITEM_ICON_BTN_STYLE,
                      {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transform: 'translate(-50%, -50%)',
                      },
                      styleOf(keys.icon)
                    )}
                    className={selectableClass(
                      activeKey === keys.icon,
                      'flex items-center justify-center rounded-full border transition-transform hover:scale-105'
                    )}
                  >
                    <Icon
                      style={{ width: 24, height: 24, pointerEvents: 'none' }}
                      strokeWidth={1.5}
                    />
                  </span>
                  <p
                    data-element-key={keys.label}
                    style={composeStyle(
                      ITEM_LABEL_STYLE,
                      {
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transform: labelOffset,
                      },
                      styleOf(keys.label)
                    )}
                    className={selectableClass(activeKey === keys.label)}
                  >
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}

export default HousentOurExcellence;
