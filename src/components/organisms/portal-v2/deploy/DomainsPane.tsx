'use client';

import {
  AlertTriangle,
  Globe,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Unlock,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import { DomainStatusPill } from '@/components/organisms/portal-v2/deploy/DomainField';
import { AddDomainModal } from '@/components/organisms/portal-v2/deploy/AddDomainModal';
import { DomainDetailModal } from '@/components/organisms/portal-v2/deploy/DomainDetailModal';
import { DEPLOY_DNS_CNAME_TARGET } from '@/lib/portal-v2/deploy/constants';
import { groupDomainsByRoot } from '@/lib/portal-v2/deploy/helpers';
import type { DeployBrandDomain } from '@/lib/portal-v2/deploy/types';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type DomainFilter = 'all' | 'active' | 'verifying' | 'error';

type DomainsPaneProps = {
  domains: DeployBrandDomain[];
  workspaceId: string | null;
  domainSource: 'live' | 'fake';
  creatingDomain: boolean;
  verifyingDomainId: string | null;
  rebindingId: string | null;
  removingId: string | null;
  onCreate: (
    domain: string,
    pageId: string | null
  ) => Promise<DeployBrandDomain | null>;
  onVerify: (id: string) => void;
  onRebind: (id: string, pageId: string) => void;
  onRemove: (id: string) => void;
};

const cnameTargetOf = (d: DeployBrandDomain): string =>
  d.dnsRecords?.find(r => r.type.toUpperCase() === 'CNAME')?.value ??
  DEPLOY_DNS_CNAME_TARGET;

/**
 * The brand's custom-domain manager. Many domains/subdomains, each bound to
 * one landing page — grouped under the domain they belong to (`tekup.vn` →
 * `site1.tekup.vn`, `blog.tekup.vn`), with search + status filter for when the
 * list grows. Reads the real BE fields the list now carries (`page_id`,
 * `dns_records`, `tls_status`); page names come from one `pages.list` call.
 */
export const DomainsPane = ({
  domains,
  workspaceId,
  domainSource,
  creatingDomain,
  verifyingDomainId,
  rebindingId,
  removingId,
  onCreate,
  onVerify,
  onRebind,
  onRemove,
}: DomainsPaneProps) => {
  const t = useTranslations('portalV2.deploy');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<DomainFilter>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  /* The brand's published landing pages — the bind targets. One fetch; both
     the row labels and the two modals' pickers read from it. */
  const [pages, setPages] = useState<Page[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId || domainSource === 'fake') return;
    let alive = true;
    setPagesLoading(true);
    rexerApi.pages
      .list(workspaceId, { type: 'landing', status: 'published', limit: 200 })
      .then(res => {
        if (alive) setPages(res.items);
      })
      .catch(err => {
        if (alive)
          toast.error(t('domainPagesLoadFailed'), {
            description: err instanceof Error ? err.message : String(err),
          });
      })
      .finally(() => {
        if (alive) setPagesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [workspaceId, domainSource, t]);

  const pageById = useMemo(() => {
    const m = new Map<string, Page>();
    for (const p of pages) m.set(p.id, p);
    return m;
  }, [pages]);

  const counts = useMemo(
    () => ({
      total: domains.length,
      active: domains.filter(d => d.status === 'connected').length,
      verifying: domains.filter(d => d.status === 'verifying').length,
      error: domains.filter(d => d.status === 'error' || d.status === 'pending')
        .length,
    }),
    [domains]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return domains.filter(d => {
      if (filter === 'active' && d.status !== 'connected') return false;
      if (filter === 'verifying' && d.status !== 'verifying') return false;
      if (filter === 'error' && d.status !== 'error' && d.status !== 'pending')
        return false;
      if (needle) {
        const page = d.pageId ? pageById.get(d.pageId) : null;
        const hay = `${d.domain} ${page?.name ?? ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [domains, filter, q, pageById]);

  const groups = useMemo(() => groupDomainsByRoot(filtered), [filtered]);

  const filterOptions: { id: DomainFilter; label: string }[] = [
    { id: 'all', label: t('domainFilterAll', { n: counts.total }) },
    { id: 'active', label: t('domainFilterActive', { n: counts.active }) },
    {
      id: 'verifying',
      label: t('domainFilterVerifying', { n: counts.verifying }),
    },
    { id: 'error', label: t('domainFilterError', { n: counts.error }) },
  ];

  const detailDomain = detailId
    ? (domains.find(d => d.id === detailId) ?? null)
    : null;

  return (
    <div>
      {/* metrics */}
      <div className='mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
        <Metric n={counts.total} label={t('domainMetricTotal')} />
        <Metric n={counts.active} label={t('domainMetricActive')} tone='ok' />
        <Metric
          n={counts.verifying}
          label={t('domainMetricVerifying')}
          tone='wait'
        />
        <Metric
          n={counts.error}
          label={t('domainMetricAttention')}
          tone='err'
        />
      </div>

      {/* toolbar */}
      <div className='mb-4 flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] flex-1'>
          <Search
            className='pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--pv2-faint)]'
            aria-hidden
          />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('domainSearchPlaceholder')}
            className='w-full rounded-[9px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-2 pr-3 pl-9 text-[13px] text-[var(--pv2-ink)] transition-shadow outline-none placeholder:text-[var(--pv2-faint)] focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
          />
        </div>
        <FilterChips
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          inline
        />
        <Button variant='primary' size='sm' onClick={() => setAddOpen(true)}>
          <Plus className='size-3.5' aria-hidden />
          {t('domainAddNew')}
        </Button>
      </div>

      {/* list */}
      {domains.length === 0 ? (
        <EmptyState
          title={t('domainEmptyTitle')}
          body={t('domainEmptyBody')}
          cta={t('domainAddNew')}
          onCta={() => setAddOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('domainNoMatchTitle')}
          body={t('domainNoMatchBody')}
        />
      ) : (
        <div className='space-y-5'>
          {groups.map(group => (
            <div key={group.root}>
              <div className='mb-2 flex items-center gap-2.5 px-1'>
                <Globe className='size-4 text-[var(--pv2-faint)]' aria-hidden />
                <span className='text-[13px] font-bold tracking-[-0.01em] text-[var(--pv2-ink)]'>
                  {group.root}
                </span>
                <span className='text-[11.5px] text-[var(--pv2-faint)]'>
                  {t('domainSubCount', { n: group.items.length })}
                </span>
                <span className='h-px flex-1 bg-[var(--pv2-hair)]' />
              </div>
              <ul className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
                {group.items.map(d => (
                  <DomainRow
                    key={d.id}
                    domain={d}
                    page={d.pageId ? (pageById.get(d.pageId) ?? null) : null}
                    verifying={verifyingDomainId === d.id}
                    onOpen={() => setDetailId(d.id)}
                    onVerify={() => onVerify(d.id)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <AddDomainModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        pages={pages}
        pagesLoading={pagesLoading}
        onCreate={onCreate}
        creating={creatingDomain}
      />

      {detailDomain ? (
        <DomainDetailModal
          key={detailDomain.id}
          open
          domain={detailDomain}
          pages={pages}
          pagesLoading={pagesLoading}
          onClose={() => setDetailId(null)}
          onVerify={onVerify}
          verifying={verifyingDomainId === detailDomain.id}
          onRebind={onRebind}
          rebinding={rebindingId === detailDomain.id}
          onRemove={onRemove}
          removing={removingId === detailDomain.id}
        />
      ) : null}
    </div>
  );
};

/* ── row ──────────────────────────────────────────────────────────────── */

const DomainRow = ({
  domain,
  page,
  verifying,
  onOpen,
  onVerify,
}: {
  domain: DeployBrandDomain;
  page: Page | null;
  verifying: boolean;
  onOpen: () => void;
  onVerify: () => void;
}) => {
  const t = useTranslations('portalV2.deploy');
  const tlsActive = domain.tlsStatus === 'active';
  const connected = domain.status === 'connected';

  return (
    <li className='border-t border-[var(--pv2-hair)] first:border-t-0'>
      <button
        type='button'
        onClick={onOpen}
        className='grid w-full grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--pv2-canvas)]'
      >
        {/* domain */}
        <span className='min-w-0'>
          <span className='flex items-center gap-2'>
            <span className='truncate text-[13.5px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
              {domain.domain}
            </span>
            {tlsActive ? (
              <Lock
                className='size-3 shrink-0 text-[var(--pv2-success)]'
                aria-label={t('domainTlsActive')}
              />
            ) : (
              <Unlock
                className='size-3 shrink-0 text-[var(--pv2-faint)]'
                aria-label={t('domainTlsPending')}
              />
            )}
          </span>
          <span className='mt-0.5 block truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
            CNAME → {cnameTargetOf(domain)}
          </span>
        </span>

        {/* bound page */}
        <span className='flex min-w-0 items-center gap-2.5'>
          {page ? (
            <>
              {page.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.thumbnail_url}
                  alt=''
                  className='size-7 shrink-0 rounded-[6px] border border-[var(--pv2-hair)] object-cover'
                />
              ) : (
                <span className='grid size-7 shrink-0 place-items-center rounded-[6px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[11px] text-[var(--pv2-faint)]'>
                  ◈
                </span>
              )}
              <span className='min-w-0'>
                <span className='block truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                  {page.name}
                </span>
                <span className='block truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
                  /p/{page.slug}
                </span>
              </span>
            </>
          ) : (
            <span className='inline-flex items-center gap-1.5 text-[12px] text-[var(--pv2-warning)]'>
              <AlertTriangle className='size-3.5' aria-hidden />
              {t('domainRowNoPage')}
            </span>
          )}
        </span>

        {/* status + actions */}
        <span
          className='flex items-center gap-1.5'
          onClick={e => e.stopPropagation()}
        >
          <DomainStatusPill status={verifying ? 'verifying' : domain.status} />
          {!connected ? (
            <button
              type='button'
              onClick={onVerify}
              disabled={verifying}
              title={t('domainVerifyNow')}
              className='grid size-7 place-items-center rounded-[7px] border border-[var(--pv2-hair)] text-[var(--pv2-mut)] transition-colors hover:border-[var(--pv2-hair)] hover:text-[var(--pv2-ink)] disabled:opacity-50'
            >
              {verifying ? (
                <Loader2 className='size-3.5 animate-spin' aria-hidden />
              ) : (
                <RefreshCw className='size-3.5' aria-hidden />
              )}
            </button>
          ) : null}
          <button
            type='button'
            onClick={onOpen}
            title={t('domainConfigure')}
            className='grid size-7 place-items-center rounded-[7px] border border-[var(--pv2-hair)] text-[var(--pv2-mut)] transition-colors hover:text-[var(--pv2-ink)]'
          >
            <Settings2 className='size-3.5' aria-hidden />
          </button>
        </span>
      </button>
    </li>
  );
};

/* ── bits ─────────────────────────────────────────────────────────────── */

const Metric = ({
  n,
  label,
  tone,
}: {
  n: number;
  label: string;
  tone?: 'ok' | 'wait' | 'err';
}) => (
  <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3'>
    <div
      className={cn(
        'text-[22px] font-bold tracking-[-0.02em] tabular-nums',
        tone === 'ok'
          ? 'text-[var(--pv2-success)]'
          : tone === 'wait'
            ? 'text-[var(--pv2-warning)]'
            : tone === 'err'
              ? 'text-[var(--pv2-error)]'
              : 'text-[var(--pv2-ink)]'
      )}
    >
      {n}
    </div>
    <div className='mt-0.5 text-[11.5px] text-[var(--pv2-mut)]'>{label}</div>
  </div>
);

const EmptyState = ({
  title,
  body,
  cta,
  onCta,
}: {
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
}) => (
  <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-12 text-center'>
    <div className='mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[var(--pv2-canvas)]'>
      <Globe className='size-5 text-[var(--pv2-faint)]' aria-hidden />
    </div>
    <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>{title}</p>
    <p className='mx-auto mt-1 max-w-[42ch] text-[12.5px] text-[var(--pv2-mut)]'>
      {body}
    </p>
    {cta && onCta ? (
      <div className='mt-4'>
        <Button variant='primary' size='sm' onClick={onCta}>
          <Plus className='size-3.5' aria-hidden />
          {cta}
        </Button>
      </div>
    ) : null}
  </div>
);
