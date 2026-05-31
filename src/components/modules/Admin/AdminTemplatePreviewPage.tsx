'use client';

/**
 * Admin template preview — `GET /v1/templates/{id}/preview`.
 *
 * Response per swagger `TemplatePreviewResponse`:
 *   { template_id, version_id, mode, preview_html?, preview_url?, preview_descriptor_json? }
 *
 * Render strategy by mode:
 *  - `rendered`   → iframe `srcDoc={preview_html}` sandboxed (no JS)
 *  - `live_stub`  → iframe `src={preview_url}` (BE-hosted stub URL)
 *  - `static`     → fallback to template.thumbnail_url
 */

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FileJson,
  Loader2,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
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
import { cn } from '@/lib/cn';

/**
 * BE `canvas_blueprint.schema_version` ở "1.0" — `parseCanvas` chỉ accept
 * "2.0" / legacy. Coerce wrapper schema_version, blocks shape đã 2.0-aligned
 * post BE fabric_to_blueprint converter (handoff §1.4).
 */
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
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [version, setVersion] = React.useState<TemplateVersion | null>(null);
  const [preview, setPreview] = React.useState<TemplatePreviewResponse | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [fePreviewing, setFePreviewing] = React.useState(false);

  // FE-side render fallback: parse version.canvas_blueprint → blocks array
  // dùng PreviewMode (same renderer used in editor). Hữu ích khi BE chưa
  // ship preview_html / preview_url server-side (be-audit §15 — `/p/`
  // renderer mới chỉ output placeholder primitive; preview endpoint cũng
  // chưa renderer canvas blocks).
  const feBlocks = React.useMemo<Block[] | null>(() => {
    if (!version?.canvas_blueprint) return null;
    const parsed = parseCanvas(adaptCanvasBlueprint(version.canvas_blueprint));
    return parsed?.blocks ?? null;
  }, [version]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, prevRes] = await Promise.all([
        rexerApi.templates.get(templateId),
        rexerApi.templates.preview(templateId),
      ]);
      setTemplate(tplRes.template);
      setPreview(prevRes);
      // Lazy-load full version (slot_schema + canvas_blueprint + default_config)
      // so fallback panel can show schema when BE doesn't render preview_html.
      if (prevRes.version_id) {
        rexerApi.templates
          .version(templateId, prevRes.version_id)
          .then(setVersion)
          .catch(() => {
            /* fallback panel just hides extra detail if version load fails */
          });
      }
    } catch (err) {
      setError(
        err instanceof RxApiError ? err.code || err.message : 'LOAD_FAILED'
      );
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading && !template) {
    return (
      <div className='flex items-center justify-center p-16 text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải preview…
      </div>
    );
  }

  if (error || !template || !preview) {
    return (
      <div className='mx-auto max-w-2xl p-8'>
        <Link
          href={`/admin/templates/${templateId}`}
          className='inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900'
        >
          <ArrowLeft className='size-3.5' /> Quay lại
        </Link>
        <div className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <p className='text-[14px] font-semibold text-rose-900'>
            Không load được preview
          </p>
          <p className='mt-1 font-mono text-[11px] text-rose-700'>
            {error || 'NOT_FOUND'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-[calc(100vh-3.5rem)] flex-col'>
      {/* Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-6 py-3'>
        <div className='flex items-center gap-3'>
          <Link
            href={`/admin/templates/${templateId}`}
            className='group inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900'
          >
            <ArrowLeft className='size-3.5' /> {template.name}
          </Link>
          <span className='text-zinc-300'>·</span>
          <code className='font-mono text-[11px] text-zinc-500'>
            {template.code}
          </code>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
              preview.mode === 'rendered'
                ? 'bg-emerald-100 text-emerald-700'
                : preview.mode === 'live_stub'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-zinc-100 text-zinc-600'
            )}
          >
            {preview.mode}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={load} disabled={loading}>
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Reload preview
          </Button>
          {feBlocks && feBlocks.length > 0 && (
            <Button size='sm' onClick={() => setFePreviewing(true)}>
              <Eye className='size-3.5' />
              Visual preview ({feBlocks.length} block)
            </Button>
          )}
          {preview.preview_url && (
            <Button asChild size='sm' variant='outline'>
              <a
                href={preview.preview_url}
                target='_blank'
                rel='noopener noreferrer'
              >
                <ExternalLink className='size-3.5' />
                BE preview URL
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview body */}
      <div className='flex flex-1 items-stretch bg-zinc-100'>
        <PreviewFrame
          template={template}
          preview={preview}
          version={version}
          feBlockCount={feBlocks?.length ?? 0}
          onOpenFePreview={() => setFePreviewing(true)}
        />
      </div>

      {fePreviewing && feBlocks && (
        <PreviewMode
          blocks={feBlocks}
          lang='vi'
          onClose={() => setFePreviewing(false)}
        />
      )}
    </div>
  );
}

function PreviewFrame({
  template,
  preview,
  version,
  feBlockCount,
  onOpenFePreview,
}: {
  template: Template;
  preview: TemplatePreviewResponse;
  version: TemplateVersion | null;
  feBlockCount: number;
  onOpenFePreview: () => void;
}) {
  if (preview.mode === 'rendered' && preview.preview_html) {
    return (
      <iframe
        title={`${template.name} — rendered preview`}
        srcDoc={preview.preview_html}
        sandbox='allow-same-origin'
        className='w-full border-0 bg-white'
      />
    );
  }
  if (preview.mode === 'live_stub' && preview.preview_url) {
    return (
      <iframe
        title={`${template.name} — live stub`}
        src={preview.preview_url}
        className='w-full border-0 bg-white'
      />
    );
  }
  if (preview.mode === 'static' && template.thumbnail_url) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.thumbnail_url}
          alt={`${template.name} — static preview`}
          className='max-h-full max-w-full rounded-lg border border-zinc-200 shadow-sm'
        />
      </div>
    );
  }
  // Fallback: BE chưa render preview_html/url + canvas_blueprint rỗng.
  // Show structured panel — admin biết template chứa schema + default gì.
  return (
    <StructuredFallback
      template={template}
      version={version}
      feBlockCount={feBlockCount}
      onOpenFePreview={onOpenFePreview}
    />
  );
}

