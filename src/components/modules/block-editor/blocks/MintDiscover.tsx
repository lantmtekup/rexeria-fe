'use client';

/**
 * Data-block "Mint · Discover" (P3/d). Reuse ProductDetailSection — hotspot +
 * side drawer + scroll-lock đều TỰ CHỨA trong section (activeTab state nội bộ),
 * nên lift thành block độc lập an toàn. tabs/ảnh lấy từ content.
 */
import * as React from 'react';

import ProductDetailSection from '@/templates/mint-coint/components/sections/ProductDetailSection';
import '@/templates/mint-coint/styles.css';

import type { MintDiscoverContent } from '../types';

export function MintDiscover({ content }: { content: MintDiscoverContent }) {
  return (
    <div className='mint-coint-root'>
      <ProductDetailSection
        variant={content.variant}
        mainImage={content.mainImage}
        mainAlt={content.mainAlt}
        tabs={content.tabs}
      />
    </div>
  );
}
