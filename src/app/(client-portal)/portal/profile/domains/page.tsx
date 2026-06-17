'use client';

/**
 * Brand custom domain management — `/portal/profile/domains`.
 *
 * Phase 1 reads from BE `/v1/brands/{id}/domains` (endpoint not shipped yet)
 * — the UI renders against mock data and shows "BE pending" toast for
 * mutating actions. When BE ships the endpoints, wire-up only needs to
 * swap the `useState` mocks for real fetch + drop the toast guards.
 *
 * Layout: header + stats strip + add-domain CTA + per-domain card list.
 * Each card surfaces:
 *  - canonical domain + target type + status pill
 *  - 3-step status timeline (DNS verified · TLS active · live)
 *  - DNS records to add (CNAME + TXT) when not yet verified, with copy
 *  - Verify / Cancel / Delete actions per status
 */

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Globe,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { rexerApi } from '@/services/rexer/endpoints';
import type { BrandDomain, Page } from '@/services/rexer/types';
import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';

import { PortalShell } from '../../_shell';

/* ─── Types ──────────────────────────────────────────────────────────── */

type DomainStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'active'
  | 'failed'
  | 'disabled';

type TargetType = 'landing' | 'curate_cdn' | 'tracking';

interface CustomDomain {
  id: string;
  domain: string;
  target_type: TargetType;
  status: DomainStatus;
  tls_active: boolean;
  verification_token: string;
  last_check_at?: string;
  verified_at?: string;
  failure_reason?: string;
  /** Bound landing page (migration 000137). */
  page_id?: string | null;
}

const STATUS_META: Record<
  DomainStatus,
  { labelKey: string; chip: string; dot: string; pulse?: boolean }
