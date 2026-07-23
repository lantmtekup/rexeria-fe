'use client';

import { forwardRef } from 'react';

type BrandHeaderProps = {
  className?: string;
};

const BrandHeader = forwardRef<HTMLElement, BrandHeaderProps>(
  ({ className = '' }, ref) => (
    <header
      ref={ref}
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center pt-5 md:pt-6 lg:pt-7 ${className}`.trim()}
      aria-label='Delvaux'
    >
      <button
        type='button'
        aria-label='Reload page'
        onClick={() => {
          window.location.reload();
        }}
        onKeyDown={event => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          window.location.reload();
        }}
        className='pointer-events-auto cursor-pointer'
      >
        <img
          src='/icon-text.svg'
          alt='DELVAUX'
          className='h-auto w-[110px] md:w-[120px] lg:w-[132px]'
        />
      </button>
    </header>
  )
);

BrandHeader.displayName = 'BrandHeader';

export default BrandHeader;
