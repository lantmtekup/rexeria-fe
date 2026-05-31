'use client';

/**
 * Hero Classic — code template demo. Animation = GSAP scroll-triggered
 * fade+rise cho heading, parallax cho hero image.
 *
 * Customize content qua `props.content` (key match `meta.contentSchema`).
 * Defaults inline để render được kể cả content rỗng (preview lần đầu).
 */

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import type { TemplateProps } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface Content {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  heroImage?: string;
  ctaText?: string;
  ctaUrl?: string;
  darkMode?: boolean;
}

export default function HeroClassicTemplate({
  page,
  content,
  mode,
}: TemplateProps) {
  const c = content as Content;
  const dark = c.darkMode ?? true;
  const rootRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!rootRef.current) return;
      // Heading rise on mount
      gsap.from('[data-anim="rise"]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
      });
      // Hero image parallax on scroll
      gsap.to('[data-anim="parallax"]', {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className={
        dark
          ? 'min-h-screen bg-zinc-950 text-zinc-50'
          : 'min-h-screen bg-zinc-50 text-zinc-900'
      }
    >
      <div className='mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:px-12'>
        <div className='order-2 lg:order-1'>
          {c.eyebrow && (
            <p
              data-anim='rise'
              className={
                'text-[10.5px] font-bold tracking-[0.28em] uppercase ' +
                (dark ? 'text-zinc-400' : 'text-zinc-500')
              }
            >
              {c.eyebrow}
            </p>
          )}
          <h1
            data-anim='rise'
            className='mt-4 text-[40px] leading-[1.05] font-bold tracking-tight sm:text-[56px] lg:text-[72px]'
          >
            {c.title ?? 'Tiêu đề landing page'}
          </h1>
          {c.subtitle && (
            <p
              data-anim='rise'
              className={
                'mt-6 max-w-md text-[15px] leading-relaxed ' +
                (dark ? 'text-zinc-400' : 'text-zinc-600')
              }
            >
              {c.subtitle}
            </p>
          )}
          <div data-anim='rise' className='mt-10'>
            <a
              href={c.ctaUrl ?? '#'}
              className={
                'inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 ' +
                (dark
                  ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800')
              }
            >
              {c.ctaText ?? 'Khám phá ngay'}
              <span aria-hidden>→</span>
            </a>
          </div>
          <p
            className={
              'mt-12 font-mono text-[10.5px] ' +
              (dark ? 'text-zinc-600' : 'text-zinc-400')
            }
          >
            {mode === 'preview' ? 'preview · ' : ''}/p/{page.slug || page.id}
          </p>
        </div>

        <div className='order-1 overflow-hidden rounded-3xl shadow-2xl lg:order-2'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-anim='parallax'
            src={
              c.heroImage ??
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'
            }
            alt={c.title ?? page.name}
            className='aspect-[4/5] w-full object-cover'
          />
        </div>
      </div>
    </section>
  );
}
