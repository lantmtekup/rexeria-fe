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
   *  của 1 page cụ thể. Cho dialog set slug inline qua
   *  pages.update(pageId, {slug}). */
  pageId?: string;
  /** Page name — dùng auto-suggest slug khi user chưa đặt. */
  pageName?: string;
  /** template_version_id mà page đang pin (BE field). Khi diverge khỏi
   *  template's HEAD version → public render render version cũ. Banner
   *  cảnh báo user (be-audit §13). */
  pinnedVersionId?: string;
  /** HEAD version trong template (resolved upstream). */
  headVersionId?: string;
  /** Version label của HEAD để hiển thị. */
  headVersionLabel?: string;
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
  pinnedVersionId,
  headVersionId,
  headVersionLabel,
  onPageSlugChange,
  publish,
  onTogglePublish,
  onRotateToken,
}: PublishDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [slugDraft, setSlugDraft] = React.useState('');
  const [editingSlug, setEditingSlug] = React.useState(false);
  const [savingSlug, setSavingSlug] = React.useState(false);

  // Seed slug draft khi dialog mở:
  //   - Có sẵn slug → seed = slug (cho user đổi)
  //   - Không có slug → seed = slugify(name)
  React.useEffect(() => {
    if (open && pageId) {
      setSlugDraft(pageSlug || (pageName ? slugify(pageName) : ''));
      setEditingSlug(!pageSlug); // auto-open form khi chưa có slug
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
        `Slug: ${SLUG_LEN.min}-${SLUG_LEN.max} ký tự, lowercase, chỉ a-z 0-9 và dấu '-'`
      );
      return;
    }
    setSavingSlug(true);
    try {
      const updated = await rexerApi.pages.update(pageId, { slug: value });
      // Verify BE actually persisted — guard chống regression nếu BE
      // silently drop lại (đã từng xảy ra trước be-audit §12 fix).
      if (updated.slug !== value) {
        throw new Error(
          `BE không persist slug (response: "${updated.slug}"). BE drop field?`
        );
      }
      toast.success(`Đã đặt slug "${value}"`);
      onPageSlugChange?.(value);
      setEditingSlug(false);
    } catch (err) {
      toast.error(`Đặt slug thất bại: ${rxMessage(err)}`);
    } finally {
      setSavingSlug(false);
    }
  };

  // Show slug controls whenever we have a page context. Form has 2 modes:
  // collapsed (current slug + Đổi) and expanded (input + Lưu / Huỷ).
  const showSlugCtrl = !!pageId;

  // Stale version detect: page.template_version_id (BE) vs template HEAD.
  // BE chưa cho FE đổi page.template_version_id → public render render
  // version cũ (be-audit §13). Warn user nếu diverge.
  const versionStale =
    !!pinnedVersionId && !!headVersionId && pinnedVersionId !== headVersionId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Xuất bản & chia sẻ</DialogTitle>
          <p className='text-sm text-neutral-500'>
            Khi xuất bản, mọi người có link đều xem được trang này (chỉ đọc,
            không cần đăng nhập trên rexer).
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
                <p className='text-2xs text-neutral-500'>
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

          {/* Slug controls — luôn hiện khi có pageId. BE ship PATCH slug
              2026-05-31 (be-audit §12 resolved); slug đổi được bất cứ
              lúc nào, URL /p/{slug} update theo. */}
          {showSlugCtrl && !editingSlug && pageSlug && (
            <div className='flex items-center justify-between gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2'>
              <div className='min-w-0 flex-1'>
                <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                  Slug
                </p>
                <code className='block truncate font-mono text-xs text-neutral-800'>
                  {pageSlug}
                </code>
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setEditingSlug(true)}
              >
                Đổi
              </Button>
            </div>
          )}
          {showSlugCtrl && editingSlug && (
            <form
              onSubmit={handleSaveSlug}
              className='flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3'
            >
              <span className='text-2xs font-semibold tracking-wide text-amber-900 uppercase'>
                {pageSlug ? 'Đổi slug' : 'Đặt slug để có link thân thiện'}
              </span>
              <p className='text-2xs leading-snug text-amber-800'>
                {pageSlug ? (
                  <>
                    Đổi slug sẽ vô hiệu hoá link cũ. URL mới:{' '}
                    <code className='font-mono'>/p/{slugDraft || '…'}</code>.
                  </>
                ) : (
                  <>
                    Đặt slug để URL chia sẻ thành{' '}
                    <code className='font-mono'>/p/&#123;slug&#125;</code> thay
                    vì id + token.
                  </>
                )}
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
                  Lưu
                </Button>
                {pageSlug && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled={savingSlug}
                    onClick={() => {
                      setEditingSlug(false);
                      setSlugDraft(pageSlug);
                    }}
                  >
                    Huỷ
                  </Button>
                )}
              </div>
            </form>
          )}

          {versionStale && (
            <div className='flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3'>
              <span className='text-3xs mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-200 font-mono font-bold text-amber-900'>
                i
              </span>
              <div className='text-2xs leading-snug text-amber-900'>
                <strong className='font-semibold'>Page pin ở version cũ</strong>{' '}
                — page hiện ở{' '}
                <code className='font-mono'>
                  {pinnedVersionId?.slice(0, 8)}
                </code>
                , editor đã commit lên{' '}
                <code className='font-mono'>
                  {headVersionLabel ?? headVersionId?.slice(0, 8)}
                </code>
                . Click <strong>Xuất bản lại</strong> để repoint page sang
                version mới + re-snapshot. Sau publish,{' '}
                <code>/p/{pageSlug || '{slug}'}</code> sẽ render content mới
                nhất.
              </div>
            </div>
          )}

          {publish?.published && url && (
            <div className='flex flex-col gap-2'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
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
                  className='text-2xs inline-flex w-fit cursor-pointer items-center gap-1 text-neutral-500 hover:text-neutral-900'
                >
                  <RotateCcw className='size-3' />
                  Đổi link (vô hiệu hoá link cũ)
                </button>
              )}
              {pageSlug && (
                <p className='text-2xs text-neutral-500'>
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
