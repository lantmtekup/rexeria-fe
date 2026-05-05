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
  publish: PublishMeta | undefined;
  onTogglePublish: () => void;
  onRotateToken: () => void;
}

export function PublishDialog({
  open,
  onOpenChange,
  templateId,
  publish,
  onTogglePublish,
  onRotateToken,
}: PublishDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const url = React.useMemo(() => {
    if (!publish?.published || !publish.shareToken) return '';
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/p/${templateId}/${publish.shareToken}`;
  }, [publish, templateId]);

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
              <button
                type='button'
                onClick={onRotateToken}
                className='inline-flex w-fit cursor-pointer items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900'
              >
                <RotateCcw className='size-3' />
                Đổi link (vô hiệu hoá link cũ)
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
