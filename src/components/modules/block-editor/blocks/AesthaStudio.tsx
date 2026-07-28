'use client';

/**
 * Aestha Studio — trang "STUDIO" / About (cùng site RAMSA/Aestha với
 * `AesthaExplore`). Port từ `app/dev/ramsa-studio/page.tsx`.
 *
 * Wide (container ≥1200px): full-viewport, không cuộn. Cột trái (wordmark trên ·
 * bio dưới wordmark · team phải-dưới · footer dưới cùng) | ảnh phải cố định
 * ~448px full-height. Cursor-dot bám con trỏ.
 * Narrow (<1200px, tablet + mobile): xếp dọc — wordmark → bio → team 2 cột →
 * ảnh → footer.
 *
 * Motion contract: entrance qua `useBlockMotion` (GSAP) — KHÔNG framer-motion.
 * Hover roll-swap của wordmark đi qua Motion Attribute System (`data-motion`
 * hover-roll-down + `useMotionAttributes`) — 2 driver KHÔNG chồng nhau vì
 * `useBlockMotion` chỉ chạm container `.aestha-studio-content` / `-image`.
 * Canvas edit dàn phẳng 2 nhãn thành 2 dòng; preview / `/p` giữ mask 1 dòng.
 * `min-[1200px]:` viewport media → `useContainerMobile(rootRef, 1200)` (đo
 * container, đúng trong device frame lẫn `/p`). Tokens tuyền inline + styleOf.
 * Ảnh giữ CDN framerusercontent.com theo asset rule của skill.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  AesthaStudioContent,
  AesthaStudioMember,
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
import { useMotionAttributes } from '../motion/useMotionAttributes';
import { AesthaRollLink } from './AesthaRollLink';
import { NAV_CLEARANCE } from './aesthaTokens';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface AesthaStudioProps {
  content: AesthaStudioContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/* ── Tokens (recon: significant-sheet-415363.framer.app/studio) ───────────── */

const FONT =
  "'Switzer', 'Switzer Variable', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const INK = '#0F0F0F';
const MUTED = '#4F4F4F';

const WORDMARK_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(32px, 4.4cqi, 48px)',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.96px',
  color: INK,
  margin: 0,
};

const BIO_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(14px, 1.35cqi, 16px)',
  lineHeight: 1.4,
  color: INK,
  margin: 0,
};

const MEMBER_NAME_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(12px, 1.35cqi, 16px)',
  lineHeight: 1.4,
  color: INK,
};

const MEMBER_ROLE_STYLE: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 'clamp(12px, 1.2cqi, 14px)',
  lineHeight: 1.2,
  color: MUTED,
};

/* Nav đã tách thành block riêng `aestha_nav` (overlay góc trái dưới). */

/**
 * Cursor-dot bám con trỏ có độ trễ mượt. Đặt `absolute` TRONG section wide
 * (`position: relative`) — KHÔNG `fixed`: block root là `@container` nên `fixed`
 * neo theo root, còn `absolute` + toạ độ đo theo rect section thì luôn khớp.
 */
function CursorDot({
  containerRef,
  disabled,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  disabled: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const raf = React.useRef<number>(0);
  const pos = React.useRef({ x: 0, y: 0 });
  const target = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    if (disabled) return;
    const cont = containerRef.current;
    if (!cont) return;

    const onMove = (e: MouseEvent) => {
      const r = cont.getBoundingClientRect();
      target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, [disabled, containerRef]);

  if (disabled) return null;
  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute top-0 left-0 z-[13] h-3.5 w-3.5 rounded-full'
      style={{ backgroundColor: 'rgba(224, 222, 222, 0.8)' }}
    />
  );
}

