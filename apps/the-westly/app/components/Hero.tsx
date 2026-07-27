'use client';

import Image from 'next/image';
import {
  useLayoutEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import {
  gsap,
  Observer,
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
    const veil = section.querySelector<HTMLElement>('[data-layer="veil"]');
    const pan = section.querySelector<HTMLElement>('[data-pan]');
    const farDrift = far?.querySelector<HTMLElement>('[data-drift]');
    const midDrift = mid?.querySelector<HTMLElement>('[data-drift]');
    const ui = section.querySelectorAll<HTMLElement>('[data-ui]');
    if (!scene || !far || !mid || !veil || !pan || !farDrift || !midDrift)
      return;

    // Blend range = the next section rising over the pinned hero. Trigger off
    // that section (normal flow) — the hero itself is sticky, so its own rect
    // is unreliable for ScrollTrigger measurement.
    const next = document.querySelector<HTMLElement>('#explore') ?? section;

    // Hide before first paint — avoids flash while GSAP / ScrollTrigger init.
    gsap.set(scene, { autoAlpha: 0, scale: 1.12 });
    gsap.set([far, mid, ui], { autoAlpha: 0 });

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { finePointer, isMobile, reduce } =
        ctx.conditions as MotionConditions;
      const cleanups: Array<() => void> = [];

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

      // A reload or back-nav can restore scroll mid-page, where the entrance
      // would spend its whole duration fighting the scrubbed exit over the
      // same autoAlpha. Land on the end state instead.
      if (window.scrollY > 0) tl.progress(1);

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

        // Exit — the hero is sticky, so it does not scroll away: instead the
        // next section rides up over it while a cream veil (same colour as
        // that section's background) washes the hero out. Both fades share one
        // range so the two sections resolve to a single flat colour with no
        // visible seam. fromTo (not .to) so scrub reverses cleanly.
        const exit = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            // Saturated while the hero still owns the top of the viewport —
            // guarantees no hero peeking above the incoming section.
            end: 'top 15%',
            // Soft scrub so programmatic EXPLORE scroll feels continuous,
            // including when user scrolls back up and clicks again.
            scrub: 0.4,
          },
        });
        // Every from state is explicit — an empty (or partial) from lets GSAP
        // capture whatever the element happens to be at first render, and a
        // refresh mid-scroll then records autoAlpha 0 as the *start*, so
        // scrolling back up never restores visibility (hero image and EXPLORE
        // button vanish for good). immediateRender: false keeps these off the
        // entrance: they only apply once the user actually scrolls, at which
        // point snapping to the entrance's end state is the correct result.
        exit
          // The hero covers the whole viewport while stuck, so this veil alone
          // tints everything — including what shows through the transparent
          // section on top. It must reach 1 *before* that section starts
          // painting its own background, or the two tints stack and a seam
          // appears along the incoming edge.
          // Held back on purpose: the hero stays legible while the next
          // section rises, and only goes flat once that section is ~30% from
          // the top of the viewport — the wash reads as a hand-off, not a
          // fade-to-blank.
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.57, immediateRender: false },
            0.25
          )
          .fromTo(
            scene,
            { scale: 1 },
            { scale: 1.18, duration: 1, immediateRender: false },
            0
          )
          .fromTo(
            far,
            { xPercent: 0, autoAlpha: 1 },
            {
              xPercent: -16,
              autoAlpha: 0,
              duration: 1,
              immediateRender: false,
            },
            0
          )
          .fromTo(
            mid,
            { xPercent: 0, autoAlpha: 1 },
            { xPercent: 45, autoAlpha: 0, duration: 1, immediateRender: false },
            0
          )
          .fromTo(
            ui,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.25, immediateRender: false },
            0
          )
          // Drop the terrace only once the veil already hides it — keeps the
          // photo readable through the blend instead of exposing bare white.
          .fromTo(
            scene,
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: 0.15, immediateRender: false },
            0.82
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
        cleanups.push(() => {
          gsap.ticker.remove(onTick);
          section.removeEventListener('mousemove', onMove);
          section.removeEventListener('mouseleave', onLeave);
          window.removeEventListener('resize', refreshBounds);
          gsap.set([scene, far, mid], { x: 0, y: 0 });
        });
      }

      // Mobile: horizontal drag to reveal cropped sides — layers move at
      // different depths (scene full, mid closer, far slower) for parallax.
      if (isMobile && !reduce) {
        const panState = { x: 0 };
        let maxOffset = 0;
        let axis: 'x' | 'y' | null = null;
        // Depth ratios vs scene travel — same direction, lag = distance.
        const DEPTH = { far: 0.38, mid: 0.72 } as const;

        const applyPan = (x: number) => {
          gsap.set(scene, { x });
          gsap.set(far, { x: x * DEPTH.far });
          gsap.set(mid, { x: x * DEPTH.mid });
        };

        const refreshMaxOffset = () => {
          const stage = pan.parentElement;
          if (!stage) {
            maxOffset = 0;
            return;
          }
          maxOffset = Math.max(
            0,
            (stage.offsetWidth - section.clientWidth) / 2
          );
          panState.x = gsap.utils.clamp(-maxOffset, maxOffset, panState.x);
          applyPan(panState.x);
        };

        refreshMaxOffset();
        section.style.touchAction = 'pan-y';

        const observer = Observer.create({
          target: section,
          type: 'touch,pointer',
          dragMinimum: 6,
          lockAxis: true,
          onPress: () => {
            axis = null;
            gsap.killTweensOf(panState);
          },
          onLockAxis: self => {
            axis = self.axis as 'x' | 'y';
          },
          onDrag: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            panState.x = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.deltaX
            );
            applyPan(panState.x);
          },
          onDragEnd: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            const projected = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.velocityX * 0.18
            );
            gsap.to(panState, {
              x: projected,
              duration: 0.55,
              ease: 'power2.out',
              onUpdate: () => {
                applyPan(panState.x);
              },
            });
          },
          onRelease: () => {
            axis = null;
          },
        });

        window.addEventListener('resize', refreshMaxOffset);
        cleanups.push(() => {
          observer.kill();
          window.removeEventListener('resize', refreshMaxOffset);
          section.style.touchAction = '';
          gsap.killTweensOf(panState);
          gsap.set([scene, far, mid], { x: 0 });
          panState.x = 0;
        });
      }

      if (cleanups.length === 0) return;
      return () => {
        cleanups.forEach(fn => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='[container-type:size] sticky top-0 z-0 h-svh min-h-120 w-full overflow-hidden bg-white md:min-h-150'
    >
      {/* Stage: fixed 3:2 design frame (1440×960) that covers the section —
          layers keep their design-frame percentages so they scale uniformly
          and stay aligned; the section crops the edges on other aspects. */}
      <div className='pointer-events-none absolute top-1/2 left-1/2 aspect-[3/2] w-[max(100cqw,150cqh)] -translate-x-1/2 -translate-y-1/2'>
        {/* Pan layer — mobile drag offsets this; outer stays CSS-centered. */}
        <div data-pan className='absolute inset-0 will-change-transform'>
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
                sizes='(max-width: 767px) 150vw, 100vw'
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
            {/* WebP (~5× smaller than the 2.4MB PNG) — raw PNG often fails on
                real devices over ngrok / slow links. unoptimized skips the
                /_next/image round-trip that is fragile through tunnels. */}
            <Image
              src='/p1-hero.webp'
              alt='The Westly rooftop terrace'
              fill
              priority
              unoptimized
              sizes='(max-width: 767px) 150vw, 100vw'
              className='object-cover'
            />
          </div>
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

      {/* Blend veil — same colour as the next section's background, so the
          hero dissolves into it instead of being cut off by a hard edge. */}
      <div
        data-layer='veil'
        aria-hidden
        className='pointer-events-none absolute inset-0 z-20 bg-[#F3F1EA] opacity-0'
      />
    </section>
  );
}
