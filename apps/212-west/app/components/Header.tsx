'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getLenis } from '@/app/components/SmoothScrollProvider';
import { gsap, MQ } from '@/app/lib/motion';

const NAV_ITEMS = [
  { label: 'THE BUILDING', href: '#' },
  { label: 'RESIDENCES', href: '#' },
  { label: 'AMENITIES', href: '#' },
  { label: 'VIEWS', href: '#' },
  { label: 'NEIGHBORHOOD', href: '#' },
  { label: 'AVAILABILITY', href: '#' },
  { label: 'NEWS & PRESS', href: '#' },
];

const NAV_TYPE =
  'font-[family-name:var(--font-inter)] text-sm font-medium uppercase';

const MOBILE_NAV_TYPE =
  'font-[family-name:var(--font-inter)] text-[26px] leading-none font-bold uppercase tracking-[0.02em]';

const HEADER_GRADIENT =
  'linear-gradient(180deg, rgba(97, 36, 8, 0.6) 0%, rgba(97, 36, 8, 0) 100%)';

function PhoneIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      className='h-6 w-6 md:h-7 md:w-7'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z' />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      className='h-6 w-6 md:h-7 md:w-7'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      aria-hidden='true'
    >
      <path d='M3 6h18M3 12h18M3 18h18' />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      className='h-6 w-6 md:h-7 md:w-7'
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      strokeLinecap='round'
      aria-hidden='true'
    >
      <path d='M5 5l14 14M19 5L5 19' />
    </svg>
  );
}

function Logo() {
  return (
    <a href='#' className='shrink-0' aria-label='212 West 72nd'>
      <Image
        src='/assets/logo.svg'
        alt='212 West 72nd'
        width={52}
        height={52}
        unoptimized
        priority
        className='h-13 w-13'
      />
    </a>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => setMounted(true), []);

  const openMenu = () => setOpen(true);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const drawer = drawerRef.current;
    const actions = actionsRef.current;
    if (!drawer || !actions) return;

    const items = drawer.querySelectorAll<HTMLElement>('[data-menu-item]');
    const reduce = window.matchMedia(MQ.reduce).matches;

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out' },
    });

    tl.fromTo(
      drawer,
      { y: 0, yPercent: -100, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: reduce ? 0 : 0.75 },
      0
    )
      .to(actions, { autoAlpha: 0, duration: reduce ? 0 : 0.35 }, 0)
      .fromTo(
        items,
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: reduce ? 0 : 0.6,
          stagger: reduce ? 0 : 0.06,
        },
        reduce ? 0 : 0.2
      );

    drawerTl.current = tl;

    return () => {
      tl.kill();
      drawerTl.current = null;
    };
  }, [mounted]);

  useEffect(() => {
    const tl = drawerTl.current;
    if (!tl) return;

    if (open) tl.timeScale(1).play();
    else tl.timeScale(1.35).reverse();
  }, [open]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (!open) return;

    const gap = window.innerWidth - root.clientWidth;
    root.style.setProperty('--scrollbar-gap', `${gap}px`);
    root.dataset.menuOpen = 'true';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${gap}px`;
    getLenis()?.stop();

    return () => {
      root.style.removeProperty('--scrollbar-gap');
      delete root.dataset.menuOpen;
      body.style.overflow = '';
      body.style.paddingRight = '';
      getLenis()?.start();
    };
  }, [open]);

  return (
    <>
      <header
        data-hero-nav
        className='absolute inset-x-0 top-0 z-50 text-[#EDE9E0] will-change-transform'
        style={{
          background: HEADER_GRADIENT,
          paddingRight: 'var(--scrollbar-gap, 0px)',
          transform: 'translateY(-100%)',
          opacity: 0,
        }}
      >
        <div className='mx-auto flex w-full max-w-360 items-center justify-between px-5 py-5 lg:py-6 xl:px-10'>
          <Logo />

          <nav className='hidden items-center gap-6 lg:flex'>
            {NAV_ITEMS.map(item => (
              <a
                key={item.label}
                href={item.href}
                className={`cursor-pointer ${NAV_TYPE}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href='#'
            className={`hidden cursor-pointer border border-[#EDE9E0] px-4 py-3 font-semibold tracking-[2px] lg:block ${NAV_TYPE} `}
          >
            CONTACT
          </a>

          <div ref={actionsRef} className='flex items-center gap-5 lg:hidden'>
            <a
              href='#'
              className='cursor-pointer'
              aria-label='Call 212 West 72nd'
            >
              <PhoneIcon />
            </a>
            <button
              type='button'
              onClick={openMenu}
              className='cursor-pointer'
              aria-label='Open menu'
              aria-expanded={open}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {mounted &&
        createPortal(
          <div
            ref={drawerRef}
            inert={!open}
            className='fixed inset-0 z-60 flex flex-col bg-[#0F0F0E]/88 text-[#EDE9E0] will-change-transform lg:hidden'
            style={{
              transform: 'translateY(-100%)',
              opacity: 0,
              visibility: 'hidden',
            }}
          >
            <div className='flex w-full items-center justify-between px-5 py-5'>
              <Logo />
              <button
                type='button'
                onClick={closeMenu}
                className='cursor-pointer'
                aria-label='Close menu'
              >
                <CloseIcon />
              </button>
            </div>

            <nav className='flex flex-1 flex-col gap-2 p-5'>
              {NAV_ITEMS.map(item => (
                <a
                  key={item.label}
                  data-menu-item
                  href={item.href}
                  onClick={closeMenu}
                  className={`block cursor-pointer py-3.5 ${MOBILE_NAV_TYPE}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
