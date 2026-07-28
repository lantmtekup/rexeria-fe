'use client';

/**
 * Block "Springs - Map" — port đầy đủ section `.l-map` / `#l-map-sticky` của
 * springs-estate-clone: STICKY PIN 220vh (gốc `clip-path:polygon(0 100vh,
 * 100% 100vh,100% 100%,0 100%); height:220vh; margin-top:-200vh`) — ảnh nền
 * bản đồ "trồi lên" phủ kín màn hình như tấm màn kéo (curtain reveal), tiếp
 * tục zoom nhẹ (`data-parallax` scale 1→1.15) sau khi đã hiện trọn, rồi
 * caption (gốc `.l-map-caption{margin-top:120vh}` — nằm dưới màn hình ban
 * đầu) trồi lên xuất hiện muộn ở nửa sau. Port sang GSAP ScrollTrigger
 * pin+scrub (cùng khuôn mẫu `SpringsHero.tsx`), không copy Locomotive Scroll.
 *
 * ⚠ Giống mọi scroll-block trong repo: scrub chỉ chạy đầy đủ trên trang
 * publish `/p` (có scroll thật). Trong editor canvas không có scroll → hiển
 * thị FRAME ĐẦU (ảnh ẩn dưới đáy) — đúng trạng thái ban đầu, không phải lỗi.
 *
 * Copy gốc (`.l-map-caption__text h3`): "Easy access to Nature Park.
 * Landscapes of watercolor tenderness that belong only to you." — tách làm 2
 * (heading câu đầu, description câu sau) cho khớp interface `heading` +
 * `description`.
 *
 * Font thật của bản gốc (self-host tại springs.estate/assets/fonts):
 *   - "Victor Serif" (heading, VictorSerif-40Regular.woff2)
 *   - "TT Commons Pro" (description, TT_Commons_Pro_Regular.woff2 400 +
 *     TTCommonsPro-Md.woff2 500)
 * Nạp qua @font-face trỏ thẳng CDN gốc (không self-host lại) — khai báo lặp
 * giữa các block Springs vô hại, trình duyệt chỉ tải 1 lần.
 *
 * Mobile (`useContainerMobile`): bản gốc `.l-map` có `is-hidden--md-down` —
 * tắt hẳn trên mobile. Ở đây GIỮ hiển thị (tĩnh, không pin) để nội dung
 * không biến mất trên mobile — khác biệt có chủ đích so với gốc.
 */
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  SpringsMapContent,
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

/** clip-path đầy đủ (ảnh hiện trọn) — cùng quy ước `SpringsHero.tsx`. */
const MAP_CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
/** clip-path ảnh còn ẩn dưới đáy (trạng thái đầu, gốc `0 100vh` curtain). */
const MAP_CLIP_HIDDEN_BOTTOM =
  'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

/** Serif dùng cho heading — bản gốc: Victor Serif. */
const SPRINGS_MAP_FONT_HEADING =
  "'Victor Serif', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

/** Sans dùng cho description — bản gốc: TT Commons Pro. */
const SPRINGS_MAP_FONT_BODY =
  "'TT Commons Pro', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const SPRINGS_MAP_FONT_CSS = `
