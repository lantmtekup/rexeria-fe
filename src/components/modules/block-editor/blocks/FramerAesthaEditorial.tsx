'use client';

/**
 * Framer Aestha Editorial — cột brand sticky trái + stack 3 ảnh so le phải.
 *
 * Clone từ `https://significant-sheet-415363.framer.app/`
 * (recon spec: `.claude/skills/framer-recon/scripts/recon-aestha/spec.md`).
 *
 * ⚠️ Hiệu ứng stack là **CSS `position: sticky` thuần — KHÔNG có JS scroll**.
 * Recon đo transform/opacity của cả 3 ảnh ở 11 mốc scroll (0 → 2520):
 * `transform: none`, `opacity: 1` suốt. Không dùng ScrollTrigger/scrub cho stack.
 *
 * Cơ chế: 5 panel anh em cùng `sticky top-0` nhưng **cao khác nhau**
 * (80/90/100dvh + spacer + 100dvh). Panel ngắn ghim xong trước, panel sau trượt
 * đè lên → xếp chồng. Tổng track = 3420px ở 1440×900, khớp scrollHeight thật.
 *
 * Editor canvas (`data-testid=active-block-preview`): layout tĩnh 1 viewport —
 * BlockPreview dùng `transform: scale()` làm gãy sticky (xem AlturaOlympus).
 * PreviewMode / Play / `/p`: full sticky stack.
 *
 * Motion contract R1–R6: entrance qua `useBlockMotion`, stack bằng CSS sticky.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  FramerAesthaEditorialContent,
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
import { useAesthaLink } from './aesthaLink';
import { NAV_CLEARANCE } from './aesthaTokens';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface FramerAesthaEditorialProps {
  content: FramerAesthaEditorialContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/* ── Tokens (recon §5, §6) ─────────────────────────────────────────────── */

const INK = '#0F0F0F';
const MUTED = '#4F4F4F';
const OVERLAY = 'rgba(255, 255, 255, 0.9)';

const FONT =
  "'Switzer Variable', 'Switzer', 'General Sans', 'Inter', sans-serif";

/** Logo giữ nguyên 48px ở MỌI breakpoint (recon §5) — không scale xuống. */
const BRAND_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 48,
  lineHeight: '48px',
  fontWeight: 500,
  letterSpacing: '-0.96px',
  textTransform: 'uppercase',
  color: INK,
  margin: 0,
};

/** 16/22.4px desktop → 14/19.6px ở ≤810 (recon §8). */
const TAGLINE_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(14px, 1.1cqi, 16px)',
  lineHeight: 1.4,
  fontWeight: 400,
  color: MUTED,
  margin: 0,
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  ...TAGLINE_STYLE,
  maxWidth: 440, // recon §4 — bio wrap ở 440px
};

const CTA_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(20px, 3.6cqi, 32px)',
  lineHeight: 1.25,
  fontWeight: 400,
  letterSpacing: 'normal',
  textTransform: 'uppercase',
  color: MUTED,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 16,
};

/**
 * Hình học 3 ảnh, % theo bề rộng cột phải (recon §3 + §8).
 * Desktop đo ở 1440 (section 876px) — mobile đo ở 375 (section 375px).
 * Tỉ lệ KHÔNG giữ nguyên giữa breakpoint: mỗi mức là một crop riêng.
 */
const IMAGES = [
  {
    key: 'image1Url' as const,
    label: 'Ảnh 1',
    ratio: '422 / 540',
    ratioSm: '172 / 260',
    width: '48.2%',
    widthSm: '45.9%',
    left: '0%',
    leftSm: '4.3%',
    top: '32px',
    topSm: '24px',
  },
  {
    key: 'image2Url' as const,
    label: 'Ảnh 2',
    ratio: '568 / 693',
    ratioSm: '295 / 390',
    width: '64.8%',
    widthSm: '78.7%',
    left: '31.5%',
    leftSm: '17.1%',
    top: '83px',
    topSm: '40px',
  },
  {
    key: 'image3Url' as const,
    label: 'Ảnh 3',
    ratio: '458 / 396',
    ratioSm: '262 / 244',
    width: '52.3%',
    widthSm: '69.9%',
    left: '9.1%',
    leftSm: '8.5%',
    top: '52.4%',
    topSm: '46%',
  },
];

const FALLBACK_BG = ['#EEEEEE', '#DDDDDD', '#E5E5E5'];

const SHEET_GAP = 32;

