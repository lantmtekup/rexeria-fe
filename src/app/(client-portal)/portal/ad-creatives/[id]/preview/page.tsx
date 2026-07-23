'use client';

/**
 * Preview ad-creative — render THẬT từ canvas_blueprint của version page
 * đang pin (chạy cho cả DRAFT). Logic resolve giống hệt
 * `landing-pages/[id]/preview` (xem docstring ở đó) vì cả 2 đều là Page
 * cùng cơ chế template_version_id → template_id → canvas_blueprint.
 */

import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import { PreviewMode } from '@/components/modules/block-editor/PreviewMode';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import type { Block, Lang } from '@/components/modules/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'LOAD_FAILED';
}

export default function PortalAdCreativePreviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'vi';
  const id = params?.id ?? '';

  const [blocks, setBlocks] = React.useState<Block[] | null>(null);
  const [transition, setTransition] = React.useState<string | undefined>();
  const [status, setStatus] = React.useState<'loading' | 'ok' | 'error'>(
    'loading'
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus('loading');
    setError(null);

    (async () => {
      try {
        const page = await rexerApi.pages.get(id);
        if (cancelled) return;

        try {
          const revs = await rexerApi.pages.revisions(id, { limit: 50 });
          if (cancelled) return;
          // BE sorts by changed_at DESC by default → items[0] is the latest.
          const latest = (revs.items ?? [])[0];
          const parsedRev = latest?.config_json
            ? parseCanvas(latest.config_json)
            : null;
          if (parsedRev?.blocks?.length) {
            setBlocks(parsedRev.blocks);
            setTransition(
              (latest!.config_json as { transition?: string }).transition
            );
            setStatus('ok');
            return;
          }
        } catch {
          /* không có revision → dùng blueprint template bên dưới */
        }

        const versionId = page.template_version_id;
        if (!versionId) throw new Error('Page chưa có template_version_id');

        const templates = await rexerApi.templates.list({ limit: 500 });
        const items = templates.items ?? [];
        const matches = await Promise.all(
          items.map(async tpl => {
            if (tpl.current_version_id === versionId) return tpl;
            try {
              const vl = await rexerApi.templates.versions(tpl.id);
              return (vl.items ?? []).some(v => v.id === versionId)
                ? tpl
                : null;
            } catch {
              return null;
            }
          })
        );
        const tpl = matches.find(Boolean);
        if (!tpl) throw new Error('Không tìm thấy template chứa version');

        const ver = await rexerApi.templates.version(tpl.id, versionId);
        if (cancelled) return;
        const parsed = parseCanvas(ver.canvas_blueprint);
        const bp = ver.canvas_blueprint as { transition?: string } | undefined;
        setBlocks(parsed?.blocks ?? []);
        setTransition(bp?.transition);
        setStatus('ok');
      } catch (err) {
        if (!cancelled) {
          setError(rxMessage(err));
          setStatus('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className='bg-muted flex h-screen items-center justify-center'>
        <Loader2 className='text-content-muted size-6 animate-spin' />
      </div>
    );
  }

  if (status === 'error' || !blocks) {
    return (
      <div className='mx-auto max-w-2xl p-10'>
        <button
          type='button'
          onClick={() => router.push('/portal/ad-creatives')}
          className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm'
        >
          <ArrowLeft className='size-4' /> Ad Creatives
        </button>
        <div className='border-destructive/20 bg-danger-bg mt-8 rounded-2xl border p-8 text-center'>
          <p className='text-destructive text-sm font-semibold'>
            Không tải được preview
          </p>
          {error && (
            <p className='text-2xs text-destructive/80 mt-1 font-mono'>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className='mx-auto max-w-2xl p-10 text-center'>
        <button
          type='button'
          onClick={() => router.back()}
          className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-sm'
        >
          <ArrowLeft className='size-4' /> Quay lại
        </button>
        <p className='text-content-muted mt-8 text-sm'>
          Ad creative chưa có block nào để xem trước.
        </p>
      </div>
    );
  }

  return (
    <PreviewMode
      blocks={blocks}
      lang={lang}
      transition={transition}
      onClose={() => router.back()}
    />
  );
}
