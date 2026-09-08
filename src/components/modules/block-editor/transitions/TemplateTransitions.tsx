'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';
import { useLandingMotion } from '../motion/LandingMotion';
import { SnapStack } from './SnapStack';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Preset transition cấp template — áp cho cả collection block. */
export type TemplateTransition =
  | 'none'
  | 'fade'
  | 'roll-up'
  | 'swipe'
  | 'tabs'
  | 'parallax'
  | 'snap';

export const TEMPLATE_TRANSITIONS: {
  id: TemplateTransition;
  label: string;
  desc: string;
}[] = [
  {
    id: 'none',
    label: 'Không',
    desc: 'Không hiệu ứng — block render bình thường',
  },
  {
    id: 'fade',
    label: 'Fade',
    desc: 'Children fade-up khi section vào viewport',
  },
  {
    id: 'roll-up',
    label: 'Roll-up',
    desc: 'Sticky stacking — section đè nhau khi cuộn',
  },
  {
    id: 'swipe',
    label: 'Swipe',
    desc: 'Scroll-snap ngang, vuốt hoặc dùng phím mũi tên',
  },
  { id: 'tabs', label: 'Tabs', desc: 'Mỗi block 1 panel — chuyển tab để xem' },
  {
    id: 'parallax',
    label: 'Parallax',
    desc: 'Layer dịch chuyển khác tốc độ theo scroll',
  },
  {
    id: 'snap',
    label: 'Snap',
    desc: 'Một cú vuốt = một section — cuộn theo từng màn',
  },
];

/**
 * Transition có cuộn dọc (hợp với smooth-scroll Lenis). swipe/tabs thì không.
 *
 * `snap` CỐ Ý bị loại dù nó cuộn dọc: nó tween mọi cú cuộn bằng ScrollToPlugin
 * nên momentum của Lenis vô dụng, mà có Lenis thì `/p` sinh race — Lenis được
 * tạo trong effect của `LandingMotionRoot`, chạy SAU effect của SnapStack
 * (React flush effect con trước cha) nên `window.__lenis` chưa tồn tại lúc
 * SnapStack mount. Bỏ `snap` ra khỏi đây ⇒ `enableSmooth={false}` ⇒ không có
 * Lenis ⇒ một đường code duy nhất. Đừng "sửa" lại.
 */
export function isVerticalTransition(t: TemplateTransition): boolean {
  return t === 'none' || t === 'fade' || t === 'roll-up' || t === 'parallax';
}

/** Validate string từ blueprint → preset hợp lệ, mặc định 'none'. */
export function asTransition(s: string | undefined): TemplateTransition {
  return TEMPLATE_TRANSITIONS.some(o => o.id === s)
    ? (s as TemplateTransition)
    : 'none';
}

interface Props {
  transition: TemplateTransition;
  items: React.ReactNode[];
  className?: string;
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Template Transitions — lớp điều phối transition cấp TEMPLATE (cả stack block):
 * none/fade/roll-up/swipe/tabs/parallax. Nhận `items` = mảng node block đã
 * render; sắp xếp + animate theo preset.
 */
export function TemplateTransitions({ transition, items, className }: Props) {
  if (items.length === 0) return null;
  switch (transition) {
    case 'fade':
      return <FadeStack items={items} className={className} />;
    case 'roll-up':
      return <RollUpStack items={items} className={className} />;
    case 'swipe':
      return <SwipeSnap items={items} className={className} />;
    case 'tabs':
      return <TabsLayout items={items} className={className} />;
    case 'parallax':
      return <ParallaxStack items={items} className={className} />;
    case 'snap':
      return <SnapStack items={items} className={className} />;
    default:
      return <PlainStack items={items} className={className} />;
  }
}

const STACK = 'flex flex-col gap-3 md:gap-4';

function PlainStack({ items, className }: Omit<Props, 'transition'>) {
  return (
    <div className={cn(STACK, className)}>
      {items.map((n, i) => (
        <React.Fragment key={i}>{n}</React.Fragment>
      ))}
    </div>
  );
}

/** Fade — mỗi section fade-up khi vào viewport. Dùng IntersectionObserver (theo
 *  viewport) → chạy đúng cả khi cuộn window (public) lẫn cuộn div nội bộ
 *  (PreviewMode), không phụ thuộc scroller như ScrollTrigger. */
function FadeStack({ items, className }: Omit<Props, 'transition'>) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('.tt-fade'));
    if (reduced()) {
      els.forEach(el => el.classList.add('tt-in'));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('tt-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <div ref={ref} className={cn(STACK, className)}>
      {items.map((n, i) => (
        <div
          key={i}
          className='tt-fade translate-y-11 opacity-0 transition-[opacity,transform] duration-700 ease-out [&.tt-in]:translate-y-0 [&.tt-in]:opacity-100'
        >
          {n}
        </div>
      ))}
    </div>
  );
}

