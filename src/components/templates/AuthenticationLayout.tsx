import Link from 'next/link';
import * as React from 'react';

import { Logo } from '@/components/atoms/logo';
import { cn } from '@/lib/cn';

export interface AuthenticationLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Enterprise Auth Shell utilizing Portal V2 design tokens (`--pv2-*`).
 *
 * Visual Architecture:
 * ┌──────────────────────────────────────┬─────────────────────────┐
 * │ HERO SHOWCASE (Brand Image Hero)     │ FORM PANEL (Paper)      │
 * │ - Hero Image (/brand/sign-in-hero)   │ - ReXer Logo            │
 * │ - Subtle dark gradient overlay       │ - Form children (auth)  │
 * │                                      │ - Footer & Legal        │
 * └──────────────────────────────────────┴─────────────────────────┘
 * Hero collapses on mobile viewports (<768px).
 */
export default function AuthenticationLayout({
  children,
  className,
}: AuthenticationLayoutProps) {
  return (
    <div
      data-portal-v2
      className={cn(
        'relative flex min-h-dvh w-full overflow-x-hidden bg-[#f5f7fb] font-sans text-[#0e1117] antialiased',
        className
      )}
    >
      {/* LEFT COLUMN: HERO SHOWCASE WITH BRAND IMAGE */}
      <aside
        aria-label='ReXer Platform Showcase'
        className='relative hidden flex-1 overflow-hidden bg-[#0e1117] select-none md:block'
      >
        {/* Hero Background Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/brand/sign-in-hero.png'
          alt=''
          className='absolute inset-0 size-full object-cover'
          draggable={false}
        />

        {/* Ambient Dark Gradient Overlay */}
        <div className='pointer-events-none absolute inset-0 bg-linear-to-t from-[#0e1117]/80 via-[#0e1117]/20 to-[#0e1117]/50' />

        {/* Hero Overlay Content */}
        <div className='relative z-10 flex h-full flex-col justify-between p-8 lg:p-12 xl:p-16'>
          {/* Hero Top Bar */}
          <div className='flex items-center justify-between'>
            <Link
              href='/'
              className='flex items-center gap-3 transition-opacity hover:opacity-90'
              aria-label='ReXer Home'
            >
              <Logo size={22} className='brightness-0 invert' />
            </Link>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: FORM SECTION */}
      <section className='flex w-full flex-col justify-between bg-white p-6 md:w-125 md:shrink-0 xl:p-12'>
        {/* Top Logo Bar */}
        <div className='flex w-full items-center justify-between py-2'>
          <Link
            href='/'
            aria-label='Go to ReXer Home'
            className='transition-opacity hover:opacity-80'
          >
            <Logo size={20} />
          </Link>
        </div>

        {/* Form Container */}
        <div className='my-auto flex w-full justify-center py-8'>
          <div className='w-full max-w-105'>{children}</div>
        </div>

        {/* Footer Links & Copyright */}
        <div className='flex items-center justify-between border-t border-[#e2e7f0] pt-4 text-xs text-[#8b95a8]'>
          <span>&copy; {new Date().getFullYear()} ReXer AI</span>
          <div className='flex items-center gap-4'>
            <Link
              href='/privacy'
              className='transition-colors hover:text-[#0e1117]'
            >
              Chính sách quyền riêng tư
            </Link>
            <Link
              href='/terms'
              className='transition-colors hover:text-[#0e1117]'
            >
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
