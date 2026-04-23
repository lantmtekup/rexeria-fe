'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

export interface ColorSwatchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  color: string;
  selected?: boolean;
  size?: number;
  label?: string;
  /** render as span (non-interactive) */
  asSpan?: boolean;
}

/**
 * Circular color dot used in Product cards (Color field).
 */
const ColorSwatch = React.forwardRef<
  HTMLButtonElement | HTMLSpanElement,
  ColorSwatchProps
>(
  (
    {
      color,
      selected = false,
      size = 20,
      label,
      asSpan = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const cls = cn(
      'inline-block rounded-full border transition-[box-shadow,transform]',
      selected
        ? 'border-primary ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
        : 'border-neutral-300',
      !asSpan && 'cursor-pointer hover:scale-105',
      className
    );
    const mergedStyle = {
      width: size,
      height: size,
      backgroundColor: color,
      ...style,
    };

    if (asSpan) {
      return (
        <span
          ref={ref as React.Ref<HTMLSpanElement>}
          aria-label={label ?? color}
          title={label ?? color}
          className={cls}
          style={mergedStyle}
        />
      );
    }
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type='button'
        aria-label={label ?? color}
        aria-pressed={selected}
        title={label ?? color}
        className={cls}
        style={mergedStyle}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }
);
ColorSwatch.displayName = 'ColorSwatch';

export { ColorSwatch };