function imageBackground(url: string | undefined, idx: number) {
  return url
    ? {
        backgroundImage: `url("${url.replace(/"/g, '%22')}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: FALLBACK_BG[idx] };
}

export function FramerAesthaEditorial({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: FramerAesthaEditorialProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();
  const linkProps = useAesthaLink();

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`. Hook default `false`
  // để SSR `/p` render đúng nhánh production ngay (không nháy layout editor).
  const isCanvas = useIsCanvasEdit(rootRef);

  /**
   * Chiều cao panel phải bám **vùng cuộn thật**, KHÔNG phải `100dvh`.
   *
   * `dvh` = viewport trình duyệt. Chỉ đúng khi scroller là window (`/p`).
   * Trong dev harness / PreviewMode scroller là một element thấp hơn viewport
   * → panel cao hơn vùng cuộn, panel cuối ghim xong vẫn còn thừa
   * `100dvh − scrollportH` px cuộn vô nghĩa (đo được 28px ở /dev/blocks).
   *
   * Đo scroller rồi cấp qua `--aestha-vh`; fallback `100dvh` cho SSR.
   */
  const [portH, setPortH] = React.useState<number | null>(null);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let el: HTMLElement | null = root.parentElement;
    while (el) {
      const ov = getComputedStyle(el).overflowY;
      if (ov === 'auto' || ov === 'scroll') break;
      el = el.parentElement;
    }

    const measure = () => setPortH(el ? el.clientHeight : window.innerHeight);
    measure();

    if (el) {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isCanvas]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  /**
   * Entrance on-load (recon §7b — CDP capture).
   * Group A logo: 100ms delay / 500ms / cubic-bezier(0.44, 0, 0.56, 1)
   * Group B text : 350–450ms delay / 600ms / cubic-bezier(0.5, 0, 0.88, 0.77)
   * Group C nav  : stagger 50ms / spring (stiffness 200, damping 22 — fit từ
   *                ramp `linear()` 39 stop, KHÔNG đọc trực tiếp được).
   * Stack scroll KHÔNG có animation — xem ghi chú đầu file.
   */
  useBlockMotion(
    rootRef,
    api => {
      const root = rootRef.current;
      if (!root || !hasRoot || isCanvas) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const brand = root.querySelector<HTMLElement>('.aestha__brand');
      const texts = Array.from(
        root.querySelectorAll<HTMLElement>('.aestha__text')
      );
      if (brand) {
        gsap.fromTo(
          brand,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            delay: 0.1,
            duration: 0.5,
            // cubic-bezier(0.44, 0, 0.56, 1) — GSAP core không nhận chuỗi
            // cubic-bezier (cần CustomEase), 'power1.inOut' là xấp xỉ gần nhất.
            ease: 'power1.inOut',
          }
        );
      }
      if (texts.length) {
        gsap.fromTo(
          texts,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            delay: 0.15,
            duration: 0.6,
            stagger: 0.1,
            // cubic-bezier(0.5, 0, 0.88, 0.77) ≈ 'power2.in' (xấp xỉ, xem trên).
            ease: 'power2.in',
          }
        );
      }
      /**
       * CTA "Khám phá thêm" — từng chữ fade in + giải blur.
       * Tổng thời gian ~2s, mỗi chữ blur 10px → 0, opacity 0 → 1.
       * Stagger phân bổ đều cho N chữ; duration mỗi chữ = ~0.6s, ease 'power2.out'.
       * Trigger: ScrollTrigger `start: 'top 85%'` — CTA là panel sticky cuối
       * (cao = 100dvh), nên trigger = chính container chứa các char.
       * Khi user cuộn tới khi TOP của container chạm mốc 85% viewport thì chạy.
       */
      const ctaChars = Array.from(
        root.querySelectorAll<HTMLElement>('.aestha__cta-char')
      );
      if (ctaChars.length) {
        const count = ctaChars.length;
        const total = 1.5;
        const perChar = 0.6;
        const stagger =
          count > 1 ? Math.max(0, (total - perChar) / (count - 1)) : 0;
        // Container chứa CTA chars: ưu tiên phần tử cha sticky (panel cuối),
        // fallback về root nếu không tìm được.
        const ctaContainer =
          ctaChars[0]?.closest<HTMLElement>('.aestha__panel') ?? root;
        gsap.fromTo(
          ctaChars,
          { opacity: 0, filter: 'blur(10px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            duration: perChar,
            stagger,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaContainer,
              scroller: api.scroller,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }
    },
    [isCanvas, hasRoot]
  );

  /* ── Nội dung cột trái (dùng chung canvas + preview) ─────────────────── */

  const leftColumn = (
    <>
      <h1
        data-entrance
        data-element-key='brand'
        style={composeStyle(BRAND_STYLE, styleOf('brand'))}
        className={selectableClass(activeKey === 'brand', 'aestha__brand')}
      >
        {content.brand}
      </h1>

      {/* Gap TRÊN — desktop: khoảng brand→tagline (recon §4, clamp 60–132).
          Mobile: grow để dồn nhóm nội dung xuống giữa (title top / giữa / nav
          bottom). marginTop của tagline dời vào đây để mobile căn giữa sạch. */}
      <div className='aestha__gap aestha__gap--top' aria-hidden />

      <p
        data-entrance
        data-element-key='tagline'
        style={composeStyle(TAGLINE_STYLE, styleOf('tagline'))}
        className={selectableClass(activeKey === 'tagline', 'aestha__text')}
      >
        {content.tagline}
      </p>

      {/* Gap GIỮA — desktop: grow (đẩy desc+nav xuống đáy, recon §4 bio y=637).
          Mobile: khe nhỏ giữ tagline + description dính thành 1 nhóm ở giữa. */}
      <div className='aestha__gap aestha__gap--mid' aria-hidden />

      <p
        data-entrance
        data-element-key='description'
        style={composeStyle(DESCRIPTION_STYLE, styleOf('description'))}
        className={selectableClass(activeKey === 'description', 'aestha__text')}
      >
        {content.description}
      </p>

      {/* Gap DƯỚI — mobile: grow (đẩy nhóm nội dung lên giữa, chừa đáy trống
          cho block `aestha_nav` phủ lên). Desktop: 0. */}
      <div className='aestha__gap aestha__gap--bottom' aria-hidden />
    </>
  );

  const ctaText = content.ctaText ?? '';
  // Tách từng chữ để animate per-letter (giữ khoảng trắng xuống dòng).
  const ctaChars = React.useMemo(
    () => Array.from(ctaText).map((ch, i) => ({ ch, i })),
    [ctaText]
  );

  const cta = (
    <a
      data-element-key='ctaText'
      {...linkProps(content.ctaHref)}
      aria-label={ctaText}
      style={composeStyle(CTA_STYLE, styleOf('ctaText'))}
      className={selectableClass(
        activeKey === 'ctaText',
        'rounded-sm focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:outline-none'
      )}
    >
      <span
        className='aestha__cta-chars inline-flex flex-wrap'
        style={{ display: 'inline-flex', flexWrap: 'wrap' }}
      >
        {ctaChars.map(({ ch, i }) => (
          <span
            key={i}
            className='aestha__cta-char'
            style={{ display: 'inline-block', whiteSpace: 'pre' }}
            aria-hidden
          >
            {ch}
          </span>
        ))}
      </span>
      <svg
        width='40'
        height='16'
        viewBox='0 0 40 16'
        fill='none'
        aria-hidden
        style={{ flexShrink: 0 }}
      >
        <path
          d='M0 8h37M30 1l7 7-7 7'
          stroke={MUTED}
          strokeWidth='1.2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </a>
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(blockBackgroundStyle(background), {
        ['--aestha-vh' as string]: portH ? `${portH}px` : '100dvh',
      })}
      className={cn('@container relative w-full bg-white', className)}
    >
      <style>{`
        .aestha__shell { display: flex; flex-direction: column; gap: 0; }
        /* padding-bottom = 40px gốc + chỗ cho block \`aestha_nav\` overlay
           (nav portal ra ngoài block nên không tự đẩy description lên). */
        .aestha__left {
          display: flex; flex-direction: column;
          padding: 40px 16px calc(40px + ${NAV_CLEARANCE});
          min-height: var(--aestha-vh, 100dvh);
        }
        .aestha__right { position: relative; width: 100%; }

        /* Phân bố dọc cột trái — 3 khe co giãn theo breakpoint.
           Mobile (<810): top & bottom grow, mid nhỏ → title TOP / nhóm nội dung
           GIỮA / nav BOTTOM. Desktop: xem override trong @container. */
        .aestha__gap { flex: 0 0 auto; }
        .aestha__gap--top { flex: 1 1 auto; min-height: 40px; }
        .aestha__gap--mid { flex: 0 0 auto; height: 20px; }
        .aestha__gap--bottom { flex: 1 1 auto; min-height: 40px; }

        /* Tấm phủ trắng CTA. right:3.7% bám mép phải stack ảnh (image2 =
           31.5%+64.8%=96.3%) ở mọi bề rộng. Mobile: top:0 phủ kín tới đỉnh
           (ảnh sáng ở trên không lòi ra trên tấm phủ); desktop giữ 32px (recon
           §6 — để brand/nav cột trái ló ra). Bottom 32px chừa nav ló dưới. */
        .aestha__cta-sheet { inset: 0 3.7% ${SHEET_GAP}px 0; }
        .aestha__panel {
          position: sticky; top: 0; z-index: 1;
          overflow: hidden;
        }
        .aestha__img { position: absolute; overflow: hidden; }
        /* Spacer: 64px mobile → 90px desktop (recon §3) — giá trị tuyệt đối,
           KHÔNG dùng cqi vì cqi tính theo container gốc, không phải cột phải. */
        .aestha__spacer { height: 64px; }
        /* Lead spacer chỉ dùng ở overlay mobile (mặc định ẩn). */
        .aestha__lead-spacer { display: none; }

        /* ── Overlay tablet/mobile (<810): cột ảnh phải absolute CHỒNG lên
           cột trái ─────────────────────────────────────────────────────────
           Base mobile hiện là flex-column (trái xong tới phải). Ở đây đổi
           preview shell thành grid 1 ô: trái + phải cùng grid-area → xếp lớp.
           Trái sticky top:0 làm NỀN ghim suốt (ô cao = chiều cao cột phải),
           phải z-index trên + pointer-events:none để nav/CTA cột trái vẫn
           bấm được. Lead-spacer 1 viewport đẩy panel ảnh đầu xuống dưới màn
           hình đầu → màn 1 chỉ hiện brand/text (khớp recon screenshot 1). */
        .aestha__shell--overlay {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
        .aestha__shell--overlay > .aestha__left {
          grid-area: 1 / 1;
          z-index: 0;
          min-height: 0;
          height: var(--aestha-vh, 100dvh);
          position: sticky; top: 0;
        }
        .aestha__shell--overlay > .aestha__right {
          grid-area: 1 / 1;
          z-index: 1;
          pointer-events: none;
        }
        .aestha__shell--overlay > .aestha__right a { pointer-events: auto; }
        .aestha__shell--overlay .aestha__lead-spacer {
          display: block;
          height: var(--aestha-vh, 100dvh);
        }
        /* CTA chars: mặc định ẩn + blur, GSAP sẽ animate thành visible.
           Canvas editor KHÔNG chạy motion → reset về visible để user thấy text. */
        .aestha__cta-char {
          opacity: 0;
          filter: blur(10px);
          will-change: opacity, filter;
        }
        [data-testid="active-block-preview"] .aestha__cta-char {
          opacity: 1;
          filter: none;
        }

        /* Framer breakpoint thật là 810 (không phải 768) — recon §8 */
        @container (min-width: 810px) {
          .aestha__shell { flex-direction: row; gap: 32px; }
          .aestha__left {
            flex: 0 0 36.94%;      /* 532 / 1440 */
            padding: 32px 0 calc(32px + ${NAV_CLEARANCE}) 32px;
            position: sticky; top: 0;
            height: var(--aestha-vh, 100dvh); min-height: 0;
          }
          .aestha__right { flex: 1 1 auto; }
          .aestha__spacer { height: 90px; }

          /* Desktop: khôi phục bố cục recon — brand+tagline TRÊN, desc+nav DƯỚI.
             top = khoảng brand→tagline cố định; mid grow đẩy desc xuống đáy. */
          .aestha__gap--top {
            flex: 0 0 auto; min-height: 0;
            height: clamp(60px, 11cqi, 132px);
          }
          .aestha__gap--mid {
            flex: 1 1 auto; height: auto; min-height: 24px;
          }
          .aestha__gap--bottom { flex: 0 0 auto; min-height: 0; height: 0; }

          /* Desktop: tấm phủ CTA chừa 32px trên (brand cột trái ló ra). */
          .aestha__cta-sheet { inset: ${SHEET_GAP}px 3.7% ${SHEET_GAP}px 0; }

          /* Desktop: overlay shell trở lại flex row (bỏ xếp lớp mobile).
             Selector --overlay có specificity cao hơn nên phải override tường
             minh, nếu không rule mobile sẽ đè cả ở desktop. */
          .aestha__shell--overlay {
            display: flex;
            flex-direction: row;
            gap: 32px;
          }
          .aestha__shell--overlay > .aestha__left {
            grid-area: auto;
            z-index: auto;
            flex: 0 0 36.94%;
            padding: 32px 0 calc(32px + ${NAV_CLEARANCE}) 32px;
            height: var(--aestha-vh, 100dvh);
            min-height: 0;
            position: sticky; top: 0;
          }
          .aestha__shell--overlay > .aestha__right {
            grid-area: auto;
            z-index: auto;
            flex: 1 1 auto;
            pointer-events: auto;
          }
          .aestha__shell--overlay .aestha__lead-spacer { display: none; }
        }
      `}</style>

      {isCanvas ? (
        /* ── Editor canvas: tĩnh, 1 viewport, mọi element vẫn edit được ── */
        <div className='aestha__shell' style={{ padding: 24 }}>
          <div
            className='aestha__left'
            style={{ padding: 0, minHeight: 0, flex: '0 0 34%' }}
          >
            {leftColumn}
          </div>

          <div
            style={{
              flex: '1 1 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              alignContent: 'start',
            }}
          >
            {IMAGES.map((img, i) => (
              <div
                key={img.key}
                data-element-key={img.key}
                style={composeStyle(
                  imageBackground(content[img.key], i),
                  { aspectRatio: img.ratio, overflow: 'hidden' },
                  styleOf(img.key)
                )}
                className={selectableClass(activeKey === img.key, 'relative')}
              >
                <span className='pointer-events-none absolute top-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-white uppercase'>
                  {img.label}
                </span>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>{cta}</div>
          </div>
        </div>
      ) : (
        /* ── Preview / Play / `/p`: sticky stack thật ── */
        <div className='aestha__shell aestha__shell--overlay'>
          <div className='aestha__left'>{leftColumn}</div>

          <div className='aestha__right'>
            {/* Overlay mobile: đẩy panel ảnh xuống dưới màn hình đầu để màn 1
                chỉ hiện cột trái. Desktop: display:none (không ảnh hưởng). */}
            <div className='aestha__lead-spacer' aria-hidden />

            {/* Panel 1–3: 80 / 90 / 100dvh — cao khác nhau chính là hiệu ứng */}
            {IMAGES.map((img, i) => (
              <div
                key={img.key}
                className='aestha__panel'
                style={{
                  height: `calc(var(--aestha-vh, 100dvh) * ${[0.8, 0.9, 1][i]})`,
                }}
              >
                <div
                  data-element-key={img.key}
                  style={composeStyle(
                    imageBackground(content[img.key], i),
                    {
                      position: 'absolute',
                      overflow: 'hidden',
                    },
                    styleOf(img.key)
                  )}
                  className={cn(
                    'aestha__img',
                    `aestha__img--${i + 1}`,
                    selectableClass(activeKey === img.key)
                  )}
                />
              </div>
            ))}

            {/* Spacer — 90px desktop / 64px mobile (recon §3) */}
            <div className='aestha__panel aestha__spacer' aria-hidden />

            {/* Panel 5 — tấm phủ trắng 0.9 + CTA (recon §6) */}
            <div
              className='aestha__panel'
              style={{ height: 'var(--aestha-vh, 100dvh)' }}
            >
              <div
                className='aestha__cta-sheet'
                style={{
                  position: 'absolute',
                  background: OVERLAY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                }}
              >
                {cta}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hình học ảnh — tách riêng để giữ inline style cho canvas edit */}
      {!isCanvas && (
        <style>{`
          ${IMAGES.map(
            (img, i) => `
          .aestha__img--${i + 1} {
            width: ${img.widthSm};
            left: ${img.leftSm};
            top: ${img.topSm};
            aspect-ratio: ${img.ratioSm};
          }`
          ).join('')}

          @container (min-width: 810px) {
            ${IMAGES.map(
              (img, i) => `
            .aestha__img--${i + 1} {
              width: ${img.width};
              left: ${img.left};
              ${
                // Ảnh 3 nằm trong panel 100vh — ảnh duy nhất chạm đáy viewport,
                // và là ảnh duy nhất lộ ra ở dải ${SHEET_GAP}px đáy mà tấm phủ
                // CTA không che. Neo ĐÁY thay vì đặt top: cao ảnh = width ×
                // aspect nên phụ thuộc bề rộng cột phải, không thể quy ra px cố
                // định (mọi bề rộng ≠ 876 sẽ lệch → ảnh thò xuống dải đáy).
                // Ở mốc recon 1440×900: top 52.4% ⇒ đáy cách đáy panel đúng
                // ${SHEET_GAP}px, nên neo đáy tái lập chính xác bố cục recon.
                // Ảnh 1/2 bị panel 80/90vh của chúng clip trước dải đáy nên giữ
                // top theo recon.
                i === 2
                  ? `top: auto; bottom: ${SHEET_GAP}px;`
                  : `top: ${img.top};`
              }
              aspect-ratio: ${img.ratio};
            }`
            ).join('')}
          }
        `}</style>
      )}
    </div>
  );
}
