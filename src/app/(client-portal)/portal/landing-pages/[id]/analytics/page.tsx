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
import { FunnelOverview } from '@/components/modules/Analytics/FunnelOverview';
import { cn } from '@/lib/cn';
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

type AnalyticsTab = 'funnel' | 'blocks';

const TABS: { value: AnalyticsTab; label: string }[] = [
  { value: 'funnel', label: 'Phễu & Lead' },
  { value: 'blocks', label: 'Theo block' },
];

export default function PortalLandingAnalyticsPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const [resolvedId, setResolvedId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<AnalyticsTab>('funnel');

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
        <div className='text-content-muted flex h-64 items-center justify-center text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve landing…
        </div>
      ) : (
        <>
          {/* Tab switch: phễu Marketing/Sales (mới) ↔ grid theo block (cũ).
              Grid giữ nguyên header/back-link riêng nên switcher đặt nổi
              ở giữa-trên, không phá layout 2 view. */}
          <div className='flex justify-center pt-4'>
            <div className='border-border bg-muted inline-flex rounded-lg border p-0.5'>
              {TABS.map(t => (
                <button
                  key={t.value}
                  type='button'
                  onClick={() => setTab(t.value)}
                  className={cn(
                    'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                    tab === t.value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-content-muted hover:text-foreground'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {tab === 'funnel' ? (
            <div className='mx-auto w-full max-w-6xl px-4 pt-4 pb-16 sm:px-6'>
              <FunnelOverview pageId={resolvedId} />
            </div>
          ) : (
            <BlockAnalyticsGrid
              templateId={resolvedId}
              backHref='/portal/landing-pages'
            />
          )}
        </>
      )}
    </PortalShell>
  );
}
