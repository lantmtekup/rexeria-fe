'use client';

/**
 * ShowcaseHero — hero tối cho /rexer/ads theo ngôn ngữ landing rexer:
 * WordReveal + serif-italic, eyebrow "+ Label", pill CTA, phone demo LIVE
 * (khung .adsc-phone dùng lại từ showcase.css, khoá tương tác như gallery).
 */
import * as React from 'react';
import Link from 'next/link';

import {
  FadeUp,
  ScaleIn,
  WordReveal,
} from '@/components/landing/LandingMotion';

import { AdGalleryLinkContext } from './ads/shared/AdGalleryLinkContext';

type ShowcaseHeroProps = {
  total: number;
  item: { id: string; name: string; render: () => React.ReactNode };
  onExplore: () => void;
};

export function ShowcaseHero({ total, item, onExplore }: ShowcaseHeroProps) {
  const href = `/rexer/ads/${item.id}`;

  return (
    <section className='relative isolate overflow-hidden bg-neutral-950 text-white'>
      {/* Glow navy + gold — echo gradient CTA cuối trang (#0a1c38 → #c9a25b). */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_12%_0%,rgba(28,63,116,0.55),transparent_70%),radial-gradient(50%_45%_at_88%_100%,rgba(184,150,90,0.22),transparent_70%)]'
      />
      <div className='mx-auto grid max-w-6xl items-center gap-10 px-6 pt-10 pb-12 sm:pt-12 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:py-14'>
        <div>
          <FadeUp on='load' delay={0.2}>
            <p className='text-sm text-white/60'>+ Interactive Ad Formats</p>
          </FadeUp>
          <h1 className='mt-4 text-5xl leading-none font-semibold tracking-tight sm:text-7xl'>
            <WordReveal
              on='load'
              delay={0.35}
              text='Ads you can touch'
              italic={3}
            />
          </h1>
          <FadeUp on='load' delay={0.7}>
            <p className='mt-6 max-w-md text-lg text-white/80'>
              Drag, swipe, scratch and tap. {total} live formats, built once,
              delivered everywhere.
            </p>
          </FadeUp>
          <FadeUp on='load' delay={0.85}>
            <button
              type='button'
              onClick={onExplore}
              className='rounded-pill mt-8 inline-flex h-10 items-center bg-white px-6 text-sm font-medium text-neutral-950 transition-transform hover:scale-105'
            >
              Explore the gallery
            </button>
          </FadeUp>
        </div>

        {/* Phone demo live — chỉ xem, tap mở trang chi tiết (như gallery). */}
        {/* Mobile/tablet (hero stack dọc): ẩn phone demo — chỉ hiện khi grid
            chia 2 cột ở lg. */}
        <ScaleIn
          delay={0.3}
          className='mx-auto hidden w-full max-w-55 sm:max-w-60 lg:block'
        >
          <div className='adsc-phone adsc-phone--hero lg:rotate-2'>
            <div className='adsc-screen adsc-screen--locked'>
              {/* Ad render ở design width 360px rồi scale xuống — chữ trong ad
                  giữ đúng tỷ lệ điện thoại thật thay vì phình to theo px. */}
              <div className='adsc-scale'>
                <AdGalleryLinkContext.Provider value={href}>
                  {item.render()}
                </AdGalleryLinkContext.Provider>
              </div>
              <Link
                href={href}
                target='_blank'
                rel='noopener noreferrer'
                className='adsc-tap'
                aria-label={`Open ${item.name} demo`}
              />
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}
