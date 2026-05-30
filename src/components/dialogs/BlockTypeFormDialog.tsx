'use client';

import * as React from 'react';
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
import { Switch } from '@/components/atoms/switch';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  AdminBlockType,
  CreateAdminBlockTypeRequest,
  UpdateAdminBlockTypeRequest,
} from '@/services/rexer/types';

export interface BlockTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided → edit mode (PATCH). Absent → create mode (POST). */
  initial?: AdminBlockType | null;
  /** Called after successful create/update so list can reload. */
  onSaved: () => void;
}

interface FormState {
  type: string;
  label_vi: string;
  label_en: string;
  description_vi: string;
  description_en: string;
  accent_color: string;
  schema_version: string;
  sort_order: string;
  is_premium: boolean;
  is_active: boolean;
}

function emptyState(): FormState {
  return {
    type: '',
    label_vi: '',
    label_en: '',
    description_vi: '',
    description_en: '',
    accent_color: '',
    schema_version: '',
    sort_order: '',
    is_premium: false,
    is_active: true,
  };
}

function fromItem(it: AdminBlockType): FormState {
  return {
    type: it.type,
    label_vi: it.label_vi,
    label_en: it.label_en ?? '',
    description_vi: it.description_vi ?? '',
    description_en: it.description_en ?? '',
    accent_color: it.accent_color ?? '',
    schema_version: it.schema_version ?? '',
    sort_order: it.sort_order != null ? String(it.sort_order) : '',
    is_premium: it.is_premium ?? false,
    is_active: it.is_active,
  };
}

