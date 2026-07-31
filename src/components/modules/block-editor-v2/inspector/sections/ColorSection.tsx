'use client';

import * as React from 'react';

import type { ElementStyle } from '@/components/modules/block-editor/types';
import { ColorField } from '../primitives/ColorField';
import { FieldRow } from '../primitives/FieldRow';
import { InspectorSection } from '../primitives/InspectorSection';

interface ColorSectionProps {
  style: ElementStyle | undefined;
  onUpdateStyle: (patch: ElementStyle) => void;
  /** Text elements get both fields; fill-only elements just the background. */
  showTextColor?: boolean;
  /** Label for the fill row — "Màu nền" for text, "Màu" for fill surfaces. */
  fillLabel?: string;
  fillFallback?: string;
}

export function ColorSection({
  style,
  onUpdateStyle,
  showTextColor = true,
  fillLabel = 'Màu nền',
  fillFallback = '#ffffff',
}: ColorSectionProps) {
  const overrides = [style?.color, style?.backgroundColor].filter(
    Boolean
  ).length;

  return (
    <InspectorSection id='color' title='Màu sắc' overrideCount={overrides}>
      {showTextColor && (
        <FieldRow
          label='Màu chữ'
          stacked
          hasOverride={!!style?.color}
          onRevert={() => onUpdateStyle({ color: undefined })}
        >
          <ColorField
            value={style?.color}
            onChange={next => onUpdateStyle({ color: next })}
            fallback='#111111'
            ariaLabel='Màu chữ'
          />
        </FieldRow>
      )}

      <FieldRow
        label={fillLabel}
        stacked
        hasOverride={!!style?.backgroundColor}
        onRevert={() => onUpdateStyle({ backgroundColor: undefined })}
      >
        <ColorField
          value={style?.backgroundColor}
          onChange={next => onUpdateStyle({ backgroundColor: next })}
          fallback={fillFallback}
          allowUnset
          ariaLabel={fillLabel}
        />
      </FieldRow>
    </InspectorSection>
  );
}