> = {
  pending: {
    labelKey: 'statusPending',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  verifying: {
    labelKey: 'statusVerifying',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    pulse: true,
  },
  verified: {
    labelKey: 'statusVerified',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  active: {
    labelKey: 'statusActive',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  failed: {
    labelKey: 'statusFailed',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  disabled: {
    labelKey: 'statusDisabled',
    chip: 'bg-muted text-content-muted border-border',
    dot: 'bg-muted-foreground',
  },
};

const TARGET_META: Record<
  TargetType,
  { labelKey: string; icon: React.ElementType; descriptionKey: string }
> = {
  landing: {
    labelKey: 'targetLandingLabel',
    icon: Globe,
    descriptionKey: 'targetLandingDesc',
  },
  curate_cdn: {
    labelKey: 'targetCdnLabel',
    icon: ShieldCheck,
    descriptionKey: 'targetCdnDesc',
  },
  tracking: {
    labelKey: 'targetTrackingLabel',
    icon: ShieldAlert,
    descriptionKey: 'targetTrackingDesc',
  },
};

/* ─── Mock seed (Phase 1 — BE endpoints chưa ship) ─────────────────── */

const SEED_DOMAINS: CustomDomain[] = [
  {
    id: 'dom_1',
    domain: 'coca.vn',
    target_type: 'landing',
    status: 'active',
    tls_active: true,
    verification_token: 'rxr_verify_3f9d2a1b8e7c4',
    last_check_at: '2026-05-23T14:00:00Z',
    verified_at: '2026-05-12T03:21:00Z',
  },
  {
    id: 'dom_2',
    domain: 'campaigns.coca.vn',
    target_type: 'landing',
    status: 'verifying',
    tls_active: false,
    verification_token: 'rxr_verify_a8b4c7d2e1f9',
    last_check_at: '2026-05-23T15:30:00Z',
  },
  {
    id: 'dom_3',
    domain: 'cdn.coca.vn',
    target_type: 'curate_cdn',
    status: 'pending',
    tls_active: false,
    verification_token: 'rxr_verify_9e2f1a4b6d3c',
  },
];

/** Map canonical BE BrandDomain → the local display shape. */
function beDomainToLocal(d: BrandDomain): CustomDomain {
  const tlsActive = (d.tls_status ?? '').toLowerCase() === 'active';
  let status: DomainStatus =
    (d.status as DomainStatus) in STATUS_META
      ? (d.status as DomainStatus)
      : 'pending';
  // BE "verified" + TLS issued = live in our 3-step UI.
  if (d.status === 'verified' && tlsActive) status = 'active';
  return {
    id: d.id,
    domain: d.domain,
    target_type: (['landing', 'curate_cdn', 'tracking'] as const).includes(
      d.target_type as TargetType
    )
      ? (d.target_type as TargetType)
      : 'landing',
    status,
    tls_active: tlsActive,
    verification_token: d.verification_token,
    last_check_at: d.last_check_at ?? undefined,
    verified_at: d.verified_at ?? undefined,
    failure_reason: d.failure_reason ?? undefined,
    page_id: d.page_id,
  };
}

type TFn = (key: string, values?: Record<string, string | number>) => string;

/* ─── Helpers ────────────────────────────────────────────────────────── */

function relativeTime(iso: string | undefined, t: TFn): string {
  if (!iso) return '-';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return iso;
  const diffMin = Math.round((Date.now() - ts) / 60_000);
  if (diffMin < 1) return t('profileDomains.timeJustNow');
  if (diffMin < 60) return t('profileDomains.timeMinutesAgo', { n: diffMin });
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return t('profileDomains.timeHoursAgo', { n: diffH });
  return t('profileDomains.timeDaysAgo', { n: Math.round(diffH / 24) });
}

function fmtDomain(d: string): string {
  return d.toLowerCase().trim().replace(/\/$/, '');
}

function validateDomain(d: string, t: TFn): string | null {
  const v = fmtDomain(d);
  if (!v) return t('profileDomains.errEmpty');
  if (v.length > 253) return t('profileDomains.errTooLong');
  // Strict-ish hostname regex
  const re = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!re.test(v)) return t('profileDomains.errFormat');
  return null;
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function PortalDomainsPage() {
  const t = useTranslations('portal');
  const [domains, setDomains] = React.useState<CustomDomain[]>(SEED_DOMAINS);
  const [pages, setPages] = React.useState<Page[]>([]);
  const [brandId, setBrandId] = React.useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<'live' | 'fake'>('fake');
  const [addOpen, setAddOpen] = React.useState(false);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

  const refresh = React.useCallback(async (bid: string) => {
    const r = await rexerApi.brands.domains.list(bid);
    setDomains((r.items ?? []).map(beDomainToLocal));
  }, []);

  // Load real data: /auth/me → workspaceId → landing pages (gives brand_id +
  // the bindable page list) → domains. Falls back to SEED on any failure.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await rexerApi.auth.me();
        // Brand id lấy canonical từ `auth.me().brand.id` (post-cutover 000143,
        // be-response §D1) — KHÔNG suy ra từ brand_id của landing page đầu
        // tiên: active workspace có thể chưa có landing page nào (vd ws
        // "Default"), khiến cả trang rơi nhầm vào demo mode dù brand hợp lệ.
        const bid = me.brand?.id;
        if (!bid) throw new Error('cannot resolve brand id');
        const ws = me.user.active_workspace_id;
        if (cancelled) return;
        setWorkspaceId(ws ?? null);
        setBrandId(bid);

        // Danh sách landing page để bind domain — best-effort, rỗng nếu ws
        // chưa có page. Không chặn việc load domains.
        if (ws) {
          try {
            const pagesRes = await rexerApi.pages.list(ws, {
              type: 'landing',
              limit: 100,
            });
            if (!cancelled) setPages(pagesRes.items ?? []);
          } catch {
            /* bind list optional */
          }
        }

        const domRes = await rexerApi.brands.domains.list(bid);
        if (cancelled) return;
        setDomains((domRes.items ?? []).map(beDomainToLocal));
        setSource('live');
      } catch {
        if (!cancelled) setSource('fake'); // keep SEED mock
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = React.useMemo(() => {
    const m: Record<DomainStatus, number> = {
      pending: 0,
      verifying: 0,
      verified: 0,
      active: 0,
      failed: 0,
      disabled: 0,
    };
    for (const d of domains) m[d.status] += 1;
    return m;
  }, [domains]);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    setDomains(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              status: 'verifying',
              last_check_at: new Date().toISOString(),
            }
          : d
      )
    );
    if (!brandId) {
      await new Promise(r => setTimeout(r, 1500));
      setDomains(prev =>
        prev.map(d => (d.id === id ? { ...d, status: 'pending' } : d))
      );
      setVerifyingId(null);
      toast.info(t('profileDomains.bePendingMsg'));
      return;
    }
    try {
      await rexerApi.brands.domains.verify(brandId, id);
      await refresh(brandId);
      toast.success(t('profileDomains.verifyRunToast'));
    } catch (err) {
      toast.error(t('profileDomains.verifyFailToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
      await refresh(brandId).catch(() => {});
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const d = domains.find(x => x.id === id);
    if (!d) return;
    if (
      !window.confirm(t('profileDomains.deleteConfirm', { domain: d.domain }))
    )
      return;
    if (!brandId) {
      setDomains(prev => prev.filter(x => x.id !== id));
      toast.success(
        t('profileDomains.deletedLocalToast', { domain: d.domain })
      );
      return;
    }
    try {
      await rexerApi.brands.domains.remove(brandId, id);
      setDomains(prev => prev.filter(x => x.id !== id));
      toast.success(t('profileDomains.deletedToast', { domain: d.domain }));
    } catch (err) {
      toast.error(t('profileDomains.deleteFailToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleAdd = async (input: {
    domain: string;
    target_type: TargetType;
    page_id?: string;
  }) => {
    const domain = fmtDomain(input.domain);
    if (!brandId || !workspaceId) {
      const newDom: CustomDomain = {
        id: `dom_${Math.random().toString(36).slice(2, 8)}`,
        domain,
        target_type: input.target_type,
        status: 'pending',
        tls_active: false,
        verification_token: `rxr_verify_${Math.random().toString(36).slice(2, 14)}`,
        page_id: input.page_id ?? null,
      };
      setDomains(prev => [newDom, ...prev]);
      setAddOpen(false);
      toast.success(t('profileDomains.addedLocalToast', { domain }));
      return;
    }
    try {
      const res = await rexerApi.brands.domains.create(brandId, {
        domain,
        workspace_id: workspaceId,
        target_type: input.target_type,
        page_id: input.page_id || null,
      });
      setDomains(prev => [beDomainToLocal(res.domain), ...prev]);
      setAddOpen(false);
      toast.success(
        t('profileDomains.addedToast', { domain: res.domain.domain })
      );
    } catch (err) {
      toast.error(t('profileDomains.addFailToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  // Bind / unbind the landing page a domain serves (PATCH page_id).
  const handleBind = async (id: string, pageId: string) => {
    setDomains(prev =>
      prev.map(d => (d.id === id ? { ...d, page_id: pageId || null } : d))
    );
    if (!brandId) {
      toast.info(t('profileDomains.bePendingMsg'));
      return;
    }
    try {
      await rexerApi.brands.domains.update(brandId, id, {
        page_id: pageId || null,
      });
      const page = pages.find(p => p.id === pageId);
      toast.success(
        pageId
          ? t('profileDomains.boundToast', { name: page?.name ?? pageId })
          : t('profileDomains.unboundToast')
      );
    } catch (err) {
      toast.error(t('profileDomains.bindFailToast'), {
        description: err instanceof Error ? err.message : String(err),
      });
      if (brandId) await refresh(brandId).catch(() => {});
    }
  };

  return (
    <PortalShell>
      <Link
        href='/portal/profile'
        className='group border-border text-content-muted hover:text-foreground bg-background hover:border-foreground inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all hover:-translate-x-0.5'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        {t('profileDomains.backProfile')}
      </Link>

      <section className='mt-5'>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
          <Globe className='size-3' /> {t('profileDomains.eyebrow')}
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          {t('profileDomains.title')}
        </h1>
        <p className='text-content-muted mt-1 text-sm'>
          {t.rich('profileDomains.subtitle', {
            code: chunks => <code className='font-mono'>{chunks}</code>,
          })}
        </p>
      </section>

      {source === 'fake' && (
        <div className='mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800'>
          <ShieldAlert className='mt-0.5 size-3.5 shrink-0' />
          <span>{t('profileDomains.demoBanner')}</span>
        </div>
      )}

      {/* Stats strip */}
      <section className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label={t('profileDomains.statLive')}
          value={counts.active}
          icon={<ShieldCheck className='size-3.5' />}
          accent='emerald'
        />
        <StatCard
          label={t('profileDomains.statVerifying')}
          value={counts.verifying + counts.verified}
          icon={<Loader2 className='size-3.5' />}
          accent='blue'
        />
        <StatCard
          label={t('profileDomains.statPending')}
          value={counts.pending}
          icon={<ShieldAlert className='size-3.5' />}
          accent='amber'
        />
        <StatCard
          label={t('profileDomains.statTotal')}
          value={domains.length}
          icon={<Globe className='size-3.5' />}
          accent='zinc'
        />
      </section>

      {/* Add CTA */}
      <div className='mt-5 flex items-center justify-between gap-3'>
        <p className='text-2xs text-content-muted'>
          {t.rich('profileDomains.managingCount', {
            count: domains.length,
            strong: chunks => <strong>{chunks}</strong>,
          })}
        </p>
        <Button type='button' size='sm' onClick={() => setAddOpen(true)}>
          <Plus className='size-3.5' />
          {t('profileDomains.addDomain')}
        </Button>
      </div>

      {/* Domain list */}
      <section className='mt-5 space-y-4'>
        {domains.length === 0 ? (
          <div className='border-border bg-card rounded-2xl border border-dashed p-12 text-center'>
            <Globe className='text-muted-foreground mx-auto size-8' />
            <p className='text-content-muted mt-3 text-sm font-semibold'>
              {t('profileDomains.emptyTitle')}
            </p>
            <p className='text-content-muted mt-1 text-xs'>
              {t('profileDomains.emptyDesc')}
            </p>
          </div>
        ) : (
          domains.map(d => (
            <DomainCard
              key={d.id}
              domain={d}
              verifying={verifyingId === d.id}
              pages={pages}
              onVerify={() => handleVerify(d.id)}
              onDelete={() => handleDelete(d.id)}
              onBind={pageId => handleBind(d.id, pageId)}
            />
          ))
        )}
      </section>

      <AddDomainDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />
    </PortalShell>
  );
}

/* ─── Domain card ────────────────────────────────────────────────────── */

function DomainCard({
  domain,
  verifying,
  pages,
  onVerify,
  onDelete,
  onBind,
}: {
  domain: CustomDomain;
  verifying: boolean;
  pages: Page[];
  onVerify: () => void;
  onDelete: () => void;
  onBind: (pageId: string) => void;
}) {
  const t = useTranslations('portal');
  const target = TARGET_META[domain.target_type];
  const TargetIcon = target.icon;
  const showDns =
    domain.status === 'pending' ||
    domain.status === 'verifying' ||
    domain.status === 'failed';

  return (
    <div className='border-border bg-card overflow-hidden rounded-2xl border shadow-sm'>
      {/* Header */}
      <div className='border-border flex flex-wrap items-start gap-3 border-b px-5 py-4'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <div
            className={cn(
              'text-content-muted flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200',
              domain.status === 'active' &&
                'from-emerald-100 to-emerald-200 text-emerald-700'
            )}
          >
            <Globe className='size-5' />
          </div>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='text-foreground truncate font-mono text-base font-semibold'>
                {domain.domain}
              </h3>
              <StatusPill status={domain.status} />
            </div>
            <div className='text-2xs text-content-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1'>
              <span className='inline-flex items-center gap-1'>
                <TargetIcon className='size-3' />
                {t(`profileDomains.${target.labelKey}`)}
              </span>
              <span>·</span>
              <span>
                {t('profileDomains.lastCheck', {
                  time: relativeTime(domain.last_check_at, t),
                })}
              </span>
              {domain.tls_active && (
                <>
                  <span>·</span>
                  <span className='inline-flex items-center gap-1 text-emerald-700'>
                    <Lock className='size-3' />
                    {t('profileDomains.tlsActive')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {(domain.status === 'pending' || domain.status === 'failed') && (
            <Button
              type='button'
              size='sm'
              onClick={onVerify}
              disabled={verifying}
            >
              {verifying ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <RefreshCw className='size-3.5' />
              )}
              {verifying
                ? t('profileDomains.checking')
                : t('profileDomains.verifyNow')}
            </Button>
          )}
          {domain.status === 'verifying' && (
            <span className='inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700'>
              <Loader2 className='size-3.5 animate-spin' />
              {t('profileDomains.polling')}
            </span>
          )}
          <button
            type='button'
            onClick={onDelete}
            className='border-border text-content-muted bg-background hover:border-destructive/20 hover:bg-danger-bg hover:text-destructive inline-flex size-8 items-center justify-center rounded-lg border transition-colors'
            title={t('profileDomains.deleteTitle')}
          >
            <Trash2 className='size-3.5' />
          </button>
        </div>
      </div>

      {/* Body — timeline + DNS records */}
      <div className='px-5 py-4'>
        <Timeline status={domain.status} tlsActive={domain.tls_active} />

        {/* Bind landing page (target: landing) */}
        {domain.target_type === 'landing' && (
          <div className='border-border bg-muted/60 mt-4 flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5'>
            <span className='text-2xs text-content-muted inline-flex items-center gap-1.5 font-semibold tracking-wider uppercase'>
              <Globe className='size-3' /> {t('profileDomains.landingPage')}
            </span>
            <select
              value={domain.page_id ?? ''}
              onChange={e => onBind(e.target.value)}
              className='border-border bg-background focus:border-ring ml-auto min-w-[200px] rounded-lg border px-2.5 py-1.5 text-sm outline-none'
            >
              <option value=''>{t('profileDomains.noLandingOption')}</option>
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {domain.page_id && (
              <span className='text-3xs inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700'>
                <CheckCircle2 className='size-2.5' />{' '}
                {t('profileDomains.bound')}
              </span>
            )}
          </div>
        )}

        {showDns && (
          <div className='mt-5'>
            <div className='text-3xs text-content-muted mb-2 flex items-center gap-2 font-semibold tracking-[0.18em] uppercase'>
              <ShieldAlert className='size-3' />
              {t('profileDomains.dnsRecordsTitle')}
            </div>
            <DnsRecord
              kind='CNAME'
              name={
                domain.domain.includes('.')
                  ? domain.domain.split('.')[0] === domain.domain
                    ? '@'
                    : domain.domain.split('.').slice(0, -2).join('.') || '@'
                  : '@'
              }
              value='edge.rexer-edge.com.'
            />
            <DnsRecord
              kind='TXT'
              name={`_rexer-verify.${domain.domain}`}
              value={`rexer-verify=${domain.verification_token}`}
            />
            <p className='text-2xs text-content-muted mt-2'>
              {t.rich('profileDomains.dnsHint', {
                strong: chunks => <strong>{chunks}</strong>,
              })}
            </p>
          </div>
        )}

        {domain.status === 'failed' && domain.failure_reason && (
          <div className='border-destructive/20 bg-danger-bg text-destructive mt-3 rounded-lg border px-3 py-2 text-xs'>
            <strong>{t('profileDomains.verifyFailedLabel')}</strong>{' '}
            {domain.failure_reason}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Timeline ───────────────────────────────────────────────────────── */

function Timeline({
  status,
  tlsActive,
}: {
  status: DomainStatus;
  tlsActive: boolean;
}) {
  // 3 steps: DNS verified · TLS active · Live
  const dnsDone =
    status === 'verified' || status === 'active' || status === 'verifying';
  const tlsDone = tlsActive || status === 'active';
  const live = status === 'active';

  return (
    <div className='text-2xs flex items-center gap-2'>
      <Step active={dnsDone} loading={status === 'verifying'} label='DNS' />
      <Connector active={dnsDone} />
      <Step active={tlsDone} label='TLS' />
      <Connector active={tlsDone} />
      <Step active={live} label='Live' final />
    </div>
  );
}

function Step({
  active,
  loading,
  label,
  final,
}: {
  active: boolean;
  loading?: boolean;
  label: string;
  final?: boolean;
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <div
        className={cn(
          'flex size-5 items-center justify-center rounded-full transition-colors',
          active
            ? final
              ? 'bg-emerald-500 text-white'
              : 'bg-violet-500 text-white'
            : 'border-border text-muted-foreground bg-background border'
        )}
      >
        {loading ? (
          <Loader2 className='size-3 animate-spin' />
        ) : active ? (
          <CheckCircle2 className='size-3' />
        ) : (
          <span className='bg-input size-1.5 rounded-full' />
        )}
      </div>
      <span
        className={cn(
          'font-medium tracking-wider uppercase',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        'h-px flex-1 transition-colors',
        active ? 'bg-violet-300' : 'bg-muted'
      )}
    />
  );
}

/* ─── DNS record code block ──────────────────────────────────────────── */

function DnsRecord({
  kind,
  name,
  value,
}: {
  kind: 'CNAME' | 'TXT';
  name: string;
  value: string;
}) {
  const t = useTranslations('portal');
  const [copied, setCopied] = React.useState(false);
  const text = `${kind}    ${name}    ${value}`;

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast.success(t('profileDomains.copiedToast', { kind }));
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error(t('profileDomains.copyFailToast'))
    );
  };

  return (
    <div className='group border-border bg-foreground relative mt-2 overflow-hidden rounded-xl border'>
      {/* Kind chip */}
      <div className='text-3xs text-muted-foreground bg-foreground/90 absolute top-0 left-0 rounded-br-lg px-2 py-0.5 font-mono font-bold tracking-wider'>
        {kind}
      </div>
      <button
        type='button'
        onClick={copy}
        className='text-muted-foreground bg-foreground/90 hover:bg-foreground/85 hover:text-background absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-md transition-colors'
        title={t('profileDomains.copyRecordTitle')}
      >
        {copied ? (
          <CheckCircle2 className='size-3.5 text-emerald-400' />
        ) : (
          <Copy className='size-3.5' />
        )}
      </button>
      <div className='text-2xs overflow-x-auto px-3 pt-7 pb-3 font-mono leading-relaxed'>
        <div className='flex flex-wrap items-baseline gap-x-3 whitespace-nowrap'>
          <span className='text-blue-300'>Name</span>
          <span className='text-background'>{name}</span>
        </div>
        <div className='flex flex-wrap items-baseline gap-x-3 whitespace-nowrap'>
          <span className='text-blue-300'>Value</span>
          <span className='break-all text-emerald-300'>{value}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Status pill ────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: DomainStatus }) {
  const t = useTranslations('portal');
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'text-3xs inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-bold tracking-wider uppercase',
        meta.chip
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          meta.dot,
          meta.pulse && 'animate-pulse'
        )}
      />
      {t(`profileDomains.${meta.labelKey}`)}
    </span>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: 'emerald' | 'blue' | 'amber' | 'zinc';
}) {
  const palette: Record<typeof accent, string> = {
    emerald: 'border-emerald-100 bg-emerald-50/40 text-emerald-700',
    blue: 'border-blue-100 bg-blue-50/40 text-blue-700',
    amber: 'border-amber-100 bg-amber-50/40 text-amber-700',
    zinc: 'border-border bg-card text-content-muted',
  };
  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 shadow-sm', palette[accent])}
    >
      <div className='text-3xs flex items-center gap-1.5 font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='text-foreground mt-1 font-mono text-xl font-bold tabular-nums'>
        {value}
      </div>
    </div>
  );
}

/* ─── Add domain dialog ──────────────────────────────────────────────── */

function AddDomainDialog({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (v: { domain: string; target_type: TargetType }) => void;
}) {
  const t = useTranslations('portal');
  const [domain, setDomain] = React.useState('');
  const [targetType, setTargetType] = React.useState<TargetType>('landing');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDomain('');
      setTargetType('landing');
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateDomain(domain, t);
    if (err) {
      setError(err);
      return;
    }
    onSubmit({ domain, target_type: targetType });
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className='bg-card my-12 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl'
      >
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Globe className='size-4' />
            </div>
            <h3 className='text-base font-semibold'>
              {t('profileDomains.dialogTitle')}
            </h3>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClose}
            aria-label={t('profileDomains.close')}
          >
            <X className='size-4' />
          </Button>
        </div>

        <div className='space-y-4 px-5 py-4'>
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              {t('profileDomains.domainLabel')}{' '}
              <span className='text-destructive'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={domain}
              onChange={e => {
                setDomain(e.target.value);
                setError(null);
              }}
              placeholder={t('profileDomains.domainPlaceholder')}
              className='border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
            <p className='text-3xs text-content-muted mt-1'>
              {t('profileDomains.domainHint')}
            </p>
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              {t('profileDomains.purposeLabel')}
            </label>
            <div className='mt-2 space-y-2'>
              {(['landing', 'curate_cdn', 'tracking'] as const).map(typ => {
                const meta = TARGET_META[typ];
                const Icon = meta.icon;
                const selected = targetType === typ;
                return (
                  <label
                    key={typ}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                      selected
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-border hover:bg-muted bg-background'
                    )}
                  >
                    <input
                      type='radio'
                      name='target_type'
                      checked={selected}
                      onChange={() => setTargetType(typ)}
                      className='mt-1.5 size-3.5 accent-emerald-600'
                    />
                    <div className='flex-1'>
                      <div className='text-foreground flex items-center gap-1.5 text-sm font-semibold'>
                        <Icon className='size-3.5' />
                        {t(`profileDomains.${meta.labelKey}`)}
                      </div>
                      <p className='text-2xs text-content-muted mt-0.5 leading-snug'>
                        {t(`profileDomains.${meta.descriptionKey}`)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-xs'>
              {error}
            </div>
          )}

          <div className='text-2xs rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 leading-relaxed text-amber-900'>
            {t.rich('profileDomains.afterAddNote', {
              strong: chunks => <strong>{chunks}</strong>,
            })}
          </div>
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <Button type='button' variant='neutral' size='sm' onClick={onClose}>
            {t('profileDomains.cancel')}
          </Button>
          <Button type='submit' size='sm' disabled={!domain.trim()}>
            <Plus className='size-3.5' />
            {t('profileDomains.addDomain')}
          </Button>
        </div>
      </form>
    </div>
  );
}
