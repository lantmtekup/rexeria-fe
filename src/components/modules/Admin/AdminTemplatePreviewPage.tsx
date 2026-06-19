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
import { AlertCircle, ArrowLeft, Loader2, Pencil } from 'lucide-react';

import { PreviewMode } from '@/components/modules/block-editor/PreviewMode';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Page,
  Template,
  TemplatePreviewResponse,
  TemplateVersion,
} from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';

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
  /** Canvas blueprint chọn theo precedence editor: draft → HEAD →
   *  currentVerId. Lưu raw object, parse trong useMemo. */
  const [activeBlueprint, setActiveBlueprint] = React.useState<Record<
    string,
    unknown
  > | null>(null);
  /** Label hiển thị (vd "v1.0.2", "draft"). Debug + show ở header. */
  const [activeSource, setActiveSource] = React.useState<string>('');
  const [preview, setPreview] = React.useState<TemplatePreviewResponse | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const feBlocks = React.useMemo<Block[] | null>(() => {
    if (!activeBlueprint) return null;
    const parsed = parseCanvas(adaptCanvasBlueprint(activeBlueprint));
    return parsed?.blocks ?? null;
  }, [activeBlueprint]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Load template + preview parallel. Preview để check
        // BE-rendered HTML branch (rendered/live_stub mode); content
        // chính cho FE-render đến từ template's draft / HEAD version,
        // KHÔNG dùng preview.version_id (BE serve current_version_id,
        // stale sau createVersion vì BE không auto-bump per §13).
        const [tplRes, prevRes] = await Promise.all([
          rexerApi.templates.get(templateId),
          rexerApi.templates.preview(templateId).catch(() => null),
        ]);
        if (cancelled) return;
        setTemplate(tplRes.template);
        if (prevRes) setPreview(prevRes);

        // Precedence giống BlockEditor load chain:
        //   1. tpl.draft_canvas_blueprint (real-time autosaved)
        //   2. HEAD version (max version_no)
        //   3. current_version_id (fallback)
        if (tplRes.template.draft_canvas_blueprint) {
          setActiveBlueprint(tplRes.template.draft_canvas_blueprint);
          setActiveSource('draft (autosaved)');
          return;
        }

        // No draft — load HEAD.
        let headVer: TemplateVersion | null = null;
        try {
          const versList = await rexerApi.templates.versions(templateId);
          headVer = (versList.items ?? []).reduce<TemplateVersion | null>(
            (max, v) =>
              !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
            null
          );
        } catch {
          /* versions list failed — fall back to current_version_id */
        }
        if (cancelled) return;

        const targetVerId =
          headVer?.id ??
          tplRes.template.current_version_id ??
          prevRes?.version_id;
        if (targetVerId) {
          const v = await rexerApi.templates.version(templateId, targetVerId);
          if (!cancelled && v.canvas_blueprint) {
            setActiveBlueprint(v.canvas_blueprint);
            setActiveSource(`v${v.version}`);
          }
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

  // Code template — registry lookup theo `template.code`. Có entry →
  // render TSX component với defaults từ meta.contentSchema (admin
  // preview, không có brand-specific content). Priority cao nhất —
  // bỏ qua BE preview_html + canvas_blueprint.
  const codeTpl = template ? getCodeTemplate(template.code) : null;
  if (codeTpl) {
    const defaults: Record<string, unknown> = {};
    codeTpl.meta.contentSchema?.fields.forEach(f => {
      if (f.default !== undefined) defaults[f.key] = f.default;
    });
    // Synthesize minimal Page object cho preview (admin chưa có page
    // instance — code template render với defaults).
    const dummyPage: Page = {
      id: template!.id,
      brand_id: '',
      workspace_id: '',
      slug: template!.code,
      name: template!.name,
      type: 'landing',
      type_metadata: {},
      status: 'draft',
      template_version_id: '',
      freeze_products: false,
      created_by: '',
      updated_by: '',
      created_at: template!.created_at,
      updated_at: template!.updated_at,
    };
    const Comp = codeTpl.Component;
    return (
      <div className='relative min-h-screen'>
        <div className='fixed top-3 right-3 z-[60] flex items-center gap-2'>
          <span className='text-3xs rounded-full bg-zinc-900/80 px-2.5 py-0.5 font-medium tracking-wide text-white backdrop-blur'>
            code template · {template!.code}
          </span>
          <Link
            href={`/admin/templates/${templateId}/edit`}
            className='text-2xs inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-3 py-1 font-medium text-white backdrop-blur hover:bg-zinc-800/80'
          >
            <Pencil className='size-3' />
            Edit source
          </Link>
          <button
            type='button'
            onClick={handleClose}
            className='text-2xs inline-flex items-center gap-1 rounded-full bg-zinc-900/80 px-3 py-1 font-medium text-white backdrop-blur hover:bg-zinc-800/80'
          >
            <ArrowLeft className='size-3' />
            Đóng
          </button>
        </div>
        <Comp page={dummyPage} content={defaults} mode='preview' />
      </div>
    );
  }

  // BE preview_html → render iframe directly
  if (preview?.mode === 'rendered' && preview.preview_html) {
    return (
      <div className='flex h-screen flex-col'>
        <PreviewHeader template={template} onClose={handleClose} />
        <iframe
          title={`${template?.name ?? 'Template'} preview`}
          srcDoc={preview.preview_html}
          sandbox='allow-same-origin'
          className='bg-background w-full flex-1 border-0'
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
          className='bg-background w-full flex-1 border-0'
        />
      </div>
    );
  }

  // FE-side render — PreviewMode đã là fullscreen overlay với close handler.
  if (feBlocks && feBlocks.length > 0) {
    return (
      <>
        {/* Overlays trên PreviewMode header — source badge + edit button.
            Cùng z-[60] để vượt PreviewMode (z-50). Edit CTA: dẫn user
            sang block editor khi muốn sửa content. (Code field immutable,
            metadata khác sửa qua /admin/templates/{id} detail.) */}
        <div className='fixed top-3 right-44 z-[60] flex items-center gap-2'>
          <span className='text-3xs rounded-full bg-white/10 px-2.5 py-0.5 font-medium tracking-wide text-white/70 backdrop-blur'>
            {activeSource}
          </span>
          <Link
            href={`/admin/templates/${templateId}/edit`}
            className='text-2xs inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 font-medium text-white backdrop-blur transition-colors hover:bg-white/25'
          >
            <Pencil className='size-3' />
            Edit canvas
          </Link>
        </div>
        <PreviewMode blocks={feBlocks} lang='vi' onClose={handleClose} />
      </>
    );
  }

  // Empty / error states — minimal full-screen message với back link.
  return (
    <div className='bg-muted flex h-screen flex-col items-center justify-center gap-4 p-8'>
      <Link
        href='/admin/templates'
        className='border-border text-content-muted hover:bg-muted bg-background absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium'
      >
        <ArrowLeft className='size-3.5' />
        Templates
      </Link>
      {loading ? (
        <div className='text-content-muted inline-flex items-center gap-2 text-sm'>
          <Loader2 className='size-4 animate-spin' />
          Đang tải preview…
        </div>
      ) : error ? (
        <div className='border-destructive/20 bg-danger-bg max-w-md rounded-2xl border p-6 text-center'>
          <AlertCircle className='text-destructive mx-auto size-8' />
          <p className='text-destructive mt-3 text-sm font-semibold'>
            Không load được preview
          </p>
          <p className='text-2xs text-destructive mt-1 font-mono'>{error}</p>
        </div>
      ) : template?.thumbnail_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={template.thumbnail_url}
            alt={`${template.name} — thumbnail`}
            className='border-border bg-background max-h-[80vh] max-w-[80vw] rounded-2xl border shadow-xl'
          />
          <p className='text-content-muted text-xs'>
            Template chưa có canvas blocks. Hiển thị thumbnail.
          </p>
        </>
      ) : (
        <div className='border-border bg-card max-w-md rounded-2xl border p-8 text-center'>
          <p className='text-content-muted text-sm font-semibold'>
            Template chưa có nội dung
          </p>
          <p className='text-content-muted mt-1 text-xs'>
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
    <header className='border-border bg-background flex items-center justify-between gap-3 border-b px-4 py-2'>
      <button
        type='button'
        onClick={onClose}
        className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium'
      >
        <ArrowLeft className='size-3.5' />
        {template?.name ?? 'Preview'}
      </button>
      <span className='text-3xs text-muted-foreground font-mono'>
        {template?.code}
      </span>
    </header>
  );
}
