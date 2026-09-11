'use client';
import { useLocale } from './locale-provider';

export function SkipLink() {
  const { t } = useLocale();
  return (
    <a
      href='#main'
      className='focus:border-champagne-200 focus:bg-charcoal-950 focus:tracking-luxe focus:text-champagne-50 sr-only z-[100] focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:rounded-none focus:border focus:px-5 focus:py-3 focus:font-sans focus:text-xs focus:uppercase'
    >
      {t.a11y.skipToContent}
    </a>
  );
}
