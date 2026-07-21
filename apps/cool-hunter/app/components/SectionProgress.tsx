'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../lib/motion';

const SECTIONS = [
  { id: 'welcome', label: '01 - Welcome' },
  { id: 'lake-wehapa', label: '02 - Lake Wehapa' },
  { id: 'architecture', label: '03 - Architecture' },
  { id: 'interior-design', label: '04 - Interior Design' },
] as const;

type ProgressState = {
  index: number;
  heightPct: number;
};

/** Pin tạo `.pin-spacer` bọc section — đo spacer mới đúng quãng scroll. */
const getSectionSpacer = (id: string) => {
  const el = document.querySelector(`[data-section="${id}"]`);
  if (!el) return null;
  return el.parentElement?.classList.contains('pin-spacer')
    ? el.parentElement
    : el;
};

/**
 * Một progress 0→1 xuyên suốt toàn bộ hành trình pin.
 * Thanh đen là một khối thống nhất: cao hơn khi scroll xuống, thấp hơn khi scroll lên.
 */
const resolveProgress = (): ProgressState | null => {
  const mid = window.innerHeight * 0.5;
  let totalRange = 0;
  const ranges: number[] = [];
  const boxes: DOMRect[] = [];

  for (const { id } of SECTIONS) {
    const spacer = getSectionSpacer(id);
    if (!spacer) return null;

    const box = spacer.getBoundingClientRect();
    const range = Math.max(0, box.height - window.innerHeight);
    ranges.push(range);
    boxes.push(box);
    totalRange += range;
  }

  if (totalRange <= 0) return null;

  let passed = 0;

  for (let i = 0; i < SECTIONS.length; i++) {
    const box = boxes[i];
    const range = ranges[i];

    if (box.top <= mid && box.bottom > mid) {
      const local = range > 0 ? Math.min(1, Math.max(0, -box.top / range)) : 1;
      const overall = (passed + local * range) / totalRange;

      return {
        index: i,
        heightPct: Math.max(3, overall * 100),
      };
    }

    if (box.bottom <= mid) passed += range;
  }

  return null;
};

/**
 * Rail sticky bên phải: track xám + một thanh đen liên tục từ đỉnh rail.
 * Label đổi theo section đang ở giữa viewport; chiều cao thanh đen scrub theo
 * tiến độ scroll tổng (không chia slot theo section).
 */
export default function SectionProgress() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const label =
    progress !== null ? SECTIONS[progress.index].label : SECTIONS[0].label;
  const visible = progress !== null;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');

    const syncProgress = () => {
      if (!mq.matches) {
        setProgress(null);
        return;
      }
      setProgress(resolveProgress());
    };

    const boot = window.setTimeout(() => {
      ScrollTrigger.refresh();
      syncProgress();
    }, 0);

    window.addEventListener('scroll', syncProgress, { passive: true });
    window.addEventListener('resize', syncProgress);
    ScrollTrigger.addEventListener('refresh', syncProgress);
    mq.addEventListener('change', syncProgress);

    return () => {
      window.clearTimeout(boot);
      window.removeEventListener('scroll', syncProgress);
      window.removeEventListener('resize', syncProgress);
      ScrollTrigger.removeEventListener('refresh', syncProgress);
      mq.removeEventListener('change', syncProgress);
    };
  }, []);

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
          className='absolute inset-x-0 top-0 bg-neutral-900 will-change-[height]'
          style={{ height: `${progress?.heightPct ?? 0}%` }}
        />
      </span>
    </div>
  );
}
