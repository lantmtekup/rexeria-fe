'use client';

/**
 * "Sử dụng template" dialog — admin pick brand + workspace + page name →
 * POST /v1/workspaces/{wsId}/pages body { template_id, name, type: 'landing' }.
 *
 * BE bug ⚠️ — POST /pages hiện 500 (BrandID không set trong page_canonical
 * usecase, ref docs/be-audit-2026-05-26.md §1.3). Dialog ship trước, sẽ work
 * tự động khi BE fix.
 */

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  Brand,
  CreatePageRequest,
  Page,
  Template,
  Workspace,
} from '@/services/rexer/types';

export interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
  /** Called after successful page creation. Receives the new Page. */
  onCreated?: (page: Page) => void;
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function UseTemplateDialog({
  open,
  onOpenChange,
  template,
  onCreated,
}: UseTemplateDialogProps) {
  const router = useRouter();

  // ── Form state ─────────────────────────────────────────────────────
  const [name, setName] = React.useState('');
  const [brandId, setBrandId] = React.useState('');
  const [workspaceId, setWorkspaceId] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [handoffNotes, setHandoffNotes] = React.useState('');
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // ── Data state ─────────────────────────────────────────────────────
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = React.useState(false);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Reset state + load brands when dialog opens.
  React.useEffect(() => {
    if (!open || !template) return;
    setName(`${template.name} - Copy`);
    setBrandId('');
    setWorkspaceId('');
    setSlug('');
    setDescription('');
    setHandoffNotes('');
    setShowAdvanced(false);
    setWorkspaces([]);

    setLoadingBrands(true);
    rexerApi.brands
      .list({ page: 1, limit: 100 })
      .then(r => setBrands(r.items ?? []))
      .catch(err =>
        toast.error(`Load brands thất bại: ${rxMessage(err)}`, {
          duration: 4000,
        })
      )
      .finally(() => setLoadingBrands(false));
  }, [open, template]);

  // Load workspaces when brand picked. Auto-select default workspace.
  React.useEffect(() => {
    if (!brandId) {
      setWorkspaces([]);
      setWorkspaceId('');
      return;
    }
    setLoadingWorkspaces(true);
    setWorkspaceId('');
    rexerApi.brands.workspaces
      .list(brandId)
      .then(r => {
        const items = r.items ?? [];
        setWorkspaces(items);
        // Auto-pick default workspace if exists.
        const def = items.find(w => w.is_default) ?? items[0];
        if (def) setWorkspaceId(def.id);
      })
      .catch(err =>
        toast.error(`Load workspaces thất bại: ${rxMessage(err)}`, {
          duration: 4000,
        })
      )
      .finally(() => setLoadingWorkspaces(false));
  }, [brandId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!template) return;
    const nameT = name.trim();
    if (!nameT) {
      toast.error('Tên landing không được rỗng');
      return;
    }
    if (!brandId) {
      toast.error('Chọn brand');
      return;
    }
    if (!workspaceId) {
      toast.error('Chọn workspace');
      return;
    }

    const body: CreatePageRequest = {
      template_id: template.id,
      name: nameT,
      type: 'landing',
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(handoffNotes.trim() ? { handoff_notes: handoffNotes.trim() } : {}),
    } as CreatePageRequest;

    setSubmitting(true);
    try {
      const created = await rexerApi.pages.create(workspaceId, body);
      toast.success(`Đã tạo landing "${created.name}"`);
      onCreated?.(created);
      onOpenChange(false);
      // Navigate to brand detail Landings tab để xem ngay.
      router.push(`/admin/users/${brandId}`);
    } catch (err) {
      toast.error(`Tạo landing thất bại: ${rxMessage(err)}`, {
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Sử dụng template</DialogTitle>
          <DialogDescription>
            Tạo landing page mới từ template{' '}
            <code className='font-mono text-zinc-700'>{template.code}</code>.
            Page sẽ có status <strong>draft</strong>, brand chỉnh nội dung qua
            slot rồi publish.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1'
        >
          {/* Page name */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='use-tpl-name'>
              Tên landing page <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='use-tpl-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Acme Hero Launch 2026'
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Brand picker */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='use-tpl-brand'>
              Brand (khách hàng) <span className='text-rose-600'>*</span>
            </Label>
            <select
              id='use-tpl-brand'
              value={brandId}
              onChange={e => setBrandId(e.target.value)}
              disabled={loadingBrands}
              className='border-input bg-background h-9 rounded-md border px-3 text-sm disabled:opacity-50'
            >
              <option value=''>
                {loadingBrands ? 'Đang tải brand…' : '— Chọn brand —'}
              </option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Workspace picker */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='use-tpl-ws'>
              Workspace <span className='text-rose-600'>*</span>
            </Label>
            <select
              id='use-tpl-ws'
              value={workspaceId}
              onChange={e => setWorkspaceId(e.target.value)}
              disabled={!brandId || loadingWorkspaces}
              className='border-input bg-background h-9 rounded-md border px-3 text-sm disabled:opacity-50'
            >
              <option value=''>
                {!brandId
                  ? '— Chọn brand trước —'
                  : loadingWorkspaces
                    ? 'Đang tải workspace…'
                    : workspaces.length === 0
                      ? 'Brand không có workspace nào'
                      : '— Chọn workspace —'}
              </option>
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.slug}){w.is_default ? ' · default' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced toggle */}
          <button
            type='button'
            onClick={() => setShowAdvanced(v => !v)}
            className='self-start text-[11px] font-medium text-zinc-500 hover:text-zinc-900'
          >
            {showAdvanced ? '− Ẩn tuỳ chọn nâng cao' : '+ Tuỳ chọn nâng cao'}
          </button>

          {showAdvanced && (
            <div className='flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/40 p-3'>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='use-tpl-slug'>Slug (URL)</Label>
                <Input
                  id='use-tpl-slug'
                  value={slug}
                  onChange={e =>
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }
                  placeholder='acme-hero-launch (auto sinh nếu rỗng)'
                  className='font-mono'
                  maxLength={200}
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='use-tpl-desc'>Mô tả nội bộ</Label>
                <Textarea
                  id='use-tpl-desc'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder='Notes nội bộ cho team admin…'
                  maxLength={2000}
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <Label htmlFor='use-tpl-handoff'>
                  Handoff notes (cho brand)
                </Label>
                <Textarea
                  id='use-tpl-handoff'
                  value={handoffNotes}
                  onChange={e => setHandoffNotes(e.target.value)}
                  rows={2}
                  placeholder='Hướng dẫn brand chỉnh template, slot nào cần fill…'
                  maxLength={2000}
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            Tạo landing page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
