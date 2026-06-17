'use client';

/**
 * Brand-portal "Create workspace" dialog. Now fires `POST /portal/workspaces`
 * — brand-scoped endpoint that auto-derives `brand_id` from the session,
 * so the FE no longer needs to pass it. Falls back gracefully if BE still
 * has an outdated build (admin endpoint with explicit clientId) by 403'ing.
 */

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Workspace as BEWorkspace } from '@/services/rexer/types';

interface Props {
  open: boolean;
  /** Brand the workspace will belong to — usually `user.brand_id`. */
  clientId: string | null | undefined;
  onClose: () => void;
  /** Fires when BE returns 201; parent refreshes list + can switch. */
  onCreated: (ws: BEWorkspace) => void;
}

/** kebab-case slug suggestion from the workspace name. */
function suggestSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function CreateWorkspaceDialog({
  open,
  clientId,
  onClose,
  onCreated,
}: Props) {
  const t = useTranslations('portal');
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset whenever the dialog re-opens so previous attempts don't bleed in.
  React.useEffect(() => {
    if (open) {
      setName('');
      setSlug('');
      setDescription('');
      setSlugTouched(false);
      setError(null);
    }
  }, [open]);

  // Auto-suggest slug while the user types, unless they've manually edited it.
  React.useEffect(() => {
    if (slugTouched) return;
    setSlug(suggestSlug(name));
  }, [name, slugTouched]);

  if (!open) return null;

  const canSubmit =
    !!clientId &&
    name.trim().length > 0 &&
    slug.trim().length > 0 &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError(t('createWorkspaceDialog.errNoClient'));
      return;
    }
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const ws = await rexerApi.portal.createWorkspace({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
      });
      toast.success(t('createWorkspaceDialog.createdToast', { name: ws.name }));
      onCreated(ws);
      onClose();
    } catch (err) {
      const status = err instanceof RxApiError ? err.status : undefined;
      if (status === 403) {
        setError(t('createWorkspaceDialog.err403'));
      } else {
        const msg =
          err instanceof RxApiError
            ? err.code || err.message
            : err instanceof Error
              ? err.message
              : 'CREATE_FAILED';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-background my-12 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-base leading-tight font-semibold'>
              {t('createWorkspaceDialog.title')}
            </h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-muted-foreground hover:bg-muted hover:text-content-muted rounded-lg p-1.5'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4 px-5 py-4'>
          {/* Name */}
          <Field label={t('createWorkspaceDialog.nameLabel')} required>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('createWorkspaceDialog.namePlaceholder')}
              autoFocus
              maxLength={200}
              className='border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Slug */}
          <Field
            label='Slug'
            required
            hint={t('createWorkspaceDialog.slugHint')}
          >
            <input
              type='text'
              value={slug}
              onChange={e => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder='flagship-cola-tet-2026'
              maxLength={64}
              className='border-border w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Description */}
          <Field
            label={t('createWorkspaceDialog.descLabel')}
            hint={t('createWorkspaceDialog.descHint')}
          >
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('createWorkspaceDialog.descPlaceholder')}
              rows={3}
              maxLength={2000}
              className='border-border w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Client preview */}
          {clientId && (
            <div className='text-2xs bg-muted text-content-muted rounded-lg px-3 py-2'>
              {t('createWorkspaceDialog.clientPreview')}{' '}
              <code className='bg-background rounded px-1 font-mono'>
                {clientId.slice(0, 8)}…
              </code>
            </div>
          )}
          {!clientId && (
            <div className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
              {t('createWorkspaceDialog.noClientWarning')}
            </div>
          )}

          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-xs'>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onClose}
            disabled={submitting}
          >
            {t('createWorkspaceDialog.cancel')}
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? <Loader2 className='animate-spin' /> : <Sparkles />}
            {submitting
              ? t('createWorkspaceDialog.submitting')
              : t('createWorkspaceDialog.submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
        {label} {required && <span className='text-destructive'>*</span>}
      </label>
      <div className='mt-1'>{children}</div>
      {hint && <p className='text-3xs text-content-muted mt-1'>{hint}</p>}
    </div>
  );
}
