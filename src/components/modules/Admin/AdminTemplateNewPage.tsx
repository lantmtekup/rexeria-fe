'use client';

/**
 * Admin create new template — `POST /v1/templates`.
 *
 * Body required per swagger `CreateTemplateRequest`:
 *   code, name, preview_mode
 * Optional: status, description, category, tags[], thumbnail_url
 *
 * Versions + canvas blueprint are created separately via
 * `POST /v1/templates/{id}/versions` after the template shell exists.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { CreateTemplateRequest } from '@/services/rexer/types';

type PreviewMode = NonNullable<CreateTemplateRequest['preview_mode']>;
type Status = NonNullable<CreateTemplateRequest['status']>;

const PREVIEW_MODES: { id: PreviewMode; label: string; hint: string }[] = [
  { id: 'static', label: 'Static', hint: 'Thumbnail tĩnh (image only)' },
  { id: 'rendered', label: 'Rendered', hint: 'Render HTML server-side' },
  { id: 'live_stub', label: 'Live stub', hint: 'Iframe URL preview' },
];

const STATUSES: { id: Status; label: string }[] = [
  { id: 'draft', label: 'Draft (chưa publish)' },
  { id: 'active', label: 'Active (brand thấy được)' },
  { id: 'archived', label: 'Archived' },
];

// snake-case-friendly code: lowercase letters, digits, dash, underscore. 2-100 chars.
const CODE_RE = /^[a-z][a-z0-9_-]{1,99}$/;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function AdminTemplateNewPage() {
  const router = useRouter();
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>('rendered');
  const [status, setStatus] = React.useState<Status>('draft');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tagsText, setTagsText] = React.useState('');
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const codeT = code.trim().toLowerCase();
    const nameT = name.trim();
    if (!codeT) {
      toast.error('Code không được rỗng');
      return;
    }
    if (!CODE_RE.test(codeT)) {
      toast.error(
        'Code phải lowercase, bắt đầu bằng chữ, 2–100 ký tự (a-z 0-9 - _)'
      );
      return;
    }
    if (!nameT) {
      toast.error('Tên template không được rỗng');
      return;
    }

    const tags = tagsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const body: CreateTemplateRequest = {
      code: codeT,
      name: nameT,
      preview_mode: previewMode,
      status,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
      ...(tags.length > 0 ? { tags } : {}),
      ...(thumbnailUrl.trim() ? { thumbnail_url: thumbnailUrl.trim() } : {}),
    };

    setSubmitting(true);
    try {
      const created = await rexerApi.templates.create(body);
      toast.success(`Đã tạo template "${created.code}"`);
      router.push(`/admin/templates/${created.id}`);
    } catch (err) {
      toast.error(`Tạo thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='mx-auto flex max-w-3xl flex-col gap-5 p-6'>
      <Link
        href='/admin/templates'
        className='group inline-flex items-center gap-2 self-start rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 shadow-sm transition-all hover:-translate-x-0.5 hover:border-zinc-900 hover:text-zinc-900'
      >
        <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-0.5' />
        Templates
      </Link>

      <div>
        <div className='text-[10.5px] font-semibold tracking-[0.18em] text-zinc-500 uppercase'>
          Tạo template
        </div>
        <h1 className='mt-1 text-2xl font-semibold tracking-tight'>
          Template mới
        </h1>
        <p className='text-content-muted mt-1 text-sm'>
          Tạo shell template ở canonical catalog. Sau đó upload version (canvas
          blueprint, slot schema) ở trang detail.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className='flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm'
      >
        {/* Code */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='tpl-code'>
            Code <span className='text-rose-600'>*</span>
          </Label>
          <Input
            id='tpl-code'
            value={code}
            onChange={e => setCode(e.target.value.toLowerCase())}
            placeholder='landing-hero-v2'
            className='font-mono'
            maxLength={100}
          />
          <p className='text-muted-foreground text-[11px]'>
            Slug duy nhất, không đổi được sau khi tạo. Vd:{' '}
            <code className='font-mono'>landing-hero-v1</code>.
          </p>
        </div>

        {/* Name + Category */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='tpl-name'>
              Tên hiển thị <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='tpl-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Landing Hero v2'
              maxLength={255}
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='tpl-category'>Category</Label>
            <Input
              id='tpl-category'
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder='campaign-launch'
              maxLength={64}
            />
          </div>
        </div>

        {/* Description */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='tpl-desc'>Mô tả</Label>
          <Textarea
            id='tpl-desc'
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder='Single-hero landing for campaign launches…'
          />
        </div>

        {/* Preview mode + Status */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='tpl-preview-mode'>
              Preview mode <span className='text-rose-600'>*</span>
            </Label>
            <select
              id='tpl-preview-mode'
              value={previewMode}
              onChange={e => setPreviewMode(e.target.value as PreviewMode)}
              className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            >
              {PREVIEW_MODES.map(m => (
                <option key={m.id} value={m.id}>
                  {m.label} — {m.hint}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='tpl-status'>Status</Label>
            <select
              id='tpl-status'
              value={status}
              onChange={e => setStatus(e.target.value as Status)}
              className='border-input bg-background h-9 rounded-md border px-3 text-sm'
            >
              {STATUSES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags + Thumbnail */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='tpl-tags'>Tags</Label>
          <Input
            id='tpl-tags'
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
            placeholder='campaign, hero, mobile-first'
          />
          <p className='text-muted-foreground text-[11px]'>
            Phân cách bằng dấu phẩy.
          </p>
        </div>

        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='tpl-thumb'>Thumbnail URL</Label>
          <Input
            id='tpl-thumb'
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            placeholder='https://cdn.example.com/templates/landing-hero.jpg'
            maxLength={512}
          />
        </div>

        <div className='mt-2 flex items-center justify-end gap-2 border-t border-zinc-100 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/templates')}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button type='submit' disabled={submitting}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Tạo template
          </Button>
        </div>
      </form>
    </div>
  );
}
