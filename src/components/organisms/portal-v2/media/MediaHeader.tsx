'use client';

import { Loader2, Plus, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { MEDIA_UPLOAD_INPUT_ID } from '@/lib/portal-v2/media/constants';
import { MOCK_STORAGE } from '@/lib/portal-v2/media/helpers';
import { cn } from '@/lib/cn';

type MediaHeaderProps = {
  assetCount: number;
  uploading: { done: number; total: number } | null;
  onAutoTag: () => void;
  onFiles: (files: FileList) => void;
};

export const MediaHeader = ({
  assetCount,
  uploading,
  onAutoTag,
  onFiles,
}: MediaHeaderProps) => {
  const t = useTranslations('portalV2.media');

  return (
    <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
        <div className='min-w-0'>
          <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
            {t('title')}
          </h1>
          <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('subtitle', {
              count: assetCount,
              usedPct: MOCK_STORAGE.usedPct,
              cap: MOCK_STORAGE.cap,
            })}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2 pb-0.5'>
          <Button variant='ghost' onClick={onAutoTag}>
            <Sparkles className='size-[15px]' strokeWidth={2.2} aria-hidden />
            {t('autoTag')}
          </Button>
          {/* <label> bọc TRỰC TIẾP <input> → click mở picker native, không
              cần JS .click(). `disabled:` của Button không áp lên <label>
              nên trạng thái uploading phải khoá bằng class tay. */}
          <Button
            asChild
            variant='primary'
            className={cn(uploading && 'pointer-events-none opacity-50')}
          >
            <label
              aria-label={t('uploadAria')}
              aria-busy={uploading ? true : undefined}
            >
              {uploading ? (
                <>
                  <Loader2
                    className='size-[15px] animate-spin'
                    strokeWidth={2.1}
                    aria-hidden
                  />
                  {t('uploadingLabel', {
                    done: uploading.done,
                    total: uploading.total,
                  })}
                </>
              ) : (
                <>
                  <Plus className='size-[15px]' strokeWidth={2.1} aria-hidden />
                  {t('upload')}
                </>
              )}
              <input
                id={MEDIA_UPLOAD_INPUT_ID}
                type='file'
                multiple
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                onChange={e => {
                  if (e.target.files) onFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
};
