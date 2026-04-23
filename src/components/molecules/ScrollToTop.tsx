'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollTop}
      aria-label='Scroll to top'
      className={cn(
        'fixed right-5 bottom-8 z-50 cursor-pointer',
        'flex h-11 w-11 items-center justify-center rounded-full',
        'bg-brand-gold-cta text-brand-navy-cta shadow-lg',
        'transition-all duration-300 hover:scale-110 hover:shadow-xl',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ArrowUp className='size-5' strokeWidth={2.5} />
    </button>
  );
}
