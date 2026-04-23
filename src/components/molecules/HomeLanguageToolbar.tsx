'use client';

import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { Locale } from '@/settings/enums';

type HomeLanguageToolbarProps = {
  locale: Locale;
};

export function HomeLanguageToolbar({ locale }: HomeLanguageToolbarProps) {
  return (
    <div className='flex justify-end'>
      <LanguageSwitcher locale={locale} variant='default' />
    </div>
  );
}
