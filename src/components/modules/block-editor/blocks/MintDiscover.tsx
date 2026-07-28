'use client';

/**
 * Mint · Discover — port từ apps/mintcoin ProductDetailSection.
 * Sticky scroll-sequence + inline info card + hotspot drawer (portal).
 *
 * Canvas styles: mọi editable node dùng composeStyle(baseInline, styleOf(key))
 * — tokens tuyền inline, Tailwind chỉ structure (@2xl reflow).
 */
import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  MintDiscoverContent,
  MintDiscoverTab,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useDrawerScrollLock } from './PnjHeroHotspots';
import { useContainerMobile } from './useContainerMobile';

const HOTSPOT_ICON = '/mint/mint-icon.png';

const RESPONSIVE = {
  stageH: 'clamp(280px, 70cqi, 100svh)',
  pad: 'clamp(24px, 4cqi, 64px)',
  cardTitle: 'clamp(18px, 2.4cqi, 24px)',
  cardDesc: 'clamp(13px, 1.5cqi, 14px)',
  canvasTitle: 'clamp(16px, 2cqi, 20px)',
  canvasDesc: 'clamp(12px, 1.5cqi, 14px)',
  cardMeta: 'clamp(9px, 1cqi, 10px)',
  cardHint: 'clamp(10px, 1.1cqi, 11px)',
  drawerTitle: 'clamp(24px, 3.2cqi, 30px)',
  drawerDesc: 'clamp(14px, 1.6cqi, 16px)',
  altFont: 'clamp(10px, 1.2cqi, 11px)',
} as const;

const THEME = {
  light: {
    stageBg: '#f5f5f5',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    cardBorder: 'rgba(229, 229, 229, 1)',
    canvasCardBg: '#ffffff',
    titleColor: '#171717',
    descColor: '#525252',
    metaColor: '#737373',
    hintColor: '#a3a3a3',
    altColor: '#737373',
    drawerText: '#404040',
    labelChipBg: 'rgba(255, 255, 255, 0.95)',
    labelChipColor: '#000000',
  },
  dark: {
    stageBg: '#171717',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    canvasCardBg: 'rgba(255, 255, 255, 0.06)',
    titleColor: '#ffffff',
    descColor: 'rgba(255, 255, 255, 0.7)',
    metaColor: 'rgba(255, 255, 255, 0.5)',
    hintColor: 'rgba(255, 255, 255, 0.4)',
    altColor: 'rgba(255, 255, 255, 0.5)',
    drawerText: '#404040',
    labelChipBg: 'rgba(255, 255, 255, 0.95)',
    labelChipColor: '#000000',
  },
} as const;

type MintDiscoverTheme = (typeof THEME)[keyof typeof THEME];

