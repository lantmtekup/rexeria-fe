'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Video intro chạy 1 lần sau preloader — mirror block 1 (event
 * preloaderEndedMmr -> video.play(); onended -> fade out).
 */
export function IntroVideo({ play }: { play: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (!play) return;
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setGone(true)); // autoplay chặn → bỏ qua intro
    const onEnded = () => {
      gsap.to(v, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => setGone(true),
      });
    };
    v.addEventListener('ended', onEnded);
    return () => v.removeEventListener('ended', onEnded);
  }, [play]);

  if (gone) return null;

  return (
    <div
      className='backwardsVideo fixed inset-0 z-[90] bg-[var(--bg)]'
      style={{ pointerEvents: play ? 'auto' : 'none' }}
    >
      <video
        ref={videoRef}
        id='backwardsVideo'
        muted
        playsInline
        preload='auto'
        className='h-full w-full object-cover'
        src='/media/intro.mp4'
      />
    </div>
  );
}
