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
  FramerRealEstate02LocationContent,
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
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface Props {
  content: FramerRealEstate02LocationContent;
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
  bg: '#e9e4dc',
  heading: '#565440',
} as const;

/**
 * Parallax quy về `yPercent` — % chiều cao của chính lớp inner, không phải px.
 * Lớp inner lại cao theo % của window (xem `PHOTO*_INNER_STYLE`), nên biên độ
 * luôn tỉ lệ thuận với window ⇒ MỘT bộ số chạy đúng cho cả hai tier, không cần
 * tách key trong `TIER`.
 *
 * Quy đổi từ px gốc (window 178×237) — GIỮ ĐỦ 5 CHỮ SỐ THẬP PHÂN. Làm tròn 2
 * chữ số đổi bề ngang lớp inner ~0.2px, đủ để `objectFit: fill` resample lại
 * ảnh và lệch màu cả khung so với bản gốc (đã đo bằng pixel-diff).
 */
const PHOTO1_PARALLAX_RANGE: [number, number] = [-60.05917, -88.16568];
const PHOTO2_PARALLAX_RANGE: [number, number] = [32.28346, 68.50394];
const PHOTO3_PARALLAX_RANGE: [number, number] = [56.54596, 88.85794];
const PHOTO1_REST_Y = -74.11243; // -250.5/338
const PHOTO2_REST_Y = 50.3937; //   192/381
const PHOTO3_REST_Y = 72.70195; //  261/359

const HEADING_DURATION = 0.95;
const HEADING_EASE = 'power2.inOut';

/**
 * Hai tier layout. `mobile` (<672) giữ nguyên toạ độ Framer gốc 375×585: heading
 * "LOCATION" 72px trượt ngang vào chỗ, 3 ảnh 178×237 xếp collage (1 dưới-trái,
 * 2 chồng dọc bên phải). Không đổi một pixel nào ở nhánh này.
 *
 * `wide` (≥672): card nở tới 1440 theo aspect 1440/720, trải collage dọc thành
 * BẬC THANG ngang — 3 ảnh 30% xếp kín bề ngang (ảnh 1 dính mép trái + đáy,
 * ảnh 2 dính đỉnh, ảnh 3 dính mép phải ở cao độ giữa), heading phóng to đè lên
 * mép trên ảnh 1/ảnh 2.
 *
 * Điểm dễ làm hỏng nhất ở tier này là để ảnh nhỏ và thưa: bản gốc 375 đậm đặc
 * vì ảnh chiếm 47% bề ngang card và chữ 72px tràn qua cả mép phải. Ảnh ~20% +
 * heading khoá width trong một cột riêng cho ra một mặt cream trống trải, mất
 * hẳn chất collage. Vì vậy wide giữ ảnh 30% và heading `width: auto` + nowrap.
 *
 * 3 window wide giữ đúng aspect 178/237 = 0.751 — trùng tỉ lệ file nguồn
 * (712×948) — nên `objectFit: 'fill'` vẫn không kéo méo và không cần key
 * `photoFit` như Quote. Chiều cao để `auto`, thả theo `aspectRatio`.
 *
 * Clamp `N = maxPx / 1440 * 100`.
 */
