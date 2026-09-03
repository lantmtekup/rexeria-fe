'use client';

import * as React from 'react';
import gsap from 'gsap';

import { cn } from '@/lib/cn';

import { useLandingMotion } from '../motion/LandingMotion';
import { useIsCanvasEdit } from './useIsCanvasEdit';
import type {
  BlockBackground,
  ElementPositionsMap,
  ElementStylesMap,
  WestlyResidenceItem,
  WestlyResidencesContent,
} from '../types';
import {
  blockBackgroundStyle,
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';
import { useWestlyPointer } from './WestlyPointer';
import { useContainerMobile } from './useContainerMobile';
import { WESTLY_FONT_DISPLAY, WESTLY_FONT_UI } from './westlyTheme';
import {
  resolveWestlyResidences,
  westlyPlanRatio,
} from './westlyResidencesData';

interface WestlyResidencesProps {
  content: WestlyResidencesContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
}

/**
 * The Westly · Residences — port từ apps/the-westly FinalResidences.tsx.
 *
 * Tabs các căn cuối; mỗi căn: cột INFORMATION + bản vẽ floor plan có hotspot —
 * hover thành pill tên phòng, click bung card spec và zoom/pan bản vẽ vào đúng
 * phòng (transform-only, không reflow). Exit là veil bàn giao.
 *
 * Khác apps:
 * - Sticky top-âm + anchor + veil bám #reveal (page-level) → block TỰ chứa:
 *   root = nội dung (sticky, top âm do JS đo phần dôi so với viewport) + đuôi
 *   35dvh làm ngân sách scroll cho veil trong lúc nội dung còn ghim.
 * - Bỏ bg fade-in (đền bù SceneParallax ghim bên dưới ở page-level) — nền đặc
 *   `bgColor` từ đầu; CỔNG gate của nội dung giữ lại (tự chứa, scrub thuận
 *   nghịch).
 * - Mốc `isWide` 1024 đo theo CONTAINER (khung bản vẽ đổi hành vi ở đó: dưới
 *   thì cuộn ngang, từ đó là hai cột + zoom transform) — không viewport.
 * - focusPlan mobile: ScrollToPlugin → tween scrollLeft qua proxy (foundation
 *   không đăng ký ScrollTo, R1 cấm register trong block).
 * - details/hotspots là content JSON (sửa qua AI edit); LayersPanel expose
 *   title/plan/link mỗi căn.
 */

const ACCENT = '#6E7A6F';
/** Cam của pill/card hotspot — ước lượng từ ảnh design. */
const HOTSPOT_ACCENT = '#E1913A';
/** Lề tối thiểu giữa card hotspot và mép khung bản vẽ khi phải kẹp lại (px). */
const CARD_EDGE = 8;

const DEFAULT_BG = '#F3F1EA';
const DEFAULT_VEIL = '#ffffff';

const UI_LABEL_STYLE: React.CSSProperties = {
  margin: 0,
  fontFamily: WESTLY_FONT_UI,
  fontSize: 'clamp(11px, 1.2cqi, 12px)',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: ACCENT,
};

const PdfIcon = () => (
  <svg
    width='28'
    height='32'
    viewBox='0 0 28 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden
  >
    <path
      d='M4 0h14l6 6v22a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z'
      stroke='currentColor'
      strokeWidth='1.25'
    />
    <path d='M18 0v6h6' stroke='currentColor' strokeWidth='1.25' />
    <text
      x='14'
      y='22'
      textAnchor='middle'
      fill='currentColor'
      fontSize='7'
      fontWeight='600'
      letterSpacing='0.04em'
    >
      PDF
    </text>
  </svg>
);

const PlusIcon = () => (
  <svg width='11' height='11' viewBox='0 0 11 11' fill='none' aria-hidden>
    <path
      d='M5.5 0v11M0 5.5h11'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
    />
  </svg>
);

const MinusIcon = () => (
  <svg width='11' height='2' viewBox='0 0 11 2' fill='none' aria-hidden>
    <path
      d='M0 1h11'
      stroke='currentColor'
      strokeWidth='1.4'
      strokeLinecap='round'
    />
  </svg>
);

const Detail = ({ label, value }: { label: string; value?: string }) => (
  <div>
    <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: ACCENT }}>
      {label}
    </p>
    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ACCENT }}>
      {value ?? '—'}
    </p>
  </div>
);

/**
 * Card bung ra từ chính điểm hotspot, nên hướng bung phải tránh mép khung:
 * điểm nằm nửa phải mở sang trái, nằm nửa dưới mở lên trên.
 */
const cardAlignStyle = (x: number, y: number): React.CSSProperties => ({
  ...(x > 55 ? { right: 0 } : { left: 0 }),
  ...(y > 55 ? { bottom: 0 } : { top: 0 }),
  transformOrigin: `${y > 55 ? 'bottom' : 'top'} ${x > 55 ? 'right' : 'left'}`,
});

