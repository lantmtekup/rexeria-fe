'use client';

/**
 * Hand-off modal — admin/staff Rexer instantiate a template into a brand's
 * workspace as a new Page. Canonical flow uses
 * `POST /admin/pages/from-template` (replaces legacy
 * `/canvas-templates/{id}/assign`).
 */

import * as React from 'react';
import { Building2, Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Brand, Page, Template, Workspace } from '@/services/rexer/types';

interface Props {
  open: boolean;
  template: Template | null;
  onClose: () => void;
  onAssigned?: (page: Page) => void;
}

export function AdminAssignTemplateDialog({
  open,
  template,
  onClose,
  onAssigned,
}: Props) {
  const [clients, setClients] = React.useState<Brand[]>([]);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [clientId, setClientId] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [pageName, setPageName] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setClientId('');
    setWorkspaceId('');
    setNotes('');
    setPageName(template?.name ?? '');
    setError(null);
    rexerApi.brands
      .list()
      .then(r => setClients(r.items ?? []))
      .catch(() => setClients([]));
  }, [open, template]);

  React.useEffect(() => {
    if (!clientId) {
      setWorkspaces([]);
      setWorkspaceId('');
      return;
    }
    rexerApi.brands.workspaces
      .list(clientId)
      .then(r => {
        setWorkspaces(r.items ?? []);
        const def = r.items?.find(w => w.is_default) ?? r.items?.[0];
        setWorkspaceId(def?.id ?? '');
      })
      .catch(() => {
        setWorkspaces([]);
        setWorkspaceId('');
      });
  }, [clientId]);

  if (!open || !template) return null;

  const handleSubmit = async () => {
    if (!clientId) {
      setError('Chọn brand trước khi assign');
      return;
    }
    if (!workspaceId) {
      setError('Brand chưa có workspace để instantiate page');
      return;
    }
    const trimmedName = pageName.trim() || template.name;
    setSubmitting(true);
    setError(null);
    try {
      const page = await rexerApi.adminPages.fromTemplate({
        template_id: template.id,
        brand_id: clientId,
        workspace_id: workspaceId,
        name: trimmedName,
        type: 'landing',
        handoff_notes: notes.trim() || undefined,
      });
      const clientName = clients.find(c => c.id === clientId)?.name ?? '?';
      toast.success(`Đã tạo "${page.name}" cho ${clientName}`);
      onAssigned?.(page);
      onClose();
    } catch (err) {
      if (err instanceof RxApiError && err.status === 404) {
        setError(
          'BE chưa ship endpoint /admin/pages/from-template — nhắc BE merge canonical handler.'
        );
      } else {
        const msg =
          err instanceof RxApiError
            ? err.code || err.message
            : err instanceof Error
              ? err.message
              : 'ASSIGN_FAILED';
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='my-12 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-zinc-100 px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Send className='size-4' />
            </div>
            <div className='leading-tight'>
              <h3 className='text-base font-semibold'>Assign sang brand</h3>
              <p className='text-3xs font-mono text-zinc-400'>
                {template.name}
              </p>
            </div>
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

        <div className='space-y-4 px-5 py-4'>
          <Field
            label='Tên page'
            hint='Mặc định = tên template, brand có thể đổi sau'
          >
            <input
              type='text'
              value={pageName}
              maxLength={200}
              onChange={e => setPageName(e.target.value)}
              placeholder={template.name}
              className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </Field>

          <Field label='Brand' required>
            <select
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            >
              <option value=''>— Chọn brand —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          {clientId && (
            <Field
              label='Workspace'
              hint='Mặc định = workspace default của brand'
            >
              <select
                value={workspaceId}
                onChange={e => setWorkspaceId(e.target.value)}
                className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                disabled={workspaces.length === 0}
              >
                {workspaces.length === 0 && (
                  <option value=''>(Chưa load được workspace)</option>
                )}
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.is_default ? '(default)' : ''}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label='Ghi chú handover' hint='Tuỳ chọn — gửi kèm cho brand'>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder='Vd: Template đã set sẵn block hero + booking form, brand chỉ cần đổi text + ảnh.'
              className='w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </Field>

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
            type='button'
            onClick={handleSubmit}
            disabled={submitting || !clientId}
            className='flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Building2 className='size-3.5' />
            )}
            {submitting ? 'Đang assign…' : 'Assign'}
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
      <label className='text-3xs block font-semibold tracking-wider text-zinc-500 uppercase'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
      <div className='mt-1'>{children}</div>
      {hint && <p className='text-3xs mt-1 text-zinc-500'>{hint}</p>}
    </div>
  );
}
