'use client';

/**
 * Data-block "Mint · Hero" (P3/d). Reuse HeroIntroSection — canvas frame
 * scrub + overlay tự chứa trong section (pin nội bộ, không xuyên section nên
 * lift thành block an toàn). Overlay là pointer-events-none → chưa inline-edit
 * trên canvas; nội dung lấy từ content (sửa qua default/AI).
 */
import * as React from 'react';

import HeroIntroSection from '@/templates/mint-coint/components/sections/HeroIntroSection';
import '@/templates/mint-coint/styles.css';

import type { MintHeroContent } from '../types';

export function MintHero({ content }: { content: MintHeroContent }) {
  return (
    <div className='mint-coint-root'>
      <HeroIntroSection
        heroLine1={content.heroLine1}
        heroLine2={content.heroLine2}
        heroLine3={content.heroLine3}
      />
    </div>
  );
}
