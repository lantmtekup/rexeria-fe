'use client';

import { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 40;

// Fixed top header. Transparent — sits directly over the hero image so the
// product photo runs edge-to-edge. Soft drop-shadow keeps the logo legible
// against varying hero backgrounds. Logo centers and shrinks slightly after
// the user scrolls past the top of the page.
export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className='pointer-events-none fixed top-0 right-0 left-0 z-50 flex items-center px-6 pt-5 pb-3 md:px-10'>
      <a
        href=''
        data-cta-id='header-logo'
        className='brand-logo pointer-events-auto'
        aria-label='Royal Canadian Mint'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/logo-pnj.png'
          alt=''
          className={`transition-[height] duration-300 ease-out ${
            scrolled ? 'h-9 md:h-12' : 'h-12 md:h-16'
          }`}
        />
      </a>
    </header>
  );
}
