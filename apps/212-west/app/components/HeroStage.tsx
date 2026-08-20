'use client';

import { useLayoutEffect, useRef } from 'react';
import DesignedForNewYorkers, {
  DESIGNED_REVEAL_EVENT,
} from '@/app/components/DesignedForNewYorkers';
import Hero from '@/app/components/Hero';
import { getLenis } from '@/app/components/SmoothScrollProvider';
import {
  gsap,
  MOTION_CONDITIONS,
  Observer,
  type MotionConditions,
} from '@/app/lib/motion';

const TITLE_SHIFT_PERCENT = -120;
const NAV_SHIFT_PERCENT = -120;
const IMAGE_SCALE = 1.2;

const WIPE_DURATION = 1.7;
const HERO_MOTION_DURATION = 1.7;
const MOTION_EASE = 'power2.out';

const SCROLL_TOP_SLACK = 10;

function lockScroll() {
  const lockedY = window.scrollY;

  const freeze = () => {
    if (window.scrollY !== lockedY) window.scrollTo(0, lockedY);
  };

  const block = (event: Event) => event.preventDefault();

  window.addEventListener('scroll', freeze, { passive: true });
  window.addEventListener('wheel', block, { passive: false, capture: true });
  window.addEventListener('touchmove', block, {
    passive: false,
    capture: true,
  });

  return () => {
    window.removeEventListener('scroll', freeze);
    window.removeEventListener('wheel', block, true);
    window.removeEventListener('touchmove', block, true);
  };
}

export default function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const toTop = () => window.scrollTo(0, 0);
    toTop();

    window.addEventListener('load', toTop, { once: true });
    return () => window.removeEventListener('load', toTop);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const designed = stage.querySelector<HTMLElement>(
      '#designed-for-new-yorkers'
    );
    const image = stage.querySelector<HTMLElement>('[data-hero-image]');
    const nav = stage.querySelector<HTMLElement>('[data-hero-nav]');
    const title = stage.querySelector<HTMLElement>('[data-hero-title]');

    if (!designed || !image || !nav || !title) return;

    const mm = gsap.matchMedia(stage);

    mm.add({ ...MOTION_CONDITIONS, isXl: '(min-width: 1280px)' }, context => {
      const { reduce, isXl } = context.conditions as MotionConditions & {
        isXl: boolean;
      };

      if (reduce || !isXl) return;

      const heroDefaults = {
        duration: HERO_MOTION_DURATION,
        ease: MOTION_EASE,
      };

      let revealed = false;

      const wipeIn = gsap
        .timeline({ paused: true })
        .to(
          designed,
          { x: '0%', duration: WIPE_DURATION, ease: MOTION_EASE },
          0
        )
        .to(title, { xPercent: TITLE_SHIFT_PERCENT, ...heroDefaults }, 0)
        .to(nav, { yPercent: NAV_SHIFT_PERCENT, ...heroDefaults }, 0)
        .to(image, { scale: IMAGE_SCALE, ...heroDefaults }, 0)
        .call(() => {
          if (revealed) return;
          revealed = true;
          designed.dispatchEvent(new CustomEvent(DESIGNED_REVEAL_EVENT));
        });

      const wipeOut = gsap
        .timeline({ paused: true })
        .to(
          designed,
          { x: '100%', duration: WIPE_DURATION, ease: MOTION_EASE },
          0
        )
        .to(title, { xPercent: 0, ...heroDefaults }, 0)
        .to(nav, { yPercent: 0, ...heroDefaults }, 0)
        .to(image, { scale: 1, ...heroDefaults }, 0);

      let wiped = false;
      let busy = false;
      let release: (() => void) | null = null;

      const runWipe = (timeline: gsap.core.Timeline, done: () => void) => {
        busy = true;
        const lenis = getLenis();
        lenis?.stop();
        lenis?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
        release = lockScroll();
        timeline.play(0);
        timeline.eventCallback('onComplete', () => {
          release?.();
          release = null;
          busy = false;
          lenis?.start();
          done();
        });
      };

      const observer = Observer.create({
        target: window,
        type: 'wheel,touch',
        tolerance: 10,
        onDown: () => {
          if (wiped || busy) return;
          if (window.scrollY >= stage.offsetHeight) {
            wiped = true;
            return;
          }
          runWipe(wipeIn, () => {
            wiped = true;
          });
        },
        onUp: () => {
          if (!wiped || busy) return;
          if (window.scrollY > SCROLL_TOP_SLACK) return;
          runWipe(wipeOut, () => {
            wiped = false;
          });
        },
      });

      return () => {
        release?.();
        observer.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={stageRef}
      className='relative w-full overflow-hidden bg-[#0F0F0E] xl:h-svh'
    >
      <Hero />
      <DesignedForNewYorkers />
    </div>
  );
}
