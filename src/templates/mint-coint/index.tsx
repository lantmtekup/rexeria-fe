'use client';

/**
 * Mint-coint template — top-level component cho code template registry.
 * Wraps original Royal Canadian Mint landing inside `.mint-coint-root`
 * scope class để CSS không leak vào admin shell (preview mode).
 *
 * Public mode (`/p/{slug}`): apply html/body global styles cho immersive
 * full-page experience (scroll lock, no scrollbar) qua useEffect.
 *
 * Per-page customization (page.type_metadata): hiện chỉ title/subtitle
 * (meta fields). Có thể mở rộng schema để brand override hero image,
 * variant labels, etc. — sửa meta.ts + thread props vào sections.
 */

import * as React from 'react';

import Header from './components/Header';
import StickyMenu from './components/StickyMenu';
import DiscoverPanel from './components/DiscoverPanel';
import SmoothScrollProvider from './components/SmoothScrollProvider';
import HeroIntroSection from './components/sections/HeroIntroSection';
import DetailsSection from './components/sections/DetailsSection';
import ProductDetailSection from './components/sections/ProductDetailSection';
import ProductVariantSection from './components/sections/ProductVariantSection';
import ProductSkuSection from './components/sections/ProductSkuSection';
import { IMG } from './lib/image-cdn';
import { meta as mintCointMeta } from './meta';
import { useSectionTracking } from '../_tracking/use-section-tracking';
import type { TemplateProps } from '../types';

import './styles.css';

export default function MintCointTemplate({ page, mode }: TemplateProps) {
  const [discoverOpen, setDiscoverOpen] = React.useState(false);

  // Per-section tracking (chỉ public mode — preview/edit fire pollute
  // prod data). Hook tự dedup view event 1 lần per session per section.
  useSectionTracking({
    pageId: page.id,
    releaseId: page.active_release_id,
    tracking: mintCointMeta.tracking,
    enabled: mode === 'public',
  });

  // Public mode: apply full-page immersive styles (scroll lock, no
  // scrollbar) globally. Preview/edit mode skips để admin shell scroll
  // hoạt động bình thường.
  React.useEffect(() => {
    if (mode !== 'public') return;
    const prev = {
      htmlClassName: document.documentElement.className,
      bodyOverflow: document.body.style.overflow,
      bodyMargin: document.body.style.margin,
    };
    document.documentElement.classList.add('lenis', 'mint-coint-public');
    document.body.style.margin = '0';
    // Inject scoped style chỉ áp dụng khi mint-coint-public class active.
    const style = document.createElement('style');
    style.dataset.template = 'mint-coint-public';
    style.textContent = `
      html.mint-coint-public, html.mint-coint-public body {
        margin: 0; padding: 0;
        scrollbar-width: none; overscroll-behavior: none;
      }
      html.mint-coint-public::-webkit-scrollbar,
      html.mint-coint-public body::-webkit-scrollbar { display: none; }
    `;
    document.head.appendChild(style);
    return () => {
      document.documentElement.className = prev.htmlClassName;
      document.body.style.overflow = prev.bodyOverflow;
      document.body.style.margin = prev.bodyMargin;
      style.remove();
    };
  }, [mode]);

  // Lenis smooth scroll chỉ enable ở public mode. Preview embedded
  // inside admin → scroll lock conflict.
  const wrappedContent = (
    <>
      <Header />
      <main>
        <div data-rexer-section='hero'>
          <HeroIntroSection />
        </div>
        <div data-rexer-section='details'>
          <DetailsSection />
        </div>
        <div data-rexer-section='discover-reverse'>
          <ProductDetailSection
            variant='1'
            id='discover'
            mainImage={IMG.coinReverse}
            mainAlt='Jack Pine Gold Coin — reverse'
            tabs={[
              {
                key: 'tab1',
                label: 'The Lone Pine',
                desc: "Tom Thomson's windswept jack pine, rising from rocky ground above a northern lake. The kilo-sized canvas allows the engraver to lift every needle, branch and crag from the painting into 99.99% pure gold relief.",
                img: IMG.coinReverse,
                dotX: 50,
                dotY: 30,
              },
              {
                key: 'tab2',
                label: 'Sky and Water',
                desc: "A monochromatic field of polished and frosted gold replaces the painting's sunset palette, deepening the impact of Thomson's dynamic composition.",
                img: IMG.coinReverse,
                dotX: 62,
                dotY: 62,
              },
              {
                key: 'tab3',
                label: 'Serrated Edge',
                desc: '101.6 mm in diameter with a serrated edge — a tactile signature of Royal Canadian Mint craftsmanship at this scale.',
                img: IMG.coinReverse,
                dotX: 38,
                dotY: 62,
              },
            ]}
          />
        </div>
        <div data-rexer-section='discover-obverse'>
          <ProductDetailSection
            variant='2'
            mainImage={IMG.coinObverse}
            mainAlt='Jack Pine Gold Coin — obverse'
            tabs={[
              {
                key: 'tab1',
                label: 'King Charles III Effigy',
                desc: 'The effigy of His Majesty King Charles III by Canadian artist Steven Rosati anchors the obverse — the contemporary face of Canadian numismatic art.',
                img: IMG.coinObverse,
                dotX: 50,
                dotY: 35,
              },
              {
                key: 'tab2',
                label: '99.99% Pure Gold',
                desc: '1006.1 g of .99999 fine gold, proof finish. Each strike is hand-inspected and serialised — only 75 will ever exist.',
                img: IMG.coinReverse,
                dotX: 50,
                dotY: 65,
              },
            ]}
          />
        </div>
        <div data-rexer-section='variants'>
          <ProductVariantSection
            id='information'
            onOpenDiscover={() => setDiscoverOpen(true)}
            variants={[
              {
                key: 'reverse',
                label: 'Reverse',
                ref: 'rcm-252469',
                swatch: IMG.coinReverse,
                image: IMG.coinReverse,
              },
              {
                key: 'obverse',
                label: 'Obverse',
                ref: 'rcm-252469',
                swatch: IMG.coinObverse,
                image: IMG.coinObverse,
              },
              {
                key: 'packaging',
                label: 'Packaging',
                ref: 'rcm-252469',
                swatch: IMG.coinPackaging,
                image: IMG.coinPackaging,
              },
            ]}
          />
        </div>
        <div data-rexer-section='sku-cta'>
          <ProductSkuSection />
        </div>
      </main>
      <DiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        images={{
          reverse: [IMG.coinReverse, IMG.coinRevLeft, IMG.coinRevRight],
          obverse: [IMG.coinObverse, IMG.coinReverse, IMG.coinRevLeft],
          packaging: [IMG.coinPackaging, IMG.coinReverse, IMG.coinObverse],
        }}
      />
      <StickyMenu />
    </>
  );

  return (
    <div className='mint-coint-root'>
      {mode === 'public' ? (
        <SmoothScrollProvider>{wrappedContent}</SmoothScrollProvider>
      ) : (
        wrappedContent
      )}
    </div>
  );
}
