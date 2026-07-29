'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Check,
  ChevronsUpDown,
  ImagePlus,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Textarea } from '@/components/atoms/textarea';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Block, BlockStatus } from '@/services/rexer/types';
import {
  BLOCK_TYPE_META,
  type BlockType,
} from '@/components/modules/block-editor/types';
import { createBlock } from '@/components/modules/block-editor/factory';
import {
  BLOCK_STATUS_META,
  BLOCK_STATUS_ORDER,
  effectiveBlockStatus,
} from '@/lib/block-status';
import { BlockStatusHistory } from '@/components/modules/Blocks/BlockStatusHistory';

export interface EditBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Block đang sửa. Null → dialog đóng. */
  block: Block | null;
  /** Gọi sau khi PATCH thành công để list cập nhật. */
  onSaved: (updated: Block) => void;
  /**
   * type_code đã được map vào ít nhất 1 block ("đã assign"). Combobox Mapping
   * code ẩn các type này (giữ lại type của chính block hiện tại) để dev chỉ
   * thấy block mới code xong chưa gán. Bật "Hiện cả type đã mapping" để xem hết.
   */
  usedTypeCodes?: Set<string>;
}

interface MappingOption {
  code: string;
  label: string;
}

/**
 * Combobox chọn Mapping code: search theo tên + ẩn type đã mapping.
 * Thay cho native `<select>` 98 option phẳng. Theo mẫu IconPicker (Popover +
 * search). Luôn giữ option của `currentCode` (kể cả khi nó đã "đã dùng") để
 * trigger hiển thị đúng giá trị đang chọn.
 */
