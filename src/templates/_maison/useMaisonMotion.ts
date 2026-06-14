'use client';

/**
 * Shared GSAP motion engine for the three Maison Éclat landing templates
 * (maison-noir / maison-atelier / maison-clair). Data-attribute driven so each
 * template stays mostly JSX + CSS. Techniques: Lenis smooth-scroll, word-mask
 * SplitText-style reveals, scroll fade/blur, parallax, count-up, magnetic
 * buttons, horizontal pinned gallery, pinned scrollytelling, and the
 * Essentia-style scrub word reveal. Progressive enhancement: with reduced
 * motion everything is shown statically.
 *
 * Usage: const ref = useRef<HTMLDivElement>(null); useMaisonMotion(ref);
 * Scope every selector to the template root so multiple templates never clash.
 */
import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function splitWords(el: Element): HTMLElement[] {
  const text = el.textContent ?? '';
  el.textContent = '';
  const out: HTMLElement[] = [];
  text.split(/(\s+)/).forEach(tok => {
    if (tok === '') return;
    if (/^\s+$/.test(tok)) {
      el.appendChild(document.createTextNode(tok));
      return;
    }
    const w = document.createElement('span');
    w.className = 'word';
    const i = document.createElement('span');
    i.className = 'word__i';
    i.textContent = tok;
    w.appendChild(i);
    el.appendChild(w);
    out.push(i);
  });
  return out;
}

