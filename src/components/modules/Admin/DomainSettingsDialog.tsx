'use client';

/**
 * Domain settings for a single landing page — `/admin/landing-pages` kebab
 * menu → "Cài đặt domain".
 *
 * Custom domains are brand-scoped in BE (`/brands/:id/domains` with
 * target_type=landing). Verified domains serve every landing of the
 * brand under `/p/{page.slug}`, so this dialog shows:
 *  - the public URLs this page is reachable at (default + each verified
 *    custom domain),
 *  - the brand's `target_type=landing` domains with status + DNS records,
 *  - actions: add new, verify pending, remove.
 *
 * Scope: brand-level mgmt accessed in the context of a specific page so
 * the user sees a per-page URL preview. Per-page domain pinning (the BE
 * `page_id` column exists but isn't writable yet) — when BE wires it up,
 * we'll add a "Mặc định cho trang này" toggle here.
 */

import * as React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  BrandDomain,
  BrandDomainDnsRecord,
  Page,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

export interface DomainSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: Page;
}

// FQDN: optional `*.`, labels of [a-z0-9-], TLD ≥ 2 chars. Case-insensitive.
const DOMAIN_RE = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

function dnsRecordsFor(d: BrandDomain): BrandDomainDnsRecord[] {
  // BE returns DNS records only on POST/verify responses. For list rows we
  // reconstruct the canonical pair (TXT verify token + CNAME @) so the
  // user can re-copy them after the create dialog closes.
  return [
    {
      type: 'CNAME',
      name: '@',
      value: 'http://localhost:8080',
    },
    {
      type: 'TXT',
      name: '_rexer-verify',
      value: d.verification_token,
    },
  ];
}

