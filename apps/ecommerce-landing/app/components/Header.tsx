'use client';

import Image from 'next/image';
import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Intro', href: '#intro' },
  { label: 'Design', href: '#design' },
  { label: 'Details', href: '#details' },
  { label: 'Products', href: '#products' },
  { label: 'The Collection', href: '#collection' },
  { label: 'Inspirations', href: '#inspirations' },
] as const;

const ACTIONS = [
  { src: '/header/icon-wishlist.svg', alt: 'Wishlist', width: 20, height: 18 },
  { src: '/header/icon-account.svg', alt: 'Account', width: 24, height: 24 },
  { src: '/header/icon-cart.svg', alt: 'Cart', width: 24, height: 24 },
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 bg-white'>
      <div className='relative flex h-[72px] items-center pr-6 pl-5 lg:pl-[29px]'>
        <button
          type='button'
          aria-label='Menu'
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
          className='mr-4 flex h-6 w-6 flex-col justify-center gap-[5px] lg:hidden'
        >
          <span className='block h-px w-full bg-black' />
          <span className='block h-px w-full bg-black' />
          <span className='block h-px w-full bg-black' />
        </button>

        <a href='#top' className='shrink-0' aria-label='Delvaux — trang chủ'>
          <Image
            src='/header/logo.png'
            alt='Delvaux'
            width={110}
            height={36}
            priority
            className='h-[35.19px] w-[110px]'
          />
        </a>

        <nav
          aria-label='Chính'
          className='ml-[60px] hidden items-center gap-6 lg:flex xl:ml-[210px] xl:gap-10'
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.href}
              className='font-montserrat text-[16px] leading-[26px] font-medium text-black uppercase transition-opacity hover:opacity-60'
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className='ml-auto flex items-center gap-6'>
          <label className='hidden h-[29px] w-[170px] items-center gap-3 border-b border-black/20 pl-[7px] md:flex'>
            <Image
              src='/header/icon-search.svg'
              alt=''
              aria-hidden
              width={24}
              height={24}
              className='h-6 w-6 shrink-0'
            />
            <input
              type='search'
              placeholder='Search'
              aria-label='Search'
              className='font-montserrat w-full border-0 bg-transparent pb-1 text-[14px] tracking-[0.05em] text-black outline-none placeholder:text-black/20'
            />
          </label>

          <div className='flex items-center gap-3'>
            {ACTIONS.map(action => (
              <button
                key={action.alt}
                type='button'
                aria-label={action.alt}
                className='flex items-center transition-opacity hover:opacity-60'
              >
                <Image
                  src={action.src}
                  alt=''
                  aria-hidden
                  width={action.width}
                  height={action.height}
                  style={{ width: action.width, height: action.height }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='h-px w-full bg-black/40' />

      {menuOpen ? (
        <nav
          aria-label='Chính (mobile)'
          className='flex flex-col gap-4 border-b border-black/40 bg-white px-5 py-6 lg:hidden'
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className='font-montserrat text-[16px] leading-[26px] font-medium text-black uppercase'
            >
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
