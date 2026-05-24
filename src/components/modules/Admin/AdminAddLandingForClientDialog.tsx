'use client';

/**
 * Admin dialog — create a landing page for a brand by instantiating a
 * template into one of the brand's workspaces. Canonical canonical flow
 * (POST /admin/pages/from-template) replaces the legacy 2-step
 * `POST /canvas-templates` + `POST /assign`.
 *
 * Admin picks: workspace + template + name + handoff notes. BE creates
 * the page in draft status; brand fills slots via portal.
 */

import * as React from 'react';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Brand, Template, Workspace } from '@/services/rexer/types';

interface Props {
  open: boolean;
  client: Brand | null;
  onClose: () => void;
  onCreated?: (pageId: string) => void;
}

export function AdminAddLandingForClientDialog({
  open,
  client,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [templateId, setTemplateId] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !client) return;
    setName('');
    setNotes('');
    setError(null);

    // Load workspaces + templates in parallel.
    rexerApi.brands.workspaces
      .list(client.id)
      .then(r => {
        setWorkspaces(r.items ?? []);
        const def = r.items?.find(w => w.is_default) ?? r.items?.[0];
        setWorkspaceId(def?.id ?? '');
      })
      .catch(() => {
        setWorkspaces([]);
        setWorkspaceId('');
      });

    rexerApi.templates
      .list()
      .then(r => {
        const items = r.items ?? [];
        setTemplates(items);
        setTemplateId(items[0]?.id ?? '');
      })
      .catch(() => {
        setTemplates([]);
        setTemplateId('');
      });
  }, [open, client]);

  if (!open || !client) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Đặt tên cho landing trước');
      return;
    }
    if (!templateId) {
      setError('Chọn template để khởi tạo');
      return;
    }
    if (!workspaceId) {
      setError('Chọn workspace cho brand');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const page = await rexerApi.adminPages.fromTemplate({
        template_id: templateId,
        brand_id: client.id,
        workspace_id: workspaceId,
        name: trimmed,
        type: 'landing',
        handoff_notes: notes.trim() || undefined,
      });
      toast.success(`Đã tạo "${page.name}" cho ${client.name}`);
      onCreated?.(page.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'CREATE_FAILED';
      setError(msg);
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
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <div className='leading-tight'>
              <h3 className='text-[15px] font-semibold'>
                Tạo landing cho brand
              </h3>
              <p className='font-mono text-[10px] text-zinc-400'>
                {client.name}
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
          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Tên landing <span className='text-rose-500'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder='Vd: Hè 2026 — Coca-Cola promo'
              className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </div>

          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Template <span className='text-rose-500'>*</span>
            </label>
            <select
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              disabled={templates.length === 0}
              className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            >
              {templates.length === 0 && (
                <option value=''>
                  (Chưa có template — tạo template trước)
                </option>
              )}
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.category ? ` — ${t.category}` : ''}
                </option>
              ))}
            </select>
            <p className='mt-1 text-[10.5px] text-zinc-500'>
              BE clone canvas_blueprint + slot_schema từ template_version hiện
              hành sang page mới.
            </p>
          </div>

          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Workspace <span className='text-rose-500'>*</span>
            </label>
            <select
              value={workspaceId}
              onChange={e => setWorkspaceId(e.target.value)}
              disabled={workspaces.length === 0}
              className='mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            >
              {workspaces.length === 0 && (
                <option value=''>(Brand chưa có workspace)</option>
              )}
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.is_default ? '(default)' : ''}
                </option>
              ))}
            </select>
            <p className='mt-1 text-[10.5px] text-zinc-500'>
              Mặc định = workspace default của brand
            </p>
          </div>

          <div>
            <label className='block text-[10.5px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Ghi chú handover
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder='Vd: Brand chỉ cần đổi text + ảnh ở slot hero + booking.'
              className='mt-1 w-full resize-y rounded-lg border border-zinc-200 px-3 py-2 text-[13px] outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </div>

          {error && (
            <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-800'>
              {error}
            </div>
          )}

          <div className='rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[11px] text-zinc-600'>
            Canonical flow:{' '}
            <code className='font-mono'>POST /admin/pages/from-template</code>{' '}
            tạo Page (type=landing, status=draft) trong workspace của brand,
            link tới template_version hiện hành. Brand vào portal fill slot qua
            form editor.
          </div>
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
            disabled={submitting || !name.trim() || !templateId || !workspaceId}
            className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {submitting ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <Send className='size-3.5' />
            )}
            {submitting ? 'Đang tạo…' : 'Tạo page'}
          </button>
        </div>
      </form>
    </div>
  );
}
