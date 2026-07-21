'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../lib/motion';

const SECTIONS = [
  { id: 'welcome', label: '01 - Welcome' },
  { id: 'lake-wehapa', label: '02 - Lake Wehapa' },
  { id: 'architecture', label: '03 - Architecture' },
  { id: 'interior-design', label: '04 - Interior Design' },
] as const;

/** Pin tạo `.pin-spacer` bọc section — đo spacer mới đúng quãng scroll. */
const getSectionBox = (id: string) => {
  const el = document.querySelector(`[data-section="${id}"]`);
  if (!el) return null;
  const spacer = el.parentElement?.classList.contains('pin-spacer')
    ? el.parentElement
    : el;
  return spacer.getBoundingClientRect();
};

const resolveActive = () => {
  const mid = window.innerHeight * 0.5;

  for (let i = 0; i < SECTIONS.length; i++) {
    const box = getSectionBox(SECTIONS[i].id);
    if (!box) continue;
    if (box.top <= mid && box.bottom > mid) return i;
  }

  return null;
};

/**
 * Một rail sticky cố định bên phải.
 * Track xám đứng yên; đoạn đen + label đổi theo section đang active.
 * Active = pin-spacer đang chứa tâm viewport (không dùng top/bottom element
 * vì pin làm bounding box section đứng yên trong lúc scrub).
 */
export default function SectionProgress() {
  const [active, setActive] = useState<number | null>(null);
  const total = SECTIONS.length;
  const label = active !== null ? SECTIONS[active].label : SECTIONS[0].label;
  const visible = active !== null;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');

    const syncActive = () => {
      if (!mq.matches) {
        setActive(null);
        return;
      }
      const found = resolveActive();
      setActive(prev => (prev === found ? prev : found));
    };

    // Đợi pin của các section khởi tạo xong.
    const boot = window.setTimeout(() => {
      ScrollTrigger.refresh();
      syncActive();
    }, 0);

    window.addEventListener('scroll', syncActive, { passive: true });
    window.addEventListener('resize', syncActive);
    ScrollTrigger.addEventListener('refresh', syncActive);
    mq.addEventListener('change', syncActive);

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener('scroll', syncActive);
      window.removeEventListener('resize', syncActive);
      ScrollTrigger.removeEventListener('refresh', syncActive);
      mq.removeEventListener('change', syncActive);
    };
  }, []);

  const slotPct = 100 / total;
  // Active cao hơn slot một chút, clamp để không tràn đáy rail.
  const activePct = slotPct + 6;
  const activeTop = Math.min(((active ?? 0) / total) * 100, 100 - activePct);

  return (
    <div
      className='pointer-events-none fixed top-1/2 right-6 z-50 hidden h-[min(26vh,200px)] -translate-y-1/2 items-center gap-3 transition-opacity duration-300 md:flex'
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden={!visible}
    >
      <span
        className='font-(family-name:--font-inter) text-xs font-medium tracking-[0.2em] whitespace-nowrap text-[#06070C] uppercase'
        style={{ writingMode: 'vertical-rl' }}
      >
        {label}
      </span>
      <span aria-hidden className='relative h-full w-px bg-neutral-200'>
        <span
          className='absolute inset-x-0 bg-neutral-900 transition-[top] duration-300 ease-out'
          style={{
            top: `${activeTop}%`,
            height: `${activePct}%`,
          }}
        />
      </span>
    </div>
  );
}
