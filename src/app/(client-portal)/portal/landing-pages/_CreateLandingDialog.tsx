'use client';

/**
 * Brand-side "Create new landing" dialog. Wires `POST /v1/portal/templates`
 * (be-todo.md P0.2). BE auto-scopes by ctx.brand_id + ctx.active_workspace
 * when workspace_id is omitted.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

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
      setError('Đặt tên cho landing trước khi tạo');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await rexerApi.portal.createTemplate({
        name: trimmed,
        workspace_id: workspaceId,
      });
      toast.success(`Đã tạo "${created.name}"`);
      onCreated?.(created.id);
      onClose();
      // BE returns canvas_template id even though listTemplates uses a
      // different shape — route into the canvas editor for editing.
      router.push(`/canvas-templates/${created.id}`);
    } catch (err) {
      if (err instanceof RxApiError && err.status === 404) {
        setError(
          'BE chưa ship endpoint POST /portal/templates (be-todo.md P0.2)'
        );
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
        className='my-16 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
      >
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-base font-semibold'>Tạo landing mới</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'
            aria-label='Close'
          >
            <X className='size-4' />
          </button>
        </div>

        <div className='space-y-3 px-5 py-4'>
          <div>
            <label className='text-3xs block font-semibold tracking-wider text-zinc-500 uppercase'>
              Tên landing <span className='text-rose-500'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder='Vd: Hè 2026 — Coca-Cola promo'
              className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
            <p className='text-3xs mt-1 text-zinc-500'>
              Tên hiển thị trong /portal/landing-pages, đổi sau được. Workspace
              hiện tại sẽ được auto-attach.
            </p>
          </div>

          {error && (
            <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800'>
              {error}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50'
          >
            Huỷ
          </button>
          <button
            type='submit'
            disabled={submitting || !name.trim()}
            className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Sparkles className='size-3.5' />
            )}
            {submitting ? 'Đang tạo…' : 'Tạo + mở editor'}
          </button>
        </div>
      </form>
    </div>
  );
}
