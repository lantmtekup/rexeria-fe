'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from '../lib/motion';
import { RevealWords, revealText } from '../molecules';

export default function IntroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLHeadingElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasAppeared && playButtonRef.current) {
      gsap.fromTo(
        playButtonRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'sine.out' }
      );
    }
  }, [hasAppeared]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
    gsap.to(imageRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: 'sine.inOut',
    });
    gsap.to(video, { opacity: 1, duration: 0.6, ease: 'sine.inOut' });
    gsap.to(playButtonRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'sine.out',
    });
  };

  const handleEnded = () => {
    const video = videoRef.current;
    gsap.to(video, { opacity: 0, duration: 0.6, ease: 'sine.inOut' });
    gsap.to(imageRef.current, {
      opacity: 1,
      duration: 0.6,
      ease: 'sine.inOut',
      onComplete: () => {
        video?.pause();
        setIsPlaying(false);
      },
    });
    gsap.to(playButtonRef.current, {
      opacity: 1,
      duration: 0.4,
      delay: 0.25,
      ease: 'sine.out',
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      revealText(eyebrowRef, {
        duration: 0.6,
        stagger: 0.03,
        ease: 'power2.out',
      });
      revealText(headingRef, {
        duration: 0.8,
        stagger: 0.05,
        ease: 'sine.out',
      });

      gsap.set(mediaRef.current, { scale: 0.9 });
      gsap.to(mediaRef.current, {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: mediaRef.current,
          start: 'top bottom',
          end: '+=900',
          scrub: true,
          onUpdate: self => {
            // scale reaches ~0.98 at progress 0.8 (0.9 + 0.8*0.1)
            if (self.progress >= 0.8) setHasAppeared(true);
          },
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='relative flex h-min w-full flex-none flex-col items-center bg-[#f5f5f5] px-5 md:py-15 xl:rounded-t-2xl xl:py-25'
    >
      <div className='relative mx-auto flex h-min w-full max-w-[1720px] flex-none flex-col place-content-center items-center gap-10 overflow-hidden xl:gap-15'>
        <div className='relative flex h-min w-full flex-col place-content-center items-center gap-1.25 overflow-hidden py-34.25'>
          <div className='flex w-full max-w-256.25'>
            <div className='flex flex-1'>
              <h2
                ref={eyebrowRef}
                className='w-full text-center text-[40px] leading-[1.2] font-normal text-[#1a1919] md:text-[50px] xl:text-right'
              >
                <RevealWords text='The Magnolia' />
              </h2>
            </div>
          </div>
          <div className='max-w-256.25'>
            <h2
              ref={headingRef}
              className='w-full text-center text-[40px] leading-[1.2] font-normal text-[#1a1919] md:text-[50px] xl:text-left'
            >
              <RevealWords text='Private Residences in Khai Son City. A journey to build values beyond time — every detail weighed to last, built not for the trend of the moment, but for what remains.' />
            </h2>
          </div>
        </div>

        <div
          ref={mediaRef}
          className='relative h-100.25 w-full overflow-hidden rounded-2xl lg:h-screen'
        >
          <Image
            ref={imageRef}
            src='/assets/intro-poster.webp'
            alt='Morning on a garden terrace at The Magnolia'
            fill
            className='object-cover'
          />
          <video
            ref={videoRef}
            src='/assets/intro-film.mp4'
            muted
            playsInline
            onEnded={handleEnded}
            className='absolute inset-0 h-full w-full object-cover opacity-0'
          />

          {hasAppeared && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'pointer-events-none' : ''}`}
            >
              <button
                ref={playButtonRef}
                type='button'
                onClick={handlePlay}
                className='h-15 w-15 cursor-pointer lg:h-30 lg:w-30'
              >
                <img
                  src='/assets/play-button.svg'
                  alt='Play Button'
                  className='h-full w-full'
                />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
