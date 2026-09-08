'use client';

/**
 * 212 West 72nd · Hero stage — hero (ảnh + header + title) và panel
 * "Designed For New Yorkers" trượt vào từ phải.
 * Port từ apps/212-west HeroStage + Hero + Header + DesignedForNewYorkers.
 *
 * Cấu trúc (desktop ≥ @4xl):
 *   section.west72-hero (overflow-x: clip — KHÔNG overflow-hidden, vì
 *   overflow hidden biến root thành scroll container và giết position:sticky)
 *   └ .west72-hero-track      200svh — quãng cuộn của wipe
 *     └ .west72-hero-stage    sticky top 0, 100svh, overflow hidden
 *       ├ .west72-hero-scene  header + ảnh + title (100svh)
 *       └ .west72-hero-designed  absolute inset-0 của STAGE, translateX(100%)
 * Stacked (< @4xl) và canvas: track/stage auto, designed nằm dưới scene.
 *
 * - App gốc chạy wipe theo wheel-snap (SectionSnap). Host không có snap
 *   controller → wipe **scrub** theo track (panel trượt vào, title/nav/ảnh dịch
 *   như app); reveal bên trong Designed tự chạy khi wipe hoàn tất (progress ≥
 *   0.98), reset khi scroll ngược về đầu (≤ 0.05).
 * - Stacked: Designed reveal theo ScrollTrigger `top 80%` play / reverse — như
 *   bản mobile của app.
 * - Editor canvas: layout stacked tĩnh, không GSAP, mọi field chọn được.
 * - Trạng thái đầu do GSAP đặt trong `useLayoutEffect` (trước paint). KHÔNG đặt
 *   inline `transform` tiền-paint: GSAP parse translate px sẵn có vào cache x/y
 *   rồi cộng thêm xPercent/yPercent → lệch đúng 100%. Mọi set có percent đều
 *   kèm `x: 0` / `y: 0` để zero phần px (CSS translateX(100%) của designed).
 * - Drawer menu mobile: portal (device frame → body) + useDrawerScrollLock.
 * - KHÔNG gsap.registerPlugin — LandingMotionRoot đã đăng ký.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { isDeviceFrameHost, resolveDrawerPortalHost } from '../previewPortal';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  West72HeroContent,
  West72NavLink,
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
import { useIsCanvasEdit } from './useIsCanvasEdit';
import {
  WEST72_BLACK,
  WEST72_BROWN,
  WEST72_CREAM,
  WEST72_FONT_CSS,
  WEST72_FONT_DISPLAY,
  WEST72_FONT_NAV,
  WEST72_INK,
  WEST72_WHITE,
} from './west72Theme';

/** Khớp Tailwind `@4xl:` container (896px) — nhánh overlay/scrub desktop. */
const DESKTOP_BREAKPOINT = 896;

const HEADER_GRADIENT =
  'linear-gradient(180deg, rgba(97, 36, 8, 0.6) 0%, rgba(97, 36, 8, 0) 100%)';

// ── Timing giữ nguyên từ app ──
const ENTRANCE_DURATION = 1.5;
const HERO_IMAGE_SCALE = 1.2;
const TITLE_SHIFT_PERCENT = -120;
const NAV_SHIFT_PERCENT = -120;

const MEDIA_DESIGN_WIDTH = 553;
const HEADING_SHIFT = 160;
const VERTICAL_SHIFT = 90;
const IMAGE_ROTATION = -30;
const IMAGE_SCALE = 1.4;
const COPY_SCALE = 1.3;
const COPY_ORIGIN = '81.75% 34.01%';
const BEAT_DURATION = 1.2;
const BEAT_EASE = 'power3.out';

const REVEAL_AT = 0.98;
const RESET_AT = 0.05;

const DRAWER_DURATION = 0.75;

const SLATS = [
  { key: 'left', left: '-1px', width: 'calc(33.273% + 2px)', out: 100 },
  {
    key: 'mid',
    left: 'calc(33.273% - 1px)',
    width: 'calc(33.454% + 2px)',
    out: -100,
  },
  {
    key: 'right',
    left: 'calc(66.727% - 1px)',
    width: 'calc(33.273% + 2px)',
    out: 100,
  },
] as const;

