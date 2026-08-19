'use client';

import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/cn';

/** Không có `kind` tới tận đây — đoán qua đuôi file thay vì đổi prop mọi nơi gọi. */
const isVideoSrc = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);

type ProductImageProps = {
  src?: string | null;
  /** Empty by default — every call site sits next to the product's title. */
  alt?: string;
  className?: string;
  /** Drawn when there is no usable src: the gradient, glyph or letter mark. */
  children: ReactNode;
};

/**
 * A product's real photo over the caller's placeholder.
 *
 * Catalogue covers point at whatever merchant site each row was sourced from
 * (`thumbnail_url`, see `lib/portal-v2/product/mapProduct`), so the host list is
 * open-ended. A plain `<img>` keeps all of them renderable; `next/image` would
 * need every host in `next.config.ts` `remotePatterns`, or a `'**'` wildcard
 * that turns the app into an open image proxy.
 *
 * The caller positions this absolutely inside its own box, so a dead URL falls
 * back to exactly the placeholder that shipped before — no broken-image icon.
 */
export const ProductImage = ({
  src,
  alt = '',
  className,
  children,
}: ProductImageProps) => {
  /* Holds the src that failed, not a bare flag: a row re-used for a different
   * product swaps `src` and the fallback lifts on its own. */
  const [broken, setBroken] = useState<string | null>(null);

  if (!src || broken === src) return <>{children}</>;

  if (isVideoSrc(src)) {
    return (
      <video
        src={src}
        muted
        loop
        playsInline
        autoPlay
        className={cn('absolute inset-0 size-full', className)}
        onError={() => setBroken(src)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- open-ended host list, see above
    <img
      src={src}
      alt={alt}
      loading='lazy'
      decoding='async'
      className={cn('absolute inset-0 size-full', className)}
      onError={() => setBroken(src)}
    />
  );
};
