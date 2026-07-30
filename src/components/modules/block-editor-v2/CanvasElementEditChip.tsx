'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Link2, List, Pencil, Type, Upload } from 'lucide-react';

import { cn } from '@/lib/cn';

import { FLOATING, R_FLOATING } from './chrome';

import { ImagePicker } from './ImagePicker';
import { getContentAt, setContentAt } from './contentPath';
import { resolveAlturaOlympusImages } from '@/components/modules/block-editor/blocks/_registry/defs/alturaOlympus';
import { LinkControls } from '@/components/modules/block-editor-v2/links/LinkControls';
import {
  canvasEditActionLabel,
  type ElementKind,
  type ResolvedElementMeta,
} from './resolveElementKind';
import type {
  AlturaOlympusContent,
  BlockContent,
  BlockType,
  ImageTransform,
} from '@/components/modules/block-editor/types';

export interface CanvasElementEditChipProps {
  elementKey: string;
  meta: ResolvedElementMeta;
  /** Viewport rect of the hovered/active element (from getBoundingClientRect). */
  rect: DOMRect;
  /** Surface container — chip positions relative to this. */
  surfaceEl: HTMLElement;
  content: BlockContent;
  blockType?: BlockType;
  /** Controlled image popover — parent opens this on element click. */
  imageOpen: boolean;
  onImageOpenChange: (open: boolean) => void;
  /** Controlled link popover — parent opens this on link click. */
  linkOpen: boolean;
  onLinkOpenChange: (open: boolean) => void;
  /** Content path the link popover edits (element key or sibling link field). */
  linkFieldKey: string;
  /** Label-only fields that share a sibling link (sticky menu nav items). */
  siblingLinkKey?: string | null;
  /** Same activate path as clicking the element itself. */
  onActivate: (key: string) => void;
  /** Open link picker for a specific content path (label → sibling link). */
  onOpenLink?: (key: string) => void;
  /** Keep hover alive while pointer is over the chip / popover. */
  onChipPointerEnter: () => void;
  onChipPointerLeave: () => void;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
}

function chipIcon(kind: ElementKind) {
  if (kind === 'image') return Upload;
  if (kind === 'link') return Link2;
  if (kind === 'text') return Type;
  if (
    kind === 'stats' ||
    kind === 'features' ||
    kind === 'reasons' ||
    kind === 'slides' ||
    kind === 'scrollMattisSlides' ||
    kind === 'interactiveAd' ||
    kind === 'mintVariants' ||
    kind === 'mintTabs' ||
    kind === 'pnjParagraphs' ||
    kind === 'pnjTitleLines' ||
    kind === 'pnjVariants' ||
    kind === 'pnjVariantHighlights' ||
    kind === 'pnjStickyMenuItems' ||
    kind === 'mintV2ServicesItems' ||
    kind === 'coolHunterGalleryItems' ||
    kind === 'alturaOlympusFeatures' ||
    kind === 'alturaOlympusImages' ||
    kind === 'mintV2ProcessSteps' ||
    kind === 'framerDarlingTimelineItems' ||
    kind === 'framerPerformPricingTiers' ||
    kind === 'pnjFrames' ||
    kind === 'pnjScrim' ||
    kind === 'delvauxFrames' ||
    kind === 'delvauxHotspots' ||
    kind === 'delvauxVariants' ||
    kind === 'delvauxFaqs' ||
    kind === 'delvauxSubnavLinks' ||
    kind === 'aesthaNavLinks'
  ) {
    return List;
  }
  return Pencil;
}

function imageTransformKey(fieldKey: string): string | null {
  if (fieldKey === 'imageUrl') return 'imageTransform';
  if (fieldKey === 'backgroundUrl') return 'backgroundTransform';
  return null;
}

