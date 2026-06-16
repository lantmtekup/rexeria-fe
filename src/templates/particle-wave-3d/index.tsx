'use client';

/**
 * Particle Wave 3D landing — code template. Hero trường particle shader GPU.
 * Canvas dynamic ssr:false (registry vẫn ssr:true). Customize qua `content`.
 */

import * as React from 'react';
import dynamic from 'next/dynamic';

import type { TemplateProps } from '../types';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className='absolute inset-0 flex items-center justify-center text-sm text-white/40'>
      Đang dựng 3D…
    </div>
  ),
});

interface Content {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  colorA?: string;
  colorB?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export default function ParticleWave3DTemplate({ content }: TemplateProps) {
  const c = content as Content;
  return (
    <main className='relative min-h-screen bg-[#06070b] text-white'>
      <section className='relative h-screen w-full overflow-hidden'>
        <div
          className='absolute inset-0'
          aria-label='3D particle wave'
          role='img'
        >
          <Scene colorA={c.colorA} colorB={c.colorB} />
        </div>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center'>
          {c.eyebrow && (
            <p className='mb-4 text-[11px] font-semibold tracking-[0.34em] text-white/60 uppercase'>
              {c.eyebrow}
            </p>
          )}
          <h1 className='max-w-4xl text-5xl leading-[0.98] font-bold tracking-tight md:text-8xl'>
            {c.title ?? 'Trải nghiệm khác biệt'}
          </h1>
          {c.subtitle && (
            <p className='mt-5 max-w-xl text-sm leading-relaxed text-white/70 md:text-lg'>
              {c.subtitle}
            </p>
          )}
          <a
            href={c.ctaUrl ?? '#'}
            data-rexer-cta='particle-cta'
            className='pointer-events-auto mt-9 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-[#06070b] transition-transform hover:-translate-y-0.5'
          >
            {c.ctaText ?? 'Bắt đầu'}
            <span aria-hidden>→</span>
          </a>
        </div>
        <div className='pointer-events-none absolute inset-x-0 bottom-6 text-center text-[11px] tracking-[0.2em] text-white/30 uppercase'>
          Di chuột để tạo gợn sóng
        </div>
      </section>
    </main>
  );
}
