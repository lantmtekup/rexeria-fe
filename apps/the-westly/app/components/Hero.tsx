'use client';

import Image from 'next/image';
import {
  useLayoutEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  gsap,
  MOTION_CONDITIONS,
  scrollToTarget,
  type MotionConditions,
} from '../lib/motion';

const handleExploreClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  scrollToTarget('#explore');
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scene = section.querySelector<HTMLElement>('[data-layer="scene"]');
    const far = section.querySelector<HTMLElement>('[data-layer="clouds-far"]');
    const mid = section.querySelector<HTMLElement>('[data-layer="clouds-mid"]');
    const farDrift = far?.querySelector<HTMLElement>('[data-drift]');
    const midDrift = mid?.querySelector<HTMLElement>('[data-drift]');
    const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
    if (!scene || !far || !mid || !farDrift || !midDrift) return;

    // Hide before first paint — avoids flash while GSAP / ScrollTrigger init.
    gsap.set(scene, { autoAlpha: 0, scale: 1.12 });
    gsap.set([far, mid, ui], { autoAlpha: 0 });

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { finePointer, reduce } = ctx.conditions as MotionConditions;

      // Entrance — hero is above the fold; play on mount (no ScrollTrigger delay).
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: reduce ? 0 : 1 },
      });
      tl.fromTo(
        [far, mid],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduce ? 0 : 1.2 }
      )
        .fromTo(
          scene,
          { autoAlpha: 0, scale: 1.12 },
          { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 1.4 },
          '<0.15'
        )
        .fromTo(
          ui,
          { autoAlpha: 0, y: -16 },
          { autoAlpha: 1, y: 0, stagger: 0.12 },
          '-=0.6'
        );

      if (!reduce) {
        // Ambient cloud drift (x only — yPercent belongs to the scroll parallax)
        gsap.to(farDrift, {
          x: '+=12',
          duration: 26,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
        gsap.to(midDrift, {
          x: '-=18',
          duration: 18,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Exit — driven by scroll (the EXPLORE link scrolls the hero away):
        // p1 terrace scales up and fades out; p2/p3 clouds split to the sides
        // and fade. Scrubbed to the hero's scroll-out range so it plays in
        // lockstep with the scroll. fromTo (not .to) so scrub reverses cleanly.
        const exit = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'top+=60% top',
            // Soft scrub so programmatic EXPLORE scroll feels continuous,
            // including when user scrolls back up and clicks again.
            scrub: 0.45,
          },
        });
        // from states omit autoAlpha so progress 0 does not flash visible on load.
        exit
          .fromTo(
            scene,
            { scale: 1 },
            { scale: 1.3, autoAlpha: 0, immediateRender: false },
            0
          )
          .fromTo(
            far,
            { xPercent: 0 },
            { xPercent: -16, autoAlpha: 0, immediateRender: false },
            0
          )
          .fromTo(
            mid,
            { xPercent: 0 },
            { xPercent: 45, autoAlpha: 0, immediateRender: false },
            0
          )
          .fromTo(
            ui,
            {},
            { autoAlpha: 0, duration: 0.4, immediateRender: false },
            0
          );
      }

      if (finePointer && !reduce) {
        // Mouse parallax — frame-lerped (smoother than quickTo per mousemove event)
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        const LERP = 0.09;
        let bounds = section.getBoundingClientRect();

        const refreshBounds = () => {
          bounds = section.getBoundingClientRect();
        };

        const onMove = (e: MouseEvent) => {
          pointer.targetX = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
          pointer.targetY = ((e.clientY - bounds.top) / bounds.height) * 2 - 1;
        };
        const onLeave = () => {
          pointer.targetX = 0;
          pointer.targetY = 0;
        };

        const onTick = () => {
          const t = 1 - Math.pow(1 - LERP, gsap.ticker.deltaRatio());
          pointer.x += (pointer.targetX - pointer.x) * t;
          pointer.y += (pointer.targetY - pointer.y) * t;

          if (
            Math.abs(pointer.x) < 0.0004 &&
            Math.abs(pointer.y) < 0.0004 &&
            pointer.targetX === 0 &&
            pointer.targetY === 0
          ) {
            pointer.x = 0;
            pointer.y = 0;
          }

          gsap.set(scene, {
            x: -pointer.x * 28,
            y: -pointer.y * 14,
          });
          gsap.set(far, { x: pointer.x * 11, y: pointer.y * 5.5 });
          gsap.set(mid, { x: pointer.x * 25, y: pointer.y * 11 });
        };

        gsap.ticker.add(onTick);
        section.addEventListener('mousemove', onMove, { passive: true });
        section.addEventListener('mouseleave', onLeave);
        window.addEventListener('resize', refreshBounds);
        return () => {
          gsap.ticker.remove(onTick);
          section.removeEventListener('mousemove', onMove);
          section.removeEventListener('mouseleave', onLeave);
          window.removeEventListener('resize', refreshBounds);
          gsap.set([scene, far, mid], { x: 0, y: 0 });
        };
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='[container-type:size] relative h-svh min-h-120 w-full overflow-hidden bg-white md:min-h-150'
    >
      {/* Stage: fixed 3:2 design frame (1440×960) that covers the section —
          layers keep their design-frame percentages so they scale uniformly
          and stay aligned; the section crops the edges on other aspects. */}
      <div className='pointer-events-none absolute top-1/2 left-1/2 aspect-[3/2] w-[max(100cqw,150cqh)] -translate-x-1/2 -translate-y-1/2'>
        {/* Far clouds — full frame */}
        <div
          data-layer='clouds-far'
          className='invisible absolute inset-[-2%] opacity-0 will-change-transform'
        >
          <div data-drift className='absolute inset-0'>
            <Image
              src='/p2-hero.png'
              alt=''
              fill
              priority
              sizes='calc(max(100vw, 150vh) * 1.04)'
              className='object-cover'
            />
          </div>
        </div>

        <div
          data-layer='clouds-mid'
          className='invisible absolute top-[24.5%] left-[19.2%] w-[61.5%] opacity-0 will-change-transform'
        >
          <div data-drift>
            <Image
              src='/p3-hero.png'
              alt=''
              width={886}
              height={206}
              className='h-auto w-full'
            />
          </div>
        </div>

        <div
          data-layer='scene'
          className='invisible absolute inset-[-2%] opacity-0 will-change-transform'
        >
          <Image
            src='/p1-hero.png'
            alt='The Westly rooftop terrace'
            fill
            priority
            sizes='calc(max(100vw, 150vh) * 1.04)'
            className='object-cover'
          />
        </div>
      </div>

      {/* Overlay UI */}
      <a
        data-ui
        href='#explore'
        onClick={handleExploreClick}
        className='invisible absolute bottom-10 left-1/2 z-10 -translate-x-1/2 border border-neutral-200 bg-white px-10 py-2.5 text-[11px] font-medium tracking-[0.35em] text-neutral-700 opacity-0 shadow-sm transition-colors hover:border-[#6E7A6F] hover:bg-[#6E7A6F] hover:text-white'
      >
        EXPLORE
      </a>
    </section>
  );
}
