import * as React from 'react';

import { cn } from '@/lib/cn';

import { DEFAULT_IMAGE_TRANSFORM, type ImageTransform } from '../types';

interface TransformedImageProps {
  src: string;
  transform?: ImageTransform;
  className?: string;
  alt?: string;
  fallback?: React.ReactNode;
}

/**
 * Renders an image inside its parent box with rotate + scale applied.
 * The parent must have `position: relative` and a defined size; this fills it.
 */
export function TransformedImage({
  src,
  transform,
  className,
  alt = '',
  fallback,
}: TransformedImageProps) {
  const t = transform ?? DEFAULT_IMAGE_TRANSFORM;

  if (!src) {
    return <>{fallback ?? null}</>;
  }

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div
        className='absolute inset-0 origin-center bg-cover bg-center'
        style={{
          backgroundImage: `url(${src})`,
          transform: `rotate(${t.rotation}deg) scale(${t.scale})`,
          transformOrigin: 'center',
          transition: 'transform 120ms ease-out',
        }}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
      />
    </div>
  );
}
