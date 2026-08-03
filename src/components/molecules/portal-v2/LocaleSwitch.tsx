'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { constants } from '@/settings/constants';
import { Locale } from '@/settings/enums';
import webStorageClient from '@/lib/webStorageClient';

type LocaleSwitchProps = {
  locale: Locale;
};

const handleSwitchLocale = (next: Locale) => {
  webStorageClient.set(constants.LANGUAGE, next, { expires: 365 });
  window.location.reload();
};

export const LocaleSwitch = ({ locale }: LocaleSwitchProps) => {
  const t = useTranslations('common');
  const tShell = useTranslations('portalV2.shell');

  const options: { value: Locale; label: string; aria: string }[] = [
    {
      value: Locale.VI,
      label: t('locale_vi'),
      aria: t('a11y_switchToVietnamese'),
    },
    {
      value: Locale.EN,
      label: t('locale_en'),
      aria: t('a11y_switchToEnglish'),
    },
  ];

  return (
    <div
      role='group'
      aria-label={tShell('languageGroup')}
      className={cn(
        'inline-flex h-9 items-center rounded-[var(--pv2-r)] p-0.5',
        'border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]'
      )}
    >
      {options.map(opt => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type='button'
            aria-label={opt.aria}
            aria-pressed={active}
            tabIndex={0}
            onClick={() => {
              if (!active) handleSwitchLocale(opt.value);
            }}
            onKeyDown={e => {
              if ((e.key === 'Enter' || e.key === ' ') && !active) {
                e.preventDefault();
                handleSwitchLocale(opt.value);
              }
            }}
            className={cn(
              'min-w-[40px] rounded-[10px] px-2.5 py-1.5 text-[12px] font-semibold tracking-wide transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-1',
              'active:scale-[0.98]',
              active
                ? 'bg-[var(--pv2-paper)] text-[var(--pv2-electric)] shadow-[var(--pv2-sh-sm)]'
                : 'text-[var(--pv2-faint)] hover:text-[var(--pv2-mut)]'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
