'use client';

import * as React from 'react';
import { Check, Copy, ExternalLink, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';

import type { PublishMeta } from './serialize';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  /** Optional slug of the Page being edited. When present, share URL uses
   *  canonical `/p/{slug}` form. */
  pageSlug?: string;
  /** Page UUID — present cùng pageSlug/pageName khi editor đang ở context
   *  của 1 page cụ thể. Dùng để hiển thị notice khi page chưa có slug. */
  pageId?: string;
  /** @deprecated 2026-05-31 — không dùng vì BE `UpdatePageRequest` không
   *  accept `slug` (be-audit §12). Slug chỉ set được khi CreatePage. */
  pageName?: string;
  /** @deprecated 2026-05-31 — kept for back-compat; no longer fires
   *  vì FE không thể đổi slug sau khi page tạo. */
  onPageSlugChange?: (slug: string) => void;
  publish: PublishMeta | undefined;
  onTogglePublish: () => void;
  onRotateToken: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  templateId,
  pageSlug,
  pageId,
  publish,
  onTogglePublish,
  onRotateToken,
}: PublishDialogProps) {
  void open;
  const [copied, setCopied] = React.useState(false);

  const url = React.useMemo(() => {
    if (!publish?.published) return '';
    if (typeof window === 'undefined') return '';
    if (pageSlug) {
      return `${window.location.origin}/p/${pageSlug}`;
    }
    if (!publish.shareToken) return '';
    return `${window.location.origin}/p/${templateId}/${publish.shareToken}`;
  }, [publish, templateId, pageSlug]);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Đã copy link');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không copy được — vui lòng copy thủ công');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Xuất bản & chia sẻ</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Khi xuất bản, mọi người có link đều xem được landing page này (chỉ
            đọc, không cần đăng nhập trên rexer).
          </p>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3'>
            <div>
              <p className='text-sm font-medium text-neutral-900'>
                Trạng thái:{' '}
                <span
                  className={
                    publish?.published ? 'text-emerald-600' : 'text-neutral-500'
                  }
                >
                  {publish?.published ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </p>
              {publish?.publishedAt && (
                <p className='text-[11px] text-neutral-500'>
                  Cập nhật: {new Date(publish.publishedAt).toLocaleString()}
                </p>
              )}
            </div>
            <Button
              variant={publish?.published ? 'outline' : 'pill'}
              size='sm'
              onClick={onTogglePublish}
            >
              {publish?.published ? 'Ngưng xuất bản' : 'Xuất bản'}
            </Button>
          </div>

          {/* Notice khi page chưa có slug — BE `UpdatePageRequest` không
              accept slug, chỉ set được lúc CreatePage. User phải tạo lại
              page với slug hoặc đợi BE ship slug PATCH (be-audit §12). */}
          {pageId && !pageSlug && (
            <div className='flex flex-col gap-1 rounded-md border border-amber-200 bg-amber-50 p-3'>
              <span className='text-[11px] font-semibold tracking-wide text-amber-900 uppercase'>
                Page chưa có slug
              </span>
              <p className='text-[11.5px] leading-snug text-amber-800'>
                Link chia sẻ đang dùng id + token (xấu). BE hiện chưa cho đổi
                slug sau khi tạo page — tạo lại page với slug rõ ràng, hoặc đợi
                BE ship slug PATCH (be-audit §12).
              </p>
            </div>
          )}

          {publish?.published && url && (
            <div className='flex flex-col gap-2'>
              <span className='text-[10px] font-semibold tracking-widest text-neutral-500 uppercase'>
                Link chia sẻ
              </span>
              <div className='flex items-center gap-2'>
                <input
                  readOnly
                  value={url}
                  onFocus={e => e.currentTarget.select()}
                  className='h-9 flex-1 rounded-md border border-neutral-200 bg-white px-3 font-mono text-xs text-neutral-700 outline-none'
                />
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Copy link'
                  onClick={handleCopy}
                  className='size-9'
                >
                  {copied ? (
                    <Check className='size-4 text-emerald-600' />
                  ) : (
                    <Copy className='size-4' />
                  )}
                </Button>
                <Button asChild variant='ghost' size='icon' className='size-9'>
                  <a href={url} target='_blank' rel='noreferrer'>
                    <ExternalLink className='size-4' />
                  </a>
                </Button>
              </div>
              {!pageSlug && (
                <button
                  type='button'
                  onClick={onRotateToken}
                  className='inline-flex w-fit cursor-pointer items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900'
                >
                  <RotateCcw className='size-3' />
                  Đổi link (vô hiệu hoá link cũ)
                </button>
              )}
              {pageSlug && (
                <p className='text-[11px] text-neutral-500'>
                  Link dùng slug của page. Đổi slug ở Settings của landing.
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