const chipClassName = cn(
  'pointer-events-auto flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-[var(--pv2-ink)] px-2 text-white',
  FLOATING,
  'text-2xs font-medium tracking-wide',
  'origin-bottom-right transition-[opacity,transform,background-color] duration-150',
  'hover:bg-[var(--pv2-slate-500)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

const chipIconOnlyClassName = cn(chipClassName, 'px-1.5');

const popoverContentClassName = cn(
  'z-50 bg-[var(--pv2-paper)] p-3 outline-none',
  R_FLOATING,
  FLOATING
);

/**
 * Floating edit affordance. Clicking the chip runs the same activate path as
 * clicking the element. Image/link popovers are controlled by the parent so an
 * element click can open upload / link picker immediately.
 */
export function CanvasElementEditChip({
  elementKey,
  meta,
  rect,
  surfaceEl,
  content,
  blockType,
  imageOpen,
  onImageOpenChange,
  linkOpen,
  onLinkOpenChange,
  linkFieldKey,
  siblingLinkKey,
  onActivate,
  onOpenLink,
  onChipPointerEnter,
  onChipPointerLeave,
  onContentChange,
}: CanvasElementEditChipProps) {
  const surfaceRect = surfaceEl.getBoundingClientRect();
  const top = rect.top - surfaceRect.top - 8;
  const left = rect.right - surfaceRect.left - 8;

  const Icon = chipIcon(meta.kind);
  const actionLabel = canvasEditActionLabel(meta.kind);
  const isImageAction = meta.kind === 'image';
  const isLinkAction = meta.kind === 'link';
  const hasSiblingLink = !!siblingLinkKey && meta.kind === 'text';

  const stopPointer = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handleActivateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate(elementKey);
  };

  const handleOpenSiblingLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!siblingLinkKey) return;
    onOpenLink?.(siblingLinkKey);
  };

  const c = content as Record<string, unknown>;
  const alturaImgMatch =
    blockType === 'altura_olympus'
      ? elementKey.match(/^images\[(\d+)\]$/)
      : null;
  const alturaImgIndex = alturaImgMatch ? Number(alturaImgMatch[1]) : -1;
  const alturaImages =
    alturaImgIndex >= 0
      ? resolveAlturaOlympusImages(content as AlturaOlympusContent)
      : null;

  const imageUrl =
    alturaImages && alturaImgIndex >= 0
      ? (alturaImages[alturaImgIndex] ?? '')
      : ((getContentAt(c, elementKey) as string) ?? '');
  const transformKey = isImageAction ? imageTransformKey(elementKey) : null;
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  const setImageUrl = (next: string) => {
    if (alturaImages && alturaImgIndex >= 0) {
      const list = [...alturaImages];
      while (list.length <= alturaImgIndex) list.push('');
      list[alturaImgIndex] = next;
      onContentChange(prev => {
        const cur = prev as AlturaOlympusContent;
        return { ...cur, images: list } as BlockContent;
      });
      return;
    }
    onContentChange(setContentAt(c, elementKey, next) as BlockContent);
  };

  const setTransform = (next: ImageTransform) => {
    if (!transformKey) return;
    onContentChange({ ...c, [transformKey]: next } as BlockContent);
  };

  const linkPopoverLabel =
    linkFieldKey === elementKey
      ? meta.label
      : resolveElementMetaLabel(linkFieldKey);

  const label = (
    <>
      <Icon className='size-3.5 shrink-0' aria-hidden />
      <span className='max-w-28 truncate'>{actionLabel}</span>
    </>
  );

  const popoverGuards = {
    onOpenAutoFocus: (e: Event) => e.preventDefault(),
    onPointerDownOutside: (e: {
      preventDefault: () => void;
      target: EventTarget | null;
    }) => {
      const t = e.target as HTMLElement;
      if (
        t.closest('[data-canvas-edit-chip-root]') ||
        t.closest('[data-radix-popper-content-wrapper]')
      ) {
        e.preventDefault();
      }
    },
    onPointerEnter: onChipPointerEnter,
    onPointerLeave: onChipPointerLeave,
  };

  const linkPopover = (
    <Popover.Portal>
      <Popover.Content
        side='bottom'
        align='end'
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          popoverContentClassName,
          'w-[min(320px,calc(100vw-24px))]'
        )}
        {...popoverGuards}
      >
        <p className='text-3xs mb-2 font-semibold tracking-widest text-neutral-500 uppercase'>
          {linkPopoverLabel}
        </p>
        <LinkControls
          fieldKey={linkFieldKey}
          content={content}
          onContentChange={onContentChange}
        />
      </Popover.Content>
    </Popover.Portal>
  );

  return (
    <div
      data-canvas-edit-chip-root='true'
      className='pointer-events-auto absolute z-30'
      style={{
        top,
        left,
        transform: 'translate(-100%, -100%)',
        paddingBottom: 28,
        paddingRight: 28,
        marginBottom: -28,
        marginRight: -28,
      }}
      onPointerEnter={onChipPointerEnter}
      onPointerLeave={onChipPointerLeave}
      onPointerDown={stopPointer}
    >
      <div className='flex items-center gap-0.5'>
        {isImageAction ? (
          <Popover.Root open={imageOpen} onOpenChange={onImageOpenChange}>
            <Popover.Anchor asChild>
              <button
                type='button'
                data-canvas-edit-chip='true'
                aria-label={`${actionLabel}: ${meta.label}`}
                title={`${actionLabel} — ${meta.label}`}
                onPointerDown={stopPointer}
                onClick={handleActivateClick}
                className={chipClassName}
              >
                {label}
              </button>
            </Popover.Anchor>
            <Popover.Portal>
              <Popover.Content
                side='bottom'
                align='end'
                sideOffset={8}
                collisionPadding={12}
                className={cn(
                  popoverContentClassName,
                  'w-[min(420px,calc(100vw-24px))]'
                )}
                onOpenAutoFocus={e => e.preventDefault()}
                onFocusOutside={e => e.preventDefault()}
                onPointerDownOutside={popoverGuards.onPointerDownOutside}
                onPointerEnter={onChipPointerEnter}
                onPointerLeave={onChipPointerLeave}
              >
                <p className='text-3xs mb-2 font-semibold tracking-widest text-neutral-500 uppercase'>
                  {meta.label}
                </p>
                <ImagePicker
                  value={imageUrl}
                  onChange={setImageUrl}
                  transform={transform}
                  onTransformChange={transformKey ? setTransform : undefined}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        ) : isLinkAction ? (
          <Popover.Root open={linkOpen} onOpenChange={onLinkOpenChange}>
            <Popover.Anchor asChild>
              <button
                type='button'
                data-canvas-edit-chip='true'
                aria-label={`${actionLabel}: ${meta.label}`}
                title={`${actionLabel} — ${meta.label}`}
                onPointerDown={stopPointer}
                onClick={handleActivateClick}
                className={chipClassName}
              >
                {label}
              </button>
            </Popover.Anchor>
            {linkPopover}
          </Popover.Root>
        ) : (
          <button
            type='button'
            data-canvas-edit-chip='true'
            aria-label={`${actionLabel}: ${meta.label}`}
            title={`${actionLabel} — ${meta.label}`}
            onClick={handleActivateClick}
            onPointerDown={stopPointer}
            className={chipClassName}
          >
            {label}
          </button>
        )}

        {hasSiblingLink && (
          <Popover.Root
            open={linkOpen && linkFieldKey === siblingLinkKey}
            onOpenChange={open => {
              if (open) {
                onOpenLink?.(siblingLinkKey);
              } else {
                onLinkOpenChange(false);
              }
            }}
          >
            <Popover.Anchor asChild>
              <button
                type='button'
                data-canvas-edit-chip='true'
                aria-label={`Đặt link: ${meta.label}`}
                title={`Đặt link — ${meta.label}`}
                onPointerDown={stopPointer}
                onClick={handleOpenSiblingLink}
                className={chipIconOnlyClassName}
              >
                <Link2 className='size-3.5 shrink-0' aria-hidden />
              </button>
            </Popover.Anchor>
            <Popover.Portal>
              <Popover.Content
                side='bottom'
                align='end'
                sideOffset={8}
                collisionPadding={12}
                className={cn(
                  popoverContentClassName,
                  'w-[min(320px,calc(100vw-24px))]'
                )}
                {...popoverGuards}
              >
                <p className='text-3xs mb-2 font-semibold tracking-widest text-neutral-500 uppercase'>
                  {resolveElementMetaLabel(siblingLinkKey)}
                </p>
                <LinkControls
                  fieldKey={siblingLinkKey}
                  content={content}
                  onContentChange={onContentChange}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
    </div>
  );
}

function resolveElementMetaLabel(linkFieldKey: string): string {
  const navLink = linkFieldKey.match(/^items\[(\d+)\]\.link$/);
  if (navLink) return `Link mục ${Number(navLink[1]) + 1}`;
  if (linkFieldKey === 'ctaLink') return 'Link CTA';
  return 'Link';
}
