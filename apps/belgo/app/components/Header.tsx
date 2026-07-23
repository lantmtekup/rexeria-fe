'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { gsap, MQ } from '@/app/lib/motion';

const NAV_LINKS = [
  { label: 'HOME', href: '#hero' },
  { label: 'ABOUT', href: '#about-product' },
  { label: 'BREWING', href: '#brewing-process' },
  { label: 'PRODUCTS', href: '#our-products' },
  { label: 'FLAVORS', href: '#more-flavors' },
  { label: 'CONTACT', href: '#footer' },
] as const;

/** Above all section overlays (max elsewhere: BrewingProcess cup z-45). */
const Z_MENU = 'z-[100]';
const Z_HEADER = 'z-[110]';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  const hasBeenOpenRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set(backdropRef.current, { autoAlpha: 0 });
      gsap.set(curtainRef.current, {
        xPercent: 110,
        autoAlpha: 0,
        rotation: -32,
        transformOrigin: 'center center',
      });
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set('[data-nav-link]', { y: 56, autoAlpha: 0 });
      gsap.set('[data-nav-cta]', { y: 28, autoAlpha: 0 });
    }, overlay);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const backdrop = backdropRef.current;
    const curtain = curtainRef.current;
    const line = lineRef.current;
    if (!overlay || !backdrop || !curtain || !line) return;

    const links = gsap.utils.toArray<HTMLElement>('[data-nav-link]', overlay);
    const ctas = gsap.utils.toArray<HTMLElement>('[data-nav-cta]', overlay);
    const reduce = window.matchMedia(MQ.reduce).matches;

    menuTlRef.current?.kill();

    const snapClosed = () => {
      gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
      gsap.set(backdrop, { autoAlpha: 0 });
      gsap.set(curtain, {
        xPercent: 110,
        autoAlpha: 0,
        rotation: -32,
        transformOrigin: 'center center',
      });
      gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(links, { y: 56, autoAlpha: 0 });
      gsap.set(ctas, { y: 28, autoAlpha: 0 });
    };

    if (reduce) {
      if (menuOpen) {
        hasBeenOpenRef.current = true;
        gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
        gsap.set([backdrop, curtain, line, ...links, ...ctas], {
          autoAlpha: 1,
          y: 0,
          xPercent: 0,
          scaleX: 1,
        });
      } else if (!hasBeenOpenRef.current) {
        snapClosed();
      } else {
        gsap.set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
        gsap.set([backdrop, curtain, line, ...links, ...ctas], {
          autoAlpha: 0,
        });
      }
      return;
    }

    if (!menuOpen && !hasBeenOpenRef.current) {
      snapClosed();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    menuTlRef.current = tl;

    if (menuOpen) {
      hasBeenOpenRef.current = true;
      gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });

      tl.fromTo(
        backdrop,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }
      )
        .fromTo(
          curtain,
          { xPercent: 110, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.inOut' },
          0
        )
        .fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.7, ease: 'power4.inOut' },
          0.18
        )
        .fromTo(
          links,
          { y: 56, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.62,
            stagger: 0.07,
            ease: 'power3.out',
          },
          0.22
        )
        .fromTo(
          ctas,
          { y: 28, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
          },
          0.42
        );
    } else {
      tl.to(links, {
        y: -28,
        autoAlpha: 0,
        duration: 0.28,
        ease: 'power2.in',
        stagger: { each: 0.04, from: 'end' },
      })
        .to(
          ctas,
          {
            y: 20,
            autoAlpha: 0,
            duration: 0.24,
            ease: 'power2.in',
            stagger: 0.05,
          },
          0
        )
        .to(line, { scaleX: 0, duration: 0.3, ease: 'power2.in' }, 0.06)
        .to(
          curtain,
          { xPercent: 110, autoAlpha: 0, duration: 0.6, ease: 'power4.in' },
          0.08
        )
        .to(backdrop, { autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.14)
        .set(overlay, { autoAlpha: 0, pointerEvents: 'none' });
    }

    return () => {
      tl.kill();
    };
  }, [menuOpen]);

  const handleMenuToggle = () => setMenuOpen(prev => !prev);

  const handleMenuClose = () => setMenuOpen(false);

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMenuToggle();
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 ${Z_HEADER} transition-[background-color,backdrop-filter,border-color] duration-300 ease-out`}
        style={{
          backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid rgba(228, 221, 206, 0.4)',
        }}
      >
        <div className='relative mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:h-20 md:px-10'>
          <button
            type='button'
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls='site-nav'
            onClick={handleMenuToggle}
            onKeyDown={handleMenuKeyDown}
            className='relative z-60 shrink-0 text-sm tracking-[0.2em] text-white/90 transition-colors hover:text-white sm:text-base'
          >
            {menuOpen ? 'CLOSE' : 'MENU'}
          </button>

          <a
            href='#hero'
            aria-label='Belgő home'
            onClick={handleMenuClose}
            className='absolute left-1/2 z-55 -translate-x-1/2'
          >
            <img
              src='/assets/logo.svg'
              alt='Belgő'
              className='h-7 w-auto sm:h-8 md:h-14'
            />
          </a>

          <div className='relative z-60 flex shrink-0 items-center gap-2 md:gap-3'>
            <button
              type='button'
              className='hidden cursor-pointer px-5 py-2.5 text-sm tracking-[0.16em] text-black transition-opacity hover:opacity-90 md:inline-flex'
              style={{ backgroundColor: '#C9A24B' }}
            >
              BOOK A TABLE
            </button>
            <button
              type='button'
              className='hidden cursor-pointer border border-white/40 px-4 py-2 text-xs tracking-[0.14em] text-white transition-colors hover:bg-white/10 lg:inline-flex lg:px-5 lg:py-2.5 lg:text-sm lg:tracking-[0.16em]'
            >
              ORDER BEER NOW
            </button>
          </div>
        </div>
      </header>

      <div
        id='site-nav'
        ref={overlayRef}
        role='dialog'
        aria-modal='true'
        aria-label='Site navigation'
        aria-hidden={!menuOpen}
        className={`pointer-events-none invisible fixed inset-0 ${Z_MENU} opacity-0`}
      >
        <div
          ref={backdropRef}
          className='absolute inset-0 bg-[#14120f]/94 opacity-0 backdrop-blur-md'
        />

        <div
          ref={curtainRef}
          className='pointer-events-none absolute top-[-22%] -right-[18%] h-[128%] w-[58%] bg-[#C9A24B]/18 opacity-0'
          aria-hidden='true'
        />

        <nav className='relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col md:flex-row md:items-end md:justify-between md:px-16 md:pt-32 md:pb-16 lg:px-20'>
          <div className='flex-1 overflow-y-auto px-6 pt-28 pb-6 md:flex-none md:overflow-visible md:px-0 md:pt-0 md:pb-0'>
            <div
              ref={lineRef}
              className='mb-8 h-px w-full max-w-xs origin-left scale-x-0 bg-[#C9A24B]/70 md:mb-10 md:max-w-sm'
              aria-hidden='true'
            />

            <ul className='space-y-3 md:space-y-1 lg:space-y-2'>
              {NAV_LINKS.map((link, index) => (
                <li key={link.href} className='overflow-hidden'>
                  <a
                    href={link.href}
                    data-nav-link
                    onClick={handleMenuClose}
                    className='group flex items-baseline gap-3 opacity-0 md:gap-5'
                  >
                    <span className='hidden text-sm tracking-[0.2em] text-[#C9A24B] md:inline'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className='block text-4xl tracking-[0.06em] text-[#EDE6D6] transition-colors duration-300 group-hover:text-[#C9A24B] sm:text-5xl md:text-6xl lg:text-7xl'
                      style={{ fontFamily: 'var(--font-bebas), sans-serif' }}
                    >
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='relative z-20 -mt-10 shrink-0 border-t border-[#C9A24B]/30 bg-[#0f0d0b] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-20px_40px_rgba(15,13,11,0.95)] md:mt-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:pb-2 md:shadow-none'>
            <p
              data-nav-cta
              className='mb-2 hidden max-w-xs text-right text-sm leading-relaxed tracking-[0.12em] text-[#EDE6D6]/55 opacity-0 md:block'
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              BELGIAN CRAFT BEER
              <br />
              HO CHI MINH CITY
            </p>
            <div className='flex flex-col gap-2.5 md:items-end md:gap-4'>
              <button
                type='button'
                data-nav-cta
                onClick={handleMenuClose}
                className='w-full cursor-pointer px-4 py-3.5 text-xs tracking-[0.14em] text-black opacity-0 transition-opacity hover:opacity-90 sm:text-sm sm:tracking-[0.16em] md:w-auto md:min-w-[220px] md:px-5'
                style={{ backgroundColor: '#C9A24B' }}
              >
                BOOK A TABLE
              </button>
              <button
                type='button'
                data-nav-cta
                onClick={handleMenuClose}
                className='w-full cursor-pointer border border-white/35 px-4 py-3.5 text-xs tracking-[0.14em] text-white opacity-0 transition-colors hover:bg-white/10 sm:text-sm sm:tracking-[0.16em] md:w-auto md:min-w-[220px] md:px-5'
              >
                ORDER BEER NOW
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
