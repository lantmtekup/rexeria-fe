'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { Locale } from '@/settings/enums';
import webStorageClient from '@/lib/webStorageClient';
import { constants } from '@/settings/constants';

interface LanguageSwitcherProps {
  locale: Locale;
  /** `default`: neutral text for light backgrounds. `inverted`: light text for dark headers. */
  variant?: 'default' | 'inverted';
  className?: string;
}

const switchLocale = (next: Locale) => {
  webStorageClient.set(constants.LANGUAGE, next, { expires: 365 });
  window.location.reload();
};

export function LanguageSwitcher({
  locale,
  variant = 'default',
  className,
}: LanguageSwitcherProps) {
  const t = useTranslations('common');

  const isInverted = variant === 'inverted';

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm font-medium',
        isInverted ? 'text-white' : 'text-foreground',
        className
      )}
    >
      <button
        type='button'
        onClick={() => switchLocale(Locale.EN)}
        aria-label={t('a11y_switchToEnglish')}
        className={cn(
          'cursor-pointer transition-opacity hover:opacity-100',
          locale === Locale.EN ? 'opacity-100' : 'opacity-60',
          !isInverted && locale !== Locale.EN && 'text-muted-foreground'
        )}
      >
        {t('locale_en')}
      </button>
      <span
        className={cn(isInverted ? 'text-white/40' : 'text-muted-foreground')}
      >
        |
      </span>
      <button
        type='button'
        onClick={() => switchLocale(Locale.VI)}
        aria-label={t('a11y_switchToVietnamese')}
        className={cn(
          'cursor-pointer transition-opacity hover:opacity-100',
          locale === Locale.VI ? 'opacity-100' : 'opacity-60',
          !isInverted && locale !== Locale.VI && 'text-muted-foreground'
        )}
      >
        {t('locale_vi')}
      </button>
    </div>
  );
}
