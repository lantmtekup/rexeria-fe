'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ImageIcon,
  Italic,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Strikethrough,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIBlockType } from '@/services/rexer/types';

import { FEATURE_ICON_OPTIONS } from './blocks/FeatureSection';
import { buildAiPrompt } from './buildAiPrompt';
import { ImagePicker } from './ImagePicker';
import {
  editingVariantOf,
  readVariant,
  type Block,
  type BlockBackground,
  type BlockContent,
  type BookingFormContent,
  type Device,
  type ElementStyle,
  type FeatureSectionContent,
  type HeroSplitContent,
  type ImageTransform,
  type Lang,
  type PhotoGalleryContent,
} from './types';

type ElementKind =
  | 'text'
  | 'image'
  | 'stats'
  | 'features'
  | 'photos'
  | 'reasons'
  | 'background';

export const BACKGROUND_LAYER_KEY = '__background__';

const ELEMENT_KIND: Record<string, ElementKind> = {
  eyebrow: 'text',
  title: 'text',
  tag: 'text',
  description: 'text',
  subtitle: 'text',
  ctaText: 'text',
  submitText: 'text',
  noteText: 'text',
  primaryText: 'text',
  secondaryText: 'text',
  imageUrl: 'image',
  backgroundUrl: 'image',
  stats: 'stats',
  features: 'features',
  photos: 'photos',
  reasons: 'reasons',
  [BACKGROUND_LAYER_KEY]: 'background',
};

const ELEMENT_LABEL: Record<string, string> = {
  eyebrow: 'Eyebrow',
  title: 'Tiêu đề',
  tag: 'Tag',
  description: 'Mô tả',
  subtitle: 'Mô tả',
  ctaText: 'Nút CTA',
  submitText: 'Nút gửi',
  noteText: 'Ghi chú',
  primaryText: 'Nút CTA chính',
  secondaryText: 'Nút CTA phụ',
  imageUrl: 'Ảnh hero',
  backgroundUrl: 'Ảnh nền',
  stats: 'Thống kê',
  features: 'Tiện ích',
  photos: 'Bộ ảnh',
  reasons: 'Lý do',
  [BACKGROUND_LAYER_KEY]: 'Nền',
};

