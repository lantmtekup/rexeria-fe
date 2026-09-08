'use client';

/**
 * Engine snap cấp trang — một cú vuốt = một section.
 * Port từ `apps/212-west/app/components/SectionSnap.tsx`.
 *
 * Dùng chung bởi HAI mặt tiền:
 * - `transitions/SnapStack.tsx` (preset transition `snap`) — đo `root.children`
 * - `blocks/PageSnap.tsx` (block `page_snap`) — đo `[data-block-id]` trong scroller
 *
 * Chỉ MỘT instance được arm trên mỗi scroller: instance đầu tiên cắm cờ
 * `data-snap-owner` lên scroller, instance sau thấy cờ thì tự nằm im. Nhờ vậy
 * bật cả preset lẫn block (hoặc lỡ thả 2 block) cũng không hijack chồng.
 *
 * Vài điểm dễ làm sai, đã trả giá:
 * - **Mốc dừng phải bottom-align**, không phải `top + k·vh`. `100svh`/`200svh`
 *   trong block là đơn vị VIEWPORT, không biết device frame (frame cao
 *   `100vh − 28px`) → công thức `k·vh` lệch 56px trong PreviewMode và wipe của
 *   hero dừng ở ~94%. `top + k·(h − vh)/(n − 1)` khớp đúng chỗ ScrollTrigger
 *   `end:'bottom bottom'` đạt progress 1, ở CẢ hai ngữ cảnh.
 * - **Phải bỏ qua `data-lenis-prevent`** trước khi `preventDefault`, đúng như
 *   Lenis làm; thiếu bước này thì mọi drawer trong block đứng cứng.
 */

import * as React from 'react';
import gsap from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import { useLandingMotion } from './LandingMotion';

gsap.registerPlugin(Observer, ScrollToPlugin);

/** Bề rộng SCROLLER tối thiểu (không phải viewport — frame 834 trong cửa sổ
 *  1600 phải tắt). Khớp `min-width: 1280px` của prototype. */
export const SNAP_DEFAULT_MIN_WIDTH = 1280;
export const SNAP_DEFAULT_DURATION = 1.1;

/** Chờ scrub (vd hero `scrub: 0.8`) bắt kịp trước khi nhận cử chỉ mới. */
const RELEASE_TAIL_MS = 150;
/** Phòng khi onComplete không về thì vẫn nhả khoá. */
const BUSY_TIMEOUT_MS = 3000;

// ── Cổng cử chỉ: port nguyên văn từ apps/212-west ──
const GESTURE_GAP_MS = 180;
const WHEEL_THRESHOLD = 10;
const LINE_HEIGHT = 16;
const NEW_GESTURE_RISES = 3;
const TOUCH_TOLERANCE = 30;

const DEDUPE_EPS = 2;
const OWNER_ATTR = 'data-snap-owner';

const PREVENT_ATTRS = [
  'data-lenis-prevent',
  'data-lenis-prevent-vertical',
  'data-lenis-prevent-wheel',
  'data-snap-ignore',
] as const;

type LenisLike = { stop: () => void; start: () => void };

const getLenis = (): LenisLike | undefined =>
  (window as unknown as { __lenis?: LenisLike }).__lenis;