/** Roll-up — sticky stacking: mỗi section ghim top rồi section sau đè lên.
 *  Block bám top + section overflow-hidden (KHÔNG căn giữa) → không có vùng
 *  trong suốt cướp pointer; block trên cùng (đang xem) nhận đủ chuột. */
function RollUpStack({ items, className }: Omit<Props, 'transition'>) {
  return (
    <div className={cn('relative', className)}>
      {items.map((n, i) => (
        <section
          key={i}
          className='sticky top-0 min-h-screen overflow-hidden bg-white'
          style={{ zIndex: i + 1 }}
        >
          {n}
        </section>
      ))}
    </div>
  );
}

/** Swipe — scroll-snap ngang, vuốt / phím mũi tên. */
function SwipeSnap({ items, className }: Omit<Props, 'transition'>) {
  const ref = React.useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  };
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className={cn('relative h-screen', className)}>
      <div
        ref={ref}
        className='flex h-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden'
      >
        {items.map((n, i) => (
          <div
            key={i}
            className='flex h-full w-screen shrink-0 snap-center items-center justify-center overflow-y-auto p-4'
          >
            <div className='w-full max-w-[1280px]'>{n}</div>
          </div>
        ))}
      </div>
      <button
        type='button'
        aria-label='Trước'
        onClick={() => move(-1)}
        className='absolute top-1/2 left-3 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60'
      >
        <ChevronLeft className='size-5' />
      </button>
      <button
        type='button'
        aria-label='Sau'
        onClick={() => move(1)}
        className='absolute top-1/2 right-3 z-[2] grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60'
      >
        <ChevronRight className='size-5' />
      </button>
    </div>
  );
}

/** Tabs — mỗi block 1 panel, chuyển tab để xem. */
function TabsLayout({ items, className }: Omit<Props, 'transition'>) {
  const [active, setActive] = React.useState(0);
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className='flex flex-wrap gap-2'>
        {items.map((_, i) => (
          <button
            key={i}
            type='button'
            onClick={() => setActive(i)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition',
              active === i
                ? 'border-transparent bg-neutral-900 text-white'
                : 'border-border text-content-muted hover:bg-muted'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className='relative'>
        {items.map((n, i) => (
          <div
            key={i}
            className={cn(
              'transition-opacity duration-300',
              active === i
                ? 'opacity-100'
                : 'pointer-events-none absolute inset-0 opacity-0'
            )}
            aria-hidden={active !== i}
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Parallax — mỗi layer dịch khác tốc độ theo scroll. */
function ParallaxStack({ items, className }: Omit<Props, 'transition'>) {
  const ref = React.useRef<HTMLDivElement>(null);
  // Lấy scroller từ nền (window cho /p, surface cho editor/preview) — đồng bộ
  // với LandingMotionRoot (refresh tập trung), không hardcode window.
  const { scroller } = useLandingMotion();
  useGSAP(
    () => {
      if (reduced()) return;
      const els = gsap.utils.toArray<HTMLElement>('.tt-par', ref.current);
      els.forEach((el, i) => {
        // Đảo chiều xen kẽ + dịch theo % chiều cao → block cạnh nhau chạy
        // ngược tốc độ, thấy rõ parallax.
        gsap.fromTo(
          el,
          { yPercent: i % 2 === 0 ? 10 : -10 },
          {
            yPercent: i % 2 === 0 ? -10 : 10,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              scroller: scroller ?? undefined,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    },
    { scope: ref, dependencies: [scroller] }
  );
  return (
    <div ref={ref} className={cn(STACK, className)}>
      {items.map((n, i) => (
        <div key={i} className='tt-par [will-change:transform]'>
          {n}
        </div>
      ))}
    </div>
  );
}
