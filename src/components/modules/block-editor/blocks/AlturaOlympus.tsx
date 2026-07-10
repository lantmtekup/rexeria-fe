'use client';

/**
 * Altura Olympus — scroll split 50/50 + image sequence (flat stacking).
 *
 * Phase 0: content trái (bị cover m1 che) | companion m2 phải — split đều.
 * Phase 1: cover (m1) trượt MỘT CHIỀU sang phải, đè companion → phải hiện m1,
 *          trái lộ content CMS. Cover dừng lại, không quét ngược.
 * Phase 3: right panel đứng yên, ảnh sau trượt lên đè ảnh trước: m2 → m3 → m4.
 *
 * Motion contract R1–R6: useBlockMotion + CSS sticky (không GSAP pin).
 * Flat absolute layers dưới .sticky → 1 stacking context, z-index chuẩn.
 *
 * Editor canvas (`data-testid=active-block-preview`): layout tĩnh 1 viewport —
 * content trái + lưới 2×2 ảnh editable (không scrub — BlockPreview scale gãy sticky).
 * PreviewMode / Play / `/p`: full scrub.
 */

import * as React from 'react';
import gsap from 'gsap';
import {
  Activity,
  Crosshair,
  Cog,
  Droplets,
  Package,
  Shield,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';
import { ALTURA_OLYMPUS_IMAGES } from '@/assets/images/altura_olympus';

import type {
  AlturaOlympusContent,
  BlockBackground,
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
import { useContainerMobile } from './useContainerMobile';

interface AlturaOlympusProps {
  content: AlturaOlympusContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

const ICONS: Record<string, LucideIcon> = {
  Crosshair,
  Droplets,
  Shield,
  Package,
  Cog,
  Activity,
};

const LEFT_BG = '#f5f5f0';
const CTA_BG = '#457B6D';
const EYEBROW_DOT = '#457B6D';
const FALLBACK_EYEBROW = 'Gallery';
const FALLBACK_HEADING = 'Take a closer look';
const FALLBACK_DESCRIPTION =
  'Thoughtfully composed to be seen, felt, and remembered in its own way';
const FALLBACK_CTA_TEXT = 'Discover';
const FALLBACK_FEATURES = [
  { label: 'Superior Precision', icon: 'Crosshair' },
  { label: 'Water Resistance', icon: 'Droplets' },
  { label: '5-Year Warranty', icon: 'Shield' },
  { label: '100K+ Units Sold', icon: 'Package' },
  { label: 'Grand Seiko Caliber', icon: 'Cog' },
  { label: 'Frequency 3,5 Hz', icon: 'Activity' },
];

/** Timeline (units, scrub). */
const HOLD_START = 0.1;
const DUR_COVER = 1;
const HOLD_MID = 0.4;
const DUR_IMAGE_STEP = 1;
const IMAGE_ENTER_SCALE = 1.08;
const IMAGE_PARALLAX_Y = -8;
const IMAGE_HOLD_SCALE = 1.035;
const IMAGE_HOLD_Y = 4;
const LEFT_PANEL_ENTER_SCALE = 0.992;
const LEFT_CONTENT_ENTER_SCALE = 0.98;

const IMAGE_KEYS = [
  'image1Url',
  'image2Url',
  'image3Url',
  'image4Url',
] as const;

const IMAGE_LABELS = ['Cover', 'Ảnh 2', 'Ảnh 3', 'Ảnh 4'] as const;

const RESPONSIVE = {
  pad: 'clamp(24px, 5cqi, 56px)',
  padRight: 'clamp(20px, 4cqi, 40px)',
  eyebrowFont: 'clamp(11px, 1.05cqi, 13px)',
  headingFont: 'clamp(32px, 4.8cqi, 56px)',
  bodyFont: 'clamp(14px, 1.45cqi, 17px)',
  featureFont: 'clamp(12px, 1.15cqi, 14px)',
  iconSize: 'clamp(32px, 3.6cqi, 40px)',
  ctaFont: 'clamp(13px, 1.25cqi, 15px)',
  ctaPadY: 'clamp(13px, 1.5cqi, 17px)',
  ctaPadX: 'clamp(28px, 3.5cqi, 40px)',
  gridGapX: 'clamp(16px, 2.5cqi, 28px)',
  gridGapY: 'clamp(18px, 2.2cqi, 26px)',
  contentGap: 'clamp(22px, 3.2cqi, 40px)',
  headingGap: 'clamp(8px, 1.2cqi, 14px)',
} as const;

const STICKY_STYLE: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  height: '100dvh',
  overflow: 'hidden',
  isolation: 'isolate',
  containerType: 'inline-size',
};

const LEFT_HALF: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '50%',
  height: '100%',
  overflow: 'hidden',
};

const RIGHT_HALF: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '50%',
  width: '50%',
  height: '100%',
  overflow: 'hidden',
};

