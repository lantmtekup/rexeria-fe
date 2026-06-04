'use client';

/**
 * Admin template detail — `GET /v1/templates/{id}` (+ current_version) +
 * `GET /v1/templates/{id}/versions` (list all versions).
 *
 * Composition:
 *  - Header: status chip, target_page_type chip, name, code, copy-id
 *  - Body grid: metadata card | current version card
 *  - Versions list at bottom with publish history
 *  - Edit metadata via PATCH (inline simple fields) — version edit lives in a
 *    follow-up page (canvas blueprint editor not migrated yet).
 */

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Check,
  Copy,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
  Template,
  TemplateVersion,
  UpdateTemplateRequest,
} from '@/services/rexer/types';
import { cn } from '@/lib/cn';

const STATUS_CHIP: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-zinc-200 text-zinc-600',
};

const PAGE_TYPE_CHIP: Record<string, string> = {
  landing: 'bg-rose-50 text-rose-700 border-rose-200',
  ad: 'bg-amber-50 text-amber-700 border-amber-200',
  curate: 'bg-violet-50 text-violet-700 border-violet-200',
  email: 'bg-blue-50 text-blue-700 border-blue-200',
};

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

interface Props {
  templateId: string;
}

export function AdminTemplateDetailPage({ templateId }: Props) {
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [currentVersion, setCurrentVersion] =
    React.useState<TemplateVersion | null>(null);
  const [versions, setVersions] = React.useState<TemplateVersion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, versionsRes] = await Promise.all([
        rexerApi.templates.get(templateId),
        rexerApi.templates.versions(templateId).catch(() => ({ items: [] })),
      ]);
      setTemplate(tplRes.template);
      setCurrentVersion(tplRes.current_version ?? null);
      setVersions(versionsRes.items ?? []);
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

  const copyId = () => {
    navigator.clipboard.writeText(templateId).then(
      () => {
        setCopied(true);
        toast.success('Đã copy template ID');
        window.setTimeout(() => setCopied(false), 1200);
      },
      () => toast.error('Copy thất bại')
    );
  };

  if (loading && !template) {
    return (
      <div className='flex items-center justify-center p-16 text-sm text-zinc-500'>
        <Loader2 className='mr-2 size-4 animate-spin' /> Đang tải…
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className='mx-auto max-w-2xl p-8'>
        <Link
          href='/admin/templates'
          className='inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900'
        >
          <ArrowLeft className='size-3.5' /> Quay lại
        </Link>
        <div className='mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center'>
          <p className='text-sm font-semibold text-rose-900'>
            Không load được template
          </p>
          <p className='text-2xs mt-1 font-mono text-rose-700'>
            {error || 'NOT_FOUND'}
          </p>
        </div>
      </div>
    );
  }

  const statusChip = STATUS_CHIP[template.status] ?? STATUS_CHIP.archived;
  const pageTypeChip = template.target_page_type
    ? (PAGE_TYPE_CHIP[template.target_page_type] ??
      'bg-zinc-100 text-zinc-700 border-zinc-200')
    : null;

  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-5 p-6'>
      <Link
        href='/admin/templates'
        className='group inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900 hover:text-zinc-900'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        Templates
      </Link>

      {/* Header */}
      <section className='relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm'>
        <div className='flex flex-wrap items-start gap-5 p-6 sm:p-7'>
          <div className='aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200'>
            {template.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex h-full items-center justify-center text-zinc-300'>
                <Pencil className='size-8' />
              </div>
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='truncate text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl'>
                {template.name}
              </h1>
              <span
                className={cn(
                  'text-3xs rounded-full px-2 py-0.5 font-bold tracking-wider uppercase',
                  statusChip
                )}
              >
                {template.status}
              </span>
              {template.target_page_type && (
                <span
                  className={cn(
                    'text-3xs rounded-full border px-2 py-0.5 font-bold tracking-wider uppercase',
                    pageTypeChip
                  )}
                >
                  {template.target_page_type}
                </span>
              )}
            </div>
            <button
              type='button'
              onClick={copyId}
              className='group mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 hover:text-zinc-900'
              title='Click để copy template ID'
            >
              <span className='font-semibold'>{template.code}</span>
              <span className='text-zinc-400'>·</span>
              <span>{template.id}</span>
              {copied ? (
                <Check className='size-3 text-emerald-600' />
              ) : (
                <Copy className='size-3 text-zinc-400 group-hover:text-zinc-700' />
              )}
            </button>
            {template.description && (
              <p className='mt-2 text-sm leading-relaxed text-zinc-600'>
                {template.description}
              </p>
            )}
            <div className='text-2xs mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500'>
              <span className='inline-flex items-center gap-1.5'>
                <Calendar className='size-3' />
                Cập nhật{' '}
                {new Date(template.updated_at).toLocaleDateString('vi-VN')}
              </span>
              <span className='inline-flex items-center gap-1.5'>
                <Eye className='size-3' />
                Preview mode:{' '}
                <code className='font-mono'>{template.preview_mode}</code>
              </span>
              {template.category && (
                <span className='inline-flex items-center gap-1.5'>
                  <Tag className='size-3' />
                  {template.category}
                </span>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={load}
              disabled={loading}
            >
              <RefreshCw
                className={cn('size-3.5', loading && 'animate-spin')}
              />
              Refresh
            </Button>
            <Button asChild size='sm' variant='outline'>
              <Link href={`/admin/templates/${templateId}/preview`}>
                <Eye className='size-3.5' />
                Preview
              </Link>
            </Button>
            <Button asChild size='sm'>
              <Link href={`/admin/templates/${templateId}/edit`}>
                <Pencil className='size-3.5' />
                Mở editor
              </Link>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setEditing(true)}
              disabled={editing}
            >
              <Pencil className='size-3.5' />
              Edit
            </Button>
          </div>
        </div>
      </section>

      {editing && (
        <EditMetaSection
          template={template}
          onCancel={() => setEditing(false)}
          onSaved={updated => {
            setTemplate(updated);
            setEditing(false);
            toast.success('Đã cập nhật');
          }}
        />
      )}

      {/* Current version */}
      <section className='rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
        <h2 className='text-sm font-semibold text-zinc-900'>Current version</h2>
        {currentVersion ? (
          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Field label='Version' value={currentVersion.version} mono />
            <Field
              label='Schema version'
              value={currentVersion.schema_version}
              mono
            />
            <Field
              label='Renderer key'
              value={currentVersion.renderer_key ?? '—'}
              mono
            />
            <Field
              label='Created'
              value={new Date(currentVersion.created_at).toLocaleString(
                'vi-VN'
              )}
            />
            {currentVersion.change_note && (
              <div className='sm:col-span-2'>
                <p className='text-3xs font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
                  Change note
                </p>
                <p className='mt-1 text-sm leading-relaxed text-zinc-700'>
                  {currentVersion.change_note}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className='text-content-muted mt-2 text-sm'>
            Chưa có version nào. Tạo version đầu tiên qua{' '}
            <code className='font-mono'>
              POST /v1/templates/{templateId}/versions
            </code>
            .
          </p>
        )}
      </section>

      {/* Versions list */}
      <section className='rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <h2 className='text-sm font-semibold text-zinc-900'>
            Tất cả version ({versions.length})
          </h2>
        </div>
        {versions.length === 0 ? (
          <div className='px-5 py-8 text-center text-sm text-zinc-500'>
            Chưa có version nào.
          </div>
        ) : (
          <ul>
            {versions.map(v => {
              const isCurrent = v.id === template.current_version_id;
              return (
                <li
                  key={v.id}
                  className='flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-3 last:border-0 hover:bg-zinc-50/50'
                >
                  <div>
                    <div className='flex items-center gap-2'>
                      <code className='font-mono text-sm font-semibold text-zinc-900'>
                        {v.version}
                      </code>
                      {isCurrent && (
                        <span className='text-3xs rounded-full bg-emerald-100 px-1.5 py-0.5 font-bold tracking-wider text-emerald-700 uppercase'>
                          current
                        </span>
                      )}
                      <span className='text-zinc-400'>·</span>
                      <code className='text-2xs font-mono text-zinc-500'>
                        {v.schema_version}
                      </code>
                    </div>
                    {v.change_note && (
                      <p className='mt-0.5 text-xs text-zinc-600'>
                        {v.change_note}
                      </p>
                    )}
                  </div>
                  <div className='text-3xs text-right font-mono text-zinc-400'>
                    {new Date(v.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className='text-3xs font-semibold tracking-[0.18em] text-zinc-400 uppercase'>
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-sm text-zinc-800',
          mono && 'font-mono text-xs'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EditMetaSection({
  template,
  onCancel,
  onSaved,
}: {
  template: Template;
  onCancel: () => void;
  onSaved: (t: Template) => void;
}) {
  const [name, setName] = React.useState(template.name);
  const [description, setDescription] = React.useState(template.description);
  const [category, setCategory] = React.useState(template.category ?? '');
  const [tagsText, setTagsText] = React.useState(
    (template.tags ?? []).join(', ')
  );
  const [thumbnailUrl, setThumbnailUrl] = React.useState(
    template.thumbnail_url ?? ''
  );
  const [status, setStatus] = React.useState<'draft' | 'active' | 'archived'>(
    template.status as 'draft' | 'active' | 'archived'
  );
  const [previewMode, setPreviewMode] = React.useState<
    'static' | 'rendered' | 'live_stub'
  >(template.preview_mode as 'static' | 'rendered' | 'live_stub');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSave = async () => {
    const tags = tagsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const body: UpdateTemplateRequest = {
      name: name.trim() || undefined,
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      tags,
      thumbnail_url: thumbnailUrl.trim() || undefined,
      status,
      preview_mode: previewMode,
    };
    setSubmitting(true);
    try {
      const updated = await rexerApi.templates.update(template.id, body);
      onSaved(updated);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className='flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm'>
      <h2 className='text-sm font-semibold text-zinc-900'>Sửa metadata</h2>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='ed-name'>Tên</Label>
          <Input
            id='ed-name'
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='ed-cat'>Category</Label>
          <Input
            id='ed-cat'
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='ed-desc'>Mô tả</Label>
        <Textarea
          id='ed-desc'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='ed-status'>Status</Label>
          <select
            id='ed-status'
            value={status}
            onChange={e =>
              setStatus(e.target.value as 'draft' | 'active' | 'archived')
            }
            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
          >
            <option value='draft'>Draft</option>
            <option value='active'>Active</option>
            <option value='archived'>Archived</option>
          </select>
        </div>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='ed-preview'>Preview mode</Label>
          <select
            id='ed-preview'
            value={previewMode}
            onChange={e =>
              setPreviewMode(
                e.target.value as 'static' | 'rendered' | 'live_stub'
              )
            }
            className='border-input bg-background h-9 rounded-md border px-3 text-sm'
          >
            <option value='static'>Static</option>
            <option value='rendered'>Rendered</option>
            <option value='live_stub'>Live stub</option>
          </select>
        </div>
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='ed-tags'>Tags (phân cách dấu phẩy)</Label>
        <Input
          id='ed-tags'
          value={tagsText}
          onChange={e => setTagsText(e.target.value)}
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='ed-thumb'>Thumbnail URL</Label>
        <Input
          id='ed-thumb'
          value={thumbnailUrl}
          onChange={e => setThumbnailUrl(e.target.value)}
        />
      </div>
      <div className='flex items-center justify-end gap-2 border-t border-zinc-100 pt-3'>
        <Button variant='outline' onClick={onCancel} disabled={submitting}>
          Huỷ
        </Button>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
          Lưu thay đổi
        </Button>
      </div>
    </section>
  );
}
