'use client';

import { useEffect } from 'react';
import {
  HERO_WIPE_EVENT,
  type HeroWipeDetail,
} from '@/app/components/HeroStage';
import {
  getLenis,
  LENIS_READY_EVENT,
} from '@/app/components/SmoothScrollProvider';
import { gsap, MQ, Observer } from '@/app/lib/motion';

const SNAP_MQ = '(min-width: 1280px)';

const SNAP_DURATION = 1.2;

// Event wheel của quán tính trackpad tới liên tục ~16ms; chỉ coi là cử chỉ mới
// khi có khoảng lặng dài hơn mức này.
const GESTURE_GAP_MS = 180;

// Trackpad macOS mở đầu cử chỉ bằng vài event 1–3px rồi mới tăng dần, nên
// cộng dồn delta trong cùng cử chỉ thay vì xét từng event.
const WHEEL_THRESHOLD = 10;

const LINE_HEIGHT = 16;

// Quán tính chỉ giảm dần; ngón tay mới trong cùng chiều bắt đầu bằng ramp tăng
// dần. |delta| tăng liên tiếp chừng này lần và bật lên gấp đôi mức đáy là cử
// chỉ mới. Spike do coalesce event chỉ tăng 1 lần rồi tụt nên không lọt.
const NEW_GESTURE_RISES = 3;

const TOUCH_TOLERANCE = 30;

// Phòng scrollTo/wipe không gọi onComplete thì vẫn nhả khoá.
const BUSY_TIMEOUT_MS = 3000;

const NEXT_KEYS = new Set(['ArrowDown', 'PageDown', ' ']);

const PREV_KEYS = new Set(['ArrowUp', 'PageUp']);

type Stop = { y: number; hero?: 'closed' | 'open' };

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
}

export default function SectionSnap() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({ isXl: SNAP_MQ, reduce: MQ.reduce }, context => {
      const { isXl, reduce } = context.conditions as {
        isXl: boolean;
        reduce: boolean;
      };
      if (!isXl || reduce) return;

      const stage = document.querySelector<HTMLElement>('[data-snap="hero"]');

      let busy = false;
      let busyTimer = 0;

      const stopLenis = () => getLenis()?.stop();
      stopLenis();
      window.addEventListener(LENIS_READY_EVENT, stopLenis);

      const maxScroll = () =>
        document.documentElement.scrollHeight - window.innerHeight;

      const buildStops = (): Stop[] => {
        const limit = maxScroll();
        const stops: Stop[] = [];
        document.querySelectorAll<HTMLElement>('[data-snap]').forEach(el => {
          if (el === stage) {
            stops.push({ y: 0, hero: 'closed' }, { y: 0, hero: 'open' });
            return;
          }
          const y = Math.round(el.getBoundingClientRect().top + window.scrollY);
          stops.push({ y: Math.min(Math.max(y, 0), limit) });
        });
        return stops;
      };

      // Suy index từ scrollY thật để kéo thanh cuộn hay resize không làm lệch.
      const currentIndex = (stops: Stop[]) => {
        const y = window.scrollY;
        if (stage && y < window.innerHeight / 2) {
          return stage.dataset.heroOpen === 'true' ? 1 : 0;
        }
        let best = 0;
        let bestDistance = Infinity;
        stops.forEach((stop, index) => {
          if (stop.hero) return;
          const distance = Math.abs(stop.y - y);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
          }
        });
        return best;
      };

      const finish = () => {
        window.clearTimeout(busyTimer);
        busy = false;
      };

      const hold = () => {
        busy = true;
        window.clearTimeout(busyTimer);
        busyTimer = window.setTimeout(finish, BUSY_TIMEOUT_MS);
      };

      const scrollToY = (y: number) => {
        const lenis = getLenis();
        if (!lenis) {
          window.scrollTo({ top: y, behavior: 'smooth' });
          window.setTimeout(finish, SNAP_DURATION * 1000);
          return;
        }
        lenis.scrollTo(y, {
          duration: SNAP_DURATION,
          force: true,
          lock: true,
          onComplete: finish,
        });
      };

      const goTo = (index: number) => {
        const stops = buildStops();
        const from = currentIndex(stops);
        const to = Math.min(Math.max(index, 0), stops.length - 1);
        if (to === from) return;

        hold();
        const target = stops[to];

        if (stage && stops[from].hero && target.hero) {
          const detail: HeroWipeDetail = {
            open: target.hero === 'open',
            done: finish,
          };
          stage.dispatchEvent(new CustomEvent(HERO_WIPE_EVENT, { detail }));
          return;
        }

        scrollToY(target.y);
      };

      const step = (direction: 1 | -1) => {
        goTo(currentIndex(buildStops()) + direction);
      };

      // Mỗi nguồn input có một cổng riêng: cử chỉ bắt đầu khi có khoảng lặng
      // hoặc đổi chiều (quán tính không bao giờ đổi dấu; chạm trackpad để
      // đảo chiều thì event mới tới ngay sau event quán tính cuối), cộng dồn
      // delta, bắn đúng một lần khi vượt ngưỡng. Cử chỉ bắt đầu lúc đang busy
      // (đuôi quán tính) thì bỏ cả cử chỉ.
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

      const wheelGate = makeGate(WHEEL_THRESHOLD);
      const touchGate = makeGate(1);

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        const scale =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? LINE_HEIGHT
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? window.innerHeight
              : 1;
        wheelGate(event.deltaY * scale, event.timeStamp);
      };

      const onKey = (event: KeyboardEvent) => {
        if (busy || event.metaKey || event.ctrlKey || event.altKey) return;
        if (isEditable(event.target)) return;
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

      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKey);

      const touch = Observer.create({
        target: window,
        type: 'touch',
        tolerance: TOUCH_TOLERANCE,
        preventDefault: true,
        onDown: () => touchGate(1, performance.now()),
        onUp: () => touchGate(-1, performance.now()),
      });

      return () => {
        window.clearTimeout(busyTimer);
        touch.kill();
        window.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener(LENIS_READY_EVENT, stopLenis);
        getLenis()?.start();
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
