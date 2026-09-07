'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from '../../lib/use-isomorphic-layout-effect';
import { CROWN_H, CROWN_W } from './story-data';

gsap.registerPlugin(ScrollTrigger);

const HEADER_H = 72;

// Class gắn lên <html> khi traveler đang chạy → ẩn 6 vương miện tĩnh bằng `!important`
// để thắng cả inline autoAlpha mà Showcase timeline set lên [data-fade].
const TRAVELING_CLASS = 'crown-traveling';

// Thứ tự các điểm dừng từ trên xuống. Slot nào không hiển thị (mobile, spacer
// `lg:invisible`) sẽ bị lọc lúc runtime, segment tự nối slot còn lại.
const ORDER = [
  'hero',
  'story',
  'showcase',
  'collection',
  'inspirations',
  'footer',
] as const;

type SlotName = (typeof ORDER)[number];

type SegmentDef = {
  trigger: string;
  start: string | (() => string | number);
  end: string | (() => string | number);
  /** Ease của đường đi; mặc định power2.inOut. */
  ease?: string;
};

// Biên trừ vào scroll tối đa: chiều cao trang có thể lệch vài px sau refresh (ảnh/font
// load) → không để mốc end trùng đúng đáy trang.
const MAX_SCROLL_MARGIN = 8;

// Showcase pin: timeline dài HOLD + TRAVEL + HOLD = 1.3, seam 0.65/1.3 = 0.5 của scroll
// progress, logo card 2 bắt đầu fade-in tại (0.65 - SWAP*0.4)/1.3 ≈ 0.47. Vương miện phải
// rời khỏi cột giữa TRƯỚC mốc đó, nếu không sẽ đè lên logo + caption.
const SHOWCASE_LEAVE_FROM = 0.3;
const SHOWCASE_LEAVE_TO = 0.46;

function showcasePinDistance() {
  const section = document.querySelector<HTMLElement>('#showcase');
  const sticky = section?.firstElementChild as HTMLElement | null;
  if (!section || !sticky) return 0;
  return Math.max(0, section.offsetHeight - sticky.offsetHeight);
}

function docTop(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
}

// Segment "đến slot X": trigger luôn là section in-flow, không bao giờ là sticky.
const SEGMENTS: Record<Exclude<SlotName, 'hero'>, SegmentDef> = {
  story: {
    trigger: '#story',
    start: 'top bottom',
    end: `top top+=${HEADER_H}`,
  },
  showcase: {
    trigger: '#showcase',
    start: 'top bottom',
    end: `top top+=${HEADER_H}`,
  },
  collection: {
    trigger: '#showcase',
    start: () =>
      `top+=${showcasePinDistance() * SHOWCASE_LEAVE_FROM} top+=${HEADER_H}`,
    end: () =>
      `+=${showcasePinDistance() * (SHOWCASE_LEAVE_TO - SHOWCASE_LEAVE_FROM)}`,
    // Đi xuống khỏi màn hình (slot Collection lúc này còn dưới viewport) → tăng tốc dần.
    ease: 'power2.in',
  },
  inspirations: {
    trigger: '#inspirations',
    start: 'top bottom',
    end: 'top 40%',
  },
  footer: {
    trigger: 'footer',
    start: 'top bottom',
    // Footer ngắn: `top 50%` có thể nằm ngoài vùng scroll → kẹp vào scroll tối đa
    // để vương miện luôn đáp xong khi chạm đáy trang.
    end: () =>
      Math.min(
        docTop('footer') - window.innerHeight * 0.5,
        ScrollTrigger.maxScroll(window) - MAX_SCROLL_MARGIN
      ),
  },
};

const DEFAULT_EASE = 'power2.inOut';

