'use client';

/**
 * Luxury 3D Coin landing — code template. Hero 3D coin vàng (R3F) + sections.
 * Canvas dynamic-import ssr:false (registry import từ server component nên CHỈ
 * tách SSR ở tầng client này). Customize qua `content` (key = meta.contentSchema).
 */

import * as React from 'react';
import dynamic from 'next/dynamic';

import type { TemplateProps } from '../types';

// R3F WebGL chỉ chạy client — tách SSR tại đây (template index đã 'use client').
const CoinScene = dynamic(() => import('./Coin'), {
  ssr: false,
  loading: () => (
    <div className='absolute inset-0 flex items-center justify-center text-sm text-[#c9a96e]/60'>
      Đang dựng 3D…
    </div>
  ),
});

interface Content {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  coinTopText?: string;
  coinBottomText?: string;
  specs?: string;
  ctaText?: string;
  ctaUrl?: string;
  accent?: string;
}

export default function LuxCoin3DTemplate({ content }: TemplateProps) {
  const c = content as Content;
  const accent = c.accent || '#c9a96e';
  const specs = (c.specs ?? '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <main className='min-h-screen bg-[#08070a] text-white'>
      {/* HERO 3D */}
      <section className='relative h-screen w-full overflow-hidden'>
        <div aria-label='3D gold coin' role='img' className='absolute inset-0'>
          <CoinScene
            accent={accent}
            topText={c.coinTopText}
            bottomText={c.coinBottomText}
          />
        </div>
        {/* gradient cho chữ nổi */}
        <div className='pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#08070a]' />
        <div className='pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center px-6 text-center'>
          {c.eyebrow && (
            <p
              className='mb-3 text-[11px] font-semibold tracking-[0.32em] uppercase'
              style={{ color: accent }}
            >
              {c.eyebrow}
            </p>
          )}
          <h1
            className='font-serif text-5xl leading-[0.95] font-light tracking-tight md:text-7xl'
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {c.title ?? 'The Jack Pine'}
          </h1>
          {c.subtitle && (
            <p className='mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base'>
              {c.subtitle}
            </p>
          )}
          <span className='mt-8 text-[11px] tracking-[0.2em] text-white/40 uppercase'>
            ↓ Cuộn để xoay coin
          </span>
        </div>
      </section>

      {/* SPECS */}
      {!!specs.length && (
        <section className='mx-auto max-w-5xl px-6 py-24'>
          <div className='grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4'>
            {specs.map((s, i) => (
              <div
                key={i}
                className='flex flex-col items-center justify-center gap-1 bg-[#0d0c10] px-4 py-10 text-center'
              >
                <span
                  className='text-2xl font-semibold'
                  style={{ color: accent }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className='flex flex-col items-center px-6 pb-32 text-center'>
        <h2
          className='max-w-2xl text-3xl font-light tracking-tight md:text-5xl'
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Sở hữu một kiệt tác vàng nguyên chất.
        </h2>
        <a
          href={c.ctaUrl ?? '#'}
          data-rexer-cta='lux-coin-cta'
          className='mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-[#08070a] transition-transform hover:-translate-y-0.5'
          style={{ backgroundColor: accent }}
        >
          {c.ctaText ?? 'Đăng ký sở hữu'}
          <span aria-hidden>→</span>
        </a>
      </section>
    </main>
  );
}
