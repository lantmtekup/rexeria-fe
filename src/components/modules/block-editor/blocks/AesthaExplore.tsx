'use client';

/**
 * Aestha Explore — trang index "EXPLORE" (cùng site RAMSA/Aestha với
 * `FramerAesthaEditorial`). Clone từ `app/dev/nami-explore/page.tsx`.
 *
 * Wide (container ≥1100px): full-viewport hover-swap. Hover tên dự án ở menu
 * phải → crossfade ảnh featured; mặc định (không hover) hiện project[0].
 * Cursor-dot theo con trỏ. KHÔNG cuộn trang.
 * Narrow (<1100px, tablet + mobile): 1 dự án/màn, vuốt trái/phải để duyệt.
 *
 * Motion contract: entrance qua `useBlockMotion` (GSAP), crossfade bằng CSS
 * opacity, vuốt mobile bằng pointer thuần — KHÔNG dùng framer-motion.
 * `min-[1100px]:` viewport media → `useContainerMobile(rootRef, 1100)` (đo
 * container, đúng trong device frame lẫn `/p`). Tokens tuyền inline + styleOf.
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  AesthaExploreContent,
  AesthaExploreFooterLink,
  AesthaExploreProject,
  AesthaProjectContent,
  AesthaProjectNavLink,
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

// Shared tokens
import {
  BODY_FONT,
  DISPLAY_FONT,
  EASE_CROSSFADE,
  FOOTER_CURRENT,
  FOOTER_LINK_STYLE,
  HEADING_STYLE,
  INK_DARK,
  MENU_IDLE,
  MENU_LINK_STYLE,
} from './aesthaTokens';

// Lazy-load AesthaProject to avoid circular deps
const AesthaProject = dynamic(() =>
  import('./AesthaProject').then(m => m.AesthaProject)
);

/* ── View types ─────────────────────────────────────────────────── */
type ExploreView = 'explore' | 'project' | 'content-preview';

