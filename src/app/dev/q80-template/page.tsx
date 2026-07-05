'use client';

/**
 * TRANG DEV để verify template Quadplex80: menu chrome + experience journey
 * trong 1 LandingMotionRoot (scroller = window như /p), render bằng CHÍNH
 * defaultContent của BlockDef — kiểm tra đúng cái user nhận được khi kéo block
 * từ AddBlockDialog. Media trên S3/CloudFront; font tại public/quadplex80/.
 */
import * as React from 'react';

import { Q80Experience } from '@/components/modules/block-editor/blocks/Q80Experience';
import { Q80Menu } from '@/components/modules/block-editor/blocks/Q80Menu';
import { q80ExperienceDef } from '@/components/modules/block-editor/blocks/_registry/defs/q80Experience';
import { q80MenuDef } from '@/components/modules/block-editor/blocks/_registry/defs/q80Menu';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';

export default function Q80TemplatePreview() {
  return (
    <LandingMotionRoot>
      <main style={{ background: '#a9c3d9' }}>
        <Q80Menu content={q80MenuDef.defaultContent.en} />
        <Q80Experience content={q80ExperienceDef.defaultContent.en} />
      </main>
    </LandingMotionRoot>
  );
}
