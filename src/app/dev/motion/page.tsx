'use client';

/**
 * DEV Motion Lab — Guide (skill motion-pick) + sidebar theo meta.category +
 * effect view (meta + live demo). URL: /dev/motion · hash #guide | #fx-<id>
 *
 * Main pane is the LandingMotion scroller (needed for scrub effects).
 */
import * as React from 'react';

import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';

import { MotionLab } from './MotionLab';

export default function DevMotionPage() {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className='flex h-screen overflow-hidden bg-stone-100'>
      <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
        <div className='h-full min-h-0 w-full'>
          <MotionLab scrollerRef={scrollerRef} />
        </div>
      </LandingMotionRoot>
    </div>
  );
}
