'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

import type { ElementStyle } from '../../types';
import { FieldRow } from '../primitives/FieldRow';
import { InspectorSection } from '../primitives/InspectorSection';
import { NumberField } from '../primitives/NumberField';
import { SliderField } from '../primitives/SliderField';
import {
  CONTROL_FOCUS,
  CONTROL_H,
  CONTROL_SURFACE,
  TEXT_CONTROL,
} from '../tokens';

/**
 * Shadow presets. `boxShadow` stores a full CSS value so a future custom-shadow
 * editor can write arbitrary strings without a data migration.
 */
const SHADOWS: { id: string; label: string; value: string | undefined }[] = [
  { id: 'none', label: 'Không', value: undefined },
  { id: 'sm', label: 'Nhẹ', value: '0 1px 2px rgba(0,0,0,0.08)' },
  { id: 'md', label: 'Vừa', value: '0 4px 12px rgba(0,0,0,0.10)' },
  { id: 'lg', label: 'Đậm', value: '0 12px 32px rgba(0,0,0,0.16)' },
];

interface AppearanceSectionProps {
  style: ElementStyle | undefined;
  onUpdateStyle: (patch: ElementStyle) => void;
}

export function AppearanceSection({
  style,
  onUpdateStyle,
}: AppearanceSectionProps) {
  const overrides = [
    style?.borderRadius,
    style?.opacity,
    style?.boxShadow,
    style?.blur,
  ].filter(v => v !== undefined && v !== null).length;

  const currentShadow =
    SHADOWS.find(s => s.value === style?.boxShadow)?.id ??
    (style?.boxShadow ? 'custom' : 'none');

  return (
    <InspectorSection
      id='appearance'
      title='Khung & hiệu ứng'
      defaultCollapsed
      overrideCount={overrides}
    >
      <FieldRow
        label='Bo góc'
        hasOverride={style?.borderRadius !== undefined}
        onRevert={() => onUpdateStyle({ borderRadius: undefined })}
      >
        <NumberField
          value={style?.borderRadius}
          onChange={n => onUpdateStyle({ borderRadius: n })}
          min={0}
          max={200}
          unit='px'
          ariaLabel='Bo góc'
        />
      </FieldRow>

      <FieldRow
        label='Độ mờ'
        hasOverride={style?.opacity !== undefined}
        onRevert={() => onUpdateStyle({ opacity: undefined })}
      >
        <SliderField
          value={style?.opacity}
          fallback={1}
          onChange={v => onUpdateStyle({ opacity: v })}
          min={0}
          max={1}
          step={0.05}
          format={v => `${Math.round(v * 100)}%`}
          ariaLabel='Độ mờ'
        />
      </FieldRow>

      <FieldRow
        label='Đổ bóng'
        hasOverride={!!style?.boxShadow}
        onRevert={() => onUpdateStyle({ boxShadow: undefined })}
      >
        <select
          value={currentShadow}
          onChange={e => {
            const preset = SHADOWS.find(s => s.id === e.target.value);
            if (!preset) return;
            onUpdateStyle({ boxShadow: preset.value });
          }}
          aria-label='Đổ bóng'
          className={cn(
            'text-foreground min-w-0 flex-1 px-1.5',
            CONTROL_H,
            CONTROL_SURFACE,
            CONTROL_FOCUS,
            TEXT_CONTROL
          )}
        >
          {SHADOWS.map(s => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
          {currentShadow === 'custom' && (
            <option value='custom'>Tuỳ chỉnh</option>
          )}
        </select>
      </FieldRow>

      <FieldRow
        label='Làm mờ'
        hasOverride={style?.blur !== undefined}
        onRevert={() => onUpdateStyle({ blur: undefined })}
      >
        <SliderField
          value={style?.blur}
          fallback={0}
          onChange={v => onUpdateStyle({ blur: v === 0 ? undefined : v })}
          min={0}
          max={20}
          step={1}
          format={v => `${v}px`}
          ariaLabel='Làm mờ'
        />
      </FieldRow>
    </InspectorSection>
  );
}
