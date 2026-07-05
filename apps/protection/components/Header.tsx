'use client';

import { useState } from 'react';

import { TOP_LINKS } from '../app/site';
import { MenuOverlay } from './MenuOverlay';

/**
 * Header cố định: logo trái + DOWNLOADS · EL|EN · CONTACT US · MENU(dot vàng).
 * Mirror gốc. `light` = biến thể chữ trắng (khi nền tối, vd hero video).
 */
export function Header({ light = false }: { light?: boolean }) {
  const [open, setOpen] = useState(false);
  const text = light ? 'text-white' : 'text-[var(--grey)]';

  return (
    <>
      <header className='pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 md:px-12'>
        <a href='/' className='pointer-events-auto flex items-center'>
          {/* logo protection — SVG gốc, đổi màu theo biến thể qua filter */}
          <img
            src='/media/logo.svg'
            alt='Protection — Technical Fabrics'
            className='h-8 w-auto md:h-9'
            style={light ? { filter: 'brightness(0) invert(1)' } : undefined}
          />
        </a>

        <nav
          className={`pointer-events-auto flex items-center gap-6 text-xs font-semibold tracking-[0.14em] uppercase md:gap-10 md:text-sm ${text}`}
        >
          {TOP_LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              className='hidden transition-opacity hover:opacity-60 sm:inline'
            >
              {l.label}
            </a>
          ))}
          <button
            type='button'
            onClick={() => setOpen(true)}
            className='open-menu flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-60'
          >
            MENU
            <span className='inline-block h-2.5 w-2.5 rounded-full bg-[var(--yellow)]' />
          </button>
        </nav>
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
