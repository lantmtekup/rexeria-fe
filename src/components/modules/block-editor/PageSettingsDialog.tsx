'use client';

import * as React from 'react';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';

import { slugifyPageName, type EditorPage, type PageSeo } from './serialize';

interface PageSettingsDialogProps {
  page: EditorPage | null;
  /** Sibling slugs, used to warn before saving a duplicate. */
  siblings: EditorPage[];
  /** Public slug of the landing this template is published under, for the
   *  URL preview. Undefined while the template has no page yet. */
  rootSlug?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    patch: Partial<Pick<EditorPage, 'name' | 'slug' | 'seo'>>
  ) => void;
}

export function PageSettingsDialog({
  page,
  siblings,
  rootSlug,
  onOpenChange,
  onSave,
}: PageSettingsDialogProps) {
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [seo, setSeo] = React.useState<PageSeo>({});

  // Re-seed the form whenever a different page is opened.
  React.useEffect(() => {
    if (!page) return;
    setName(page.name);
    setSlug(page.slug);
    setSeo(page.seo ?? {});
  }, [page]);

  if (!page) return null;

  const normalizedSlug = slugifyPageName(slug);
  const duplicate =
    !page.isHome &&
    normalizedSlug.length > 0 &&
    siblings.some(p => p.id !== page.id && p.slug === normalizedSlug);

  const previewPath = page.isHome
    ? `/p/${rootSlug ?? '{slug}'}`
    : `/p/${rootSlug ?? '{slug}'}/${normalizedSlug || '…'}`;

  const handleSave = () => {
    onSave(page.id, {
      name: name.trim() || page.name,
      // The home page's slug is always '' — `normalizePages` enforces it, but
      // don't send a value that will just be overwritten.
      ...(page.isHome ? {} : { slug: normalizedSlug }),
      seo: Object.values(seo).some(Boolean) ? seo : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Cài đặt trang</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='page-name'>Tên trang</Label>
            <Input
              id='page-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Danh sách sản phẩm'
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='page-slug'>Đường dẫn</Label>
            <Input
              id='page-slug'
              value={page.isHome ? '' : slug}
              disabled={page.isHome}
              onChange={e => setSlug(e.target.value)}
              placeholder='san-pham'
            />
            <p className='text-content-muted text-2xs'>
              {page.isHome
                ? 'Trang chủ luôn nằm ở đường dẫn gốc.'
                : previewPath}
            </p>
            {duplicate && (
              <p className='text-2xs text-red-600'>
                Đường dẫn này đã có trang khác dùng — lưu sẽ tự thêm hậu tố.
              </p>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='page-seo-title'>Tiêu đề SEO</Label>
            <Input
              id='page-seo-title'
              value={seo.title ?? ''}
              onChange={e => setSeo(s => ({ ...s, title: e.target.value }))}
              placeholder={name || 'Để trống sẽ dùng tên trang'}
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='page-seo-desc'>Mô tả SEO</Label>
            <Textarea
              id='page-seo-desc'
              rows={2}
              value={seo.description ?? ''}
              onChange={e =>
                setSeo(s => ({ ...s, description: e.target.value }))
              }
            />
          </div>

          <div className='space-y-1.5'>
            <Label htmlFor='page-seo-og'>Ảnh chia sẻ (OG image)</Label>
            <Input
              id='page-seo-og'
              value={seo.ogImageUrl ?? ''}
              onChange={e =>
                setSeo(s => ({ ...s, ogImageUrl: e.target.value }))
              }
              placeholder='https://…'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='neutral'
            size='sm'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button size='sm' onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
