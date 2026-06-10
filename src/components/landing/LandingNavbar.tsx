'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Logo } from '@/components/atoms/logo';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/rexer', label: 'Home' },
  { href: '/rexer/studio', label: 'Studio' },
  { href: '/rexer/about', label: 'About us' },
  { href: '/rexer/projects', label: 'Projects' },
  { href: '/rexer/contact', label: 'Contact' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/rexer' ? pathname === '/rexer' : pathname.startsWith(href);
}

export function LandingNavbar() {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Home có hero tối full-screen → nav trong suốt chữ trắng khi ở đầu trang
  // (như site gốc); scroll xuống hoặc trang khác → nền trắng chữ tối.
  const onDarkHero = pathname.replace(/\/$/, '') === '/rexer';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dark = onDarkHero && !scrolled && !open;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        dark
          ? 'border-transparent bg-transparent'
          : 'border-neutral-200 bg-white/80 backdrop-blur'
      )}
    >
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
        <Link href='/rexer' aria-label='Rexer' className='shrink-0'>
          <Logo size={20} className={cn(dark && 'invert')} />
        </Link>

        <nav className='hidden items-center gap-1 md:flex'>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors',
                dark
                  ? 'text-white/70 hover:text-white'
                  : 'text-neutral-600 hover:text-neutral-900',
                isActive(pathname, item.href) &&
                  (dark
                    ? 'font-medium text-white'
                    : 'font-medium text-neutral-900')
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='hidden md:flex'>
          <Button asChild variant={dark ? 'pill-light' : 'pill'} size='sm'>
            <Link href='/sign-in'>Sign in</Link>
          </Button>
        </div>

        <button
          type='button'
          className={cn(
            'inline-flex items-center justify-center rounded-md p-2 md:hidden',
            dark ? 'text-white' : 'text-neutral-700'
          )}
          aria-label='Open menu'
          onClick={() => setOpen(v => !v)}
        >
          {open ? <X className='size-5' /> : <Menu className='size-5' />}
        </button>
      </div>

      {open && (
        <nav className='border-t border-neutral-200 bg-white px-6 py-3 md:hidden'>
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-md px-3 py-2 text-sm text-neutral-700',
                isActive(pathname, item.href) && 'bg-neutral-100 font-medium'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Button asChild variant='pill' size='sm' className='mt-2 w-full'>
            <Link href='/sign-in' onClick={() => setOpen(false)}>
              Sign in
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
