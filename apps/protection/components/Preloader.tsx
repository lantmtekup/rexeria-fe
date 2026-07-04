'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Preloader — mirror inline block 4 của gốc.
 * - Quả bóng vàng grow từ đáy: top 0%, width/height -> 90vh, dur 1.5 ease none;
 *   % đếm 0->50 theo progress.
 * - Xong -> finishTl: ball top -100% (đẩy lên khỏi màn) dur1.5 + % 50->100;
 *   preloader fade opacity 0 dur1, onStart dispatch 'preloaderEndedMmr'.
 * - onComplete gọi onDone() để hero bắt đầu video intro.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const ball = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const preL = root.current;
    const b = ball.current;
    const pc = percent.current;
    if (!preL || !b || !pc) return;

    const finishTl = gsap.timeline({
      paused: true,
      onComplete: () => {
        preL.style.pointerEvents = 'none';
        onDone();
      },
    });

    finishTl
      .to(b, {
        duration: 1.5,
        top: '-100%',
        ease: 'none',
        onUpdate: function () {
          pc.textContent =
            Math.round(
              gsap.utils.mapRange(0, 100, 50, 100, this.progress() * 100)
            ) + '%';
        },
      })
      .to(preL, {
        opacity: 0,
        duration: 1,
        delay: -1,
        ease: 'none',
        onStart: () => {
          window.dispatchEvent(new Event('preloaderEndedMmr'));
        },
      });

    const introTl = gsap
      .timeline()
      .to(b, {
        top: '0%',
        duration: 1.5,
        width: '90vh',
        height: '90vh',
        ease: 'none',
        onUpdate: function () {
          pc.textContent =
            Math.round(
              gsap.utils.mapRange(0, 100, 0, 50, this.progress() * 100)
            ) + '%';
        },
        onComplete: () => {
          // Gốc: chạy finishTl chậm rồi tăng tốc khi load xong. Ở clone
          // (asset local nhẹ) coi như đã complete → chạy tốc độ thật luôn.
          finishTl.timeScale(1 / 200).play();
          if (document.readyState === 'complete') {
            finishTl.timeScale(1).play();
          } else {
            window.addEventListener(
              'load',
              () => finishTl.timeScale(1).play(),
              { once: true }
            );
          }
        },
      })
      .to(pc, { bottom: '50%', duration: 1.5 }, '<');

    return () => {
      introTl.kill();
      finishTl.kill();
    };
  }, [onDone]);

  return (
    <div
      ref={root}
      id='site-preloader'
      className='fixed inset-0 z-[100] overflow-hidden bg-[var(--bg)]'
    >
      <div
        ref={ball}
        className='absolute left-1/2 h-[20vh] w-[20vh] -translate-x-1/2 rounded-full bg-[var(--yellow)]'
        style={{ top: '40%' }}
      />
      <span
        ref={percent}
        className='absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-[var(--grey)]'
        style={{ bottom: '30%' }}
      >
        0%
      </span>
    </div>
  );
}
