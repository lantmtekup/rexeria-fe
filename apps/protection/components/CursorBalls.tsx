'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * 2 quả bóng glow vàng follow chuột — mirror inline block 5+6 của site gốc.
 * ball1: toX(-dx) toY(dy); ball2: toX(dx) toY(-dy); quickTo duration 3 power3.
 * Ẩn trên touch (không có con trỏ). Đứng sau nội dung (z thấp) làm ambient glow.
 */
export function CursorBalls() {
  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const ball1 = b1.current;
    const ball2 = b2.current;
    if (!ball1 || !ball2) return;

    const toX1 = gsap.quickTo(ball1, 'x', { duration: 3, ease: 'power3' });
    const toY1 = gsap.quickTo(ball1, 'y', { duration: 3, ease: 'power3' });
    const toX2 = gsap.quickTo(ball2, 'x', { duration: 3, ease: 'power3' });
    const toY2 = gsap.quickTo(ball2, 'y', { duration: 3, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      toX1(-dx);
      toY1(dy);
      toX2(dx);
      toY2(-dy);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden'>
      <div
        ref={b1}
        id='ball1'
        className='absolute top-1/2 left-1/2 h-[42vh] w-[42vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[70px]'
        style={{
          background:
            'radial-gradient(circle, rgba(252,194,0,0.55) 0%, rgba(252,194,0,0) 70%)',
        }}
      />
      <div
        ref={b2}
        id='ball2'
        className='absolute top-1/2 left-1/2 h-[30vh] w-[30vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[70px]'
        style={{
          background:
            'radial-gradient(circle, rgba(252,194,0,0.45) 0%, rgba(252,194,0,0) 70%)',
        }}
      />
    </div>
  );
}
