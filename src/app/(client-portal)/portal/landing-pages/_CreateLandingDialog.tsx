'use client';

/**
 * Brand-side "Create new landing" dialog. Wires `POST /v1/portal/templates`
 * (be-todo.md P0.2). BE auto-scopes by ctx.brand_id + ctx.active_workspace
 * when workspace_id is omitted.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

interface Props {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  /** Fires after successful create (so the list can refresh + select). */
  onCreated?: (id: string) => void;
}

export function CreateLandingDialog({
  open,
  onClose,
  workspaceId,
  onCreated,
}: Props) {
  const router = useRouter();
  const t = useTranslations('portal');
  const [name, setName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setName('');
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('landingPagesCreateLandingDialog.errorNameRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await rexerApi.portal.createTemplate({
        name: trimmed,
        workspace_id: workspaceId,
      });
      toast.success(
        t('landingPagesCreateLandingDialog.createdToast', {
          name: created.name,
        })
      );
      onCreated?.(created.id);
      onClose();
      // BE returns canvas_template id even though listTemplates uses a
      // different shape — route into the canvas editor for editing.
      router.push(`/canvas-templates/${created.id}`);
    } catch (err) {
      if (err instanceof RxApiError && err.status === 404) {
        setError(t('landingPagesCreateLandingDialog.errorEndpointMissing'));
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
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={e => e.stopPropagation()}
        className='bg-background my-16 w-full max-w-md overflow-hidden rounded-2xl shadow-2xl'
      >
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-base font-semibold'>
              {t('landingPagesCreateLandingDialog.title')}
            </h3>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClose}
            aria-label={t('landingPagesCreateLandingDialog.closeAria')}
          >
            <X className='size-4' />
          </Button>
        </div>

        <div className='space-y-3 px-5 py-4'>
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              {t('landingPagesCreateLandingDialog.nameLabel')}{' '}
              <span className='text-destructive'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder={t('landingPagesCreateLandingDialog.namePlaceholder')}
              className='border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
            <p className='text-3xs text-content-muted mt-1'>
              {t('landingPagesCreateLandingDialog.nameHint')}
            </p>
          </div>

          {error && (
            <div className='border-destructive/20 bg-danger-bg text-destructive rounded-lg border px-3 py-2 text-xs'>
              {error}
            </div>
          )}
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onClose}
            disabled={submitting}
          >
            {t('landingPagesCreateLandingDialog.cancel')}
          </Button>
          <Button type='submit' size='sm' disabled={submitting || !name.trim()}>
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Sparkles className='size-3.5' />
            )}
            {submitting
              ? t('landingPagesCreateLandingDialog.submitting')
              : t('landingPagesCreateLandingDialog.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
}
