'use client';

/**
 * Delvaux Hero Intro — storefront → product reveal.
 *
 * Original 360-cms dùng GSAP ScrollTrigger pin storefront 100vh rồi
 * scrub fade-out. Trong modal preview rexer, GSAP ScrollTrigger không
 * hoạt động đúng vì scroll happen ở inner overflow-auto container (không
 * phải window scroll). Thay bằng IntersectionObserver fade pattern: 2
 * panels stacked, mỗi cái fade-in khi enter view + zoom hover.
 */

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

export function DelvauxHeroIntro({ content }: LegacyBlockComponentProps) {
  const storefront = content.storefrontImage as AssetRef | null;
  const product = content.productImage as AssetRef | null;
  const productAlt = String(content.productAlt || '');

  const { ref: storefrontRef, visible: storefrontVisible } =
    useReveal<HTMLDivElement>();
  const { ref: productRef, visible: productVisible } =
    useReveal<HTMLDivElement>();

  return (
    <section
      id='delvaux-hero'
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '200vh',
        background: '#f5f5f5',
      }}
    >
      <style>{`
        #delvaux-hero .dx-fade {
          opacity: 0;
          transform: scale(1.04);
          transition: opacity 1.4s ${EASE_EXPO}, transform 1.8s ${EASE_EXPO};
        }
        #delvaux-hero .dx-fade.is-visible {
          opacity: 1;
          transform: scale(1);
        }
        @media (prefers-reduced-motion: reduce) {
          #delvaux-hero .dx-fade {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div
        ref={storefrontRef}
        className={`dx-fade ${storefrontVisible ? 'is-visible' : ''}`}
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
        ref={productRef}
        className={`dx-fade ${productVisible ? 'is-visible' : ''}`}
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
