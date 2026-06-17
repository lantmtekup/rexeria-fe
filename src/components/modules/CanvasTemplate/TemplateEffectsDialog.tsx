'use client';

import * as React from 'react';
import { CheckCircle2, Loader2, Pencil, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Template, TemplateEffect } from '@/services/rexer/types';

export interface TemplateEffectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Template đang chỉnh hiệu ứng. Null → dialog đóng. */
  template: Template | null;
}

type TransitionStyle = 'fade' | 'slide' | 'morph';
type Intensity = 'subtle' | 'normal' | 'bold';

const TRANSITION_OPTIONS: TransitionStyle[] = ['fade', 'slide', 'morph'];
const INTENSITY_OPTIONS: Intensity[] = ['subtle', 'normal', 'bold'];

interface FormState {
  name: string;
  easing: string;
  duration_scale: string;
  transition_style: TransitionStyle;
  intensity: Intensity;
}

function emptyForm(): FormState {
  return {
    name: '',
    easing: 'power2.out',
    duration_scale: '1',
    transition_style: 'fade',
    intensity: 'normal',
  };
}

function fromEffect(e: TemplateEffect): FormState {
  return {
    name: e.name,
    easing: e.easing,
    duration_scale: String(e.duration_scale),
    transition_style: e.transition_style,
    intensity: e.intensity,
  };
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function TemplateEffectsDialog({
  open,
  onOpenChange,
  template,
}: TemplateEffectsDialogProps) {
  const templateId = template?.id ?? null;

  const [items, setItems] = React.useState<TemplateEffect[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  // null = đang tạo mới; string = đang sửa effect id đó.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);

  const load = React.useCallback(async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const list = await rexerApi.templateEffects.list(templateId);
      setItems(list);
    } catch (err) {
      toast.error(`Không tải được hiệu ứng: ${rxMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  React.useEffect(() => {
    if (open && templateId) {
      setEditingId(null);
      setForm(emptyForm());
      void load();
    }
  }, [open, templateId, load]);

  const startEdit = (e: TemplateEffect) => {
    setEditingId(e.id);
    setForm(fromEffect(e));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = async () => {
    if (!templateId) return;
    const name = form.name.trim();
    if (!name) {
      toast.error('Tên hiệu ứng không được rỗng');
      return;
    }
    const scale = Number(form.duration_scale);
    if (!Number.isFinite(scale) || scale <= 0 || scale > 3) {
      toast.error('Duration scale phải trong khoảng (0; 3]');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name,
        easing: form.easing.trim() || undefined,
        duration_scale: scale,
        transition_style: form.transition_style,
        intensity: form.intensity,
      };
      if (editingId) {
        await rexerApi.templateEffects.update(templateId, editingId, body);
        toast.success(`Đã cập nhật "${name}"`);
      } else {
        await rexerApi.templateEffects.create(templateId, body);
        toast.success(`Đã thêm "${name}"`);
      }
      resetForm();
      await load();
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivate = async (e: TemplateEffect) => {
    if (!templateId || e.is_active) return;
    setBusyId(e.id);
    try {
      await rexerApi.templateEffects.activate(templateId, e.id);
      toast.success(`Đã kích hoạt "${e.name}"`);
      await load();
    } catch (err) {
      toast.error(`Kích hoạt thất bại: ${rxMessage(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='size-4 text-violet-600' />
            Hiệu ứng template{template ? ` — ${template.name}` : ''}
          </DialogTitle>
          <DialogDescription>
            Mỗi template có thể có nhiều bộ hiệu ứng, đúng 1 bộ được kích hoạt.
            Render scale duration theo bộ active + kiểu chuyển trang.
          </DialogDescription>
        </DialogHeader>

        {/* Danh sách hiệu ứng hiện có */}
        <div className='flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1'>
          <div className='flex flex-col gap-2'>
            {loading ? (
              <div className='text-content-muted flex items-center justify-center gap-2 py-6 text-sm'>
                <Loader2 className='size-4 animate-spin' /> Đang tải…
              </div>
            ) : items.length === 0 ? (
              <p className='text-content-muted rounded-lg border border-dashed px-3 py-6 text-center text-xs'>
                Chưa có hiệu ứng nào. Thêm bộ đầu tiên ở dưới.
              </p>
            ) : (
              items.map(e => (
                <div
                  key={e.id}
                  className='border-border flex items-center gap-3 rounded-lg border bg-white px-3 py-2'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate text-sm font-medium'>
                        {e.name}
                      </span>
                      {e.is_active && (
                        <span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700'>
                          <CheckCircle2 className='size-3' /> Active
                        </span>
                      )}
                    </div>
                    <p className='text-2xs text-content-muted mt-0.5 font-mono'>
                      {e.easing} · ×{e.duration_scale} · {e.transition_style} ·{' '}
                      {e.intensity}
                    </p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => startEdit(e)}
                  >
                    <Pencil className='mr-1 size-3.5' /> Sửa
                  </Button>
                  <Button
                    variant={e.is_active ? 'ghost' : 'default'}
                    size='sm'
                    disabled={e.is_active || busyId === e.id}
                    onClick={() => handleActivate(e)}
                  >
                    {busyId === e.id && (
                      <Loader2 className='mr-1 size-3.5 animate-spin' />
                    )}
                    {e.is_active ? 'Đang dùng' : 'Kích hoạt'}
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Form thêm / sửa */}
          <div className='border-border bg-muted/40 flex flex-col gap-3 rounded-lg border p-3'>
            <div className='flex items-center justify-between'>
              <p className='text-xs font-semibold'>
                {editingId ? 'Sửa hiệu ứng' : 'Thêm hiệu ứng'}
              </p>
              {editingId && (
                <button
                  type='button'
                  onClick={resetForm}
                  className='text-2xs text-content-muted hover:text-foreground'
                >
                  Huỷ sửa → thêm mới
                </button>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='te-name'>
                Tên <span className='text-rose-600'>*</span>
              </Label>
              <Input
                id='te-name'
                value={form.name}
                onChange={ev => setForm(f => ({ ...f, name: ev.target.value }))}
                placeholder='Mượt mà, Năng động…'
              />
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='te-easing'>Easing (GSAP)</Label>
                <Input
                  id='te-easing'
                  value={form.easing}
                  onChange={ev =>
                    setForm(f => ({ ...f, easing: ev.target.value }))
                  }
                  placeholder='power2.out'
                  className='font-mono'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='te-scale'>Duration scale (0–3)</Label>
                <Input
                  id='te-scale'
                  type='number'
                  step='0.1'
                  min='0.1'
                  max='3'
                  value={form.duration_scale}
                  onChange={ev =>
                    setForm(f => ({ ...f, duration_scale: ev.target.value }))
                  }
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='te-transition'>Kiểu chuyển trang</Label>
                <select
                  id='te-transition'
                  value={form.transition_style}
                  onChange={ev =>
                    setForm(f => ({
                      ...f,
                      transition_style: ev.target.value as TransitionStyle,
                    }))
                  }
                  className='border-border h-9 rounded-md border bg-white px-2 text-sm'
                >
                  {TRANSITION_OPTIONS.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex flex-col gap-1'>
                <Label htmlFor='te-intensity'>Cường độ</Label>
                <select
                  id='te-intensity'
                  value={form.intensity}
                  onChange={ev =>
                    setForm(f => ({
                      ...f,
                      intensity: ev.target.value as Intensity,
                    }))
                  }
                  className='border-border h-9 rounded-md border bg-white px-2 text-sm'
                >
                  {INTENSITY_OPTIONS.map(o => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className='mr-1 size-3.5 animate-spin' />
                ) : (
                  <Plus className='mr-1 size-3.5' />
                )}
                {editingId ? 'Lưu thay đổi' : 'Thêm hiệu ứng'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