const resolveImages = (content: AlturaOlympusContent): string[] =>
  IMAGE_KEYS.map(
    (key, i) => content[key]?.trim() || ALTURA_OLYMPUS_IMAGES[i] || ''
  ).filter(Boolean);

export const AlturaOlympus = ({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: AlturaOlympusProps) => {
  const rootRef = React.useRef<HTMLElement>(null);
  const { hasRoot, requestRefresh } = useLandingMotion();
  const isMobile = useContainerMobile(rootRef);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play.
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

  const images = React.useMemo(() => resolveImages(content), [content]);
  const coverImage = images[0] || ALTURA_OLYMPUS_IMAGES[0];
  const companionImage = images[1] || ALTURA_OLYMPUS_IMAGES[1];
  const seqImages = images.slice(1);

  const trackHeight = isCanvas ? undefined : isMobile ? '380dvh' : '460dvh';
  const eyebrow = content.eyebrow?.trim() || FALLBACK_EYEBROW;
  const heading = content.heading?.trim() || FALLBACK_HEADING;
  const description = content.description?.trim() || FALLBACK_DESCRIPTION;
  const ctaText = content.ctaText?.trim() || FALLBACK_CTA_TEXT;
  const features =
    Array.isArray(content.features) && content.features.length > 0
      ? content.features
      : FALLBACK_FEATURES;

  const loadedRef = React.useRef(0);
  const totalImages = Math.max(images.length, 1);
  const handleImgLoad = () => {
    loadedRef.current += 1;
    if (loadedRef.current >= totalImages) requestRefresh();
  };

  useBlockMotion(
    rootRef,
    ({ scroller }) => {
      const root = rootRef.current;
      if (!root) return;
      if (!hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const leftPanel = root.querySelector<HTMLElement>(
        '.altura-olympus__left-panel'
      );
      const leftContent = root.querySelector<HTMLElement>(
        '.altura-olympus__content'
      );
      const cover = root.querySelector<HTMLElement>('.altura-olympus__cover');
      const coverImg = cover?.querySelector<HTMLElement>('img');
      const companionImg = root.querySelector<HTMLElement>(
        '.altura-olympus__companion img'
      );
      const seqLayers = Array.from(
        root.querySelectorAll<HTMLElement>('.altura-olympus__seq-layer')
      );
      const seqImgs = seqLayers
        .map(layer => layer.querySelector<HTMLElement>('img'))
        .filter((img): img is HTMLElement => Boolean(img));
      if (!cover || seqLayers.length === 0) return;

      // Initial: cover ở nửa trái, các layer sau nằm dưới khung ảnh phải.
      gsap.set(leftPanel, {
        xPercent: isMobile ? 0 : -2,
        yPercent: isMobile ? -2 : 0,
        scale: LEFT_PANEL_ENTER_SCALE,
        transformOrigin: 'center center',
        force3D: true,
      });
      gsap.set(leftContent, {
        opacity: 0.42,
        y: isMobile ? -18 : 24,
        scale: LEFT_CONTENT_ENTER_SCALE,
        transformOrigin: 'center center',
        force3D: true,
      });
      gsap.set(cover, { xPercent: 0, yPercent: 0, force3D: true });
      gsap.set(seqLayers, { yPercent: 100, force3D: true });
      gsap.set([coverImg, companionImg].filter(Boolean), {
        yPercent: -2,
        scale: 1.04,
        transformOrigin: 'center center',
        force3D: true,
      });
      gsap.set(seqImgs, {
        yPercent: IMAGE_PARALLAX_Y,
        scale: IMAGE_ENTER_SCALE,
        transformOrigin: 'center center',
        force3D: true,
      });

      const seqStart = HOLD_START + DUR_COVER + HOLD_MID;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
      });

      tl.to({}, { duration: HOLD_START }, 0);

      // Phase 1 — cover trượt MỘT CHIỀU (desktop: sang phải, mobile: xuống).
      tl.to(
        cover,
        isMobile
          ? { yPercent: 100, duration: DUR_COVER, force3D: true }
          : { xPercent: 100, duration: DUR_COVER, force3D: true },
        HOLD_START
      );
      tl.to(
        leftPanel,
        {
          xPercent: 0,
          yPercent: 0,
          scale: 1,
          duration: DUR_COVER,
          force3D: true,
        },
        HOLD_START
      );
      tl.to(
        leftContent,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: DUR_COVER,
          force3D: true,
        },
        HOLD_START + 0.12
      );
      tl.to(
        [coverImg, companionImg].filter(Boolean),
        {
          yPercent: 2,
          scale: 1,
          duration: DUR_COVER + HOLD_MID,
          force3D: true,
        },
        HOLD_START
      );

      // Phase 3 — right panel cố định, layer sau trượt lên phủ layer trước.
      seqLayers.forEach((layer, i) => {
        const image = seqImgs[i];
        tl.to(
          layer,
          { yPercent: 0, duration: DUR_IMAGE_STEP, force3D: true },
          seqStart + i * DUR_IMAGE_STEP
        );
        if (!image) return;
        tl.to(
          image,
          {
            yPercent: 0,
            scale: 1,
            duration: DUR_IMAGE_STEP,
            force3D: true,
          },
          seqStart + i * DUR_IMAGE_STEP
        );
        tl.to(
          image,
          {
            yPercent: IMAGE_HOLD_Y,
            scale: IMAGE_HOLD_SCALE,
            duration: DUR_IMAGE_STEP,
            force3D: true,
          },
          seqStart + (i + 1) * DUR_IMAGE_STEP
        );
      });
    },
    [isMobile, hasRoot, isCanvas, images]
  );

  const contentPanel = (
    <div
      className='altura-olympus__content flex flex-col'
      style={{
        padding: RESPONSIVE.pad,
        paddingRight: RESPONSIVE.padRight,
        gap: RESPONSIVE.contentGap,
      }}
    >
      <div className='flex flex-col' style={{ gap: RESPONSIVE.headingGap }}>
        <div className='flex items-center gap-2.5'>
          <span
            aria-hidden='true'
            className='shrink-0'
            style={{
              width: 11,
              height: 11,
              backgroundColor: EYEBROW_DOT,
            }}
          />
          <p
            data-element-key='eyebrow'
            style={composeStyle(
              {
                fontSize: RESPONSIVE.eyebrowFont,
                letterSpacing: '0.08em',
                color: '#6b7280',
              },
              styleOf('eyebrow')
            )}
            className={selectableClass(activeKey === 'eyebrow', 'font-normal')}
          >
            {eyebrow}
          </p>
        </div>

        <h2
          data-element-key='heading'
          style={composeStyle(
            {
              fontSize: RESPONSIVE.headingFont,
              lineHeight: 1.08,
              fontFamily:
                "'Playfair Display', 'Cormorant Garamond', 'Times New Roman', Georgia, serif",
              color: '#111827',
              fontWeight: 400,
              letterSpacing: '-0.02em',
            },
            styleOf('heading')
          )}
          className={selectableClass(activeKey === 'heading')}
        >
          {heading}
        </h2>
      </div>

      <p
        data-element-key='description'
        style={composeStyle(
          {
            fontSize: RESPONSIVE.bodyFont,
            lineHeight: 1.6,
            color: '#6b7280',
            maxWidth: '38ch',
          },
          styleOf('description')
        )}
        className={selectableClass(activeKey === 'description')}
      >
        {description}
      </p>

      <div
        className='grid grid-cols-2'
        style={{
          columnGap: RESPONSIVE.gridGapX,
          rowGap: RESPONSIVE.gridGapY,
        }}
      >
        {features.map((feat, i) => {
          const Icon = ICONS[feat.icon] ?? Crosshair;
          return (
            <div key={i} className='flex items-center gap-3'>
              <span
                className='flex shrink-0 items-center justify-center rounded-full border border-neutral-300/90 bg-white/40'
                style={{
                  width: RESPONSIVE.iconSize,
                  height: RESPONSIVE.iconSize,
                }}
                aria-hidden='true'
              >
                <Icon
                  style={{
                    width: '50%',
                    height: '50%',
                    color: '#9ca3af',
                  }}
                  strokeWidth={1.35}
                />
              </span>
              <span
                data-element-key={`features[${i}].label`}
                style={composeStyle(
                  {
                    fontSize: RESPONSIVE.featureFont,
                    color: '#4b5563',
                    lineHeight: 1.35,
                  },
                  styleOf(`features[${i}].label`)
                )}
                className={selectableClass(
                  activeKey === `features[${i}].label`,
                  'font-normal'
                )}
              >
                {feat.label}
              </span>
            </div>
          );
        })}
      </div>

      <a
        href={content.ctaLink || '#'}
        data-element-key='ctaText'
        style={composeStyle(
          {
            display: 'inline-flex',
            alignSelf: 'flex-start',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'clamp(4px, 0.8cqi, 12px)',
            padding: `${RESPONSIVE.ctaPadY} ${RESPONSIVE.ctaPadX}`,
            fontSize: RESPONSIVE.ctaFont,
            fontWeight: 500,
            color: '#ffffff',
            backgroundColor: CTA_BG,
            borderRadius: 8,
            textDecoration: 'none',
            minWidth: 'clamp(120px, 18cqi, 160px)',
          },
          styleOf('ctaText')
        )}
        className={selectableClass(
          activeKey === 'ctaText',
          'transition-opacity hover:opacity-90'
        )}
        tabIndex={0}
        aria-label={ctaText}
        onClick={e => {
          if (isCanvas) e.preventDefault();
        }}
      >
        {ctaText}
      </a>
    </div>
  );

  return (
    <section
      ref={rootRef}
      data-block='altura-olympus'
      style={{
        ...(trackHeight ? { height: trackHeight } : undefined),
        ...blockBackgroundStyle(background),
      }}
      className={cn(
        'altura-olympus @container relative w-full bg-white',
        className
      )}
    >
      <style>{`
        .altura-olympus :where(h1, h2, h3, p) { margin: 0; }
        @media (prefers-reduced-motion: reduce) {
          .altura-olympus { height: 100dvh !important; }
          .altura-olympus__cover { display: none !important; }
          .altura-olympus__seq-layer { display: none !important; }
        }
        @container (min-width: 768px) {
          .altura-olympus__content { max-width: 92%; }
        }
        @container (max-width: 767px) {
          .altura-olympus__left-half {
            width: 100% !important;
            height: 50% !important;
            top: 0 !important;
            left: 0 !important;
          }
          .altura-olympus__right-half {
            width: 100% !important;
            height: 50% !important;
            top: 50% !important;
            left: 0 !important;
          }
        }
      `}</style>

      {isCanvas ? (
        <div
          className='relative flex min-h-[520px] w-full flex-col @2xl:min-h-[560px] @2xl:flex-row'
          style={{ containerType: 'inline-size' }}
        >
          {/* Content — luôn lộ (không cover) để edit text/CTA/features */}
          <div
            className='flex w-full flex-col justify-center @2xl:w-1/2'
            style={{ backgroundColor: LEFT_BG }}
          >
            {contentPanel}
          </div>

          {/* 4 ảnh editable — lưới 2×2 */}
          <div className='grid w-full grid-cols-2 grid-rows-2 gap-2 bg-neutral-950 p-2 @2xl:w-1/2'>
            {IMAGE_KEYS.map((key, i) => {
              const src = images[i];
              if (!src) return null;
              return (
                <div
                  key={key}
                  data-element-key={key}
                  style={styleOf(key)}
                  className={selectableClass(
                    activeKey === key,
                    'relative min-h-0 overflow-hidden rounded-lg ring-1 ring-white/10'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={IMAGE_LABELS[i]}
                    onLoad={handleImgLoad}
                    className='pointer-events-none h-full w-full object-cover'
                    draggable={false}
                  />
                  <span className='pointer-events-none absolute top-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
                    {IMAGE_LABELS[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className='altura-olympus__sticky' style={STICKY_STYLE}>
          {/* z0 — content CMS (nửa trái), luôn hiển thị, bị cover che lúc đầu */}
          <div
            className='altura-olympus__left-panel altura-olympus__left-half flex flex-col justify-center will-change-transform'
            style={{ ...LEFT_HALF, zIndex: 0, backgroundColor: LEFT_BG }}
          >
            {contentPanel}
          </div>

          {/* z1 — companion m2 (nửa phải), tĩnh, hiện lúc split */}
          <div
            className='altura-olympus__companion altura-olympus__right-half'
            style={{ ...RIGHT_HALF, zIndex: 1, backgroundColor: '#171717' }}
            aria-hidden='true'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={companionImage}
              alt=''
              onLoad={handleImgLoad}
              className='h-full w-full object-cover'
              draggable={false}
            />
          </div>

          {/* z2 — cover m1 (nửa trái), trượt một chiều đè companion */}
          <div
            className='altura-olympus__cover altura-olympus__left-half will-change-transform'
            style={{ ...LEFT_HALF, zIndex: 2 }}
            aria-hidden='true'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt=''
              onLoad={handleImgLoad}
              className='h-full w-full object-cover'
              draggable={false}
            />
          </div>

          {/* z3+ — right panel cố định, ảnh sau đè lên ảnh trước */}
          {seqImages.map((src, i) => (
            <div
              key={IMAGE_KEYS[i + 1] ?? i}
              className='altura-olympus__seq-layer altura-olympus__right-half will-change-transform'
              style={{ ...RIGHT_HALF, zIndex: 3 + i }}
              aria-hidden='true'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=''
                onLoad={handleImgLoad}
                className='h-full w-full object-cover'
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
