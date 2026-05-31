'use client';

/**
 * Delvaux Hero Intro — storefront → product reveal. Stripped GSAP
 * ScrollTrigger pin animation từ 360-cms (static catalog preview).
 * Render 2 panels stacked. Editor wrappers removed.
 */

import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

export function DelvauxHeroIntro({ content }: LegacyBlockComponentProps) {
  const storefront = content.storefrontImage as AssetRef | null;
  const product = content.productImage as AssetRef | null;
  const productAlt = String(content.productAlt || '');

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '200vh',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {storefront?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={storefront.url}
            alt={storefront.alt ?? 'Storefront'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {product?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.url}
            alt={product.alt ?? productAlt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        ) : (
          <span style={{ color: '#999' }}>{productAlt}</span>
        )}
      </div>
    </section>
  );
}