export function DomainSettingsDialog({
  open,
  onOpenChange,
  page,
}: DomainSettingsDialogProps) {
  const [domains, setDomains] = React.useState<BrandDomain[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [newDomain, setNewDomain] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  // Show DNS records under the row that was just created or verified.
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    if (!page.brand_id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await rexerApi.brands.domains.list(page.brand_id);
      const onlyLanding = (res.items ?? []).filter(
        d => d.target_type === 'landing'
      );
      setDomains(onlyLanding);
    } catch (err) {
      setError(rxMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page.brand_id]);

  React.useEffect(() => {
    if (open) {
      setNewDomain('');
      setExpandedId(null);
      void reload();
    }
  }, [open, reload]);

  const handleAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = newDomain.trim().toLowerCase();
    if (!value) {
      toast.error('Nhập domain trước');
      return;
    }
    if (!DOMAIN_RE.test(value)) {
      toast.error('Domain không hợp lệ (vd: shop.brand.vn)');
      return;
    }
    setCreating(true);
    try {
      const res = await rexerApi.brands.domains.create(page.brand_id, {
        domain: value,
        workspace_id: page.workspace_id,
        target_type: 'landing',
      });
      toast.success(`Đã thêm ${res.domain.domain}`);
      setNewDomain('');
      setExpandedId(res.domain.id);
      await reload();
    } catch (err) {
      toast.error(`Thêm thất bại: ${rxMessage(err)}`);
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (d: BrandDomain) => {
    setBusyId(d.id);
    try {
      const res = await rexerApi.brands.domains.verify(page.brand_id, d.id);
      if (res.domain.status === 'verified') {
        toast.success(`Đã xác minh ${d.domain}`);
      } else {
        toast.message('Chưa xác minh được', {
          description:
            res.domain.failure_reason ||
            res.message ||
            'DNS chưa propagate hoặc TXT/CNAME chưa khớp.',
        });
        setExpandedId(d.id);
      }
      await reload();
    } catch (err) {
      toast.error(`Verify thất bại: ${rxMessage(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (d: BrandDomain) => {
    if (!window.confirm(`Xoá domain ${d.domain}?`)) return;
    setBusyId(d.id);
    try {
      await rexerApi.brands.domains.remove(page.brand_id, d.id);
      toast.success(`Đã xoá ${d.domain}`);
      await reload();
    } catch (err) {
      toast.error(`Xoá thất bại: ${rxMessage(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const verifiedDomains = (domains ?? []).filter(d => d.status === 'verified');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Globe className='size-4 text-blue-600' />
            Cài đặt domain
          </DialogTitle>
          <DialogDescription>
            Domain dùng chung cho brand này, mọi landing đã publish đều có URL
            tương ứng dưới{' '}
            <code className='font-mono'>/p/&#123;slug&#125;</code>.
          </DialogDescription>
        </DialogHeader>

        {/* URL preview for this page */}
        <section className='border-border bg-muted rounded-xl border p-3'>
          <p className='text-2xs text-content-muted font-semibold tracking-wide uppercase'>
            URL của trang này
          </p>
          <ul className='mt-2 flex flex-col gap-1.5'>
            <UrlRow
              url={`/p/${page.slug || page.id}`}
              label='Mặc định (relative)'
            />
            {verifiedDomains.length === 0 && (
              <li className='text-2xs text-content-muted italic'>
                Chưa có domain custom đã xác minh.
              </li>
            )}
            {verifiedDomains.map(d => (
              <UrlRow
                key={d.id}
                url={`https://${d.domain}/p/${page.slug || page.id}`}
                label={d.domain}
              />
            ))}
          </ul>
        </section>

        {/* Add new */}
        <form
          onSubmit={handleAdd}
          className='border-border flex flex-col gap-2 rounded-xl border p-3'
        >
          <Label
            htmlFor='dom-new'
            className='text-content-muted text-xs font-semibold'
          >
            Thêm domain mới
          </Label>
          <div className='flex items-center gap-2'>
            <Input
              id='dom-new'
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder='shop.brand.vn'
              autoComplete='off'
              disabled={creating}
              className='font-mono'
            />
            <Button type='submit' disabled={creating || !newDomain.trim()}>
              {creating && <Loader2 className='mr-1 size-3.5 animate-spin' />}
              Thêm
            </Button>
          </div>
          <p className='text-2xs text-content-muted'>
            Sau khi thêm, cần config DNS (TXT + CNAME) rồi bấm
            &quot;Verify&quot;.
          </p>
        </form>

        {/* Domains list */}
        <section>
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-content-muted text-xs font-semibold tracking-wide uppercase'>
              Domains của brand ({domains?.length ?? 0})
            </h3>
            <button
              type='button'
              onClick={() => void reload()}
              disabled={loading}
              className='text-2xs text-content-muted hover:bg-muted inline-flex items-center gap-1 rounded-md px-2 py-1 disabled:opacity-50'
              aria-label='Refresh'
            >
              <RefreshCw className={cn('size-3', loading && 'animate-spin')} />
              Refresh
            </button>
          </div>

          {error && (
            <div className='mb-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800'>
              <AlertCircle className='mt-0.5 size-3.5 shrink-0' />
              <span className='font-mono'>{error}</span>
            </div>
          )}

          {!error && domains && domains.length === 0 && (
            <p className='border-border text-content-muted rounded-lg border border-dashed p-4 text-center text-xs'>
              Chưa có custom domain nào.
            </p>
          )}

          <ul className='flex flex-col gap-2'>
            {(domains ?? []).map(d => (
              <li
                key={d.id}
                className='border-border rounded-xl border bg-white'
              >
                <div className='flex items-center gap-2 px-3 py-2'>
                  <StatusDot status={d.status} />
                  <span className='text-foreground flex-1 truncate font-mono text-xs'>
                    {d.domain}
                  </span>
                  <StatusBadge status={d.status} />
                  {d.status !== 'verified' && (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={busyId === d.id}
                      onClick={() => void handleVerify(d)}
                      className='text-2xs h-7'
                    >
                      {busyId === d.id ? (
                        <Loader2 className='size-3 animate-spin' />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  )}
                  <button
                    type='button'
                    onClick={() =>
                      setExpandedId(expandedId === d.id ? null : d.id)
                    }
                    className='text-2xs text-content-muted hover:bg-muted rounded-md px-2 py-1'
                  >
                    DNS
                  </button>
                  <button
                    type='button'
                    onClick={() => void handleRemove(d)}
                    disabled={busyId === d.id}
                    className='rounded-md p-1 text-rose-600 hover:bg-rose-50 disabled:opacity-50'
                    aria-label='Xoá domain'
                  >
                    <Trash2 className='size-3.5' />
                  </button>
                </div>
                {expandedId === d.id && (
                  <div className='border-border bg-muted/60 border-t px-3 py-2'>
                    <p className='text-2xs text-content-muted mb-1.5 font-semibold'>
                      Cấu hình DNS tại nhà cung cấp domain
                    </p>
                    <table className='text-2xs w-full'>
                      <thead className='text-content-muted'>
                        <tr>
                          <th className='py-1 text-left font-medium'>Type</th>
                          <th className='py-1 text-left font-medium'>Name</th>
                          <th className='py-1 text-left font-medium'>Value</th>
                          <th className='w-6' />
                        </tr>
                      </thead>
                      <tbody className='text-foreground font-mono'>
                        {dnsRecordsFor(d).map((r, i) => (
                          <tr key={i} className='border-border/70 border-t'>
                            <td className='py-1 pr-2'>{r.type}</td>
                            <td className='py-1 pr-2'>{r.name}</td>
                            <td className='max-w-[200px] truncate py-1 pr-2'>
                              {r.value}
                            </td>
                            <td className='py-1'>
                              <button
                                type='button'
                                onClick={() => {
                                  void navigator.clipboard.writeText(r.value);
                                  toast.success('Đã copy');
                                }}
                                className='text-content-muted hover:bg-muted rounded-md p-1'
                                aria-label='Copy value'
                              >
                                <Copy className='size-3' />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {d.failure_reason && (
                      <p className='text-2xs mt-2 text-rose-600'>
                        Lỗi xác minh gần nhất: {d.failure_reason}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {loading && !domains && (
            <div className='text-content-muted flex items-center justify-center py-6 text-xs'>
              <Loader2 className='mr-2 size-3.5 animate-spin' />
              Đang load…
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

function StatusDot({ status }: { status: string }) {
  const cls =
    status === 'verified'
      ? 'bg-emerald-500'
      : status === 'failed'
        ? 'bg-rose-500'
        : 'bg-amber-400';
  return <span className={cn('size-2 rounded-full', cls)} />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-800',
    verifying: 'bg-blue-100 text-blue-700',
    failed: 'bg-rose-100 text-rose-700',
  };
  const cls = map[status] ?? 'bg-muted text-content-muted';
  const label =
    status === 'verified' ? (
      <span className='inline-flex items-center gap-1'>
        <CheckCircle2 className='size-3' /> Verified
      </span>
    ) : (
      status
    );
  return (
    <span className={cn('text-3xs rounded-full px-2 py-0.5 font-medium', cls)}>
      {label}
    </span>
  );
}

function UrlRow({ url, label }: { url: string; label: string }) {
  const display = url.startsWith('http') ? url : url;
  return (
    <li className='flex items-center gap-2'>
      <span className='text-2xs text-content-muted shrink-0'>{label}:</span>
      <code className='text-2xs text-foreground flex-1 truncate font-mono'>
        {display}
      </code>
      <button
        type='button'
        onClick={() => {
          void navigator.clipboard.writeText(url);
          toast.success('Đã copy URL');
        }}
        className='text-content-muted rounded-md p-1 hover:bg-zinc-200'
        aria-label='Copy URL'
      >
        <Copy className='size-3' />
      </button>
    </li>
  );
}
