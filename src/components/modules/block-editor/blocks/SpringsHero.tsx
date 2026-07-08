'use client';

/**
 * Block "Springs - Hero" — port đầy đủ section `#about` / `.l-intro` của
 * springs.estate (springs-estate-clone). Bản gốc là một STICKY SCROLL HERO
 * cao 600vh (Locomotive `data-scroll-sticky` + `data-plugin="parallax"`):
 * cuộn qua block để lần lượt (1) opening (h1 + subtitle) mờ dần & trượt lên,
 * (2) ảnh nền lớn thu hẹp bằng clip-path polygon từ full → nửa phải + nền
 * trượt lên translateY, (3) 3 ảnh cột phải (opening-1/3/2) reveal TUẦN TỰ
 * bằng clip-path trượt lên từ đáy + scale 1.2→1.0. Ở đây port sang GSAP
 * ScrollTrigger scrub + pin (một timeline duy nhất ghim theo section).
 *
 * ⚠ Giống mọi scroll-block trong repo (xem `MintHero.tsx`): scrub chỉ chạy
 * đầy đủ trên trang publish `/p` (có scroll thật). Trong editor canvas không
 * có scroll → hiển thị FRAME ĐẦU (opening + ảnh nền full) — đúng trạng thái
 * ban đầu, không phải lỗi.
 *
 * Mobile (`useContainerMobile`, bản `#about-mobile` gốc): ảnh nền
 * `intro-image-xs` full-height + opening text xếp dọc, KHÔNG scrub (bản gốc
 * mobile parallax tắt `md-up`). Dưới là khối `l-intro__content` (h2 "Open the
 * doors..." + ảnh opening-2) — ở đây gộp vào cùng flow tĩnh.
 *
 * Font thật (self-host tại springs.estate/assets/fonts, @font-face trỏ thẳng
 * origin gốc): "Victor Serif" (headline, `.h1`) + "TT Commons Pro"
 * (subtitle, `.text-c1`). Khai báo lặp giữa các block Springs vô hại.
 *
 * Ảnh: default trỏ asset local trong `public/landing/springs/intro/` (đã tải
 * về repo — 5 file webp gốc). `backgroundImage` = 1 key, `revealImages` = 1
 * key trên khối bọc (từng ảnh con không có key riêng — theo convention
 * `DelvauxVariant`).
 *
 * Motion tôn trọng prefers-reduced-motion (giữ trạng thái đầu tĩnh).
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsHeroContent,
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

/** Serif dùng cho headline — bản gốc: Victor Serif (`.h1`). */
const SPRINGS_HERO_FONT_SERIF =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho subtitle — bản gốc: TT Commons Pro (`.text-c1`). */
const SPRINGS_HERO_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Nền xanh rừng đậm — `--c-dark-green` gốc (`ui-dark` background). */
const SPRINGS_HERO_BG = '#162d24';

/** Màu chữ chính — `--c-beige-background` gốc (cream ấm). */
const SPRINGS_HERO_CREAM = '#f5e8d1';

/** Màu phụ — `--c-beige` gốc (dịu hơn cream). */
const SPRINGS_HERO_BEIGE = '#e0d1b6';

/** Gradient blur nền — `--c-blue` gốc (#005160). */
const SPRINGS_HERO_BLUE_RGB = '0,81,96';

