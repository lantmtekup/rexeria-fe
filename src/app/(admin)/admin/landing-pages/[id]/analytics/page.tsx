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
import { AlertCircle, BarChart3, LayoutDashboard, Loader2 } from 'lucide-react';

import { BlockAnalyticsGrid } from '@/components/modules/Analytics/BlockAnalyticsGrid';
import { PageOverlayView } from '@/components/modules/Analytics/PageOverlayView';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

type Tab = 'cards' | 'overlay';

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
  // Tab giữa Cards view (BlockAnalyticsGrid existing) vs Overlay view
  // (PageOverlayView mới — render trang full + stats annotation cards
  // floating, drag-to-reposition giống Figma).
  const [tab, setTab] = React.useState<Tab>('cards');

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
          <p className='mt-3 text-sm font-semibold text-rose-900'>
            Không mở được analytics
          </p>
          <p className='text-2xs mt-1 font-mono text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!resolvedId) {
    return (
      <div className='text-content-muted flex h-64 items-center justify-center text-sm'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang resolve landing…
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* Tab switcher — sticky top, cùng z-index thấp hơn overlay
          toolbar (z-50 của StatsAnnotationOverlay). */}
      <div className='border-border sticky top-0 z-20 flex items-center gap-1 border-b bg-white/90 px-4 py-2 backdrop-blur'>
        <TabBtn
          active={tab === 'cards'}
          onClick={() => setTab('cards')}
          icon={<BarChart3 className='size-3.5' />}
          label='Cards view'
        />
        <TabBtn
          active={tab === 'overlay'}
          onClick={() => setTab('overlay')}
          icon={<LayoutDashboard className='size-3.5' />}
          label='Overlay view'
        />
      </div>

      {tab === 'cards' ? (
        <BlockAnalyticsGrid
          templateId={resolvedId}
          backHref='/admin/landing-pages'
          useAdminEndpoint
        />
      ) : (
        <PageOverlayView pageId={resolvedId} />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-zinc-900 text-white'
          : 'text-content-muted hover:bg-muted hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
