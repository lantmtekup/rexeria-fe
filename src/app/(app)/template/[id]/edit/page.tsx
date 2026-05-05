'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Spinner } from '@/components/atoms/spinner';
import { Textarea } from '@/components/atoms/textarea';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Template } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const PREVIEW_MODES = ['static', 'rendered', 'live_stub'] as const;
const STATUSES = ['draft', 'active', 'archived'] as const;

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function TemplateEditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [template, setTemplate] = React.useState<Template | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [thumbnail, setThumbnail] = React.useState('');
  const [previewMode, setPreviewMode] =
    React.useState<(typeof PREVIEW_MODES)[number]>('rendered');
  const [status, setStatus] =
    React.useState<(typeof STATUSES)[number]>('active');

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    rexerApi.templates
      .get(id)
      .then(res => {
        if (!alive) return;
        const t = res.template;
        setTemplate(t);
        setName(t.name ?? '');
        setDescription(t.description ?? '');
        setCategory(t.category ?? '');
        setTags((t.tags ?? []).join(', '));
        setThumbnail(t.thumbnail_url ?? '');
        if ((PREVIEW_MODES as readonly string[]).includes(t.preview_mode)) {
          setPreviewMode(t.preview_mode as (typeof PREVIEW_MODES)[number]);
        }
        if ((STATUSES as readonly string[]).includes(t.status)) {
          setStatus(t.status as (typeof STATUSES)[number]);
        }
      })
      .catch(err => {
        if (!alive) return;
        toast.error(`Failed to load template: ${rxErrorMessage(err)}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagList = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
      await rexerApi.templates.update(id, {
        name: name.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        tags: tagList.length ? tagList : undefined,
        thumbnail_url: thumbnail.trim() || undefined,
        preview_mode: previewMode,
        status,
      });
      toast.success('Template saved');
      router.push(`/template/${id}`);
    } catch (err) {
      toast.error(`Save failed: ${rxErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='text-muted-foreground flex h-full items-center justify-center'>
        <Spinner size={20} />
      </div>
    );
  }

  if (!template) {
    return (
      <div className='mx-auto max-w-md py-16 text-center'>
        <p className='text-muted-foreground text-sm'>
          Template not found or has been archived.
        </p>
        <Button asChild variant='outline' size='sm' className='mt-4'>
          <Link href='/template'>
            <ArrowLeft className='size-3.5' /> Back to templates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-[720px] px-6 py-6'>
      <div className='mb-4 flex items-center gap-2 text-xs'>
        <Link
          href={`/template/${id}`}
          className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1'
        >
          <ArrowLeft className='size-3.5' /> Back to preview
        </Link>
      </div>

      <h1 className='text-foreground mb-1 text-2xl font-semibold tracking-[-0.02em]'>
        Edit template
      </h1>
      <p className='text-muted-foreground mb-6 text-sm'>
        Update metadata for{' '}
        <code className='font-mono text-xs'>{template.code}</code>. Schema +
        scene editing chuyển qua Canvas designer (Phase 2).
      </p>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='t-name'>Name</Label>
          <Input
            id='t-name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='Landing Hero v1'
            maxLength={255}
            disabled={saving}
            required
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='t-desc'>Description</Label>
          <Textarea
            id='t-desc'
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='What this template is for, when to use it…'
            disabled={saving}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='t-cat'>Category</Label>
            <Input
              id='t-cat'
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder='landing, fashion, tech…'
              maxLength={64}
              disabled={saving}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='t-tags'>Tags (comma-separated)</Label>
            <Input
              id='t-tags'
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder='hero, launch, featured'
              disabled={saving}
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='t-thumb'>Thumbnail URL</Label>
          <Input
            id='t-thumb'
            type='url'
            value={thumbnail}
            onChange={e => setThumbnail(e.target.value)}
            placeholder='https://cdn.../thumbnail.png'
            maxLength={512}
            disabled={saving}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='t-preview'>Preview mode</Label>
            <select
              id='t-preview'
              value={previewMode}
              onChange={e =>
                setPreviewMode(e.target.value as (typeof PREVIEW_MODES)[number])
              }
              disabled={saving}
              className='border-input bg-background h-10 rounded-md border px-3 text-sm'
            >
              {PREVIEW_MODES.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='t-status'>Status</Label>
            <select
              id='t-status'
              value={status}
              onChange={e =>
                setStatus(e.target.value as (typeof STATUSES)[number])
              }
              disabled={saving}
              className='border-input bg-background h-10 rounded-md border px-3 text-sm'
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mt-2 flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push(`/template/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type='submit' variant='primary' disabled={saving}>
            <Save className='size-3.5' />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