/** Giống `onVirtualScroll` của Lenis: đi ngược composed path tìm vùng chặn. */
function isPrevented(path: EventTarget[]): boolean {
  return path.some(
    node =>
      node instanceof HTMLElement &&
      PREVENT_ATTRS.some(attr => node.hasAttribute(attr))
  );
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

const NEXT_KEYS = new Set(['ArrowDown', 'PageDown', ' ']);
const PREV_KEYS = new Set(['ArrowUp', 'PageUp']);

export interface SnapScrollOptions {
  /** Tắt hẳn (canvas edit, block ẩn, user tắt trong CMS). */
  enabled?: boolean;
  /** Bề rộng scroller tối thiểu mới bật. */
  minWidth?: number;
  /** Thời lượng tween giữa 2 mốc (giây). */
  duration?: number;
  /**
   * Trả về danh sách section để tính mốc dừng. Gọi lại MỖI cử chỉ (DOM sống —
   * miễn nhiễm ảnh load, pin-spacer đổi, ScrollTrigger.refresh).
   */
  getSections: () => HTMLElement[];
}

/**
 * Cắm engine snap vào scroller hiện tại (`useLandingMotion().scroller`, `null`
 * = window). Trả về `true` khi instance này đang thực sự nắm quyền.
 */
export function useSnapScroll({
  enabled = true,
  minWidth = SNAP_DEFAULT_MIN_WIDTH,
  duration = SNAP_DEFAULT_DURATION,
  getSections,
}: SnapScrollOptions): void {
  const { scroller } = useLandingMotion();
  // Giữ callback mới nhất trong ref để effect không phụ thuộc identity closure.
  const sectionsRef = React.useRef(getSections);
  sectionsRef.current = getSections;

  React.useEffect(() => {
    if (!enabled) return;

    // ── Adapter window ↔ div: một shape cho mọi ngữ cảnh ──
    const el = scroller;
    const target: HTMLElement | Window = el ?? window;
    const ownerNode: HTMLElement = el ?? document.documentElement;
    const viewH = () =>
      el ? el.clientHeight : document.documentElement.clientHeight;
    const viewW = () =>
      el ? el.clientWidth : document.documentElement.clientWidth;
    const scrollY = () => (el ? el.scrollTop : window.scrollY);
    const maxY = () =>
      el
        ? el.scrollHeight - el.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
    /** Gốc toạ độ để quy `getBoundingClientRect` về hệ của scroller. */
    const originY = () => (el ? el.getBoundingClientRect().top : 0);

    // ── Mốc dừng: dựng lại mỗi cử chỉ, KHÔNG cache ──
    const buildStops = (): number[] => {
      const vh = viewH();
      const limit = maxY();
      if (!vh || limit <= 0) return [];

      const base = originY();
      const now = scrollY();
      const out: number[] = [];

      for (const section of sectionsRef.current()) {
        if (
          section.hasAttribute('data-snap-skip') ||
          section.querySelector('[data-snap-skip]')
        ) {
          continue;
        }
        const top = Math.round(
          section.getBoundingClientRect().top - base + now
        );
        const h = section.offsetHeight;
        const forced = Number(
          section.getAttribute('data-snap-steps') ??
            section
              .querySelector('[data-snap-steps]')
              ?.getAttribute('data-snap-steps')
        );
        const n =
          forced > 0 ? Math.floor(forced) : Math.max(1, Math.round(h / vh));

        if (n === 1) {
          out.push(top);
          continue;
        }
        for (let k = 0; k < n; k += 1) {
          out.push(top + Math.round((k * (h - vh)) / (n - 1)));
        }
      }

      return out
        .map(y => Math.min(Math.max(y, 0), limit))
        .sort((a, b) => a - b)
        .filter((y, i, arr) => i === 0 || y - arr[i - 1] > DEDUPE_EPS);
    };

    /** Suy từ scrollY thật để kéo scrollbar / resize không làm lệch index. */
    const currentIndex = (stops: number[]): number => {
      const y = scrollY();
      let best = 0;
      let bestDistance = Infinity;
      stops.forEach((stop, index) => {
        const distance = Math.abs(stop - y);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      return best;
    };

    // ── busy / watchdog / tween ──
    let busy = false;
    let watchdog = 0;
    let tail = 0;
    let tween: gsap.core.Tween | null = null;

    const release = () => {
      window.clearTimeout(watchdog);
      window.clearTimeout(tail);
      tail = window.setTimeout(() => {
        busy = false;
      }, RELEASE_TAIL_MS);
    };

    const hold = () => {
      busy = true;
      window.clearTimeout(watchdog);
      window.clearTimeout(tail);
      watchdog = window.setTimeout(() => {
        busy = false;
      }, BUSY_TIMEOUT_MS);
    };

    const scrollToY = (y: number) => {
      tween?.kill();
      tween = gsap.to(target, {
        scrollTo: { y, autoKill: false },
        duration,
        ease: 'power2.inOut',
        overwrite: 'auto',
        onComplete: release,
        onInterrupt: release,
      });
    };

    const goTo = (index: number) => {
      const stops = buildStops();
      if (stops.length < 2) return;
      const from = currentIndex(stops);
      const to = Math.min(Math.max(index, 0), stops.length - 1);
      if (to === from) return;
      hold();
      scrollToY(stops[to]);
    };

    const step = (direction: 1 | -1) => {
      goTo(currentIndex(buildStops()) + direction);
    };

    // Cổng cử chỉ — port nguyên văn từ apps/212-west. Cử chỉ mới bắt đầu khi có
    // khoảng lặng, hoặc đổi chiều (quán tính không bao giờ đổi dấu), hoặc
    // |delta| tăng liên tiếp (ngón tay mới trong cùng chiều). Cử chỉ bắt đầu
    // lúc đang busy (đuôi quán tính) thì bỏ cả cử chỉ.
    // KHÔNG "dọn dẹp" interplay `fired = busy` — đó là thứ chặn momentum tail.
    const makeGate = (threshold: number) => {
      let lastAt = 0;
      let lastSign = 0;
      let sum = 0;
      let fired = false;
      let prevAbs = 0;
      let minAbs = Infinity;
      let rises = 0;

      const begin = () => {
        sum = 0;
        fired = busy;
        minAbs = Infinity;
        rises = 0;
      };

      return (delta: number, at: number) => {
        const sign = Math.sign(delta);
        const abs = Math.abs(delta);
        const flipped = sign !== 0 && lastSign !== 0 && sign !== lastSign;

        if (flipped || at - lastAt > GESTURE_GAP_MS) {
          begin();
        } else if (fired && !busy) {
          rises = abs > prevAbs ? rises + 1 : 0;
          if (rises >= NEW_GESTURE_RISES && abs >= minAbs * 2) begin();
        }

        lastAt = at;
        prevAbs = abs;
        minAbs = Math.min(minAbs, abs);
        if (sign !== 0) lastSign = sign;
        if (fired) return;
        if (busy) {
          fired = true;
          return;
        }
        sum += delta;
        if (Math.abs(sum) < threshold) return;
        fired = true;
        step(sum > 0 ? 1 : -1);
      };
    };

    let wheelGate = makeGate(WHEEL_THRESHOLD);
    let touchGate = makeGate(1);

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // pinch-zoom
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; // carousel ngang
      if (isPrevented(event.composedPath())) return; // drawer trong block
      getLenis()?.stop();
      event.preventDefault();
      const scale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? LINE_HEIGHT
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? viewH()
            : 1;
      wheelGate(event.deltaY * scale, event.timeStamp);
    };

    const inScope = (node: EventTarget | null): boolean => {
      if (node === document.body || node === document.documentElement) {
        return true;
      }
      if (!(node instanceof Node)) return false;
      return !el || el.contains(node);
    };

    const onKey = (event: KeyboardEvent) => {
      if (busy || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target) || !inScope(event.target)) return;
      // Space trên nút/link là bấm nút, không phải cuộn.
      if (
        event.key === ' ' &&
        event.target instanceof HTMLElement &&
        ['BUTTON', 'A'].includes(event.target.tagName)
      ) {
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        goTo(Infinity);
      } else if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        step(event.shiftKey && event.key === ' ' ? -1 : 1);
      } else if (PREV_KEYS.has(event.key)) {
        event.preventDefault();
        step(-1);
      }
    };

    // ── Bật / tắt ──
    let armed = false;
    let observer: Observer | null = null;
    let touchPrevented = false;

    const arm = () => {
      wheelGate = makeGate(WHEEL_THRESHOLD);
      touchGate = makeGate(1);
      ownerNode.setAttribute(OWNER_ATTR, 'true');
      target.addEventListener('wheel', onWheel as EventListener, {
        passive: false,
      });
      window.addEventListener('keydown', onKey);
      observer = Observer.create({
        target: el ?? window,
        type: 'touch',
        tolerance: TOUCH_TOLERANCE,
        preventDefault: true,
        // Observer KHÔNG tự honour data-lenis-prevent → tự chặn theo press target.
        onPress: self =>
          (touchPrevented = isPrevented(
            self.event.composedPath?.() ?? [self.target as EventTarget]
          )),
        onDown: () => {
          if (!touchPrevented) touchGate(1, performance.now());
        },
        onUp: () => {
          if (!touchPrevented) touchGate(-1, performance.now());
        },
      });
    };

    const disarm = () => {
      ownerNode.removeAttribute(OWNER_ATTR);
      target.removeEventListener('wheel', onWheel as EventListener);
      window.removeEventListener('keydown', onKey);
      observer?.kill();
      observer = null;
      tween?.kill();
      tween = null;
      window.clearTimeout(watchdog);
      window.clearTimeout(tail);
      busy = false;
      getLenis()?.start();
    };

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const evaluate = () => {
      // Chỉ một chủ sở hữu / scroller: preset + block cùng bật cũng không chồng.
      const ownedByOther = ownerNode.hasAttribute(OWNER_ATTR) && !armed;
      const ok =
        !ownedByOther &&
        !mq.matches &&
        viewW() >= minWidth &&
        buildStops().length >= 2;
      if (ok === armed) return;
      armed = ok;
      if (ok) arm();
      else disarm();
    };

    const ro = new ResizeObserver(evaluate);
    ro.observe(el ?? document.documentElement);
    mq.addEventListener('change', evaluate);
    // DOM của trang có thể tới sau (ảnh, block lazy) → soát lại một nhịp.
    const settle = window.setTimeout(evaluate, 300);
    evaluate();

    return () => {
      window.clearTimeout(settle);
      ro.disconnect();
      mq.removeEventListener('change', evaluate);
      if (armed) disarm();
      window.clearTimeout(watchdog);
      window.clearTimeout(tail);
    };
  }, [scroller, enabled, minWidth, duration]);
}
