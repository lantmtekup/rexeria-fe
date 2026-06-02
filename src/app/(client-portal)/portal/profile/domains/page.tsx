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

import { rexerApi } from '@/services/rexer/endpoints';
import type { BrandDomain, Page } from '@/services/rexer/types';
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
  { label: string; chip: string; dot: string; pulse?: boolean }
> = {
  pending: {
    label: 'Chờ DNS',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  verifying: {
    label: 'Đang verify',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    pulse: true,
  },
  verified: {
    label: 'DNS verified',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
    dot: 'bg-violet-500',
  },
  active: {
    label: 'Live',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Thất bại',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  disabled: {
    label: 'Tắt',
    chip: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dot: 'bg-zinc-400',
  },
};

const TARGET_META: Record<
  TargetType,
  { label: string; icon: React.ElementType; description: string }
> = {
  landing: {
    label: 'Landing pages',
    icon: Globe,
    description:
      'Public URL serve published landings của brand. URL dạng coca.vn/{slug}',
  },
  curate_cdn: {
    label: 'Curate CDN',
    icon: ShieldCheck,
    description:
      'Serve curate.js + widget data từ domain của brand thay vì cdn.rexer.com → tránh CSP cross-origin issue',
  },
  tracking: {
    label: 'Tracking pixel',
    icon: ShieldAlert,
    description:
      'Analytics endpoint từ track.coca.vn → tránh ad-block chặn track.rexer.com',
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

const BE_PENDING_MSG =
  'Không lấy được brand/workspace (BE cutover) — thao tác đang chạy ở chế độ local.';

/* ─── Helpers ────────────────────────────────────────────────────────── */

function relativeTime(iso?: string): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diffMin = Math.round((Date.now() - t) / 60_000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin}m trước`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h trước`;
  return `${Math.round(diffH / 24)}d trước`;
}

function fmtDomain(d: string): string {
  return d.toLowerCase().trim().replace(/\/$/, '');
}

function validateDomain(d: string): string | null {
  const v = fmtDomain(d);
  if (!v) return 'Nhập domain';
  if (v.length > 253) return 'Quá dài (>253 ký tự)';
  // Strict-ish hostname regex
  const re = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  if (!re.test(v)) return 'Format không hợp lệ (vd: coca.vn, cdn.coca.vn)';
  return null;
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function PortalDomainsPage() {
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
        const ws = me.user.active_workspace_id;
        if (!ws) throw new Error('no active workspace');
        if (cancelled) return;
        setWorkspaceId(ws);

        const pagesRes = await rexerApi.pages.list(ws, {
          type: 'landing',
          limit: 100,
        });
        const items = pagesRes.items ?? [];
        const bid = items[0]?.brand_id;
        if (!bid) throw new Error('cannot resolve brand id');
        if (cancelled) return;
        setPages(items);
        setBrandId(bid);

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
      toast.info(BE_PENDING_MSG);
      return;
    }
    try {
      await rexerApi.brands.domains.verify(brandId, id);
      await refresh(brandId);
      toast.success('Đã chạy verify — kiểm tra trạng thái DNS/TLS.');
    } catch (err) {
      toast.error('Verify thất bại', {
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
    if (!window.confirm(`Xoá custom domain "${d.domain}"?`)) return;
    if (!brandId) {
      setDomains(prev => prev.filter(x => x.id !== id));
      toast.success(`Đã xoá ${d.domain} (local)`);
      return;
    }
    try {
      await rexerApi.brands.domains.remove(brandId, id);
      setDomains(prev => prev.filter(x => x.id !== id));
      toast.success(`Đã xoá ${d.domain}`);
    } catch (err) {
      toast.error('Xoá thất bại', {
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
      toast.success(`Đã thêm ${domain} (local) — BE chưa khả dụng`);
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
        `Đã thêm ${res.domain.domain} — thêm DNS records để verify`
      );
    } catch (err) {
      toast.error('Thêm domain thất bại', {
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
      toast.info(BE_PENDING_MSG);
      return;
    }
    try {
      await rexerApi.brands.domains.update(brandId, id, {
        page_id: pageId || null,
      });
      const page = pages.find(p => p.id === pageId);
      toast.success(
        pageId ? `Đã gắn landing "${page?.name ?? pageId}"` : 'Đã gỡ landing'
      );
    } catch (err) {
      toast.error('Gắn landing thất bại', {
        description: err instanceof Error ? err.message : String(err),
      });
      if (brandId) await refresh(brandId).catch(() => {});
    }
  };

  return (
    <PortalShell>
      <Link
        href='/portal/profile'
        className='group inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900 hover:text-zinc-900'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        Profile
      </Link>

      <section className='mt-5'>
        <div className='flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
          <Globe className='size-3' /> Custom domains
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Tên miền tuỳ chỉnh
        </h1>
        <p className='mt-1 text-[13px] text-zinc-500'>
          Map domain riêng (vd <code className='font-mono'>coca.vn</code>) tới
          workspace để landing pages của bạn live tại URL chính chủ. Rexer xác
          thực qua DNS + tự động cấp TLS.
        </p>
      </section>

      {source === 'fake' && (
        <div className='mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-800'>
          <ShieldAlert className='mt-0.5 size-3.5 shrink-0' />
          <span>
            Đang hiển thị dữ liệu demo — chưa lấy được brand/workspace từ BE
            (cutover). Thao tác chạy ở chế độ local cho tới khi BE sẵn sàng.
          </span>
        </div>
      )}

      {/* Stats strip */}
      <section className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <StatCard
          label='Live'
          value={counts.active}
          icon={<ShieldCheck className='size-3.5' />}
          accent='emerald'
        />
        <StatCard
          label='Verifying'
          value={counts.verifying + counts.verified}
          icon={<Loader2 className='size-3.5' />}
          accent='blue'
        />
        <StatCard
          label='Chờ DNS'
          value={counts.pending}
          icon={<ShieldAlert className='size-3.5' />}
          accent='amber'
        />
        <StatCard
          label='Tổng'
          value={domains.length}
          icon={<Globe className='size-3.5' />}
          accent='zinc'
        />
      </section>

      {/* Add CTA */}
      <div className='mt-5 flex items-center justify-between gap-3'>
        <p className='text-[11.5px] text-zinc-500'>
          Đang quản lý <strong>{domains.length}</strong> domain · Brand quota
          không giới hạn Phase 1
        </p>
        <button
          type='button'
          onClick={() => setAddOpen(true)}
          className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-700'
        >
          <Plus className='size-3.5' />
          Thêm domain
        </button>
      </div>

      {/* Domain list */}
      <section className='mt-5 space-y-4'>
        {domains.length === 0 ? (
          <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center'>
            <Globe className='mx-auto size-8 text-zinc-300' />
            <p className='mt-3 text-[14px] font-semibold text-zinc-700'>
              Chưa có custom domain
            </p>
            <p className='mt-1 text-[12px] text-zinc-500'>
              Bấm &ldquo;Thêm domain&rdquo; để map tên miền riêng của brand vào
              Rexer.
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
  const target = TARGET_META[domain.target_type];
  const TargetIcon = target.icon;
  const showDns =
    domain.status === 'pending' ||
    domain.status === 'verifying' ||
    domain.status === 'failed';

  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='flex flex-wrap items-start gap-3 border-b border-zinc-100 px-5 py-4'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-700',
              domain.status === 'active' &&
                'from-emerald-100 to-emerald-200 text-emerald-700'
            )}
          >
            <Globe className='size-5' />
          </div>
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='truncate font-mono text-[15px] font-semibold text-zinc-900'>
                {domain.domain}
              </h3>
              <StatusPill status={domain.status} />
            </div>
            <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500'>
              <span className='inline-flex items-center gap-1'>
                <TargetIcon className='size-3' />
                {target.label}
              </span>
              <span>·</span>
              <span>Check {relativeTime(domain.last_check_at)}</span>
              {domain.tls_active && (
                <>
                  <span>·</span>
                  <span className='inline-flex items-center gap-1 text-emerald-700'>
                    <Lock className='size-3' />
                    TLS active
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {(domain.status === 'pending' || domain.status === 'failed') && (
            <button
              type='button'
              onClick={onVerify}
              disabled={verifying}
              className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60'
            >
              {verifying ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <RefreshCw className='size-3.5' />
              )}
              {verifying ? 'Đang check…' : 'Verify ngay'}
            </button>
          )}
          {domain.status === 'verifying' && (
            <span className='inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700'>
              <Loader2 className='size-3.5 animate-spin' />
              Polling…
            </span>
          )}
          <button
            type='button'
            onClick={onDelete}
            className='inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700'
            title='Xoá domain'
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
          <div className='mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/60 px-3 py-2.5'>
            <span className='inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
              <Globe className='size-3' /> Landing page
            </span>
            <select
              value={domain.page_id ?? ''}
              onChange={e => onBind(e.target.value)}
              className='ml-auto min-w-[200px] rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-zinc-900'
            >
              <option value=''>— Chưa gắn landing page —</option>
              {pages.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {domain.page_id && (
              <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
                <CheckCircle2 className='size-2.5' /> Đã gắn
              </span>
            )}
          </div>
        )}

        {showDns && (
          <div className='mt-5'>
            <div className='mb-2 flex items-center gap-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
              <ShieldAlert className='size-3' />
              DNS records — thêm tại nhà cung cấp domain
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
            <p className='mt-2 text-[11px] text-zinc-500'>
              DNS thường propagate trong 5-30 phút. Bấm{' '}
              <strong>Verify ngay</strong> sau khi đã add record. Rexer cũng tự
              poll mỗi 5 phút.
            </p>
          </div>
        )}

        {domain.status === 'failed' && domain.failure_reason && (
          <div className='mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
            <strong>Verify thất bại:</strong> {domain.failure_reason}
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
    <div className='flex items-center gap-2 text-[11px]'>
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
            : 'border border-zinc-300 bg-white text-zinc-400'
        )}
      >
        {loading ? (
          <Loader2 className='size-3 animate-spin' />
        ) : active ? (
          <CheckCircle2 className='size-3' />
        ) : (
          <span className='size-1.5 rounded-full bg-zinc-300' />
        )}
      </div>
      <span
        className={cn(
          'font-medium tracking-wider uppercase',
          active ? 'text-zinc-900' : 'text-zinc-400'
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
        active ? 'bg-violet-300' : 'bg-zinc-200'
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
  const [copied, setCopied] = React.useState(false);
  const text = `${kind}    ${name}    ${value}`;

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast.success(`Đã copy ${kind} record`);
        window.setTimeout(() => setCopied(false), 1500);
      },
      () => toast.error('Copy thất bại')
    );
  };

  return (
    <div className='group relative mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-900'>
      {/* Kind chip */}
      <div className='absolute top-0 left-0 rounded-br-lg bg-zinc-800 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-zinc-300'>
        {kind}
      </div>
      <button
        type='button'
        onClick={copy}
        className='absolute top-1.5 right-1.5 inline-flex size-7 items-center justify-center rounded-md bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white'
        title='Copy record'
      >
        {copied ? (
          <CheckCircle2 className='size-3.5 text-emerald-400' />
        ) : (
          <Copy className='size-3.5' />
        )}
      </button>
      <div className='overflow-x-auto px-3 pt-7 pb-3 font-mono text-[11.5px] leading-relaxed'>
        <div className='flex flex-wrap items-baseline gap-x-3 whitespace-nowrap'>
          <span className='text-blue-300'>Name</span>
          <span className='text-white'>{name}</span>
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
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
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
      {meta.label}
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
    zinc: 'border-zinc-200 bg-white text-zinc-600',
  };
  return (
    <div
      className={cn('rounded-2xl border px-4 py-3 shadow-sm', palette[accent])}
    >
      <div className='flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase opacity-75'>
        {icon}
        {label}
      </div>
      <div className='mt-1 font-mono text-xl font-bold text-zinc-900 tabular-nums'>
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
    const err = validateDomain(domain);
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
        className='my-12 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
      >
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Globe className='size-4' />
            </div>
            <h3 className='text-[15px] font-semibold'>Thêm custom domain</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        <div className='space-y-4 px-5 py-4'>
          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Domain <span className='text-rose-500'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={domain}
              onChange={e => {
                setDomain(e.target.value);
                setError(null);
              }}
              placeholder='coca.vn hoặc campaigns.coca.vn'
              className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-[14px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
            <p className='mt-1 text-[10.5px] text-zinc-500'>
              Apex (coca.vn) hoặc subdomain (campaigns.coca.vn). Không có
              http(s):// hoặc path.
            </p>
          </div>

          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Mục đích
            </label>
            <div className='mt-2 space-y-2'>
              {(['landing', 'curate_cdn', 'tracking'] as const).map(t => {
                const meta = TARGET_META[t];
                const Icon = meta.icon;
                const selected = targetType === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                      selected
                        ? 'border-emerald-300 bg-emerald-50/50'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50'
                    )}
                  >
                    <input
                      type='radio'
                      name='target_type'
                      checked={selected}
                      onChange={() => setTargetType(t)}
                      className='mt-1.5 size-3.5 accent-emerald-600'
                    />
                    <div className='flex-1'>
                      <div className='flex items-center gap-1.5 text-[13px] font-semibold text-zinc-900'>
                        <Icon className='size-3.5' />
                        {meta.label}
                      </div>
                      <p className='mt-0.5 text-[11px] leading-snug text-zinc-500'>
                        {meta.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
              {error}
            </div>
          )}

          <div className='rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-[11px] leading-relaxed text-amber-900'>
            <strong>Sau khi thêm:</strong> bạn sẽ thấy 2 DNS records (CNAME +
            TXT) để add tại nhà cung cấp domain. Rexer auto-verify sau khi DNS
            propagate (5-30 phút).
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100'
          >
            Huỷ
          </button>
          <button
            type='submit'
            disabled={!domain.trim()}
            className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <Plus className='size-3.5' />
            Thêm domain
          </button>
        </div>
      </form>
    </div>
  );
}
