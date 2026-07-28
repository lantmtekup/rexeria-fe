'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import {
  gsap,
  Observer,
  MOTION_CONDITIONS,
  type MotionConditions,
} from '../lib/motion';

/**
 * Layer bleed past the stage — single source for CSS inset, Image sizes,
 * and mouse-parallax clamps. Tuned for parallax headroom (not derived from PNG).
 * Must exceed scroll xPercent + mouse travel so edges never flash.
 */
const BLEED = { x: 16, y: 5 } as const;
// Stage = max(100cqw, 100cqh·1440/820) — portrait mobile bị chiều cao quyết định,
// nên sizes phải theo vh thay vì vw kẻo Next serve variant quá nhỏ (mờ).
const STAGE_RATIO = 1440 / 820;
const LAYER_SIZES = `calc(max(100vw, ${Math.round(STAGE_RATIO * 100)}vh) * ${
  (100 + BLEED.x * 2) / 100
})`;
const LAYER_INSET = {
  top: `-${BLEED.y}%`,
  right: `-${BLEED.x}%`,
  bottom: `-${BLEED.y}%`,
  left: `-${BLEED.x}%`,
} as const;

export default function SceneReveal() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // The section is sticky, so its own rect is unreliable for ScrollTrigger
    // measurement. Everything is triggered off siblings in normal flow: the
    // wrapper for entry, the dwell spacer for the sweep, the next section for
    // the hand-off.
    const wrap = section.parentElement ?? section;
    const dwell = wrap.querySelector<HTMLElement>('[data-dwell]') ?? wrap;
    const next = wrap.querySelector<HTMLElement>('[data-blend-next]') ?? wrap;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, isMobile, finePointer, reduce } =
        ctx.conditions as MotionConditions;
      const cleanups: Array<() => void> = [];

      const photo = section.querySelector<HTMLElement>('[data-layer="photo"]');
      const far = section.querySelector<HTMLElement>('[data-layer="far"]');
      const near = section.querySelector<HTMLElement>('[data-layer="near"]');
      const veil = section.querySelector<HTMLElement>('[data-layer="veil"]');
      const stage = section.querySelector<HTMLElement>('[data-stage]');
      if (!photo || !far || !near || !veil) return;

      gsap.set(photo, { autoAlpha: 0 });
      gsap.set([far, near], { autoAlpha: 0 });

      const enter = gsap.timeline({
        defaults: { ease: 'power3.out', duration: reduce ? 0 : 1.1 },
        scrollTrigger: { trigger: wrap, start: 'top 80%', once: true },
      });
      enter
        .fromTo(
          [far, near],
          { autoAlpha: 0, scale: reduce ? 1 : 1.06 },
          { autoAlpha: 1, scale: 1 }
        )
        .fromTo(
          photo,
          { scale: reduce ? 1 : 1.04 },
          { scale: 1, duration: reduce ? 0 : 1.2 },
          0
        );

      let revealed = false;
      let covered = false;
      // Suppress section-click toggle after a horizontal drag (whole section
      // is the toggle target — drag would otherwise flip reveal on release).
      let suppressClick = false;
      const nearSplit = isDesktop ? 7 : 4;
      const farSplit = isDesktop ? 4 : 2.5;

      if (!reduce) {
        // The section holds still via CSS sticky, so no ScrollTrigger pin: the
        // dwell spacer below it *is* the sweep's scroll budget (its own height,
        // 100svh desktop / 60svh mobile — matching the old +=100% / +=60%).
        // Nothing to enable/disable on reveal either, since document height
        // never changes and the user can always scroll out.
        // Keep splits well under BLEED so scroll + mouse never flash stage edges.
        // immediateRender stays on (the default): these from states are not the
        // layers' natural position, so deferring them would leave the layers at
        // 0 until the trigger first renders and then snap them sideways in a
        // single frame as the section reaches the top.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: dwell,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: true,
              id: 'scene-reveal-scrub',
            },
          })
          .fromTo(near, { xPercent: -nearSplit }, { xPercent: nearSplit }, 0)
          .fromTo(far, { xPercent: farSplit }, { xPercent: -farSplit }, 0);

        // Hand-off to ProductReveal — mirrors the hero: a cream veil (same
        // colour as that section) washes this one out while it rides up, so the
        // two resolve to one flat colour with no seam.
        // Every from state is explicit — an empty one lets GSAP capture
        // whatever is current at first render, and a refresh mid-scroll then
        // records the end value as the start, so scrolling back never undoes it.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: next,
              start: 'top bottom',
              end: 'top 15%',
              scrub: 0.4,
              // The whole section is the reveal toggle and the veil is
              // click-through, so stop it swallowing clicks meant for the
              // section riding over it.
              onUpdate: self => {
                const off = self.progress > 0.6;
                if (off !== covered) {
                  covered = off;
                  section.style.pointerEvents = off ? 'none' : '';
                }
              },
            },
          })
          .fromTo(
            veil,
            { opacity: 0 },
            { opacity: 1, duration: 0.57, immediateRender: false },
            0.25
          )
          // Placeholder that pins the timeline's length to 1. A timeline is
          // only as long as its longest child, so without this the veil would
          // be stretched to fill the whole scroll range and only go solid at
          // the very end instead of at 30% from the top.
          .to({}, { duration: 1 }, 0);
      }

      const panState = { x: 0 };
      const DEPTH = { near: 1, far: 0.42, photo: 0.85 } as const;

      const applyPan = (x: number) => {
        if (revealed) {
          gsap.set(photo, { x: x * DEPTH.photo });
          gsap.set([near, far], { x: 0 });
          return;
        }
        gsap.set(near, { x: x * DEPTH.near });
        gsap.set(far, { x: x * DEPTH.far });
        gsap.set(photo, { x: 0 });
      };

      const resetPan = () => {
        gsap.killTweensOf(panState);
        panState.x = 0;
        gsap.set([near, far, photo], { x: 0 });
      };

      const onToggle = () => {
        if (suppressClick) {
          suppressClick = false;
          return;
        }
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;
        resetPan();

        gsap.to(photo, {
          autoAlpha: revealed ? 1 : 0,
          duration,
          ease: 'power2.inOut',
        });
        gsap.to([near, far], {
          autoAlpha: revealed ? 0 : 1,
          scale: revealed ? 1.02 : 1,
          duration,
          ease: 'power2.inOut',
          stagger: 0.06,
        });
        section.setAttribute('aria-pressed', String(revealed));
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onToggle();
      };

      // Whole section is the toggle target — a click anywhere flips the reveal.
      section.addEventListener('click', onToggle);
      section.addEventListener('keydown', onKeyDown);
      cleanups.push(() => {
        section.style.pointerEvents = '';
        section.removeEventListener('click', onToggle);
        section.removeEventListener('keydown', onKeyDown);
      });

      if (finePointer && !reduce) {
        const follow = { duration: 0.8, ease: 'power3.out' } as const;
        const nearX = gsap.quickTo(near, 'x', follow);
        const nearY = gsap.quickTo(near, 'y', follow);
        const farX = gsap.quickTo(far, 'x', follow);
        const farY = gsap.quickTo(far, 'y', follow);

        // Bleed is % of stage; xPercent travel is % of layer width — reserve that in px.
        const maxNearX = () => {
          const bleedPx = (section.offsetWidth * BLEED.x) / 100;
          const scrollPx = (near.offsetWidth * nearSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxFarX = () => {
          const bleedPx = (section.offsetWidth * BLEED.x * 0.55) / 100;
          const scrollPx = (far.offsetWidth * farSplit) / 100;
          return Math.max(0, bleedPx - scrollPx);
        };
        const maxNearY = () => (section.offsetHeight * BLEED.y) / 100;
        const maxFarY = () =>
          (section.offsetHeight * (BLEED.y * (2 / 3))) / 100;

        const onMove = (e: MouseEvent) => {
          if (revealed) return;
          const r = section.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = ((e.clientY - r.top) / r.height) * 2 - 1;

          const nMaxX = maxNearX();
          const fMaxX = maxFarX();
          const nMaxY = maxNearY();
          const fMaxY = maxFarY();

          nearX(gsap.utils.clamp(-nMaxX, nMaxX, -nx * 52));
          nearY(gsap.utils.clamp(-nMaxY, nMaxY, -ny * 18));
          farX(gsap.utils.clamp(-fMaxX, fMaxX, nx * 28));
          farY(gsap.utils.clamp(-fMaxY, fMaxY, ny * 10));
        };
        const onLeave = () => {
          if (revealed) return;
          gsap.to([near, far], {
            x: 0,
            y: 0,
            duration: 1,
            ease: 'power2.out',
          });
        };

        section.addEventListener('mousemove', onMove);
        section.addEventListener('mouseleave', onLeave);
        cleanups.push(() => {
          section.removeEventListener('mousemove', onMove);
          section.removeEventListener('mouseleave', onLeave);
        });
      }

      // Mobile: horizontal drag with depth parallax (near full, far slower).
      if (isMobile && !reduce) {
        let maxOffset = 0;
        let axis: 'x' | 'y' | null = null;
        let dragTravel = 0;

        const refreshMaxOffset = () => {
          const bleedPx = (section.offsetWidth * BLEED.x) / 100;
          const nearScrollPx = (near.offsetWidth * nearSplit) / 100;
          const bleedRoom = Math.max(0, bleedPx - nearScrollPx);
          const stageOverflow = stage
            ? Math.max(0, (stage.offsetWidth - section.clientWidth) / 2)
            : 0;
          maxOffset = Math.max(bleedRoom, stageOverflow * 0.55);
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
            dragTravel = 0;
            gsap.killTweensOf(panState);
          },
          onLockAxis: self => {
            axis = self.axis as 'x' | 'y';
          },
          onDrag: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            dragTravel += Math.abs(self.deltaX);
            panState.x = gsap.utils.clamp(
              -maxOffset,
              maxOffset,
              panState.x + self.deltaX
            );
            applyPan(panState.x);
          },
          onDragEnd: self => {
            if (axis !== 'x' || maxOffset <= 0) return;
            if (dragTravel > 8) suppressClick = true;
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
          resetPan();
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
      data-cursor-id='scene-reveal'
      role='button'
      tabIndex={0}
      aria-pressed='false'
      aria-label='Toggle interior view'
      className='[container-type:size] sticky top-0 z-0 h-svh min-h-120 w-full cursor-pointer overflow-hidden bg-white md:min-h-150'
    >
      <div
        data-stage
        className='pointer-events-none absolute top-1/2 left-1/2 aspect-[1440/820] w-[max(100cqw,calc(100cqh*1440/820))] -translate-x-1/2 -translate-y-1/2 overflow-hidden'
      >
        <div
          data-layer='photo'
          className='invisible absolute inset-0 will-change-transform'
          aria-hidden
        >
          <Image
            src='/s5-p3.png'
            alt=''
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>

        <div
          data-layer='far'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/s5-p2.png'
            alt=''
            fill
            sizes={LAYER_SIZES}
            className='object-center'
          />
        </div>

        <div
          data-layer='near'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/s5-p1.png'
            alt='The Westly interior sketch'
            fill
            sizes={LAYER_SIZES}
            className='object-center'
          />
        </div>
      </div>

      {/* Blend veil — same colour as ProductReveal, so this section dissolves
          into it instead of being cut off by a hard edge. */}
      <div
        data-layer='veil'
        aria-hidden
        className='pointer-events-none absolute inset-0 z-20 bg-[#F3F1EA] opacity-0'
      />
    </section>
  );
}