function MappingCodeCombobox({
  value,
  onChange,
  options,
  usedTypeCodes,
  currentCode,
}: {
  value: string;
  onChange: (code: string) => void;
  options: MappingOption[];
  usedTypeCodes?: Set<string>;
  currentCode?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [showAll, setShowAll] = React.useState(false);

  const usedCount = React.useMemo(
    () =>
      usedTypeCodes
        ? options.filter(
            o => usedTypeCodes.has(o.code) && o.code !== currentCode
          ).length
        : 0,
    [options, usedTypeCodes, currentCode]
  );

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(o => {
      // Ẩn type đã mapping (trừ type của chính block này) khi chưa bật showAll.
      const used = usedTypeCodes?.has(o.code) && o.code !== currentCode;
      if (used && !showAll) return false;
      if (!q) return true;
      return (
        o.label.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)
      );
    });
  }, [options, query, showAll, usedTypeCodes, currentCode]);

  const activeLabel =
    options.find(o => o.code === value)?.label || value || 'Chọn mapping code';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          id='eb-type'
          className='border-input bg-background hover:border-ring/60 focus:ring-ring/40 flex h-9 items-center justify-between gap-2 rounded-md border px-2.5 text-sm outline-none focus:ring-2'
        >
          <span className='truncate'>{activeLabel}</span>
          <ChevronsUpDown className='text-muted-foreground size-3.5 shrink-0' />
        </button>
      </Popover.Trigger>
      {/* KHÔNG Portal: Dialog dùng RemoveScroll khoá scroll ngoài dialog →
          popover portalled (ngoài DOM dialog) bị chặn wheel. Render in-place
          (vẫn position:fixed nên không bị overflow dialog cắt) để list scroll
          được. */}
      <Popover.Content
        align='start'
        sideOffset={6}
        onOpenAutoFocus={e => e.preventDefault()}
        className='border-border bg-popover z-50 w-[var(--radix-popover-trigger-width)] min-w-72 rounded-md border p-2 shadow-xl ring-1 ring-black/5 outline-none'
      >
        <div className='border-border bg-muted/40 mb-2 flex items-center gap-1.5 rounded-md border px-2'>
          <Search className='text-muted-foreground size-3.5 shrink-0' />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Tìm theo tên (vd: hero, gallery)…'
            className='h-7 flex-1 bg-transparent text-xs outline-none'
          />
        </div>
        <div className='max-h-64 overflow-y-auto'>
          {visible.map(o => {
            const active = o.code === value;
            return (
              <button
                key={o.code}
                type='button'
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors',
                  active
                    ? 'bg-foreground text-background'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <span className='truncate'>{o.label}</span>
                {active && <Check className='size-3.5 shrink-0' />}
              </button>
            );
          })}
          {visible.length === 0 && (
            <div className='text-2xs text-muted-foreground py-4 text-center'>
              Không tìm thấy mapping code phù hợp
            </div>
          )}
        </div>
        {usedCount > 0 && (
          <button
            type='button'
            onClick={() => setShowAll(s => !s)}
            className='text-2xs text-muted-foreground hover:text-foreground border-border mt-1 w-full border-t pt-1.5 text-center transition-colors'
          >
            {showAll
              ? `Ẩn ${usedCount} type đã mapping`
              : `Hiện cả ${usedCount} type đã mapping`}
          </button>
        )}
      </Popover.Content>
    </Popover.Root>
  );
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
  onSaved,
  usedTypeCodes,
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
  const [tab, setTab] = React.useState('info');

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
      setTab('info');
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

  // Options từ registry FE BLOCK_TYPE_META (nguồn duy nhất). Nếu type_code hiện
  // tại không nằm trong registry (type cũ/đã gỡ) thì vẫn thêm 1 option để select
  // không bị trống.
  const typeOptions = React.useMemo(() => {
    const opts = Object.values(BLOCK_TYPE_META).map(m => ({
      code: m.type as string,
      label: m.adminLabel || m.label,
    }));
    const cur = block?.type_code;
    if (cur && !opts.some(o => o.code === cur)) {
      opts.unshift({ code: cur, label: `${cur} (không còn trong catalog)` });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [block?.type_code]);

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
      setTab('info');
      toast.error('Tên block không được rỗng');
      return;
    }
    setSubmitting(true);
    try {
      // Đổi loại block → rebuild `settings` sang block mặc định của type mới,
      // để nhãn + nội dung/preview khớp NGAY (settings cũ dựng cho type cũ nên
      // vô dụng + gây lệch type_code vs settings.blockType). Giữ lại id editor
      // block để định danh ổn định.
      const typeChanged = !!typeCode && typeCode !== block.type_code;
      let typePatch: {
        type_code?: string;
        settings?: Record<string, unknown>;
      } = {};
      if (typeChanged) {
        const fresh = createBlock(typeCode as BlockType);
        fresh.name = trimmedName;
        const prevId = (block.settings as { id?: string } | undefined)?.id;
        if (prevId) fresh.id = prevId;
        typePatch = {
          type_code: typeCode,
          settings: fresh as unknown as Record<string, unknown>,
        };
      }

      const updated = await rexerApi.blocks.update(block.id, {
        name: trimmedName,
        description: description.trim() || undefined,
        tags,
        // Đổi loại block: gửi type_code + settings mới (BE hỗ trợ PATCH 2026-06-18).
        ...typePatch,
        // Thumbnail tuỳ chỉnh — chỉ gửi khi user vừa upload ảnh mới.
        ...(thumbAssetId ? { thumbnail_asset_id: thumbAssetId } : {}),
        // Taxonomy AI per-block (BE persist từ 2026-06-19).
        ...taxonomyToPayload(tax),
        // Lifecycle duyệt (BE 000035 — chờ deploy).
        status,
        review_note: reviewNote.trim(),
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
      <DialogContent
        aria-describedby={undefined}
        className='max-h-[88vh] overflow-y-auto sm:max-w-xl'
      >
        <DialogHeader>
          <DialogTitle>Sửa thông tin block</DialogTitle>
        </DialogHeader>

        <Tabs.Root value={tab} onValueChange={setTab}>
          <Tabs.List className='border-border mb-4 flex gap-1 border-b'>
            <Tabs.Trigger
              value='info'
              className='data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors'
            >
              Thông tin
            </Tabs.Trigger>
            <Tabs.Trigger
              value='mapping'
              className='data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors'
            >
              Phân loại
            </Tabs.Trigger>
            <Tabs.Trigger
              value='review'
              className='data-[state=active]:border-foreground data-[state=active]:text-foreground text-muted-foreground -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors'
            >
              Duyệt
            </Tabs.Trigger>
          </Tabs.List>

          {/* ── Tab 1: Thông tin (marketing) ───────────────────── */}
          <Tabs.Content
            value='info'
            className='flex flex-col gap-4 focus:outline-none'
          >
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
              <Label htmlFor='eb-type'>Mapping code</Label>
              <p className='text-2xs text-muted-foreground'>
                Code/component dùng để render block này (dev gắn code đã viết
                vào block).
              </p>
              <MappingCodeCombobox
                value={typeCode}
                onChange={setTypeCode}
                options={typeOptions}
                usedTypeCodes={usedTypeCodes}
                currentCode={block?.type_code}
              />
              {typeCode !== (block?.type_code ?? '') && (
                <p className='text-2xs text-amber-600'>
                  ⚠ Đổi loại block: nội dung sẽ được DỰNG LẠI theo mặc định của
                  loại mới khi lưu (nội dung cũ bị thay). Mở block editor để
                  chỉnh tiếp.
                </p>
              )}
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
          </Tabs.Content>

          {/* ── Tab 2: Phân loại (taxonomy AI) ──────────────────── */}
          <Tabs.Content
            value='mapping'
            className='flex flex-col gap-4 focus:outline-none'
          >
            <BlockTaxonomyFields value={tax} onChange={setTax} />
          </Tabs.Content>

          {/* ── Tab 3: Duyệt (quy trình) ────────────────────────── */}
          <Tabs.Content
            value='review'
            className='flex flex-col gap-4 focus:outline-none'
          >
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

            {/* Lịch sử đổi trạng thái — theo dõi tiến độ (ai đổi, lúc nào). */}
            {block && <BlockStatusHistory block={block} />}
          </Tabs.Content>
        </Tabs.Root>

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
