'use client';

/**
 * Block "Heritage - Knockout Video" (port `BrandHeritage` của
 * apps/gambit-delvaux) — giữ NGUYÊN cơ chế + timing gốc:
 *
 *  - Intro: chữ "Since" hiện theo từng ký tự (so le trên/dưới, stagger 0.08),
 *    cả cụm tiêu đề trượt sang trái để nhường chỗ, "1829" + tagline reveal
 *    theo dòng (SplitText mask) tại cùng một mốc;
 *  - Knockout: khối chữ đọc được mờ đi, ĐỒNG THỜI màn phủ SVG (chữ khoét thủng
 *    bằng luminance mask) hiện lên và video fade vào — mắt thấy chữ "đục lỗ"
 *    qua nền video;
 *  - Dissolve: cuộn tiếp, màn phủ dâng lên + tan dần → video full khung.
 *
 * Toàn bộ nằm trên MỘT timeline scrub 2 chiều: cuộn xuống chạy tới, cuộn lên
 * chạy ngược, vào lại từ trên luôn bắt đầu ở progress 0.
 *
 * Khác apps (đúng contract host — apps-port-host):
 *  - `pin: true` → sân khấu DÁN bằng CSS `sticky` (convention host, an toàn
 *    iOS + editor scroller). Track cao (1 + 2.2) khung hình để quãng scrub
 *    đúng bằng `PIN_SCROLL = '+=220%'` của bản gốc;
 *  - `createBlockEntrySnap` (tween `window` scroll + chặn wheel/touch) BỎ —
 *    nó cướp scroll của window nên phá canvas scroller lẫn Lenis trên `/p`;
 *  - `gsap.matchMedia(MOTION_CONDITIONS)` (điều kiện viewport) → `gsap.context`
 *    + kiểm tra `prefers-reduced-motion`; mọi `scrollTrigger` nhận `scroller`;
 *  - `-12vh` (veil dâng) → đo chiều cao sân khấu runtime, vì trong khung device
 *    390/834 thì `vh` là của viewport thật, không phải của khung;
 *  - `md:` / `vw` → `@2xl:` / `cqi` (canvas responsive spec);
 *  - token thiết kế (font, cỡ chữ, màu, letter-spacing) chuyển từ class Tailwind
 *    sang inline base + `styleOf(key)` để toolbar editor override được. Chữ
 *    trong SVG mask dùng CÙNG style object → cross-fade knockout không lệch dù
 *    editor đổi font/cỡ chữ.
 *
 * Canvas editor: fork sang lưới phẳng (video + tagline + Since/1829 hiện cùng
 * lúc, chiều cao auto, không sticky/scrub/veil) — PreviewMode + `/p` giữ
 * production.
 *
 * Font dùng chung cụm Delvaux (`delvauxTheme`) — Genath + Atlas Grotesk đã
 * self-host ở `public/delvaux/font`.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { cn } from '@/lib/cn';

import { isVideoUrl } from '../mediaUrl';
import { useLandingMotion } from '../motion/LandingMotion';
import {
  DELVAUX_FONT_BODY,
  DELVAUX_FONT_HEADING,
  DELVAUX_FONT_CSS,
} from './delvauxTheme';
import { GAMBIT_BRAND_HERITAGE_DEFAULTS } from './_registry/defs/gambitBrandHeritage';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  GambitBrandHeritageContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Props {
  content: GambitBrandHeritageContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
  /** `block.id` — xem `BlockRenderProps.blockId`. */
  blockId?: string;
}

/** Nền gốc của section (`bg-[#F5F5F5]`). */
const HERITAGE_BG = '#f5f5f5';

// ── Timing gốc (apps/gambit-delvaux/app/components/BrandHeritage.tsx) ──
const CHAR_STAGGER = 0.08;
const CHAR_DURATION = 0.7;
const SHIFT_DURATION = 0.85;
const YEAR_DURATION = 0.7;
const LINE_REVEAL_DURATION = 0.65;
const CHAR_Y = '1.1em';
const INTRO_HOLD = 0.15;
const KNOCKOUT_DURATION = 0.35;
const VIDEO_IN_DURATION = 0.45;
const VEIL_DISSOLVE_DURATION = 1.4;
/** Veil dâng 12% chiều cao SÂN KHẤU (gốc `-12vh`). */
const VEIL_RISE_RATIO = 0.12;
/**
 * Quãng scrub gốc = `+=220%` khi pin. Với sticky: track = sân khấu (100) +
 * quãng scrub (220) = 320svh.
 */
