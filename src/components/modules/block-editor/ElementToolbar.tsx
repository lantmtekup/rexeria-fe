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
import {
  BRAND_COLOR_ROLES,
  brandToken,
  brandTokenKey,
  previewColor,
} from '@/lib/brand-kit';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIBlockType } from '@/services/rexer/types';
import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';

import { FEATURE_ICON_OPTIONS } from './blocks/FeatureSection';
import {
  PNJ_PARAGRAPH_KEY_RE,
  resolvePnjParagraphs,
  setPnjParagraphAt,
} from './blocks/PnjDetails';
import { DELVAUX_HERO_FRAMES } from './blocks/_registry/defs/delvauxHeroFrames';
import {
  isPnjHeroFramesConfig,
  MINT_FRAMES_EXAMPLE,
  PNJ_HERO_FRAMES_DEFAULT,
  resolvePnjHeroFrames,
} from './blocks/pnjHeroFrames';
import {
  isPnjHeroScrimConfig,
  PNJ_HERO_SCRIM_PNJ_LAYERS,
  PNJ_HERO_SCRIM_PRESET_IDS,
  PNJ_HERO_SCRIM_PRESET_LABELS,
  resolvePnjHeroScrim,
} from './blocks/pnjHeroScrim';
import {
  PNJ_HERO_TITLE_LINE_KEY_RE,
  resolvePnjHeroTitleLines,
  setPnjHeroTitleLineAt,
} from './blocks/pnjHeroTitleLines';
import { buildAiPrompt } from './buildAiPrompt';
import { ImagePicker } from './ImagePicker';
import { getContentAt, setContentAt } from './contentPath';
import { BACKGROUND_LAYER_KEY, resolveElementMeta } from './resolveElementKind';
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
  type ImageCarouselContent,
  type ImageTransform,
  type InteractiveAdWidgetContent,
  type Lang,
  type MintDiscoverContent,
  type MintVariantsContent,
  type MintV2ProcessContent,
  type MintV2ProcessStep,
  type MintV2ServiceItem,
  type MintV2ServicesContent,
  type MintVaultCraftContent,
  type MintVaultCraftItem,
  type MintVaultCollectionContent,
  type MintVaultCoin,
  type DelvauxHeroContent,
  type DelvauxProductContent,
  type DelvauxProductHotspot,
  type DelvauxSubnavContent,
  type DelvauxSubnavLink,
  type DelvauxVariantContent,
  type DelvauxVariantFaq,
  type DelvauxVariantOption,
  type PnjDetailsContent,
  type PnjHeroContent,
  type PnjHeroHotspot,
  type PnjVariantContent,
  type PnjVariantItem,
  type PnjStickyMenuContent,
  type PnjStickyMenuItem,
} from './types';

export { BACKGROUND_LAYER_KEY };

