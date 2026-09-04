'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/atoms/button';
import { hasAnyGaConfig, readConsent, writeConsent } from '@/lib/analytics/ga';
import type { ConsentChoice } from '@/lib/analytics/ga';

/**
 * Banner xin đồng ý cookie đo lường (Consent Mode v2).
 *
 * Hiện khi: có GA measurement id VÀ người dùng chưa từng chọn. Trạng thái mặc
 * định trước lựa chọn là `denied` (khai báo trong `<head>` root layout), nên
 * việc chưa bấm gì KHÔNG bật cookie đo lường — banner này chỉ để nâng lên
 * `granted`.
 *
 * Render `null` ở lần paint đầu để không lệch hydration: giá trị localStorage
 * chỉ có ở client, server không thể biết trước.
 */
export function ConsentBanner() {
  const t = useTranslations('common');
  const [choice, setChoice] = React.useState<ConsentChoice | null | 'pending'>(
    'pending'
  );

  React.useEffect(() => {
    // `hasAnyGaConfig` dò cả property của brand (thẻ brand đã chèn config
    // lúc parse HTML, trước effect này) — trang công khai có thể chỉ có GA
    // của brand mà nền tảng thì không bật.
    setChoice(hasAnyGaConfig() ? readConsent() : 'denied');
  }, []);

  const decide = React.useCallback((next: ConsentChoice) => {
    writeConsent(next);
    setChoice(next);
  }, []);

  if (choice === 'pending' || choice !== null) return null;

  return (
    <div
      role='dialog'
      aria-live='polite'
      aria-label={t('consentTitle')}
      className='border-border bg-background fixed inset-x-3 bottom-3 z-[60] rounded-2xl border p-4 shadow-lg sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-sm'
    >
      <p className='text-foreground text-sm font-semibold'>
        {t('consentTitle')}
      </p>
      <p className='text-content-muted mt-1 text-xs leading-relaxed'>
        {t('consentBody')}
      </p>
      <div className='mt-3 flex gap-2'>
        <Button size='sm' onClick={() => decide('granted')}>
          {t('consentAccept')}
        </Button>
        <Button size='sm' variant='neutral' onClick={() => decide('denied')}>
          {t('consentReject')}
        </Button>
      </div>
    </div>
  );
}
