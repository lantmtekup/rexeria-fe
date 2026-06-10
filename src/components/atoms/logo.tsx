import * as React from 'react';

import { cn } from '@/lib/cn';

/** Intrinsic viewBox of the Figma-exported wordmark (so width = size * RATIO). */
const WORDMARK_RATIO = 135 / 16;

export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** pixel height of the wordmark (width is scaled from the 135:16 ratio) */
  size?: number;
  src?: string;
  alt?: string;
}

/**
 * REXER wordmark. Rendered from `/public/brand/rexer-wordmark.svg`
 * (exported from the Figma source file).
 */
const Logo = React.forwardRef<HTMLSpanElement, LogoProps>(
  (
    {
      className,
      size = 18,
      src = '/brand/rexer-wordmark.svg',
      alt = 'REXER',
      style,
      ...props
    },
    ref
  ) => {
    const height = size;
    const width = Math.round(size * WORDMARK_RATIO);
    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center select-none', className)}
        style={{ height, width, ...style }}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ height, width, display: 'block' }}
          draggable={false}
        />
      </span>
    );
  }
);
Logo.displayName = 'Logo';

export { Logo };
