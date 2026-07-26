'use client';

import * as React from 'react';
import { MousePointerSquareDashed, Smartphone } from 'lucide-react';

import { cn } from '@/lib/cn';

import { resolveElementMeta } from '../resolveElementKind';
import {
  editingVariantOf,
  readVariant,
  type Block,
  type BlockBackground,
  type BlockContent,
  type Device,
  type ElementStyle,
  type Lang,
} from '../types';
import { isInspectorKind } from './kinds';
import { AppearanceSection } from './sections/AppearanceSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { ColorSection } from './sections/ColorSection';
import { ContentSection } from './sections/ContentSection';
import { ImageSection } from './sections/ImageSection';
import { LinkSection } from './sections/LinkSection';
import { TypographySection } from './sections/TypographySection';
import {
  CONTROL_H,
  ICON,
  PANEL_PAD_X,
  TEXT_CONTROL,
  TEXT_META,
} from './tokens';

export interface InspectorPanelProps {
  block: Block;
  lang: Lang;
  device: Device;
  selectedKey: string | null;
  onContentChange: (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => void;
  onUpdateStyle: (patch: ElementStyle) => void;
  onUpdateBackground: (next: BlockBackground | undefined) => void;
  /** Copy the whole desktop variant onto mobile. Only offered on mobile. */
  onSyncVariant?: (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => void;
}

/**
 * Vertical property inspector — the "Thiết kế" sidebar tab.
 *
 * Replaces the single-row toolbar for the kinds in `INSPECTOR_KINDS`: sections
 * stack and scroll vertically, so new properties no longer have to fit inside
 * one horizontal strip. Kinds still on the legacy toolbar get a pointer here
 * instead of an empty panel. All sizing comes from `./tokens`.
 */
export function InspectorPanel({
  block,
  lang,
  device,
  selectedKey,
  onContentChange,
  onUpdateStyle,
  onUpdateBackground,
  onSyncVariant,
}: InspectorPanelProps) {
  if (device === 'tablet') {
    return (
      <Notice tone='warn'>
        Tablet đang xem layout{' '}
        <strong className='font-semibold'>Desktop</strong> (chỉ đọc) — chuyển
        sang Desktop hoặc Mobile để chỉnh sửa.
      </Notice>
    );
  }

  if (!selectedKey) {
    return (
      <div className='text-content-muted flex flex-col items-center gap-2 px-6 py-12 text-center'>
        <MousePointerSquareDashed
          className={cn('opacity-60', ICON)}
          aria-hidden
        />
        <p className={TEXT_CONTROL}>
          Chọn một element trên canvas để chỉnh sửa.
        </p>
        <p className={cn('leading-4 opacity-70', TEXT_META)}>
          Hoặc mở tab <strong className='font-semibold'>Lớp</strong> để duyệt
          danh sách element của block.
        </p>
      </div>
    );
  }

  const { kind, fieldType, label } = resolveElementMeta(
    block.blockType,
    selectedKey
  );

  const variant = editingVariantOf(device);
  const langContent = lang === 'vi' ? block.contentVi : block.contentEn;
  // Fall back to desktop so the panel still shows values when the mobile
  // variant hasn't been forked yet.
  const content = readVariant(langContent, device) ?? langContent.desktop;
  const style = block.elementStyles?.[variant]?.[selectedKey];

  const header = (
    <div
      className={cn(
        'border-border/60 bg-background sticky top-0 z-10 flex h-9 items-center gap-2 border-b',
        PANEL_PAD_X
      )}
    >
      <span className='size-1.5 shrink-0 rounded-full bg-sky-500' aria-hidden />
      <span
        className={cn(
          'text-foreground truncate font-semibold tracking-wider uppercase',
          TEXT_META
        )}
      >
        {label}
      </span>
      {device === 'mobile' && (
        <span
          title='Đang chỉnh biến thể Mobile'
          className={cn(
            'ml-auto flex shrink-0 items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 font-medium text-sky-600',
            TEXT_META
          )}
        >
          <Smartphone className='size-2.5' aria-hidden />
          Mobile
        </span>
      )}
    </div>
  );

  if (!isInspectorKind(kind)) {
    return (
      <>
        {header}
        <Notice>
          Element này dùng bảng điều khiển phía trên canvas — các thao tác thêm
          / xoá / sắp xếp mục nằm ở đó.
        </Notice>
      </>
    );
  }

  return (
    <>
      {header}

      {device === 'mobile' && onSyncVariant && (
        <div className={cn('border-border/60 border-b py-2', PANEL_PAD_X)}>
          <button
            type='button'
            onClick={() => {
              if (
                !window.confirm(
                  'Sao chép toàn bộ nội dung và style Desktop sang Mobile? Thao tác này ghi đè biến thể Mobile của cả block.'
                )
              ) {
                return;
              }
              onSyncVariant('desktop', 'mobile');
            }}
            className={cn(
              'border-border text-content-muted hover:bg-muted hover:text-foreground w-full cursor-pointer rounded-md border transition-colors',
              CONTROL_H,
              TEXT_CONTROL
            )}
          >
            Sao chép style từ Desktop
          </button>
        </div>
      )}

      {kind === 'background' ? (
        <BackgroundSection
          background={readVariant(block.background, device)}
          onUpdate={onUpdateBackground}
        />
      ) : (
        <>
          {kind === 'text' && (
            <ContentSection
              fieldKey={selectedKey}
              multiline={fieldType ? fieldType === 'textarea' : undefined}
              content={content}
              onContentChange={onContentChange}
            />
          )}

          {kind === 'image' && (
            <ImageSection
              fieldKey={selectedKey}
              content={content}
              onContentChange={onContentChange}
            />
          )}

          {kind === 'link' && (
            <LinkSection
              fieldKey={selectedKey}
              content={content}
              onContentChange={onContentChange}
            />
          )}

          {kind === 'text' && (
            <TypographySection style={style} onUpdateStyle={onUpdateStyle} />
          )}

          <ColorSection
            style={style}
            onUpdateStyle={onUpdateStyle}
            showTextColor={kind === 'text' || kind === 'link'}
            fillLabel={fillLabelFor(kind, selectedKey)}
            fillFallback={fillFallbackFor(kind, selectedKey)}
          />

          <AppearanceSection style={style} onUpdateStyle={onUpdateStyle} />
        </>
      )}
    </>
  );
}

/** `fill` covers several one-off surfaces; keep the legacy wording per key. */
function fillLabelFor(kind: string, key: string): string {
  if (kind !== 'fill') return 'Màu nền';
  if (key === 'contentSurface') return 'Nền cột nội dung';
  if (key === 'dot') return 'Màu chấm';
  return 'Màu đường';
}

function fillFallbackFor(kind: string, key: string): string {
  if (kind !== 'fill') return '#ffffff';
  if (key === 'contentSurface') return '#ffffff';
  if (key === 'dot') return '#c79119';
  return 'rgba(199, 145, 25, 0.6)';
}

function Notice({
  tone = 'muted',
  children,
}: {
  tone?: 'muted' | 'warn';
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        'm-3 rounded-md px-2.5 py-2 leading-5',
        TEXT_CONTROL,
        tone === 'warn'
          ? 'border border-amber-200/70 bg-amber-50 text-amber-900'
          : 'bg-muted/60 text-content-muted'
      )}
    >
      {children}
    </p>
  );
}
