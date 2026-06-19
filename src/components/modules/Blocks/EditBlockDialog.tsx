'use client';

import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { uploadImageAsset } from '@/lib/upload/media-asset';
import {
  BlockTaxonomyFields,
  emptyTaxonomy,
  taxonomyFrom,
  taxonomyToPayload,
  type BlockTaxonomyValue,
} from '@/components/dialogs/BlockTaxonomyFields';
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
  AdminBlockType,
  Block,
  BlockStatus,
} from '@/services/rexer/types';
import {
  BLOCK_STATUS_META,
  BLOCK_STATUS_ORDER,
  effectiveBlockStatus,
} from '@/lib/block-status';

export interface EditBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Block đang sửa. Null → dialog đóng. */
  block: Block | null;
  /** Danh sách block_type thật từ BE để chọn (nguồn /block-types). */
  blockTypes: AdminBlockType[];
  /** Gọi sau khi PATCH thành công để list cập nhật. */
  onSaved: (updated: Block) => void;
}

function rxMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export function EditBlockDialog({
  open,
  onOpenChange,
  block,
  blockTypes,
  onSaved,
}: EditBlockDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [typeCode, setTypeCode] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [thumbUrl, setThumbUrl] = React.useState<string | null>(null);
  const [thumbAssetId, setThumbAssetId] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [tax, setTax] = React.useState<BlockTaxonomyValue>(emptyTaxonomy());
  const [status, setStatus] = React.useState<BlockStatus>('draft');
  const [reviewNote, setReviewNote] = React.useState('');

  // Nạp lại form mỗi khi mở với block khác.
  React.useEffect(() => {
    if (open && block) {
      setName(block.name ?? '');
      setDescription(block.description ?? '');
      setTypeCode(block.type_code ?? '');
      setTags(block.tags ?? []);
      setTagInput('');
      setThumbUrl(block.thumbnail_url ?? null);
      setThumbAssetId(null);
      setTax(taxonomyFrom(block));
      setStatus(effectiveBlockStatus(block));
      setReviewNote(block.review_note ?? '');
    }
  }, [open, block]);

  const pickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    uploadImageAsset(file)
      .then(asset => {
        setThumbAssetId(asset.id);
        setThumbUrl(asset.public_url ?? null);
      })
      .catch(err => toast.error(`Tải ảnh lỗi: ${rxMessage(err)}`))
      .finally(() => setUploading(false));
  };

  // Nếu type_code hiện tại không nằm trong danh sách BE (block_type cũ/ẩn) thì
  // vẫn cho hiển thị 1 option cho nó để select không bị trống.
  const typeOptions = React.useMemo(() => {
    const opts = blockTypes.map(bt => ({
      code: bt.type,
      label: bt.label_vi || bt.type,
    }));
    const cur = block?.type_code;
    if (cur && !opts.some(o => o.code === cur)) {
      opts.unshift({ code: cur, label: `${cur} (không còn trong catalog)` });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [blockTypes, block?.type_code]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleSubmit = async () => {
    if (!block) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Tên block không được rỗng');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await rexerApi.blocks.update(block.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        tags,
        // Đổi loại block: gửi type_code (BE đã hỗ trợ PATCH /blocks 2026-06-18).
        ...(typeCode && typeCode !== block.type_code
          ? { type_code: typeCode }
          : {}),
        // Thumbnail tuỳ chỉnh — chỉ gửi khi user vừa upload ảnh mới.
        ...(thumbAssetId ? { thumbnail_asset_id: thumbAssetId } : {}),
        // Taxonomy AI per-block (BE persist từ 2026-06-19).
        ...taxonomyToPayload(tax),
        // Lifecycle duyệt (BE 000035 — chờ deploy).
        status,
        review_note: reviewNote.trim() || undefined,
      });
      toast.success(`Đã cập nhật "${updated.name}"`);
      onSaved(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxMessage(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Sửa thông tin block</DialogTitle>
          <DialogDescription>
            Cập nhật tên, mô tả, tag. Nội dung canvas (settings) chỉnh trong
            block editor, không sửa ở đây.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-name'>
              Tên <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='eb-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Hero chia đôi…'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label>Thumbnail</Label>
            <div className='flex items-center gap-3'>
              <div className='border-border bg-muted relative aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-lg border'>
                {thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt='thumbnail'
                    className='absolute inset-0 size-full object-cover'
                  />
                ) : (
                  <div className='text-muted-foreground flex size-full items-center justify-center'>
                    <ImagePlus className='size-5' />
                  </div>
                )}
              </div>
              <div className='min-w-0'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <ImagePlus className='size-3.5' />
                  )}
                  {uploading ? 'Đang tải…' : thumbUrl ? 'Đổi ảnh' : 'Tải ảnh'}
                </Button>
                <p className='text-3xs text-muted-foreground mt-1'>
                  Ảnh đại diện block. Bỏ trống → tự render từ nội dung.
                </p>
              </div>
              <input
                ref={fileRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={pickThumb}
              />
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-type'>Block type</Label>
            <select
              id='eb-type'
              value={typeCode}
              onChange={e => setTypeCode(e.target.value)}
              className='border-input bg-background focus:ring-ring/40 h-9 rounded-md border px-2.5 text-sm outline-none focus:ring-2'
            >
              {typeOptions.length === 0 && (
                <option value={typeCode}>{typeCode || '-'}</option>
              )}
              {typeOptions.map(o => (
                <option key={o.code} value={o.code}>
                  {o.label}
                </option>
              ))}
            </select>
            {typeCode !== (block?.type_code ?? '') && (
              <p className='text-2xs text-amber-600'>
                ⚠ Đổi loại block: settings hiện tại được dựng cho loại cũ — nội
                dung có thể cần chỉnh lại trong block editor sau khi lưu.
              </p>
            )}
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-desc'>Mô tả</Label>
            <Textarea
              id='eb-desc'
              value={description}
              rows={3}
              onChange={e => setDescription(e.target.value)}
              placeholder='Ghi chú ngắn về block này…'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='eb-tags'>Tags</Label>
            <div className='flex flex-wrap items-center gap-1.5'>
              {tags.map(t => (
                <span
                  key={t}
                  className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
                >
                  {t}
                  <button
                    type='button'
                    onClick={() => removeTag(t)}
                    className='text-content-muted hover:text-foreground'
                    aria-label={`Bỏ tag ${t}`}
                  >
                    <X className='size-3' />
                  </button>
                </span>
              ))}
            </div>
            <Input
              id='eb-tags'
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              onBlur={addTag}
              placeholder='Nhập tag rồi Enter…'
            />
          </div>

          {/* Lifecycle duyệt: trạng thái + ghi chú nội bộ (brief / review). */}
          <div className='border-border bg-muted/30 flex flex-col gap-3 rounded-lg border p-3'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='eb-status'>Trạng thái duyệt</Label>
              <select
                id='eb-status'
                value={status}
                onChange={e => setStatus(e.target.value as BlockStatus)}
                className='border-input bg-background focus:ring-ring/40 h-9 rounded-md border px-2.5 text-sm outline-none focus:ring-2'
              >
                {BLOCK_STATUS_ORDER.map(s => (
                  <option key={s} value={s}>
                    {BLOCK_STATUS_META[s].label} — {BLOCK_STATUS_META[s].hint}
                  </option>
                ))}
              </select>
              <p className='text-3xs text-muted-foreground'>
                Chỉ block <b>Đã publish</b> mới hiện cho user dùng (picker, AI
                gợi ý, trang public).
              </p>
            </div>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='eb-note'>Ghi chú nội bộ (brief / review)</Label>
              <Textarea
                id='eb-note'
                value={reviewNote}
                rows={3}
                onChange={e => setReviewNote(e.target.value)}
                placeholder='Marketing: mô tả block cần làm. Dev/Reviewer: ghi chú khi bàn giao / trả lại…'
              />
            </div>
          </div>

          <BlockTaxonomyFields value={tax} onChange={setTax} />
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
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