const TIER = {
  mobile: {
    // 100% — fill frame mobile 390 (không khóa 375 → hở olive 2 mép).
    cardMaxWidth: '100%',
    cardAspect: '375 / 585',
    cardMinHeight: '0px',
    headingLeft: '38px',
    headingTop: '40px',
    headingWidth: '332px',
    headingHeight: '91px',
    headingSize: '72px',
    headingTracking: '-3.66px',
    headingWhiteSpace: 'nowrap',
    headingSlide: 138,
    photo1Left: 'calc(23.733333333333356% - 178px / 2)',
    photo1Right: 'auto',
    photo1Top: '208px',
    photo1Bottom: 'auto',
    photo1Width: '178px',
    photo1Height: '237px',
    photo1Aspect: 'auto',
    photo2Left: 'calc(76.53333333333336% - 178px / 2)',
    photo2Right: 'auto',
    photo2Top: '90px',
    photo2Bottom: 'auto',
    photo2Width: '178px',
    photo2Height: '237px',
    photo2Aspect: 'auto',
    photo3Left: 'calc(76.53333333333336% - 178px / 2)',
    photo3Right: 'auto',
    photo3Top: '347px',
    photo3Bottom: 'auto',
    photo3Width: '178px',
    photo3Height: '237px',
    photo3Aspect: 'auto',
  },
  wide: {
    cardMaxWidth: '1440px',
    cardAspect: '1440 / 720',
    // Sàn để thấp sát đúng aspect ở đầu 672 (50cqi = 336). Sàn cao hơn sẽ kéo
    // card cao hơn aspect và đẻ ra dải cream chết dưới ảnh 2/ảnh 3 ở tablet.
    cardMinHeight: 'clamp(340px, 50cqi, 720px)',
    // % bám mobile (38/375, 40/585) — giữ cùng vị trí tương đối khi card nở.
    headingLeft: '10.13%',
    headingTop: '6.84%',
    // `width: auto` + `nowrap`: để chữ tự do TRÀN qua mép ảnh đúng như bản gốc
    // 375 (ở đó "LOCATION" 72px rộng ~358px trong khung 332px, chạy lố cả mép
    // phải card). Khoá width lại là mất hẳn chất "type đè lên ảnh" của block.
    headingWidth: 'auto',
    headingHeight: 'auto',
    // 19.2cqi = 72/375 — cùng tỉ trọng chữ/card như mobile. 7cqi (~100px max)
    // làm chữ desktop nhỏ lại ~3×, chỉ còn "CATION" đè lên ảnh tối giữa thay vì
    // display type trải ngang cả collage.
    headingSize: 'clamp(72px, 19.2cqi, 276px)',
    // Tracking bám fontSize (= -3.66/72) thay vì px chết như mobile.
    headingTracking: '-0.0508em',
    headingWhiteSpace: 'nowrap',
    // 138/72 ≈ 1.92 — cùng tỉ lệ quãng trượt / fontSize như mobile.
    headingSlide: 529,
    // Ba cột 30% + hai khe 5% ăn trọn bề ngang: ảnh 1 dính mép trái, ảnh 3 dính
    // mép phải, không còn dải cream chết ở hai biên. 30% giữ được tỉ trọng
    // ảnh/card đậm đặc của bản gốc (ảnh 1 chiếm 178/375 = 47% bề ngang card).
    photo1Left: '0%',
    photo1Right: 'auto',
    photo1Top: 'auto',
    photo1Bottom: '0px',
    photo1Width: '30%',
    photo1Height: 'auto',
    photo1Aspect: '178 / 237',
    photo2Left: '35%',
    photo2Right: 'auto',
    photo2Top: '0px',
    photo2Bottom: 'auto',
    photo2Width: '30%',
    photo2Height: 'auto',
    photo2Aspect: '178 / 237',
    photo3Left: 'auto',
    photo3Right: '0px',
    // Bậc giữa: dưới ảnh 2 (dính đỉnh), trên ảnh 1 (dính đáy).
    photo3Top: '10%',
    photo3Bottom: 'auto',
    photo3Width: '30%',
    photo3Height: 'auto',
    photo3Aspect: '178 / 237',
  },
} as const;

const ROOT_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: '#565440',
};

const CARD_STYLE: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: '375px',
  aspectRatio: '375 / 585',
  overflow: 'hidden',
  backgroundColor: COLORS.bg,
  fontFamily: FONT_STACK,
};

const ABSOLUTE_FILL_STYLE: React.CSSProperties = {
  position: 'absolute',
  borderRadius: 'inherit',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const PHOTO_IMAGE_STYLE: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectPosition: 'center',
  objectFit: 'fill',
};

const PHOTO_WINDOW_STYLE: React.CSSProperties = {
  overflow: 'hidden',
  position: 'absolute',
};

/**
 * Ba lớp inner quy hết về % của window thay vì px. Vì window luôn giữ aspect
 * 178/237 ở cả hai tier, cùng một bộ % cho ra đúng hình học gốc ở mobile và
 * scale tuyến tính ở wide — không cần tách key trong `TIER`.
 *
 * Quy đổi (window 178×237): height ÷237, left/right ÷178, top/bottom ÷237.
 * Kiểm chứng photo1: top = H − (−1.27H) − 1.426H = 0.844H → 200px ở H=237,
 * khớp đúng giá trị px cũ.
 */
