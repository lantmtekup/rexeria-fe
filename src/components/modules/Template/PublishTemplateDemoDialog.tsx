'use client';

/**
 * "Tạo link demo" — publish a template as a public `/p/:slug` landing page
 * without picking a brand/workspace: the page is created as a draft under
 * the shared internal Studio "Template Demos" workspace (see
 * `@/lib/templateDemoPage`). After creation the admin is routed to
 * `/admin/landing-pages/{id}`, the existing page editor, to actually publish
 * (Xuất bản) — this dialog only does the one-time bootstrap.
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
import {
  getOrCreateDemoWorkspace,
  setDemoPageMapping,
} from '@/lib/templateDemoPage';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Template } from '@/services/rexer/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  /** When true (Preview flow): publish immediately after create and open the
   *  resulting `/p/:slug` in a new tab, instead of routing to the page editor.
   *  Preview implies "show me the live thing now", not "start editing". */
  autoPublishAndOpen?: boolean;
}

// Same slug rule as PublishDialog.tsx: lowercase, alphanum + dash, 2-80 chars.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_LEN = { min: 2, max: 80 };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_LEN.max);
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function PublishTemplateDemoDialog({
  open,
  onOpenChange,
  template,
  autoPublishAndOpen,
}: Props) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !template) return;
    setName(template.name);
    setSlug(slugify(template.name));
  }, [open, template]);

  if (!template) return null;

  const slugError =
    slug.length > 0 && (slug.length < SLUG_LEN.min || !SLUG_RE.test(slug))
      ? `Slug phải là chữ thường/số, nối bằng dấu gạch ngang, tối thiểu ${SLUG_LEN.min} ký tự`
      : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const nameT = name.trim();
    if (!nameT) {
      toast.error('Tên landing không được rỗng');
      return;
    }
    if (slugError) {
      toast.error(slugError);
      return;
    }

    setSubmitting(true);
    try {
      const workspace = await getOrCreateDemoWorkspace();
      const page = await rexerApi.pages.create(workspace.id, {
        type: 'landing',
        template_id: template.id,
        name: nameT,
        ...(slug.trim() ? { slug: slug.trim() } : {}),
      });
      setDemoPageMapping(template.id, page.id, page.slug);

      if (autoPublishAndOpen) {
        await rexerApi.pages.publish(page.id);
        toast.success(`Đã tạo & xuất bản "${page.name}"`);
        onOpenChange(false);
        window.open(
          `${window.location.origin}/p/${page.slug}`,
          '_blank',
          'noopener,noreferrer'
        );
        return;
      }

      toast.success(`Đã tạo link demo "${page.name}"`);
      onOpenChange(false);
      router.push(`/admin/landing-pages/${page.id}`);
    } catch (err) {
      toast.error(`Tạo link demo thất bại: ${rxMessage(err)}`, {
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Tạo link demo</DialogTitle>
          <DialogDescription>
            Tạo một trang landing từ template{' '}
            <code className='text-content-muted font-mono'>
              {template.code}
            </code>{' '}
            để lấy link public chia sẻ — không thuộc brand khách hàng nào, chỉ
            dùng nội bộ.{' '}
            {autoPublishAndOpen
              ? 'Trang sẽ được xuất bản ngay và mở link ở tab mới.'
              : 'Sau khi tạo, bạn sẽ vào editor để bấm "Xuất bản".'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='demo-page-name'>
              Tên <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='demo-page-name'
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={200}
              autoFocus
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='demo-page-slug'>Slug (URL)</Label>
            <Input
              id='demo-page-slug'
              value={slug}
              onChange={e =>
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
              }
              placeholder='delvaux-luxury-demo'
              className='font-mono'
              maxLength={SLUG_LEN.max}
            />
            {slugError ? (
              <p className='text-2xs text-rose-600'>{slugError}</p>
            ) : (
              <p className='text-2xs text-content-muted'>
                Link: <span className='font-mono'>/p/{slug || '…'}</span>
              </p>
            )}
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
          <Button onClick={handleSubmit} disabled={submitting || !!slugError}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Tạo link demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
