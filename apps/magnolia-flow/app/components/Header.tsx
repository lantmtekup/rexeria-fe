'use client';

import { useEffect, useRef, useState } from 'react';
import localFont from 'next/font/local';
import { Menu, X } from 'lucide-react';

const apfelGrotezk = localFont({
  src: '../../public/fonts/ApfelGrotezk-Regular.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-apfel-grotezk',
  display: 'swap',
});

const CONTACT_PAGE_HREF = '/contact';
const MAILTO_HREF = 'mailto:info@magnolia.com';

const LINK_CLASS =
  'group relative inline-block w-fit font-(family-name:--font-apfel-grotezk) normal-case text-[18px] leading-[27px] font-normal no-underline transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)]';

const EYEBROW_CLASS =
  'font-(family-name:--font-apfel-grotezk) text-xl font-medium tracking-[0.1em] text-[#1a1919] uppercase';

const MENU_LINK_CLASS =
  'font-(family-name:--font-apfel-grotezk) text-lg font-medium text-[#1a1919] transition-colors duration-400 ease-[cubic-bezier(0.44,0,0.56,1)] hover:text-[#1a1919]/70';

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Behance', href: '#' },
  { label: 'YouTube', href: '#' },
];

export default function Header({
  variant = 'dark',
}: {
  variant?: 'dark' | 'light';
} = {}) {
  const isLight = variant === 'light';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;
    let scrollUpDistance = 0;

    const updateVisibility = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 200) {
        scrollUpDistance = 0;
        setIsHidden(false);
      } else if (delta > 0) {
        scrollUpDistance = 0;
        setIsHidden(true);
      } else if (delta < 0) {
        scrollUpDistance -= delta;
        if (scrollUpDistance > 100) setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={` ${apfelGrotezk.variable} ${
        !isLight
          ? `transition-none xl:transition-transform xl:duration-400 xl:ease-[cubic-bezier(0.44,0,0.56,1)] ${isHidden && !isMenuOpen ? 'xl:-translate-y-full' : 'xl:translate-y-0'}`
          : ''
      } `}
    >
      <div className='relative z-20 mx-auto hidden w-full max-w-[1720px] items-center justify-between px-5 py-6.25 lg:flex'>
        <a href='/' aria-label='The Magnolia home'>
          <img
            src='/assets/magnolia-logo.svg'
            alt='The Magnolia'
            className={`h-auto w-37.75 ${isLight ? 'invert' : ''}`}
          />
        </a>

        <a
          href={CONTACT_PAGE_HREF}
          className={`${LINK_CLASS} ${isLight ? 'text-[#1a1919]' : 'text-white'}`}
        >
          Contact
          <span
            className={`absolute top-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-x-100 ${isLight ? 'bg-[#1a1919]' : 'bg-white'}`}
          />
          <span
            className={`absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-x-100 ${isLight ? 'bg-[#1a1919]' : 'bg-white'}`}
          />
        </a>
      </div>

      <div className='lg:hidden'>
        <div className='flex w-full items-center justify-between bg-white p-5 md:px-5 md:py-6.25'>
          <a href='/' aria-label='The Magnolia home'>
            <img
              src='/assets/magnolia-logo.svg'
              alt='The Magnolia'
              className='h-auto w-37.75 invert'
            />
          </a>

          <button
            type='button'
            onClick={() => setIsMenuOpen(open => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className='flex h-11 w-11 cursor-pointer items-center justify-center rounded-[5px] border bg-[#1a1919] text-white'
          >
            {isMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>

        <div
          className={`overflow-hidden bg-white transition-[max-height] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] ${
            isMenuOpen ? 'max-h-[80vh]' : 'max-h-0'
          }`}
        >
          <div className='flex h-[80vh] flex-col gap-7.5 overflow-y-auto px-5 pb-5'>
            <a
              href={CONTACT_PAGE_HREF}
              className={`w-full border-t border-[#1a1919] pt-5 ${MENU_LINK_CLASS}`}
            >
              Contact
            </a>

            <div className='flex flex-col gap-3'>
              <p className={EYEBROW_CLASS}>{'{ SAY HELLO }'}</p>
              <a href={MAILTO_HREF} className={MENU_LINK_CLASS}>
                info@magnolia.com
              </a>
            </div>

            <div className='flex flex-col gap-3'>
              <p className={EYEBROW_CLASS}>{'{ SOCIAL MEDIA }'}</p>
              <div className='flex flex-col gap-3'>
                {SOCIAL_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={MENU_LINK_CLASS}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
