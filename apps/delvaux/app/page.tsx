'use client';

import { useState } from 'react';
import Header from './components/Header';
import StickyMenu from './components/StickyMenu';
import DebugOverlay from './components/DebugOverlay';
import DiscoverPanel from './components/DiscoverPanel';
import HeroIntroSection from './components/sections/HeroIntroSection';
import DetailsSection from './components/sections/DetailsSection';
import ProductDetailSection from './components/sections/ProductDetailSection';
import ProductVariantSection from './components/sections/ProductVariantSection';
import ProductSkuSection from './components/sections/ProductSkuSection';
import { IMG } from '@/lib/image-cdn';

const MB =
  'https://www.manoloblahnik.com/media/catalog/product/cache/0990eb17180c8a7a679bd8585f3427fc';
const IMG50 = `${MB}/e/d/edc27d51b4e16c56a07095838b2774db7d5bc1d7_designer-women-orange-satin-crystal-embellished-slingback-pumps-ronconasli_50.jpg`;
const IMG52 = `${MB}/3/c/3c75b2b1fc89240a0d1cf830e6fe3e48308c2293_designer-women-orange-satin-crystal-embellished-slingback-pumps-ronconasli_52.jpg`;
const IMG53 = `${MB}/6/0/60c9a55c2e040065abae2a0edaafd17136739d12_designer-women-orange-satin-crystal-embellished-slingback-pumps-ronconasli_53.jpg`;

const U = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=85&auto=format&fit=crop`;
const TAB_CRYSTAL = U('1745091947436-d03167092d93');
const TAB_SATIN = U('1612744192242-35cd7a7d35e6');
const TAB_SLING = U('1769787147452-921f573829bd');
const BLACK_1 = U('1770576568723-c557b096394b');
const BLACK_2 = U('1591884807235-1dc6c2e148b1');
const BLACK_3 = U('1709281961493-a9acb8558177');
const BLUE_1 = U('1761408319464-cd9262a87021');
const BLUE_2 = U('1769787147452-921f573829bd');
const BLUE_3 = U('1773688199453-d517205072d8');

const SWATCH_BASE =
  'https://www.manoloblahnik.com/media/alekseon_image/cache/swatches/160x160_co_ar_tr_85';

export default function Home() {
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
          mainImage={IMG.manoloPair}
          mainAlt='Ronconasli Orange Pair'
          tabs={[
            {
              key: 'tab1',
              label: 'Italian Satin',
              desc: 'Premium silk satin sourced from Como, Italy. The fluid drape and luminous finish create the iconic Manolo Blahnik silhouette.',
              img: TAB_SATIN,
              dotX: 38,
              dotY: 55,
            },
            {
              key: 'tab2',
              label: 'Crystal Embellishments',
              desc: 'Hand-applied crystal detailing on satin upper, evoking timeless glamour. Each crystal is set by Italian artisans with millimeter precision.',
              img: TAB_CRYSTAL,
              dotX: 70,
              dotY: 50,
            },
            {
              key: 'tab3',
              label: 'Slingback Silhouette',
              desc: 'Adjustable slingback strap with signature Manolo Blahnik buckle. The 90mm covered heel offers timeless elegance.',
              img: TAB_SLING,
              dotX: 25,
              dotY: 75,
            },
          ]}
        />

        <ProductDetailSection
          variant='2'
          mainImage={IMG.manoloShoeSide}
          mainAlt='Side view'
          tabs={[
            {
              key: 'tab1',
              label: 'Satin Finish',
              desc: 'The luminous orange satin upper catches light beautifully, creating a dynamic visual effect with every step.',
              img: TAB_SATIN,
              dotX: 50,
              dotY: 45,
            },
            {
              key: 'tab2',
              label: 'Gold Buckle',
              desc: 'The signature Manolo Blahnik gold-tone buckle on the slingback strap is both functional and iconic.',
              img: TAB_SLING,
              dotX: 65,
              dotY: 60,
            },
          ]}
        />

        <ProductVariantSection
          id='information'
          onOpenDiscover={() => setDiscoverOpen(true)}
          variants={[
            {
              key: 'orange',
              label: 'Orange',
              ref: 'ronconasli-99920',
              swatch: `${SWATCH_BASE}/8081.png`,
              image: IMG.manoloShoeTransparent,
            },
            {
              key: 'black',
              label: 'Black',
              ref: 'ronconasli-99898',
              swatch: `${SWATCH_BASE}/0015.png`,
              image: BLACK_1,
            },
            {
              key: 'blue',
              label: 'Blue',
              ref: 'ronconasli-102864',
              swatch: `${SWATCH_BASE}/4037.png`,
              image: BLUE_1,
            },
          ]}
        />

        <ProductSkuSection />
      </main>

      <DiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        images={{
          orange: [IMG50, IMG52, IMG53],
          black: [BLACK_1, BLACK_2, BLACK_3],
          blue: [BLUE_1, BLUE_2, BLUE_3],
        }}
      />

      <StickyMenu />
      <DebugOverlay />
    </>
  );
}
