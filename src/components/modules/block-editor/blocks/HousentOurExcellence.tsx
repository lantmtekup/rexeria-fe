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

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  HousentOurExcellenceContent,
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
 * Cấu trúc:
 *  - Section lớn, padding-top scale theo container (60 → 100 → 140 px).
 *  - Center stack (badge pill + heading + body) căn giữa tuyệt đối.
 *  - 8 satellite items đặt theo vòng tròn quanh center (desktop ≥ 896 px)
 *    bằng cách tính (cos/sin)*radius trên từng item; mobile collapse về
 *    vertical icon-list bên dưới center stack.
 *  - Desktop animation (scrub qua outer + sticky inner):
 *      • Outer = track (cao ~220dvh) để có "quãng" scroll để scrub.
 *      • Inner sticky giữ viewport; satellites + center stack scrub reveal
 *        theo tiến trình cuộn: item 0 sớm nhất → item 7 cuối.
 *      • KHÔNG GSAP `pin` — dùng CSS sticky (iOS-safe).
 *  - Mobile/tablet animation: GSAP ScrollTrigger dạng `toggleActions`
 *    (1-shot play on enter, reverse on leave) cho badge → heading → body → satellites.
 *  - Reduced-motion: layout gập về 1 viewport, hiện đầy đủ không animation.
 *  - Tokens tuyền inline (font, color, padding) qua composeStyle(styleOf(key)).
 */

// ── Icon registry ───────────────────────────────────────────────────
// icon trong content là string (lucide-react name); map sang component.
// Thêm icon mới: import + thêm vào đây + (optional) thêm default vào factory.
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
  containerType: 'inline-size',
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
  fontWeight: 50,
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
  if (index === 2) {
    return `translate(-10%, -50%) translate(${dx}px, ${dy}px)`;
  }
  if (index === 6) {
    return `translate(-90%, -50%) translate(${dx}px, ${dy}px)`;
  }
  return `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
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

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const items = React.useMemo(
    () => (Array.isArray(content.items) ? content.items : []),
    [content.items]
  );

  // Desktop ≥ 896 px: scrub qua outer (sticky inner giữ viewport). KHÔNG
  // `pin` — dùng CSS sticky, an toàn iOS.
  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      const inner = desktopInnerRef.current;
      const center = desktopCenterRef.current;
      if (!root || !inner || !center) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      // Chỉ chạy trên desktop (≥ 896 px).
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
    [items.length]
  );

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
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
    [items.length, 'mobile']
  );

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

        <div className='mt-12 grid w-full grid-cols-1 flex-col gap-6 @3xl:grid-cols-2'>
          {items.map((item, i) => {
            const Icon = ICONS[item.icon] ?? ShieldCheck;
            return (
              <div
                key={`stk-${i}`}
                className='hoe-satellite flex items-center gap-4'
                data-element-key={`item-${i}`}
              >
                <span
                  style={ITEM_ICON_BTN_STYLE}
                  className='flex items-center justify-center rounded-full border @3xl:hidden!'
                >
                  <Icon style={{ width: 22, height: 22 }} strokeWidth={1.5} />
                </span>
                <p className='p-4' style={ITEM_LABEL_STYLE}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop */}
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
                  data-element-key={`item-${i}`}
                >
                  <span
                    style={{
                      ...ITEM_ICON_BTN_STYLE,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className='flex items-center justify-center rounded-full border transition-transform hover:scale-105'
                  >
                    <Icon style={{ width: 24, height: 24 }} strokeWidth={1.5} />
                  </span>
                  <p
                    style={{
                      ...ITEM_LABEL_STYLE,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      transform: labelOffset,
                    }}
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