function StructuredFallback({
  template,
  version,
  feBlockCount,
  onOpenFePreview,
}: {
  template: Template;
  version: TemplateVersion | null;
  feBlockCount: number;
  onOpenFePreview: () => void;
}) {
  const fields = extractFields(version?.field_schema_json);
  const defaults = (version?.default_config_json ?? {}) as Record<
    string,
    unknown
  >;
  const blockCount = countBlocks(version?.canvas_blueprint);
  const descriptor = version?.preview_descriptor_json as
    | Record<string, unknown>
    | undefined;

  return (
    <div className='mx-auto w-full max-w-3xl space-y-4 p-6'>
      {/* Notice banner — đỡ nhẹ vì FE render được */}
      <div className='flex items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4'>
        <div className='min-w-0 flex-1'>
          <p className='text-[13px] font-semibold text-amber-900'>
            BE chưa ship server-side render cho preview
          </p>
          <p className='mt-1 text-[11.5px] leading-relaxed text-amber-800'>
            Template có <code className='font-mono'>preview_mode</code> ={' '}
            <code className='font-mono'>{template.preview_mode}</code> nhưng
            response không trả <code className='font-mono'>preview_html</code>{' '}
            (be-audit §15 — `/p/{'{slug}'}` placeholder, preview endpoint cũng
            vậy). Canvas có{' '}
            <code className='font-mono'>{blockCount} block</code>.{' '}
            {feBlockCount > 0 ? (
              <>
                Tạm thời render <strong>client-side</strong> bằng cùng engine
                editor — bấm nút bên phải để mở visual preview.
              </>
            ) : (
              'Canvas rỗng — chỉ xem được schema bên dưới.'
            )}
          </p>
        </div>
        {feBlockCount > 0 && (
          <Button size='sm' onClick={onOpenFePreview} className='shrink-0'>
            <Eye className='size-3.5' />
            Visual preview
          </Button>
        )}
      </div>

      {/* Thumbnail */}
      {template.thumbnail_url && (
        <section className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'>
          <h3 className='mb-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            Thumbnail
          </h3>
          <div className='overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={template.thumbnail_url}
              alt={template.name}
              className='block w-full object-cover'
            />
          </div>
        </section>
      )}

      {/* Input fields schema */}
      <section className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'>
        <h3 className='mb-2 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
          <FileJson className='size-3' />
          Input fields ({fields.length})
        </h3>
        {fields.length === 0 ? (
          <p className='text-content-muted text-sm'>
            Template không khai báo input field nào.
          </p>
        ) : (
          <ul className='divide-y divide-zinc-100'>
            {fields.map(f => (
              <li
                key={f.key}
                className='flex items-start justify-between gap-3 py-2'
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <code className='font-mono text-[12.5px] font-semibold text-zinc-900'>
                      {f.key}
                    </code>
                    {f.required && (
                      <span className='rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-rose-700 uppercase'>
                        required
                      </span>
                    )}
                  </div>
                  <p className='mt-0.5 font-mono text-[10.5px] text-zinc-500'>
                    type: {f.type}
                  </p>
                </div>
                <div className='shrink-0 text-right'>
                  <p className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
                    default
                  </p>
                  <code className='font-mono text-[11.5px] text-zinc-700'>
                    {formatDefault(defaults[f.key])}
                  </code>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Preview descriptor */}
      {descriptor && Object.keys(descriptor).length > 0 && (
        <section className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'>
          <h3 className='mb-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            Preview descriptor
          </h3>
          <pre className='overflow-x-auto rounded-md bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700'>
            {JSON.stringify(descriptor, null, 2)}
          </pre>
        </section>
      )}

      {/* Raw default config */}
      {Object.keys(defaults).length > 0 && (
        <section className='rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'>
          <h3 className='mb-2 text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
            default_config_json
          </h3>
          <pre className='overflow-x-auto rounded-md bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700'>
            {JSON.stringify(defaults, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

interface FieldSpec {
  key: string;
  type: string;
  required: boolean;
}

function extractFields(
  fieldSchema: Record<string, unknown> | undefined
): FieldSpec[] {
  if (!fieldSchema) return [];
  const raw = (fieldSchema as { fields?: unknown }).fields;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((f): f is Record<string, unknown> => !!f && typeof f === 'object')
    .map(f => ({
      key: String(f.key ?? ''),
      type: String(f.type ?? 'text'),
      required: !!f.required,
    }))
    .filter(f => f.key.length > 0);
}

function countBlocks(
  canvasBlueprint: Record<string, unknown> | undefined
): number {
  if (!canvasBlueprint) return 0;
  const blocks = (canvasBlueprint as { blocks?: unknown }).blocks;
  return Array.isArray(blocks) ? blocks.length : 0;
}

function formatDefault(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v.length > 40 ? v.slice(0, 40) + '…' : v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 40 ? s.slice(0, 40) + '…' : s;
  } catch {
    return String(v);
  }
}