const TRACK_SVH = 320;

/** Offset để cụm tiêu đề đứng giữa khi mới có mỗi chữ "Since". */
const getSinceCenterOffset = (titleRow: HTMLElement, year: HTMLElement) => {
  const styles = getComputedStyle(titleRow);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
  return (year.offsetWidth + gap) / 2;
};

export function GambitBrandHeritage({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
  blockId,
}: Props) {
  /**
   * Id của `<mask>` phải duy nhất trong document NHƯNG phải trùng khít giữa
   * HTML SSR và lần render đầu ở client. `React.useId()` KHÔNG thoả: block được
   * nạp qua `next/dynamic` (React.lazy + Suspense), boundary đó làm lệch tree-id
   * giữa server-render và hydrate ⇒ `<mask id>` / `mask="url(#…)"` mismatch
   * (React không vá attribute). `block.id` đọc từ cùng blueprint ở cả hai phía
   * nên ổn định; fallback chỉ chạm tới ở ngữ cảnh client-only (dev/blocks,
   * canvas) — nơi không có hydrate nên không thể mismatch.
   */
  const fallbackUid = React.useId().replace(/:/g, '');
  const maskId = `gambit-heritage-knockout-${blockId ?? fallbackUid}`;

  const rootRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoWrapRef = React.useRef<HTMLDivElement>(null);
  const whiteVeilRef = React.useRef<SVGSVGElement>(null);
  const captionReadRef = React.useRef<HTMLDivElement>(null);
  const titleRowRef = React.useRef<HTMLDivElement>(null);
  const sinceRef = React.useRef<HTMLSpanElement>(null);
  const yearRef = React.useRef<HTMLSpanElement>(null);
  const taglineRef = React.useRef<HTMLParagraphElement>(null);

  const isCanvas = useIsCanvasEdit(rootRef);
  const { scroller, requestRefresh } = useLandingMotion();
  /** Reduced-motion: bỏ scrub → track thu về đúng 1 khung hình. */
  const [reduced, setReduced] = React.useState(false);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const D = GAMBIT_BRAND_HERITAGE_DEFAULTS;
  const videoUrl = content.videoUrl?.trim() || D.videoUrl;
  const tagline = content.tagline?.trim() || D.tagline;
  const since = content.since?.trim() || D.since;
  const year = content.year?.trim() || D.year;

  // ── Style token (tuyền inline — toolbar override được) ────────────────
  const taglineBase: React.CSSProperties = {
    margin: 0,
    fontFamily: DELVAUX_FONT_BODY,
    fontSize: 'clamp(0.75rem, 1.8cqi, 0.95rem)',
    fontWeight: 500,
    lineHeight: 1.375,
    letterSpacing: '0.02em',
    color: '#000000',
  };

  const titleBase: React.CSSProperties = {
    fontFamily: DELVAUX_FONT_HEADING,
    fontSize: 'clamp(3.5rem, 12cqi, 7.5rem)',
    fontWeight: 400,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: '#000000',
  };

  /**
   * Chữ khoét thủng trong mask phải khớp TỪNG TOKEN với khối chữ đọc được —
   * nếu không, lúc cross-fade sẽ thấy chữ "nhảy". Dùng chung base + override
   * của editor; `fill='black'` (attribute) quyết định màu khoét.
   */
  const taglineMaskStyle = composeStyle(
    {
      fontFamily: taglineBase.fontFamily,
      fontSize: taglineBase.fontSize,
      fontWeight: taglineBase.fontWeight,
      letterSpacing: taglineBase.letterSpacing,
    },
    styleOf('tagline')
  );
  const titleMaskStyle = composeStyle(
    {
      fontFamily: titleBase.fontFamily,
      fontSize: titleBase.fontSize,
      fontWeight: titleBase.fontWeight,
      letterSpacing: titleBase.letterSpacing,
    },
    styleOf('since')
  );

  const bgStyle = blockBackgroundStyle(background);
  /** Màu màn phủ phải trùng nền block, kể cả khi editor đổi nền. */
  const surfaceColor =
    typeof bgStyle?.backgroundColor === 'string'
      ? bgStyle.backgroundColor
      : HERITAGE_BG;

  const contentKey = `${tagline}|${since}|${year}`;

  // ── Timeline scrub (chỉ chạy ở PreviewMode + /p) ──────────────────────
  React.useEffect(() => {
    if (isCanvas) return;

    const root = rootRef.current;
    const stage = stageRef.current;
    const videoWrap = videoWrapRef.current;
    const videoEl = videoRef.current;
    const whiteVeilEl = whiteVeilRef.current;
    const captionReadEl = captionReadRef.current;
    const titleRow = titleRowRef.current;
    const sinceEl = sinceRef.current;
    const yearEl = yearRef.current;
    const taglineEl = taglineRef.current;

    if (
      !root ||
      !stage ||
      !videoWrap ||
      !whiteVeilEl ||
      !captionReadEl ||
      !titleRow ||
      !sinceEl ||
      !yearEl ||
      !taglineEl
    ) {
      return;
    }

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    setReduced(reduce);

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    const setupMotion = () => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        const sinceSplit = SplitText.create(sinceEl, {
          type: 'chars',
          mask: 'chars',
        });
        const yearSplit = SplitText.create(yearEl, {
          type: 'chars',
          mask: 'chars',
        });
        const lineSplit = SplitText.create(taglineEl, {
          type: 'lines',
          mask: 'lines',
        });

        const sinceChars = sinceSplit.chars;
        const yearChars = yearSplit.chars;
        const lines = lineSplit.lines;
        const allChars = [...sinceChars, ...yearChars];

        gsap.set(allChars, { display: 'inline-block' });

        const sinceCenterX = getSinceCenterOffset(titleRow, yearEl);
        /** Gốc dùng `-12vh`; trong khung device phải là 12% chiều cao sân khấu. */
        const veilRiseY = () => -(stage.clientHeight * VEIL_RISE_RATIO);

        const ensureVideoPlaying = () => {
          if (videoEl?.paused) void videoEl.play();
        };

        const setInitialState = () => {
          gsap.set(titleRow, { x: sinceCenterX });
          gsap.set(sinceChars, {
            y: (i: number) => (i % 2 === 0 ? `-${CHAR_Y}` : CHAR_Y),
            autoAlpha: 0,
          });
          gsap.set(yearChars, {
            y: (i: number) => (i % 2 === 0 ? `-${CHAR_Y}` : CHAR_Y),
            autoAlpha: 0,
          });
          gsap.set(lines, { yPercent: 110, opacity: 0 });
          gsap.set(captionReadEl, { autoAlpha: 1 });
          gsap.set(whiteVeilEl, { autoAlpha: 0, y: 0 });
          gsap.set(videoWrap, { autoAlpha: 0 });
        };

        const setFinalState = () => {
          gsap.set(titleRow, { x: 0 });
          gsap.set(sinceChars, { y: 0, autoAlpha: 1 });
          gsap.set(yearChars, { y: 0, autoAlpha: 1 });
          gsap.set(lines, { yPercent: 0, opacity: 1 });
          gsap.set(captionReadEl, { autoAlpha: 0 });
          gsap.set(whiteVeilEl, { autoAlpha: 0, y: 0 });
          gsap.set(videoWrap, { autoAlpha: 1 });
        };

        // Video chạy nền liên tục, kể cả khi section ngoài khung nhìn.
        if (videoEl) {
          videoEl.loop = true;
          ensureVideoPlaying();
        }

        if (reduce) {
          setFinalState();
          return;
        }

        setInitialState();

        // MỘT timeline scrub: xuống chạy tới, lên chạy ngược, vào lại từ trên
        // bắt đầu sạch ở progress 0.
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.65,
            invalidateOnRefresh: true,
            onToggle: ensureVideoPlaying,
            onLeaveBack: () => {
              setInitialState();
              ensureVideoPlaying();
            },
          },
        });

        tl.addLabel('blank', 0)
          .to({}, { duration: INTRO_HOLD })
          .to(sinceChars, {
            y: 0,
            autoAlpha: 1,
            duration: CHAR_DURATION,
            stagger: CHAR_STAGGER,
          })
          .addLabel('sinceIn')
          .to(
            titleRow,
            {
              x: 0,
              duration: SHIFT_DURATION,
              ease: 'power2.inOut',
            },
            'sinceIn'
          )
          .addLabel('sinceShift')
          .to(
            yearChars,
            {
              y: 0,
              autoAlpha: 1,
              duration: YEAR_DURATION,
              stagger: CHAR_STAGGER,
            },
            'sinceShift'
          )
          .to(
            lines,
            {
              yPercent: 0,
              opacity: 1,
              duration: LINE_REVEAL_DURATION,
              stagger: { amount: 0.2 },
            },
            'sinceShift'
          )
          .addLabel('typeDone')
          // Knockout: chữ đọc được → màn phủ khoét chữ (tween hết để scrub đảo được).
          .to(captionReadEl, {
            autoAlpha: 0,
            duration: KNOCKOUT_DURATION,
            ease: 'power1.inOut',
          })
          .to(
            whiteVeilEl,
            {
              autoAlpha: 1,
              duration: KNOCKOUT_DURATION,
              ease: 'power1.inOut',
            },
            '<'
          )
          .to(
            videoWrap,
            {
              autoAlpha: 1,
              duration: VIDEO_IN_DURATION,
              ease: 'power1.inOut',
            },
            '<'
          )
          .addLabel('knockout')
          // Cuộn tiếp: ô chữ dâng lên + màn phủ tan → video full khung.
          .to(whiteVeilEl, {
            y: veilRiseY,
            autoAlpha: 0,
            duration: VEIL_DISSOLVE_DURATION,
            ease: 'none',
          });

        // R4: chia dòng/ký tự xong → đo lại quãng scrub.
        requestRefresh();

        return () => {
          sinceSplit.revert();
          yearSplit.revert();
          lineSplit.revert();
        };
      }, root);
    };

    // Font tải xong mới chia chữ — nếu không, SplitText cắt sai vị trí.
    void (document.fonts?.ready ?? Promise.resolve()).then(setupMotion);

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [isCanvas, scroller, requestRefresh, contentKey]);

  const media = isVideoUrl(videoUrl) ? (
    <video
      key={videoUrl}
      ref={videoRef}
      src={videoUrl}
      className='pointer-events-none h-full w-full object-cover'
      autoPlay
      muted
      loop
      playsInline
      preload='auto'
      aria-hidden='true'
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={videoUrl}
      alt=''
      className='pointer-events-none h-full w-full object-cover'
    />
  );

  // ── Editor canvas: lưới phẳng, mọi field hiện cùng lúc ─────────────────
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-canvas-edit='true'
        aria-label='Brand heritage'
        className={cn(
          'gambit-heritage @container relative w-full overflow-hidden',
          className
        )}
        style={composeStyle({ backgroundColor: HERITAGE_BG }, bgStyle)}
      >
        <style>{DELVAUX_FONT_CSS}</style>

        <div
          className='flex flex-col items-center'
          style={{
            gap: 'clamp(20px, 3cqi, 40px)',
            padding: 'clamp(32px, 5cqi, 72px) clamp(20px, 4cqi, 64px)',
          }}
        >
          <div
            data-element-key='videoUrl'
            className={selectableClass(
              activeKey === 'videoUrl',
              'w-full overflow-hidden'
            )}
            style={composeStyle(
              { aspectRatio: '16 / 9', maxHeight: '46svh' },
              styleOf('videoUrl')
            )}
          >
            {media}
          </div>

          <p
            data-element-key='tagline'
            className={selectableClass(activeKey === 'tagline')}
            style={composeStyle(
              {
                ...taglineBase,
                maxWidth: '20rem',
                textAlign: 'center',
              },
              styleOf('tagline')
            )}
          >
            {tagline}
          </p>

          <div className='flex items-baseline gap-[0.35em]'>
            <span
              data-element-key='since'
              className={selectableClass(activeKey === 'since')}
              style={composeStyle(titleBase, styleOf('since'))}
            >
              {since}
            </span>
            <span
              data-element-key='year'
              className={selectableClass(activeKey === 'year')}
              style={composeStyle(titleBase, styleOf('year'))}
            >
              {year}
            </span>
          </div>
        </div>
      </section>
    );
  }

  // ── Production (PreviewMode + /p): sân khấu dán + knockout scrub ───────
  return (
    <section
      ref={rootRef}
      aria-label={`Brand heritage — ${since} ${year}`}
      className={cn('gambit-heritage @container relative w-full', className)}
      style={composeStyle({ backgroundColor: HERITAGE_BG }, bgStyle)}
    >
      <style>{DELVAUX_FONT_CSS}</style>

      <div style={{ height: reduced ? '100svh' : `${TRACK_SVH}svh` }}>
        <div
          ref={stageRef}
          className='sticky top-0 overflow-hidden'
          style={{ height: '100svh' }}
        >
          <div
            ref={videoWrapRef}
            data-element-key='videoUrl'
            className={selectableClass(
              activeKey === 'videoUrl',
              'pointer-events-none absolute inset-0 z-0 h-full w-full'
            )}
            style={composeStyle(
              { position: 'absolute', inset: 0 },
              styleOf('videoUrl')
            )}
          >
            {media}
          </div>

          {/*
            Luminance mask: màn phủ trắng + chữ SVG màu đen = lỗ thủng.
            (`destination-out` bị lược trong vài bản nhúng Chromium, và Tailwind
            trong app này cũng không phát `mix-blend-destination-out`.)
          */}
          <svg
            ref={whiteVeilRef}
            className='pointer-events-none absolute inset-0 z-10 h-full w-full opacity-0'
            aria-hidden='true'
          >
            <defs>
              <mask
                id={maskId}
                maskUnits='userSpaceOnUse'
                x='0'
                y='0'
                width='100%'
                height='100%'
              >
                <rect width='100%' height='100%' fill='white' />
                <text
                  x='50%'
                  y='46%'
                  textAnchor='middle'
                  dominantBaseline='middle'
                  fill='black'
                  style={taglineMaskStyle}
                >
                  {tagline}
                </text>
                <text
                  x='50%'
                  y='54%'
                  textAnchor='middle'
                  dominantBaseline='middle'
                  fill='black'
                  style={titleMaskStyle}
                >
                  {`${since} ${year}`}
                </text>
              </mask>
            </defs>
            <rect
              width='100%'
              height='100%'
              fill={surfaceColor}
              mask={`url(#${maskId})`}
            />
          </svg>

          <div
            ref={captionReadRef}
            className='pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center'
            style={{
              paddingInline: 'clamp(20px, 4cqi, 64px)',
              paddingTop: 'clamp(56px, 8cqi, 96px)',
              paddingBottom: 'clamp(48px, 7cqi, 80px)',
            }}
          >
            <p
              ref={taglineRef}
              data-element-key='tagline'
              className={selectableClass(
                activeKey === 'tagline',
                'max-w-[20rem] @2xl:max-w-none'
              )}
              style={composeStyle(
                { ...taglineBase, marginBottom: 'clamp(16px, 1.8cqi, 20px)' },
                styleOf('tagline')
              )}
            >
              {tagline}
            </p>

            <div
              ref={titleRowRef}
              className='flex items-baseline gap-[0.35em] will-change-transform'
            >
              <span
                ref={sinceRef}
                data-element-key='since'
                className={selectableClass(
                  activeKey === 'since',
                  'overflow-hidden'
                )}
                style={composeStyle(titleBase, styleOf('since'))}
              >
                {since}
              </span>
              <span
                ref={yearRef}
                data-element-key='year'
                className={selectableClass(
                  activeKey === 'year',
                  'overflow-hidden'
                )}
                style={composeStyle(titleBase, styleOf('year'))}
              >
                {year}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
