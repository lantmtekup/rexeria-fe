'use client';

import * as React from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { uploadImageAsset } from '@/lib/upload/media-asset';
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
  preview_image_url: string;
  is_active: boolean;
}

function emptyState(): FormState {
  return {
    type: '',
    label_vi: '',
    label_en: '',
    description_vi: '',
    description_en: '',
    preview_image_url: '',
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
    preview_image_url: it.preview_image_url ?? '',
    is_active: it.is_active,
  };
}

// BE convention — block type code: snake_case, lowercase, 2-64 chars.
const TYPE_RE = /^[a-z][a-z0-9_]{1,63}$/;
// Taxonomy AI đã chuyển xuống per-block (sửa ở /admin/blocks) — bỏ khỏi đây.

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
  const [previewUploading, setPreviewUploading] = React.useState(false);
  const previewFileRef = React.useRef<HTMLInputElement>(null);

  const pickPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPreviewUploading(true);
    uploadImageAsset(file)
      .then(asset =>
        setData(d => ({ ...d, preview_image_url: asset.public_url ?? '' }))
      )
      .catch(() => toast.error('Tải ảnh thất bại'))
      .finally(() => setPreviewUploading(false));
  };

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
    setSubmitting(true);
    try {
      if (isEdit && initial) {
        const body: UpdateAdminBlockTypeRequest = {
          label_vi: labelVi,
          label_en: data.label_en.trim() || undefined,
          description_vi: data.description_vi.trim() || undefined,
          description_en: data.description_en.trim() || undefined,
          preview_image_url: data.preview_image_url.trim() || undefined,
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
          preview_image_url: data.preview_image_url.trim() || undefined,
        };
        await rexerApi.adminBlockTypes.create(body);
        toast.success(`Đã tạo loại block "${type}"`);
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
            {isEdit ? `Sửa loại block: ${initial!.type}` : 'Tạo loại block'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Chỉnh metadata của loại block. Type (code) không đổi được.'
              : 'Khai báo loại block mới cho danh mục. Code dùng snake_case (vd: hero_split, cta_button).'}
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
            <p className='text-muted-foreground text-2xs'>
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

          {/* Preview image (ảnh đại diện block type trong catalog) */}
          <div className='flex flex-col gap-1'>
            <Label>Ảnh preview</Label>
            <div className='flex items-center gap-3'>
              <div className='border-border bg-muted relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-lg border'>
                {data.preview_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.preview_image_url}
                    alt='preview'
                    className='absolute inset-0 size-full object-cover'
                  />
                ) : (
                  <div className='text-muted-foreground flex size-full items-center justify-center'>
                    <ImagePlus className='size-5' />
                  </div>
                )}
              </div>
              <div className='min-w-0 flex-1'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => previewFileRef.current?.click()}
                  disabled={previewUploading}
                >
                  {previewUploading ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <ImagePlus className='size-3.5' />
                  )}
                  {previewUploading
                    ? 'Đang tải…'
                    : data.preview_image_url
                      ? 'Đổi ảnh'
                      : 'Tải ảnh'}
                </Button>
                <Input
                  value={data.preview_image_url}
                  onChange={e =>
                    setData(d => ({ ...d, preview_image_url: e.target.value }))
                  }
                  placeholder='hoặc dán URL ảnh…'
                  className='mt-1.5 text-xs'
                />
              </div>
              <input
                ref={previewFileRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={pickPreview}
              />
            </div>
          </div>

          {/* Active — chỉ field này có ý nghĩa ở BE (bật/tắt block khỏi catalog) */}
          {isEdit && (
            <div className='border-border bg-muted/40 flex items-center gap-6 rounded-lg border px-3 py-2'>
              <label className='inline-flex cursor-pointer items-center gap-2'>
                <Switch
                  checked={data.is_active}
                  onCheckedChange={v => setData(d => ({ ...d, is_active: v }))}
                />
                <span className='text-sm'>Active</span>
              </label>
            </div>
          )}
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
            {isEdit ? 'Lưu thay đổi' : 'Tạo loại block'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