export function useMaisonMotion(
  rootRef: React.RefObject<HTMLElement | null>
): void {
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const $ = (sel: string) => Array.from(root.querySelectorAll(sel));

      if (reduce) {
        root.classList.add('no-anim');
        $('[data-count]').forEach(el => {
          el.textContent = el.getAttribute('data-count') ?? '';
        });
        return;
      }
      root.classList.add('anim');

      // 1 — Lenis smooth scroll
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const ticker = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
      const onAnchor = (e: Event) => {
        const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href') ?? '';
        if (id.length > 1 && root.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(root.querySelector(id) as HTMLElement, {
            duration: 1.4,
          });
          root.classList.remove('menu-open');
        }
      };
      root.addEventListener('click', onAnchor);

      // 2 — Magnetic buttons (no custom cursor: a11y)
      const magCleanups: Array<() => void> = [];
      $('[data-magnetic]').forEach(b => {
        const el = b as HTMLElement;
        const strength = parseFloat(el.getAttribute('data-magnetic') || '14');
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: ((e.clientX - r.left) / r.width - 0.5) * strength,
            y: ((e.clientY - r.top) / r.height - 0.5) * strength,
            duration: 0.4,
          });
        };
        const leave = () =>
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1,0.4)',
          });
        el.addEventListener('pointermove', move as EventListener);
        el.addEventListener('pointerleave', leave);
        magCleanups.push(() => {
          el.removeEventListener('pointermove', move as EventListener);
          el.removeEventListener('pointerleave', leave);
        });
      });

      // 3 — Hero load timeline (split reveal + clip-path unveil)
      let heroSplit: HTMLElement[] = [];
      $('[data-hero-split]').forEach(el => {
        heroSplit = heroSplit.concat(splitWords(el));
      });
      const heroTl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        delay: 0.15,
      });
      if (heroSplit.length)
        heroTl.fromTo(
          heroSplit,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.3, stagger: 0.06 },
          0
        );
      if ($('[data-hero-clip]').length)
        heroTl.fromTo(
          '[data-hero-clip]',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power3.inOut' },
          0.1
        );
      if ($('[data-hero-fade]').length)
        heroTl.from(
          '[data-hero-fade]',
          { autoAlpha: 0, y: 24, duration: 1.1, stagger: 0.12 },
          0.6
        );

      // 4 — Scroll word-mask reveals for headings
      $('[data-split]').forEach(el => {
        const words = splitWords(el);
        gsap.fromTo(
          words,
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // 4b — Essentia-style scrub word reveal
      $('[data-words-reveal]').forEach(el => {
        const text = el.textContent ?? '';
        el.textContent = '';
        const spans: HTMLElement[] = [];
        text.split(/(\s+)/).forEach(tok => {
          if (tok === '') return;
          if (/^\s+$/.test(tok)) {
            el.appendChild(document.createTextNode(tok));
            return;
          }
          const s = document.createElement('span');
          s.className = 'rword';
          s.textContent = tok;
          el.appendChild(s);
          spans.push(s);
        });
        gsap.fromTo(
          spans,
          { opacity: 0.14, filter: 'blur(4px)' },
          {
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'none',
            stagger: 0.4,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'bottom 60%',
              scrub: true,
            },
          }
        );
      });

      // 5 — Generic fade/blur reveals
      const reveals = $('.reveal');
      gsap.set(reveals, { autoAlpha: 0, y: 38, filter: 'blur(8px)' });
      ScrollTrigger.batch(reveals, {
        start: 'top 88%',
        onEnter: els =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.1,
            stagger: 0.1,
            ease: 'power3.out',
            overwrite: true,
          }),
      });

      // 6 — Parallax layers
      $('[data-parallax]').forEach(el => {
        const sp = parseFloat(el.getAttribute('data-parallax') || '14');
        const scope =
          (el.closest('[data-parallax-scope]') as HTMLElement) ||
          (el as HTMLElement);
        gsap.fromTo(
          el,
          { yPercent: -sp },
          {
            yPercent: sp,
            ease: 'none',
            scrollTrigger: {
              trigger: scope,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      });

      // 7 — Count-up numbers
      $('[data-count]').forEach(el => {
        const target = parseFloat(el.getAttribute('data-count') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const obj = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              v: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = Math.round(obj.v) + suffix;
              },
            }),
        });
      });

      // 8 — Horizontal pinned gallery
      $('[data-hgallery]').forEach(track => {
        const scope =
          (track.closest('[data-hgallery-scope]') as HTMLElement) ||
          (track.parentNode as HTMLElement);
        const dist = () =>
          Math.max(0, (track as HTMLElement).scrollWidth - window.innerWidth);
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: scope,
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      });

      // 9 — Pinned scrollytelling
      $('[data-pin-story]').forEach(scope => {
        const steps = Array.from(scope.querySelectorAll('[data-step]'));
        const medias = Array.from(scope.querySelectorAll('[data-step-media]'));
        if (!steps.length) return;
        const media = scope.querySelector('[data-pin-media]') as HTMLElement;
        ScrollTrigger.create({
          trigger: scope,
          start: 'top top',
          end: 'bottom bottom',
          pin: media,
          pinSpacing: false,
        });
        steps.forEach((step, i) => {
          ScrollTrigger.create({
            trigger: step,
            start: 'top center',
            end: 'bottom center',
            onToggle: self => {
              if (self.isActive) {
                gsap.to(step, { autoAlpha: 1, duration: 0.5 });
                if (medias[i]) {
                  gsap.to(medias, { autoAlpha: 0, duration: 0.6 });
                  gsap.to(medias[i], { autoAlpha: 1, duration: 0.6 });
                }
              } else {
                gsap.to(step, { autoAlpha: 0.25, duration: 0.5 });
              }
            },
          });
        });
        gsap.set(steps, { autoAlpha: 0.25 });
        gsap.set(steps[0], { autoAlpha: 1 });
        if (medias.length) {
          gsap.set(medias, { autoAlpha: 0 });
          gsap.set(medias[0], { autoAlpha: 1 });
        }
      });

      // 10 — Nav solid on scroll + hamburger
      const nav = root.querySelector('.nav');
      if (nav)
        ScrollTrigger.create({
          start: 60,
          end: 'max',
          onUpdate: s => nav.classList.toggle('nav--solid', s.scroll() > 60),
        });
      const burger = root.querySelector('.burger');
      const onBurger = () => root.classList.toggle('menu-open');
      if (burger) burger.addEventListener('click', onBurger);

      // 11 — Booking form: client-only confirmation
      const formCleanups: Array<() => void> = [];
      $('form.booking').forEach(f => {
        const onSubmit = (e: Event) => {
          e.preventDefault();
          const inner =
            (f.querySelector('[data-form-body]') as HTMLElement) || f;
          inner.innerHTML =
            '<div class="booking__done"><div class="ck">✓</div><p>Thank you. Our atelier will confirm your private appointment within 24 hours.</p></div>';
        };
        f.addEventListener('submit', onSubmit);
        formCleanups.push(() => f.removeEventListener('submit', onSubmit));
      });

      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad);
      ScrollTrigger.refresh();

      return () => {
        gsap.ticker.remove(ticker);
        lenis.destroy();
        root.removeEventListener('click', onAnchor);
        if (burger) burger.removeEventListener('click', onBurger);
        magCleanups.forEach(fn => fn());
        formCleanups.forEach(fn => fn());
        window.removeEventListener('load', onLoad);
      };
    },
    { scope: rootRef }
  );
}
