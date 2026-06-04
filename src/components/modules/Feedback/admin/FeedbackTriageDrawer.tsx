'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

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
import type { Feedback, FeedbackStatus } from '@/services/rexer/types';

const STATUSES: FeedbackStatus[] = [
  'new',
  'triaged',
  'in_progress',
  'resolved',
  'wontfix',
];

interface Props {
  feedback: Feedback | null;
  onClose: () => void;
  onUpdated: (f: Feedback) => void;
}

export function FeedbackTriageDrawer({ feedback, onClose, onUpdated }: Props) {
  const t = useTranslations('feedback');
  const tErrors = useTranslations('errors');

  const [status, setStatus] = React.useState<FeedbackStatus>('new');
  const [note, setNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (feedback) {
      setStatus(feedback.status);
      setNote(feedback.internal_note ?? '');
      setError(null);
    }
  }, [feedback]);

  if (!feedback) return null;

  const dirty =
    status !== feedback.status || note !== (feedback.internal_note ?? '');

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await rexerApi.adminFeedback.update(feedback.id, {
        ...(status !== feedback.status ? { status } : {}),
        ...(note !== (feedback.internal_note ?? '')
          ? { internal_note: note }
          : {}),
      });
      onUpdated(res.feedback);
    } catch (err) {
      const code =
        err instanceof RxApiError ? err.code || err.message : 'SAVE_FAILED';
      setError(code);
    } finally {
      setSaving(false);
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
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {feedback.title || feedback.message.slice(0, 80)}
          </DialogTitle>
          <DialogDescription>
            {new Date(feedback.created_at).toLocaleString()} ·{' '}
            {t(`category.${feedback.category}`)}
            {feedback.severity
              ? ` · ${t(`severity.${feedback.severity}`)}`
              : ''}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          {/* Message */}
          <div>
            <label className='text-content-muted text-xs font-medium'>
              {t('messageLabel')}
            </label>
            <p className='mt-1 text-sm whitespace-pre-wrap'>
              {feedback.message}
            </p>
          </div>

          {/* Context */}
          <div className='grid grid-cols-2 gap-3 text-xs'>
            <KV label={t('admin.detail.user')} value={feedback.user_id} />
            <KV
              label={t('admin.detail.appVersion')}
              value={feedback.app_version}
            />
            <KV
              label={t('admin.detail.pageUrl')}
              value={
                <a
                  href={feedback.page_url}
                  target='_blank'
                  rel='noreferrer'
                  className='text-primary truncate hover:underline'
                >
                  {feedback.page_url}
                </a>
              }
            />
            {feedback.rating != null && (
              <KV label={t('ratingLabel')} value={`${feedback.rating} / 5`} />
            )}
          </div>

          {feedback.user_agent && (
            <div className='text-xs'>
              <label className='text-content-muted font-medium'>
                {t('admin.detail.userAgent')}
              </label>
              <p className='text-2xs mt-1 truncate font-mono'>
                {feedback.user_agent}
              </p>
            </div>
          )}

          {feedback.meta && Object.keys(feedback.meta).length > 0 && (
            <div className='text-xs'>
              <label className='text-content-muted font-medium'>
                {t('admin.detail.meta')}
              </label>
              <pre className='text-2xs mt-1 overflow-x-auto rounded bg-neutral-50 p-2 font-mono'>
                {JSON.stringify(feedback.meta, null, 2)}
              </pre>
            </div>
          )}

          {/* Status editor */}
          <div className='border-border border-t pt-4'>
            <label className='text-foreground text-sm font-medium'>
              {t('admin.detail.statusLabel')}
            </label>
            <div className='mt-2 flex flex-wrap gap-2'>
              {STATUSES.map(s => (
                <button
                  key={s}
                  type='button'
                  onClick={() => setStatus(s)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs transition',
                    status === s
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-neutral-50'
                  )}
                >
                  {t(`admin.status.${s}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Internal note */}
          <div>
            <label className='text-foreground text-sm font-medium'>
              {t('admin.detail.noteLabel')}
            </label>
            <Textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('admin.detail.notePlaceholder')}
              className='mt-1'
            />
          </div>

          {errorMessage && (
            <p className='text-destructive text-xs' role='alert'>
              {errorMessage}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={saving}>
            {t('cancel')}
          </Button>
          <Button
            variant='primary'
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? t('admin.saving') : t('admin.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className='text-content-muted block font-medium'>{label}</span>
      <span className='block truncate'>{value || '—'}</span>
    </div>
  );
}