interface ElementToolbarProps {
  block: Block;
  lang: Lang;
  device: Device;
  selectedKey: string | null;
  onClose: () => void;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
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
}: ElementToolbarProps) {
  // Tablet renders desktop layout — slim banner makes the read-only state explicit.
  if (device === 'tablet') {
    return (
      <div className='mx-3 mt-3 flex h-11 items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/95 px-3.5 shadow-[0_8px_30px_rgba(15,15,15,0.05)] backdrop-blur-md'>
        <div className='size-1.5 rounded-full bg-amber-500' aria-hidden />
        <span className='text-[11px] text-amber-900'>
          Tablet đang xem layout{' '}
          <strong className='font-semibold'>Desktop</strong> (chỉ đọc) — chuyển
          Desktop hoặc Mobile để chỉnh sửa.
        </span>
      </div>
    );
  }

  // Chưa chọn element → ẩn hẳn thanh toolbar (không hiện banner hướng dẫn) để
  // canvas có thêm chỗ. Toolbar chỉ xuất hiện khi đang sửa 1 element cụ thể.
  if (!selectedKey) return null;

  const { kind, fieldType, label } = resolveElementMeta(
    block.blockType,
    selectedKey
  );
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

    if (kind === 'pnjFrames') {
      const next = { ...c };
      delete next.frames;
      onContentChange(next as BlockContent);
      toast.success('Đã reset frame sequence về mặc định PNJ');
      onClose();
      return;
    }

    if (kind === 'delvauxFrames') {
      onContentChange({
        ...c,
        frameUrls: [...DELVAUX_HERO_FRAMES],
        frameCount: DELVAUX_HERO_FRAMES.length,
        frameUrlPattern: '',
      } as BlockContent);
      toast.success('Đã reset chuỗi frame về mặc định Delvaux');
      onClose();
      return;
    }

    if (kind === 'pnjScrim') {
      const next = { ...c };
      delete next.scrim;
      onContentChange(next as BlockContent);
      toast.success('Đã reset lớp mờ về mặc định PNJ');
      onClose();
      return;
    }

    let nextValue: unknown;
    if (kind === 'text' || kind === 'image') nextValue = '';
    else nextValue = [];

    const paraMatch = selectedKey.match(PNJ_PARAGRAPH_KEY_RE);
    const titleLineMatch = selectedKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
    if (paraMatch) {
      const index = Number(paraMatch[1]);
      onContentChange(
        prev =>
          setPnjParagraphAt(
            prev as PnjDetailsContent & {
              paragraph1?: string;
              paragraph2?: string;
            },
            index,
            ''
          ) as BlockContent
      );
    } else if (titleLineMatch) {
      const index = Number(titleLineMatch[1]);
      onContentChange(
        prev =>
          setPnjHeroTitleLineAt(
            prev as PnjHeroContent,
            index,
            ''
          ) as BlockContent
      );
    } else {
      onContentChange(setContentAt(c, selectedKey, nextValue) as BlockContent);
    }
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
      const nextValue = getContentAt(c, selectedKey);
      if (nextValue !== undefined) {
        const paraMatch = selectedKey.match(PNJ_PARAGRAPH_KEY_RE);
        const titleLineMatch = selectedKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
        if (paraMatch && typeof nextValue === 'string') {
          onContentChange(
            prev =>
              setPnjParagraphAt(
                prev as PnjDetailsContent & {
                  paragraph1?: string;
                  paragraph2?: string;
                },
                Number(paraMatch[1]),
                nextValue
              ) as BlockContent
          );
        } else if (titleLineMatch && typeof nextValue === 'string') {
          onContentChange(
            prev =>
              setPnjHeroTitleLineAt(
                prev as PnjHeroContent,
                Number(titleLineMatch[1]),
                nextValue
              ) as BlockContent
          );
        } else {
          onContentChange(
            setContentAt(
              content as Record<string, unknown>,
              selectedKey,
              nextValue
            ) as BlockContent
          );
        }
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
    <div className='mx-3 mt-2.5 flex min-h-9 items-center gap-2 rounded-lg border border-neutral-200/70 bg-white/95 px-2.5 py-1.5 shadow-[0_6px_20px_rgba(15,15,15,0.06),0_1px_2px_rgba(15,15,15,0.04)] backdrop-blur-md'>
      {/* Element identity */}
      <div className='flex shrink-0 items-center gap-1.5 pl-0.5'>
        <span
          className='size-1.5 shrink-0 rounded-full bg-sky-500'
          aria-hidden
        />
        <span className='text-[10px] font-semibold tracking-[0.04em] text-neutral-800 uppercase'>
          {label}
        </span>
      </div>

      <Sep />

      {/* Contextual controls */}
      <div className='flex min-w-0 flex-1 [scrollbar-width:none] items-center gap-1.5 overflow-x-auto py-0.5 [&::-webkit-scrollbar]:hidden'>
        {kind === 'text' && (
          <TextControls
            fieldKey={selectedKey}
            multiline={fieldType ? fieldType === 'textarea' : undefined}
            content={content}
            style={style}
            onContentChange={onContentChange}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
          />
        )}
        {kind === 'image' && (
          <ImageControls
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
        {kind === 'reasons' && (
          <ReasonsControls
            content={content as BookingFormContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'slides' && (
          <SlidesControls
            content={content as ImageCarouselContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'interactiveAd' && (
          <InteractiveAdControls
            content={content as InteractiveAdWidgetContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVariants' && (
          <MintVariantsControls
            content={content as MintVariantsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintTabs' &&
          (block.blockType === 'pnj_hero' ? (
            <PnjHotspotsControls
              content={content as PnjHeroContent}
              onContentChange={onContentChange}
            />
          ) : (
            <MintTabsControls
              content={content as MintDiscoverContent}
              onContentChange={onContentChange}
            />
          ))}
        {kind === 'mintDiscoverVariant' && (
          <MintDiscoverVariantControls
            content={content as MintDiscoverContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintDiscoverSurface' && (
          <MintDiscoverSurfaceControls
            style={style}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
          />
        )}
        {kind === 'fill' && (
          <FillColorControls
            style={style}
            onUpdateStyle={onUpdateStyle}
            onResetStyle={onResetStyle}
            label={
              selectedKey === 'contentSurface'
                ? 'Nền cột nội dung'
                : selectedKey === 'dot'
                  ? 'Màu chấm'
                  : 'Màu đường'
            }
            fallback={
              selectedKey === 'contentSurface'
                ? '#ffffff'
                : selectedKey === 'dot'
                  ? '#c79119'
                  : 'rgba(199, 145, 25, 0.6)'
            }
          />
        )}
        {kind === 'pnjFrames' && (
          <PnjFramesJsonControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxFrames' && (
          <DelvauxFramesControls
            content={content as DelvauxHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxHotspots' && (
          <DelvauxHotspotsControls
            content={content as DelvauxProductContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxVariants' && (
          <DelvauxVariantsControls
            content={content as DelvauxVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxFaqs' && (
          <DelvauxFaqsControls
            content={content as DelvauxVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'delvauxSubnavLinks' && (
          <DelvauxSubnavLinksControls
            content={content as DelvauxSubnavContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjScrim' && (
          <PnjScrimControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjParagraphs' && (
          <PnjParagraphsControls
            content={content as PnjDetailsContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjTitleLines' && (
          <PnjTitleLinesControls
            content={content as PnjHeroContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjVariants' && (
          <PnjVariantsControls
            content={content as PnjVariantContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'pnjStickyMenuItems' && (
          <PnjStickyMenuItemsControls
            content={content as PnjStickyMenuContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintV2ServicesItems' && (
          <MintV2ServicesItemsControls
            content={content as MintV2ServicesContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintV2ProcessSteps' && (
          <MintV2ProcessStepsControls
            content={content as MintV2ProcessContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultCraftItems' && (
          <MintVaultCraftItemsControls
            content={content as MintVaultCraftContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultCoins' && (
          <MintVaultCoinsControls
            content={content as MintVaultCollectionContent}
            onContentChange={onContentChange}
          />
        )}
        {kind === 'mintVaultImages' && (
          <MintVaultImagesControls
            label={label}
            content={content as { images?: string[] }}
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

      {/* Actions */}
      <div className='flex shrink-0 items-center gap-0.5 border-l border-neutral-200/80 pl-2'>
        <AiButton onAi={handleAi} blockType={block.blockType} />
        <button
          type='button'
          onClick={handleDelete}
          aria-label='Xoá nội dung'
          title='Xoá nội dung'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600'
        >
          <Trash2 className='size-3.5' />
        </button>
        <button
          type='button'
          onClick={onClose}
          aria-label='Bỏ chọn'
          title='Bỏ chọn'
          className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
        >
          <X className='size-3.5' />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────── TEXT CONTROLS

function TextControls({
  fieldKey,
  multiline,
  content,
  style,
  onContentChange,
  onUpdateStyle,
  onResetStyle,
}: {
  fieldKey: string;
  /** Registry-driven: true = textarea, false = 1 dòng. undefined = đoán theo key. */
  multiline?: boolean;
  content: BlockContent;
  style?: ElementStyle;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
}) {
  const c = content as Record<string, unknown>;
  const paraMatch = fieldKey.match(PNJ_PARAGRAPH_KEY_RE);
  const paraIndex = paraMatch ? Number(paraMatch[1]) : -1;
  const titleLineMatch = fieldKey.match(PNJ_HERO_TITLE_LINE_KEY_RE);
  const titleLineIndex = titleLineMatch ? Number(titleLineMatch[1]) : -1;
  const highlightsMatch = fieldKey.match(/^variants\[(\d+)\]\.highlights$/);
  const rawAt = getContentAt(c, fieldKey);
  const value = paraMatch
    ? (resolvePnjParagraphs(
        content as PnjDetailsContent & {
          paragraph1?: string;
          paragraph2?: string;
        }
      )[paraIndex] ?? '')
    : titleLineMatch
      ? (resolvePnjHeroTitleLines(content as PnjHeroContent)[titleLineIndex] ??
        '')
      : highlightsMatch
        ? Array.isArray(rawAt)
          ? (rawAt as string[]).join('\n')
          : typeof rawAt === 'string'
            ? rawAt
            : ''
        : typeof rawAt === 'string'
          ? rawAt
          : '';
  const isLong =
    multiline ??
    (fieldKey === 'description' ||
      fieldKey === 'subtitle' ||
      fieldKey === 'noteText' ||
      !!highlightsMatch);
  const fontSize = style?.fontSize ?? '';

  const setField = (next: string) => {
    // paragraphs[i]: không dùng setContentAt — sẽ tạo mảng 1 phần tử và mất đoạn khác
    // khi content.paragraphs chưa phải array (legacy paragraph1/2).
    if (paraMatch) {
      onContentChange(
        prev =>
          setPnjParagraphAt(
            prev as PnjDetailsContent & {
              paragraph1?: string;
              paragraph2?: string;
            },
            paraIndex,
            next
          ) as BlockContent
      );
      return;
    }
    if (titleLineMatch) {
      onContentChange(
        prev =>
          setPnjHeroTitleLineAt(
            prev as PnjHeroContent,
            titleLineIndex,
            next
          ) as BlockContent
      );
      return;
    }
    // highlights: textarea → string[] (mỗi dòng 1 mục)
    const writeValue: unknown = highlightsMatch
      ? next
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      : next;
    onContentChange(
      prev =>
        setContentAt(
          prev as Record<string, unknown>,
          fieldKey,
          writeValue
        ) as BlockContent
    );
  };

  return (
    <>
      {/* Inline text input — takes remaining space; long text uses popover */}
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
          className='h-7 min-w-[16rem] flex-1 rounded-md bg-neutral-50 px-2.5 text-[12px] text-neutral-900 ring-1 ring-neutral-200/70 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:outline-none'
        />
      )}

      <Sep />

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
          className='h-7 w-11 rounded-md bg-neutral-50 px-1.5 font-mono text-[11px] text-neutral-900 tabular-nums ring-1 ring-neutral-200/70 transition-shadow placeholder:text-neutral-400 hover:ring-neutral-300 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 focus:outline-none'
        />
      </InlineLabel>

      <Sep />

      <div className='flex items-center gap-px rounded-md bg-neutral-50/80 p-px ring-1 ring-neutral-200/60'>
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

      <div className='flex items-center gap-px rounded-md bg-neutral-50/80 p-px ring-1 ring-neutral-200/60'>
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
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────────────────────── IMAGE CONTROLS

function ImageControls({
  fieldKey,
  content,
  onContentChange,
}: {
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
  const url = (getContentAt(c, fieldKey) as string) ?? '';
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  const setUrl = (next: string) => {
    onContentChange(setContentAt(c, fieldKey, next) as BlockContent);
  };
  const setTransform = (next: ImageTransform) => {
    if (!transformKey) return;
    onContentChange({ ...c, [transformKey]: next } as BlockContent);
  };

  return (
    <>
      <PopoverTrigger
        label='Ảnh'
        preview={url ? 'Đã chọn' : 'Chưa chọn'}
        icon={<ImageIcon className='size-3.5' />}
        width={420}
        primary
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
        <p className='text-3xs mt-2 text-neutral-400'>
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

// ─────────────────────────────────────────────────────────── SLIDES

function SlidesControls({
  content,
  onContentChange,
}: {
  content: ImageCarouselContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const slides = content.slides ?? [];

  const update = (
    i: number,
    patch: Partial<ImageCarouselContent['slides'][number]>
  ) => {
    onContentChange({
      ...content,
      slides: slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  };
  const remove = (i: number) =>
    onContentChange({
      ...content,
      slides: slides.filter((_, idx) => idx !== i),
    });
  const move = (i: number, dir: -1 | 1) => {
    const next = slides.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onContentChange({ ...content, slides: next });
  };
  const add = () =>
    onContentChange({
      ...content,
      slides: [
        ...slides,
        {
          id: `s_${Math.random().toString(36).slice(2, 8)}`,
          imageUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
          caption: '',
        },
      ],
    });

  return (
    <PopoverTrigger
      label='Slides'
      preview={`${slides.length} slide`}
      width={480}
    >
      {/* Carousel-level controls — apply to the whole block, not per slide. */}
      <div className='mb-2 flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50/60 p-2'>
        <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
          Cấu hình carousel
        </p>
        <div className='flex items-center gap-2'>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={(content.autoplayMs ?? 0) > 0}
              onChange={e =>
                onContentChange({
                  ...content,
                  autoplayMs: e.target.checked ? 4500 : 0,
                })
              }
            />
            Autoplay
          </label>
          <input
            type='number'
            min={1000}
            max={20000}
            step={500}
            value={content.autoplayMs ?? 0}
            onChange={e =>
              onContentChange({
                ...content,
                autoplayMs: Math.max(0, Number(e.target.value) || 0),
              })
            }
            disabled={!content.autoplayMs}
            className='text-2xs h-7 w-20 rounded-md bg-white px-1.5 text-center font-mono ring-1 ring-neutral-200 focus:outline-none disabled:opacity-50'
            placeholder='ms'
          />
          <span className='text-3xs text-neutral-400'>ms</span>
        </div>
        <div className='flex items-center gap-3'>
          <label className='text-2xs inline-flex items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.showPagination ?? true}
              onChange={e =>
                onContentChange({
                  ...content,
                  showPagination: e.target.checked,
                })
              }
            />
            Pagination
          </label>
          <label className='text-2xs inline-flex items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.showNavArrows ?? true}
              onChange={e =>
                onContentChange({
                  ...content,
                  showNavArrows: e.target.checked,
                })
              }
            />
            Nút mũi tên
          </label>
        </div>
      </div>

      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label='Lên trên'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↑
                </button>
                <button
                  type='button'
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label='Xuống dưới'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↓
                </button>
                <button
                  type='button'
                  onClick={() => remove(i)}
                  aria-label='Xoá'
                  className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            </div>
            <ImagePicker
              value={slide.imageUrl}
              onChange={url => update(i, { imageUrl: url })}
            />
            <Input
              value={slide.caption ?? ''}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption (hiện overlay đáy slide)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={slide.altText ?? ''}
              onChange={e => update(i, { altText: e.target.value })}
              placeholder='Alt text (SEO / a11y)'
              className='text-2xs h-8 border-neutral-200 bg-white'
            />
            <Input
              value={slide.href ?? ''}
              onChange={e => update(i, { href: e.target.value })}
              placeholder='Link (https://… — bỏ trống nếu không click)'
              className='text-2xs h-8 border-neutral-200 bg-white'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm slide' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────────── INTERACTIVE AD WIDGET

function InteractiveAdControls({
  content,
  onContentChange,
}: {
  content: InteractiveAdWidgetContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const slides = content.slides ?? [];

  const updateSlide = (
    i: number,
    patch: Partial<InteractiveAdWidgetContent['slides'][number]>
  ) =>
    onContentChange({
      ...content,
      slides: slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  const removeSlide = (i: number) =>
    onContentChange({
      ...content,
      slides: slides.filter((_, idx) => idx !== i),
    });
  const moveSlide = (i: number, dir: -1 | 1) => {
    const next = slides.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onContentChange({ ...content, slides: next });
  };
  const addSlide = () =>
    onContentChange({
      ...content,
      slides: [
        ...slides,
        {
          id: `ad_${Math.random().toString(36).slice(2, 8)}`,
          backgroundType: 'image' as const,
          backgroundUrl:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
          hotspots: [],
          ctas: [],
        },
      ],
    });

  const addHotspot = (i: number) =>
    updateSlide(i, {
      hotspots: [
        ...slides[i].hotspots,
        {
          id: `hs_${Math.random().toString(36).slice(2, 8)}`,
          xPct: 50,
          yPct: 50,
          label: '',
        },
      ],
    });
  const updateHotspot = (
    i: number,
    hIdx: number,
    patch: Partial<
      InteractiveAdWidgetContent['slides'][number]['hotspots'][number]
    >
  ) =>
    updateSlide(i, {
      hotspots: slides[i].hotspots.map((h, idx) =>
        idx === hIdx ? { ...h, ...patch } : h
      ),
    });
  const removeHotspot = (i: number, hIdx: number) =>
    updateSlide(i, {
      hotspots: slides[i].hotspots.filter((_, idx) => idx !== hIdx),
    });

  const addCta = (i: number) =>
    updateSlide(i, {
      ctas: [
        ...slides[i].ctas,
        {
          id: `cta_${Math.random().toString(36).slice(2, 8)}`,
          label: 'Tìm hiểu thêm',
          href: '#',
          style: 'primary' as const,
        },
      ],
    });
  const updateCta = (
    i: number,
    cIdx: number,
    patch: Partial<InteractiveAdWidgetContent['slides'][number]['ctas'][number]>
  ) =>
    updateSlide(i, {
      ctas: slides[i].ctas.map((c, idx) =>
        idx === cIdx ? { ...c, ...patch } : c
      ),
    });
  const removeCta = (i: number, cIdx: number) =>
    updateSlide(i, {
      ctas: slides[i].ctas.filter((_, idx) => idx !== cIdx),
    });

  return (
    <PopoverTrigger
      label='Quảng cáo'
      preview={`${slides.length} slide`}
      width={520}
    >
      <div className='mb-2 flex flex-col gap-2 rounded-md border border-neutral-200 bg-neutral-50/60 p-2'>
        <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
          Cấu hình chung
        </p>
        <div className='flex items-center gap-3'>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={content.closeable ?? true}
              onChange={e =>
                onContentChange({ ...content, closeable: e.target.checked })
              }
            />
            Cho phép đóng
          </label>
          <label className='text-2xs inline-flex shrink-0 items-center gap-1 text-neutral-600'>
            <input
              type='checkbox'
              checked={(content.autoplayMs ?? 0) > 0}
              onChange={e =>
                onContentChange({
                  ...content,
                  autoplayMs: e.target.checked ? 4500 : 0,
                })
              }
            />
            Autoplay
          </label>
          <input
            type='number'
            min={1000}
            max={20000}
            step={500}
            value={content.autoplayMs ?? 0}
            onChange={e =>
              onContentChange({
                ...content,
                autoplayMs: Math.max(0, Number(e.target.value) || 0),
              })
            }
            disabled={!content.autoplayMs}
            className='text-2xs h-7 w-20 rounded-md bg-white px-1.5 text-center font-mono ring-1 ring-neutral-200 focus:outline-none disabled:opacity-50'
            placeholder='ms'
          />
        </div>
      </div>

      <div className='flex max-h-96 flex-col gap-2 overflow-y-auto pr-1'>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className='flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between'>
              <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Slide {i + 1}
              </span>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => moveSlide(i, -1)}
                  disabled={i === 0}
                  aria-label='Lên trên'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↑
                </button>
                <button
                  type='button'
                  onClick={() => moveSlide(i, 1)}
                  disabled={i === slides.length - 1}
                  aria-label='Xuống dưới'
                  className='flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  ↓
                </button>
                <button
                  type='button'
                  onClick={() => removeSlide(i)}
                  aria-label='Xoá slide'
                  className='flex size-7 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                >
                  <Trash2 className='size-3.5' />
                </button>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <select
                value={slide.backgroundType}
                onChange={e =>
                  updateSlide(i, {
                    backgroundType: e.target.value as 'image' | 'video',
                  })
                }
                className='text-2xs h-8 rounded-md border border-neutral-200 bg-white px-2'
              >
                <option value='image'>Ảnh</option>
                <option value='video'>Video</option>
              </select>
              <Input
                value={slide.backgroundUrl}
                onChange={e =>
                  updateSlide(i, { backgroundUrl: e.target.value })
                }
                placeholder='URL ảnh/video nền'
                className='text-2xs h-8 flex-1 border-neutral-200 bg-white'
              />
            </div>
            {slide.backgroundType === 'image' && (
              <ImagePicker
                value={slide.backgroundUrl}
                onChange={url => updateSlide(i, { backgroundUrl: url })}
              />
            )}

            {/* Hotspots */}
            <div className='flex flex-col gap-1.5 rounded-md bg-neutral-50/60 p-1.5'>
              <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                Hotspot ({slide.hotspots.length})
              </p>
              {slide.hotspots.map((h, hIdx) => (
                <div key={h.id} className='flex items-center gap-1'>
                  <input
                    type='number'
                    min={0}
                    max={100}
                    value={h.xPct}
                    onChange={e =>
                      updateHotspot(i, hIdx, { xPct: Number(e.target.value) })
                    }
                    className='text-2xs h-7 w-12 rounded-md border border-neutral-200 bg-white px-1 text-center font-mono'
                    title='X %'
                  />
                  <input
                    type='number'
                    min={0}
                    max={100}
                    value={h.yPct}
                    onChange={e =>
                      updateHotspot(i, hIdx, { yPct: Number(e.target.value) })
                    }
                    className='text-2xs h-7 w-12 rounded-md border border-neutral-200 bg-white px-1 text-center font-mono'
                    title='Y %'
                  />
                  <Input
                    value={h.label}
                    onChange={e =>
                      updateHotspot(i, hIdx, { label: e.target.value })
                    }
                    placeholder='Nhãn'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <select
                    value={h.ctaId ?? ''}
                    onChange={e =>
                      updateHotspot(i, hIdx, {
                        ctaId: e.target.value || undefined,
                      })
                    }
                    className='text-2xs h-7 rounded-md border border-neutral-200 bg-white px-1'
                  >
                    <option value=''>— CTA —</option>
                    {slide.ctas.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.label || c.id}
                      </option>
                    ))}
                  </select>
                  <button
                    type='button'
                    onClick={() => removeHotspot(i, hIdx)}
                    aria-label='Xoá hotspot'
                    className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                  >
                    <Trash2 className='size-3' />
                  </button>
                </div>
              ))}
              <AddRow onAdd={() => addHotspot(i)} label='Thêm hotspot' />
            </div>

            {/* CTAs */}
            <div className='flex flex-col gap-1.5 rounded-md bg-neutral-50/60 p-1.5'>
              <p className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
                CTA ({slide.ctas.length})
              </p>
              {slide.ctas.map((c, cIdx) => (
                <div key={c.id} className='flex items-center gap-1'>
                  <Input
                    value={c.label}
                    onChange={e =>
                      updateCta(i, cIdx, { label: e.target.value })
                    }
                    placeholder='Nhãn nút'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <Input
                    value={c.href}
                    onChange={e => updateCta(i, cIdx, { href: e.target.value })}
                    placeholder='https://…'
                    className='text-2xs h-7 flex-1 border-neutral-200 bg-white'
                  />
                  <select
                    value={c.style}
                    onChange={e =>
                      updateCta(i, cIdx, {
                        style: e.target.value as 'primary' | 'secondary',
                      })
                    }
                    className='text-2xs h-7 rounded-md border border-neutral-200 bg-white px-1'
                  >
                    <option value='primary'>Chính</option>
                    <option value='secondary'>Phụ</option>
                  </select>
                  <button
                    type='button'
                    onClick={() => removeCta(i, cIdx)}
                    aria-label='Xoá CTA'
                    className='flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
                  >
                    <Trash2 className='size-3' />
                  </button>
                </div>
              ))}
              <AddRow onAdd={() => addCta(i)} label='Thêm CTA' />
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={addSlide} label='Thêm slide' />
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

// ─────────────────────────────────────────── MINT VARIANTS (swatch picker)

function MintVariantsControls({
  content,
  onContentChange,
}: {
  content: MintVariantsContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variants = content.variants ?? [];
  const update = (i: number, patch: Partial<(typeof variants)[number]>) =>
    onContentChange({
      ...content,
      variants: variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    } as BlockContent);
  const remove = (i: number) =>
    onContentChange({
      ...content,
      variants: variants.filter((_, idx) => idx !== i),
    } as BlockContent);
  const add = () =>
    onContentChange({
      ...content,
      variants: [
        ...variants,
        {
          key: `v_${Date.now().toString(36)}`,
          label: 'Biến thể mới',
          ref: '',
          swatch: '',
          image: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Biến thể (swatch)'
      preview={`${variants.length} mục`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.map((v, i) => (
          <div
            key={v.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tên biến thể'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
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
            <Input
              value={v.swatch}
              onChange={e => update(i, { swatch: e.target.value })}
              placeholder='URL ảnh swatch (nút tròn)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={v.image}
              onChange={e => update(i, { image: e.target.value })}
              placeholder='URL ảnh hiển thị chính'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm biến thể' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINT DISCOVER (variant / surface)

function MintDiscoverVariantControls({
  content,
  onContentChange,
}: {
  content: MintDiscoverContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variant = content.variant ?? '1';
  return (
    <div className='flex min-w-0 items-center gap-2'>
      <span className='text-[10px] font-medium tracking-wide text-neutral-500 uppercase'>
        Theme
      </span>
      <select
        value={variant}
        onChange={e =>
          onContentChange({
            ...content,
            variant: e.target.value as '1' | '2',
          } as BlockContent)
        }
        className='h-8 min-w-[14rem] rounded-md border border-neutral-200 bg-white px-2 text-xs text-neutral-900'
        aria-label='Theme variant'
      >
        <option value='1'>Variant 1 — Reverse (nền sáng)</option>
        <option value='2'>Variant 2 — Obverse (nền tối)</option>
      </select>
    </div>
  );
}

function MintDiscoverSurfaceControls({
  style,
  onUpdateStyle,
  onResetStyle,
}: {
  style?: ElementStyle;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
}) {
  return (
    <>
      <ColorSwatch
        label='Nền thẻ'
        value={style?.backgroundColor ?? 'rgba(255,255,255,0.8)'}
        onChange={c => onUpdateStyle({ backgroundColor: c })}
      />
      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

/** Style-only fill (timeline line, dots, …) — không có content text. */
function FillColorControls({
  style,
  onUpdateStyle,
  onResetStyle,
  label,
  fallback,
}: {
  style?: ElementStyle;
  onUpdateStyle: (patch: ElementStyle) => void;
  onResetStyle: () => void;
  label: string;
  fallback: string;
}) {
  return (
    <>
      <ColorSwatch
        label={label}
        value={style?.backgroundColor ?? style?.color ?? fallback}
        onChange={c => onUpdateStyle({ backgroundColor: c })}
      />
      <button
        type='button'
        onClick={onResetStyle}
        title='Khôi phục style mặc định'
        aria-label='Khôi phục style mặc định'
        className='flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800'
      >
        <RotateCcw className='size-3.5' />
      </button>
    </>
  );
}

// ─────────────────────────────────────────── MINT TABS (hotspot detail)

function MintTabsControls({
  content,
  onContentChange,
}: {
  content: MintDiscoverContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const tabs = content.tabs ?? [];
  const update = (i: number, patch: Partial<(typeof tabs)[number]>) =>
    onContentChange({
      ...content,
      tabs: tabs.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    } as BlockContent);
  const remove = (i: number) =>
    onContentChange({
      ...content,
      tabs: tabs.filter((_, idx) => idx !== i),
    } as BlockContent);
  const add = () =>
    onContentChange({
      ...content,
      tabs: [
        ...tabs,
        {
          key: `t_${Date.now().toString(36)}`,
          label: 'Điểm mới',
          desc: 'Mô tả chi tiết.',
          img: '',
          dotX: 50,
          dotY: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot / chi tiết'
      preview={`${tabs.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {tabs.map((t, i) => (
          <div
            key={t.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={t.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
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
            <Textarea
              value={t.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <Input
              value={t.img}
              onChange={e => update(i, { img: e.target.value })}
              placeholder='URL ảnh trong drawer'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={t.dotX}
                  onChange={e => update(i, { dotX: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={t.dotY}
                  onChange={e => update(i, { dotY: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ DETAILS PARAGRAPHS

function PnjParagraphsControls({
  content,
  onContentChange,
}: {
  content: PnjDetailsContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const paragraphs = resolvePnjParagraphs(content);

  /** Append/update against LATEST store content (tránh closure ghi đè mất đoạn cũ). */
  const write = (updater: (paras: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as PnjDetailsContent & {
        paragraph1?: string;
        paragraph2?: string;
      };
      const nextParas = updater(resolvePnjParagraphs(c));
      const next = { ...c, paragraphs: nextParas } as Record<string, unknown>;
      // Drop legacy keys so canvas không còn dual-source.
      delete next.paragraph1;
      delete next.paragraph2;
      return next as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(paras => paras.map((p, idx) => (idx === i ? value : p)));
  const remove = (i: number) => {
    if (paragraphs.length <= 1) {
      toast.error('Cần ít nhất 1 đoạn văn');
      return;
    }
    write(paras => paras.filter((_, idx) => idx !== i));
  };
  const add = () => write(paras => [...paras, 'Đoạn văn mới.']);

  return (
    <PopoverTrigger
      label='Đoạn văn'
      preview={`${paragraphs.length} đoạn`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {paragraphs.map((p, i) => (
          <div
            key={`para-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-2xs font-semibold tracking-wide text-neutral-500 uppercase'>
                Đoạn {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá đoạn ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={p}
              onChange={e => update(i, e.target.value)}
              placeholder='Nội dung đoạn văn'
              className='field-sizing-fixed min-h-20 resize-y overflow-y-auto border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm đoạn văn' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ HERO TITLE LINES

function PnjTitleLinesControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const titleLines = resolvePnjHeroTitleLines(content);

  const write = (updater: (lines: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as PnjHeroContent;
      const nextLines = updater(resolvePnjHeroTitleLines(c));
      const next = { ...c, titleLines: nextLines } as Record<string, unknown>;
      delete next.titleLine1;
      delete next.titleLine2;
      return next as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(lines => lines.map((line, idx) => (idx === i ? value : line)));
  const remove = (i: number) => {
    if (titleLines.length <= 1) {
      toast.error('Cần ít nhất 1 dòng tiêu đề');
      return;
    }
    write(lines => lines.filter((_, idx) => idx !== i));
  };
  const add = () => write(lines => [...lines, 'Dòng tiêu đề mới']);

  return (
    <PopoverTrigger
      label='Tiêu đề dòng'
      preview={`${titleLines.length} dòng`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {titleLines.map((line, i) => (
          <div
            key={`title-line-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='text-2xs font-semibold tracking-wide text-neutral-500 uppercase'>
                Dòng {i + 1}
              </span>
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá dòng ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={line}
              onChange={e => update(i, e.target.value)}
              placeholder='Nội dung tiêu đề'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm dòng tiêu đề' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ VARIANT CHAPTERS

function PnjVariantsControls({
  content,
  onContentChange,
}: {
  content: PnjVariantContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const variants = content.variants ?? [];

  const write = (updater: (list: PnjVariantItem[]) => PnjVariantItem[]) => {
    onContentChange(prev => {
      const c = prev as PnjVariantContent;
      return {
        ...c,
        variants: updater([...(c.variants ?? [])]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<PnjVariantItem>) =>
    write(list => list.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));

  const remove = (i: number) => {
    if (variants.length <= 1) {
      toast.error('Cần ít nhất 1 góc nhìn');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `v_${Date.now().toString(36)}`,
        label: 'Góc mới',
        desc: 'Mô tả góc nhìn sản phẩm.',
        image: '/pnj/frames/frame-001.webp',
        highlights: ['Điểm nổi bật 1', 'Điểm nổi bật 2'],
      },
    ]);

  return (
    <PopoverTrigger
      label='Góc nhìn'
      preview={`${variants.length} góc`}
      width={480}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.map((v, i) => (
          <div
            key={v.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn góc nhìn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá góc ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={v.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='field-sizing-fixed min-h-16 resize-y overflow-y-auto border-neutral-200 bg-white text-xs'
            />
            <Input
              value={v.image}
              onChange={e => update(i, { image: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Textarea
              value={(v.highlights ?? []).join('\n')}
              onChange={e =>
                update(i, {
                  highlights: e.target.value
                    .split('\n')
                    .map(s => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder='Highlights — mỗi dòng 1 mục'
              className='field-sizing-fixed min-h-14 resize-y overflow-y-auto border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm góc nhìn' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ STICKY MENU ITEMS

function PnjStickyMenuItemsControls({
  content,
  onContentChange,
}: {
  content: PnjStickyMenuContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = content.items ?? [];

  const write = (
    updater: (list: PnjStickyMenuItem[]) => PnjStickyMenuItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as PnjStickyMenuContent;
      return {
        ...c,
        items: updater([...(c.items ?? [])]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<PnjStickyMenuItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục menu');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `nav_${Date.now().toString(36)}`,
        label: 'Mục mới',
        link: 'section-id',
      },
    ]);

  return (
    <PopoverTrigger
      label='Menu items'
      preview={`${items.length} mục`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={item.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn (title)'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.link}
              onChange={e => update(i, { link: e.target.value })}
              placeholder='Link — section id (vd: contact) hoặc https://…'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục menu' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINTV2 PROCESS STEPS

function MintV2ProcessStepsControls({
  content,
  onContentChange,
}: {
  content: MintV2ProcessContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const steps = Array.isArray(content.steps) ? content.steps : [];

  const write = (
    updater: (list: MintV2ProcessStep[]) => MintV2ProcessStep[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintV2ProcessContent;
      const prevSteps = Array.isArray(c.steps) ? c.steps : [];
      return {
        ...c,
        steps: updater([...prevSteps]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintV2ProcessStep>) =>
    write(list =>
      list.map((step, idx) => (idx === i ? { ...step, ...patch } : step))
    );

  const remove = (i: number) => {
    if (steps.length <= 1) {
      toast.error('Cần ít nhất 1 bước');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => {
      const nextNo = String(list.length + 1).padStart(2, '0');
      return [
        ...list,
        {
          key: `s_${Date.now().toString(36)}`,
          no: nextNo,
          title: 'New Step',
          body: 'Describe this step…',
        },
      ];
    });

  return (
    <PopoverTrigger
      label='Danh sách bước'
      preview={`${steps.length} bước`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {steps.map((step, i) => (
          <div
            key={step.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={step.no ?? ''}
                onChange={e => update(i, { no: e.target.value })}
                placeholder='01'
                className='h-8 w-16 shrink-0 border-neutral-200 bg-white text-xs font-semibold'
              />
              <Input
                value={step.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá bước ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={step.body ?? ''}
              onChange={e => update(i, { body: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm bước' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── VAULT CRAFT ITEMS

const CRAFT_DEFAULT_IMG =
  'https://images.unsplash.com/photo-1624365169364-0640dd10e180?auto=format&fit=crop&w=1200&q=80';

function MintVaultCraftItemsControls({
  content,
  onContentChange,
}: {
  content: MintVaultCraftContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: MintVaultCraftItem[]) => MintVaultCraftItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintVaultCraftContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintVaultCraftItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        title: 'New proof',
        description: 'Describe this proof point…',
        imageUrl: CRAFT_DEFAULT_IMG,
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.title ?? ''}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={item.description ?? ''}
              onChange={e => update(i, { description: e.target.value })}
              placeholder='Mô tả'
              rows={2}
              className='min-h-0 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={item.imageUrl ?? ''}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── VAULT IMAGES (string[])

const VAULT_IMAGE_DEFAULT =
  'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=1200&q=80';

/**
 * List manager cho `images: string[]` — dùng chung mint_vault_reveal (gallery
 * 3D) / mint_vault_hero (trail) / mint_vault_invitation (explosion). Content
 * nhận rộng vì 3 block khác type nhưng cùng shape mảng ảnh.
 */
function MintVaultImagesControls({
  label,
  content,
  onContentChange,
}: {
  label: string;
  content: { images?: string[] };
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const images = Array.isArray(content.images) ? content.images : [];

  const write = (updater: (list: string[]) => string[]) => {
    onContentChange(prev => {
      const c = prev as { images?: string[] };
      const prevImages = Array.isArray(c.images) ? c.images : [];
      return {
        ...c,
        images: updater([...prevImages]),
      } as BlockContent;
    });
  };

  const update = (i: number, value: string) =>
    write(list => list.map((src, idx) => (idx === i ? value : src)));

  const remove = (i: number) => {
    if (images.length <= 1) {
      toast.error('Cần ít nhất 1 ảnh');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () => write(list => [...list, VAULT_IMAGE_DEFAULT]);

  return (
    <PopoverTrigger
      label={label}
      preview={`${images.length} ảnh`}
      icon={<ImageIcon className='size-3.5' />}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {images.map((src, i) => (
          <div
            key={i}
            className='flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2'
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=''
              className='size-9 shrink-0 rounded object-cover ring-1 ring-neutral-200'
            />
            <Input
              value={src}
              onChange={e => update(i, e.target.value)}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <button
              type='button'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                remove(i);
              }}
              aria-label={`Xoá ảnh ${i + 1}`}
              className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
            >
              <Trash2 className='size-3.5' />
            </button>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm ảnh' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINT VAULT COLLECTION COINS
let mintVaultCoinSeq = 0;

function MintVaultCoinsControls({
  content,
  onContentChange,
}: {
  content: MintVaultCollectionContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const coins = Array.isArray(content.coins) ? content.coins : [];

  const write = (updater: (list: MintVaultCoin[]) => MintVaultCoin[]) => {
    onContentChange(prev => {
      const c = prev as MintVaultCollectionContent;
      const prevCoins = Array.isArray(c.coins) ? c.coins : [];
      return { ...c, coins: updater([...prevCoins]) } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintVaultCoin>) =>
    write(list =>
      list.map((coin, idx) => (idx === i ? { ...coin, ...patch } : coin))
    );

  const remove = (i: number) => {
    if (coins.length <= 1) {
      toast.error('Cần ít nhất 1 coin');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () => {
    mintVaultCoinSeq += 1;
    write(list => [
      ...list,
      {
        key: `coin-${Date.now()}-${mintVaultCoinSeq}`,
        name: 'New coin',
        image: MINT_IMG.coinReverse,
        metal: 'Gold',
        weight: '1 oz',
        price: '$0',
        url: '#',
      },
    ]);
  };

  return (
    <PopoverTrigger
      label='Bộ sưu tập coin'
      preview={`${coins.length} coin`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {coins.map((coin, i) => (
          <div
            key={coin.key ?? i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={coin.name ?? ''}
                onChange={e => update(i, { name: e.target.value })}
                placeholder='Tên coin'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá coin ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex gap-2'>
              <Input
                value={coin.metal ?? ''}
                onChange={e => update(i, { metal: e.target.value })}
                placeholder='Kim loại'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={coin.weight ?? ''}
                onChange={e => update(i, { weight: e.target.value })}
                placeholder='Trọng lượng'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={coin.price ?? ''}
                onChange={e => update(i, { price: e.target.value })}
                placeholder='Giá'
                className='h-8 border-neutral-200 bg-white text-xs'
              />
            </div>
            <Input
              value={coin.image ?? ''}
              onChange={e => update(i, { image: e.target.value })}
              placeholder='URL ảnh'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <Input
              value={coin.url ?? ''}
              onChange={e => update(i, { url: e.target.value })}
              placeholder='Link mint.ca (tuỳ chọn)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm coin' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── MINTV2 SERVICES ITEMS

function MintV2ServicesItemsControls({
  content,
  onContentChange,
}: {
  content: MintV2ServicesContent;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}) {
  const items = Array.isArray(content.items) ? content.items : [];

  const write = (
    updater: (list: MintV2ServiceItem[]) => MintV2ServiceItem[]
  ) => {
    onContentChange(prev => {
      const c = prev as MintV2ServicesContent;
      const prevItems = Array.isArray(c.items) ? c.items : [];
      return {
        ...c,
        items: updater([...prevItems]),
      } as BlockContent;
    });
  };

  const update = (i: number, patch: Partial<MintV2ServiceItem>) =>
    write(list =>
      list.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  const remove = (i: number) => {
    if (items.length <= 1) {
      toast.error('Cần ít nhất 1 mục');
      return;
    }
    write(list => list.filter((_, idx) => idx !== i));
  };

  const add = () =>
    write(list => [
      ...list,
      {
        key: `svc_${Date.now().toString(36)}`,
        label: 'Mục mới',
        preview: MINT_IMG.painting,
        caption: 'Caption',
      },
    ]);

  return (
    <PopoverTrigger
      label='Danh sách mục'
      preview={`${items.length} mục`}
      width={440}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {items.map((item, i) => (
          <div
            key={item.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={item.label ?? ''}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(i);
                }}
                aria-label={`Xoá mục ${i + 1}`}
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={item.caption ?? ''}
              onChange={e => update(i, { caption: e.target.value })}
              placeholder='Caption'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <ImagePicker
              value={item.preview ?? ''}
              onChange={url => update(i, { preview: url })}
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm mục' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ HOTSPOTS (form)

function PnjHotspotsControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const hotspots = content.hotspots ?? [];

  const update = (i: number, patch: Partial<PnjHeroHotspot>) =>
    onContentChange({
      ...content,
      hotspots: hotspots.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      hotspots: hotspots.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      hotspots: [
        ...hotspots,
        {
          key: `hs_${Date.now().toString(36)}`,
          label: 'Điểm mới',
          desc: 'Mô tả chi tiết.',
          img: '',
          dotX: 50,
          dotY: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot / chi tiết'
      preview={`${hotspots.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {hotspots.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có hotspot — block chỉ scrub frame, không drawer.
          </p>
        ) : null}
        {hotspots.map((h, i) => (
          <div
            key={h.key || i}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={h.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá hotspot'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={h.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <Input
              value={h.img}
              onChange={e => update(i, { img: e.target.value })}
              placeholder='URL ảnh trong drawer'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.dotX}
                  onChange={e => update(i, { dotX: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.dotY}
                  onChange={e => update(i, { dotY: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ FRAMES (JSON)

const PNJ_FRAMES_HINT = JSON.stringify(PNJ_HERO_FRAMES_DEFAULT, null, 2);

function PnjFramesJsonControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const resolved = resolvePnjHeroFrames(content);
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(content.frames ?? PNJ_HERO_FRAMES_DEFAULT, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(
      JSON.stringify(content.frames ?? PNJ_HERO_FRAMES_DEFAULT, null, 2)
    );
    setError(null);
  }, [content.frames]);

  const handleApply = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!isPnjHeroFramesConfig(parsed)) {
        setError(
          'Cần object: desktop/mobile mỗi cái { total: number > 0, prefix: string }, ext? string.'
        );
        toast.error('JSON frames sai schema');
        return;
      }
      setError(null);
      onContentChange({
        ...content,
        frames: {
          desktop: {
            total: Math.floor(parsed.desktop.total),
            prefix: parsed.desktop.prefix.trim(),
          },
          mobile: {
            total: Math.floor(parsed.mobile.total),
            prefix: parsed.mobile.prefix.trim(),
          },
          ...(parsed.ext !== undefined
            ? { ext: parsed.ext.trim() || undefined }
            : {}),
        },
      } as BlockContent);
      toast.success(
        `Đã cập nhật frames · ${Math.floor(parsed.desktop.total)} desktop · ${Math.floor(parsed.mobile.total)} mobile`
      );
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    const next = { ...content } as Record<string, unknown>;
    delete next.frames;
    onContentChange(next as BlockContent);
    setDraft(JSON.stringify(PNJ_HERO_FRAMES_DEFAULT, null, 2));
    setError(null);
    toast.success('Đã reset về frame PNJ mặc định');
  };

  const handleLoadMintExample = () => {
    setDraft(JSON.stringify(MINT_FRAMES_EXAMPLE, null, 2));
    setError(null);
  };

  const isCustom = content.frames !== undefined;

  return (
    <PopoverTrigger
      label='Frames / JSON'
      preview={`${resolved.desktop.total} · ${resolved.mobile.total}${isCustom ? '' : ' (mặc định)'}`}
      width={520}
    >
      <p className='text-2xs mb-2 text-neutral-500'>
        Object JSON — desktop/mobile: total + prefix (URL tới frame-001.webp =
        prefix + 001 + ext). Để trống / Reset = PNJ mặc định.
      </p>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        placeholder={PNJ_FRAMES_HINT}
        spellCheck={false}
        data-lenis-prevent
        className='field-sizing-fixed h-64 max-h-[50vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Frames JSON'
      />
      {error && (
        <p className='text-2xs mt-1.5 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='mt-2 flex flex-col gap-1.5'>
        <button
          type='button'
          onClick={handleApply}
          className='flex h-8 w-full cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <div className='flex gap-1.5'>
          <button
            type='button'
            onClick={handleLoadMintExample}
            className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
          >
            Mẫu Mint CDN
          </button>
          <button
            type='button'
            onClick={handleReset}
            className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
          >
            Reset PNJ mặc định
          </button>
        </div>
      </div>
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX PRODUCT HOTSPOTS

function DelvauxHotspotsControls({
  content,
  onContentChange,
}: {
  content: DelvauxProductContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const hotspots = content.hotspots ?? [];

  const update = (i: number, patch: Partial<DelvauxProductHotspot>) =>
    onContentChange({
      ...content,
      hotspots: hotspots.map((h, idx) => (idx === i ? { ...h, ...patch } : h)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      hotspots: hotspots.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      hotspots: [
        ...hotspots,
        {
          title: 'Điểm mới',
          desc: 'Mô tả chi tiết hotspot.',
          mediaType: 'image',
          mediaUrl: '',
          x: 50,
          y: 50,
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Hotspot'
      preview={`${hotspots.length} hotspot`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {hotspots.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có hotspot — thêm điểm trên ảnh sản phẩm.
          </p>
        ) : null}
        {hotspots.map((h, i) => (
          <div
            key={`dvx-hs-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={h.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder='Tiêu đề hotspot'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá hotspot'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={h.desc}
              onChange={e => update(i, { desc: e.target.value })}
              placeholder='Mô tả'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex items-center gap-1 text-neutral-500'>
                Loại
                <select
                  value={h.mediaType}
                  onChange={e =>
                    update(i, {
                      mediaType: e.target.value === 'video' ? 'video' : 'image',
                    })
                  }
                  className='h-8 rounded-md border border-neutral-200 bg-white px-1.5 text-xs text-neutral-800'
                  aria-label={`Media type hotspot ${i + 1}`}
                >
                  <option value='image'>Ảnh</option>
                  <option value='video'>Video</option>
                </select>
              </label>
              <Input
                value={h.mediaUrl}
                onChange={e => update(i, { mediaUrl: e.target.value })}
                placeholder='URL media'
                className='h-8 flex-1 border-neutral-200 bg-white text-xs'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot X%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.x}
                  onChange={e => update(i, { x: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
              <label className='text-2xs flex flex-1 items-center gap-1 text-neutral-500'>
                Dot Y%
                <Input
                  type='number'
                  min={0}
                  max={100}
                  value={h.y}
                  onChange={e => update(i, { y: Number(e.target.value) })}
                  className='h-8 border-neutral-200 bg-white text-xs'
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm hotspot' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX SUBNAV LINKS

function DelvauxSubnavLinksControls({
  content,
  onContentChange,
}: {
  content: DelvauxSubnavContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const links = content.links ?? [];

  const update = (i: number, patch: Partial<DelvauxSubnavLink>) =>
    onContentChange({
      ...content,
      links: links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      links: links.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      links: [
        ...links,
        {
          label: 'Link mới',
          targetId: 'section-id',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Anchor links'
      preview={`${links.length} link`}
      width={420}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {links.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có link — thêm anchor tới section id.
          </p>
        ) : null}
        {links.map((l, i) => (
          <div
            key={`dvx-nav-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={l.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá link'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Input
              value={l.targetId}
              onChange={e => update(i, { targetId: e.target.value })}
              placeholder='Section id (vd: description)'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm link' />
    </PopoverTrigger>
  );
}


// ─────────────────────────────────────────── DELVAUX VARIANT (swatches + FAQ)

function DelvauxVariantsControls({
  content,
  onContentChange,
}: {
  content: DelvauxVariantContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const variants = content.variants ?? [];

  const update = (i: number, patch: Partial<DelvauxVariantOption>) =>
    onContentChange({
      ...content,
      variants: variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      variants: variants.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      variants: [
        ...variants,
        {
          label: 'Màu mới',
          ref: '',
          color: '#764733',
          imageUrl: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger
      label='Màu (swatch)'
      preview={`${variants.length} màu`}
      width={460}
    >
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {variants.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có màu — thêm biến thể swatch.
          </p>
        ) : null}
        {variants.map((v, i) => (
          <div
            key={`dvx-var-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={v.label}
                onChange={e => update(i, { label: e.target.value })}
                placeholder='Nhãn màu'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá màu'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <Input
                value={v.ref}
                onChange={e => update(i, { ref: e.target.value })}
                placeholder='REF'
                className='h-8 flex-1 border-neutral-200 bg-white text-xs'
              />
              <Input
                value={v.color}
                onChange={e => update(i, { color: e.target.value })}
                placeholder='#hex'
                className='h-8 w-24 border-neutral-200 bg-white text-xs'
                aria-label={`Màu swatch ${i + 1}`}
              />
            </div>
            <Input
              value={v.imageUrl}
              onChange={e => update(i, { imageUrl: e.target.value })}
              placeholder='URL ảnh sản phẩm'
              className='h-8 border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm màu' />
    </PopoverTrigger>
  );
}

function DelvauxFaqsControls({
  content,
  onContentChange,
}: {
  content: DelvauxVariantContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const faqs = content.faqs ?? [];

  const update = (i: number, patch: Partial<DelvauxVariantFaq>) =>
    onContentChange({
      ...content,
      faqs: faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    } as BlockContent);

  const remove = (i: number) =>
    onContentChange({
      ...content,
      faqs: faqs.filter((_, idx) => idx !== i),
    } as BlockContent);

  const add = () =>
    onContentChange({
      ...content,
      faqs: [
        ...faqs,
        {
          question: 'Câu hỏi mới',
          answer: '',
        },
      ],
    } as BlockContent);

  return (
    <PopoverTrigger label='FAQ' preview={`${faqs.length} mục`} width={460}>
      <div className='flex max-h-80 flex-col gap-2 overflow-y-auto pr-1'>
        {faqs.length === 0 ? (
          <p className='text-2xs rounded-md border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-neutral-500'>
            Chưa có FAQ — thêm câu hỏi / trả lời.
          </p>
        ) : null}
        {faqs.map((f, i) => (
          <div
            key={`dvx-faq-${i}`}
            className='flex flex-col gap-1.5 rounded-md border border-neutral-200 bg-white p-2'
          >
            <div className='flex items-center gap-2'>
              <Input
                value={f.question}
                onChange={e => update(i, { question: e.target.value })}
                placeholder='Câu hỏi'
                className='h-8 border-neutral-200 bg-white text-xs font-semibold'
              />
              <button
                type='button'
                onClick={() => remove(i)}
                aria-label='Xoá FAQ'
                className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-rose-500 hover:bg-rose-50'
              >
                <Trash2 className='size-3.5' />
              </button>
            </div>
            <Textarea
              value={f.answer}
              onChange={e => update(i, { answer: e.target.value })}
              placeholder='Trả lời'
              className='min-h-16 resize-none border-neutral-200 bg-white text-xs'
            />
          </div>
        ))}
      </div>
      <AddRow onAdd={add} label='Thêm FAQ' />
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── DELVAUX FRAMES (pattern + JSON)

function resolveDelvauxFrameCount(content: DelvauxHeroContent): number {
  if (Array.isArray(content.frameUrls) && content.frameUrls.length > 1) {
    return content.frameUrls.length;
  }
  const pattern = content.frameUrlPattern ?? '';
  const n = Number(content.frameCount) || 0;
  if (pattern.includes('{i}') && n > 1) return n;
  return 0;
}

function DelvauxFramesControls({
  content,
  onContentChange,
}: {
  content: DelvauxHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const listCount = Array.isArray(content.frameUrls)
    ? content.frameUrls.length
    : 0;
  const usesList = listCount > 1;
  const count = resolveDelvauxFrameCount(content);
  const isDefault =
    usesList &&
    listCount === DELVAUX_HERO_FRAMES.length &&
    content.frameUrls?.[0] === DELVAUX_HERO_FRAMES[0];

  const [pattern, setPattern] = React.useState(
    () => content.frameUrlPattern ?? ''
  );
  const [frameCount, setFrameCount] = React.useState(() =>
    String(content.frameCount > 1 ? content.frameCount : 96)
  );
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(usesList ? content.frameUrls : DELVAUX_HERO_FRAMES, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPattern(content.frameUrlPattern ?? '');
    setFrameCount(String(content.frameCount > 1 ? content.frameCount : 96));
    const list =
      Array.isArray(content.frameUrls) && content.frameUrls.length > 1
        ? content.frameUrls
        : DELVAUX_HERO_FRAMES;
    setDraft(JSON.stringify(list, null, 2));
    setError(null);
  }, [content.frameUrls, content.frameUrlPattern, content.frameCount]);

  const handleApplyPattern = () => {
    const trimmed = pattern.trim();
    const n = Math.floor(Number(frameCount));
    if (!trimmed.includes('{i}')) {
      setError('URL phải chứa {i} (chỉ số frame 1-based).');
      toast.error('Pattern thiếu {i}');
      return;
    }
    if (!Number.isFinite(n) || n < 2) {
      setError('Số frame phải ≥ 2.');
      toast.error('Số frame không hợp lệ');
      return;
    }
    setError(null);
    onContentChange({
      ...content,
      frameUrlPattern: trimmed,
      frameCount: n,
      frameUrls: [],
    } as BlockContent);
    toast.success(`Đã áp dụng pattern · ${n} frames`);
  };

  const handleApplyJson = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (
        !Array.isArray(parsed) ||
        parsed.length < 2 ||
        !parsed.every(u => typeof u === 'string' && u.trim().length > 0)
      ) {
        setError('JSON phải là mảng ≥ 2 URL string.');
        toast.error('JSON frames sai schema');
        return;
      }
      const urls = parsed.map(u => (u as string).trim());
      setError(null);
      onContentChange({
        ...content,
        frameUrls: urls,
        frameCount: urls.length,
        frameUrlPattern: '',
      } as BlockContent);
      toast.success(`Đã cập nhật chuỗi frame · ${urls.length} frames`);
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    onContentChange({
      ...content,
      frameUrls: [...DELVAUX_HERO_FRAMES],
      frameCount: DELVAUX_HERO_FRAMES.length,
      frameUrlPattern: '',
    } as BlockContent);
    setDraft(JSON.stringify(DELVAUX_HERO_FRAMES, null, 2));
    setPattern('');
    setFrameCount(String(DELVAUX_HERO_FRAMES.length));
    setError(null);
    toast.success(
      `Đã reset chuỗi frame · ${DELVAUX_HERO_FRAMES.length} frames`
    );
  };

  const modeLabel = isDefault
    ? ' (mặc định)'
    : usesList
      ? ' (JSON)'
      : count > 0
        ? ' (pattern)'
        : '';

  return (
    <PopoverTrigger
      label='Chuỗi frame'
      preview={`${count || 0} frames${modeLabel}`}
      width={520}
    >
      <p className='text-2xs mb-2 text-neutral-500'>
        Lớp intro tua theo scroll sau khi ảnh khung fade. Dùng pattern URL có
        {' {i} '}hoặc dán JSON mảng URL (CDN uuid).
      </p>

      <p className='text-2xs mb-1 font-medium text-neutral-700'>
        Pattern nhanh
      </p>
      <Input
        value={pattern}
        onChange={e => {
          setPattern(e.target.value);
          setError(null);
        }}
        placeholder='https://cdn.example.com/frame-{i}.jpg'
        className='mb-1.5 h-8 border-neutral-200 bg-white font-mono text-[11px]'
        aria-label='Frame URL pattern'
      />
      <div className='mb-2 flex gap-1.5'>
        <Input
          type='number'
          min={2}
          value={frameCount}
          onChange={e => {
            setFrameCount(e.target.value);
            setError(null);
          }}
          className='h-8 w-24 border-neutral-200 bg-white text-xs'
          aria-label='Số frame'
        />
        <button
          type='button'
          onClick={handleApplyPattern}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng pattern
        </button>
      </div>

      <p className='text-2xs mb-1 font-medium text-neutral-700'>
        JSON mảng URL
      </p>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        spellCheck={false}
        data-lenis-prevent
        className='mb-2 field-sizing-fixed h-40 max-h-[40vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Frames JSON array'
      />
      {error && (
        <p className='text-2xs mb-2 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='flex gap-1.5'>
        <button
          type='button'
          onClick={handleApplyJson}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
        >
          Reset mặc định
        </button>
      </div>
    </PopoverTrigger>
  );
}

// ─────────────────────────────────────────── PNJ SCRIM (preset + JSON)

function PnjScrimControls({
  content,
  onContentChange,
}: {
  content: PnjHeroContent;
  onContentChange: (next: BlockContent) => void;
}) {
  const resolved = resolvePnjHeroScrim(content);
  const [draft, setDraft] = React.useState(() =>
    JSON.stringify(resolved.layers, null, 2)
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(JSON.stringify(resolvePnjHeroScrim(content).layers, null, 2));
    setError(null);
  }, [content.scrim]);

  const preview = resolved.isCustom
    ? `custom · ${resolved.layers.length} layer`
    : PNJ_HERO_SCRIM_PRESET_LABELS[resolved.presetId];

  const handlePreset = (preset: (typeof PNJ_HERO_SCRIM_PRESET_IDS)[number]) => {
    onContentChange({
      ...content,
      scrim: { preset },
    } as BlockContent);
    toast.success(`Scrim: ${PNJ_HERO_SCRIM_PRESET_LABELS[preset]}`);
  };

  const handleApplyJson = () => {
    try {
      const parsed: unknown = JSON.parse(draft);
      if (!Array.isArray(parsed)) {
        setError('JSON phải là mảng layers.');
        toast.error('JSON scrim không hợp lệ');
        return;
      }
      const candidate = { layers: parsed };
      if (!isPnjHeroScrimConfig(candidate)) {
        setError(
          'Mỗi layer cần background (string); top/right/bottom/left/height/width? string; opacity? number.'
        );
        toast.error('JSON scrim sai schema');
        return;
      }
      setError(null);
      onContentChange({
        ...content,
        scrim: {
          preset: content.scrim?.preset ?? 'pnj',
          layers: candidate.layers,
        },
      } as BlockContent);
      toast.success(
        `Đã cập nhật ${candidate.layers?.length ?? 0} lớp mờ (custom)`
      );
    } catch {
      setError('Không parse được JSON.');
      toast.error('JSON không hợp lệ');
    }
  };

  const handleReset = () => {
    const next = { ...content } as Record<string, unknown>;
    delete next.scrim;
    onContentChange(next as BlockContent);
    setDraft(JSON.stringify(PNJ_HERO_SCRIM_PNJ_LAYERS, null, 2));
    setError(null);
    toast.success('Đã reset lớp mờ về PNJ mặc định');
  };

  return (
    <PopoverTrigger label='Lớp mờ' preview={preview} width={480}>
      <p className='text-2xs mb-2 text-neutral-500'>
        Preset nhanh hoặc JSON layers (background CSS + vị trí tùy chọn).
      </p>
      <div className='mb-2 flex flex-wrap gap-1.5'>
        {PNJ_HERO_SCRIM_PRESET_IDS.map(id => {
          const active = !resolved.isCustom && resolved.presetId === id;
          return (
            <button
              key={id}
              type='button'
              onClick={() => handlePreset(id)}
              className={cn(
                'h-7 cursor-pointer rounded-md px-2.5 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200/70 hover:bg-white'
              )}
            >
              {PNJ_HERO_SCRIM_PRESET_LABELS[id]}
            </button>
          );
        })}
      </div>
      <Textarea
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          setError(null);
        }}
        spellCheck={false}
        data-lenis-prevent
        className='field-sizing-fixed h-48 max-h-[40vh] min-h-0 resize-y overflow-y-auto overscroll-contain border-neutral-200 bg-white font-mono text-[11px] leading-relaxed'
        aria-label='Scrim layers JSON'
      />
      {error && (
        <p className='text-2xs mt-1.5 text-rose-600' role='alert'>
          {error}
        </p>
      )}
      <div className='mt-2 flex gap-1.5'>
        <button
          type='button'
          onClick={handleApplyJson}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-900 text-xs font-medium text-white transition-colors hover:bg-neutral-800'
        >
          Áp dụng JSON
        </button>
        <button
          type='button'
          onClick={handleReset}
          className='flex h-8 flex-1 cursor-pointer items-center justify-center rounded-md bg-neutral-50 text-xs font-medium text-neutral-700 ring-1 ring-neutral-200/70 transition-colors hover:bg-white'
        >
          Reset PNJ
        </button>
      </div>
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
          className='flex h-7 cursor-pointer items-center gap-1 rounded-md bg-neutral-900 px-2.5 text-[10px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800'
        >
          <Sparkles className='size-3.5 text-sky-300' />
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
            <span className='text-3xs font-semibold tracking-[0.16em] text-neutral-700 uppercase'>
              AI tạo nội dung
            </span>
            <span className='text-3xs ml-auto font-mono tracking-tight text-neutral-400'>
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
            <span className='text-3xs font-mono tracking-tight text-neutral-400'>
              ⌘ Enter
            </span>
            <button
              type='button'
              onClick={() => void submit()}
              disabled={busy}
              className='text-2xs flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-3 font-semibold tracking-tight text-white transition-colors hover:bg-neutral-700 disabled:opacity-50'
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
  primary = false,
  children,
}: {
  label: string;
  preview: string;
  icon?: React.ReactNode;
  width?: number;
  /** Emphasize as the main action in a sparse toolbar (e.g. image manage). */
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type='button'
          className={cn(
            'flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors',
            primary
              ? 'bg-neutral-900 text-white hover:bg-neutral-800'
              : 'bg-neutral-50 text-neutral-700 ring-1 ring-neutral-200/70 hover:bg-white hover:text-neutral-900 hover:ring-neutral-300'
          )}
        >
          {icon ? (
            <span
              className={cn(
                'shrink-0',
                primary ? 'text-white/80' : 'text-neutral-500'
              )}
            >
              {icon}
            </span>
          ) : null}
          <span className={cn(primary ? 'text-white' : 'text-neutral-800')}>
            {label}
          </span>
          <span
            className={cn(
              'max-w-[9rem] truncate text-[11px]',
              primary ? 'text-white/55' : 'text-neutral-400'
            )}
          >
            {preview}
          </span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0',
              primary ? 'text-white/50' : 'text-neutral-400'
            )}
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align='start'
          sideOffset={10}
          style={{ width }}
          className='z-50 flex flex-col gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-[0_12px_40px_rgba(15,15,15,0.1),0_2px_6px_rgba(15,15,15,0.04)] outline-none'
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
        'flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
        active &&
          'bg-neutral-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-neutral-900 hover:text-white',
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
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onAdd();
      }}
      className='flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 py-2 text-xs font-medium text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
    >
      <Plus className='size-3.5' />
      {label}
    </button>
  );
}

function Sep() {
  return <div className='mx-0.5 h-5 w-px shrink-0 bg-neutral-200/90' />;
}

function InlineLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className='flex items-center gap-2'>
      <span className='text-[10px] font-medium tracking-[0.06em] text-neutral-400 uppercase'>
        {label}
      </span>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────── COLOR SWATCH (token + custom hex)

function normalizeCssColor(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^(rgb|rgba|hsl|hsla)\(/i.test(s)) return s;
  const withHash = s.startsWith('#') ? s : `#${s}`;
  if (/^#([0-9a-fA-F]{3})$/.test(withHash)) {
    const [, a, b, c] = withHash.match(/^#(.)(.)(.)$/)!;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(withHash)) {
    return withHash.toLowerCase();
  }
  return null;
}

/** Display value for the hex field — raw color as-is, token → preview hex. */
function colorInputDisplay(value: string): string {
  const role = brandTokenKey(value);
  if (role) return previewColor(role);
  if (/^#|^rgb|^hsl/i.test(value.trim())) return value.trim();
  return value;
}

// Brand token swatches + free-form hex/rgb. Tokens store `token:<role>`;
// custom colors store raw CSS so `resolveColorValue` passes them through.
function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const activeRole = brandTokenKey(value);
  const isCustom = !activeRole;
  const [draft, setDraft] = React.useState(() => colorInputDisplay(value));
  const [hexError, setHexError] = React.useState(false);
  const valueRef = React.useRef(value);
  const draftRef = React.useRef(draft);
  const onChangeRef = React.useRef(onChange);
  valueRef.current = value;
  draftRef.current = draft;
  onChangeRef.current = onChange;

  React.useEffect(() => {
    setDraft(colorInputDisplay(value));
    setHexError(false);
  }, [value]);

  // Commit pending hex on unmount — clicking canvas closes the toolbar
  // without firing input blur, which used to drop the typed color.
  React.useEffect(() => {
    return () => {
      const next = normalizeCssColor(draftRef.current);
      if (!next) return;
      if (next === valueRef.current) return;
      if (next === colorInputDisplay(valueRef.current)) return;
      onChangeRef.current(next);
    };
  }, []);

  const commitHex = (raw: string, { soft = false } = {}) => {
    const next = normalizeCssColor(raw);
    if (!next) {
      if (!soft) {
        setHexError(true);
        setDraft(colorInputDisplay(value));
      }
      return;
    }
    setHexError(false);
    if (next !== value) onChange(next);
  };

  const nativeColor =
    normalizeCssColor(colorInputDisplay(value))?.slice(0, 7) ?? '#111111';

  return (
    <div
      className='flex h-7 items-center gap-1.5 rounded-md px-1.5'
      title={`${label} — token thương hiệu hoặc mã màu`}
    >
      <span className='text-3xs font-mono tracking-[0.08em] text-neutral-400 uppercase'>
        {label}
      </span>
      <div className='flex items-center gap-1'>
        {BRAND_COLOR_ROLES.map(role => {
          const selected = activeRole === role.key;
          return (
            <button
              key={role.key}
              type='button'
              onClick={() => onChange(brandToken(role.key))}
              title={role.label}
              aria-label={`${label}: ${role.label}`}
              className={cn(
                'size-4 rounded-sm ring-1 ring-black/10 transition',
                selected && 'ring-2 ring-sky-500 ring-offset-1'
              )}
              style={{ backgroundColor: previewColor(role.key) }}
            />
          );
        })}
      </div>
      <span className='mx-0.5 h-4 w-px shrink-0 bg-neutral-200' aria-hidden />
      <label className='relative size-4 shrink-0 cursor-pointer overflow-hidden rounded-sm ring-1 ring-black/10'>
        <span
          className='pointer-events-none absolute inset-0'
          style={{ backgroundColor: nativeColor }}
          aria-hidden
        />
        <input
          type='color'
          value={nativeColor}
          onChange={e => onChange(e.target.value.toLowerCase())}
          aria-label={`${label}: chọn màu`}
          className='absolute inset-0 cursor-pointer opacity-0'
        />
      </label>
      <Input
        value={draft}
        onChange={e => {
          const next = e.target.value;
          setDraft(next);
          setHexError(false);
          // Live-apply when the typed value is already a complete valid color.
          commitHex(next, { soft: true });
        }}
        onBlur={() => commitHex(draft)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitHex(draft);
          }
        }}
        placeholder='#hex'
        spellCheck={false}
        aria-label={`${label}: mã màu`}
        aria-invalid={hexError}
        className={cn(
          'h-6 w-[5.5rem] border-neutral-200 bg-white px-1.5 font-mono text-[10px] tracking-tight',
          isCustom && 'ring-1 ring-sky-400/60',
          hexError && 'border-rose-400 text-rose-600'
        )}
      />
    </div>
  );
}
