'use client';

/**
 * Aestha Project — trang chi tiết dự án (cùng site RAMSA/Aestha với
 * `AesthaExplore` / `AesthaStudio` / `AesthaContact`). Port từ `ProjectView`
 * trong `apps/real-estate/src/AesthaDemoPage.tsx`.
 *
 * Wide (container ≥900px): 2 cột — trái sticky (tiêu đề + nhãn "Concept" + đoạn
 * mô tả + nav) · phải stack ảnh cuộn dọc. Sentinel trước ảnh cuối, khi lọt vào
 * vùng cuộn (`atEnd`) thì panel "Concept" crossfade sang panel "dự án tiếp
 * theo". Narrow (<900px): xếp 1 cột, bỏ sticky.
 *
 * ⚠️ Sticky là **CSS `position: sticky` thuần — KHÔNG JS scroll** (pattern
 * `FramerAesthaEditorial`). Crossfade panel dùng CSS opacity theo state `atEnd`
 * (IntersectionObserver), KHÔNG ScrollTrigger/scrub.
 *
 * Editor canvas (`data-testid=active-block-preview`): fork phẳng, KHÔNG sticky,
 * hiện CẢ hai panel để sửa được `nextLabel`/`nextHeading`. PreviewMode / Play /
 * `/p`: layout sticky + crossfade thật.
 *
 * Motion contract: entrance qua `useBlockMotion` (GSAP) — KHÔNG framer-motion.
 * Tokens tuyền inline + styleOf; Tailwind/`<style>` chỉ lo cấu trúc + `@container`.
 */

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  AesthaProjectContent,
  AesthaProjectImage,
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
import { useAesthaLink } from './aesthaLink';
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

interface AesthaProjectProps {
  content: AesthaProjectContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
  /** Called when user clicks back to explore view */
  onBack?: () => void;
  /** Called when user clicks "next project" */
  onNextProject?: () => void;
  /**
   * Ánh xạ key nội bộ (`title`, `body[i]`, `images[i].src`, `navLinks[i].label`…)
   * sang key CMS của block cha khi được nhúng (vd `AesthaExplore` map
   * `body[i]` → `projects[P].detail.body[i]`). Mặc định identity → block
   * `aestha_project` độc lập giữ nguyên hành vi.
   */
  keyFor?: (localKey: string) => string;
}

/* ── Tokens (recon: significant-sheet-415363.framer.app/projects) ─────────── */

const INK = '#1A1A1A';
const MUTED_LABEL = '#555';
const NEXT_IDLE = '#8A8A8A';

const DISPLAY_FONT =
  "'Funnel Display', 'Switzer', 'Switzer Variable', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT = "'DM Mono', ui-monospace, monospace";
const BODY_FONT =
  "'Switzer', 'Switzer Variable', 'Inter', ui-sans-serif, system-ui, sans-serif";

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: 'clamp(40px, 4.4cqi, 48px)',
  fontWeight: 500,
  letterSpacing: '-0.96px',
  lineHeight: 1,
  color: INK,
  margin: 0,
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: MUTED_LABEL,
  margin: 0,
};

const BODY_P_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  fontSize: 14,
  lineHeight: 1.6,
  color: INK,
  margin: '0 0 16px',
};

const NEXT_LINK_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  fontSize: 'clamp(15px, 1.3cqi, 18px)',
  color: NEXT_IDLE,
  textDecoration: 'none',
  cursor: 'pointer',
  marginTop: 4,
  display: 'inline-block',
};

