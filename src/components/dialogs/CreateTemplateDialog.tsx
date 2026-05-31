'use client';

/**
 * Admin "Tạo template mới" popup — `POST /v1/templates`.
 *
 * Canonical Template = shell + slot schema metadata. Canvas blocks live in
 * `template_versions.canvas_blueprint` (created separately via the version
 * editor, Wave 3). This dialog only ships the template shell — admin lands
 * on the detail page after create and adds a version from there.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { CreateTemplateRequest } from '@/services/rexer/types';

export interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreviewMode = NonNullable<CreateTemplateRequest['preview_mode']>;
type Status = NonNullable<CreateTemplateRequest['status']>;

const PREVIEW_MODES: { id: PreviewMode; label: string }[] = [
  { id: 'rendered', label: 'Rendered (HTML server-side)' },
  { id: 'static', label: 'Static (thumbnail only)' },
  { id: 'live_stub', label: 'Live stub (iframe URL)' },
];

// snake-kebab code: lowercase, starts with letter, 2-100 chars.
const CODE_RE = /^[a-z][a-z0-9_-]{1,99}$/;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
}: CreateTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [previewMode, setPreviewMode] = React.useState<PreviewMode>('rendered');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // Reset on open.
  React.useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setPreviewMode('rendered');
      setCategory('');
      setDescription('');
    }
  }, [open]);

  // Auto-suggest code from name (slug-ify).
  const handleNameChange = (v: string) => {
    setName(v);
    // Only auto-fill code if user hasn't manually edited it (or it matches
    // the previously-derived value).
    const slug = v
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
    setCode(prev => (prev === '' || prev === slugify(name) ? slug : prev));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const nameT = name.trim();
    const codeT = code.trim().toLowerCase();
    if (!nameT) {
      toast.error('Tên template không được rỗng');
      return;
    }
    if (!codeT) {
      toast.error('Code không được rỗng');
      return;
    }
    if (!CODE_RE.test(codeT)) {
      toast.error(
        'Code: lowercase, bắt đầu bằng chữ, 2-100 ký tự (a-z 0-9 - _)'
      );
      return;
    }

    const body: CreateTemplateRequest = {
      code: codeT,
      name: nameT,
      preview_mode: previewMode,
      status: 'draft' as Status,
      ...(category.trim() ? { category: category.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    setSubmitting(true);
    try {
      const created = await rexerApi.templates.create(body);
      toast.success(`Đã tạo template "${created.code}"`);
      onOpenChange(false);
      // Navigate to admin block editor — `/admin/landing-pages/[id]`
      // renders BlockEditor (WYSIWYG, add/edit blocks). Mirror của
      // `/canvas-templates/[id]` ở admin namespace.
      router.push(`/admin/landing-pages/${created.id}`);
    } catch (err) {
      toast.error(`Tạo thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Tạo template mới</DialogTitle>
          <DialogDescription>
            Tạo shell template ở canonical catalog. Sau khi tạo, bạn sẽ vào
            trang detail để add canvas blocks (version).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='ct-name'>
              Tên template <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='ct-name'
              autoFocus
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder='Landing Hero v2'
              maxLength={255}
              disabled={submitting}
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='ct-code'>
              Code <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='ct-code'
              value={code}
              onChange={e => setCode(e.target.value.toLowerCase())}
              placeholder='landing-hero-v2'
              maxLength={100}
              className='font-mono'
              disabled={submitting}
            />
            <p className='text-muted-foreground text-[11px]'>
              Auto-sinh từ tên. Slug duy nhất, không đổi được sau khi tạo.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='ct-mode'>
                Preview mode <span className='text-rose-600'>*</span>
              </Label>
              <select
                id='ct-mode'
                value={previewMode}
                onChange={e => setPreviewMode(e.target.value as PreviewMode)}
                disabled={submitting}
                className='border-input bg-background h-9 rounded-md border px-3 text-sm'
              >
                {PREVIEW_MODES.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='ct-cat'>Category</Label>
              <Input
                id='ct-cat'
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder='campaign-launch'
                maxLength={64}
                disabled={submitting}
              />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='ct-desc'>Mô tả</Label>
            <Textarea
              id='ct-desc'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder='Template làm gì, dùng khi nào…'
              disabled={submitting}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Tạo template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