/** `true` khi bề rộng container ≥ 1024 — mốc khung bản vẽ đổi hành vi. */
function useContainerWide(ref: React.RefObject<HTMLElement | null>): boolean {
  const [wide, setWide] = React.useState(false);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = (w: number) => setWide(w >= 1024);
    sync(el.clientWidth);
    const ro = new ResizeObserver(entries => {
      sync(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return wide;
}

export function WestlyResidences({
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  className,
}: WestlyResidencesProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const stickyRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const didMountRef = React.useRef(false);
  const isMobile = useContainerMobile(rootRef);
  const isWide = useContainerWide(rootRef);
  const isCanvas = useIsCanvasEdit(rootRef);
  const pointer = useWestlyPointer(isCanvas);
  const { scroller, requestRefresh } = useLandingMotion();

  const residences = React.useMemo(
    () => resolveWestlyResidences(content),
    [content]
  );
  const [activeId, setActiveId] = React.useState('');
  const active =
    residences.find((r, i) => (r.id ?? `res-${i}`) === activeId) ??
    residences[0];
  const activeIndex = Math.max(
    0,
    residences.findIndex(r => r === active)
  );

  const styleOf = (key: string) =>
    composeStyle(
      elementStyleOf(styles, key),
      orderStyle(order, key),
      positionStyle(positions, key)
    );

  const eyebrow = content.eyebrow?.trim() || 'Detailed Specifications';
  const title = content.title?.trim() || 'The Final Residences.';
  const subtitle =
    content.subtitle?.trim() ||
    '49 of 52 homes at The Westly have found owners. These are the last three.';
  const bgColor = content.bgColor?.trim() || DEFAULT_BG;
  const veilColor = content.veilColor?.trim() || DEFAULT_VEIL;

  const residenceId = (r: WestlyResidenceItem, i: number) => r.id ?? `res-${i}`;
  const activeResolvedId = residenceId(active, activeIndex);

  // ── Effect A — khung section: sticky top âm, cổng, entrance, veil ──
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const sticky = stickyRef.current;
    if (!root || !sticky || isCanvas) return;

    // Section cao hơn viewport phải dính bằng top ÂM đúng bằng phần dôi — nó
    // cuộn bình thường tới lúc lộ hết đáy rồi mới đứng lại cho veil chạy.
    // CSS không viết được (percent của top tính theo khối chứa), nên đo JS.
    const viewportH = () =>
      scroller ? scroller.clientHeight : window.innerHeight;
    const stickTop = () => {
      const overflow = Math.max(0, sticky.offsetHeight - viewportH());
      sticky.style.top = `${-overflow}px`;
    };
    stickTop();
    const ro = new ResizeObserver(stickTop);
    ro.observe(sticky);
    window.addEventListener('resize', stickTop);

    const q = (name: string) =>
      root.querySelector<HTMLElement>(`[data-wr="${name}"]`);
    const gate = q('content');
    const veil = q('veil');
    const tail = q('tail');
    const ui = root.querySelectorAll<HTMLElement>('[data-wr-ui]');
    const panels = root.querySelectorAll<HTMLElement>('[data-wr-panel]');

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        if (gate) gsap.set(gate, { autoAlpha: 1 });
        gsap.set([...Array.from(ui), ...Array.from(panels)], {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      // CỔNG — nội dung chỉ hiện khi block đã chiếm nửa dưới màn; scrub nên
      // cuộn ngược tan ngược. Gác ở bọc [data-wr=content] mà không tween nào
      // khác đụng tới — stagger ui/panel bên trong không bị giẫm.
      if (gate) {
        gsap.fromTo(
          gate,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 62%',
              end: 'top 50%',
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      gsap
        .timeline({
          defaults: { ease: 'power3.out', duration: 0.9 },
          scrollTrigger: {
            trigger: root,
            scroller,
            start: 'top 50%',
            once: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          panels,
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, stagger: 0.15 }
        );

      // Entrance chữ — chạy khi vào, reverse khi cuộn ngược ra, vào lại chạy
      // tiếp (thay cặp playUi/resetUi + ScrollTrigger.create của apps).
      // 'play' chứ KHÔNG 'restart': đổi tab là chiều cao block đổi (mỗi bản vẽ
      // một tỉ lệ) → ScrollTrigger.refresh() re-fire onEnter — restart sẽ kéo
      // cả tiêu đề + dãy tab về alpha 0 chạy lại (nháy mỗi lần chuyển tab),
      // còn play ở timeline đã xong là no-op. Cùng lý do, không
      // invalidateOnRefresh (giá trị đều là px cố định, không cần đo lại).
      if (ui.length > 0) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root,
              scroller,
              start: 'top 50%',
              toggleActions: 'play none play reverse',
            },
          })
          .fromTo(
            ui,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.9,
              ease: 'power3.out',
            }
          );
      }

      // Veil bàn giao — chạy trong 35dvh đuôi track khi nội dung còn ghim.
      // Nội dung ghim vẫn nằm dưới block sau mà veil thì click-through: cắt
      // pointer-events kẻo tab và hotspot vẫn ăn chuột dù đã bạc trắng.
      if (veil && tail) {
        let covered = false;
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: tail,
              scroller,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 0.4,
              invalidateOnRefresh: true,
              onUpdate: self => {
                const off = self.progress > 0.6;
                if (off !== covered) {
                  covered = off;
                  sticky.style.pointerEvents = off ? 'none' : '';
                }
              },
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.85, immediateRender: false },
            0
          )
          // Neo độ dài timeline = 1, kẻo veil bị kéo giãn ra cả quãng scroll.
          .to({}, { duration: 1 }, 0);
      }
    }, root);

    return () => {
      ctx.revert();
      ro.disconnect();
      window.removeEventListener('resize', stickTop);
      sticky.style.top = '';
      sticky.style.pointerEvents = '';
    };
  }, [rootRef, scroller, isCanvas]);

  // ── Effect B — nội dung tab đang chọn (React thay cả cây DOM theo key) ──
  React.useLayoutEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl || isCanvas) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;
    // Không phải 0: timeline hotspot paused mà dài 0 giây thì tại progress 0
    // đã coi như chạy xong — mọi card hiện sẵn và chặn click.
    const d = reduce ? 0.001 : 1;

    const panels = contentEl.querySelectorAll<HTMLElement>('[data-wr-panel]');
    const info = contentEl.querySelector<HTMLElement>('[data-wr-panel="info"]');
    const planPanel = contentEl.querySelector<HTMLElement>(
      '[data-wr-panel="plan"]'
    );
    const plan = contentEl.querySelector<HTMLElement>('[data-wr-plan]');
    const spots = contentEl.querySelectorAll<HTMLElement>('[data-wr-hotspot]');
    const dots = contentEl.querySelectorAll<HTMLElement>('[data-wr-dot]');
    const hint = contentEl.querySelector<HTMLElement>('[data-wr-hint]');

    // Zoom chạy hoàn toàn bằng transform — không đụng width/height/gap là để
    // khỏi reflow + repaint tấm bản vẽ ~2000px mỗi frame (chỗ giật cũ của apps).
    const INNER_ZOOM = isWide ? 1.18 : 1;
    const ZOOM_DURATION = d * 0.85;
    const ZOOM_EASE = 'power2.inOut';
    const PANEL_SCALE_MAX = 1.16;

    const panelScale = () => {
      if (!isWide || !planPanel) return 1;
      const own = planPanel.offsetWidth;
      if (own <= 0) return 1;
      return gsap.utils.clamp(1, PANEL_SCALE_MAX, contentEl.offsetWidth / own);
    };

    gsap.set(spots, { transformOrigin: '0 0' });
    if (plan) gsap.set(plan, { transformOrigin: '0 0' });
    if (planPanel) gsap.set(planPanel, { transformOrigin: '50% 50%' });

    // Khung lệch phải (INFORMATION chiếm cột trái) — dịch nửa bề rộng cột đó
    // để khung nở quanh tâm cả hàng. offsetLeft là số layout, transform đang
    // chạy không làm sai nó.
    const panelRecenter = () => {
      if (!isWide || !planPanel) return 0;
      return -(planPanel.offsetLeft - contentEl.offsetLeft) / 2;
    };

    // Lần render đầu để Effect A lo phần vào — chạy cả hai sẽ giành autoAlpha.
    if (didMountRef.current) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        panels,
        { autoAlpha: 0, y: reduce ? 0 : 12 },
        { autoAlpha: 1, y: 0, duration: d * 0.45, stagger: d * 0.08 }
      );
      if (!reduce) {
        tl.fromTo(
          dots,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            stagger: { each: 0.04 },
          },
          '-=0.2'
        );
      }
    } else {
      didMountRef.current = true;
      if (reduce) {
        gsap.set(dots, { scale: 1, autoAlpha: 1 });
      } else {
        gsap.fromTo(
          dots,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'back.out(1.7)',
            stagger: { each: 0.04 },
            scrollTrigger: {
              trigger: contentEl,
              scroller,
              start: 'top 70%',
              once: true,
              invalidateOnRefresh: true,
            },
          }
        );
      }
    }

    const timelines = new Map<HTMLElement, gsap.core.Timeline>();
    const hovers = new Map<HTMLElement, gsap.core.Timeline>();
    const cleanups: Array<() => void> = [];
    let open: HTMLElement | null = null;
    let releaseOverflow: gsap.core.Tween | null = null;
    const scrollProxy = { x: 0 };

    // Chỉ mời kéo khi thật sự còn gì để kéo (14B trên máy rộng lọt trọn khung).
    if (hint && planPanel && plan) {
      const syncHint = () => {
        const style = getComputedStyle(planPanel);
        const inner =
          planPanel.clientWidth -
          (parseFloat(style.paddingLeft) || 0) -
          (parseFloat(style.paddingRight) || 0);
        hint.hidden = plan.offsetWidth <= inner + 4;
      };
      syncHint();
      window.addEventListener('resize', syncHint);
      cleanups.push(() => window.removeEventListener('resize', syncHint));
    }

    spots.forEach(spot => {
      const dot = spot.querySelector<HTMLElement>('[data-wr-dot]');
      const card = spot.querySelector<HTMLElement>('[data-wr-card]');
      if (!dot || !card) return;

      const rows = card.querySelectorAll<HTMLElement>('[data-wr-spec]');
      gsap.set(card, { autoAlpha: 0, scale: reduce ? 1 : 0.88 });

      // Chấm → pill có tên phòng. Chỉ chuột thật: touch chạm là mở thẳng card.
      if (finePointer) {
        const label = spot.querySelector<HTMLElement>('[data-wr-label]');
        const icon = spot.querySelector<HTMLElement>('[data-wr-icon]');
        if (label && icon) {
          const hoverTl = gsap
            .timeline({ paused: true, defaults: { ease: 'power3.out' } })
            .to(
              dot,
              {
                backgroundColor: HOTSPOT_ACCENT,
                duration: d * 0.3,
                ease: 'power2.out',
              },
              0
            )
            .to(
              icon,
              { borderColor: 'rgba(255,255,255,0.85)', duration: d * 0.3 },
              0
            )
            .to(label, { width: 'auto', duration: d * 0.42 }, 0)
            .fromTo(
              label,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: d * 0.28 },
              d * 0.08
            );

          hovers.set(spot, hoverTl);

          const onEnter = () => {
            if (open === spot) return;
            hoverTl.timeScale(1).play();
          };
          const onLeave = () => hoverTl.timeScale(1.25).reverse();

          dot.addEventListener('mouseenter', onEnter);
          dot.addEventListener('mouseleave', onLeave);
          dot.addEventListener('focus', onEnter);
          dot.addEventListener('blur', onLeave);
          cleanups.push(() => {
            dot.removeEventListener('mouseenter', onEnter);
            dot.removeEventListener('mouseleave', onLeave);
            dot.removeEventListener('focus', onEnter);
            dot.removeEventListener('blur', onLeave);
            hoverTl.kill();
          });
        }
      }

      // Mobile: card ghim hẳn một bên là tràn khung — kéo lại nửa bề rộng.
      const cardShift = isWide ? 0 : Number(spot.dataset.x) > 55 ? 50 : -50;

      // Chấm thu về 0 ngay; card đợi bản vẽ gần dừng mới bung.
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to(dot, { scale: 0, autoAlpha: 0, duration: d * 0.28 }, 0)
        .fromTo(
          card,
          { autoAlpha: 0, scale: reduce ? 1 : 0.9, xPercent: cardShift },
          { autoAlpha: 1, scale: 1, xPercent: cardShift, duration: d * 0.5 },
          ZOOM_DURATION * 0.55
        )
        .fromTo(
          rows,
          { autoAlpha: 0, y: reduce ? 0 : 6 },
          { autoAlpha: 1, y: 0, duration: d * 0.38, stagger: d * 0.05 },
          `<${d * 0.12}`
        );

      timelines.set(spot, tl);
    });

    // Vào/ra chế độ zoom — transform + opacity only.
    const setZoomStage = (
      on: boolean,
      activeSpot: HTMLElement | null,
      speed = 1
    ) => {
      const shared = {
        duration: ZOOM_DURATION / speed,
        ease: ZOOM_EASE,
        overwrite: true,
      } as const;
      const scale = on ? panelScale() : 1;

      if (planPanel) {
        if (on) gsap.set(planPanel, { zIndex: 20 });
        gsap.to(planPanel, {
          scale,
          x: on ? panelRecenter() : 0,
          force3D: true,
          ...shared,
          onReverseComplete: () => gsap.set(planPanel, { zIndex: 'auto' }),
          onComplete: on
            ? undefined
            : () => gsap.set(planPanel, { zIndex: 'auto' }),
        });
      }

      if (info && isWide) {
        gsap.to(info, {
          xPercent: on ? -100 : 0,
          autoAlpha: on ? 0 : 1,
          ...shared,
        });
      }

      // Chấm/card nằm trong hai lớp đang scale — nghịch đảo đúng tích để giữ
      // kích thước hiển thị; lúc zoom chỉ giữ hotspot đang mở.
      spots.forEach(other => {
        gsap.to(other, {
          scale: on ? 1 / (scale * INNER_ZOOM) : 1,
          autoAlpha: on && other !== activeSpot ? 0 : 1,
          ...shared,
        });
      });
    };

    /**
     * Ngắm bản vẽ vào một điểm. xPercent/yPercent với origin cố định ở góc —
     * đổi transformOrigin giữa chừng làm phần tử nhảy, còn dịch chuyển thì nội
     * suy được. Mobile: bản vẽ đang cuộn ngang nên "ngắm" là tween scrollLeft
     * (proxy — không dùng ScrollToPlugin, foundation không đăng ký).
     */
    const focusPlan = (x: number, y: number, scale: number, speed = 1) => {
      if (!plan) return;
      const duration = ZOOM_DURATION / speed;

      if (!isWide) {
        if (planPanel) {
          const pad = parseFloat(getComputedStyle(planPanel).paddingLeft) || 0;
          const target =
            pad + (x / 100) * plan.offsetWidth - planPanel.clientWidth / 2;
          gsap.killTweensOf(scrollProxy);
          scrollProxy.x = planPanel.scrollLeft;
          gsap.to(scrollProxy, {
            x: target,
            duration,
            ease: ZOOM_EASE,
            onUpdate: () => {
              planPanel.scrollLeft = scrollProxy.x;
            },
          });
        }
        return;
      }

      const clampPan = gsap.utils.clamp(-(scale - 1) * 100, 0);
      gsap.to(plan, {
        scale,
        xPercent: clampPan(50 - scale * x),
        yPercent: clampPan(50 - scale * y),
        duration,
        ease: ZOOM_EASE,
        force3D: true,
        overwrite: true,
      });
    };

    // Card bung từ chấm sát rìa sẽ thò ra ngoài khung khi cuộn đã kịch biên —
    // tính trước chỗ card đứng rồi bù bằng x px.
    const clampCard = (spot: HTMLElement, x: number) => {
      const card = spot.querySelector<HTMLElement>('[data-wr-card]');
      if (isWide || !card || !plan || !planPanel) return;

      const pad = parseFloat(getComputedStyle(planPanel).paddingLeft) || 0;
      const view = planPanel.clientWidth;
      const maxScroll = Math.max(0, planPanel.scrollWidth - view);
      const dotX = pad + (x / 100) * plan.offsetWidth;
      const scroll = gsap.utils.clamp(0, maxScroll, dotX - view / 2);
      const center = dotX - scroll;

      const half = card.offsetWidth / 2;
      const min = CARD_EDGE + half;
      const max = view - CARD_EDGE - half;
      const target = max < min ? view / 2 : gsap.utils.clamp(min, max, center);
      gsap.set(card, { x: target - center });
    };

    const resetPill = (spot: HTMLElement, dot: HTMLElement | null) => {
      const hoverTl = hovers.get(spot);
      if (!hoverTl) return;
      if (dot?.matches(':hover')) hoverTl.timeScale(1).play();
      else hoverTl.progress(0).pause();
    };

    const collapseCard = (spot: HTMLElement) => {
      const tl = timelines.get(spot);
      const dot = spot.querySelector<HTMLElement>('[data-wr-dot]');
      if (!tl) return;
      const card = spot.querySelector<HTMLElement>('[data-wr-card]');
      dot?.setAttribute('aria-expanded', 'false');
      tl.eventCallback('onReverseComplete', () => {
        gsap.set(spot, { zIndex: 'auto' });
        if (card) gsap.set(card, { x: 0 });
        resetPill(spot, dot);
      });
      tl.timeScale(reduce ? 1 : 1.35).reverse();
    };

    const closeSpot = (spot: HTMLElement) => {
      collapseCard(spot);
      if (open !== spot) return;
      open = null;
      const speed = reduce ? 1 : 1.2;
      setZoomStage(false, null, speed);
      focusPlan(0, 0, 1, speed);
      // Nhả overflow sau khi khung co xong, không thì bản vẽ đang phóng tràn
      // ra ngoài panel trong đoạn thu về.
      releaseOverflow?.kill();
      releaseOverflow = gsap.delayedCall(ZOOM_DURATION / speed, () => {
        if (planPanel) planPanel.style.overflow = '';
        releaseOverflow = null;
      });
    };

    const openSpot = (spot: HTMLElement) => {
      if (open === spot) return;
      const tl = timelines.get(spot);
      const dot = spot.querySelector<HTMLElement>('[data-wr-dot]');
      if (!tl) return;

      if (open) collapseCard(open);

      const x = Number(spot.dataset.x);
      const y = Number(spot.dataset.y);

      dot?.setAttribute('aria-expanded', 'true');
      hovers.get(spot)?.progress(0).pause();
      gsap.set(spot, { zIndex: 30 });
      releaseOverflow?.kill();
      releaseOverflow = null;
      if (planPanel && isWide) planPanel.style.overflow = 'hidden';

      setZoomStage(true, spot);
      focusPlan(x, y, INNER_ZOOM);
      clampCard(spot, x);
      tl.timeScale(1).play();
      open = spot;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const closer = target.closest<HTMLElement>('[data-wr-close]');
      if (closer) {
        const spot = closer.closest<HTMLElement>('[data-wr-hotspot]');
        if (spot) closeSpot(spot);
        return;
      }

      const dot = target.closest<HTMLElement>('[data-wr-dot]');
      if (!dot) return;
      const spot = dot.closest<HTMLElement>('[data-wr-hotspot]');
      if (spot) (open === spot ? closeSpot : openSpot)(spot);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!open) return;
      const target = e.target;
      if (target instanceof Node && plan?.contains(target)) return;
      closeSpot(open);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !open) return;
      const dot = open.querySelector<HTMLElement>('[data-wr-dot]');
      closeSpot(open);
      dot?.focus();
    };

    contentEl.addEventListener('click', onClick);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    // R4 — bản vẽ load xong thì refresh (chiều cao content đổi theo ảnh).
    const planImg = plan?.querySelector<HTMLImageElement>('img');
    if (planImg && !planImg.complete) {
      planImg.addEventListener('load', requestRefresh, { once: true });
      cleanups.push(() => planImg.removeEventListener('load', requestRefresh));
    }

    return () => {
      contentEl.removeEventListener('click', onClick);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      cleanups.forEach(fn => fn());
      timelines.forEach(tl => tl.kill());
      hovers.forEach(tl => tl.kill());
      releaseOverflow?.kill();
      gsap.killTweensOf(scrollProxy);
    };
  }, [activeResolvedId, isWide, isCanvas, scroller, requestRefresh]);

  const selectResidence = (id: string) => {
    if (id === activeResolvedId) return;
    const contentEl = contentRef.current;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!contentEl || reduce || isCanvas) {
      setActiveId(id);
      return;
    }
    gsap.to(contentEl, {
      autoAlpha: 0,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
      overwrite: true,
      onComplete: () => setActiveId(id),
    });
  };

  const onTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const next =
      residences[(activeIndex + step + residences.length) % residences.length];
    const nextId = residenceId(next, residences.indexOf(next));
    selectResidence(nextId);
    e.currentTarget
      .querySelector<HTMLButtonElement>(`[data-wr-tab-id="${nextId}"]`)
      ?.focus();
  };

  const renderHeaderFields = () => (
    <>
      <p
        data-wr-ui=''
        data-element-key='eyebrow'
        className={selectableClass(activeKey === 'eyebrow')}
        style={composeStyle(UI_LABEL_STYLE, styleOf('eyebrow'))}
      >
        {eyebrow}
      </p>
      <h2
        data-wr-ui=''
        data-element-key='title'
        className={selectableClass(activeKey === 'title')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 'clamp(12px, 1.4cqi, 20px)',
            fontSize: 'clamp(28px, 4.7cqi, 48px)',
            lineHeight: 1.2,
            fontWeight: 500,
            color: ACCENT,
          },
          styleOf('title')
        )}
      >
        {title}
      </h2>
      <p
        data-wr-ui=''
        data-element-key='subtitle'
        className={selectableClass(activeKey === 'subtitle')}
        style={composeStyle(
          {
            margin: 0,
            marginTop: 'clamp(20px, 2.2cqi, 32px)',
            fontFamily: WESTLY_FONT_UI,
            fontSize: 'clamp(14px, 1.6cqi, 16px)',
            lineHeight: 1.6,
            color: ACCENT,
          },
          styleOf('subtitle')
        )}
      >
        {subtitle}
      </p>
    </>
  );

  // ── Editor canvas: layout phẳng — header + mỗi căn một card (tên, bản vẽ,
  //    2 link). details/hotspots sửa qua AI/JSON — ghi chú ngay trên canvas. ──
  if (isCanvas) {
    return (
      <section
        ref={rootRef}
        data-westly-scope=''
        data-canvas-edit='true'
        className={cn('@container relative w-full', className)}
        style={composeStyle(
          {
            fontFamily: WESTLY_FONT_DISPLAY,
            backgroundColor: bgColor,
            padding: '40px 24px',
          },
          blockBackgroundStyle(background)
        )}
      >
        <div
          style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}
        >
          {renderHeaderFields()}
        </div>

        <div className='mt-8 grid grid-cols-1 gap-5 @4xl:grid-cols-3'>
          {residences.map((r, i) => (
            <figure
              key={residenceId(r, i)}
              style={{
                margin: 0,
                border: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
                padding: 16,
              }}
            >
              <span
                data-element-key={`residences[${i}].title`}
                className={selectableClass(
                  activeKey === `residences[${i}].title`
                )}
                style={composeStyle(
                  {
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: 999,
                    backgroundColor: ACCENT,
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 500,
                  },
                  styleOf(`residences[${i}].title`)
                )}
              >
                {r.title || `Căn ${i + 1}`}
              </span>

              {/* Tile theo ĐÚNG tỉ lệ bản vẽ (không phải 2/1 cứng) — chấm
                  hotspot đặt theo % của tile, tile khít ảnh thì chấm mới rơi
                  đúng phòng khi chỉnh X/Y trong toolbar. */}
              <div
                style={{
                  position: 'relative',
                  marginTop: 12,
                  aspectRatio: r.planRatio || '2 / 1',
                  overflow: 'hidden',
                  backgroundColor: '#fafafa',
                  border: '1px solid #eee',
                }}
              >
                <img
                  src={r.planUrl || ''}
                  alt={r.planAlt || ''}
                  data-element-key={`residences[${i}].planUrl`}
                  className={selectableClass(
                    activeKey === `residences[${i}].planUrl`
                  )}
                  style={composeStyle(
                    {
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    },
                    styleOf(`residences[${i}].planUrl`)
                  )}
                />
                {/* Preview vị trí hotspot — chỉnh X/Y trong toolbar thấy ngay */}
                {(r.hotspots ?? []).map((h, hi) => (
                  <span
                    key={h.id ?? hi}
                    aria-hidden
                    title={h.name}
                    style={{
                      position: 'absolute',
                      left: `${h.x ?? 0}%`,
                      top: `${h.y ?? 0}%`,
                      width: 10,
                      height: 10,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: 999,
                      backgroundColor: '#1F1F1F',
                      border: '1.5px solid #ffffff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                      pointerEvents: 'none',
                    }}
                  />
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {/* Chip mở toolbar quản lý hotspot (tên / X / Y / specs) */}
                <span
                  data-element-key={`residences[${i}].hotspots`}
                  className={selectableClass(
                    activeKey === `residences[${i}].hotspots`
                  )}
                  style={composeStyle(
                    {
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      border: '1px solid #e5e5e5',
                      backgroundColor: '#fafafa',
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#404040',
                    },
                    styleOf(`residences[${i}].hotspots`)
                  )}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      backgroundColor: '#1F1F1F',
                      display: 'inline-block',
                    }}
                  />
                  Hotspot ({r.hotspots?.length ?? 0})
                </span>
                {(
                  [
                    [`residences[${i}].listingUrl`, 'Link listing'],
                    [`residences[${i}].floorPlanUrl`, 'Link floor plan (PDF)'],
                  ] as const
                ).map(([key, label]) => (
                  <a
                    key={key}
                    data-element-key={key}
                    href={undefined}
                    onClick={e => e.preventDefault()}
                    className={selectableClass(activeKey === key)}
                    style={composeStyle(
                      {
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        border: '1px solid #e5e5e5',
                        fontSize: 12,
                        color: ACCENT,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      },
                      styleOf(key)
                    )}
                  >
                    {label}
                  </a>
                ))}
              </div>

              <figcaption
                style={{ marginTop: 10, fontSize: 11, color: '#737373' }}
              >
                Hotspot chỉnh qua chip bên trên (hoặc panel Lớp) · thông số
                INFORMATION sửa bằng AI edit
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  // ── PreviewMode + /p: production ──
  const planH = isWide ? 440 : isMobile ? 320 : 360;
  const ratio = westlyPlanRatio(active);
  const dotSize = isWide ? 28 : 26;

  return (
    <section
      ref={rootRef}
      data-westly-scope=''
      className={cn('@container relative w-full', className)}
      style={composeStyle(
        { fontFamily: WESTLY_FONT_DISPLAY, backgroundColor: bgColor },
        blockBackgroundStyle(background)
      )}
    >
      {pointer}
      {/* Nội dung ghim (top âm do JS) — giữ nguyên màn cuối cho veil chạy. */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky',
          zIndex: 10,
          width: '100%',
          padding: 'clamp(64px, 6.5cqi, 96px) 0',
        }}
      >
        {/* Cả khối nội dung là một CỔNG — chỉ hiện khi block đã vào nửa màn. */}
        <div
          data-wr='content'
          style={{
            margin: '0 auto',
            width: '100%',
            maxWidth: 1440,
            padding: '0 clamp(20px, 2.8cqi, 40px)',
          }}
        >
          <header
            style={{ margin: '0 auto', maxWidth: '42rem', textAlign: 'center' }}
          >
            {renderHeaderFields()}

            <div
              data-wr-ui=''
              role='tablist'
              aria-label='Available residences'
              onKeyDown={onTabKeyDown}
              style={{
                marginTop: 'clamp(32px, 3.4cqi, 48px)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {residences.map((r, i) => {
                const id = residenceId(r, i);
                const selected = id === activeResolvedId;
                return (
                  <button
                    key={id}
                    type='button'
                    role='tab'
                    data-wr-tab-id={id}
                    aria-selected={selected}
                    aria-controls='westly-residence-panel'
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectResidence(id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 999,
                      padding: '10px 24px',
                      minHeight: 44,
                      fontSize: 'clamp(15px, 1.6cqi, 16px)',
                      transition:
                        'color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease',
                      border: selected
                        ? '1px solid transparent'
                        : `1px solid ${ACCENT}40`,
                      backgroundColor: selected ? ACCENT : '#ffffff',
                      color: selected ? '#ffffff' : ACCENT,
                    }}
                  >
                    {r.title || `Căn ${i + 1}`}
                  </button>
                );
              })}
            </div>
          </header>

          <div
            key={activeResolvedId}
            ref={contentRef}
            id='westly-residence-panel'
            role='tabpanel'
            aria-label={active.title}
            style={{
              marginTop: 'clamp(40px, 4cqi, 56px)',
              display: 'flex',
              flexDirection: isWide ? 'row' : 'column',
              alignItems: isWide ? 'stretch' : undefined,
            }}
          >
            {/* Khe hai cột nằm trong padding của aside (không phải gap) — lúc
                zoom aside co về 0 thì khe biến mất theo, khỏi animate layout. */}
            <aside
              data-wr-panel='info'
              style={{
                overflow: 'hidden',
                ...(isWide
                  ? {
                      display: 'flex',
                      flexDirection: 'column',
                      width: 364,
                      flexShrink: 0,
                      paddingRight: 24,
                    }
                  : { paddingBottom: 20 }),
              }}
            >
              <div
                style={{
                  border: `1px solid ${ACCENT}26`,
                  backgroundColor: '#ffffff',
                  padding: 'clamp(28px, 2.4cqi, 32px) clamp(24px, 2cqi, 28px)',
                  ...(isWide ? { width: 340, flex: 1 } : {}),
                }}
              >
                <p style={{ ...UI_LABEL_STYLE, textAlign: 'center' }}>
                  Information
                </p>

                <div
                  style={{
                    marginTop: 32,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    columnGap: 24,
                    rowGap: 20,
                  }}
                >
                  <Detail label='Bed/bath' value={active.details?.bedBath} />
                  <Detail label='Price' value={active.details?.price} />
                  <Detail
                    label='Estimated Monthly Re Tax'
                    value={active.details?.reTax}
                  />
                  <Detail
                    label='Estimated Monthly CC'
                    value={active.details?.monthlyCc}
                  />
                  <Detail label='Int/Ext SF' value={active.details?.intExt} />
                  <Detail label='Exposure' value={active.details?.exposure} />
                  <Detail label='Status' value={active.details?.status} />
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 500,
                        color: ACCENT,
                      }}
                    >
                      Listing
                    </p>
                    <a
                      href={active.listingUrl || '#'}
                      aria-label={`View listing for ${active.title}`}
                      style={{
                        display: 'inline-block',
                        fontSize: 14,
                        fontWeight: 700,
                        color: ACCENT,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      }}
                    >
                      View Listing
                    </a>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 500,
                        color: ACCENT,
                      }}
                    >
                      Floor plan
                    </p>
                    <a
                      href={active.floorPlanUrl || '#'}
                      aria-label={`Download floor plan PDF for ${active.title}`}
                      style={{
                        marginTop: 4,
                        display: 'inline-flex',
                        color: ACCENT,
                      }}
                    >
                      <PdfIcon />
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Bản vẽ — mobile cuộn ngang thay vì co ảnh (chấm chồng nhau,
                không bấm nổi); từ isWide là hai cột + zoom transform. */}
            <div
              style={{
                display: 'flex',
                minWidth: 0,
                flex: 1,
                flexDirection: 'column',
              }}
            >
              <div
                data-wr-panel='plan'
                style={{
                  display: 'flex',
                  border: `1px solid ${ACCENT}26`,
                  backgroundColor: '#ffffff',
                  padding: isWide ? 24 : 16,
                  ...(isWide
                    ? { minHeight: 0, flex: 1, overflow: 'hidden' }
                    : { overflowX: 'auto' }),
                }}
              >
                <div
                  data-wr-plan=''
                  style={{
                    position: 'relative',
                    margin: 'auto',
                    flexShrink: 0,
                    willChange: 'transform',
                    aspectRatio: active.planRatio || '2 / 1',
                    width: isWide
                      ? `min(100%, ${Math.round(planH * ratio)}px)`
                      : `${Math.round(planH * ratio)}px`,
                  }}
                >
                  <img
                    src={active.planUrl || ''}
                    alt={active.planAlt || ''}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />

                  {(active.hotspots ?? []).map((spot, si) => {
                    const x = spot.x ?? 0;
                    const y = spot.y ?? 0;
                    return (
                      <div
                        key={spot.id ?? si}
                        data-wr-hotspot=''
                        data-x={x}
                        data-y={y}
                        style={{
                          position: 'absolute',
                          left: `${x}%`,
                          top: `${y}%`,
                        }}
                      >
                        {/* Nghỉ: chấm tròn (label rộng 0). Hover: label giãn ra,
                            nền đổi cam — cùng một nút. */}
                        <button
                          type='button'
                          data-wr-dot=''
                          aria-expanded='false'
                          aria-controls={`westly-hotspot-${activeResolvedId}-${si}`}
                          aria-label={`Show details for ${spot.name}`}
                          style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            height: dotSize,
                            transform: 'translate(-50%, -50%)',
                            cursor: 'pointer',
                            borderRadius: 999,
                            border: 'none',
                            padding: 0,
                            backgroundColor: '#1F1F1F',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                            visibility: 'hidden',
                            opacity: 0,
                          }}
                        >
                          {/* Nới vùng chạm (touch) mà không đổi hình chấm */}
                          {!isWide && (
                            <span
                              aria-hidden
                              style={{ position: 'absolute', inset: -6 }}
                            />
                          )}
                          <span
                            data-wr-icon=''
                            style={{
                              display: 'flex',
                              width: dotSize,
                              height: dotSize,
                              flexShrink: 0,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 999,
                              border: '1px solid transparent',
                            }}
                          >
                            <PlusIcon />
                          </span>
                          <span
                            data-wr-label=''
                            style={{
                              width: 0,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                paddingRight: 14,
                                paddingLeft: 2,
                                fontFamily: WESTLY_FONT_UI,
                                fontSize: 10,
                                lineHeight: 1,
                                fontWeight: 500,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {spot.name}
                            </span>
                          </span>
                        </button>

                        <div
                          id={`westly-hotspot-${activeResolvedId}-${si}`}
                          data-wr-card=''
                          style={{
                            position: 'absolute',
                            width: isWide ? 224 : 184,
                            padding: 14,
                            color: '#ffffff',
                            backgroundColor: HOTSPOT_ACCENT,
                            visibility: 'hidden',
                            opacity: 0,
                            ...cardAlignStyle(x, y),
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: 12,
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontFamily: WESTLY_FONT_UI,
                                fontSize: 10,
                                lineHeight: 1.3,
                                fontWeight: 500,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {spot.name}
                            </p>
                            <button
                              type='button'
                              data-wr-close=''
                              aria-label={`Hide details for ${spot.name}`}
                              style={{
                                margin: '-4px -4px 0 0',
                                display: 'flex',
                                width: 20,
                                height: 20,
                                flexShrink: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: 'none',
                                background: 'transparent',
                                color: 'inherit',
                                padding: 0,
                              }}
                            >
                              <MinusIcon />
                            </button>
                          </div>

                          <div
                            style={{
                              marginTop: 12,
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              columnGap: 12,
                              rowGap: 10,
                            }}
                          >
                            {(spot.specs ?? []).map(spec => (
                              <div key={spec.label} data-wr-spec=''>
                                <p
                                  style={{
                                    margin: 0,
                                    fontFamily: WESTLY_FONT_UI,
                                    fontSize: 9,
                                    lineHeight: 1,
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.7)',
                                  }}
                                >
                                  {spec.label}
                                </p>
                                <p
                                  style={{
                                    margin: '4px 0 0',
                                    fontFamily: WESTLY_FONT_UI,
                                    fontSize: 11,
                                    lineHeight: 1.3,
                                    fontWeight: 500,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {spec.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Effect B tự ẩn khi bản vẽ lọt trọn khung */}
              {!isWide && (
                <p
                  data-wr-hint=''
                  style={{
                    margin: '8px 0 0',
                    textAlign: 'center',
                    fontFamily: WESTLY_FONT_UI,
                    fontSize: 12,
                    color: `${ACCENT}b3`,
                  }}
                >
                  Kéo ngang để xem hết bản vẽ
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Blend veil — cùng màu nền block sau, tan vào thay vì bị cắt mép. */}
        <div
          data-wr='veil'
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            backgroundColor: veilColor,
            opacity: 0,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        />
      </div>

      {/* Đuôi track — ngân sách scroll cho veil trong lúc nội dung còn ghim. */}
      <div data-wr='tail' aria-hidden style={{ height: '35dvh' }} />
    </section>
  );
}