interface ElementToolbarProps {
  block: Block;
  lang: Lang;
  device: Device;
  selectedKey: string | null;
  onClose: () => void;
  onContentChange: (next: BlockContent) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  onSyncVariant?: (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => void;
}

export function ElementToolbar({
  block,
  lang,
  device,
  selectedKey,
  onClose,
  onContentChange,
  onUpdateStyle,
  onResetStyle,
  onUpdateBackground,
  onSyncVariant,
}: ElementToolbarProps) {
  // Tablet renders desktop layout — slim banner makes the read-only state explicit.
  if (device === 'tablet') {
    return (
      <div className='flex h-10 shrink-0 items-center gap-2 border-b border-amber-200/70 bg-amber-50/60 px-3'>
        <div className='size-1.5 rounded-full bg-amber-500' aria-hidden />
        <span className='text-[11px] text-amber-800'>
          Tablet đang xem layout{' '}
          <strong className='font-semibold'>Desktop</strong> (chỉ đọc) — chuyển
          Desktop hoặc Mobile để chỉnh sửa.
        </span>
      </div>
    );
  }

  if (!selectedKey) {
    return (
      <div className='flex h-10 shrink-0 items-center gap-2 border-b border-neutral-200/80 bg-neutral-50/70 px-3'>
        <Layers className='size-3 text-neutral-400' />
        <span className='text-[11px] tracking-tight text-neutral-500'>
          Đang sửa{' '}
          <span className='font-mono text-[10px] font-semibold tracking-[0.14em] text-neutral-700 uppercase'>
            {device === 'mobile' ? 'Mobile' : 'Desktop'}
          </span>{' '}
          · click vào element trên canvas (hoặc chọn lớp ở phải) để bắt đầu
        </span>
        {onSyncVariant && (
          <button
            type='button'
            onClick={() =>
              onSyncVariant(
                device === 'mobile' ? 'desktop' : 'mobile',
                device === 'mobile' ? 'mobile' : 'desktop'
              )
            }
            className='ml-auto flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-white px-2 text-[10px] font-semibold tracking-tight text-neutral-700 ring-1 ring-neutral-200/80 transition-colors hover:text-neutral-900 hover:ring-neutral-300'
          >
            {device === 'mobile'
              ? 'Copy Desktop → Mobile'
              : 'Copy Mobile → Desktop'}
          </button>
        )}
      </div>
    );
  }

  const kind = ELEMENT_KIND[selectedKey] ?? 'text';
  const label = ELEMENT_LABEL[selectedKey] ?? selectedKey;
  const variant = editingVariantOf(device);
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  // Read content for the variant being edited, falling back to desktop
  // (so when mobile is undefined, the toolbar still shows desktop values).
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const style: ElementStyle | undefined =
    block.elementStyles?.[variant]?.[selectedKey];

  const handleDelete = () => {
    const c = content as Record<string, unknown>;
    if (kind === 'background') {
      onUpdateBackground(undefined);
      toast.success('Đã xoá nền');
      onClose();
      return;
    }
    if (!window.confirm(`Xoá nội dung "${label}"?`)) return;

    let nextValue: unknown;
    if (kind === 'text' || kind === 'image') nextValue = '';
    else nextValue = [];

    onContentChange({
      ...c,
      [selectedKey]: nextValue,
    } as BlockContent);
    if (kind === 'text') onResetStyle();
    toast.success(`Đã xoá ${label.toLowerCase()}`);
    onClose();
  };

  const handleAi = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Nhập mô tả trước khi tạo nội dung AI');
      return;
    }
    try {
      const richPrompt = buildAiPrompt({
        userPrompt: prompt.trim(),
        blockType: block.blockType,
        blockName: block.name,
        selectedField: selectedKey,
        currentContent: content,
        lang,
      });

      const res = await rexerApi.ai.blockContent({
        block_type: block.blockType as AIBlockType,
        prompt: richPrompt,
        lang,
        current_content: content as Record<string, unknown>,
        selected_field: selectedKey,
        block_name: block.name,
      });
      const c = res.content as Record<string, unknown>;
      if (selectedKey in c) {
        onContentChange({
          ...(content as Record<string, unknown>),
          [selectedKey]: c[selectedKey],
        } as BlockContent);
        toast.success(
          res.source === 'ai'
            ? `AI đã đề xuất ${label}`
            : `Đã dùng nội dung mẫu cho ${label}`
        );
      } else {
        toast.error('AI không trả về trường này');
      }
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`AI thất bại: ${msg}`);
    }
  };

  return (
    <div className='flex h-11 shrink-0 items-center gap-1.5 border-b border-neutral-200/80 bg-neutral-50/60 px-2.5'>
      {/* Element label pill — refined indigo accent */}
      <div className='flex shrink-0 items-center gap-1.5 rounded-md bg-indigo-50/80 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-indigo-700 uppercase'>
        <span className='size-1.5 rounded-full bg-indigo-500' aria-hidden />
        {label}
      </div>

      <Sep />

      {/* Contextual controls track — borderless, separated by hairline dividers */}
      <div className='flex min-w-0 flex-1 items-center gap-1 overflow-x-auto'>
        {kind === 'text' && (
          <TextControls
            fieldKey={selectedKey}
            content={content}
            style={style}
            onContentChange={onContentChange}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
          />
        )}
        {kind === 'image' && (
          <ImageControls
            block={block}
            fieldKey={selectedKey}
            content={content}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'stats' && (
          <StatsControls
            content={content as HeroSplitContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'features' && (
          <FeaturesControls
            content={content as FeatureSectionContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'photos' && (
          <PhotosControls
            content={content as PhotoGalleryContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'reasons' && (
          <ReasonsControls
            content={content as BookingFormContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'background' && (
          <BackgroundControls
            background={readVariant(block.background, device)}
            onUpdate={onUpdateBackground}
          />
        )}
      </div>

      {/* Right · AI · delete · close */}
      <Sep />
      <div className='flex shrink-0 items-center gap-0.5'>
        <AiButton onAi={handleAi} blockType={block.blockType} />
        <button
          type='button'
          onClick={handleDelete}
          aria-label='Xoá nội dung'
          title='Xoá nội dung'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
        >
          <Trash2 className='size-3.5' />
        </button>
        <button
          type='button'
          onClick={onClose}
          aria-label='Bỏ chọn'
          title='Bỏ chọn'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
        >
          <X className='size-4' />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── TEXT CONTROLS

function TextControls({
  fieldKey,
  content,
  style,
  onContentChange,
  onUpdateStyle,
  onResetStyle,
}: {
  fieldKey: string;
  content: BlockContent;
  style?: ElementStyle;
  onContentChange: (next: BlockContent) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
}) {
  const value =
    typeof (content as Record<string, unknown>)[fieldKey] === 'string'
      ? ((content as Record<string, string>)[fieldKey] ?? '')
      : '';
  const isLong =
    fieldKey === 'description' ||
    fieldKey === 'subtitle' ||
    fieldKey === 'noteText';
  const fontSize = style?.fontSize ?? '';

  const setField = (next: string) => {
    onContentChange({
      ...(content as Record<string, unknown>),
      [fieldKey]: next,
    } as BlockContent);
  };

  return (
    <>
      {/* Inline text input (compact for short, popover for long) */}
      {isLong ? (
        <PopoverTrigger
          label='Nội dung'
          preview={value || '(trống)'}
          width={420}
        >
          <Textarea
            autoFocus
            value={value}
            onChange={e => setField(e.target.value)}
            placeholder='Nội dung…'
            className='min-h-32 resize-none border-neutral-200 bg-white text-sm leading-6'
          />
        </PopoverTrigger>
      ) : (
        <input
          value={value}
          onChange={e => setField(e.target.value)}
          placeholder='Nội dung…'
          className='h-7 w-56 rounded-md bg-white px-2 text-xs text-neutral-900 ring-1 ring-neutral-200/80 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
        />
      )}

      <Sep />

      {/* Font size — borderless inline label + mono number */}
      <InlineLabel label='Cỡ'>
        <input
          type='number'
          min={10}
          max={120}
          value={fontSize === '' ? '' : fontSize}
          onChange={e => {
            const n = Number(e.target.value);
            if (Number.isNaN(n)) return;
            onUpdateStyle({ fontSize: n });
          }}
          placeholder='—'
          className='h-7 w-12 rounded-md bg-white px-1.5 font-mono text-[11px] text-neutral-900 tabular-nums ring-1 ring-neutral-200/80 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:ring-2 focus:ring-neutral-900/15 focus:outline-none'
        />
      </InlineLabel>

      <Sep />

      {/* Style toggles — direct row, no group border */}
      <div className='flex items-center'>
        <ToolbarBtn
          active={style?.fontWeight === 700}
          onClick={() =>
            onUpdateStyle({
              fontWeight: style?.fontWeight === 700 ? 400 : 700,
            })
          }
          label='In đậm'
        >
          <Bold className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.fontStyle === 'italic'}
          onClick={() =>
            onUpdateStyle({
              fontStyle: style?.fontStyle === 'italic' ? 'normal' : 'italic',
            })
          }
          label='In nghiêng'
        >
          <Italic className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textDecoration === 'underline'}
          onClick={() =>
            onUpdateStyle({
              textDecoration:
                style?.textDecoration === 'underline' ? 'none' : 'underline',
            })
          }
          label='Gạch chân'
        >
          <Underline className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textDecoration === 'line-through'}
          onClick={() =>
            onUpdateStyle({
              textDecoration:
                style?.textDecoration === 'line-through'
                  ? 'none'
                  : 'line-through',
            })
          }
          label='Gạch ngang'
        >
          <Strikethrough className='size-3.5' />
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Alignment */}
      <div className='flex items-center'>
        <ToolbarBtn
          active={style?.textAlign === 'left'}
          onClick={() => onUpdateStyle({ textAlign: 'left' })}
          label='Trái'
        >
          <AlignLeft className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'center'}
          onClick={() => onUpdateStyle({ textAlign: 'center' })}
          label='Giữa'
        >
          <AlignCenter className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'right'}
          onClick={() => onUpdateStyle({ textAlign: 'right' })}
          label='Phải'
        >
          <AlignRight className='size-3.5' />
        </ToolbarBtn>
        <ToolbarBtn
          active={style?.textAlign === 'justify'}
          onClick={() => onUpdateStyle({ textAlign: 'justify' })}
          label='Đều'
        >
          <AlignJustify className='size-3.5' />
        </ToolbarBtn>
      </div>

      <Sep />

      {/* Color */}
      <ColorSwatch
        label='Màu'
        value={style?.color ?? '#111111'}
        onChange={c => onUpdateStyle({ color: c })}
      />

      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────── IMAGE CONTROLS

function ImageControls({
  block,
  fieldKey,
  content,
  onContentChange,
}: {
  block: Block;
  fieldKey: string;
  content: BlockContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const transformKey =
    fieldKey === 'imageUrl'
      ? 'imageTransform'
      : fieldKey === 'backgroundUrl'
        ? 'backgroundTransform'
        : null;

  const c = content as Record<string, unknown>;
  const url = (c[fieldKey] as string) ?? '';
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  const setUrl = (next: string) => {
    onContentChange({ ...c, [fieldKey]: next } as BlockContent);
  };
  const setTransform = (next: ImageTransform) => {
    if (!transformKey) return;
    onContentChange({ ...c, [transformKey]: next } as BlockContent);
  };

  return (
    <>
      <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
        {block.blockType.replace('_', ' ')}
      </span>

      <Sep />

      <PopoverTrigger
        label='Quản lý ảnh'
        preview={url ? '✓ Đã chọn ảnh' : 'Chưa chọn'}
        icon={<ImageIcon className='size-3.5' />}
        width={420}
      >
        <ImagePicker
          value={url}
          onChange={setUrl}
          transform={transform}
          onTransformChange={transformKey ? setTransform : undefined}
        />
      </PopoverTrigger>
    </>
  );
}

// ─────────────────────────────────────────────────────────── BACKGROUND

function BackgroundControls({
  background,
  onUpdate,
}: {
  background: BlockBackground | undefined;
  onUpdate: (next: BlockBackground | undefined) => void;
}) {
  const color = background?.color ?? '';
  const imageUrl = background?.imageUrl ?? '';

  const setColor = (next: string) => {
    onUpdate({ ...background, color: next || undefined });
  };
  const setImage = (next: string) => {
    onUpdate({ ...background, imageUrl: next || undefined });
  };
  const reset = () => onUpdate(undefined);

  const PRESETS = [
    '#ffffff',
    '#f5f5f4',
    '#0a0a0a',
    '#1f2937',
    '#0f766e',
    '#7c3aed',
    '#be123c',
    '#0ea5e9',
  ];

  return (
    <>
      <ColorSwatch label='Màu' value={color || '#ffffff'} onChange={setColor} />

      <div className='flex items-center gap-1'>
        {PRESETS.map(c => (
          <button
            key={c}
            type='button'
            onClick={() => setColor(c)}
            aria-label={`Đặt màu ${c}`}
            title={c}
            className='size-4 cursor-pointer rounded-sm ring-1 ring-black/[0.06] transition-transform hover:scale-110'
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <Sep />

      <PopoverTrigger
        label='Ảnh nền'
        preview={imageUrl ? '✓ Đã chọn' : 'Không'}
        icon={<ImageIcon className='size-3.5' />}
        width={360}
      >
        <ImagePicker value={imageUrl} onChange={setImage} />
        <p className='mt-2 text-[10px] text-neutral-400'>
          Ảnh nền sẽ phủ lên màu nền (cover, canh giữa).
        </p>
      </PopoverTrigger>

      <button
        type='button'
        onClick={reset}
        disabled={!background}
        title='Khôi phục nền mặc định'
        aria-label='Khôi phục nền mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────── STATS CONTROLS

function StatsControls({
  content,
  onContentChange,
}: {
  content: HeroSplitContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<HeroSplitContent['stats'][number]>
  ) => {
    onContentChange({
      ...content,
      stats: content.stats.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      stats: content.stats.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      stats: [...content.stats, { value: 'Mới', label: 'thông số' }],
    });

  return (
    <PopoverTrigger
      label='Danh sách thông số'
      preview={`${content.stats.length} mục`}
      width={420}
    >
      <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
        {content.stats.map((s, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <Input
              value={s.value}
              onChange={e => update(i, { value: e.target.value })}
              placeholder='Giá trị'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Input
              value={s.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label='Xoá'
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm thông số' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── FEATURES

function FeaturesControls({
  content,
  onContentChange,
}: {
  content: FeatureSectionContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<FeatureSectionContent['features'][number]>
  ) => {
    onContentChange({
      ...content,
      features: content.features.map((f, idx) =>
        idx === i ? { ...f, ...patch } : f
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      features: content.features.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      features: [
        ...content.features,
        { icon: 'Sparkles', label: 'Tiện ích mới', body: 'Mô tả tiện ích.' },
      ],
    });

  return (
    <PopoverTrigger
      label='Danh sách tiện ích'
      preview={`${content.features.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {content.features.map((f, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <select
                value={f.icon}
                onChange={e => update(i, { icon: e.target.value })}
                className='h-7 flex-1 rounded border border-neutral-200 bg-white px-2 text-xs text-neutral-700'
              >
                {FEATURE_ICON_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá'
                className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={f.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Tên tiện ích'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Textarea
              value={f.body}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả tiện ích'
              className='min-h-12 resize-none border-neutral-200 bg-white text-xs leading-5'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm tiện ích' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── PHOTOS

function PhotosControls({
  content,
  onContentChange,
}: {
  content: PhotoGalleryContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<PhotoGalleryContent['photos'][number]>
  ) => {
    onContentChange({
      ...content,
      photos: content.photos.map((p, idx) =>
        idx === i ? { ...p, ...patch } : p
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      photos: content.photos.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      photos: [
        ...content.photos,
        {
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          caption: 'Mô tả ảnh',
        },
      ],
    });

  return (
    <PopoverTrigger
      label='Bộ ảnh'
      preview={`${content.photos.length} ảnh`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {content.photos.map((photo, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between'>
              <span className='text-[10px] font-semibold tracking-widest text-neutral-500 uppercase'>
                Ảnh {i + 1}
              </span>
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá'
                className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <ImagePicker
              value={photo.url}
              onChange={url => update(i, { url })}
              transform={photo.transform}
              onTransformChange={transform => update(i, { transform })}
            />
            <Input
              value={photo.caption}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption (để trống nếu không cần)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── REASONS

function ReasonsControls({
  content,
  onContentChange,
}: {
  content: BookingFormContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const update = (
    i: number,
    patch: Partial<BookingFormContent['reasons'][number]>
  ) => {
    onContentChange({
      ...content,
      reasons: content.reasons.map((r, idx) =>
        idx === i ? { ...r, ...patch } : r
      ),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      reasons: content.reasons.filter((_, idx) => idx !== i),
    });
  const add = () =>
    onContentChange({
      ...content,
      reasons: [...content.reasons, { value: 'Mới', label: 'lý do' }],
    });

  return (
    <PopoverTrigger
      label='Danh sách lý do'
      preview={`${content.reasons.length} mục`}
      width={420}
    >
      <div className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
        {content.reasons.map((r, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <Input
              value={r.value}
              onChange={e => update(i, { value: e.target.value })}
              placeholder='Giá trị'
              className='h-8 border-neutral-200 bg-white text-xs font-semibold'
            />
            <Input
              value={r.label}
              onChange={e => update(i, { label: e.target.value })}
              placeholder='Nhãn'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={() => remove(i)}
              aria-label='Xoá'
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm lý do' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────────────────── AI BUTTON

function AiButton({
  onAi,
  blockType,
}: {
  onAi: (prompt: string) => Promise<void>;
  blockType: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [prompt, setPrompt] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await onAi(prompt);
      setPrompt('');
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type='button'
          aria-label='AI tạo nội dung'
          title='AI tạo nội dung'
          className='flex h-7 cursor-pointer items-center gap-1 rounded-md bg-neutral-900 px-2.5 text-[10px] font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700'
        >
          <Sparkles className='size-3 text-violet-300' />
          AI
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='end'
          sideOffset={8}
          className='z-50 w-80 rounded-lg border border-neutral-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] outline-none'
        >
          <div className='mb-2 flex items-center gap-2'>
            <Sparkles className='size-3 text-violet-500' />
            <span className='text-[10px] font-semibold tracking-[0.16em] text-neutral-700 uppercase'>
              AI tạo nội dung
            </span>
            <span className='ml-auto font-mono text-[10px] tracking-tight text-neutral-400'>
              {blockType.replace('_', ' ')}
            </span>
          </div>
          <Textarea
            autoFocus
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !busy) {
                e.preventDefault();
                void submit();
              }
            }}
            placeholder='Mô tả gì bạn muốn AI viết… (⌘+Enter để gửi)'
            className='min-h-20 resize-none border-neutral-200 bg-white text-xs leading-5'
          />
          <div className='mt-2 flex items-center justify-between'>
            <span className='font-mono text-[10px] tracking-tight text-neutral-400'>
              ⌘ Enter
            </span>
            <button
              type='button'
              onClick={() => void submit()}
              disabled={busy}
              className='flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 text-[11px] font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700 disabled:opacity-50'
            >
              {busy ? (
                <>
                  <Loader2 className='size-3 animate-spin' />
                  Đang tạo…
                </>
              ) : (
                <>
                  <Sparkles className='size-3 text-violet-300' />
                  Tạo
                </>
              )}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ─────────────────────────────────────────────────────────── HELPERS

function PopoverTrigger({
  label,
  preview,
  icon,
  width = 360,
  children,
}: {
  label: string;
  preview: string;
  icon?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          className='flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-white px-2 text-[11px] font-medium text-neutral-700 ring-1 ring-neutral-200/80 transition-colors hover:text-neutral-900 hover:ring-neutral-300'
        >
          {icon}
          <span className='font-mono text-[10px] tracking-tight text-neutral-400'>
            {label}
          </span>
          <span className='max-w-[140px] truncate'>{preview}</span>
          <ChevronDown className='size-3 text-neutral-400' />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={8}
          style={{ width }}
          className='z-50 flex flex-col gap-2 rounded-lg border border-neutral-200/80 bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.04)] outline-none'
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ToolbarBtn({
  active,
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  label?: string;
}) {
  return (
    <button
      type='button'
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
        active &&
          'bg-neutral-900/[0.92] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-neutral-900 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function AddRow({ onAdd, label }: { onAdd: () => void; label: string }) {
  return (
    <button
      type='button'
      onClick={onAdd}
      className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
    >
      <Plus className='size-3.5' />
      {label}
    </button>
  );
}

function Sep() {
  return <div className='h-5 w-px shrink-0 bg-neutral-200' />;
}

function InlineLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className='flex items-center gap-1.5'>
      <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
        {label}
      </span>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────── COLOR SWATCH

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <label
      className='flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-1.5 transition-colors hover:bg-neutral-100'
      title={value}
    >
      <span className='font-mono text-[10px] tracking-[0.08em] text-neutral-400 uppercase'>
        {label}
      </span>
      <span className='relative inline-flex'>
        <span
          className='size-4 rounded-sm ring-1 ring-black/10'
          style={{ backgroundColor: value }}
          aria-hidden
        />
        <input
          type='color'
          value={value}
          onChange={e => onChange(e.target.value)}
          className='absolute inset-0 size-4 cursor-pointer opacity-0'
          aria-label={`Chọn ${label}`}
        />
      </span>
      <span className='font-mono text-[10px] text-neutral-500 tabular-nums'>
        {value.replace('#', '').toUpperCase()}
      </span>
    </label>
  );
}
