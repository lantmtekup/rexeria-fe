'use client';

import * as React from 'react';
import { Check, Copy, ExternalLink, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

import type { PublishMeta } from './serialize';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  /** Optional slug of the Page being edited. When present, share URL uses
   *  canonical `/p/{slug}` form. */
  pageSlug?: string;
  /** Page UUID — present cùng pageSlug/pageName khi editor đang ở context
   *  của 1 page cụ thể. Khi page chưa có slug, dialog cho phép set slug
   *  inline qua `pages.update(pageId, {slug})`. */
  pageId?: string;
  /** Page name — dùng auto-suggest slug. */
  pageName?: string;
  /** Notify parent route khi slug đã được set, để re-resolve state. */
  onPageSlugChange?: (slug: string) => void;
  publish: PublishMeta | undefined;
  onTogglePublish: () => void;
  onRotateToken: () => void;
}

// slug rule: lowercase, alphanum + dash, 2-80 chars, không bắt đầu/end bằng dash.
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

export function PublishDialog({
  open,
  onOpenChange,
  templateId,
  pageSlug,
  pageId,
  pageName,
  onPageSlugChange,
  publish,
  onTogglePublish,
  onRotateToken,
}: PublishDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [slugDraft, setSlugDraft] = React.useState('');
  const [savingSlug, setSavingSlug] = React.useState(false);

  // Seed slug draft from page name when dialog opens for a slug-less page.
  React.useEffect(() => {
    if (open && pageId && !pageSlug) {
      setSlugDraft(pageName ? slugify(pageName) : '');
    }
  }, [open, pageId, pageSlug, pageName]);

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

  const handleSaveSlug = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!pageId) return;
    const value = slugDraft.trim().toLowerCase();
    if (
      value.length < SLUG_LEN.min ||
      value.length > SLUG_LEN.max ||
      !SLUG_RE.test(value)
    ) {
      toast.error(
        `Slug: ${SLUG_LEN.min}-${SLUG_LEN.max} ký tự, chỉ a-z 0-9 và dấu '-'`
      );
      return;
    }
    setSavingSlug(true);
    try {
      await rexerApi.pages.update(pageId, { slug: value });
      toast.success(`Đã đặt slug "${value}"`);
      onPageSlugChange?.(value);
    } catch (err) {
      toast.error(`Đặt slug thất bại: ${rxMessage(err)}`);
    } finally {
      setSavingSlug(false);
    }
  };

  const canSetSlug = !!pageId && !pageSlug;

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

          {/* Slug setter — only when we have a page UUID but no slug yet. */}
          {canSetSlug && (
            <form
              onSubmit={handleSaveSlug}
              className='flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3'
            >
              <span className='text-[11px] font-semibold tracking-wide text-amber-900 uppercase'>
                Đặt slug để có link thân thiện
              </span>
              <p className='text-[11.5px] leading-snug text-amber-800'>
                Hiện link chia sẻ dùng id + token. Đặt slug để link đổi thành{' '}
                <code className='font-mono'>/p/&#123;slug&#125;</code>.
              </p>
              <div className='flex items-center gap-2'>
                <Input
                  value={slugDraft}
                  onChange={e =>
                    setSlugDraft(
                      e.target.value.toLowerCase().replace(/\s+/g, '-')
                    )
                  }
                  placeholder='vd: tet-2026-thanh-cong'
                  maxLength={SLUG_LEN.max}
                  disabled={savingSlug}
                  className='h-8 font-mono text-xs'
                />
                <Button
                  type='submit'
                  size='sm'
                  disabled={
                    savingSlug || slugDraft.trim().length < SLUG_LEN.min
                  }
                >
                  {savingSlug && (
                    <Loader2 className='mr-1 size-3 animate-spin' />
                  )}
                  Lưu slug
                </Button>
              </div>
            </form>
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
