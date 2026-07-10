'use client';

import * as React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { List, Pencil, Type, Upload } from 'lucide-react';

import { cn } from '@/lib/cn';

import { ImagePicker } from './ImagePicker';
import { getContentAt, setContentAt } from './contentPath';
import {
  canvasEditActionLabel,
  type ElementKind,
  type ResolvedElementMeta,
} from './resolveElementKind';
import type { BlockContent, ImageTransform } from './types';

export interface CanvasElementEditChipProps {
  elementKey: string;
  meta: ResolvedElementMeta;
  /** Viewport rect of the hovered/active element (from getBoundingClientRect). */
  rect: DOMRect;
  /** Surface container — chip positions relative to this. */
  surfaceEl: HTMLElement;
  content: BlockContent;
  /** Controlled image popover — parent opens this on element click. */
  imageOpen: boolean;
  onImageOpenChange: (open: boolean) => void;
  /** Same activate path as clicking the element itself. */
  onActivate: (key: string) => void;
  /** Keep hover alive while pointer is over the chip / popover. */
  onChipPointerEnter: () => void;
  onChipPointerLeave: () => void;
  onContentChange: (next: BlockContent) => void;
}

function chipIcon(kind: ElementKind) {
  if (kind === 'image') return Upload;
  if (kind === 'text') return Type;
  if (
    kind === 'stats' ||
    kind === 'features' ||
    kind === 'reasons' ||
    kind === 'slides' ||
    kind === 'interactiveAd' ||
    kind === 'mintVariants' ||
    kind === 'mintTabs'
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
  'pointer-events-auto flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-neutral-900 px-2 text-white shadow-lg ring-1 ring-black/10',
  'text-2xs font-medium tracking-wide',
  'origin-bottom-right transition-[opacity,transform,background-color] duration-150',
  'hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none'
);

/**
 * Floating edit affordance. Clicking the chip runs the same activate path as
 * clicking the element. Image popover is controlled by the parent so an
 * element click can open upload immediately.
 */
export function CanvasElementEditChip({
  elementKey,
  meta,
  rect,
  surfaceEl,
  content,
  imageOpen,
  onImageOpenChange,
  onActivate,
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

  const stopPointer = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handleActivateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onActivate(elementKey);
  };

  const c = content as Record<string, unknown>;
  const imageUrl = (getContentAt(c, elementKey) as string) ?? '';
  const transformKey = isImageAction ? imageTransformKey(elementKey) : null;
  const transform = transformKey
    ? (c[transformKey] as ImageTransform | undefined)
    : undefined;

  const setImageUrl = (next: string) => {
    onContentChange(setContentAt(c, elementKey, next) as BlockContent);
  };

  const setTransform = (next: ImageTransform) => {
    if (!transformKey) return;
    onContentChange({ ...c, [transformKey]: next } as BlockContent);
  };

  const label = (
    <>
      <Icon className='size-3.5 shrink-0' aria-hidden />
      <span className='max-w-28 truncate'>{actionLabel}</span>
    </>
  );

  return (
    <div
      data-canvas-edit-chip-root='true'
      className='pointer-events-none absolute z-30'
      style={{
        top,
        left,
        transform: 'translate(-100%, -100%)',
      }}
      onPointerEnter={onChipPointerEnter}
      onPointerLeave={onChipPointerLeave}
    >
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
              className='z-50 w-[min(420px,calc(100vw-24px))] rounded-lg border border-neutral-200 bg-white p-3 shadow-xl outline-none'
              onOpenAutoFocus={e => e.preventDefault()}
              onPointerDownOutside={e => {
                const t = e.target as HTMLElement;
                if (t.closest('[data-canvas-edit-chip-root]')) {
                  e.preventDefault();
                }
              }}
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
    </div>
  );
}
