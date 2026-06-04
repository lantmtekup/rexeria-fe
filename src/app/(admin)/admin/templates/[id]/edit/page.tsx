'use client';

/**
 * Admin template canvas editor — `/admin/templates/[id]/edit`.
 *
 * Reuses `BlockEditor` (the same component dùng cho landing pages) ở
 * "template-only" mode: chỉ pass `templateId`, KHÔNG pass `pageId` /
 * `pageSlug` / `pageStatus`. Khi không có page context:
 *  - publish dialog không hiện slug controls
 *  - publish toggle chỉ update blueprint.publish meta (không gọi
 *    pages.publish — không có page để publish)
 *  - autosave PATCH `templates/:id/draft-canvas-blueprint` (đúng vì
 *    template có chính draft buffer ở schema canonical)
 *  - Save Version create new TemplateVersion (như landing flow)
 *
 * Khác với `/admin/landing-pages/[id]` resolver (3-shape):
 * route này dành riêng cho template authoring, param luôn là template
 * UUID. Không lookup page, không resolve slug.
 *
 * Khi nào dùng route nào:
 *  - Tạo template mới (CreateTemplateDialog) → route này.
 *  - Edit landing page instance của brand → `/admin/landing-pages/{id}`.
 *  - Edit template's canvas độc lập (admin maintain catalog) → route này.
 */

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Code2, Eye, Loader2 } from 'lucide-react';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Template } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function AdminTemplateEditPage({ params }: PageProps) {
  const { id: rawId } = use(params);

  const [template, setTemplate] = React.useState<Template | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setError(null);
    setTemplate(null);

    (async () => {
      if (!UUID_RE.test(rawId)) {
        setError(`"${rawId}" không phải template UUID`);
        return;
      }
      try {
        const r = await rexerApi.templates.get(rawId);
        if (!cancelled) setTemplate(r.template);
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawId]);

  const templateId = template?.id ?? null;

  if (error) {
    return (
      <div className='bg-muted flex h-full flex-1 items-center justify-center p-8'>
        <div className='max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <AlertCircle className='mx-auto size-8 text-rose-600' />
          <p className='mt-3 text-sm font-semibold text-rose-900'>
            Không mở được editor template
          </p>
          <p className='text-2xs mt-1 font-mono text-rose-700'>{error}</p>
        </div>
      </div>
    );
  }

  if (!templateId) {
    return (
      <div className='text-content-muted flex h-full flex-1 items-center justify-center text-sm'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang load template…
      </div>
    );
  }

  // Code template — không có WYSIWYG editor, source ở repo. Show info
  // panel với path + link git + readonly preview link.
  const codeTpl = template ? getCodeTemplate(template.code) : null;
  if (codeTpl) {
    const fields = codeTpl.meta.contentSchema?.fields ?? [];
    return (
      <div className='mx-auto max-w-3xl space-y-5 p-8'>
        <Link
          href='/admin/templates'
          className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium'
        >
          <ArrowLeft className='size-3.5' /> Templates
        </Link>

        <div className='rounded-2xl border border-blue-200 bg-blue-50 p-5'>
          <div className='flex items-start gap-3'>
            <Code2 className='mt-0.5 size-5 shrink-0 text-blue-700' />
            <div className='flex-1'>
              <h2 className='text-sm font-semibold text-blue-900'>
                Code template — sửa source ở repo
              </h2>
              <p className='mt-1 text-xs leading-relaxed text-blue-800'>
                Template <code className='font-mono'>{template?.code}</code> là
                code-defined — content + animation lưu trong file TSX, không
                edit qua WYSIWYG. Sửa code → commit → deploy.
              </p>
            </div>
          </div>
          <div className='text-2xs text-content-muted mt-4 rounded-lg bg-white p-3 font-mono'>
            <p className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
              Source files
            </p>
            <ul className='mt-2 space-y-1'>
              <li>
                📁{' '}
                <span className='font-semibold'>
                  src/templates/{template?.code}/
                </span>
              </li>
              <li>　├── index.tsx — React component + animation</li>
              <li>　└── meta.ts — content schema (form fields)</li>
            </ul>
            <p className='text-3xs text-content-muted mt-3 font-semibold tracking-wider uppercase'>
              Registry
            </p>
            <p className='mt-1'>src/templates/registry.tsx</p>
          </div>
        </div>

        <div className='border-border rounded-2xl border bg-white p-5'>
          <h3 className='text-content-muted text-xs font-semibold tracking-wider uppercase'>
            Content fields ({fields.length})
          </h3>
          <p className='text-2xs text-content-muted mt-1'>
            Brand fill các field này khi tạo landing từ template (lưu vào{' '}
            <code className='font-mono'>page.type_metadata</code>).
          </p>
          {fields.length > 0 && (
            <ul className='mt-3 divide-y divide-zinc-100'>
              {fields.map(f => (
                <li
                  key={f.key}
                  className='flex items-start justify-between gap-3 py-2'
                >
                  <div className='min-w-0 flex-1'>
                    <code className='text-foreground font-mono text-xs font-semibold'>
                      {f.key}
                    </code>
                    <span className='text-2xs text-content-muted ml-2'>
                      — {f.label}
                    </span>
                    {f.hint && (
                      <p className='text-3xs text-content-muted mt-0.5'>
                        {f.hint}
                      </p>
                    )}
                  </div>
                  <div className='shrink-0 text-right'>
                    <p className='text-3xs text-content-muted font-mono'>
                      {f.type}
                      {f.required && (
                        <span className='ml-1 font-bold text-rose-600'>*</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className='flex justify-end gap-2'>
          <Link
            href={`/admin/templates/${templateId}/preview`}
            className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800'
          >
            <Eye className='size-3.5' />
            Xem preview
          </Link>
        </div>
      </div>
    );
  }

  // Block template — WYSIWYG editor (existing flow)
  return (
    <div className='flex h-full flex-1 flex-col'>
      <BlockEditor templateId={templateId} />
    </div>
  );
}
