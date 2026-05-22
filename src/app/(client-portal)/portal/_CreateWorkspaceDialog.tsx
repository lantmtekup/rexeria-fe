'use client';

/**
 * Brand-portal "Create workspace" dialog. Now fires `POST /portal/workspaces`
 * — brand-scoped endpoint that auto-derives `client_id` from the session,
 * so the FE no longer needs to pass it. Falls back gracefully if BE still
 * has an outdated build (admin endpoint with explicit clientId) by 403'ing.
 */

import * as React from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, X } from 'lucide-react';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Workspace as BEWorkspace } from '@/services/rexer/types';

interface Props {
  open: boolean;
  /** Brand the workspace will belong to — usually `user.client_id`. */
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
      setError('Tài khoản chưa gắn client — không tạo được workspace.');
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
      toast.success(`Đã tạo workspace "${ws.name}"`);
      onCreated(ws);
      onClose();
    } catch (err) {
      const status = err instanceof RxApiError ? err.status : undefined;
      if (status === 403) {
        setError(
          'Endpoint /portal/workspaces yêu cầu brand scope — admin chưa link client cụ thể không tạo được. Login bằng brand user.'
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
      className='fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-12 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <h3 className='text-[15px] leading-tight font-semibold'>
              Tạo workspace mới
            </h3>
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

        <form onSubmit={handleSubmit} className='space-y-4 px-5 py-4'>
          {/* Name */}
          <Field label='Tên workspace' required>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Vd: Flagship Cola — Tết 2026'
              autoFocus
              maxLength={200}
              className='w-full rounded-lg border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Slug */}
          <Field
            label='Slug'
            required
            hint='Dùng trong URL — chỉ chữ thường, số, dấu gạch ngang'
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
              className='w-full rounded-lg border border-zinc-200 px-3 py-2 font-mono text-[13px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Description */}
          <Field label='Mô tả' hint='Tuỳ chọn — giúp đồng đội nhận diện'>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='Sub-brand nước cola có ga cho thị trường VN…'
              rows={3}
              maxLength={2000}
              className='w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-[14px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
            />
          </Field>

          {/* Client preview */}
          {clientId && (
            <div className='rounded-lg bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500'>
              Sẽ tạo trong client{' '}
              <code className='rounded bg-white px-1 font-mono'>
                {clientId.slice(0, 8)}…
              </code>
            </div>
          )}
          {!clientId && (
            <div className='rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800'>
              Tài khoản hiện không gắn client cụ thể — đăng nhập bằng brand user
              để tạo workspace cho brand đó.
            </div>
          )}

          {error && (
            <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
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
            type='button'
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Sparkles className='size-3.5' />
            )}
            {submitting ? 'Đang tạo…' : 'Tạo workspace'}
          </button>
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
      <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='mt-1'>{children}</div>
      {hint && <p className='mt-1 text-[10.5px] text-zinc-500'>{hint}</p>}
    </div>
  );
}
