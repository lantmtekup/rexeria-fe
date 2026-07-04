'use client';

/**
 * Báo cáo 1 ad-creative: funnel impression → viewable → interaction →
 * cta_click → outbound + top hotspot/CTA. Dùng thẳng endpoint breakdown
 * chung `pages.analytics.breakdown()` đã có (group_by='event_type' cho
 * funnel, group_by='dimensions.cta_id' cho top CTA) — KHÔNG dùng
 * `FunnelOverview`/`FunnelSteps` vì 2 component đó hard-code cho phễu
 * lead-gen của landing page (visits/engaged/leads/deals), sai hoàn toàn
 * ngữ nghĩa với ad creative.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Page } from '@/services/rexer/types';

const FUNNEL_STEPS: { key: string; label: string }[] = [
  { key: 'ad_impression', label: 'Impression' },
  { key: 'ad_viewable', label: 'Viewable (≥50%, ≥1s)' },
  { key: 'ad_interaction', label: 'Tương tác (đổi slide)' },
  { key: 'ad_cta_click', label: 'Click hotspot/CTA' },
  { key: 'ad_outbound', label: 'Outbound (điều hướng ra ngoài)' },
];

const fmt = (n: number) => n.toLocaleString('vi-VN');

export default function PortalAdCreativeAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [page, setPage] = React.useState<Page | null>(null);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [topCta, setTopCta] = React.useState<{ key: string; count: number }[]>(
    []
  );
  const [status, setStatus] = React.useState<'loading' | 'ok' | 'error'>(
    'loading'
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const [pg, funnelRes, ctaRes] = await Promise.all([
          rexerApi.pages.get(id),
          rexerApi.pages.analytics.breakdown(id, { group_by: 'event_type' }),
          rexerApi.pages.analytics.breakdown(id, {
            group_by: 'dimensions.cta_id',
            event_type: 'ad_cta_click',
          }),
        ]);
        if (cancelled) return;
        setPage(pg);
        const next: Record<string, number> = {};
        for (const row of funnelRes.items ?? []) {
          next[row.key] = row.metrics?.count ?? 0;
        }
        setCounts(next);
        setTopCta(
          (ctaRes.items ?? [])
            .map(r => ({ key: r.key, count: r.metrics?.count ?? 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );
        setStatus('ok');
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof RxApiError
            ? err.code || err.message
            : 'Không tải được báo cáo'
        );
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='text-content-muted size-6 animate-spin' />
      </div>
    );
  }

  if (status === 'error' || !page) {
    return (
      <div className='mx-auto max-w-2xl p-10'>
        <BackLink router={router} />
        <div className='border-destructive/20 bg-danger-bg mt-8 rounded-2xl border p-8 text-center'>
          <p className='text-destructive text-sm font-semibold'>
            {error ?? 'Không tìm thấy ad creative'}
          </p>
        </div>
      </div>
    );
  }

  const max = counts.ad_impression || 1;

  return (
    <div className='mx-auto max-w-3xl p-6'>
      <BackLink router={router} />
      <h1 className='mt-4 text-xl font-bold tracking-tight'>
        Báo cáo — {page.name}
      </h1>

      <div className='border-border bg-card mt-6 rounded-2xl border p-5'>
        <h2 className='text-sm font-semibold'>Funnel</h2>
        <ol className='mt-4 flex flex-col gap-3'>
          {FUNNEL_STEPS.map(step => {
            const value = counts[step.key] ?? 0;
            const pct = (value / max) * 100;
            return (
              <li key={step.key} className='flex items-center gap-4'>
                <div className='text-content-muted w-56 shrink-0 text-sm'>
                  {step.label}
                </div>
                <div className='flex flex-1 items-center gap-3'>
                  <div
                    className='flex h-9 items-center rounded-lg bg-violet-600 px-3'
                    style={{ width: `${Math.max(pct, 4)}%` }}
                  >
                    <span className='font-mono text-xs font-semibold text-white'>
                      {fmt(value)}
                    </span>
                  </div>
                  <span className='text-content-muted font-mono text-xs'>
                    {pct >= 10 ? Math.round(pct) : pct.toFixed(1)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className='border-border bg-card mt-4 rounded-2xl border p-5'>
        <h2 className='text-sm font-semibold'>Top hotspot / CTA</h2>
        {topCta.length === 0 ? (
          <p className='text-content-muted mt-3 text-sm'>
            Chưa có lượt click nào.
          </p>
        ) : (
          <table className='mt-3 w-full text-sm'>
            <thead>
              <tr className='text-content-muted text-3xs border-border border-b text-left tracking-wider uppercase'>
                <th className='py-1.5 font-semibold'>Hotspot / CTA id</th>
                <th className='py-1.5 text-right font-semibold'>Clicks</th>
              </tr>
            </thead>
            <tbody>
              {topCta.map(row => (
                <tr key={row.key} className='border-border border-b'>
                  <td className='py-1.5 font-mono text-xs'>{row.key}</td>
                  <td className='py-1.5 text-right font-mono text-xs'>
                    {fmt(row.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function BackLink({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <button
      type='button'
      onClick={() => router.push('/portal/ad-creatives')}
      className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm'
    >
      <ArrowLeft className='size-4' /> Ad Creatives
    </button>
  );
}
