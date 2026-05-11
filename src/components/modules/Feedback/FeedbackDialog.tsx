'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { ImageIcon, XIcon } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Button } from '@/components/atoms/button';
import { Textarea } from '@/components/atoms/textarea';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { cn } from '@/lib/cn';
import type {
  FeedbackCategory,
  FeedbackSeverity,
} from '@/services/rexer/types';

const CATEGORIES: FeedbackCategory[] = [
  'bug',
  'improvement',
  'question',
  'praise',
  'other',
];
const SEVERITIES: FeedbackSeverity[] = ['low', 'medium', 'high', 'critical'];
const RATING_VALUES = [1, 2, 3, 4, 5] as const;

const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 20;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

const APP_VERSION =
  process.env.NEXT_PUBLIC_APP_VERSION ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  'dev';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations('feedback');
  const tErrors = useTranslations('errors');

  const [category, setCategory] = React.useState<FeedbackCategory>('bug');
  const [severity, setSeverity] = React.useState<FeedbackSeverity>('medium');
  const [rating, setRating] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState('');
  const [screenshotFile, setScreenshotFile] = React.useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = React.useState<
    string | null
  >(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Reset state on close so each open is a fresh form.
  React.useEffect(() => {
    if (!open) {
      setCategory('bug');
      setSeverity('medium');
      setRating(null);
      setMessage('');
      setScreenshotFile(null);
      setScreenshotPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setError(null);
      setSubmitting(false);
      setSuccess(false);
    }
  }, [open]);

  // Revoke object URL when preview changes / unmounts.
  React.useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const showSeverity = category === 'bug';
  const showRating = category === 'praise' || category === 'improvement';
  const messageLengthError = message.trim().length < MIN_MESSAGE;

  const handleFile = (file: File | null) => {
    if (!file) {
      setScreenshotFile(null);
      setScreenshotPreview(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError('FEEDBACK_SCREENSHOT_TOO_LARGE');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('FEEDBACK_SCREENSHOT_INVALID_TYPE');
      return;
    }
    setError(null);
    setScreenshotFile(file);
    setScreenshotPreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  /**
   * Two-step Media upload (no project/product binding needed for feedback):
   *   1. POST /v1/media/uploads/init     → upload_id + (optional) presigned_url
   *   2. PUT  presigned_url OR /uploads/{id}/raw
   *   3. POST /v1/media/uploads/complete → MediaAsset
   */
  const uploadScreenshot = async (file: File): Promise<string> => {
    const init = await rexerApi.media.initUpload({
      filename: file.name,
      mime_type: file.type || 'image/png',
      file_size: file.size,
      owner_scope: 'library',
      media_type: 'image',
    });
    if (init.presigned_url) {
      const res = await fetch(init.presigned_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/png' },
        body: file,
      });
      if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
    } else {
      await rexerApi.media.uploadRaw(init.upload_id, file);
    }
    const completed = await rexerApi.media.completeUpload({
      upload_id: init.upload_id,
    });
    return completed.media_asset.id;
  };

  const handleSubmit = async () => {
    if (messageLengthError) {
      setError('FEEDBACK_MESSAGE_TOO_SHORT');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      let screenshotId: string | undefined;
      if (screenshotFile) {
        screenshotId = await uploadScreenshot(screenshotFile);
      }
      await rexerApi.feedback.create({
        category,
        ...(showSeverity ? { severity } : {}),
        ...(showRating && rating ? { rating } : {}),
        message: message.trim(),
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        app_version: APP_VERSION,
        ...(screenshotId ? { screenshot_id: screenshotId } : {}),
        meta: {
          locale: document.documentElement.lang || 'vi',
          referrer: document.referrer || undefined,
        },
      });
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err) {
      const code =
        err instanceof RxApiError
          ? err.code || err.message
          : 'FEEDBACK_SUBMIT_FAILED';
      setError(code);
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = error
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(error);
        } catch {
          return error;
        }
      })()
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('subtitle')}</DialogDescription>
        </DialogHeader>

        {success ? (
          <p className='text-foreground py-6 text-center text-sm'>
            {t('successMessage')}
          </p>
        ) : (
          <div className='flex flex-col gap-4'>
            {/* Category */}
            <div className='flex flex-col gap-2'>
              <label className='text-foreground text-sm font-medium'>
                {t('categoryLabel')}
              </label>
              <div className='flex flex-wrap gap-2'>
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type='button'
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition',
                      category === c
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background hover:bg-neutral-50'
                    )}
                  >
                    {t(`category.${c}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity (bugs only) */}
            {showSeverity && (
              <div className='flex flex-col gap-2'>
                <label className='text-foreground text-sm font-medium'>
                  {t('severityLabel')}
                </label>
                <div className='flex flex-wrap gap-2'>
                  {SEVERITIES.map(s => (
                    <button
                      key={s}
                      type='button'
                      onClick={() => setSeverity(s)}
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-xs transition',
                        severity === s
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-neutral-50'
                      )}
                    >
                      {t(`severity.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating (praise / improvement only) */}
            {showRating && (
              <div className='flex flex-col gap-2'>
                <label className='text-foreground text-sm font-medium'>
                  {t('ratingLabel')}
                </label>
                <div className='flex gap-2'>
                  {RATING_VALUES.map(v => (
                    <button
                      key={v}
                      type='button'
                      onClick={() => setRating(v)}
                      className={cn(
                        'size-9 rounded-md border text-sm transition',
                        rating === v
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:bg-neutral-50'
                      )}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            <div className='flex flex-col gap-2'>
              <label className='text-foreground text-sm font-medium'>
                {t('messageLabel')}
              </label>
              <Textarea
                rows={5}
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t('messagePlaceholder')}
              />
              <div className='text-content-muted flex justify-between text-xs'>
                <span>{t('messageMinHint', { min: MIN_MESSAGE })}</span>
                <span>
                  {message.length}/{MAX_MESSAGE}
                </span>
              </div>
            </div>

            {/* Screenshot */}
            <div className='flex flex-col gap-2'>
              <label className='text-foreground text-sm font-medium'>
                {t('screenshotLabel')}
              </label>
              {screenshotPreview ? (
                <div className='border-border relative w-fit rounded-md border p-2'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={screenshotPreview}
                    alt='Screenshot preview'
                    className='max-h-32 rounded'
                  />
                  <button
                    type='button'
                    onClick={() => handleFile(null)}
                    className='bg-background border-border absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border shadow-sm'
                    aria-label={t('screenshotRemove')}
                  >
                    <XIcon className='size-3' />
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='border-border text-content-muted flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm hover:bg-neutral-50'
                >
                  <ImageIcon className='size-4' />
                  {t('screenshotAdd')}
                </button>
              )}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {errorMessage && (
              <p className='text-destructive text-xs' role='alert'>
                {errorMessage}
              </p>
            )}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('cancel')}
            </Button>
            <Button
              variant='primary'
              onClick={handleSubmit}
              disabled={submitting || messageLengthError}
            >
              {submitting ? t('submitting') : t('submit')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
