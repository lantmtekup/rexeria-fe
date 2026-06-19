'use client';

/**
 * "Tạo block mới" — form brief cho `/admin/blocks` (+ mirror `/portal/blocks`).
 * Chỉ nhập metadata brief (tên, mô tả, ghi chú, tags, taxonomy). Block tạo ra có
 * settings **RỖNG** + status `'draft'`. `type_code` để MẶC ĐỊNH — dev đổi loại
 * thật sau ở trang Blocks (EditBlockDialog). Đã bỏ picker loại + "Duyệt thư viện".
 */

import * as React from 'react';
import { ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { uploadImageAsset } from '@/lib/upload/media-asset';
import {
  BlockTaxonomyFields,
  emptyTaxonomy,
  taxonomyToPayload,
  type BlockTaxonomyValue,
} from '@/components/dialogs/BlockTaxonomyFields';
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import type { Block, BlockType } from '@/components/modules/block-editor/types';
import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

// type_code mặc định cho block brief. FK blocks.type_code đã bỏ ở BE (migration
// 000036) nên type_code là string tự do — dev set loại thật sau qua EditBlockDialog.
const DEFAULT_TYPE = Object.keys(BLOCK_TYPE_META)[0] as BlockType;

function genId() {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

/** Settings tối thiểu hợp lệ (content rỗng) — block brief, dev dựng nội dung sau. */
function placeholderSettings(type: BlockType, name: string): Block {
  return {
    id: genId(),
    blockType: type,
    name,
    contentVi: { desktop: {} as Block['contentVi']['desktop'] },
    contentEn: { desktop: {} as Block['contentEn']['desktop'] },
    isVisible: true,
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Fires after a block is added to the saved-blocks library. */
  onAdded?: (id: string) => void;
  /** Không còn dùng (đã bỏ catalog picker) — giữ optional để không vỡ call site. */
  counts?: Record<string, number>;
}

export function AddBuiltinBlockDialog({ open, onClose, onAdded }: Props) {
  const [adding, setAdding] = React.useState(false);
  const [formName, setFormName] = React.useState('');
  const [formDesc, setFormDesc] = React.useState('');
  // Ghi chú nội bộ / brief — block mới luôn vào trạng thái 'draft' để chờ duyệt.
  const [formNote, setFormNote] = React.useState('');
  const [formTags, setFormTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [formTax, setFormTax] =
    React.useState<BlockTaxonomyValue>(emptyTaxonomy());
  const [thumbUrl, setThumbUrl] = React.useState<string | null>(null);
  const [thumbAssetId, setThumbAssetId] = React.useState<string | null>(null);
  const [uploadingThumb, setUploadingThumb] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    // Mở dialog → reset form trống.
    setFormName('');
    setFormDesc('');
    setFormNote('');
    setFormTags([]);
    setTagInput('');
    setFormTax(emptyTaxonomy());
    setThumbUrl(null);
    setThumbAssetId(null);
  }, [open]);

  if (!open) return null;

  const pickThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingThumb(true);
    uploadImageAsset(file)
      .then(asset => {
        setThumbAssetId(asset.id);
        setThumbUrl(asset.public_url ?? null);
      })
      .catch(() => toast.error('Tải ảnh thất bại'))
      .finally(() => setUploadingThumb(false));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (!formTags.includes(t)) setFormTags(prev => [...prev, t]);
    setTagInput('');
  };
  const removeTag = (t: string) =>
    setFormTags(prev => prev.filter(x => x !== t));

  const handleCreate = async () => {
    const name = formName.trim();
    if (!name) {
      toast.error('Tên block không được rỗng');
      return;
    }
    setAdding(true);
    try {
      // Block tạo mới = brief RỖNG (settings tối thiểu, không demo content).
      const block = placeholderSettings(DEFAULT_TYPE, name);
      const created = await rexerApi.blocks.create({
        type_code: DEFAULT_TYPE,
        name,
        description: formDesc.trim() || undefined,
        tags: formTags,
        settings: block as unknown as Record<string, unknown>,
        scope: 'brand_private',
        ...(thumbAssetId ? { thumbnail_asset_id: thumbAssetId } : {}),
        // Taxonomy AI per-block (BE persist từ 2026-06-19).
        ...taxonomyToPayload(formTax),
        // Block mới luôn vào 'draft' → marketing/dev xử lý rồi mới publish.
        status: 'draft',
        review_note: formNote.trim() || undefined,
      });
      toast.success(`Đã thêm "${created.name}" vào thư viện`);
      onAdded?.(created.id);
      onClose();
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : 'unknown';
      toast.error(`Không thêm được: ${msg}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='bg-card my-8 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm'>
              <Plus className='size-4' strokeWidth={2.5} />
            </div>
            <div className='leading-tight'>
              <h3 className='text-base font-semibold'>Tạo block mới</h3>
              <p className='text-2xs text-content-muted'>
                Brief block cần làm — dev triển khai rồi publish sau.
              </p>
            </div>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onClose}
            aria-label='Close'
          >
            <X className='size-4' />
          </Button>
        </div>

        {/* Body */}
        <div className='max-h-[68vh] overflow-y-auto px-5 py-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <Label htmlFor='ab-name'>
                Tên <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='ab-name'
                autoFocus
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder='VD: Hero chia đôi cho trang chủ…'
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
                    disabled={uploadingThumb}
                  >
                    {uploadingThumb ? (
                      <Loader2 className='size-3.5 animate-spin' />
                    ) : (
                      <ImagePlus className='size-3.5' />
                    )}
                    {uploadingThumb
                      ? 'Đang tải…'
                      : thumbUrl
                        ? 'Đổi ảnh'
                        : 'Tải ảnh'}
                  </Button>
                  <p className='text-3xs text-muted-foreground mt-1'>
                    Tuỳ chọn. Bỏ trống → tự render từ nội dung block.
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
              <Label htmlFor='ab-desc'>Mô tả</Label>
              <Textarea
                id='ab-desc'
                value={formDesc}
                rows={2}
                onChange={e => setFormDesc(e.target.value)}
                placeholder='Ghi chú ngắn về block này…'
              />
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='ab-note'>Ghi chú nội bộ (brief)</Label>
              <Textarea
                id='ab-note'
                value={formNote}
                rows={2}
                onChange={e => setFormNote(e.target.value)}
                placeholder='Marketing mô tả block cần làm để dev triển khai…'
              />
              <p className='text-3xs text-muted-foreground'>
                Block mới vào trạng thái <b className='text-amber-700'>Nháp</b>{' '}
                — cần review &amp; publish ở trang Blocks trước khi user dùng.
              </p>
            </div>

            <div className='flex flex-col gap-1'>
              <Label htmlFor='ab-tags'>Tags</Label>
              {formTags.length > 0 && (
                <div className='flex flex-wrap items-center gap-1.5'>
                  {formTags.map(t => (
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
              )}
              <Input
                id='ab-tags'
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

            <BlockTaxonomyFields value={formTax} onChange={setFormTax} />
          </div>
        </div>

        {/* Footer */}
        <div className='border-border bg-card flex items-center justify-end gap-2 border-t px-5 py-3'>
          <Button
            type='button'
            variant='neutral'
            size='sm'
            onClick={onClose}
            disabled={adding}
          >
            Huỷ
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={handleCreate}
            disabled={adding}
          >
            {adding && <Loader2 className='size-3.5 animate-spin' />}
            Tạo block
          </Button>
        </div>
      </div>
    </div>
  );
}
