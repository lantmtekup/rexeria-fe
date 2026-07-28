'use client';

import type { KeyboardEvent } from 'react';
import { scrollToSection } from '@/app/lib/motion';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'buy', label: 'Buy Brillant Mini' },
  { id: 'brand', label: '1829 (Brand)' },
  { id: 'related', label: 'You Might Also Like' },
] as const;

const NAV_SCROLL_DURATION = 0.85;

type NavItemId = (typeof NAV_ITEMS)[number]['id'];

type ProductSectionNavProps = {
  activeId?: NavItemId;
};

export default function ProductSectionNav({
  activeId = 'overview',
}: ProductSectionNavProps) {
  const handleNavigate = (id: NavItemId) => {
    const section = document.getElementById(id);
    if (!section) return;

    scrollToSection(section, { duration: NAV_SCROLL_DURATION });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    id: NavItemId
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleNavigate(id);
  };

  return (
    <nav
      className='fixed inset-x-0 bottom-0 z-20 border-t border-black/8 bg-[#F5F5F5]'
      aria-label='Section navigation'
    >
      <ul className='flex [scrollbar-width:none] flex-nowrap items-center justify-center gap-x-3 overflow-x-auto px-3 py-3 text-[10px] tracking-wide text-black [-ms-overflow-style:none] sm:gap-x-6 sm:px-4 sm:py-4 sm:text-xs md:gap-x-12 md:text-sm [&::-webkit-scrollbar]:hidden'>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id} className='shrink-0'>
              <button
                type='button'
                onClick={() => handleNavigate(item.id)}
                onKeyDown={event => handleKeyDown(event, item.id)}
                aria-label={`Go to ${item.label}`}
                aria-current={isActive ? 'true' : undefined}
                className='inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap sm:gap-2'
              >
                {isActive ? (
                  <span
                    className='inline-block size-1.5 shrink-0 rounded-full bg-black'
                    aria-hidden
                  />
                ) : null}
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
