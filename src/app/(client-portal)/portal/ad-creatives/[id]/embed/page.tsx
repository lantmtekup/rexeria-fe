'use client';

/**
 * Mã nhúng + allowed domains cho 1 ad-creative. Snippet dựng thẳng URL
 * `/p/{slug}?embed=1` (KHÔNG gọi `pages.embedSnippet()` — endpoint đó hiện
 * BE chỉ nhận `type='curate'`, xem docs/be-spec-interactive-ad-creative-
 * 2026-07-02.md §2). Domain allowlist lưu qua `pages.update()` sẵn có,
 * enforce thật ở BE vẫn đang chờ spec.
 */

import { ArrowLeft, Check, Copy, Loader2, Plus, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, PageMetadataAd } from '@/services/rexer/types';

export default function PortalAdCreativeEmbedPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [page, setPage] = React.useState<Page | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [domainInput, setDomainInput] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const load = React.useCallback(() => {
    if (!id) return;
    setLoading(true);
    rexerApi.pages
      .get(id)
      .then(setPage)
      .catch(err =>
        setError(
          err instanceof RxApiError
            ? err.code || err.message
            : 'Không tải được ad creative'
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  React.useEffect(load, [load]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2 className='text-content-muted size-6 animate-spin' />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className='mx-auto max-w-2xl p-10'>
        <BackLink />
        <div className='border-destructive/20 bg-danger-bg mt-8 rounded-2xl border p-8 text-center'>
          <p className='text-destructive text-sm font-semibold'>
            {error ?? 'Không tìm thấy ad creative'}
          </p>
        </div>
      </div>
    );
  }

  const meta = page.type_metadata as PageMetadataAd;
  const domains = meta.interactive?.allowed_domains ?? [];
  const embedUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${page.slug}?embed=1`;
  const snippet = `<iframe src="${embedUrl}" width="${meta.dimensions?.width ?? 800}" height="${meta.dimensions?.height ?? 450}" style="border:0" loading="lazy" title="${page.name}"></iframe>`;

  const persistDomains = async (next: string[]) => {
    setSaving(true);
    try {
      const updated = await rexerApi.pages.update(page.id, {
        type_metadata: {
          ...meta,
          interactive: {
            layout: meta.interactive?.layout ?? 'inline',
            trigger: meta.interactive?.trigger ?? 'on_load',
            trigger_config: meta.interactive?.trigger_config ?? {},
            closeable: meta.interactive?.closeable ?? true,
            ...meta.interactive,
            allowed_domains: next,
          },
        },
      });
      setPage(updated);
    } catch (err) {
      toast.error(
        err instanceof RxApiError
          ? err.code || err.message
          : 'Lưu allowed domains thất bại'
      );
    } finally {
      setSaving(false);
    }
  };

  const addDomain = () => {
    const d = domainInput.trim();
    if (!d || domains.includes(d)) return;
    setDomainInput('');
    void persistDomains([...domains, d]);
  };
  const removeDomain = (d: string) =>
    void persistDomains(domains.filter(x => x !== d));

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    toast.success('Đã copy mã nhúng');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className='mx-auto max-w-2xl p-6'>
      <BackLink />
      <h1 className='mt-4 text-xl font-bold tracking-tight'>
        Nhúng — {page.name}
      </h1>
      <p className='text-content-muted mt-1 text-sm'>
        Dán đoạn iframe dưới đây vào site đối tác để hiện ad creative.
      </p>

      <div className='border-border bg-card mt-6 rounded-2xl border p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
            Mã nhúng
          </span>
          <Button
            type='button'
            size='sm'
            variant='neutral'
            onClick={copySnippet}
          >
            {copied ? (
              <Check className='size-3.5' />
            ) : (
              <Copy className='size-3.5' />
            )}
            {copied ? 'Đã copy' : 'Copy'}
          </Button>
        </div>
        <pre className='bg-muted text-foreground mt-2 overflow-x-auto rounded-lg p-3 text-xs'>
          <code>{snippet}</code>
        </pre>
      </div>

      <div className='border-border bg-card mt-4 rounded-2xl border p-4'>
        <span className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
          Allowed domains
        </span>
        <p className='text-content-muted mt-1 text-xs'>
          Chỉ check phía client, chưa chặn thật ở BE (xem BE spec). Bỏ trống =
          cho phép mọi domain.
        </p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {domains.map(d => (
            <span
              key={d}
              className='bg-muted text-content-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs'
            >
              {d}
              <button
                type='button'
                onClick={() => removeDomain(d)}
                aria-label={`Xoá ${d}`}
                className='text-content-muted hover:text-destructive'
              >
                <Trash2 className='size-3' />
              </button>
            </span>
          ))}
        </div>
        <div className='mt-3 flex gap-2'>
          <input
            type='text'
            value={domainInput}
            onChange={e => setDomainInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDomain();
              }
            }}
            placeholder='vd: *.tekup.vn'
            className='border-border bg-background flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
          />
          <Button
            type='button'
            size='sm'
            onClick={addDomain}
            disabled={saving || !domainInput.trim()}
          >
            <Plus className='size-3.5' /> Thêm
          </Button>
        </div>
      </div>
    </div>
  );

  function BackLink() {
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
}