const pad2 = (n: number) => String(n + 1).padStart(2, '0');

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface Props {
  content: MintDiscoverContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function MintDiscover({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const { variant, mainImage, mainAlt, tabs = [] } = content;
  const sectionRef = React.useRef<HTMLElement>(null);
  const behindRef = React.useRef<HTMLDivElement>(null);
  const imgScrollRef = React.useRef<HTMLDivElement>(null);
  const lastStepRef = React.useRef(0);

  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [scrollStep, setScrollStep] = React.useState(0);
  const [inPin, setInPin] = React.useState(false);

  const isMobile = useContainerMobile(sectionRef);
  const { hasRoot, scroller, requestRefresh } = useLandingMotion();

  const isCanvas = useIsCanvasEdit(sectionRef);

  useDrawerScrollLock(activeTab, isMobile);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const dark = variant === '2';
  const theme = dark ? THEME.dark : THEME.light;

  const stageStyle = composeStyle(
    { backgroundColor: theme.stageBg, color: theme.titleColor },
    blockBackgroundStyle(background)
  );

  const cardSurfaceStyle = composeStyle(
    {
      backgroundColor: theme.cardBg,
      borderRadius: '1rem',
      boxShadow:
        '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(12px)',
      padding: 'clamp(16px, 2cqi, 28px) clamp(20px, 2.5cqi, 28px)',
    },
    styleOf('cardSurface')
  );

  const tabLabelStyle = (index: number) =>
    composeStyle(
      {
        margin: 0,
        fontSize: isCanvas ? RESPONSIVE.canvasTitle : RESPONSIVE.cardTitle,
        fontWeight: 400,
        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
        color: theme.titleColor,
        letterSpacing: '-0.01em',
      },
      styleOf(`tabs[${index}].label`)
    );

  const tabDescStyle = (index: number) =>
    composeStyle(
      {
        margin: 0,
        marginTop: '0.5rem',
        fontSize: isCanvas ? RESPONSIVE.canvasDesc : RESPONSIVE.cardDesc,
        lineHeight: 1.6,
        fontWeight: 400,
        color: theme.descColor,
      },
      styleOf(`tabs[${index}].desc`)
    );

  const tabImgStyle = (index: number) => styleOf(`tabs[${index}].img`);

  const mainImageStyle = composeStyle(
    { objectFit: 'contain', width: '100%', height: '100%' },
    styleOf('mainImage')
  );

  const mainAltStyle = composeStyle(
    {
      margin: 0,
      fontSize: RESPONSIVE.altFont,
      color: theme.altColor,
      letterSpacing: '0.04em',
    },
    styleOf('mainAlt')
  );

  // Center pannable image on mobile (container-aware).
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = imgScrollRef.current;
    if (!el) return;
    const center = () => {
      if (!isMobile) return;
      const offset = (el.scrollWidth - el.clientWidth) / 2;
      if (offset > 0) el.scrollLeft = offset;
    };
    const t = setTimeout(center, 50);
    window.addEventListener('resize', center);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', center);
    };
  }, [isMobile]);

  // Motion: fade-in, variant-2 scrub, scroll-sequence.
  React.useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    if (isCanvas || !hasRoot) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const img = root.querySelector<HTMLElement>('.mint-discover__zoom-img');
      if (!img) return;

      if (!reduced) {
        gsap.fromTo(
          img,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 85%',
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );

        if (variant === '2' && !isMobile) {
          gsap.fromTo(
            img,
            { scale: 0.78 },
            {
              scale: 1.05,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                scroller,
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      } else {
        gsap.set(img, { autoAlpha: 1, scale: 1 });
      }

      ScrollTrigger.create({
        trigger: root,
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onToggle: self => setInPin(self.isActive),
        onUpdate: self => {
          const step = Math.min(
            Math.floor(self.progress * tabs.length),
            Math.max(tabs.length - 1, 0)
          );
          if (step !== lastStepRef.current) {
            lastStepRef.current = step;
            setScrollStep(step);
          }
        },
      });
    }, root);

    requestRefresh();

    return () => ctx.revert();
  }, [
    tabs.length,
    variant,
    isCanvas,
    hasRoot,
    isMobile,
    scroller,
    requestRefresh,
  ]);

  const tabOpen = activeTab !== null;
  const tabData = activeTab ? tabs.find(t => t.key === activeTab) : null;
  const activeTabIndex = tabData
    ? tabs.findIndex(t => t.key === tabData.key)
    : -1;
  const stepTab = tabs[scrollStep];
  const cardVisible = inPin && !tabOpen;
  const trackVh = Math.max(tabs.length, 2) * 120;

  const sectionClass = cn(
    'mint-discover @container relative w-full',
    className
  );

  if (tabs.length === 0) return null;

  // ── Editor canvas: stage + hotspot cards (no cardSurface chrome) ───────
  // cardSurface vẫn style được qua Layers; PreviewMode + /p giữ thẻ info thật.
  if (isCanvas) {
    return (
      <section
        ref={sectionRef}
        data-canvas-edit='true'
        data-variant={variant}
        style={blockBackgroundStyle(background)}
        className={sectionClass}
      >
        <div
          className='relative min-h-[480px] w-full overflow-hidden'
          style={stageStyle}
        >
          <div className='mb-3 px-3 pt-3'>
            <span
              style={{
                fontSize: RESPONSIVE.altFont,
                fontWeight: 600,
                letterSpacing: '0.14em',
                color: theme.metaColor,
                textTransform: 'uppercase',
              }}
            >
              Hotspot · {tabs.length}
            </span>
          </div>

          <div
            className='relative mx-3 mb-2 overflow-hidden rounded-xl'
            style={{ height: RESPONSIVE.stageH }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-element-key='mainImage'
              src={mainImage}
              alt={mainAlt}
              style={mainImageStyle}
              className={selectableClass(
                activeKey === 'mainImage',
                'mint-discover__zoom-img select-none'
              )}
              draggable={false}
            />
            {tabs.map((t, i) => (
              <Hotspot
                key={t.key || i}
                xPct={t.dotX}
                yPct={t.dotY}
                label={t.label}
                active={false}
                theme={theme}
                ctaId={`hotspot-${slugify(t.label)}`}
                onClick={() => setActiveTab(t.key)}
              />
            ))}
          </div>

          <p
            data-element-key='mainAlt'
            style={mainAltStyle}
            className={selectableClass(
              activeKey === 'mainAlt',
              'mx-3 mb-4 truncate px-1'
            )}
          >
            Alt: {mainAlt || '(alt text)'}
          </p>

          <div className='grid grid-cols-1 gap-3 px-3 pb-4 @2xl:grid-cols-2'>
            {tabs.map((t, i) => (
              <CanvasTabCard
                key={t.key || i}
                tab={t}
                index={i}
                theme={theme}
                activeKey={activeKey}
                labelStyle={tabLabelStyle(i)}
                descStyle={tabDescStyle(i)}
                imgStyle={tabImgStyle(i)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── Live: sticky scroll-sequence ────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      data-variant={variant}
      style={{
        ...blockBackgroundStyle(background),
        height: `${trackVh}vh`,
      }}
      className={sectionClass}
    >
      <div
        className='sticky top-0 w-full overflow-hidden'
        style={{
          ...stageStyle,
          height: RESPONSIVE.stageH,
          touchAction: 'pan-y',
        }}
      >
        <div
          ref={behindRef}
          className='mint-discover__content relative h-full w-full'
          style={!isMobile ? { contain: 'paint' } : undefined}
        >
          <div
            className='mint-discover__wrapper-image absolute inset-0'
            style={{
              transform: tabOpen
                ? isMobile
                  ? 'translate3d(0, 0, 0) scale(1.15)'
                  : 'translate3d(-25%, 0, 0) scale(2)'
                : 'none',
              transformOrigin: 'center center',
              transition: 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: tabOpen ? 'transform' : 'auto',
            }}
          >
            <div
              ref={imgScrollRef}
              className='mint-discover__pan relative h-full w-full overflow-x-auto overflow-y-hidden @2xl:overflow-hidden'
            >
              <div
                className='relative h-full w-full'
                style={{ padding: RESPONSIVE.pad }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-element-key='mainImage'
                  src={mainImage}
                  alt={mainAlt}
                  loading='eager'
                  decoding='async'
                  style={mainImageStyle}
                  className={selectableClass(
                    activeKey === 'mainImage',
                    'mint-discover__zoom-img h-full w-full select-none'
                  )}
                  draggable={false}
                />

                <span
                  data-element-key='mainAlt'
                  style={mainAltStyle}
                  className={selectableClass(
                    activeKey === 'mainAlt',
                    'pointer-events-auto absolute top-2 left-2 max-w-[40%] truncate rounded px-1.5 py-0.5 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100'
                  )}
                  tabIndex={0}
                >
                  {mainAlt}
                </span>

                <div
                  style={{
                    opacity: tabOpen ? 0 : 1,
                    pointerEvents: tabOpen ? 'none' : 'auto',
                    transition: 'opacity 300ms ease',
                  }}
                >
                  {tabs.map((t, i) => (
                    <Hotspot
                      key={t.key || i}
                      xPct={t.dotX}
                      yPct={t.dotY}
                      label={t.label}
                      active={inPin && scrollStep === i}
                      theme={theme}
                      ctaId={`hotspot-${slugify(t.label)}`}
                      onClick={() =>
                        setActiveTab(activeTab === t.key ? null : t.key)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {stepTab && (
            <div
              className='pointer-events-none absolute right-4 bottom-6 left-4 z-20 @2xl:right-auto @2xl:bottom-12 @2xl:left-12 @2xl:max-w-md'
              style={{
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 400ms ease, transform 400ms ease',
              }}
            >
              <div
                key={stepTab.key}
                data-element-key='cardSurface'
                className={selectableClass(
                  activeKey === 'cardSurface',
                  'pointer-events-auto rounded-2xl backdrop-blur-md'
                )}
                style={cardSurfaceStyle}
              >
                <div
                  style={{
                    marginBottom: '0.25rem',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: RESPONSIVE.cardMeta,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: theme.metaColor,
                  }}
                >
                  {pad2(scrollStep)} / {tabs.length}
                </div>
                <h3
                  data-element-key={`tabs[${scrollStep}].label`}
                  className={selectableClass(
                    activeKey === `tabs[${scrollStep}].label`,
                    'pointer-events-auto'
                  )}
                  style={tabLabelStyle(scrollStep)}
                >
                  {stepTab.label}
                </h3>
                <p
                  data-element-key={`tabs[${scrollStep}].desc`}
                  className={selectableClass(
                    activeKey === `tabs[${scrollStep}].desc`,
                    'pointer-events-auto'
                  )}
                  style={tabDescStyle(scrollStep)}
                >
                  {stepTab.desc}
                </p>
                <div
                  style={{
                    marginTop: '0.75rem',
                    fontSize: RESPONSIVE.cardHint,
                    color: theme.hintColor,
                  }}
                >
                  Bấm vào điểm sáng để xem ảnh chi tiết →
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MintDiscoverDrawer
        tab={tabData ?? null}
        tabIndex={activeTabIndex}
        open={tabOpen}
        isMobile={isMobile}
        behindRef={behindRef}
        activeKey={activeKey}
        labelStyle={
          activeTabIndex >= 0 ? tabLabelStyle(activeTabIndex) : undefined
        }
        descStyle={
          activeTabIndex >= 0 ? tabDescStyle(activeTabIndex) : undefined
        }
        imgStyle={activeTabIndex >= 0 ? tabImgStyle(activeTabIndex) : undefined}
        onClose={() => setActiveTab(null)}
      />
    </section>
  );
}

// ── Canvas tab card ────────────────────────────────────────────────────────

function CanvasTabCard({
  tab,
  index,
  theme,
  activeKey,
  labelStyle,
  descStyle,
  imgStyle,
}: {
  tab: MintDiscoverTab;
  index: number;
  theme: MintDiscoverTheme;
  activeKey?: string | null;
  labelStyle?: React.CSSProperties;
  descStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}) {
  const labelKey = `tabs[${index}].label`;
  const descKey = `tabs[${index}].desc`;
  const imgKey = `tabs[${index}].img`;

  return (
    <div
      className='flex flex-col gap-2 rounded-xl border p-3'
      style={{
        borderColor: theme.cardBorder,
        backgroundColor: theme.canvasCardBg,
      }}
    >
      <span
        style={{
          fontSize: RESPONSIVE.altFont,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme.metaColor,
        }}
      >
        Hotspot {pad2(index)} · {tab.dotX}% × {tab.dotY}%
      </span>
      <h3
        data-element-key={labelKey}
        style={labelStyle}
        className={selectableClass(activeKey === labelKey, 'truncate px-1')}
      >
        {tab.label}
      </h3>
      <p
        data-element-key={descKey}
        style={descStyle}
        className={selectableClass(activeKey === descKey, 'line-clamp-4 px-1')}
      >
        {tab.desc}
      </p>
      {tab.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-element-key={imgKey}
          src={tab.img}
          alt={tab.label}
          style={composeStyle(
            {
              maxHeight: '8rem',
              width: '100%',
              objectFit: 'contain',
              borderRadius: '0.5rem',
            },
            imgStyle
          )}
          className={selectableClass(activeKey === imgKey, '')}
          loading='lazy'
          decoding='async'
        />
      ) : null}
    </div>
  );
}

// ── Portal drawer ──────────────────────────────────────────────────────────

function MintDiscoverDrawer({
  tab,
  tabIndex,
  open,
  isMobile,
  behindRef,
  activeKey,
  labelStyle,
  descStyle,
  imgStyle,
  onClose,
}: {
  tab: MintDiscoverTab | null;
  tabIndex: number;
  open: boolean;
  isMobile: boolean;
  behindRef?: React.RefObject<HTMLElement | null>;
  activeKey?: string | null;
  labelStyle?: React.CSSProperties;
  descStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  const [portalAlive, setPortalAlive] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    setPortalHost(resolveDrawerPortalHost(behindRef?.current ?? null));
  }, [mounted, behindRef, open]);

  React.useEffect(() => {
    if (open) setPortalAlive(true);
  }, [open]);

  React.useEffect(() => {
    if (!open && portalAlive) {
      const t = setTimeout(() => setPortalAlive(false), 520);
      return () => clearTimeout(t);
    }
  }, [open, portalAlive]);

  if (!mounted || !portalAlive || !portalHost) return null;

  const inFrame = isDeviceFrameHost(portalHost);
  const posClass = inFrame ? 'absolute' : 'fixed';
  const labelKey = tabIndex >= 0 ? `tabs[${tabIndex}].label` : '';
  const descKey = tabIndex >= 0 ? `tabs[${tabIndex}].desc` : '';
  const imgKey = tabIndex >= 0 ? `tabs[${tabIndex}].img` : '';

  return createPortal(
    <>
      <div
        className={cn(posClass, 'inset-0 z-1900')}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 500ms ease',
        }}
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        className={cn(
          posClass,
          'z-1950 shadow-2xl',
          isMobile
            ? 'right-0 bottom-0 left-0 h-[88vh] w-full rounded-t-2xl'
            : 'top-0 right-0 h-full w-1/2'
        )}
        style={{
          backgroundColor: '#ffffff',
          color: THEME.light.drawerText,
          transform: open
            ? 'translate3d(0, 0, 0)'
            : isMobile
              ? 'translate3d(0, 100%, 0)'
              : 'translate3d(100%, 0, 0)',
          transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: open ? 'transform' : 'auto',
          pointerEvents: open ? 'auto' : 'none',
        }}
        role='dialog'
        aria-modal='true'
        aria-hidden={!open}
      >
        {tab && tabIndex >= 0 && (
          <div
            className='relative h-full overflow-y-auto overscroll-contain p-8 @2xl:p-12'
            data-lenis-prevent
          >
            <button
              type='button'
              onClick={onClose}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                }
              }}
              className='absolute top-6 right-6 z-10 min-h-11 min-w-11 p-2 transition-opacity hover:opacity-60'
              aria-label='Close'
              tabIndex={0}
              data-rexer-cta='close-detail-tab'
            >
              <svg width='14' height='14' viewBox='0 0 12 13' fill='none'>
                <line
                  x1='0.48'
                  y1='11.48'
                  x2='11.09'
                  y2='0.88'
                  stroke='black'
                  strokeWidth='0.75'
                />
                <line
                  x1='1.02'
                  y1='0.98'
                  x2='11.62'
                  y2='11.59'
                  stroke='black'
                  strokeWidth='0.75'
                />
              </svg>
            </button>
            <h3
              data-element-key={labelKey}
              className={selectableClass(
                activeKey === labelKey,
                'pointer-events-auto mt-12 mb-6'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  marginTop: '3rem',
                  marginBottom: '1.5rem',
                  fontSize: RESPONSIVE.drawerTitle,
                  fontWeight: 400,
                  fontFamily:
                    'ui-serif, Georgia, Cambria, "Times New Roman", serif',
                  color: '#171717',
                },
                labelStyle
              )}
            >
              {tab.label}
            </h3>
            <p
              data-element-key={descKey}
              className={selectableClass(
                activeKey === descKey,
                'pointer-events-auto mb-8'
              )}
              style={composeStyle(
                {
                  margin: 0,
                  marginBottom: '2rem',
                  fontSize: RESPONSIVE.drawerDesc,
                  lineHeight: 1.6,
                  color: THEME.light.drawerText,
                },
                descStyle
              )}
            >
              {tab.desc}
            </p>
            <div className='mt-8 pb-8'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-element-key={imgKey}
                src={tab.img}
                alt={tab.label}
                style={composeStyle(
                  {
                    maxHeight: '60vh',
                    width: '100%',
                    objectFit: 'contain',
                  },
                  imgStyle
                )}
                className={selectableClass(activeKey === imgKey, '')}
                loading='lazy'
                decoding='async'
              />
            </div>
          </div>
        )}
      </div>
    </>,
    portalHost
  );
}

// ── Hotspot dot ────────────────────────────────────────────────────────────

function Hotspot({
  xPct,
  yPct,
  label,
  active,
  theme,
  ctaId,
  onClick,
}: {
  xPct: number;
  yPct: number;
  label: string;
  active: boolean;
  theme: MintDiscoverTheme;
  ctaId: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-rexer-cta={ctaId}
      className='group absolute -translate-x-1/2 -translate-y-1/2'
      style={{ left: `${xPct}%`, top: `${yPct}%`, touchAction: 'manipulation' }}
      aria-label={`Open ${label}`}
    >
      <span className='relative block motion-safe:animate-pulse'>
        {active && (
          <span
            className='absolute inset-0 -z-10 animate-ping rounded-full'
            style={{ backgroundColor: 'rgba(252, 211, 77, 0.5)' }}
            aria-hidden='true'
          />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HOTSPOT_ICON}
          alt=''
          aria-hidden='true'
          draggable={false}
          className='rounded-full shadow-lg transition-transform duration-300 select-none group-hover:scale-110'
          style={{
            width: '2.5rem',
            height: '2.5rem',
            transform: active ? 'scale(1.25)' : undefined,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
            outline: active ? '2px solid rgb(252, 211, 77)' : undefined,
          }}
        />
      </span>
      <span
        className={cn(
          'pointer-events-none absolute top-1/2 left-12 -translate-y-1/2 rounded-full px-3 py-1 whitespace-nowrap shadow-sm transition-all duration-300',
          active
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
        )}
        style={{
          backgroundColor: theme.labelChipBg,
          color: theme.labelChipColor,
          fontSize: RESPONSIVE.cardMeta,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </button>
  );
}
