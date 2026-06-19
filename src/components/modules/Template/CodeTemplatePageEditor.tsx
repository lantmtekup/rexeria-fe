'use client';

/**
 * Editor cho landing page instance dùng code template.
 *
 * Khác BlockEditor (WYSIWYG canvas drag/drop): code template không có
 * canvas — brand customize qua form các field từ `meta.contentSchema`.
 * Lưu vào `page.type_metadata` (BE accept ở UpdatePageRequest).
 *
 * Layout: split screen
 *   - Trái: form fields generated từ contentSchema
 *   - Phải: live preview render template với current form values
 */

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, ExternalLink, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Page, Template } from '@/services/rexer/types';
import { getCodeTemplate } from '@/templates/registry';
import type { TemplateContentField, TemplateMeta } from '@/templates/types';

interface Props {
  page: Page;
  template: Template;
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

/** Build initial form values: page.type_metadata overlays defaults. */
function initialValues(
  meta: TemplateMeta,
  page: Page
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of meta.contentSchema?.fields ?? []) {
    if (f.default !== undefined) out[f.key] = f.default;
  }
  if (page.type_metadata && typeof page.type_metadata === 'object') {
    Object.assign(out, page.type_metadata as Record<string, unknown>);
  }
  return out;
}

export function CodeTemplatePageEditor({ page, template }: Props) {
  // Hooks declared trước mọi early return (rules-of-hooks).
  const tpl = getCodeTemplate(template.code);
  const meta = tpl?.meta;

  const [values, setValues] = React.useState<Record<string, unknown>>(() =>
    meta ? initialValues(meta, page) : {}
  );
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [pageSlug, setPageSlug] = React.useState(page.slug);

  // Group fields theo `field.group` để render section. Fields không có
  // group rơi vào 'Content' default group.
  const grouped = React.useMemo(() => {
    const map = new Map<string, TemplateContentField[]>();
    for (const f of meta?.contentSchema?.fields ?? []) {
      const g = f.group ?? 'Content';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(f);
    }
    return Array.from(map.entries());
  }, [meta]);

  if (!tpl || !meta) {
    // Sanity guard — caller should have checked getCodeTemplate.
    return (
      <div className='text-destructive p-8 text-sm'>
        Template {template.code} không phải code template, không render editor
        này.
      </div>
    );
  }
  const Component = tpl.Component;

  const handleField = (key: string, value: unknown) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await rexerApi.pages.update(page.id, {
        type_metadata: values as Record<string, unknown>,
      });
      // BE auto-derive slug from name nên slug có thể đổi nếu tên đổi —
      // capture lại để link preview đúng.
      if (updated.slug) setPageSlug(updated.slug);
      toast.success('Đã lưu content');
      setDirty(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='bg-muted flex h-full min-h-0 flex-1 flex-col'>
      {/* Header */}
      <header className='border-border bg-background flex items-center justify-between gap-3 border-b px-4 py-2.5'>
        <div className='flex items-center gap-3'>
          <Link
            href='/admin/landing-pages'
            className='text-content-muted hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium'
          >
            <ArrowLeft className='size-3.5' /> Landing pages
          </Link>
          <span className='text-muted-foreground'>·</span>
          <span className='text-foreground text-sm font-semibold'>
            {page.name}
          </span>
          <span className='text-3xs inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 font-bold tracking-wider text-blue-700 uppercase'>
            <Code2 className='size-3' />
            code · {template.code}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          {pageSlug && (
            <Button asChild variant='outline' size='sm'>
              <a href={`/p/${pageSlug}`} target='_blank' rel='noreferrer'>
                <ExternalLink className='size-3.5' />
                Mở /p/{pageSlug}
              </a>
            </Button>
          )}
          <Button size='sm' onClick={handleSave} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Save className='size-3.5' />
            )}
            {dirty ? 'Lưu thay đổi' : 'Đã lưu'}
          </Button>
        </div>
      </header>

      {/* Body — split: form trái, preview phải */}
      <div className='flex min-h-0 flex-1'>
        {/* Form panel */}
        <aside className='border-border bg-background w-[380px] shrink-0 overflow-y-auto border-r'>
          {grouped.map(([group, fields]) => (
            <section key={group} className='border-border border-b p-4'>
              <h3 className='text-3xs text-content-muted mb-3 font-semibold tracking-[0.18em] uppercase'>
                {group}
              </h3>
              <div className='flex flex-col gap-3'>
                {fields.map(f => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    value={values[f.key]}
                    onChange={v => handleField(f.key, v)}
                  />
                ))}
              </div>
            </section>
          ))}
          <div className='p-4'>
            <p className='text-2xs text-content-muted'>
              Source code:{' '}
              <code className='font-mono'>src/templates/{template.code}/</code>
            </p>
          </div>
        </aside>

        {/* Preview panel — live render với form values */}
        <main className='min-w-0 flex-1 overflow-auto'>
          <div className='@container origin-top scale-[0.7] sm:scale-[0.8]'>
            <Component page={page} content={values} mode='preview' />
          </div>
        </main>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateContentField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${field.key}`;
  return (
    <div className='flex flex-col gap-1.5'>
      <Label htmlFor={id} className='text-2xs'>
        {field.label}
        {field.required && <span className='text-destructive ml-1'>*</span>}
      </Label>
      {(() => {
        switch (field.type) {
          case 'longText':
            return (
              <Textarea
                id={id}
                value={(value as string) ?? ''}
                onChange={e => onChange(e.target.value)}
                rows={3}
                className='text-xs'
              />
            );
          case 'boolean':
            return (
              <label className='text-content-muted inline-flex items-center gap-2 text-xs'>
                <input
                  id={id}
                  type='checkbox'
                  checked={!!value}
                  onChange={e => onChange(e.target.checked)}
                  className='border-border size-3.5 rounded'
                />
                Bật
              </label>
            );
          case 'number':
            return (
              <Input
                id={id}
                type='number'
                value={(value as number | string | undefined) ?? ''}
                onChange={e =>
                  onChange(
                    e.target.value === '' ? undefined : Number(e.target.value)
                  )
                }
                className='text-xs'
              />
            );
          case 'select':
            return (
              <select
                id={id}
                value={(value as string) ?? ''}
                onChange={e => onChange(e.target.value)}
                className='border-input bg-background h-9 rounded-md border px-3 text-xs'
              >
                {field.options?.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
          case 'image':
          case 'url':
          case 'text':
          default:
            return (
              <Input
                id={id}
                type={field.type === 'url' ? 'url' : 'text'}
                value={(value as string) ?? ''}
                onChange={e => onChange(e.target.value)}
                placeholder={field.type === 'image' ? 'https://...' : undefined}
                className='text-xs'
              />
            );
        }
      })()}
      {field.hint && (
        <p className='text-3xs text-content-muted'>{field.hint}</p>
      )}
    </div>
  );
}
