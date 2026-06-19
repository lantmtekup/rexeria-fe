'use client';

import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { uploadImageAsset } from '@/lib/upload/media-asset';
import { cn } from '@/lib/cn';
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
  // AI recommendation taxonomy (migration 000033).
  fn: string; // 'function' là reserved-ish — dùng `fn` trong state
  page_role: string;
  proof_type: string;
  needs_media: string;
  has_cta: boolean;
  funnel_stage: string[];
  goal_tags: string[];
  tone: string[];
  industry_fit: string[];
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
    fn: '',
    page_role: '',
    proof_type: '',
    needs_media: 'none',
    has_cta: false,
    funnel_stage: [],
    goal_tags: [],
    tone: [],
    industry_fit: [],
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
    fn: it.function ?? '',
    page_role: it.page_role ?? '',
    proof_type: it.proof_type ?? '',
    needs_media: it.needs_media ?? 'none',
    has_cta: it.has_cta ?? false,
    funnel_stage: it.funnel_stage ?? [],
    goal_tags: it.goal_tags ?? [],
    tone: it.tone ?? [],
    industry_fit: it.industry_fit ?? [],
  };
}

// BE convention — block type code: snake_case, lowercase, 2-64 chars.
const TYPE_RE = /^[a-z][a-z0-9_]{1,63}$/;

// AI taxonomy options — đồng bộ enum BE (validate `oneof`).
const FUNCTION_OPTS = [
  'hook',
  'pain',
  'value_prop',
  'how_it_works',
  'benefits',
  'social_proof',
  'objection',
  'offer',
  'urgency',
  'lead_capture',
  'final_cta',
];
const PAGE_ROLE_OPTS = ['opener', 'body', 'closer'];
const PROOF_TYPE_OPTS = ['logos', 'testimonial', 'stats', 'review'];
const NEEDS_MEDIA_OPTS = ['image', 'video', 'none'];
const FUNNEL_OPTS = ['awareness', 'consideration', 'conversion', 'retention'];
const GOAL_OPTS = ['lead_gen', 'sales', 'awareness', 'launch', 'event'];
const TONE_OPTS = ['warm', 'minimal', 'bold', 'corporate', 'playful'];

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
  const [industryInput, setIndustryInput] = React.useState('');
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

  const toggleIn = (key: 'funnel_stage' | 'goal_tags' | 'tone', v: string) =>
    setData(d => ({
      ...d,
      [key]: d[key].includes(v) ? d[key].filter(x => x !== v) : [...d[key], v],
    }));

  const addIndustry = () => {
    const v = industryInput.trim().toLowerCase();
    if (!v) return;
    setData(d =>
      d.industry_fit.includes(v)
        ? d
        : { ...d, industry_fit: [...d.industry_fit, v] }
    );
    setIndustryInput('');
  };
  const removeIndustry = (v: string) =>
    setData(d => ({ ...d, industry_fit: d.industry_fit.filter(x => x !== v) }));

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
          function: data.fn || undefined,
          funnel_stage: data.funnel_stage,
          goal_tags: data.goal_tags,
          industry_fit: data.industry_fit,
          tone: data.tone,
          page_role: data.page_role || undefined,
          proof_type: data.proof_type || undefined,
          needs_media: data.needs_media || undefined,
          has_cta: data.has_cta,
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
          function: data.fn || undefined,
          funnel_stage: data.funnel_stage,
          goal_tags: data.goal_tags,
          industry_fit: data.industry_fit,
          tone: data.tone,
          page_role: data.page_role || undefined,
          proof_type: data.proof_type || undefined,
          needs_media: data.needs_media || undefined,
          has_cta: data.has_cta,
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

          {/* ── AI recommendation taxonomy (migration 000033) ── */}
          <div className='border-border flex flex-col gap-4 rounded-lg border border-dashed p-3'>
            <div>
              <p className='text-content-muted text-xs font-semibold tracking-wide uppercase'>
                Taxonomy cho AI gợi ý
              </p>
              <p className='text-2xs text-content-muted mt-0.5'>
                Engine recommend_blocks khớp brief (mục tiêu / ngành / giai đoạn
                phễu / tông giọng) với các tín hiệu này khi chọn block.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <MetaSelect
                id='blk-fn'
                label='Function (vai trò trong recipe)'
                value={data.fn}
                options={FUNCTION_OPTS}
                onChange={v => setData(d => ({ ...d, fn: v }))}
              />
              <MetaSelect
                id='blk-page-role'
                label='Vị trí trang'
                value={data.page_role}
                options={PAGE_ROLE_OPTS}
                onChange={v => setData(d => ({ ...d, page_role: v }))}
              />
              <MetaSelect
                id='blk-proof'
                label='Loại proof'
                value={data.proof_type}
                options={PROOF_TYPE_OPTS}
                onChange={v => setData(d => ({ ...d, proof_type: v }))}
              />
              <MetaSelect
                id='blk-media'
                label='Cần media'
                value={data.needs_media}
                options={NEEDS_MEDIA_OPTS}
                placeholder='— none —'
                onChange={v => setData(d => ({ ...d, needs_media: v }))}
              />
            </div>

            <TagToggleGroup
              label='Giai đoạn phễu (funnel_stage)'
              options={FUNNEL_OPTS}
              selected={data.funnel_stage}
              onToggle={v => toggleIn('funnel_stage', v)}
            />
            <TagToggleGroup
              label='Mục tiêu (goal_tags)'
              options={GOAL_OPTS}
              selected={data.goal_tags}
              onToggle={v => toggleIn('goal_tags', v)}
            />
            <TagToggleGroup
              label='Tông giọng (tone)'
              options={TONE_OPTS}
              selected={data.tone}
              onToggle={v => toggleIn('tone', v)}
            />

            <div className='flex flex-col gap-1'>
              <Label htmlFor='blk-industry'>Ngành phù hợp (industry_fit)</Label>
              {data.industry_fit.length > 0 && (
                <div className='flex flex-wrap items-center gap-1.5'>
                  {data.industry_fit.map(v => (
                    <span
                      key={v}
                      className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
                    >
                      {v}
                      <button
                        type='button'
                        onClick={() => removeIndustry(v)}
                        className='text-content-muted hover:text-foreground'
                        aria-label={`Bỏ ${v}`}
                      >
                        <X className='size-3' />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                id='blk-industry'
                value={industryInput}
                onChange={e => setIndustryInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIndustry();
                  }
                }}
                onBlur={addIndustry}
                placeholder='agnostic, saas, fnb… (Enter để thêm)'
              />
            </div>

            <label className='inline-flex w-fit cursor-pointer items-center gap-2'>
              <Switch
                checked={data.has_cta}
                onCheckedChange={v => setData(d => ({ ...d, has_cta: v }))}
              />
              <span className='text-sm'>Có call-to-action (has_cta)</span>
            </label>
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

/** Native single-select cho 1 thuộc tính taxonomy (option rỗng = không chọn). */
function MetaSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = '— Không chọn —',
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='border-border h-9 rounded-md border bg-white px-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      >
        <option value=''>{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Nhóm chip bật/tắt cho thuộc tính taxonomy dạng mảng (multi-select). */
function TagToggleGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <Label>{label}</Label>
      <div className='flex flex-wrap gap-1.5'>
        {options.map(o => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type='button'
              onClick={() => onToggle(o)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                on
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-border text-content-muted hover:bg-muted bg-white'
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
