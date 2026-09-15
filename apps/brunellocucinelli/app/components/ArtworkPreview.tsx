'use client';

import Image from 'next/image';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, MQ } from '../lib/motion';
import type { Highlight } from '../lib/highlights';
import ArtworkViewer from './ArtworkViewer';

/**
 * Artwork dưới grid Highlights (trang mẫu: ep-highlights-container). Khung có
 * viền mềm bằng mask SVG của trang mẫu; ảnh multiply lên nền nên nền trắng
 * của PNG tan vào trang. Nhãn "Explore the artwork" đi theo chuột khi hover
 * (chuột thật); máy cảm ứng thì nhãn đứng yên ở góc trên trái.
 */
type ArtworkPreviewProps = {
  artwork: Highlight;
  /** 'top' như Highlights; 'bottom' như card EP trong các chủ đề. */
  titlePosition?: 'top' | 'bottom';
  /** Bề ngang khung trên desktop (class Tailwind). */
  widthClass?: string;
  className?: string;
};

export default function ArtworkPreview({
  artwork,
  titlePosition = 'top',
  widthClass = 'md:w-3/5',
  className = 'pt-16 pb-24 md:pb-40',
}: ArtworkPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const label = labelRef.current;
    if (!frame || !label) return;

    const mm = gsap.matchMedia(frame);
    mm.add(MQ.finePointer, () => {
      // Nhãn neo ở góc trên trái khung (left/top 0), dịch bằng x/y tới đúng
      // vị trí chuột; ẩn khi chuột chưa vào khung.
      gsap.set(label, { autoAlpha: 0, xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3' });
      const yTo = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3' });

      const place = (e: PointerEvent, instant = false) => {
        const r = frame.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        if (instant) gsap.set(label, { x, y });
        else {
          xTo(x);
          yTo(y);
        }
      };
      const onEnter = (e: PointerEvent) => {
        place(e, true);
        gsap.to(label, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.3,
          overwrite: 'auto',
        });
      };
      const onMove = (e: PointerEvent) => place(e);
      const onLeave = () =>
        gsap.to(label, {
          autoAlpha: 0,
          scale: 0.9,
          duration: 0.25,
          overwrite: 'auto',
        });

      frame.addEventListener('pointerenter', onEnter);
      frame.addEventListener('pointermove', onMove, { passive: true });
      frame.addEventListener('pointerleave', onLeave);
      return () => {
        frame.removeEventListener('pointerenter', onEnter);
        frame.removeEventListener('pointermove', onMove);
        frame.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  const title = (
    <h3 className='p-4 text-center text-[24px] leading-[1.3] font-normal text-neutral-900 md:text-[28px]'>
      {artwork.title}
    </h3>
  );

  return (
    <div data-artwork className={`mx-auto max-w-[87.5rem] ${className}`}>
      {titlePosition === 'top' && title}
      <div
        ref={frameRef}
        data-artwork-frame
        {...(artwork.ep && {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Explore the artwork: ${artwork.title}`,
          onClick: () => setOpen(true),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          },
        })}
        className={`relative isolate mx-auto aspect-square w-full cursor-pointer bg-[#F8F8F6] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 md:aspect-[1641/842] ${widthClass} [@media(hover:hover)_and_(pointer:fine)]:cursor-none`}
      >
        {/* mix-blend trên lớp mask (không trên ảnh — mask tạo stacking context
            riêng). Nền #F8F8F6 đặt ngay trên khung: section Highlights là
            z-10 không nền, blend lên đó chỉ trộn với lớp trong suốt. */}
        <div className='absolute inset-0 [mask-image:url(/00-ui/mask_mobile.png)] [mask-size:100%_100%] [mask-repeat:no-repeat] mix-blend-multiply md:[mask-image:url(/00-ui/mask_desktop.svg)]'>
          <Image
            src={artwork.src}
            alt={artwork.title}
            fill
            sizes='(max-width: 767px) 100vw, 80vw'
            className='object-cover'
          />
        </div>
        <span
          ref={labelRef}
          className='font-ui pointer-events-none absolute top-[6%] left-[5%] z-10 rounded-full bg-white/85 px-4 py-2 text-[13px] whitespace-nowrap text-neutral-900 shadow-sm backdrop-blur md:text-[15px] [@media(hover:hover)_and_(pointer:fine)]:top-0 [@media(hover:hover)_and_(pointer:fine)]:left-0'
        >
          Explore the artwork
        </span>
      </div>
      {artwork.ep && (
        <ArtworkViewer ep={artwork.ep} open={open} onClose={close} />
      )}
      {titlePosition === 'bottom' && title}
    </div>
  );
}
