'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TextInput } from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';

type MediaSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export const MediaSearchField = ({
  value,
  onChange,
}: MediaSearchFieldProps) => {
  const t = useTranslations('portalV2.media');

  return (
    <label
      className={cn(
        'flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px]',
        'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
        'transition-colors focus-within:border-[var(--pv2-electric)]'
      )}
    >
      <Search className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
      <TextInput
        type='search'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchAria')}
        className='w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-[12.5px]! text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] focus:border-0 focus:ring-0'
      />
    </label>
  );
};
