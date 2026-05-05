'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ExternalLink,
  Globe,
  LayoutDashboard,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/atoms/badge';
import { Spinner } from '@/components/atoms/spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { MetricCard } from '@/components/molecules/MetricCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { ClientPortalProject } from '@/services/rexer/types';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function formatNumber(n: number | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

function formatPercent(n: number | undefined): string {
  if (n == null) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

function aggregate(items: ClientPortalProject[]) {
  const totals = { page_views: 0, cta_clicks: 0, conversions: 0 };
  let live = 0;
  for (const p of items) {
    if (p.page_url) live++;
    const s = p.analytics_summary;
    if (s) {
      totals.page_views += s.page_views || 0;
      totals.cta_clicks += s.cta_clicks || 0;
      totals.conversions += s.conversions || 0;
    }
  }
  const ctr = totals.page_views ? totals.cta_clicks / totals.page_views : 0;
  return { ...totals, ctr, live };
}

export default function PortalOverviewPage() {
  const [projects, setProjects] = React.useState<ClientPortalProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    rexerApi.clientPortal
      .myProjects()
      .then(r => {
        if (alive) setProjects(r.items);
      })
      .catch(err => {
        if (alive) toast.error(`Could not load: ${rxErrorMessage(err)}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const totals = aggregate(projects);

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader title='Overview' />
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <MetricCard
          label='Live landings'
          value={loading ? '—' : `${totals.live}/${projects.length}`}
          hint='currently published'
        />
        <MetricCard
          label='Page views'
          value={loading ? '—' : formatNumber(totals.page_views)}
          hint='all projects'
        />
        <MetricCard
          label='Conversions'
          value={loading ? '—' : formatNumber(totals.conversions)}
        />
        <MetricCard
          label='Average CTR'
          value={loading ? '—' : formatPercent(totals.ctr)}
        />
      </div>

      <div className='mt-8'>
        <SectionHeader title='My projects' />
        {loading ? (
          <div className='text-muted-foreground flex justify-center py-12'>
            <Spinner size={20} />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<LayoutDashboard className='size-10' />}
            title='Nothing shared with you yet'
            description='Once your agency grants access to a landing, it will show up here.'
          />
        ) : (
          <div className='border-border bg-background overflow-hidden rounded-xl border'>
            <ul className='flex flex-col divide-y divide-neutral-100'>
              {projects.map(p => (
                <li key={p.project_id}>
                  <Link
                    href={`/portal/projects/${p.project_id}`}
                    className='hover:bg-muted/40 flex items-center justify-between gap-3 px-5 py-4 transition-colors'
                  >
                    <div className='min-w-0 flex-1'>
                      <p className='text-foreground truncate text-base font-semibold'>
                        {p.name}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {p.template_name} · {p.access_scope ?? 'summary_only'}
                      </p>
                    </div>
                    {p.page_url ? (
                      <Badge variant='secondary' className='gap-1'>
                        <Globe className='size-3' /> Live
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='gap-1'>
                        <Rocket className='size-3' /> Not published
                      </Badge>
                    )}
                    {p.page_url && (
                      <a
                        href={p.page_url}
                        target='_blank'
                        rel='noreferrer noopener'
                        onClick={e => e.stopPropagation()}
                        className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs'
                      >
                        <ExternalLink className='size-3' /> Open
                      </a>
                    )}
                    <ChevronRight className='text-muted-foreground size-4' />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
