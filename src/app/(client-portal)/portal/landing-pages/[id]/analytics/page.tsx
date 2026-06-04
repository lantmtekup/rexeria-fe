'use client';

/**
 * Portal landing analytics — `/portal/landing-pages/[id]/analytics`.
 *
 * Param `id` resolves trong 2 shape (giống admin route):
 *   1. Page UUID → trực tiếp pass cho BlockAnalyticsGrid (tự fetch).
 *   2. Page slug → lookup pages.listAll → page UUID.
 *
 * BE `pages.get(slug)` 500 nếu id không phải UUID (BE bug — nên 400
 * ERR_BAD_REQUEST), nên FE phải check shape rồi mới gọi.
 */

import * as React from 'react';
import { use } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

import { BlockAnalyticsGrid } from '@/components/modules/Analytics/BlockAnalyticsGrid';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

import { PortalShell } from '../../../_shell';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function PortalLandingAnalyticsPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const [resolvedId, setResolvedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setResolvedId(null);
    (async () => {
      try {
        if (UUID_RE.test(rawId)) {
          setResolvedId(rawId);
          return;
        }
        // Slug → lookup. `?slug=` BE chưa filter chính xác nên dùng `?q=`
        // + match exact client-side (cùng pattern admin editor route).
        const pages = await rexerApi.pages.listAll({ q: rawId, limit: 25 });
        const page = pages.items?.find(p => p.slug === rawId);
        if (!page) {
          throw new Error(`Không tìm thấy landing với slug "${rawId}"`);
        }
        if (!cancelled) setResolvedId(page.id);
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  return (
    <PortalShell>
      {error ? (
        <div className='mx-auto max-w-md p-8 text-center'>
          <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6'>
            <AlertCircle className='mx-auto size-8 text-rose-600' />
            <p className='mt-3 text-sm font-semibold text-rose-900'>
              Không mở được analytics
            </p>
            <p className='text-2xs mt-1 font-mono text-rose-700'>{error}</p>
          </div>
        </div>
      ) : !resolvedId ? (
        <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve landing…
        </div>
      ) : (
        <BlockAnalyticsGrid
          templateId={resolvedId}
          backHref='/portal/landing-pages'
        />
      )}
    </PortalShell>
  );
}