@font-face { font-family: 'Victor Serif'; src: url('https://springs.estate/assets/fonts/VictorSerif-40Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TT_Commons_Pro_Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'TT Commons Pro'; src: url('https://springs.estate/assets/fonts/TTCommonsPro-Md.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;

interface Props {
  content: SpringsMapContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function SpringsMap({
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

  useBlockMotion(
    rootRef,
    ({ scroller, requestRefresh }) => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      if (root.clientWidth > 0 && root.clientWidth < 768) return;

      const sticky = root.querySelector<HTMLElement>('.springs-map-sticky');
      const image = root.querySelector<HTMLElement>('.springs-map-image');
      const imageInner = root.querySelector<HTMLElement>(
        '.springs-map-image-inner'
      );
      const copy = root.querySelector<HTMLElement>('.springs-map-copy');
      const hint = root.querySelector<HTMLElement>('.springs-map-hint');
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

      // (1) Ảnh bản đồ "trồi lên" phủ màn hình — curtain reveal clip-path
      //     (gốc `clip-path:polygon(0 100vh,...)`).
      if (image) {
        tl.fromTo(
          image,
          { clipPath: MAP_CLIP_HIDDEN_BOTTOM },
          { clipPath: MAP_CLIP_FULL, duration: 0.4 },
          0
        );
      }
      // Ảnh tiếp tục zoom nhẹ suốt scroll (gốc scale 1→1.15→1.2).
      if (imageInner) {
        tl.fromTo(imageInner, { scale: 1 }, { scale: 1.18, duration: 1 }, 0);
      }

      // (2) Caption trồi lên xuất hiện muộn (gốc `margin-top:120vh` — dưới
      //     màn hình ban đầu, chỉ lộ ra ở nửa sau khi cuộn).
      if (copy) {
        tl.fromTo(
          copy,
          { autoAlpha: 0, yPercent: 30 },
          { autoAlpha: 1, yPercent: 0, duration: 0.35 },
          0.5
        );
      }
      if (hint) {
        tl.fromTo(
          hint,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.15 },
          0.8
        );
      }

      root.querySelectorAll('img').forEach(img => {
        if (!(img as HTMLImageElement).complete) {
          img.addEventListener('load', requestRefresh, { once: true });
        }
      });
    },
    [isMobile]
  );

  const copy = (
    <div style={{ maxWidth: 'clamp(280px, 42cqi, 620px)' }}>
      {content.heading ? (
        <h3
          data-element-key='heading'
          className={selectableClass(activeKey === 'heading')}
          style={composeStyle(
            {
              margin: 0,
              fontFamily: SPRINGS_MAP_FONT_HEADING,
              fontWeight: 400,
              fontSize: 'clamp(22px, 3.2cqi, 34px)',
              lineHeight: 1.25,
              color: '#f5f4ef',
            },
            styleOf('heading')
          )}
        >
          {content.heading}
        </h3>
      ) : null}

      {content.description ? (
        <p
          data-element-key='description'
          className={selectableClass(activeKey === 'description')}
          style={composeStyle(
            {
              marginTop: 'clamp(10px, 1.6cqi, 18px)',
              fontFamily: SPRINGS_MAP_FONT_BODY,
              fontSize: 'clamp(13px, 1.4cqi, 16px)',
              lineHeight: 1.5,
              color: 'rgba(245,244,239,0.78)',
            },
            styleOf('description')
          )}
        >
          {content.description}
        </p>
      ) : null}
    </div>
  );

  const hint = (
    <div
      className='springs-map-hint mt-[clamp(20px,3cqi,40px)] flex items-center'
      style={{ gap: 'clamp(6px, 1cqi, 10px)', color: '#f5e8d1' }}
    >
      <span
        aria-hidden='true'
        style={{
          display: 'inline-flex',
          width: 'clamp(26px, 2.2cqi, 32px)',
          height: 'clamp(13px, 1.1cqi, 16px)',
        }}
      >
        <svg viewBox='0 0 30 15' width='100%' height='100%'>
          <rect width='30' height='15' rx='7.5' fill='#162D24' />
          <path
            d='M8.429 4 5 6.857v.571m3.429 3.429L5 8v-.572m0 0h10M21.571 4 25 6.857v.571m-3.429 3.429L25 8v-.572m0 0H15'
            stroke='#F5E8D1'
            strokeWidth={1.5}
            fill='none'
          />
        </svg>
      </span>
      <span
        style={{
          fontFamily: SPRINGS_MAP_FONT_BODY,
          fontSize: 'clamp(10px, 0.95cqi, 12px)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Scroll
      </span>
    </div>
  );

  // ── Mobile: gốc ẩn hẳn (`is-hidden--md-down`) — ở đây giữ tĩnh, không pin. ─
  if (isMobile) {
    return (
      <section
        ref={rootRef}
        className='springs-map @container relative w-full overflow-hidden'
        style={composeStyle(
          { minHeight: 'clamp(480px, 100cqi, 640px)', background: '#132018' },
          blockBackgroundStyle(background)
        )}
      >
        <style>{SPRINGS_MAP_FONT_CSS}</style>
        {content.mapImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            data-element-key='mapImage'
            src={content.mapImage}
            alt=''
            aria-hidden='true'
            className={selectableClass(
              activeKey === 'mapImage',
              'absolute inset-0 h-full w-full'
            )}
            style={composeStyle(
              { objectFit: 'cover', objectPosition: 'center' },
              styleOf('mapImage')
            )}
          />
        ) : null}
        <div
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'linear-gradient(0deg, rgba(10,20,15,0.65) 0%, rgba(10,20,15,0.15) 42%, rgba(10,20,15,0) 68%)',
          }}
        />
        <div
          className='relative z-[1]'
          style={{
            padding: 'clamp(24px, 6cqi, 40px)',
            paddingTop: 'clamp(220px, 60cqi, 400px)',
          }}
        >
          {copy}
          {hint}
        </div>
      </section>
    );
  }

  // ── Desktop: sticky pin 220vh, curtain reveal + late caption. ───────────
  return (
    <section
      ref={rootRef}
      className='springs-map @container relative w-full'
      style={composeStyle(
        { height: '220vh', background: '#132018' },
        blockBackgroundStyle(background)
      )}
    >
      <style>{SPRINGS_MAP_FONT_CSS}</style>

      <div className='springs-map-sticky relative h-[100svh] w-full overflow-hidden'>
        {content.mapImage ? (
          <div
            data-element-key='mapImage'
            className={selectableClass(
              activeKey === 'mapImage',
              'springs-map-image absolute inset-0 z-0'
            )}
            style={composeStyle(
              { clipPath: MAP_CLIP_HIDDEN_BOTTOM },
              styleOf('mapImage')
            )}
          >
            <div className='springs-map-image-inner h-full w-full'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.mapImage}
                alt=''
                aria-hidden='true'
                className='h-full w-full object-cover object-center'
              />
            </div>
          </div>
        ) : null}

        {/* Dark gradient overlay — giữ chữ đọc được trên nền ảnh bản đồ. */}
        <div
          className='pointer-events-none absolute inset-0 z-[1]'
          style={{
            background:
              'linear-gradient(0deg, rgba(10,20,15,0.65) 0%, rgba(10,20,15,0.15) 42%, rgba(10,20,15,0) 68%)',
          }}
        />

        {/* Heading + description — góc dưới trái, như bản gốc `.l-map-caption__text`. */}
        <div
          className='springs-map-copy absolute inset-x-0 bottom-0 z-[2]'
          style={{
            padding: 'clamp(24px, 6cqi, 80px)',
            paddingTop: 'clamp(48px, 10cqi, 140px)',
          }}
        >
          {copy}
          {hint}
        </div>
      </div>
    </section>
  );
}
