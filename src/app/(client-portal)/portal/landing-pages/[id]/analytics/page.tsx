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
import { ExternalLandingAnalytics } from '@/components/modules/Analytics/ExternalLandingAnalytics';
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

type AnalyticsTab = 'overview' | 'funnel' | 'blocks';

interface PageMeta {
  external_url?: string | null;
  name?: string;
}

export default function PortalLandingAnalyticsPage({ params }: PageProps) {
  const { id: rawId } = use(params);
  const [resolvedId, setResolvedId] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<PageMeta>({});
  const [error, setError] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<AnalyticsTab | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setResolvedId(null);
    setMeta({});
    setTab(null);
    (async () => {
      try {
        let id = rawId;
        let pageMeta: PageMeta = {};
        if (UUID_RE.test(rawId)) {
          // UUID → fetch page detail để biết external_url + tên (brand-scoped
          // GET /pages/:id, priv). Lỗi → coi như landing thường, vẫn render.
          try {
            const p = await rexerApi.pages.get(rawId);
            pageMeta = { external_url: p.external_url, name: p.name };
          } catch {
            /* degrade: không có meta → tab funnel/blocks như cũ */
          }
        } else {
          // Slug → lookup. `?slug=` BE chưa filter chính xác nên dùng `?q=`
          // + match exact client-side (cùng pattern admin editor route).
          const pages = await rexerApi.pages.listAll({ q: rawId, limit: 25 });
          const page = pages.items?.find(p => p.slug === rawId);
          if (!page) {
            throw new Error(`Không tìm thấy landing với slug "${rawId}"`);
          }
          id = page.id;
          pageMeta = { external_url: page.external_url, name: page.name };
        }
        if (cancelled) return;
        setResolvedId(id);
        setMeta(pageMeta);
        // External landing → mặc định view "Tổng quan" (block grid vô nghĩa).
        setTab(pageMeta.external_url ? 'overview' : 'funnel');
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  const isExternal = !!meta.external_url;
  const tabs: { value: AnalyticsTab; label: string }[] = isExternal
    ? [
        { value: 'overview', label: 'Tổng quan' },
        { value: 'funnel', label: 'Phễu & Lead' },
      ]
    : [
        { value: 'funnel', label: 'Phễu & Lead' },
        { value: 'blocks', label: 'Theo block' },
      ];

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
      ) : !resolvedId || !tab ? (
        <div className='text-content-muted flex h-64 items-center justify-center text-sm'>
          <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve landing…
        </div>
      ) : (
        <>
          {/* Tab switch — segmented gradient xanh nổi bật (style stepper).
              external: Tổng quan ↔ Phễu; thường: Phễu ↔ Theo block. */}
          <div className='flex justify-center pt-4'>
            <div className='border-border inline-flex rounded-full border bg-white p-1 shadow-sm'>
              {tabs.map(t => (
                <button
                  key={t.value}
                  type='button'
                  onClick={() => setTab(t.value)}
                  className={cn(
                    'rounded-full px-5 py-2 text-sm font-semibold transition-all',
                    tab === t.value
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/25'
                      : 'text-content-muted hover:text-foreground'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {tab === 'overview' ? (
            <ExternalLandingAnalytics
              pageId={resolvedId}
              externalUrl={meta.external_url}
              pageName={meta.name}
            />
          ) : tab === 'funnel' ? (
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
