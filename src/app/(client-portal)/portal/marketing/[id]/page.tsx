'use client';

/**
 * Chi tiết 1 marketing (campaign) — `/portal/marketing/[id]`. Cùng nội dung
 * wizard tạo (Product/Marketing/Template/Campaign) nhưng seed từ campaign
 * thật + brief parse từ notes; Lưu = PATCH, có nút Xoá (confirm).
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { use, useEffect, useState } from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Campaign } from '@/services/rexer/types';

import { PortalShell } from '../../_shell';
import { MarketingEditor } from '../_editor';

export default function MarketingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('portal');
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    rexerApi.campaigns
      .get(id)
      .then(c => {
        if (!cancelled) setCampaign(c);
      })
      .catch(err => {
        if (!cancelled)
          setError(
            err instanceof RxApiError
              ? err.code || err.message
              : err instanceof Error
                ? err.message
                : 'API_ERROR'
          );
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <PortalShell fullBleed>
      {error ? (
        <div className='mx-auto max-w-md p-8 text-center'>
          <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6'>
            <AlertCircle className='mx-auto size-8 text-rose-600' />
            <p className='mt-3 text-sm font-semibold text-rose-900'>
              {t('marketingId.openError')}
            </p>
            <p className='text-2xs mt-1 font-mono text-rose-700'>{error}</p>
          </div>
        </div>
      ) : !campaign ? (
        <div className='text-content-muted flex h-64 items-center justify-center text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' />{' '}
          {t('marketingId.loading')}
        </div>
      ) : (
        <MarketingEditor mode='edit' campaign={campaign} />
      )}
    </PortalShell>
  );
}