export function AesthaProject({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
  onBack,
  onNextProject,
  keyFor,
}: AesthaProjectProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);
  const { hasRoot } = useLandingMotion();
  const linkProps = useAesthaLink();

  const isNarrow = useContainerMobile(rootRef, 900);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`. Hook default `false`
  // để SSR `/p` render đúng nhánh production ngay.
  const isCanvas = useIsCanvasEdit(rootRef);

  // Ánh xạ key nội bộ → key CMS (identity khi dùng như block độc lập).
  const K = keyFor ?? ((k: string) => k);

  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Cuối stack → đổi panel Concept ↔ "dự án tiếp theo". Chỉ live (KHÔNG canvas).
  const [atEnd, setAtEnd] = React.useState(false);

  /**
   * Chiều cao cột trái sticky bám **vùng cuộn thật**, KHÔNG `100dvh` (pattern
   * FramerAesthaEditorial): trong dev harness / PreviewMode scroller là element
   * thấp hơn viewport. Đo scroller rồi cấp qua `--ap-vh`; fallback `100dvh` SSR.
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

  // Narrow: đo chiều cao header (title) + footer (nút back) sticky để mảng
  // concept căn giữa đúng khoảng trống còn lại của màn đầu
  // (var(--ap-vh) - header - footer).
  //
  // Footer chỉ tồn tại khi block được nhúng trong Explore (`onBack`) — block
  // độc lập không render nó, nên `ft` có thể null và chỉ đo header.
  const [barH, setBarH] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!isNarrow || isCanvas) {
      setBarH(0);
      return;
    }
    const hd = headerRef.current;
    const ft = footerRef.current;
    if (!hd) return;
    const measure = () => setBarH(hd.offsetHeight + (ft?.offsetHeight ?? 0));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hd);
    if (ft) ro.observe(ft);
    return () => ro.disconnect();
  }, [isNarrow, isCanvas, content, onBack]);

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const body: string[] = Array.isArray(content.body) ? content.body : [];
  const images: AesthaProjectImage[] = Array.isArray(content.images)
    ? content.images
    : [];

  /**
   * Sentinel-swap: đặt trước ảnh cuối, khi lọt vào scroller thì `atEnd`.
   * root = scroller element (fallback null = viewport cho `/p`). Chỉ chạy live.
   */
  React.useEffect(() => {
    if (isCanvas) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let el: HTMLElement | null = rootRef.current?.parentElement ?? null;
    while (el) {
      const ov = getComputedStyle(el).overflowY;
      if (ov === 'auto' || ov === 'scroll') break;
      el = el.parentElement;
    }

    const obs = new IntersectionObserver(([e]) => setAtEnd(e.isIntersecting), {
      root: el,
      threshold: 0,
    });
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [isCanvas, hasRoot, isNarrow, images.length]);

  /**
   * Entrance on-load (recon: tiêu đề + body fade-up). Không ScrollTrigger.
   */
  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root || !hasRoot || isCanvas || reduce) return;

    const title = root.querySelector<HTMLElement>('.ap-title');
    const bodyEl = root.querySelector<HTMLElement>('.ap-body');

    if (title) {
      gsap.fromTo(
        title,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }
      );
    }
    if (bodyEl) {
      gsap.fromTo(
        bodyEl,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.15,
          ease: 'power2.out',
        }
      );
    }
  }, [isCanvas, hasRoot, reduce, isNarrow]);

  const panelTransition = reduce
    ? undefined
    : `opacity 0.5s ${EASE}, transform 0.5s ${EASE}`;

  /* ── Editable render helpers (dùng chung canvas + preview) ─────────────── */

  const titleEl = (
    <h1
      data-entrance
      data-element-key={K('title')}
      style={composeStyle(TITLE_STYLE, styleOf(K('title')))}
      className={selectableClass(activeKey === K('title'), 'ap-title')}
    >
      {content.title}
    </h1>
  );

  const conceptInner = (
    <>
      <p
        data-element-key={K('conceptLabel')}
        style={composeStyle(SECTION_LABEL_STYLE, styleOf(K('conceptLabel')))}
        className={selectableClass(
          activeKey === K('conceptLabel'),
          'ap-section-label ap-concept-label'
        )}
      >
        {content.conceptLabel}
      </p>
      <div data-entrance className='ap-body'>
        {body.map((p, i) => {
          const ek = K(`body[${i}]`);
          return (
            <p
              key={i}
              data-element-key={ek}
              style={composeStyle(BODY_P_STYLE, styleOf(ek))}
              className={selectableClass(activeKey === ek)}
            >
              {p}
            </p>
          );
        })}
      </div>
    </>
  );

  const nextInner = (
    <>
      <p
        data-element-key={K('nextHeading')}
        style={composeStyle(SECTION_LABEL_STYLE, styleOf(K('nextHeading')))}
        className={selectableClass(
          activeKey === K('nextHeading'),
          'ap-section-label'
        )}
      >
        {content.nextHeading}
      </p>
      {onNextProject ? (
        <button
          type='button'
          onClick={onNextProject}
          data-element-key={K('nextLabel')}
          style={composeStyle(NEXT_LINK_STYLE, styleOf(K('nextLabel')))}
          className={selectableClass(
            activeKey === K('nextLabel'),
            'ap-next-link cursor-pointer border-none bg-transparent outline-none focus-visible:underline'
          )}
        >
          {content.nextLabel}
        </button>
      ) : (
        <a
          {...linkProps(content.nextHref)}
          data-element-key={K('nextLabel')}
          style={composeStyle(NEXT_LINK_STYLE, styleOf(K('nextLabel')))}
          className={selectableClass(
            activeKey === K('nextLabel'),
            'ap-next-link outline-none focus-visible:underline'
          )}
        >
          {content.nextLabel}
        </a>
      )}
    </>
  );

  /**
   * Chỉ còn nút quay lại — link nav đã tách sang block `aestha_nav` (overlay
   * góc trái dưới). `← Explore` KHÔNG phải link nav: nó là control nội bộ đổi
   * view của `AesthaExplore`, chỉ tồn tại khi block được nhúng (`onBack`).
   *
   * `null` khi dùng như block `aestha_project` độc lập → các nhánh layout bỏ
   * luôn thanh footer thay vì render một dải trống.
   */
  const backEl = onBack ? (
    <nav aria-label='Quay lại' className='flex items-center gap-6'>
      <button
        type='button'
        onClick={onBack}
        style={{
          fontFamily: BODY_FONT,
          fontSize: 12,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: INK,
          textDecoration: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          transition: 'opacity 0.2s ease',
        }}
        className='hover:opacity-70'
        aria-label='Quay lại Explore'
      >
        ← Explore
      </button>
    </nav>
  ) : null;

  const imagesStack = (withSentinel: boolean) => (
    <section className='ap-right'>
      {images.map((img, i) => {
        const ek = K(`images[${i}].src`);
        return (
          <div
            key={i}
            data-element-key={ek}
            style={styleOf(ek)}
            className={selectableClass(activeKey === ek)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className='ap-img'
            />
          </div>
        );
      })}
      {withSentinel && (
        <div ref={sentinelRef} className='ap-sentinel' aria-hidden />
      )}
    </section>
  );

  return (
    <div
      ref={rootRef}
      style={composeStyle(blockBackgroundStyle(background), {
        ['--ap-vh' as string]: portH ? `${portH}px` : '100dvh',
      })}
      className={cn(
        '@container relative w-full bg-white text-[#1a1a1a] antialiased',
        className
      )}
    >
      <style>{`
        .ap-stage {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding: 32px;
          align-items: start;
        }
        .ap-left { display: flex; flex-direction: column; }
        .ap-panels-wrap {
          position: relative;
          flex: 1 1 auto;
          min-height: clamp(80px, 12cqi, 160px);
        }
        .ap-panels-wrap.is-next .ap-panel-body {
          display: none;
        }
        .ap-panels-wrap.is-next .ap-panel-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%) !important;
          left: 0;
          right: 0;
        }
        .ap-title { margin-bottom: clamp(32px, 6cqi, 96px); }
        .ap-section-label { flex: 0 0 auto; }
        .ap-panel {
          flex: 1 1 auto;
          min-height: 0;
        }
        .ap-panel-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-start;
          padding-top: clamp(24px, 4cqi, 48px);
        }
        .ap-panel-next {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 12px;
          flex: 1 1 auto;
          justify-content: flex-start;
        }
        .ap-panel-next .ap-section-label {
          margin: 0;
        }
        .ap-body { max-width: none; }
        .ap-right {
          display: flex;
          flex-direction: column;
          gap: clamp(24px, 3cqi, 48px);
        }
        .ap-img {
          width: 100%;
          height: auto;
          display: block;
          background: #EEE;
          object-fit: cover;
        }
        .ap-sentinel { height: 1px; }

        /* ── Narrow (<900px): title = header fixed top · nav = footer fixed
              bottom (sticky, luôn hiện khi cuộn) · giữa cuộn: concept → ảnh →
              See next project ── */
        .ap-narrow {
          display: flex;
          flex-direction: column;
          min-height: var(--ap-vh, 100dvh);
        }
        .ap-narrow-header {
          position: sticky;
          top: 0;
          z-index: 20;
          background: #fff;
          padding: 24px 24px 16px;
        }
        .ap-narrow-header .ap-title { margin-bottom: 0; }
        /* Mang 1 (concept): can GIUA doc trong khoang trong giua header va footer.
           Dung min-height (khong phai height) nen content dai chi gian ra + cuon,
           KHONG tran de header/footer; content ngan thi can giua. */
        .ap-narrow-intro {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8px 24px;
          box-sizing: border-box;
        }
        .ap-narrow-mid { display: flex; flex-direction: column; gap: 12px; }
        /* Mảng 2: danh sách ảnh (cùng padding ngang với header/footer). */
        .ap-narrow-images { padding: 0 24px; }
        /* Mảng 3: See next project. */
        .ap-narrow-next { padding: clamp(24px, 4cqi, 28px) 24px; }
        .ap-narrow-next .ap-panel-next {
          display: flex;
          align-items: center;
          gap: 50px;
        }
        .ap-narrow-footer {
          position: sticky;
          bottom: 0;
          z-index: 20;
          margin-top: auto;
          background: #fff;
          padding: 16px 24px 24px;
        }

        @container (min-width: 900px) {
          .ap-stage {
            grid-template-columns: minmax(260px, 1fr) 1.2fr;
            gap: 64px;
            padding: 32px;
          }
          .ap-title { margin-bottom: clamp(48px, 8cqi, 96px); }
          .ap-panel-body { flex-direction: row; gap: clamp(24px, 3cqi, 56px); }
          .ap-panel-body .ap-concept-label {
            width: clamp(80px, 12cqi, 140px);
          }
          .ap-body { max-width: 360px; }
          .ap-panel-next { flex-direction: row; gap: clamp(32px, 4.3cqi, 72px); align-items: center; }
        }
      `}</style>

      {isCanvas ? (
        /* ── Editor canvas: phẳng, KHÔNG sticky, hiện cả 2 panel để sửa ── */
        <div className='ap-stage' data-canvas-edit='true'>
          <aside className='ap-left'>
            {titleEl}
            <div className='ap-panels-wrap'>
              <div className='ap-panel ap-panel-body'>{conceptInner}</div>
              <div className='ap-panel ap-panel-next' style={{ marginTop: 32 }}>
                {nextInner}
              </div>
            </div>
            {backEl}
          </aside>
          {imagesStack(false)}
        </div>
      ) : isNarrow ? (
        /* ── Narrow (<900px): title = header fixed top · thanh back = footer
            sticky bottom (chỉ khi nhúng trong Explore). Giữa cuộn: (1) concept
            căn giữa màn đầu · (2) danh sách ảnh · (3) See next project ── */
        <div className='ap-narrow'>
          <div ref={headerRef} className='ap-narrow-header'>
            {titleEl}
          </div>
          <section
            className='ap-narrow-intro'
            style={{ minHeight: `calc(var(--ap-vh, 100dvh) - ${barH}px)` }}
          >
            <div className='ap-narrow-mid'>{conceptInner}</div>
          </section>
          <div className='ap-narrow-images'>{imagesStack(false)}</div>
          <section className='ap-narrow-next'>
            <div className='ap-panel-next'>{nextInner}</div>
          </section>
          {/* Không có `onBack` (block độc lập) → bỏ luôn thanh footer thay vì
              render một dải trắng sticky rỗng. `barH` đo qua `footerRef` nên
              cũng tự về 0. */}
          {backEl && (
            <div ref={footerRef} className='ap-narrow-footer'>
              {backEl}
            </div>
          )}
        </div>
      ) : (
        /* ── Preview / Play / `/p` (wide ≥900px): sticky + crossfade thật ── */
        <div className='ap-stage'>
          <aside
            className='ap-left'
            style={{
              position: isNarrow ? 'static' : 'sticky',
              top: isNarrow ? undefined : 'clamp(24px, 4cqi, 64px)',
              height: isNarrow
                ? 'auto'
                : 'calc(var(--ap-vh, 100dvh) - clamp(48px, 8cqi, 128px))',
            }}
          >
            {titleEl}
            <div className={cn('ap-panels-wrap', atEnd && 'is-next')}>
              <div
                className='ap-panel ap-panel-body'
                style={{
                  opacity: atEnd ? 0 : 1,
                  transform: atEnd ? 'translate3d(0,-12px,0)' : 'none',
                  pointerEvents: atEnd ? 'none' : 'auto',
                  transition: panelTransition,
                }}
              >
                {conceptInner}
              </div>
              <div
                className='ap-panel ap-panel-next'
                style={{
                  opacity: atEnd ? 1 : 0,
                  transform: atEnd ? undefined : 'translate3d(0,12px,0)',
                  pointerEvents: atEnd ? 'auto' : 'none',
                  transition: panelTransition,
                }}
              >
                {nextInner}
              </div>
            </div>
            {backEl}
          </aside>
          {imagesStack(true)}
        </div>
      )}
    </div>
  );
}
