'use client';

import * as React from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from 'lucide-react';

import { FontPicker } from '@/components/molecules/FontPicker';
import { BRAND_FONT_ROLES, brandToken, brandTokenKey } from '@/lib/brand-kit';
import { cn } from '@/lib/cn';

import type { ElementStyle } from '@/components/modules/block-editor/types';
import { FieldRow } from '../primitives/FieldRow';
import { InspectorSection } from '../primitives/InspectorSection';
import { NumberField } from '../primitives/NumberField';
import { SegmentedControl } from '../primitives/SegmentedControl';
import { CONTROL_H, CONTROL_H_INNER, ICON_SM, TEXT_CONTROL } from '../tokens';

const WEIGHTS = [
  { value: 300, label: 'Nhẹ' },
  { value: 400, label: 'Thường' },
  { value: 500, label: 'Vừa' },
  { value: 700, label: 'Đậm' },
];

const ALIGNS = [
  {
    value: 'left' as const,
    label: 'Trái',
    icon: <AlignLeft className={ICON_SM} />,
  },
  {
    value: 'center' as const,
    label: 'Giữa',
    icon: <AlignCenter className={ICON_SM} />,
  },
  {
    value: 'right' as const,
    label: 'Phải',
    icon: <AlignRight className={ICON_SM} />,
  },
  {
    value: 'justify' as const,
    label: 'Đều',
    icon: <AlignJustify className={ICON_SM} />,
  },
];

interface TypographySectionProps {
  style: ElementStyle | undefined;
  onUpdateStyle: (patch: ElementStyle) => void;
}

export function TypographySection({
  style,
  onUpdateStyle,
}: TypographySectionProps) {
  const fontRole = brandTokenKey(style?.fontFamily);
  const overrides = [
    style?.fontFamily,
    style?.fontSize,
    style?.fontWeight,
    style?.fontStyle,
    style?.textDecoration,
    style?.textAlign,
  ].filter(v => v !== undefined && v !== null).length;

  const toggleDecoration = (next: 'underline' | 'line-through') =>
    onUpdateStyle({
      textDecoration: style?.textDecoration === next ? 'none' : next,
    });

  return (
    <InspectorSection
      id='typography'
      title='Kiểu chữ'
      overrideCount={overrides}
    >
      <FieldRow
        label='Font'
        stacked
        hasOverride={!!style?.fontFamily}
        onRevert={() => onUpdateStyle({ fontFamily: undefined })}
      >
        <div className={cn('flex items-center gap-1', CONTROL_H)}>
          {BRAND_FONT_ROLES.map(role => (
            <button
              key={role.key}
              type='button'
              onClick={() =>
                onUpdateStyle({ fontFamily: brandToken(role.key) })
              }
              title={`Token thương hiệu: ${role.label}`}
              className={cn(
                'border-border shrink-0 cursor-pointer rounded-md border px-2 transition-colors',
                CONTROL_H,
                TEXT_CONTROL,
                fontRole === role.key
                  ? 'bg-foreground text-background font-medium'
                  : 'text-content-muted hover:bg-muted hover:text-foreground'
              )}
            >
              {role.label}
            </button>
          ))}
          <div className='min-w-0 flex-1'>
            <FontPicker
              value={fontRole ? undefined : style?.fontFamily}
              onChange={id => onUpdateStyle({ fontFamily: id })}
            />
          </div>
        </div>
      </FieldRow>

      <FieldRow
        label='Cỡ chữ'
        hasOverride={style?.fontSize !== undefined}
        onRevert={() => onUpdateStyle({ fontSize: undefined })}
      >
        <NumberField
          value={style?.fontSize}
          onChange={n => onUpdateStyle({ fontSize: n })}
          min={8}
          max={200}
          unit='px'
          ariaLabel='Cỡ chữ'
        />
      </FieldRow>

      <FieldRow
        label='Độ đậm'
        hasOverride={style?.fontWeight !== undefined}
        onRevert={() => onUpdateStyle({ fontWeight: undefined })}
      >
        <SegmentedControl
          options={WEIGHTS}
          value={style?.fontWeight}
          onChange={v => onUpdateStyle({ fontWeight: v })}
          ariaLabel='Độ đậm'
        />
      </FieldRow>

      <FieldRow
        label='Định dạng'
        hasOverride={
          style?.fontStyle !== undefined || style?.textDecoration !== undefined
        }
        onRevert={() =>
          onUpdateStyle({ fontStyle: undefined, textDecoration: undefined })
        }
      >
        <div
          className={cn(
            'border-border bg-muted/40 flex items-center gap-px rounded-md border p-px',
            CONTROL_H
          )}
        >
          <ToggleBtn
            active={style?.fontWeight === 700}
            label='In đậm'
            onClick={() =>
              onUpdateStyle({
                fontWeight: style?.fontWeight === 700 ? 400 : 700,
              })
            }
          >
            <Bold className={ICON_SM} />
          </ToggleBtn>
          <ToggleBtn
            active={style?.fontStyle === 'italic'}
            label='In nghiêng'
            onClick={() =>
              onUpdateStyle({
                fontStyle: style?.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
          >
            <Italic className={ICON_SM} />
          </ToggleBtn>
          <ToggleBtn
            active={style?.textDecoration === 'underline'}
            label='Gạch chân'
            onClick={() => toggleDecoration('underline')}
          >
            <Underline className={ICON_SM} />
          </ToggleBtn>
          <ToggleBtn
            active={style?.textDecoration === 'line-through'}
            label='Gạch ngang'
            onClick={() => toggleDecoration('line-through')}
          >
            <Strikethrough className={ICON_SM} />
          </ToggleBtn>
        </div>
      </FieldRow>

      <FieldRow
        label='Căn lề'
        hasOverride={style?.textAlign !== undefined}
        onRevert={() => onUpdateStyle({ textAlign: undefined })}
      >
        <SegmentedControl
          options={ALIGNS}
          value={style?.textAlign}
          onChange={v => onUpdateStyle({ textAlign: v })}
          ariaLabel='Căn lề'
        />
      </FieldRow>
    </InspectorSection>
  );
}

function ToggleBtn({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-sm transition-colors',
        CONTROL_H_INNER,
        'w-6',
        active
          ? 'bg-foreground text-background'
          : 'text-content-muted hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