const PHOTO1_INNER_STYLE: React.CSSProperties = {
  bottom: '-127.00422%', // -301/237
  height: '142.61603%', // 338/237
  left: '-21.34831%', // -38/178
  overflow: 'hidden',
  position: 'absolute',
  right: '-21.34831%',
  willChange: 'transform',
  opacity: 1,
};

const PHOTO2_INNER_STYLE: React.CSSProperties = {
  height: '160.75949%', // 381/237
  left: '-30.33708%', // -54/178
  overflow: 'hidden',
  position: 'absolute',
  right: '-30.33708%',
  top: '-111.39241%', // -264/237
  willChange: 'transform',
  opacity: 1,
};

const PHOTO3_INNER_STYLE: React.CSSProperties = {
  height: '151.47679%', // 359/237
  left: '-25.8427%', // -46/178
  overflow: 'hidden',
  position: 'absolute',
  right: '-25.8427%',
  top: '-135.86498%', // -322/237
  willChange: 'transform',
  opacity: 1,
};

const HEADING_WRAP_STYLE: React.CSSProperties = {
  position: 'absolute',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  willChange: 'transform',
};

const HEADING_TEXT_STYLE: React.CSSProperties = {
  margin: 0,
  fontWeight: 300,
  lineHeight: 1.2696,
  textTransform: 'uppercase',
  color: COLORS.heading,
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function FramerRealEstate02Location({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const photo1Ref = React.useRef<HTMLDivElement>(null);
  const photo2Ref = React.useRef<HTMLDivElement>(null);
  const photo3Ref = React.useRef<HTMLDivElement>(null);
  const headingRef = React.useRef<HTMLDivElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);
  const isMobile = useContainerMobile(rootRef);
  const tier = isMobile ? TIER.mobile : TIER.wide;

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
      const photo1 = photo1Ref.current;
      const photo2 = photo2Ref.current;
      const photo3 = photo3Ref.current;
      const heading = headingRef.current;

      if (reduceMotion) {
        if (photo1) gsap.set(photo1, { yPercent: PHOTO1_REST_Y });
        if (photo2) gsap.set(photo2, { yPercent: PHOTO2_REST_Y });
        if (photo3) gsap.set(photo3, { yPercent: PHOTO3_REST_Y });
        if (heading) gsap.set(heading, { x: 0 });
        return;
      }

      if (photo1 || photo2 || photo3) {
        const applyPhotoParallax = (self: ScrollTrigger) => {
          const p = self.progress;
          if (photo1) {
            gsap.set(photo1, {
              yPercent: gsap.utils.mapRange(0, 1, ...PHOTO1_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
          if (photo2) {
            gsap.set(photo2, {
              yPercent: gsap.utils.mapRange(0, 1, ...PHOTO2_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
          if (photo3) {
            gsap.set(photo3, {
              yPercent: gsap.utils.mapRange(0, 1, ...PHOTO3_PARALLAX_RANGE, p),
              force3D: false,
            });
          }
        };
        const photoTrigger = ScrollTrigger.create({
          trigger: root,
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: applyPhotoParallax,
          onRefresh: applyPhotoParallax,
        });
        applyPhotoParallax(photoTrigger);
      }

      if (heading) {
        // `left` trong CSS đã là vị trí NGHỈ; tween chỉ là quãng vào từ mép
        // trái. Nhờ vậy `headingLeft` được phép là clamp/cqi mà điểm dừng vẫn
        // đúng ở mọi bề ngang — offset px cố định thì không thể.
        gsap.fromTo(
          heading,
          { x: -tier.headingSlide },
          {
            x: 0,
            duration: HEADING_DURATION,
            ease: HEADING_EASE,
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 15%',
              toggleActions: 'play none none reverse',
              invalidateOnRefresh: true,
            },
          }
        );
      }
    },
    [isCanvas, tier]
  );

  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-block='framer-realestate02-location'
        data-canvas-edit='true'
        className={cn('frel-root frel-root--canvas @container', className)}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          fontFamily: FONT_STACK,
          // Nền olive giống production — canvas trắng khó nhìn block boundary.
          backgroundColor: ROOT_STYLE.backgroundColor,
          ...blockBackgroundStyle(background),
        }}
      >
        <div style={{ padding: '24px' }}>
          <p
            data-element-key='heading'
            style={composeStyle(
              {
                ...HEADING_TEXT_STYLE,
                color: 'white',
                position: 'static',
                whiteSpace: 'normal',
                fontSize: 'clamp(28px, 9cqi, 48px)',
                letterSpacing: '-0.0508em',
              },
              styleOf('heading')
            )}
            className={selectableClass(activeKey === 'heading', 'frel-heading')}
          >
            {content.heading}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {(['photo1Url', 'photo2Url', 'photo3Url'] as const).map(key => (
              <div
                key={key}
                data-element-key={key}
                className={selectableClass(activeKey === key)}
                style={composeStyle(
                  {
                    width: '100%',
                    aspectRatio: '178 / 237',
                    overflow: 'hidden',
                    background: '#e8e8ea',
                  },
                  styleOf(key)
                )}
              >
                {content[key] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content[key]}
                    alt=''
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      data-block='framer-realestate02-location'
      style={{ ...ROOT_STYLE, ...blockBackgroundStyle(background) }}
      className={cn('frel-root', className)}
    >
      <div
        style={{
          ...CARD_STYLE,
          maxWidth: tier.cardMaxWidth,
          aspectRatio: tier.cardAspect,
          minHeight: tier.cardMinHeight,
        }}
        className='frel-card @container'
      >
        <div
          style={{
            ...PHOTO_WINDOW_STYLE,
            left: tier.photo1Left,
            right: tier.photo1Right,
            top: tier.photo1Top,
            bottom: tier.photo1Bottom,
            width: tier.photo1Width,
            height: tier.photo1Height,
            aspectRatio: tier.photo1Aspect,
          }}
        >
          <div style={PHOTO1_INNER_STYLE} ref={photo1Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo1Url}
                alt=''
                data-element-key='photo1Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo1Url'))}
                className={selectableClass(activeKey === 'photo1Url')}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            ...PHOTO_WINDOW_STYLE,
            left: tier.photo2Left,
            right: tier.photo2Right,
            top: tier.photo2Top,
            bottom: tier.photo2Bottom,
            width: tier.photo2Width,
            height: tier.photo2Height,
            aspectRatio: tier.photo2Aspect,
          }}
        >
          <div style={PHOTO2_INNER_STYLE} ref={photo2Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo2Url}
                alt=''
                data-element-key='photo2Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo2Url'))}
                className={selectableClass(activeKey === 'photo2Url')}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            ...HEADING_WRAP_STYLE,
            left: tier.headingLeft,
            top: tier.headingTop,
            width: tier.headingWidth,
            height: tier.headingHeight,
          }}
          ref={headingRef}
        >
          <p
            data-element-key='heading'
            style={composeStyle(
              HEADING_TEXT_STYLE,
              {
                fontSize: tier.headingSize,
                letterSpacing: tier.headingTracking,
                whiteSpace: tier.headingWhiteSpace,
              },
              styleOf('heading')
            )}
            className={selectableClass(activeKey === 'heading', 'frel-heading')}
          >
            {content.heading}
          </p>
        </div>

        <div
          style={{
            ...PHOTO_WINDOW_STYLE,
            left: tier.photo3Left,
            right: tier.photo3Right,
            top: tier.photo3Top,
            bottom: tier.photo3Bottom,
            width: tier.photo3Width,
            height: tier.photo3Height,
            aspectRatio: tier.photo3Aspect,
          }}
        >
          <div style={PHOTO3_INNER_STYLE} ref={photo3Ref}>
            <div style={ABSOLUTE_FILL_STYLE}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.photo3Url}
                alt=''
                data-element-key='photo3Url'
                style={composeStyle(PHOTO_IMAGE_STYLE, styleOf('photo3Url'))}
                className={selectableClass(activeKey === 'photo3Url')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
