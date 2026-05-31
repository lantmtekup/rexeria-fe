'use client';

/**
 * Admin template preview — `/admin/templates/[id]/preview`.
 *
 * Single-purpose: render visual preview overlay tự động khi mở route.
 * Đóng overlay (Esc / X) → quay về `/admin/templates`. Không có panel
 * schema / fallback — schema thuộc về `/admin/templates/[id]` detail
 * page, không phải preview route.
 *
 * Render priority:
 *  - BE `preview_html` (rendered mode) → iframe srcDoc
 *  - BE `preview_url` (live_stub mode) → iframe src
 *  - FE-side block renderer qua PreviewMode (fallback khi BE chưa ship
 *    server-side render — be-audit §15)
 *  - Template thumbnail (static mode)
 *  - "Chưa có nội dung" message
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

import { PreviewMode } from '@/components/modules/CanvasTemplate/block-editor/PreviewMode';
import { parseCanvas } from '@/components/modules/CanvasTemplate/block-editor/serialize';
import type { Block } from '@/components/modules/CanvasTemplate/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Template,
  TemplatePreviewResponse,
  TemplateVersion,
} from '@/services/rexer/types';

function adaptCanvasBlueprint(
  raw: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const blocks = Array.isArray((raw as { blocks?: unknown }).blocks)
    ? ((raw as { blocks: unknown[] }).blocks as unknown[])
    : [];
  return { schema_version: '2.0', blocks };
}

interface Props {
  templateId: string;
}

export function AdminTemplatePreviewPage({ templateId }: Props) {
  const router = useRouter();
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [version, setVersion] = React.useState<TemplateVersion | null>(null);
  const [preview, setPreview] = React.useState<TemplatePreviewResponse | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const feBlocks = React.useMemo<Block[] | null>(() => {
    if (!version?.canvas_blueprint) return null;
    const parsed = parseCanvas(adaptCanvasBlueprint(version.canvas_blueprint));
    return parsed?.blocks ?? null;
  }, [version]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [tplRes, prevRes] = await Promise.all([
          rexerApi.templates.get(templateId),
          rexerApi.templates.preview(templateId),
        ]);
        if (cancelled) return;
        setTemplate(tplRes.template);
        setPreview(prevRes);
        if (prevRes.version_id) {
          const v = await rexerApi.templates.version(
            templateId,
            prevRes.version_id
          );
          if (!cancelled) setVersion(v);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const handleClose = React.useCallback(() => {
    // Quay về list (or back history nếu có). Dùng router.back() nếu
    // history.length > 1, otherwise navigate /admin/templates.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/admin/templates');
    }
  }, [router]);

  // BE preview_html → render iframe directly
  if (preview?.mode === 'rendered' && preview.preview_html) {
    return (
      <div className='flex h-screen flex-col'>
        <PreviewHeader template={template} onClose={handleClose} />
        <iframe
          title={`${template?.name ?? 'Template'} preview`}
          srcDoc={preview.preview_html}
          sandbox='allow-same-origin'
          className='w-full flex-1 border-0 bg-white'
        />
      </div>
    );
  }

  if (preview?.mode === 'live_stub' && preview.preview_url) {
    return (
      <div className='flex h-screen flex-col'>
        <PreviewHeader template={template} onClose={handleClose} />
        <iframe
          title={`${template?.name ?? 'Template'} preview`}
          src={preview.preview_url}
          className='w-full flex-1 border-0 bg-white'
        />
      </div>
    );
  }

  // FE-side render — PreviewMode đã là fullscreen overlay với close handler.
  if (feBlocks && feBlocks.length > 0) {
    return <PreviewMode blocks={feBlocks} lang='vi' onClose={handleClose} />;
  }

  // Empty / error states — minimal full-screen message với back link.
  return (
    <div className='flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50 p-8'>
      <Link
        href='/admin/templates'
        className='absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-100'
      >
        <ArrowLeft className='size-3.5' />
        Templates
      </Link>
      {loading ? (
        <div className='inline-flex items-center gap-2 text-sm text-zinc-500'>
          <Loader2 className='size-4 animate-spin' />
          Đang tải preview…
        </div>
      ) : error ? (
        <div className='max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <AlertCircle className='mx-auto size-8 text-rose-600' />
          <p className='mt-3 text-[14px] font-semibold text-rose-900'>
            Không load được preview
          </p>
          <p className='mt-1 font-mono text-[11px] text-rose-700'>{error}</p>
        </div>
      ) : template?.thumbnail_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.thumbnail_url}
            alt={`${template.name} — thumbnail`}
            className='max-h-[80vh] max-w-[80vw] rounded-2xl border border-zinc-200 bg-white shadow-xl'
          />
          <p className='text-[12px] text-zinc-500'>
            Template chưa có canvas blocks. Hiển thị thumbnail.
          </p>
        </>
      ) : (
        <div className='max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center'>
          <p className='text-[14px] font-semibold text-zinc-700'>
            Template chưa có nội dung
          </p>
          <p className='mt-1 text-[12px] text-zinc-500'>
            Mở editor để thêm block trước khi preview.
          </p>
        </div>
      )}
    </div>
  );
}

function PreviewHeader({
  template,
  onClose,
}: {
  template: Template | null;
  onClose: () => void;
}) {
  return (
    <header className='flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2'>
      <button
        type='button'
        onClick={onClose}
        className='inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900'
      >
        <ArrowLeft className='size-3.5' />
        {template?.name ?? 'Preview'}
      </button>
      <span className='font-mono text-[10.5px] text-zinc-400'>
        {template?.code}
      </span>
    </header>
  );
}