// BE convention — block type code: snake_case, lowercase, 2-64 chars.
const TYPE_RE = /^[a-z][a-z0-9_]{1,63}$/;
// hex color #RGB or #RRGGBB.
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function BlockTypeFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: BlockTypeFormDialogProps) {
  const isEdit = !!initial;
  const [data, setData] = React.useState<FormState>(() =>
    initial ? fromItem(initial) : emptyState()
  );
  const [submitting, setSubmitting] = React.useState(false);

  // Reset state whenever dialog re-opens with a different target.
  React.useEffect(() => {
    if (open) setData(initial ? fromItem(initial) : emptyState());
  }, [open, initial]);

  const handleSubmit = async () => {
    // ── Validate ──
    const type = data.type.trim();
    const labelVi = data.label_vi.trim();
    if (!isEdit) {
      if (!type) {
        toast.error('Type (code) không được rỗng');
        return;
      }
      if (!TYPE_RE.test(type)) {
        toast.error(
          'Type phải snake_case, bắt đầu bằng chữ thường (vd: hero_split)'
        );
        return;
      }
    }
    if (!labelVi) {
      toast.error('Label VI không được rỗng');
      return;
    }
    const accent = data.accent_color.trim();
    if (accent && !HEX_RE.test(accent)) {
      toast.error('Accent color phải là hex (#RGB hoặc #RRGGBB)');
      return;
    }
    let sortOrder: number | undefined;
    if (data.sort_order.trim()) {
      const n = Number(data.sort_order);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        toast.error('Sort order phải là số nguyên');
        return;
      }
      sortOrder = n;
    }

    setSubmitting(true);
    try {
      if (isEdit && initial) {
        const body: UpdateAdminBlockTypeRequest = {
          label_vi: labelVi,
          label_en: data.label_en.trim() || undefined,
          description_vi: data.description_vi.trim() || undefined,
          description_en: data.description_en.trim() || undefined,
          accent_color: accent || undefined,
          schema_version: data.schema_version.trim() || undefined,
          sort_order: sortOrder,
          is_premium: data.is_premium,
          is_active: data.is_active,
        };
        await rexerApi.adminBlockTypes.update(initial.type, body);
        toast.success(`Đã cập nhật "${initial.type}"`);
      } else {
        const body: CreateAdminBlockTypeRequest = {
          type,
          label_vi: labelVi,
          label_en: data.label_en.trim() || undefined,
          description_vi: data.description_vi.trim() || undefined,
          description_en: data.description_en.trim() || undefined,
          accent_color: accent || undefined,
          schema_version: data.schema_version.trim() || undefined,
          sort_order: sortOrder,
          is_premium: data.is_premium,
        };
        await rexerApi.adminBlockTypes.create(body);
        toast.success(`Đã tạo block type "${type}"`);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Sửa block type: ${initial!.type}` : 'Tạo block type'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Chỉnh metadata của block type. Type (code) không đổi được.'
              : 'Khai báo block type mới cho catalog. Code dùng snake_case (vd: hero_split, cta_button).'}
          </DialogDescription>
        </DialogHeader>

        <div className='flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1'>
          {/* type (code) */}
          <div className='flex flex-col gap-1'>
            <Label htmlFor='blk-type'>
              Type (code) <span className='text-rose-600'>*</span>
            </Label>
            <Input
              id='blk-type'
              value={data.type}
              disabled={isEdit}
              onChange={e =>
                setData(d => ({ ...d, type: e.target.value.toLowerCase() }))
              }
              placeholder='hero_split'
              className='font-mono'
            />
            <p className='text-muted-foreground text-[11px]'>
              Snake_case, bắt đầu bằng chữ thường, 2–64 ký tự. Là primary key,
              không sửa được sau khi tạo.
            </p>
          </div>

          {/* Labels */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-label-vi'>
                Label VI <span className='text-rose-600'>*</span>
              </Label>
              <Input
                id='blk-label-vi'
                value={data.label_vi}
                onChange={e =>
                  setData(d => ({ ...d, label_vi: e.target.value }))
                }
                placeholder='Hero chia đôi'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-label-en'>Label EN</Label>
              <Input
                id='blk-label-en'
                value={data.label_en}
                onChange={e =>
                  setData(d => ({ ...d, label_en: e.target.value }))
                }
                placeholder='Hero split'
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-desc-vi'>Mô tả VI</Label>
              <Textarea
                id='blk-desc-vi'
                value={data.description_vi}
                rows={3}
                onChange={e =>
                  setData(d => ({ ...d, description_vi: e.target.value }))
                }
                placeholder='Khối hero chia 2 cột: text + ảnh…'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-desc-en'>Description EN</Label>
              <Textarea
                id='blk-desc-en'
                value={data.description_en}
                rows={3}
                onChange={e =>
                  setData(d => ({ ...d, description_en: e.target.value }))
                }
                placeholder='Two-column hero: text + image…'
              />
            </div>
          </div>

          {/* Accent color + schema_version + sort_order */}
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-accent'>Accent color</Label>
              <div className='flex items-center gap-2'>
                <input
                  type='color'
                  value={
                    HEX_RE.test(data.accent_color)
                      ? data.accent_color
                      : '#888888'
                  }
                  onChange={e =>
                    setData(d => ({ ...d, accent_color: e.target.value }))
                  }
                  className='size-9 cursor-pointer rounded border border-zinc-200 bg-white p-0.5'
                  aria-label='accent color picker'
                />
                <Input
                  id='blk-accent'
                  value={data.accent_color}
                  onChange={e =>
                    setData(d => ({ ...d, accent_color: e.target.value }))
                  }
                  placeholder='#ff5500'
                  className='font-mono'
                />
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-schema-ver'>Schema version</Label>
              <Input
                id='blk-schema-ver'
                value={data.schema_version}
                onChange={e =>
                  setData(d => ({ ...d, schema_version: e.target.value }))
                }
                placeholder='v1'
                className='font-mono'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-sort'>Sort order</Label>
              <Input
                id='blk-sort'
                type='number'
                value={data.sort_order}
                onChange={e =>
                  setData(d => ({ ...d, sort_order: e.target.value }))
                }
                placeholder='100'
              />
            </div>
          </div>

          {/* Switches */}
          <div className='flex flex-wrap items-center gap-6 rounded-lg border border-zinc-200 bg-zinc-50/40 px-3 py-2'>
            <label className='inline-flex cursor-pointer items-center gap-2'>
              <Switch
                checked={data.is_premium}
                onCheckedChange={v => setData(d => ({ ...d, is_premium: v }))}
              />
              <span className='text-sm'>Premium</span>
            </label>
            {isEdit && (
              <label className='inline-flex cursor-pointer items-center gap-2'>
                <Switch
                  checked={data.is_active}
                  onCheckedChange={v => setData(d => ({ ...d, is_active: v }))}
                />
                <span className='text-sm'>Active</span>
              </label>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className='mr-1 size-3.5 animate-spin' />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo block type'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