const SPRINGS_HERO_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
`;

/** clip-path đầy đủ (ảnh hiện trọn). */
const CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
/** clip-path nền thu về nửa phải (gốc `--200`). */
const CLIP_BG_HALF = 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)';
/** clip-path ảnh reveal khi còn ẩn dưới đáy (gốc trạng thái đầu). */
const CLIP_HIDDEN_BOTTOM = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

interface Props {
  content: SpringsHeroContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsHero({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const isMobile = useContainerMobile(rootRef);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const reveals = Array.isArray(content.revealImages)
    ? content.revealImages.filter(Boolean).slice(0, 3)
    : [];

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      // Mobile: bản gốc tắt parallax (md-up) → không scrub, giữ tĩnh.
      if (root.clientWidth > 0 && root.clientWidth < 768) return;

      const sticky = root.querySelector<HTMLElement>('.springs-hero-sticky');
      const opening = root.querySelector<HTMLElement>('.springs-hero-opening');
      const bgInner = root.querySelector<HTMLElement>('.springs-hero-bg-inner');
      const bgClip = root.querySelector<HTMLElement>('.springs-hero-bg');
      const revealEls = gsap.utils.toArray<HTMLElement>(
        '.springs-hero-reveal',
        root
      );
      const revealImgs = gsap.utils.toArray<HTMLElement>(
        '.springs-hero-reveal-img',
        root
      );
      if (!sticky) return;

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          scroller,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: sticky,
          pinSpacing: false,
          pinType: 'transform',
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // (1) opening mờ dần + trượt lên (gốc --100→--150, sớm nhất).
      if (opening) {
        tl.fromTo(
          opening,
          { autoAlpha: 1, yPercent: 0 },
          { autoAlpha: 0, yPercent: -50, duration: 0.15 },
          0.02
        );
      }

      // (2) ảnh nền thu hẹp về nửa phải + nền trượt lên (gốc --130→--200 &
      //     translateY 0→--450 suốt cả scroll).
      if (bgClip) {
        tl.fromTo(
          bgClip,
          { clipPath: CLIP_FULL },
          { clipPath: CLIP_BG_HALF, duration: 0.25 },
          0.1
        );
      }
      if (bgInner) {
        tl.fromTo(bgInner, { yPercent: 0 }, { yPercent: -40, duration: 1 }, 0);
      }

      // (3) 3 ảnh cột phải reveal TUẦN TỰ: clip trượt lên từ đáy + scale
      //     1.2→1.0 (gốc snap 230/330, mỗi ảnh nối tiếp ảnh trước).
      const REVEAL_START = 0.35;
      const REVEAL_STEP = 0.2;
      revealEls.forEach((el, i) => {
        const at = REVEAL_START + i * REVEAL_STEP;
        tl.fromTo(
          el,
          { clipPath: CLIP_HIDDEN_BOTTOM },
          { clipPath: CLIP_FULL, duration: 0.15 },
          at
        );
        const img = revealImgs[i];
        if (img) {
          tl.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 0.3 }, at);
        }
      });

      // Ảnh load async đổi layout → refresh trigger math.
      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [reveals.length, isMobile]
  );

  // ── Mobile: bản `#about-mobile` + `l-intro__content` gộp tĩnh ───────────
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        style={composeStyle(
          { background: SPRINGS_HERO_BG },
          blockBackgroundStyle(background)
        )}
        className='springs-hero @container relative w-full overflow-hidden'
      >
        <style>{SPRINGS_HERO_FONT_CSS}</style>

        <div className='relative h-[100svh] w-full overflow-hidden'>
          <div
            data-element-key='backgroundImage'
            className={selectableClass(
              activeKey === 'backgroundImage',
              'absolute inset-0 z-0'
            )}
            style={styleOf('backgroundImage')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.backgroundImage}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover object-top'
            />
          </div>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 bottom-0 z-[1]'
            style={{
              height: '60%',
              background:
                'linear-gradient(180deg, rgba(22,45,36,0) 0%, rgba(22,45,36,0.72) 100%)',
            }}
          />
          <div
            className='springs-hero-opening absolute inset-x-0 top-0 z-[2] flex flex-col'
            style={{ padding: 'clamp(20px, 6cqi, 40px)', gap: '16px' }}
          >
            <h1
              data-element-key='title'
              className={selectableClass(activeKey === 'title', '')}
              style={composeStyle(
                {
                  margin: 0,
                  fontFamily: SPRINGS_HERO_FONT_SERIF,
                  fontWeight: 400,
                  fontSize: 'clamp(34px, 11cqi, 56px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.02em',
                  color: SPRINGS_HERO_CREAM,
                  whiteSpace: 'pre-line',
                },
                styleOf('title')
              )}
            >
              {content.title}
            </h1>
            <p
              data-element-key='subtitle'
              className={selectableClass(activeKey === 'subtitle', '')}
              style={composeStyle(
                {
                  margin: 0,
                  maxWidth: '44ch',
                  fontFamily: SPRINGS_HERO_FONT_BODY,
                  fontWeight: 400,
                  fontSize: 'clamp(14px, 4cqi, 17px)',
                  lineHeight: 1.4,
                  color: SPRINGS_HERO_BEIGE,
                },
                styleOf('subtitle')
              )}
            >
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ── Desktop: sticky scroll hero 600vh ───────────────────────────────────
  return (
    <section
      ref={rootRef}
      style={composeStyle(
        { background: SPRINGS_HERO_BG, height: '600vh' },
        blockBackgroundStyle(background)
      )}
      className='springs-hero @container relative w-full'
    >
      <style>{SPRINGS_HERO_FONT_CSS}</style>

      <div className='springs-hero-sticky relative h-[100svh] w-full overflow-hidden'>
        {/* Ảnh nền lớn — thu hẹp bằng clip-path khi cuộn. */}
        <div
          data-element-key='backgroundImage'
          className={selectableClass(
            activeKey === 'backgroundImage',
            'springs-hero-bg absolute inset-0 z-0'
          )}
          style={composeStyle(
            { clipPath: CLIP_FULL },
            styleOf('backgroundImage')
          )}
        >
          <div className='springs-hero-bg-inner h-[130%] w-full'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.backgroundImage}
              alt=''
              aria-hidden='true'
              className='h-full w-full object-cover object-top'
            />
          </div>
        </div>

        {/* Gradient blur xanh — `.l-intro__gradient` gốc. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute z-[1]'
          style={{
            bottom: '-39%',
            left: '5%',
            height: '70vw',
            width: '70vw',
            filter: 'blur(40px)',
            background: `radial-gradient(circle, rgba(${SPRINGS_HERO_BLUE_RGB},0.8) 0%, rgba(${SPRINGS_HERO_BLUE_RGB},0.8) 5%, rgba(${SPRINGS_HERO_BLUE_RGB},0) 70%)`,
          }}
        />

        {/* 3 ảnh cột phải reveal tuần tự — 1 key trên khối bọc. */}
        <div
          data-element-key='revealImages'
          className={selectableClass(
            activeKey === 'revealImages',
            'absolute inset-y-0 right-0 z-[2] w-1/2'
          )}
          style={styleOf('revealImages')}
        >
          {reveals.map((src, i) => (
            <div
              key={`reveal-${i}`}
              className='springs-hero-reveal absolute inset-0 overflow-hidden'
              style={{ zIndex: i + 1, clipPath: CLIP_HIDDEN_BOTTOM }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=''
                aria-hidden='true'
                className='springs-hero-reveal-img h-full w-full object-cover'
              />
            </div>
          ))}
        </div>

        {/* Scrim đáy hỗ trợ đọc chữ. */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-x-0 top-0 z-[3]'
          style={{
            height: '45%',
            background:
              'linear-gradient(180deg, rgba(22,45,36,0.55) 0%, rgba(22,45,36,0) 100%)',
          }}
        />

        {/* Opening: h1 + subtitle, neo top-left (gốc `.l-intro__opening`). */}
        <div
          className='springs-hero-opening absolute inset-x-0 top-0 z-[4] flex flex-col @4xl:flex-row @4xl:items-start @4xl:justify-between'
          style={{
            padding: 'clamp(40px, 6cqi, 96px)',
            gap: 'clamp(20px, 4cqi, 64px)',
          }}
        >
          <h1
            data-element-key='title'
            className={selectableClass(activeKey === 'title', '')}
            style={composeStyle(
              {
                margin: 0,
                maxWidth: 'min(100%, 16ch)',
                fontFamily: SPRINGS_HERO_FONT_SERIF,
                fontWeight: 400,
                fontSize: 'clamp(44px, 6.5cqi, 120px)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                color: SPRINGS_HERO_CREAM,
                whiteSpace: 'pre-line',
              },
              styleOf('title')
            )}
          >
            {content.title}
          </h1>
          <p
            data-element-key='subtitle'
            className={selectableClass(activeKey === 'subtitle', '')}
            style={composeStyle(
              {
                margin: 0,
                maxWidth: 'min(100%, 32ch)',
                fontFamily: SPRINGS_HERO_FONT_BODY,
                fontWeight: 400,
                fontSize: 'clamp(15px, 1.5cqi, 20px)',
                lineHeight: 1.4,
                color: SPRINGS_HERO_BEIGE,
              },
              styleOf('subtitle')
            )}
          >
            {content.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