const DEFAULT_NAV: West72NavLink[] = [
  { label: 'THE BUILDING', href: '#' },
  { label: 'RESIDENCES', href: '#' },
  { label: 'AMENITIES', href: '#' },
  { label: 'VIEWS', href: '#' },
  { label: 'NEIGHBORHOOD', href: '#' },
  { label: 'AVAILABILITY', href: '#' },
  { label: 'NEWS & PRESS', href: '#' },
];

const RESPONSIVE = {
  navPadX: 'clamp(20px, 2.8cqi, 40px)',
  navPadY: 'clamp(20px, 1.7cqi, 24px)',
  logoH: 'clamp(44px, 3.6cqi, 52px)',
  navFont: 'clamp(13px, 1cqi, 14px)',
  // App: 15vw (<768) → 11vw (≥768) → min(11vw, 158px) (≥1280). Sàn 58.5px
  // = 15vw tại 390 để mobile bằng app; từ ~532px trở lên trùng 11cqi.
  titleFont: 'clamp(58.5px, 11cqi, 158px)',
  titlePadX: 'clamp(20px, 2.8cqi, 40px)',
  titlePadB: 'clamp(8px, 1.1cqi, 16px)',
  designedPadX: 'clamp(20px, 8.3cqi, 120px)',
  designedPadY: 'clamp(40px, 3.5cqi, 50px)',
  designedGap: 'clamp(40px, 8.3cqi, 120px)',
  headingFont: 'clamp(34px, 4.2cqi, 60px)',
  // `cqw` chứ KHÔNG `cqi`: element này `writing-mode: vertical-rl` nên `cqi`
  // (inline size) ánh xạ sang trục dọc của container; `@container` là
  // `container-type: inline-size` → trục đó không khả dụng → CSS fallback về
  // `svh` (chữ co theo chiều cao màn). App: 40px → md 54 → lg 70.
  verticalFont: 'clamp(40px, 6.84cqw, 70px)',
  bodyFont: 'clamp(21px, 2.6cqi, 37px)',
  drawerFont: 'clamp(22px, 6.6cqi, 26px)',
} as const;

const BLOCK_CSS = `
/* line-height đổi theo tier nên không đặt inline được; editor không override
   line-height (xem elementStyleOf) nên để trong CSS là an toàn.
   App: leading mặc định 1.5, chỉ ≥xl mới 41px/37px = 1.108. */
.west72-hero-body { line-height: 1.5; }
@container (min-width: ${DESKTOP_BREAKPOINT}px) {
  .west72-hero-body { line-height: 1.108; }
  .west72-hero-track:not([data-canvas-edit]) {
    height: 200svh;
  }
  .west72-hero-track:not([data-canvas-edit]) .west72-hero-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
  .west72-hero-track:not([data-canvas-edit]) .west72-hero-designed {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    transform: translateX(100%);
  }
}
`;

function PhoneIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      style={{ width: 24, height: 24 }}
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z' />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      aria-hidden='true'
      style={{ width: 24, height: 24 }}
    >
      <path d='M3 6h18M3 12h18M3 18h18' />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      aria-hidden='true'
      style={{ width: 24, height: 24 }}
    >
      <path d='M5 5l14 14M19 5L5 19' />
    </svg>
  );
}

interface Props {
  content: West72HeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

export function West72Hero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const designedRef = React.useRef<HTMLDivElement>(null);
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const drawerTlRef = React.useRef<gsap.core.Timeline | null>(null);

  const { scroller, requestRefresh } = useLandingMotion();
  const isCanvas = useIsCanvasEdit(rootRef);
  const isStacked = useContainerMobile(rootRef, DESKTOP_BREAKPOINT);
  const isMobile = useContainerMobile(rootRef);

