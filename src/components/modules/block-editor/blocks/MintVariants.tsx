'use client';

/**
 * Data-block "Mint · Variants" (P3/d). Reuse ProductVariantSection (swatch
 * picker + parallax title, state local). Nút "Open Discover" vốn mở panel cấp
 * page → ở đây bundle DiscoverPanel TỰ CHỨA trong block (self-contained), với
 * ảnh mặc định. Hết phụ thuộc parent state.
 */
import * as React from 'react';

import ProductVariantSection from '@/templates/mint-coint/components/sections/ProductVariantSection';
import DiscoverPanel from '@/templates/mint-coint/components/DiscoverPanel';
import { IMG } from '@/templates/mint-coint/lib/image-cdn';
import '@/templates/mint-coint/styles.css';

import type { MintVariantsContent } from '../types';

export function MintVariants({ content }: { content: MintVariantsContent }) {
  const [discoverOpen, setDiscoverOpen] = React.useState(false);
  return (
    <div className='mint-coint-root'>
      <ProductVariantSection
        variants={content.variants}
        titleLine1={content.titleLine1}
        titleLine2={content.titleLine2}
        onOpenDiscover={() => setDiscoverOpen(true)}
      />
      <DiscoverPanel
        open={discoverOpen}
        onClose={() => setDiscoverOpen(false)}
        images={{
          reverse: [IMG.coinReverse, IMG.coinRevLeft, IMG.coinRevRight],
          obverse: [IMG.coinObverse, IMG.coinReverse, IMG.coinRevLeft],
          packaging: [IMG.coinPackaging, IMG.coinReverse, IMG.coinObverse],
        }}
      />
    </div>
  );
}