function isVisible(el: HTMLElement) {
  if (getComputedStyle(el).visibility === 'hidden') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function collectSlots() {
  const found = new Map<SlotName, HTMLElement>();
  document.querySelectorAll<HTMLElement>('[data-crown-slot]').forEach(el => {
    const name = el.dataset.crownSlot as SlotName;
    if (!ORDER.includes(name) || found.has(name) || !isVisible(el)) return;
    found.set(name, el);
  });
  return ORDER.filter(name => found.has(name)).map(name => ({
    name,
    el: found.get(name) as HTMLElement,
  }));
}

/**
 * Một vương miện duy nhất (position: fixed) trượt từ đầu mục này xuống đầu mục kế tiếp
 * theo scroll. Chỉ desktop; mobile và prefers-reduced-motion giữ 6 vương miện tĩnh.
 */
export default function CrownTraveler() {
  const imgRef = useRef<HTMLImageElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: '(min-width: 1024px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduce } = context.conditions as {
          isDesktop: boolean;
          reduce: boolean;
        };
        if (!isDesktop || reduce) return;

        const slots = collectSlots();
        if (slots.length < 2) return;

        const progress = new Array<number>(slots.length - 1).fill(0);
        const eases = slots
          .slice(1)
          .map(slot =>
            gsap.parseEase(
              SEGMENTS[slot.name as Exclude<SlotName, 'hero'>].ease ??
                DEFAULT_EASE
            )
          );

        const triggers = slots.slice(1).map((slot, i) => {
          const def = SEGMENTS[slot.name as Exclude<SlotName, 'hero'>];
          return ScrollTrigger.create({
            trigger: def.trigger,
            start: def.start,
            end: def.end,
            invalidateOnRefresh: true,
            // Refresh sau trigger pin của Showcase (mặc định 0) vì segment
            // `collection` đọc chiều cao pin.
            refreshPriority: -10,
            onUpdate: st => {
              progress[i] = st.progress;
            },
          });
        });

        const setter = gsap.quickSetter(img, 'css') as (
          vars: gsap.TweenVars
        ) => void;
        let last = '';

        // Đo rect slot MỖI frame: slot Story nằm trong sticky và `top` của nó transition,
        // slot Showcase nằm trong sticky pinned → không cache được toạ độ.
        const render = () => {
          let i = 0;
          while (i < progress.length && progress[i] >= 1) i += 1;
          const p = i < progress.length ? progress[i] : 0;

          const a = slots[i].el.getBoundingClientRect();
          const b = slots[i + 1]?.el.getBoundingClientRect() ?? a;
          const e = i < eases.length ? eases[i](p) : 0;

          const cx = gsap.utils.interpolate(
            a.left + a.width / 2,
            b.left + b.width / 2,
            e
          );
          const cy = gsap.utils.interpolate(
            a.top + a.height / 2,
            b.top + b.height / 2,
            e
          );
          const w = gsap.utils.interpolate(a.width, b.width, e);

          const vars = {
            x: cx - CROWN_W / 2,
            y: cy - CROWN_H / 2,
            scale: w / CROWN_W,
          };

          const key = `${vars.x.toFixed(2)}|${vars.y.toFixed(2)}|${vars.scale.toFixed(4)}`;
          if (key === last) return;
          last = key;
          setter(vars);
        };

        gsap.set(img, { transformOrigin: '50% 50%' });
        document.documentElement.classList.add(TRAVELING_CLASS);

        ScrollTrigger.refresh();
        render();
        gsap.set(img, { autoAlpha: 1 });

        gsap.ticker.add(render);
        ScrollTrigger.addEventListener('refresh', render);

        return () => {
          gsap.ticker.remove(render);
          ScrollTrigger.removeEventListener('refresh', render);
          triggers.forEach(trigger => trigger.kill());
          document.documentElement.classList.remove(TRAVELING_CLASS);
          gsap.set(img, { clearProps: 'transform', autoAlpha: 0 });
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed top-0 left-0 z-40 hidden lg:block'
    >
      <Image
        ref={imgRef}
        src='/product/crown.png'
        alt=''
        width={CROWN_W}
        height={CROWN_H}
        priority
        className='h-auto w-[159px] will-change-transform'
        style={{ opacity: 0, visibility: 'hidden' }}
      />
    </div>
  );
}
