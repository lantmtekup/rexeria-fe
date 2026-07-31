'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '@/lib/cn';

interface ScrollRoomPlaceholderProps {
  /** Label hiển thị giữa section. */
  label: string;
  /** Icon nhảy gợi ý hướng cuộn. */
  scrollHint?: 'down' | 'up';
  className?: string;
}

/**
 * Section giả phía trên/dưới block trong preview đơn lẻ (`/dev/blocks`,
 * PreviewMode 1 block) — tạo khoảng cuộn để Sticky/pin/scrub chạy được
 * (trang kết thúc ngay sau block thì ScrollTrigger thường không đạt progress 1).
 */
export function ScrollRoomPlaceholder({
  label,
  scrollHint,
  className,
}: ScrollRoomPlaceholderProps) {
  const HintIcon = scrollHint === 'up' ? ChevronUp : ChevronDown;

  return (
    <section
      aria-hidden
      data-scroll-room-placeholder='true'
      className={cn(
        'flex min-h-dvh w-full shrink-0 items-center justify-center',
        'bg-neutral-100 text-neutral-400',
        'border-y border-dashed border-neutral-300/80',
        className
      )}
    >
      <div className='flex flex-col items-center gap-2'>
        {scrollHint ? (
          <HintIcon
            className='size-5 animate-bounce text-neutral-400/90'
            aria-hidden
          />
        ) : null}
        <p className='text-[11px] font-medium tracking-[0.14em] uppercase'>
          {label}
        </p>
      </div>
    </section>
  );
}