  const [mounted, setMounted] = React.useState(false);
  const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    setPortalHost(resolveDrawerPortalHost(rootRef.current));
  }, [mounted, isCanvas]);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useDrawerScrollLock(menuOpen && !isCanvas ? 'west72-menu' : null, isMobile);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const logoUrl = content.logoUrl?.trim() || '/212-west/logo.svg';
  const logoAlt = content.logoAlt?.trim() || '212 West 72nd';
  const logoHref = content.logoHref?.trim() ?? '';
  const navLinks = Array.isArray(content.navLinks)
    ? content.navLinks.filter(l => l && typeof l.label === 'string')
    : DEFAULT_NAV;
  const contactLabel = content.contactLabel?.trim() || 'CONTACT';
  const contactHref = content.contactHref?.trim() ?? '';
  const phoneLabel = content.phoneLabel?.trim() || 'Call 212 West 72nd';
  const phoneHref = content.phoneHref?.trim() ?? '';
  const heroImageUrl =
    content.heroImageUrl?.trim() || '/212-west/background-hero.jpg';
  const heroImageAlt = content.heroImageAlt?.trim() || '';
  const title = content.title?.trim() || 'Light-Filled Interiors';
  const designedTitle = content.designedTitle?.trim() || '';
  const designedVertical = content.designedVertical?.trim() || '';
  const designedBody = content.designedBody?.trim() || '';
  const designedImageUrl =
    content.designedImageUrl?.trim() ||
    '/212-west/designed-for-new-yorkers.jpg';
  const designedImageAlt = content.designedImageAlt?.trim() || '';

  // Ẩn tiền-paint bằng opacity (không transform — xem doc đầu file); GSAP
  // `autoAlpha` sẽ đè lên. Chỉ khi không phải canvas edit.
  const hidden = !isCanvas;

  // ── Hero entrance + wipe/reveal ──────────────────────────────────────────
  React.useLayoutEffect(() => {
    if (isCanvas) return;
    const root = rootRef.current;
    const track = trackRef.current;
    const stage = stageRef.current;
    const designed = designedRef.current;
    if (!root || !track || !stage || !designed) return;

    // Gate: đợi đo container khớp với nhánh đang render (tránh build scrub
    // desktop rồi ResizeObserver flip sang stacked).
    const width = root.clientWidth;
    if (width === 0) return;
    if (width < DESKTOP_BREAKPOINT !== isStacked) return;

    const heroImage = stage.querySelector<HTMLElement>('[data-hero-image]');
    const heroMedia = stage.querySelector<HTMLElement>('[data-hero-media]');
    const navOuter = stage.querySelector<HTMLElement>('[data-hero-nav]');
    const navInner = stage.querySelector<HTMLElement>('[data-hero-nav-inner]');
    const heroTitle = stage.querySelector<HTMLElement>('[data-hero-title]');
    const media = designed.querySelector<HTMLElement>('[data-designed-media]');
    const image = designed.querySelector<HTMLElement>('[data-designed-image]');
    const heading = designed.querySelector<HTMLElement>(
      '[data-designed-heading]'
    );
    const vertical = designed.querySelector<HTMLElement>(
      '[data-designed-vertical]'
    );
    const copy = designed.querySelector<HTMLElement>('[data-designed-copy]');
    const slats = gsap.utils.toArray<HTMLElement>(
      '[data-designed-slat]',
      designed
    );
    if (
      !heroImage ||
      !heroMedia ||
      !navOuter ||
      !navInner ||
      !heroTitle ||
      !media ||
      !image ||
      !heading ||
      !vertical ||
      !copy ||
      slats.length !== SLATS.length
    ) {
      return;
    }

    const st = scroller ?? undefined;

    const ctx = gsap.context(() => {
      const entranceDuration = reduceMotion ? 0 : ENTRANCE_DURATION;
      const beat = reduceMotion ? 0 : BEAT_DURATION;

      // ── Hero entrance (cả 2 nhánh) — replay khi cuộn ngược lên ──
      // `x: 0` / `y: 0` zero phần px để percent không cộng dồn.
      gsap.set(heroImage, { scale: HERO_IMAGE_SCALE });
      gsap.set(navInner, { y: 0, yPercent: -100, autoAlpha: 0 });
      gsap.set(heroTitle, { x: 0, y: 0, yPercent: 100, autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: 'power3.out', duration: entranceDuration },
          scrollTrigger: {
            trigger: track,
            scroller: st,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true,
          },
        })
        .to(heroImage, { scale: 1 }, 0)
        .to(navInner, { yPercent: 0, autoAlpha: 1 }, 0)
        .to(heroTitle, { yPercent: 0, autoAlpha: 1 }, 0);

      // ── Designed reveal (paused) — 3 beat nối tiếp như app ──
      const factor = media.offsetWidth / MEDIA_DESIGN_WIDTH;

      gsap.set(image, {
        rotate: IMAGE_ROTATION,
        scale: IMAGE_SCALE,
        transformOrigin: 'center',
      });
      gsap.set(heading, { y: HEADING_SHIFT * factor });
      gsap.set(vertical, { x: -VERTICAL_SHIFT * factor });
      gsap.set(copy, {
        scale: COPY_SCALE,
        opacity: 0,
        transformOrigin: COPY_ORIGIN,
      });

      const beatImage = gsap
        .timeline({ defaults: { duration: beat, ease: BEAT_EASE } })
        .to(slats[0], { yPercent: SLATS[0].out }, 0)
        .to(slats[1], { yPercent: SLATS[1].out }, 0)
        .to(slats[2], { yPercent: SLATS[2].out }, 0)
        .to(image, { rotate: 0, scale: 1 }, 0);

      const beatText = gsap
        .timeline({ defaults: { duration: beat, ease: BEAT_EASE } })
        .to(heading, { y: 0 }, 0)
        .to(vertical, { x: 0 }, 0);

      const beatCopy = gsap
        .timeline({ defaults: { duration: beat, ease: BEAT_EASE } })
        .to(copy, { scale: 1, opacity: 1 }, 0);

      const reveal = gsap
        .timeline({ paused: true })
        .add(beatImage)
        .add(beatText, '>')
        .add(beatCopy, '>');

      if (isStacked) {
        // Panel nằm dưới hero — reveal khi vào khung, tua ngược khi cuộn lên
        // qua start, reset khi ra hẳn phía trên (khớp createReplayTrigger app).
        ScrollTrigger.create({
          trigger: designed,
          scroller: st,
          start: 'top 80%',
          end: 'bottom top',
          invalidateOnRefresh: true,
          onEnter: () => reveal.play(),
          onEnterBack: () => reveal.play(),
          onLeave: () => reveal.pause(0),
          onLeaveBack: () => reveal.reverse(),
        });
        return;
      }

      // ── Desktop: wipe scrub theo track 200svh ──
      let revealed = false;

      gsap
        .timeline({
          defaults: { ease: 'power2.out', duration: 1 },
          scrollTrigger: {
            trigger: track,
            scroller: st,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: self => {
              if (self.progress >= REVEAL_AT) {
                if (revealed) return;
                revealed = true;
                reveal.play(0);
              } else if (self.progress <= RESET_AT && revealed) {
                revealed = false;
                reveal.pause(0);
              }
            },
          },
        })
        .fromTo(designed, { x: 0, xPercent: 100 }, { xPercent: 0 }, 0)
        .to(heroTitle, { xPercent: TITLE_SHIFT_PERCENT }, 0)
        .to(navOuter, { yPercent: NAV_SHIFT_PERCENT }, 0)
        .to(heroMedia, { scale: HERO_IMAGE_SCALE }, 0);
    }, root);

    requestRefresh();
    return () => ctx.revert();
  }, [isCanvas, isStacked, scroller, requestRefresh, reduceMotion]);

  // ── Drawer menu (portal) ─────────────────────────────────────────────────
  React.useLayoutEffect(() => {
    if (isCanvas || !portalHost) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const items = drawer.querySelectorAll<HTMLElement>('[data-menu-item]');
    const duration = reduceMotion ? 0 : DRAWER_DURATION;

    const tl = gsap
      .timeline({ paused: true, defaults: { ease: 'power3.out' } })
      .fromTo(
        drawer,
        { y: 0, yPercent: -100, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration },
        0
      )
      .fromTo(
        items,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.6,
          stagger: reduceMotion ? 0 : 0.06,
        },
        reduceMotion ? 0 : 0.2
      );

    drawerTlRef.current = tl;
    return () => {
      tl.kill();
      drawerTlRef.current = null;
    };
  }, [isCanvas, portalHost, reduceMotion, navLinks.length]);

  React.useEffect(() => {
    const tl = drawerTlRef.current;
    if (!tl) return;
    if (menuOpen) tl.timeScale(1).play();
    else tl.timeScale(1.35).reverse();
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Nhánh desktop ẩn hamburger; đổi sang stacked thì đóng drawer nếu đang mở.
  React.useEffect(() => {
    if (!isStacked) setMenuOpen(false);
  }, [isStacked]);

  const closeMenu = () => setMenuOpen(false);

  // ── Pieces ───────────────────────────────────────────────────────────────
  const navType: React.CSSProperties = {
    fontFamily: WEST72_FONT_NAV,
    fontSize: RESPONSIVE.navFont,
    fontWeight: 500,
    textTransform: 'uppercase',
    color: WEST72_CREAM,
    textDecoration: 'none',
  };

  const logoImg = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-element-key='logoUrl'
      src={logoUrl}
      alt=''
      className={selectableClass(activeKey === 'logoUrl', 'west72-hero-logo')}
      style={composeStyle(
        { height: RESPONSIVE.logoH, width: 'auto', display: 'block' },
        styleOf('logoUrl')
      )}
    />
  );

  const logo = (
    <a
      href={isCanvas ? undefined : logoHref || '#'}
      onClick={isCanvas ? e => e.preventDefault() : closeMenu}
      aria-label={logoAlt}
      data-element-key='logoHref'
      className={selectableClass(activeKey === 'logoHref', 'shrink-0')}
      style={styleOf('logoHref')}
    >
      {logoImg}
    </a>
  );

  const header = (
    <header
      data-hero-nav
      className='absolute inset-x-0 top-0 z-50'
      style={{ background: HEADER_GRADIENT, color: WEST72_CREAM }}
    >
      <div
        data-hero-nav-inner
        className='mx-auto flex w-full items-center justify-between'
        style={{
          maxWidth: 1440,
          paddingLeft: RESPONSIVE.navPadX,
          paddingRight: RESPONSIVE.navPadX,
          paddingTop: RESPONSIVE.navPadY,
          paddingBottom: RESPONSIVE.navPadY,
          opacity: hidden ? 0 : undefined,
        }}
      >
        {logo}
        <span
          data-element-key='logoAlt'
          className={selectableClass(activeKey === 'logoAlt', 'sr-only')}
          style={styleOf('logoAlt')}
        >
          {logoAlt}
        </span>

        <nav
          className={cn(
            'items-center',
            isCanvas ? 'flex flex-wrap' : 'hidden @4xl:flex'
          )}
          style={{ gap: 'clamp(16px, 1.7cqi, 24px)' }}
        >
          {navLinks.map((link, index) => {
            const labelKey = `navLinks[${index}].label`;
            const hrefKey = `navLinks[${index}].href`;
            return (
              <a
                key={`${link.href}-${index}`}
                href={isCanvas ? undefined : link.href || '#'}
                onClick={isCanvas ? e => e.preventDefault() : undefined}
                data-element-key={hrefKey}
                className={selectableClass(
                  activeKey === hrefKey,
                  'cursor-pointer no-underline'
                )}
                style={styleOf(hrefKey)}
              >
                <span
                  data-element-key={labelKey}
                  className={selectableClass(activeKey === labelKey)}
                  style={composeStyle(navType, styleOf(labelKey))}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </nav>

        <a
          href={isCanvas ? undefined : contactHref || '#'}
          onClick={isCanvas ? e => e.preventDefault() : undefined}
          data-element-key='contactHref'
          className={selectableClass(
            activeKey === 'contactHref',
            cn(
              'cursor-pointer no-underline',
              isCanvas ? 'inline-block' : 'hidden @4xl:inline-block'
            )
          )}
          style={composeStyle(
            {
              border: `1px solid ${WEST72_CREAM}`,
              padding: '12px 16px',
              minHeight: 44,
            },
            styleOf('contactHref')
          )}
        >
          <span
            data-element-key='contactLabel'
            className={selectableClass(activeKey === 'contactLabel')}
            style={composeStyle(
              { ...navType, fontWeight: 600, letterSpacing: '2px' },
              styleOf('contactLabel')
            )}
          >
            {contactLabel}
          </span>
        </a>

        <div
          className={cn('flex items-center', isCanvas ? '' : '@4xl:hidden')}
          style={{ gap: 20 }}
        >
          <a
            href={isCanvas ? undefined : phoneHref || '#'}
            onClick={isCanvas ? e => e.preventDefault() : undefined}
            aria-label={phoneLabel}
            data-element-key='phoneHref'
            className={selectableClass(
              activeKey === 'phoneHref',
              'grid min-h-11 min-w-11 cursor-pointer place-items-center'
            )}
            style={composeStyle({ color: WEST72_CREAM }, styleOf('phoneHref'))}
          >
            <PhoneIcon />
          </a>
          <span
            data-element-key='phoneLabel'
            className={selectableClass(activeKey === 'phoneLabel', 'sr-only')}
            style={styleOf('phoneLabel')}
          >
            {phoneLabel}
          </span>
          {!isCanvas && (
            <button
              type='button'
              onClick={() => setMenuOpen(true)}
              className='grid min-h-11 min-w-11 cursor-pointer place-items-center border-0 bg-transparent'
              style={{ color: WEST72_CREAM }}
              aria-label='Open menu'
              aria-expanded={menuOpen}
            >
              <MenuIcon />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const scene = (
    <div
      className='west72-hero-scene relative w-full overflow-hidden'
      style={{
        backgroundColor: WEST72_INK,
        height: isCanvas ? 'clamp(480px, 62cqi, 900px)' : '100svh',
      }}
    >
      {header}

      <div data-hero-media className='absolute inset-0 will-change-transform'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hero-image
          data-element-key='heroImageUrl'
          src={heroImageUrl}
          alt={heroImageAlt}
          onLoad={() => requestRefresh()}
          className={selectableClass(
            activeKey === 'heroImageUrl',
            'absolute inset-0 h-full w-full object-cover will-change-transform'
          )}
          style={styleOf('heroImageUrl')}
        />
      </div>
      <span
        data-element-key='heroImageAlt'
        className={selectableClass(activeKey === 'heroImageAlt', 'sr-only')}
        style={styleOf('heroImageAlt')}
      >
        {heroImageAlt}
      </span>

      <div
        className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2'
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)',
        }}
      />

      <div className='absolute inset-x-0 bottom-1'>
        <div
          className='mx-auto w-full'
          style={{
            maxWidth: 1440,
            paddingLeft: RESPONSIVE.titlePadX,
            paddingRight: RESPONSIVE.titlePadX,
            paddingBottom: RESPONSIVE.titlePadB,
          }}
        >
          <h1
            data-hero-title
            data-element-key='title'
            className={selectableClass(
              activeKey === 'title',
              'west72-hero-title m-0 text-center will-change-transform'
            )}
            style={composeStyle(
              {
                fontFamily: WEST72_FONT_DISPLAY,
                fontSize: RESPONSIVE.titleFont,
                lineHeight: 1.12,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: WEST72_WHITE,
                opacity: hidden ? 0 : undefined,
              },
              styleOf('title')
            )}
          >
            {title}
          </h1>
        </div>
      </div>
    </div>
  );

  const designed = (
    <div
      ref={designedRef}
      className='west72-hero-designed relative w-full overflow-hidden'
      style={{ backgroundColor: WEST72_WHITE }}
    >
      <div className='flex h-full w-full flex-col justify-center'>
        <div
          className='mx-auto w-full'
          style={{
            maxWidth: 1440,
            paddingLeft: RESPONSIVE.designedPadX,
            paddingRight: RESPONSIVE.designedPadX,
            paddingTop: RESPONSIVE.designedPadY,
            paddingBottom: RESPONSIVE.designedPadY,
          }}
        >
          <h2
            data-designed-heading
            data-element-key='designedTitle'
            className={selectableClass(
              activeKey === 'designedTitle',
              'west72-hero-heading m-0'
            )}
            style={composeStyle(
              {
                fontFamily: WEST72_FONT_DISPLAY,
                fontSize: RESPONSIVE.headingFont,
                lineHeight: 0.92,
                fontWeight: 500,
                textTransform: 'uppercase',
                color: WEST72_BROWN,
                whiteSpace: 'pre-line',
                maxWidth: MEDIA_DESIGN_WIDTH,
              },
              styleOf('designedTitle')
            )}
          >
            {designedTitle}
          </h2>

          <div
            className='flex flex-col @4xl:flex-row @4xl:items-start'
            style={{ marginTop: 16, gap: RESPONSIVE.designedGap }}
          >
            <div className='flex w-full' style={{ gap: 3 }}>
              <div
                data-designed-media
                className='relative z-10 min-w-0 flex-1 overflow-hidden will-change-transform @4xl:flex-none'
                style={{
                  width: '100%',
                  maxWidth: MEDIA_DESIGN_WIDTH,
                  maxHeight: 571,
                  aspectRatio: '553 / 571',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-designed-image
                  data-element-key='designedImageUrl'
                  src={designedImageUrl}
                  alt={designedImageAlt}
                  onLoad={() => requestRefresh()}
                  className={selectableClass(
                    activeKey === 'designedImageUrl',
                    'absolute inset-0 h-full w-full object-cover'
                  )}
                  style={composeStyle(
                    { objectPosition: '25% center' },
                    styleOf('designedImageUrl')
                  )}
                />
                {!isCanvas &&
                  SLATS.map(slat => (
                    <div
                      key={slat.key}
                      data-designed-slat
                      className='pointer-events-none absolute inset-y-0'
                      style={{
                        left: slat.left,
                        width: slat.width,
                        backgroundColor: WEST72_WHITE,
                      }}
                    />
                  ))}
              </div>
              <span
                data-element-key='designedImageAlt'
                className={selectableClass(
                  activeKey === 'designedImageAlt',
                  'sr-only'
                )}
                style={styleOf('designedImageAlt')}
              >
                {designedImageAlt}
              </span>

              <div className='relative z-0 flex shrink-0 items-start'>
                <span
                  data-designed-vertical
                  data-element-key='designedVertical'
                  className={selectableClass(
                    activeKey === 'designedVertical',
                    'block'
                  )}
                  style={composeStyle(
                    {
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      fontFamily: WEST72_FONT_DISPLAY,
                      fontSize: RESPONSIVE.verticalFont,
                      lineHeight: 0.7,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: WEST72_BROWN,
                    },
                    styleOf('designedVertical')
                  )}
                >
                  {designedVertical}
                </span>
              </div>
            </div>

            <p
              data-designed-copy
              data-element-key='designedBody'
              className={selectableClass(
                activeKey === 'designedBody',
                'west72-hero-body m-0 @4xl:w-109 @4xl:flex-none'
              )}
              style={composeStyle(
                {
                  fontFamily: WEST72_FONT_DISPLAY,
                  fontSize: RESPONSIVE.bodyFont,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: WEST72_BLACK,
                },
                styleOf('designedBody')
              )}
            >
              {designedBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const drawer =
    mounted && !isCanvas && portalHost
      ? createPortal(
          <div
            ref={drawerRef}
            role='dialog'
            aria-modal
            aria-label='Site navigation'
            aria-hidden={!menuOpen}
            data-lenis-prevent
            className={cn(
              'west72-hero-drawer inset-0 z-60 flex flex-col',
              isDeviceFrameHost(portalHost) ? 'absolute' : 'fixed'
            )}
            style={{
              backgroundColor: 'rgba(15, 15, 14, 0.88)',
              color: WEST72_CREAM,
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            <div
              className='flex w-full items-center justify-between'
              style={{
                padding: RESPONSIVE.navPadY,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              <a
                href={logoHref || '#'}
                onClick={closeMenu}
                aria-label={logoAlt}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt=''
                  style={{
                    height: RESPONSIVE.logoH,
                    width: 'auto',
                    display: 'block',
                  }}
                />
              </a>
              <button
                type='button'
                onClick={closeMenu}
                className='grid min-h-11 min-w-11 cursor-pointer place-items-center border-0 bg-transparent'
                style={{ color: WEST72_CREAM }}
                aria-label='Close menu'
              >
                <CloseIcon />
              </button>
            </div>

            <nav
              className='flex flex-1 flex-col overflow-y-auto'
              style={{ gap: 8, padding: 20 }}
              data-lenis-prevent
            >
              {navLinks.map((link, index) => (
                <a
                  key={`${link.href}-${index}`}
                  data-menu-item
                  href={link.href || '#'}
                  onClick={closeMenu}
                  className='block cursor-pointer no-underline'
                  style={{
                    padding: '14px 0',
                    fontFamily: WEST72_FONT_NAV,
                    fontSize: RESPONSIVE.drawerFont,
                    lineHeight: 1,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    color: WEST72_CREAM,
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>,
          portalHost
        )
      : null;

  return (
    <section
      ref={rootRef}
      data-canvas-edit={isCanvas ? 'true' : undefined}
      className={cn(
        'west72-hero @container relative w-full overflow-x-clip',
        className
      )}
      style={composeStyle(
        { backgroundColor: WEST72_INK },
        blockBackgroundStyle(background)
      )}
    >
      <style>{WEST72_FONT_CSS}</style>
      <style>{BLOCK_CSS}</style>

      <div
        ref={trackRef}
        data-canvas-edit={isCanvas ? 'true' : undefined}
        className='west72-hero-track relative w-full'
      >
        <div ref={stageRef} className='west72-hero-stage relative w-full'>
          {scene}
          {designed}
        </div>
      </div>

      {drawer}
    </section>
  );
}
