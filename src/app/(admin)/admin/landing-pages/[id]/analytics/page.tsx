'use client';

/**
 * Admin landing page analytics — `/admin/landing-pages/[id]/analytics`.
 *
 * Param `id` accept 2 shape:
 *   - Page UUID → trực tiếp pass cho BlockAnalyticsGrid
 *   - Page slug → lookup pages.listAll → page UUID
 *
 * BE `pages.get(slug)` + `pages.analytics.blocks(slug)` 500 vì expects
 * UUID (SQL `invalid input syntax for type uuid`). Phải resolve client
 * trước khi call. Cùng pattern với portal analytics route.
 */

import * as React from 'react';
import { use } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

import { BlockAnalyticsGrid } from '@/components/modules/Analytics/BlockAnalyticsGrid';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

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

export default function AdminLandingAnalyticsPage({ params }: PageProps) {
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
        // Slug → search + exact match (BE `?slug=` filter chưa hoạt động
        // chính xác, dùng `?q=` text search).
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

  if (error) {
    return (
      <div className='mx-auto max-w-md p-8'>
        <div className='rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <AlertCircle className='mx-auto size-8 text-rose-600' />
          <p className='mt-3 text-[14px] font-semibold text-rose-900'>
            Không mở được analytics
          </p>
          <p className='mt-1 font-mono text-[11.5px] text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!resolvedId) {
    return (
      <div className='flex h-64 items-center justify-center text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve landing…
      </div>
    );
  }

  return (
    <BlockAnalyticsGrid
      templateId={resolvedId}
      backHref='/admin/landing-pages'
      useAdminEndpoint
    />
  );
}