export function AesthaStudio({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: AesthaStudioProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wideRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();

  const isNarrow = useContainerMobile(rootRef, 1200);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`. Hook default `false`
  // để SSR `/p` render đúng nhánh production ngay (không nháy layout editor).
  const isCanvas = useIsCanvasEdit(rootRef);

  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  /**
   * Chiều cao bám **vùng cuộn thật** (pattern AesthaExplore), KHÔNG `100dvh`:
   * trong dev harness / PreviewMode scroller là element thấp hơn viewport.
   * Wide = full-viewport (height cố định); narrow = tối thiểu 1 màn rồi tự cao
   * theo nội dung (minHeight).
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
  }, [isCanvas, isNarrow]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const team: AesthaStudioMember[] = Array.isArray(content.team)
    ? content.team
    : [];

  /**
   * Entrance on-load (recon: content fade-up delay 0.4s, ảnh fade-up delay
   * 0.2s). Không ScrollTrigger — block 1 viewport (wide) / stack ngắn (narrow).
   * Bezier gốc của Framer không map thẳng sang GSAP → xấp xỉ bằng power ease
   * (đúng tiền lệ AesthaExplore).
   *
   * Delay rút ngắn so với recon (0.2/0.4 → 0.05/0.15): 2 container mang
   * `data-entrance` nên đã ẩn từ frame đầu (xem `public-entrance.css`), delay
   * gốc để trang mới đứng trắng gần nửa giây sau khi View Transition cross-fade
   * xong. Thứ tự ảnh-trước-nội-dung + duration/ease giữ nguyên.
   */
  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root || !hasRoot || isCanvas || reduce) return;

    const contentEl = root.querySelector<HTMLElement>('.aestha-studio-content');
    const imageEl = root.querySelector<HTMLElement>('.aestha-studio-image');

    if (imageEl) {
      gsap.fromTo(
        imageEl,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.05, ease: 'power2.out' }
      );
    }
    if (contentEl) {
      gsap.fromTo(
        contentEl,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.15, ease: 'power1.inOut' }
      );
    }
  }, [isCanvas, hasRoot, reduce, isNarrow]);

  /**
   * Hover roll-swap của wordmark. Deps gồm `isNarrow` (wide/narrow render 2 cây
   * DOM khác nhau) và 2 nhãn (đổi text trên canvas → rebuild timeline).
   */
  useMotionAttributes(rootRef, [
    isNarrow,
    isCanvas,
    content.wordmark,
    content.wordmarkHoverLabel,
  ]);

  /* ── Editable renderers (dùng chung 2 branch) ── */

  const wordmark = (extraClass: string) => (
    <h1
      style={composeStyle(WORDMARK_STYLE, styleOf('wordmark'))}
      className={extraClass}
    >
      <AesthaRollLink
        label={content.wordmark}
        hoverLabel={content.wordmarkHoverLabel}
        href={content.wordmarkHref}
        labelKey='wordmark'
        hoverLabelKey='wordmarkHoverLabel'
        activeKey={activeKey}
        isCanvas={isCanvas}
        styleOf={styleOf}
      />
    </h1>
  );

  const bio = (extraClass: string, extraStyle?: React.CSSProperties) => (
    <p
      data-element-key='bio'
      style={composeStyle(BIO_STYLE, extraStyle, styleOf('bio'))}
      className={selectableClass(activeKey === 'bio', extraClass)}
    >
      {content.bio}
    </p>
  );

  const teamList = (extraClass: string, extraStyle?: React.CSSProperties) => (
    <ul
      className={cn('m-0 grid list-none grid-cols-2 p-0', extraClass)}
      style={extraStyle}
    >
      {team.map((mbr, i) => (
        <li key={i} className='flex flex-col' style={{ rowGap: 2 }}>
          <span
            data-element-key={`team[${i}].name`}
            style={composeStyle(MEMBER_NAME_STYLE, styleOf(`team[${i}].name`))}
            className={selectableClass(activeKey === `team[${i}].name`)}
          >
            {mbr.name}
          </span>
          <span
            data-element-key={`team[${i}].role`}
            style={composeStyle(MEMBER_ROLE_STYLE, styleOf(`team[${i}].role`))}
            className={selectableClass(activeKey === `team[${i}].role`)}
          >
            {mbr.role}
          </span>
        </li>
      ))}
    </ul>
  );

  const imageBox = (wrapClass: string, wrapStyle: React.CSSProperties) => (
    <div
      data-entrance
      className={cn('aestha-studio-image relative overflow-hidden', wrapClass)}
      style={wrapStyle}
    >
      <div
        data-element-key='imageUrl'
        style={composeStyle(
          { position: 'absolute', inset: 0 },
          styleOf('imageUrl')
        )}
        className={selectableClass(activeKey === 'imageUrl')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={content.imageUrl}
          alt={content.imageAlt}
          draggable={false}
          fetchPriority='high'
          className='h-full w-full object-cover select-none'
        />
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(
        blockBackgroundStyle(background),
        isNarrow
          ? { minHeight: portH ? `${portH}px` : '100dvh' }
          : { height: portH ? `${portH}px` : '100dvh' }
      )}
      className={cn(
        '@container relative w-full bg-white text-[#0f0f0f] antialiased',
        className
      )}
    >
      {isNarrow ? (
        /* ── Narrow: xếp dọc. `paddingBottom` chừa chỗ cho block `aestha_nav`
           overlay (nav portal ra ngoài block nên không tự đẩy ảnh lên). ── */
        <section
          className='flex h-full w-full flex-col px-4 pt-4'
          style={{ paddingBottom: `calc(20px + ${NAV_CLEARANCE})` }}
        >
          <div data-entrance className='aestha-studio-content'>
            {wordmark('mb-2')}
            {bio('mb-4')}
            {teamList('mb-5 gap-x-4 gap-y-3')}
          </div>

          {imageBox('w-full', { aspectRatio: '358 / 372' })}
        </section>
      ) : (
        /* ── Wide: full-viewport, cột trái nội dung · ảnh phải ── */
        <section
          ref={wideRef}
          className='relative h-full w-full overflow-hidden'
        >
          <CursorDot containerRef={wideRef} disabled={reduce || isCanvas} />

          <div className='flex h-full w-full items-stretch gap-8 p-8'>
            {/* Cột trái: wordmark · bio · team · footer */}
            <div
              data-entrance
              className='aestha-studio-content relative flex-1'
            >
              {wordmark('absolute top-0 left-0')}

              {/* Canvas dàn phẳng wordmark thành 2 dòng → đẩy bio xuống, nếu
                  không nhãn hover đè lên bio (wordmark ở đây là `absolute`
                  nên không tự đẩy nội dung dưới). */}
              {bio(
                cn('absolute left-0', isCanvas ? 'top-[130px]' : 'top-[77px]'),
                {
                  width: 'min(562px, 46cqi)',
                  textAlign: 'start',
                }
              )}

              {teamList('absolute right-0 bottom-[57px]', {
                gap: 16,
                width: 'min(380px, 32cqi)',
              })}
            </div>

            {/* Cột phải: ảnh portrait cố định ~448px, full-height */}
            {imageBox('h-full shrink-0', {
              width: 'clamp(320px, 31cqi, 448px)',
            })}
          </div>
        </section>
      )}
    </div>
  );
}
