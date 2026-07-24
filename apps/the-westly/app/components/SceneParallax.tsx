'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import {
  gsap,
  ScrollTrigger,
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

const LABELS = {
  show: 'VIEW PENTHOUSE B',
  hide: 'BACK TO SKETCH',
} as const;

export default function SceneParallax() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mm = gsap.matchMedia(section);

    mm.add(MOTION_CONDITIONS, ctx => {
      const { isDesktop, finePointer, reduce } =
        ctx.conditions as MotionConditions;

      const photo = section.querySelector<HTMLElement>('[data-layer="photo"]');
      const far = section.querySelector<HTMLElement>('[data-layer="far"]');
      const near = section.querySelector<HTMLElement>('[data-layer="near"]');
      const reveal = section.querySelector<HTMLButtonElement>('[data-reveal]');
      const label = section.querySelector<HTMLElement>('[data-reveal-label]');
      if (!photo || !far || !near || !reveal || !label) return;

      gsap.set(photo, { autoAlpha: 0 });
      gsap.set([far, near, reveal], { autoAlpha: 0 });

      const enter = gsap.timeline({
        defaults: { ease: 'power3.out', duration: reduce ? 0 : 1.1 },
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
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
        )
        .fromTo(
          reveal,
          { autoAlpha: 0, y: reduce ? 0 : 16 },
          { autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.8 },
          reduce ? 0 : '-=0.5'
        );

      let scrubST: ScrollTrigger | undefined | any;
      let revealed = false;
      let releasePin: (() => void) | undefined;
      const nearSplit = isDesktop ? 7 : 4;
      const farSplit = isDesktop ? 4 : 2.5;

      if (!reduce) {
        // Pin section while scroll drives layer sweep; release only after full L/R travel.
        // Keep splits well under BLEED so scroll + mouse never flash stage edges.
        const scrub = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: isDesktop ? '+=100%' : '+=60%',
            pin: true,
            scrub: true,
            anticipatePin: 1,
            id: 'scene-parallax-scrub',
          },
        });
        scrubST = scrub.scrollTrigger ?? undefined;
        scrub
          .fromTo(
            near,
            { xPercent: nearSplit },
            { xPercent: -nearSplit, immediateRender: false },
            0
          )
          .fromTo(
            far,
            { xPercent: -farSplit },
            { xPercent: farSplit, immediateRender: false },
            0
          );
      }

      const freezeY = (fn: () => void) => {
        const y = window.scrollY;
        fn();
        ScrollTrigger.refresh();
        window.scrollTo({ top: y, left: 0, behavior: 'instant' });
        requestAnimationFrame(() => {
          window.scrollTo({ top: y, left: 0, behavior: 'instant' });
        });
      };

      const clearReleasePin = () => {
        if (!releasePin) return;
        window.removeEventListener('wheel', releasePin);
        window.removeEventListener('touchstart', releasePin);
        releasePin = undefined;
      };

      const onReveal = () => {
        revealed = !revealed;
        const duration = reduce ? 0 : 0.7;

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
        label.textContent = revealed ? LABELS.hide : LABELS.show;
        reveal.setAttribute('aria-pressed', String(revealed));
        reveal.setAttribute('aria-label', revealed ? LABELS.hide : LABELS.show);

        if (!scrubST) return;

        clearReleasePin();

        // Touch: giữ pin nguyên trạng — disable + refresh() + scrollTo giữa
        // gesture cuộn gây nhảy scroll; scrub chạy trên layer đã ẩn là vô hại.
        if (!finePointer) return;

        // Click: only crossfade — do not touch pin/scroll.
        // Unpin on the next user scroll so photo mode is not trapped by pin.
        if (revealed) {
          releasePin = () => {
            clearReleasePin();
            if (!revealed || !scrubST?.enabled) return;
            freezeY(() => scrubST.disable(true));
          };
          window.addEventListener('wheel', releasePin, { passive: true });
          window.addEventListener('touchstart', releasePin, { passive: true });
          return;
        }

        freezeY(() => scrubST.enable(true));
      };

      reveal.addEventListener('click', onReveal);

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
        return () => {
          clearReleasePin();
          reveal.removeEventListener('click', onReveal);
          section.removeEventListener('mousemove', onMove);
          section.removeEventListener('mouseleave', onLeave);
        };
      }

      return () => {
        clearReleasePin();
        reveal.removeEventListener('click', onReveal);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className='[container-type:size] relative h-svh min-h-120 w-full overflow-hidden bg-white md:min-h-150'
    >
      <div className='pointer-events-none absolute top-1/2 left-1/2 aspect-[1440/820] w-[max(100cqw,calc(100cqh*1440/820))] -translate-x-1/2 -translate-y-1/2 overflow-hidden'>
        <div
          data-layer='photo'
          className='invisible absolute inset-0 will-change-transform'
          aria-hidden
        >
          <Image
            src='/s3-p3.png'
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
            src='/s3-p2.png'
            alt=''
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>

        <div
          data-layer='near'
          className='invisible absolute will-change-transform'
          style={LAYER_INSET}
        >
          <Image
            src='/s3-p1.png'
            alt='The Westly interior sketch'
            fill
            sizes={LAYER_SIZES}
            className='object-cover object-center'
          />
        </div>
      </div>

      <button
        data-reveal
        type='button'
        aria-pressed='false'
        aria-label={LABELS.show}
        className='invisible absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer border border-neutral-200 bg-white px-10 py-2.5 text-[11px] font-medium tracking-[0.35em] text-neutral-700 shadow-sm transition-colors hover:border-[#6E7A6F] hover:bg-[#6E7A6F] hover:text-white'
      >
        <span data-reveal-label>{LABELS.show}</span>
      </button>
    </section>
  );
}
