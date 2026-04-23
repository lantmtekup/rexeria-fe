'use client';

import { useTranslations } from 'next-intl';

export default function AuthLoadingFallback() {
  const t = useTranslations('auth');
  return (
    <div className='text-muted-foreground p-8 text-center text-sm'>
      {t('loading')}
    </div>
  );
}