interface AesthaExploreProps {
  content: AesthaExploreContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/* ── Tokens (recon: significant-sheet-415363.framer.app/projects) ─────────── */

const CROSSFADE: React.CSSProperties = {
  transition: `opacity 250ms 150ms ${EASE_CROSSFADE}`,
};

const MENU_IMG_FALLBACK =
  'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578';

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

/* ── Mũi tên ↗ (thẻ mobile) ──────────────────────────────────────────────── */
function ArrowUpRight() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 16 16'
      fill='none'
      stroke='#4F4F4F'
      strokeWidth='1.4'
      aria-hidden='true'
    >
      <path
        d='M4 12L12 4M6 4h6v6'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/* ── Build AesthaProjectContent from AesthaExploreProject ─────────────── */

/**
 * Build AesthaProjectContent from an explore project + surrounding context.
 * Converts AesthaExploreProject to AesthaProjectContent for rendering.
 * Content comes from detail field. If detail is not provided, generates placeholders.
 */
function buildProjectContent(
  project: AesthaExploreProject,
  projectIndex: number,
  allProjects: AesthaExploreProject[],
  footerLinks: AesthaExploreFooterLink[]
): AesthaProjectContent {
  // Use detail from content if available
  const detail = project.detail;
  const body = detail?.body ?? [
    'Khám phá dự án ' +
      project.label +
      ' — kiến trúc đương đại kết hợp vật liệu cao cấp.',
    'Thiết kế tinh tế, công năng tối ưu cho một không gian sống hoàn hảo.',
    'Liên hệ đội ngũ tư vấn để biết thêm chi tiết.',
  ];

  // Build nav links from footer links
  const navLinks: AesthaProjectNavLink[] = footerLinks.map(link => ({
    label: link.label,
    href: link.href,
  }));

  // Build next project info
  const nextIndex = (projectIndex + 1) % allProjects.length;
  const nextProject = allProjects[nextIndex];

  // Build images: use detail.images if available, otherwise generate placeholders
  const images = detail?.images ?? [
    { src: project.img, alt: project.alt },
    ...generatePlaceholderImages(project.label, projectIndex),
  ];

  return {
    title: project.label.toUpperCase(),
    conceptLabel: 'Concept',
    body,
    images,
    nextHeading: 'Dự án tiếp theo',
    nextLabel: nextProject.label,
    nextHref: nextProject.href || '#',
    navLinks,
  };
}

/**
 * Generate placeholder images for a project based on label.
 */
function generatePlaceholderImages(
  label: string,
  index: number
): Array<{ src: string; alt: string }> {
  // Fallback images that work across projects
  const fallbacks = [
    'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
    'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
    'https://framerusercontent.com/images/gx0JUIPtvSo4eMJgRkMoqx2HPc.jpg?width=2364&height=1576',
    'https://framerusercontent.com/images/FeVrkEA94CrUpaD629BKz29Pbs.jpg?width=2364&height=1280',
  ];

  return fallbacks
    .slice(index % 2 === 0 ? 0 : 2, (index % 2 === 0 ? 0 : 2) + 2)
    .map((src, i) => ({
      src,
      alt: `${label} image ${i + 2}`,
    }));
}

export function AesthaExplore({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: AesthaExploreProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wideRef = React.useRef<HTMLElement>(null);
  const { hasRoot } = useLandingMotion();

  const isNarrow = useContainerMobile(rootRef, 1100);

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`.
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

  const [reduce, setReduce] = React.useState(false);
  React.useLayoutEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // View state: 'explore' menu vs 'project' detail
  const [view, setView] = React.useState<ExploreView>('explore');
  const [activeProjectIdx, setActiveProjectIdx] = React.useState<number>(0);

  // Force explore view in canvas mode
  React.useEffect(() => {
    if (isCanvas && view !== 'explore') {
      setView('explore');
    }
  }, [isCanvas]);

  // Scroll to top on view change (only in preview/play, not canvas)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isCanvas) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [view, isCanvas]);

  // Effective view: always 'explore' in canvas mode
  const effectiveView = isCanvas ? 'explore' : view;

  /**
   * Chiều cao bám **vùng cuộn thật**, KHÔNG phải `100dvh` (pattern AesthaEditorial).
   * `dvh` = viewport trình duyệt; trong dev harness / PreviewMode scroller là một
   * element thấp hơn viewport → block cao hơn vùng cuộn → dư ra scroll dọc vô nghĩa.
   * Đo scroller rồi cấp qua state; fallback `100dvh` cho SSR / `/p` (scroller = window).
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

  const projects: AesthaExploreProject[] = Array.isArray(content.projects)
    ? content.projects
    : [];
  const footerLinks: AesthaExploreFooterLink[] = Array.isArray(
    content.footerLinks
  )
    ? content.footerLinks
    : [];

  // Chỉ số dự án đang được chọn trên canvas (Layers) → hiện ảnh tương ứng để sửa.
  const activeProjIdx = React.useMemo(() => {
    const m = activeKey?.match(/^projects\[(\d+)\]/);
    if (!m) return null;
    const i = Number(m[1]);
    return i >= 0 && i < projects.length ? i : null;
  }, [activeKey, projects.length]);

  // Wide: item đang hover (desktop). Mặc định null → hiện project[0].
  const [hovered, setHovered] = React.useState<number | null>(null);
  const wideIndex = activeProjIdx ?? hovered ?? 0;

  // Narrow: 1 dự án/màn, vuốt để chuyển.
  const [m, setM] = React.useState(0);
  const go = (dir: number) =>
    setM(v =>
      projects.length ? (v + dir + projects.length) % projects.length : 0
    );
  const mSafe = projects.length
    ? ((m % projects.length) + projects.length) % projects.length
    : 0;
  const narrowIndex = isCanvas && activeProjIdx != null ? activeProjIdx : mSafe;

  // Vuốt bằng pointer thuần (thay `drag='x'` của framer-motion).
  const swipeStart = React.useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current == null || reduce) {
      swipeStart.current = null;
      return;
    }
    const dx = e.clientX - swipeStart.current;
    if (dx < -60) go(1);
    else if (dx > 60) go(-1);
    swipeStart.current = null;
  };

  /**
   * Entrance on-load (recon: heading fade-up 500ms, menu stagger, ảnh fade).
   * Không có ScrollTrigger — block 1 viewport, không scrub.
   */
  useBlockMotion(rootRef, () => {
    const root = rootRef.current;
    if (!root || !hasRoot || isCanvas || reduce) return;

    const heading = root.querySelector<HTMLElement>('.aestha-explore-heading');
    const menuItems = Array.from(
      root.querySelectorAll<HTMLElement>('.aestha-explore-menu-item')
    );
    const featured = root.querySelector<HTMLElement>(
      '.aestha-explore-featured'
    );

    if (heading) {
      gsap.fromTo(
        heading,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power1.out' }
      );
    }
    if (menuItems.length) {
      gsap.fromTo(
        menuItems,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.15,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
    if (featured) {
      gsap.fromTo(
        featured,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, [isCanvas, hasRoot, reduce, isNarrow]);

  const heading = (extraClass: string) => (
    <h1
      data-element-key='heading'
      style={composeStyle(HEADING_STYLE, styleOf('heading'))}
      className={selectableClass(
        activeKey === 'heading',
        cn('aestha-explore-heading', extraClass)
      )}
    >
      {content.heading}
    </h1>
  );

  const footerNav = (extraClass: string) => (
    <nav
      aria-label='Sections'
      className={cn('flex items-center gap-6', extraClass)}
    >
      {footerLinks.map((link, i) => {
        const isCurrent = link.label === content.currentFooterLabel;
        return (
          <a
            key={i}
            href={link.href}
            aria-current={isCurrent ? 'page' : undefined}
            data-element-key={`footerLinks[${i}].label`}
            style={composeStyle(
              FOOTER_LINK_STYLE,
              isCurrent ? { color: FOOTER_CURRENT } : undefined,
              styleOf(`footerLinks[${i}].label`)
            )}
            className={selectableClass(
              activeKey === `footerLinks[${i}].label`,
              isCurrent ? undefined : 'hover:opacity-70'
            )}
          >
            {link.label}
          </a>
        );
      })}
    </nav>
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        '@container relative w-full bg-white text-[#0f0f0f] antialiased',
        className
      )}
    >
      {/* ── Project detail view (preview/play only, not in canvas) ── */}
      {effectiveView === 'project' && projects[activeProjectIdx] && (
        <AesthaProject
          content={buildProjectContent(
            projects[activeProjectIdx],
            activeProjectIdx,
            projects,
            footerLinks
          )}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
          onBack={() => setView('explore')}
          onNextProject={() => {
            const nextIdx = (activeProjectIdx + 1) % projects.length;
            setActiveProjectIdx(nextIdx);
          }}
        />
      )}

      {/* ── Explore menu view ── */}
      {effectiveView === 'explore' && (
        /* Wrapper với height cố định cho explore section */
        <div
          style={composeStyle(blockBackgroundStyle(background), {
            height: portH ? `${portH}px` : '100dvh',
          })}
        >
          {isNarrow ? (
            /* ── Narrow: 1 dự án/màn, vuốt để chuyển ── */
            <section className='flex h-full w-full flex-col px-6 pt-6 pb-6'>
              {heading('mb-4 shrink-0')}

              <div
                className='relative flex-1 overflow-hidden'
                style={{ touchAction: 'pan-y' }}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
              >
                {projects.map((p, i) => (
                  <div
                    key={i}
                    data-element-key={`projects[${i}].img`}
                    aria-hidden={narrowIndex !== i}
                    style={composeStyle(
                      {
                        position: 'absolute',
                        inset: 0,
                        opacity: narrowIndex === i ? 1 : 0,
                        pointerEvents: narrowIndex === i ? 'auto' : 'none',
                      },
                      CROSSFADE,
                      styleOf(`projects[${i}].img`)
                    )}
                    className={selectableClass(
                      activeKey === `projects[${i}].img`
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.img || MENU_IMG_FALLBACK}
                      alt={p.alt || 'Project image'}
                      draggable={false}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className='h-full w-full object-cover transition-transform duration-500 will-change-transform select-none hover:scale-[1.03]'
                    />
                  </div>
                ))}
              </div>

              {projects[narrowIndex] && (
                <button
                  type='button'
                  onClick={() => {
                    if (isCanvas) return;
                    setActiveProjectIdx(narrowIndex);
                    setView('project');
                  }}
                  className='mt-3 flex shrink-0 cursor-pointer items-center justify-between'
                  aria-label={`Open ${projects[narrowIndex].label}`}
                >
                  <span
                    data-element-key={`projects[${narrowIndex}].label`}
                    style={composeStyle(
                      { fontFamily: BODY_FONT, fontSize: 16, color: '#4F4F4F' },
                      styleOf(`projects[${narrowIndex}].label`)
                    )}
                    className={selectableClass(
                      activeKey === `projects[${narrowIndex}].label`
                    )}
                  >
                    {projects[narrowIndex].label}
                  </span>
                  <ArrowUpRight />
                </button>
              )}

              {footerNav('mt-4 shrink-0')}
            </section>
          ) : (
            /* ── Wide: hover-swap full-viewport ── */
            <section
              ref={wideRef}
              className='relative h-full w-full overflow-hidden'
            >
              <CursorDot containerRef={wideRef} disabled={reduce || isCanvas} />

              <div className='flex h-full w-full items-stretch gap-8 p-8'>
                {/* Cột trái: heading (trên) + menu (giữa) + footer (dưới) */}
                <div className='relative flex-1'>
                  <div className='absolute top-0 left-0'>{heading('')}</div>

                  <nav
                    aria-label='Projects'
                    className='absolute top-1/2 right-0 flex -translate-y-1/2 flex-col items-end'
                  >
                    {projects.map((p, i) => (
                      <button
                        key={i}
                        type='button'
                        data-element-key={`projects[${i}].label`}
                        onClick={() => {
                          if (isCanvas) return;
                          setHovered(i);
                          setActiveProjectIdx(i);
                          setView('project');
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered(null)}
                        style={composeStyle(
                          MENU_LINK_STYLE,
                          { color: hovered === i ? INK_DARK : MENU_IDLE },
                          styleOf(`projects[${i}].label`)
                        )}
                        className={selectableClass(
                          activeKey === `projects[${i}].label`,
                          'aestha-explore-menu-item flex h-[34px] cursor-pointer items-center justify-end border-none bg-transparent text-right outline-none focus-visible:underline'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </nav>

                  {footerNav('absolute bottom-0 left-0')}
                </div>

                {/* Cột phải: ảnh featured ~47.37% — crossfade theo dự án active */}
                <button
                  type='button'
                  aria-label={`View ${projects[wideIndex]?.label} project`}
                  className='aestha-explore-featured relative shrink-0 cursor-pointer overflow-hidden border-none bg-transparent p-0'
                  style={{ width: 'calc((100cqw - 96px) * 0.4737)' }}
                  onClick={() => {
                    if (isCanvas) return;
                    setActiveProjectIdx(wideIndex);
                    setView('project');
                  }}
                >
                  {projects.map((p, i) => (
                    <div
                      key={i}
                      data-element-key={`projects[${i}].img`}
                      aria-hidden={wideIndex !== i}
                      style={composeStyle(
                        {
                          position: 'absolute',
                          inset: 0,
                          opacity: wideIndex === i ? 1 : 0,
                          pointerEvents: wideIndex === i ? 'auto' : 'none',
                        },
                        CROSSFADE,
                        styleOf(`projects[${i}].img`)
                      )}
                      className={selectableClass(
                        activeKey === `projects[${i}].img`
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.img || MENU_IMG_FALLBACK}
                        alt={p.alt || 'Project image'}
                        draggable={false}
                        fetchPriority={i === 0 ? 'high' : 'auto'}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className='h-full w-full object-cover transition-transform duration-500 will-change-transform select-none hover:scale-[1.03]'
                      />
                    </div>
                  ))}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
      {/* ── Canvas Content Preview: Hiển thị flat content dưới explore (canvas only) ── */}
      {isCanvas && (
        <CanvasContentPreview
          content={content}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      )}
    </div>
  );
}

// ============================================================================
// Canvas Content Preview: Hiển thị flat tất cả nội dung AesthaProject
// ============================================================================
/**
 * Canvas Content Preview: Hiển thị flat tất cả nội dung AesthaProject
 * cho mỗi dự án (title, body paragraphs, images) để xem và edit.
 */
function CanvasContentPreview({
  content,
  styles,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  background: _background,
  order,
  positions,
  activeKey,
}: {
  content: AesthaExploreContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}) {
  const projects: AesthaExploreProject[] = Array.isArray(content.projects)
    ? content.projects
    : [];

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  if (projects.length === 0) {
    return (
      <div className='p-8 text-center text-neutral-500'>
        Chưa có dự án nào. Thêm dự án trong Layers Panel.
      </div>
    );
  }

  return (
    <div className='w-full bg-neutral-50 p-4'>
      <h3 className='mb-4 text-sm font-medium text-neutral-600'>
        Nội dung AesthaProject (Canvas Preview)
      </h3>

      {/* Thêm/Bớt Controls */}
      <div className='mb-4 flex gap-2'>
        <button
          type='button'
          onClick={() => {
            // This will be handled by the editor's content update
            // For now, show a visual indicator
          }}
          className='rounded border border-neutral-300 bg-white px-3 py-1.5 text-xs hover:bg-neutral-100'
        >
          + Thêm Dự Án
        </button>
      </div>

      {projects.map((project, projectIdx) => {
        const detail = project.detail;
        const body = detail?.body ?? [];
        const images = detail?.images ?? [];

        return (
          <div
            key={projectIdx}
            className='mb-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm'
          >
            {/* Project Title */}
            <div
              data-element-key={`projects[${projectIdx}].label`}
              style={composeStyle(
                {
                  fontFamily: DISPLAY_FONT,
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#0f0f0f',
                  marginBottom: 24,
                },
                styleOf(`projects[${projectIdx}].label`)
              )}
              className={selectableClass(
                activeKey === `projects[${projectIdx}].label`,
                'mb-6 text-3xl font-semibold tracking-wide uppercase'
              )}
            >
              {project.label.toUpperCase()}
            </div>

            {/* Concept Label */}
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 11,
                fontWeight: 500,
                color: '#757575',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 20,
              }}
            >
              Concept
            </div>

            {/* Body Paragraphs */}
            <div className='mb-6 space-y-4'>
              {[0, 1, 2].map(j => (
                <div
                  key={j}
                  data-element-key={`projects[${projectIdx}].detail.body[${j}]`}
                  style={composeStyle(
                    {
                      fontFamily: BODY_FONT,
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: '#333333',
                    },
                    styleOf(`projects[${projectIdx}].detail.body[${j}]`)
                  )}
                  className={selectableClass(
                    activeKey === `projects[${projectIdx}].detail.body[${j}]`,
                    'rounded border border-dashed border-transparent p-2 hover:border-blue-300'
                  )}
                  contentEditable={false}
                >
                  {body[j] ?? `[Body ${j + 1} - Nhấp để sửa]`}
                </div>
              ))}
            </div>

            {/* Images */}
            <div className='mb-4 flex flex-wrap gap-2'>
              {images.length === 0 ? (
                <div className='flex h-[150px] w-[200px] items-center justify-center rounded border-2 border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400'>
                  Chưa có ảnh — bấm Thêm ảnh ở popover Dự án.
                </div>
              ) : null}
              {images.map((img, k) => (
                <div
                  key={k}
                  data-element-key={`projects[${projectIdx}].detail.images[${k}].src`}
                  style={composeStyle(
                    {
                      width: 200,
                      height: 150,
                      objectFit: 'cover' as const,
                    },
                    styleOf(`projects[${projectIdx}].detail.images[${k}].src`)
                  )}
                  className={selectableClass(
                    activeKey ===
                      `projects[${projectIdx}].detail.images[${k}].src`,
                    'rounded border-2 border-dashed border-transparent hover:border-blue-400'
                  )}
                >
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt={img.alt || `Image ${k + 1}`}
                      className='h-full w-full rounded object-cover'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center rounded bg-neutral-100 text-sm text-neutral-400'>
                      Ảnh {k + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Project Link */}
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: 11,
                color: '#757575',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 24,
              }}
            >
              Dự án tiếp theo
            </div>
          </div>
        );
      })}
    </div>
  );
}
