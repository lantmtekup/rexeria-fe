'use client';

import { useState } from 'react';
import Header from './Header';
import StickyMenu from './StickyMenu';
import DiscoverPanel from './DiscoverPanel';
import HeroIntroSection from './sections/HeroIntroSection';
import DetailsSection from './sections/DetailsSection';
import ProductDetailSection from './sections/ProductDetailSection';
import ProductVariantSection from './sections/ProductVariantSection';
import ProductSkuSection from './sections/ProductSkuSection';
import { IMG } from '@/lib/image-cdn';

// Shared landing body used by both the public home page (`/`) and the
// analytics route (`/analytics`). Keeping it in one place avoids drift
// between the two compositions (DRY).
export default function LandingContent() {
  const [discoverOpen, setDiscoverOpen] = useState(false);

  return (
    <>
      <Header />

      <main>
        <HeroIntroSection />

        <DetailsSection />

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

        <ProductDetailSection
          variant='2'
          id='craftsmanship'
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

        <ProductSkuSection />
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
}
