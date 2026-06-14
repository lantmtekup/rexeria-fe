'use client';

/**
 * Admin dialog — create a landing page for a brand by instantiating a
 * template into one of the brand's workspaces. Uses canonical
 * `POST /v1/workspaces/{wsId}/pages` (handler.go:114 RegisterCanonical,
 * page_canonical.go:81 Create).
 *
 * History: trước dùng `POST /admin/pages/from-template` (per migration
 * plan §7 row 6 — legacy stub) — endpoint này BE chưa mount → 404. Đổi
 * sang canonical pages.create endpoint giống UseTemplateDialog.
 *
 * ⚠️ Endpoint canonical hiện 500 (brand_id="" — audit doc §1.3). Sẽ work
 * tự động khi BE fix.
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
  // Landing code riêng: không clone từ template nào, dev tự code layout.
  const [customCoded, setCustomCoded] = React.useState(false);
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
    if (!customCoded && !templateId) {
      setError('Chọn template, hoặc tick "Landing code riêng"');
      return;
    }
    if (!workspaceId) {
      setError('Chọn workspace cho brand');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const page = await rexerApi.pages.create(workspaceId, {
        // Code riêng → KHÔNG gửi template_id, đánh dấu custom_coded.
        ...(customCoded
          ? { type_metadata: { custom_coded: true } }
          : { template_id: templateId }),
        name: trimmed,
        type: 'landing',
        ...(notes.trim() ? { handoff_notes: notes.trim() } : {}),
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
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm'>
              <Sparkles className='size-4' />
            </div>
            <div className='leading-tight'>
              <h3 className='text-base font-semibold'>Tạo landing cho brand</h3>
              <p className='text-3xs text-muted-foreground font-mono'>
                {client.name}
              </p>
            </div>
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

        <div className='space-y-4 px-5 py-4'>
          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Tên landing <span className='text-rose-500'>*</span>
            </label>
            <input
              autoFocus
              type='text'
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder='Vd: Hè 2026 — Coca-Cola promo'
              className='border-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </div>

          <div>
            <div className='flex items-center justify-between'>
              <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
                Template{' '}
                {customCoded ? (
                  <span className='text-content-muted normal-case'>
                    (không dùng)
                  </span>
                ) : (
                  <span className='text-rose-500'>*</span>
                )}
              </label>
              <label className='text-content-muted flex cursor-pointer items-center gap-1.5 text-xs'>
                <input
                  type='checkbox'
                  checked={customCoded}
                  onChange={e => setCustomCoded(e.target.checked)}
                  className='accent-emerald-500'
                />
                Landing code riêng
              </label>
            </div>
            <select
              value={templateId}
              onChange={e => setTemplateId(e.target.value)}
              disabled={customCoded || templates.length === 0}
              className='border-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50'
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
            <p className='text-3xs text-content-muted mt-1'>
              {customCoded
                ? 'Landing code riêng — KHÔNG clone từ template. Page tạo trống (type_metadata.custom_coded), dev tự code layout.'
                : 'BE clone canvas_blueprint + slot_schema từ template_version hiện hành sang page mới.'}
            </p>
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Workspace <span className='text-rose-500'>*</span>
            </label>
            <select
              value={workspaceId}
              onChange={e => setWorkspaceId(e.target.value)}
              disabled={workspaces.length === 0}
              className='border-border mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
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
            <p className='text-3xs text-content-muted mt-1'>
              Mặc định = workspace default của brand
            </p>
          </div>

          <div>
            <label className='text-3xs text-content-muted block font-semibold tracking-wider uppercase'>
              Ghi chú handover
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder='Vd: Brand chỉ cần đổi text + ảnh ở slot hero + booking.'
              className='border-border mt-1 w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
            />
          </div>

          {error && (
            <div className='rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800'>
              {error}
            </div>
          )}

          <div className='text-2xs border-border bg-muted/50 text-content-muted rounded-lg border px-3 py-2'>
            Canonical flow:{' '}
            <code className='font-mono'>POST /admin/pages/from-template</code>{' '}
            tạo Page (type=landing, status=draft) trong workspace của brand,
            link tới template_version hiện hành. Brand vào portal fill slot qua
            form editor.
          </div>
        </div>

        <div className='border-border bg-muted/50 flex items-center justify-end gap-2 border-t px-5 py-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='border-border text-content-muted hover:bg-muted rounded-lg border bg-white px-3 py-1.5 text-xs font-medium disabled:opacity-50'
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
