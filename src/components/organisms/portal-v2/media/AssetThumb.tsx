'use client';

import { useState } from 'react';

import {
  MEDIA_KINDS,
  MEDIA_THUMBNAIL_GRADIENT,
} from '@/lib/portal-v2/media/constants';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type AssetThumbProps = {
  asset: MediaAsset;
  className?: string;
  iconClassName?: string;
};

export const AssetThumb = ({
  asset,
  className,
  iconClassName,
}: AssetThumbProps) => {
  const [errored, setErrored] = useState(false);
  const Icon = MEDIA_KINDS[asset.kind].icon;

  if (asset.kind === 'IMG' && asset.url && !errored) {
    return (
      <img
        src={asset.url}
        alt=''
        loading='lazy'
        onError={() => setErrored(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  if (asset.kind === 'VID' && asset.url && !errored) {
    return (
      <video
        src={asset.url}
        muted
        playsInline
        preload='metadata'
        onError={() => setErrored(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn('flex items-center justify-center text-white', className)}
      style={{ background: MEDIA_THUMBNAIL_GRADIENT }}
    >
      <Icon className={iconClassName} strokeWidth={1.8} aria-hidden />
    </div>
  );
};
