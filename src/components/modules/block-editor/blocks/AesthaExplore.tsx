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
 * Click một dự án (menu wide · ảnh featured · thẻ narrow) LUÔN mở view chi tiết
 * NỘI BỘ (`view = 'project'` → render `AesthaProject`), không điều hướng theo
 * `projects[i].href`. Field `href` giữ lại trong CMS nhưng block không đọc.
 *
 * Motion contract: entrance qua `useBlockMotion` (GSAP); swap ảnh featured bằng
 * CSS transition thuần (crossfade opacity 250ms + cả khối ảnh mới fade-up 54px
 * kèm scale 0.95→1 trong 1s —
 * state-driven nên KHÔNG dùng `data-motion`/`useBlockMotion`, xem `featuredImages`);
 * vuốt mobile bằng pointer thuần — KHÔNG dùng framer-motion.
 * `min-[1100px]:` viewport media → `useContainerMobile(rootRef, 1100)` (đo
 * container, đúng trong device frame lẫn `/p`). Tokens tuyền inline + styleOf.
 */

import * as React from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import type {
  AesthaExploreContent,
  AesthaExploreProject,
  AesthaProjectContent,
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
import { useContainerMobile } from './useContainerMobile';
import { useIsCanvasEdit } from './useIsCanvasEdit';

// Shared tokens
import {
  BODY_FONT,
  EASE_CROSSFADE,
  HEADING_STYLE,
  INK_DARK,
  MENU_IDLE,
  MENU_LINK_STYLE,
  NAV_CLEARANCE,
} from './aesthaTokens';
// Lazy-load AesthaProject to avoid circular deps
const AesthaProject = dynamic(() =>
  import('./AesthaProject').then(m => m.AesthaProject)
);

/* ── View types ─────────────────────────────────────────────────── */
type ExploreView = 'explore' | 'project';

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

/**
 * Ảnh featured (wide) vào: ngoài crossfade opacity ở trên, CẢ KHỐI ảnh mới còn
 * trượt lên `RISE_PX` + zoom `RISE_SCALE → 1` trong `RISE_MS`. Rise dài hơn
 * crossfade nên khối ảnh còn
 * "trôi" một nhịp sau khi đã hiện rõ; delay khớp `CROSSFADE` để hai thứ khởi
 * động cùng lúc. Khối trượt trong khung `overflow-hidden` → lúc đang lên có hở
 * một dải nền ở mép trên (thu dần về 0) — đúng chất fade-up, không né.
 */
const RISE_MS = 1000;
const RISE_PX = 54;
/**
 * Kèm zoom nhẹ `RISE_SCALE → 1` cùng nhịp với translate (chung một property
 * `transform` nên tự khớp duration/ease). `transform-origin` mặc định = center →
 * lúc chưa vào, khối co đều mọi phía, hở thêm một dải mảnh ở trái/phải nữa chứ
 * không chỉ mép trên.
 */
const RISE_SCALE = 0.95;
/**
 * KHÔNG dùng `EASE_STANDARD`: expo-out đi hết quãng đường trong ~350ms đầu, phần
 * còn lại của giây đứng yên → mất cảm giác "1 giây". easeOutCubic vẫn giảm tốc
 * mượt nhưng trải chuyển động ra gần trọn `RISE_MS`.
 */
const RISE_EASE = 'cubic-bezier(0.33, 1, 0.68, 1)';
/**
 * Lớp rời đi KHÔNG trượt xuống — chỉ reset vị trí (0ms, không transition) sau khi
 * crossfade kết thúc (150 + 250ms) lúc nó đã vô hình, để lần hiện sau lại rise đủ
 * `RISE_PX`. Dư một nhịp so với 400ms để không đua frame với chính crossfade.
 */
const RISE_RESET_MS = 500;

/**
 * Narrow (tablet + mobile): slider trượt ngang. Cả track dịch `translateX` để
 * cuộn qua dự án kế; song song, slide đang RỜI co `scale(1)→0.8` còn slide đang
 * VÀO nở `scale(0.8)→1`. Track + scale dùng chung easing/thời lượng nên ăn khớp.
 */
const SLIDE_MS = 500;
const SLIDE_SCALE: React.CSSProperties = {
  transition: `transform ${SLIDE_MS}ms ${EASE_CROSSFADE}`,
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
 * Nội dung chi tiết do chính block `aestha_explore` sở hữu qua `project.detail`
 * (body/images), luôn được seed từ BlockDef → không cần bịa placeholder.
 * `next*` suy ra từ dự án kế tiếp.
 *
 * Nav KHÔNG còn dựng ở đây: đã tách sang block `aestha_nav` (overlay góc trái
 * dưới, phủ lên mọi section).
 */
function buildProjectContent(
  project: AesthaExploreProject,
  projectIndex: number,
  allProjects: AesthaExploreProject[]
): AesthaProjectContent {
  const detail = project.detail;
  const body = Array.isArray(detail?.body) ? detail!.body! : [];
  const images = Array.isArray(detail?.images) ? detail!.images! : [];

  // Build next project info
  const nextIndex = allProjects.length
    ? (projectIndex + 1) % allProjects.length
    : 0;
  const nextProject = allProjects[nextIndex];

  return {
    title: project.label.toUpperCase(),
    conceptLabel: 'Concept',
    body,
    images,
    nextHeading: 'Dự án tiếp theo',
    nextLabel: nextProject?.label ?? '',
    nextHref: nextProject?.href || '#',
  };
}

/**
 * Ánh xạ key nội bộ của `AesthaProject` → key CMS của block `aestha_explore`
 * cho dự án chỉ số `p`. Các field không có tương ứng trong CMS (`conceptLabel`,
 * `nextHeading`, `nextLabel`) giữ nguyên → hiển thị nhưng không selectable.
 */
function keyForProject(p: number): (localKey: string) => string {
  return localKey => {
    if (localKey === 'title') return `projects[${p}].label`;
    const bodyM = localKey.match(/^body\[(\d+)\]$/);
    if (bodyM) return `projects[${p}].detail.body[${bodyM[1]}]`;
    const imgM = localKey.match(/^images\[(\d+)\]\.src$/);
    if (imgM) return `projects[${p}].detail.images[${imgM[1]}].src`;
    return localKey;
  };
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

  // Chỉ BlockPreview editor — KHÔNG PreviewMode/Play/`/p`. Hook default `false`
  // để SSR `/p` render đúng nhánh production ngay (không nháy layout editor).
  const isCanvas = useIsCanvasEdit(rootRef);

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

  // Cuộn về đầu khi đổi view HOẶC đổi dự án (next-project) — chỉ preview/play.
  // Cuộn đúng scroller thật (element overflow trong harness/PreviewMode) và
  // window cho `/p`. AesthaProject remount qua `key` để reset `atEnd`/entrance.
  React.useEffect(() => {
    if (typeof window === 'undefined' || isCanvas) return;
    let el: HTMLElement | null = rootRef.current?.parentElement ?? null;
    while (el) {
      const ov = getComputedStyle(el).overflowY;
      if (ov === 'auto' || ov === 'scroll') break;
      el = el.parentElement;
    }
    if (el) el.scrollTo({ top: 0, behavior: 'auto' });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view, activeProjectIdx, isCanvas]);

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

  // ── Narrow: slider 1 dự án/màn — KÉO qua lại + autoplay, LOOP vô hạn mượt ──
  const N = projects.length;
  // Loop bằng clone slide đầu/cuối, CHỈ ở runtime nhiều dự án. Canvas/reduce giữ
  // tĩnh (canvas bám dự án đang chọn ở Layers) → không cần clone.
  const loop = !isCanvas && !reduce && N > 1;

  // `pos` = cột đang ở giữa. Khi loop, track render
  // [clone(cuối), project0..N-1, clone(đầu)] → dự án thật k nằm ở cột k+1; `pos`
  // chạy 1..N, chạm cột clone (0 hoặc N+1) thì SAU transition nhảy vô hình về cột
  // thật tương ứng → cuối→đầu vẫn trượt tiếp một hướng, không chạy ngược một mạch.
  const [pos, setPos] = React.useState(1);
  const [noTrans, setNoTrans] = React.useState(false); // tắt transition cho cú nhảy
  const step = (dir: number) => setPos(p => p + dir);

  const centerCol = loop
    ? pos
    : isCanvas && activeProjIdx != null
      ? activeProjIdx
      : 0;

  // Danh sách cột render: kèm 2 clone hai đầu khi loop, mỗi cột giữ `real` = chỉ
  // số dự án thật (cho data-element-key / styleOf / mở chi tiết).
  const columns = loop
    ? [
        { p: projects[N - 1], real: N - 1 },
        ...projects.map((p, i) => ({ p, real: i })),
        { p: projects[0], real: 0 },
      ]
    : projects.map((p, i) => ({ p, real: i }));

  /**
   * Narrow: click-KÉO thật (không phải vuốt-nhảy). Track bám con trỏ theo `dragX`
   * suốt lúc kéo (transition tắt), thả ra thì snap sang slide gần nhất rồi bật
   * transition lại. Scale từng slide nội suy liên tục theo tiến trình kéo:
   * slide đang ở giữa `scale(1)`, càng rời xa càng về `scale(0.8)` → dự án cũ co
   * và dự án mới nở NGAY khi kéo, không đợi thả. Kéo chỉ bật khi `loop`.
   */
  const [dragX, setDragX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef<number | null>(null);
  const dragW = React.useRef(1); // bề rộng 1 slide (khung) đo lúc pointerdown
  const dragMoved = React.useRef(false); // đã kéo đủ xa? → phân biệt tap vs kéo

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragMoved.current = false;
    if (!loop) return;
    dragStart.current = e.clientX;
    dragW.current = e.currentTarget.getBoundingClientRect().width || 1;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current == null) return;
    const dx = e.clientX - dragStart.current;
    if (Math.abs(dx) > 6) dragMoved.current = true;
    setDragX(dx);
  };
  const endDrag = () => {
    if (dragStart.current == null) return;
    const dx = dragX;
    const threshold = Math.min(dragW.current * 0.2, 80);
    if (dx <= -threshold) step(1);
    else if (dx >= threshold) step(-1);
    dragStart.current = null;
    setDragX(0);
    setDragging(false);
  };

  // Scale mỗi CỘT theo khoảng cách (đơn vị khung) tới cột giữa. d=0→1; |d|≥1→0.8;
  // nội suy tuyến tính ở giữa (đúng cả khi kéo).
  const slideScale = (col: number) => {
    const d = col - centerCol + dragX / (dragW.current || 1);
    const c = Math.min(Math.abs(d), 1);
    return 1 - 0.2 * c;
  };

  // Autoplay: mỗi 5s sang dự án kế (`pos++`). Tạm dừng khi đang kéo. Loop lo cú
  // nhảy vô hình ở cột clone → cuối→đầu liền mạch như chuyển thường.
  React.useEffect(() => {
    if (!loop || !isNarrow || dragging) return;
    const id = window.setInterval(() => setPos(p => p + 1), 5000);
    return () => window.clearInterval(id);
  }, [loop, isNarrow, dragging]);

  // Chạm cột clone (0 = clone cuối, N+1 = clone đầu) → sau khi transition trượt
  // xong (SLIDE_MS), tắt transition rồi nhảy về cột thật (N hoặc 1). Cột clone và
  // cột thật hiển thị cùng ảnh nên cú nhảy hoàn toàn vô hình.
  React.useEffect(() => {
    if (!loop || (pos >= 1 && pos <= N)) return;
    const realCol = pos <= 0 ? N : 1;
    const id = window.setTimeout(() => {
      setNoTrans(true);
      setPos(realCol);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [pos, loop, N]);

  // Bật lại transition ở frame kế sau cú nhảy (pos đã ở cột thật, vị trí không đổi
  // nên không có animation thừa).
  React.useEffect(() => {
    if (!noTrans) return;
    const id = requestAnimationFrame(() => setNoTrans(false));
    return () => cancelAnimationFrame(id);
  }, [noTrans]);

  /**
   * Entrance on-load (recon: heading fade-up 500ms, menu stagger, ảnh fade).
   * Không có ScrollTrigger — block 1 viewport, không scrub.
   *
   * `effectiveView` PHẢI nằm trong deps: 3 element dưới mang `data-entrance` →
   * ẩn sẵn bằng CSS (xem `public-entrance.css`). Vào view chi tiết rồi quay lại
   * là cả cây explore mount mới, mất sạch inline style GSAP đã ghi; không
   * rebuild thì chúng nằm im ở `opacity: 0` cho tới lúc failsafe gỡ gate.
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
          delay: 0.08,
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
  }, [isCanvas, hasRoot, reduce, isNarrow, effectiveView]);

  /**
   * Hover roll-swap của heading (`AesthaRollLink`). Deps gồm `isNarrow` (wide /
   * narrow render 2 cây DOM khác nhau) và 2 nhãn (đổi text trên canvas →
   * rebuild timeline).
   */
  useMotionAttributes(rootRef, [
    isNarrow,
    isCanvas,
    effectiveView,
    content.heading,
    content.headingHoverLabel,
  ]);

  /* `.aestha-explore-heading` (marker entrance của useBlockMotion) ở trên `<h1>`,
     còn `data-motion` nằm trên 2 span con → 1 element = 1 driver, không chồng. */
  const heading = (extraClass: string) => (
    <h1
      data-entrance
      style={composeStyle(HEADING_STYLE, styleOf('heading'))}
      className={cn('aestha-explore-heading', extraClass)}
    >
      <AesthaRollLink
        label={content.heading}
        hoverLabel={content.headingHoverLabel}
        href={content.headingHref}
        labelKey='heading'
        hoverLabelKey='headingHoverLabel'
        activeKey={activeKey}
        isCanvas={isCanvas}
        styleOf={styleOf}
      />
    </h1>
  );

  /* Ảnh featured (wide) — tách khỏi JSX để `<button>` và `<a>` dùng chung, hai
     nhánh không thể lệch style/marker GSAP `aestha-explore-featured`. */
  const featuredShared = {
    'aria-label': `View ${projects[wideIndex]?.label} project`,
    'data-entrance': '',
    className:
      'aestha-explore-featured relative shrink-0 cursor-pointer overflow-hidden border-none bg-transparent p-0',
    style: { width: 'calc((100cqw - 96px) * 0.4737)' },
  };

  const featuredImages = projects.map((p, i) => {
    const active = wideIndex === i;
    return (
      <div
        key={i}
        data-element-key={`projects[${i}].img`}
        aria-hidden={!active}
        style={composeStyle(
          {
            position: 'absolute',
            inset: 0,
            // Clip khối ảnh đang trượt — nút cha đã overflow-hidden nhưng lớp có
            // thể được gán borderRadius qua styleOf, cần bo đúng ở đây.
            overflow: 'hidden',
            opacity: active ? 1 : 0,
            pointerEvents: active ? 'auto' : 'none',
          },
          CROSSFADE,
          styleOf(`projects[${i}].img`)
        )}
        className={selectableClass(activeKey === `projects[${i}].img`)}
      >
        {/* Cả khối ảnh trượt lên như một block (`inset: 0` = full khung, KHÔNG
            phóng to để né hở mép — chủ ý cho thấy khối ảnh đi lên chứ không phải
            ảnh chạy sau một khung đứng yên). Tách riêng khỏi lớp opacity vì
            `styleOf` ở trên có thể mang `transform: translate(...)` do author kéo
            element trên canvas (positionStyle) và sẽ đè mất translateY; còn
            `<img>` đã giữ transform cho hover-zoom. */}
        <div
          style={
            reduce
              ? { position: 'absolute', inset: 0 }
              : {
                  position: 'absolute',
                  inset: 0,
                  transform: active
                    ? 'translateY(0) scale(1)'
                    : `translateY(${RISE_PX}px) scale(${RISE_SCALE})`,
                  transition: active
                    ? `transform ${RISE_MS}ms 150ms ${RISE_EASE}`
                    : `transform 0ms ${RISE_RESET_MS}ms`,
                  willChange: 'transform',
                }
          }
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
      </div>
    );
  });

  return (
    <div
      ref={rootRef}
      className={cn(
        '@container relative w-full bg-white text-[#0f0f0f] antialiased',
        className
      )}
    >
      {/* ── Project detail view (preview/play only, not in canvas) ──
          `key` remount theo dự án để reset `atEnd`/entrance khi bấm "next". */}
      {effectiveView === 'project' && projects[activeProjectIdx] && (
        <AesthaProject
          key={activeProjectIdx}
          content={buildProjectContent(
            projects[activeProjectIdx],
            activeProjectIdx,
            projects
          )}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
          keyFor={keyForProject(activeProjectIdx)}
          onBack={() => setView('explore')}
          onNextProject={() => {
            const nextIdx = (activeProjectIdx + 1) % projects.length;
            setActiveProjectIdx(nextIdx);
          }}
        />
      )}

      {/* ── Explore menu view ──
          Height bám vùng cuộn thật (1 màn) cho cả canvas lẫn preview/`/p`; các
          section con dùng `h-full` nên cần height xác định. Trên canvas, fork
          chi tiết phẳng render TIẾP bên dưới (author cuộn xuống để sửa). */}
      {effectiveView === 'explore' && (
        <div
          style={composeStyle(blockBackgroundStyle(background), {
            height: portH ? `${portH}px` : '100dvh',
          })}
        >
          {isNarrow ? (
            /* ── Narrow: 1 dự án/màn, vuốt để chuyển. `paddingBottom` chừa chỗ
               cho block `aestha_nav` overlay (nhãn dự án nằm sát đáy). ── */
            <section
              className='flex h-full w-full flex-col px-6 pt-6'
              style={{ paddingBottom: `calc(24px + ${NAV_CLEARANCE})` }}
            >
              {heading('mb-4 shrink-0')}

              <div
                className={cn(
                  'relative flex-1 cursor-pointer overflow-hidden',
                  loop && (dragging ? 'cursor-grabbing' : 'cursor-grab')
                )}
                style={{ touchAction: 'pan-y' }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={() => {
                  // Tap (không kéo) → mở chi tiết dự án ĐANG ở giữa. Đặt onClick ở
                  // container (phần tử giữ pointer capture) để click luôn nổ.
                  // `projects[i].href` KHÔNG được dùng để điều hướng: click luôn
                  // mở view chi tiết nội bộ của chính block này.
                  if (isCanvas || dragMoved.current) return;
                  setActiveProjectIdx(columns[centerCol]?.real ?? 0);
                  setView('project');
                }}
              >
                {/* Track: cả dải cột (kèm clone hai đầu khi loop) cuộn ngang.
                    Track rộng = khung; mỗi cột `w-full shrink-0` nên tràn ngang,
                    `translateX(-centerCol*100%)` (100% = 1 khung) đưa cột giữa
                    vào khung. Kéo → bám `dragX` (transition tắt). `noTrans` = cú
                    nhảy vô hình khi loop qua cột clone. */}
                <div
                  className='flex h-full'
                  style={{
                    transform: `translateX(calc(-${centerCol * 100}% + ${dragX}px))`,
                    transition:
                      dragging || noTrans ? 'none' : SLIDE_SCALE.transition,
                  }}
                >
                  {columns.map((col, j) => (
                    <div key={j} className='h-full w-full shrink-0'>
                      {/* Cả thẻ Project (ảnh + label) là 1 khối: kéo và scale
                          cùng nhau. Mở chi tiết do container cha lo (onClick). */}
                      <div
                        style={{
                          transformOrigin: 'center',
                          transform: `scale(${slideScale(j)})`,
                          transition:
                            dragging || noTrans
                              ? 'none'
                              : SLIDE_SCALE.transition,
                        }}
                        className='flex h-full w-full flex-col'
                      >
                        <div
                          data-element-key={`projects[${col.real}].img`}
                          aria-hidden={centerCol !== j}
                          style={composeStyle(
                            {
                              position: 'relative',
                              flex: '1 1 0%',
                              minHeight: 0,
                              overflow: 'hidden',
                            },
                            styleOf(`projects[${col.real}].img`)
                          )}
                          className={selectableClass(
                            activeKey === `projects[${col.real}].img`
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={col.p.img || MENU_IMG_FALLBACK}
                            alt={col.p.alt || 'Project image'}
                            draggable={false}
                            loading={col.real === 0 ? 'eager' : 'lazy'}
                            className='h-full w-full object-cover will-change-transform select-none'
                          />
                        </div>

                        <div className='mt-3 flex shrink-0 items-center justify-between'>
                          <span
                            data-element-key={`projects[${col.real}].label`}
                            style={composeStyle(
                              {
                                fontFamily: BODY_FONT,
                                fontSize: 16,
                                color: '#4F4F4F',
                              },
                              styleOf(`projects[${col.real}].label`)
                            )}
                            className={selectableClass(
                              activeKey === `projects[${col.real}].label`
                            )}
                          >
                            {col.p.label}
                          </span>
                          <ArrowUpRight />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                    {/* Click LUÔN mở view chi tiết nội bộ — `projects[i].href`
                        không dùng để điều hướng. */}
                    {projects.map((p, i) => (
                      <button
                        key={i}
                        type='button'
                        data-entrance
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
                </div>

                {/* Cột phải: ảnh featured ~47.37% — crossfade theo dự án active.
                    Cùng quy tắc với menu: click mở view chi tiết nội bộ. */}
                <button
                  type='button'
                  {...featuredShared}
                  onClick={() => {
                    if (isCanvas) return;
                    setActiveProjectIdx(wideIndex);
                    setView('project');
                  }}
                >
                  {featuredImages}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
      {/* ── Canvas edit fork: layout chi tiết PHẲNG của dự án đang chọn ──
          Tái dùng luôn fork `isCanvas` của `AesthaProject` (nó tự phát hiện
          canvas → render phẳng, KHÔNG sticky). `keyFor` map key nội bộ →
          key CMS `projects[i].detail.*` để mọi field selectable/styleable.
          Chọn field body/ảnh của dự án nào trên Layers → nhảy sang dự án đó. */}
      {isCanvas && projects.length > 0 && (
        <div data-canvas-edit='true' className='border-t border-neutral-200'>
          <AesthaProject
            content={buildProjectContent(
              projects[activeProjIdx ?? 0],
              activeProjIdx ?? 0,
              projects
            )}
            styles={styles}
            order={order}
            positions={positions}
            activeKey={activeKey}
            keyFor={keyForProject(activeProjIdx ?? 0)}
          />
        </div>
      )}
    </div>
  );
}
