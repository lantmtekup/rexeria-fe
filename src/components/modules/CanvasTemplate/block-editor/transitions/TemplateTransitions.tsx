'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/cn';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Preset transition cấp template — áp cho cả collection block. */
export type TemplateTransition =
  | 'none'
  | 'fade'
  | 'roll-up'
  | 'swipe'
  | 'tabs'
  | 'parallax';

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
];

/** Transition có cuộn dọc (hợp với smooth-scroll Lenis). swipe/tabs thì không. */
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

/** Roll-up — sticky stacking: mỗi section ghim top rồi section sau đè lên. */
function RollUpStack({ items, className }: Omit<Props, 'transition'>) {
  return (
    <div className={cn('relative', className)}>
      {items.map((n, i) => (
        <section
          key={i}
          className='sticky top-0 flex min-h-screen items-center justify-center'
          style={{ zIndex: i + 1 }}
        >
          <div className='w-full'>{n}</div>
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
  useGSAP(
    () => {
      if (reduced()) return;
      const els = gsap.utils.toArray<HTMLElement>('.tt-par', ref.current);
      els.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: i % 2 === 0 ? -70 : -36,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });
    },
    { scope: ref }
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
