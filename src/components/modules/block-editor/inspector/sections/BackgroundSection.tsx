'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';

import { cn } from '@/lib/cn';

import { ImagePicker } from '../../ImagePicker';
import type { BlockBackground } from '../../types';
import { ColorField } from '../primitives/ColorField';
import { InspectorSection } from '../primitives/InspectorSection';
import {
  CONTROL_H,
  ICON_SM,
  PANEL_PAD_X,
  SWATCH,
  TEXT_CONTROL,
  TEXT_META,
} from '../tokens';

/** Quick palette carried over from the legacy background toolbar. */
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

interface BackgroundSectionProps {
  background: BlockBackground | undefined;
  onUpdate: (next: BlockBackground | undefined) => void;
}

export function BackgroundSection({
  background,
  onUpdate,
}: BackgroundSectionProps) {
  const setColor = (next: string | undefined) =>
    onUpdate({ ...background, color: next || undefined });
  const setImage = (next: string) =>
    onUpdate({ ...background, imageUrl: next || undefined });

  return (
    <>
      <InspectorSection
        id='bg-color'
        title='Màu nền'
        overrideCount={background?.color ? 1 : 0}
      >
        <ColorField
          value={background?.color}
          onChange={setColor}
          fallback='#ffffff'
          allowUnset
          ariaLabel='Màu nền block'
        />
        <div className='flex flex-wrap items-center gap-1'>
          {PRESETS.map(c => (
            <button
              key={c}
              type='button'
              onClick={() => setColor(c)}
              aria-label={`Đặt màu nền ${c}`}
              title={c}
              className={cn(
                'cursor-pointer rounded ring-1 ring-black/8 transition-transform hover:scale-110',
                SWATCH
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </InspectorSection>

      <InspectorSection
        id='bg-image'
        title='Ảnh nền'
        overrideCount={background?.imageUrl ? 1 : 0}
      >
        <ImagePicker value={background?.imageUrl ?? ''} onChange={setImage} />
        <p className={cn('text-content-muted leading-4', TEXT_META)}>
          Ảnh nền phủ lên màu nền (cover, canh giữa).
        </p>
      </InspectorSection>

      <div className={cn('py-3', PANEL_PAD_X)}>
        <button
          type='button'
          onClick={() => onUpdate(undefined)}
          disabled={!background}
          className={cn(
            'border-border text-content-muted hover:bg-muted hover:text-foreground flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            CONTROL_H,
            TEXT_CONTROL
          )}
        >
          <RotateCcw className={ICON_SM} />
          Khôi phục nền mặc định
        </button>
      </div>
    </>
  );
}
