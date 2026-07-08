'use client';

/**
 * TRANG DEV để verify template Springs: xếp 10 block theo đúng thứ tự bản gốc
 * (springs.estate) trong 1 LandingMotionRoot (scroller = window như /p), render
 * bằng CHÍNH defaultContent của BlockDef → kiểm tra đúng cái user nhận được khi
 * kéo block từ AddBlockDialog. Ảnh trỏ thẳng CDN gốc springs.estate (không copy
 * byte vào repo) — xem lưu ý bản quyền trong docs/be-spec/NOTES.md của clone.
 */
import * as React from 'react';

import { SpringsContactFooter } from '@/components/modules/block-editor/blocks/SpringsContactFooter';
import { SpringsDesign } from '@/components/modules/block-editor/blocks/SpringsDesign';
import { SpringsGallery } from '@/components/modules/block-editor/blocks/SpringsGallery';
import { SpringsHeader } from '@/components/modules/block-editor/blocks/SpringsHeader';
import { SpringsHero } from '@/components/modules/block-editor/blocks/SpringsHero';
import { SpringsInteriors } from '@/components/modules/block-editor/blocks/SpringsInteriors';
import { SpringsIntro } from '@/components/modules/block-editor/blocks/SpringsIntro';
import { SpringsMap } from '@/components/modules/block-editor/blocks/SpringsMap';
import { SpringsNaturePlace } from '@/components/modules/block-editor/blocks/SpringsNaturePlace';
import { SpringsResidences } from '@/components/modules/block-editor/blocks/SpringsResidences';
import { SpringsWellness } from '@/components/modules/block-editor/blocks/SpringsWellness';
import { springsContactFooterDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsContactFooter';
import { springsDesignDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsDesign';
import { springsGalleryDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsGallery';
import { springsHeaderDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsHeader';
import { springsHeroDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsHero';
import { springsInteriorsDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsInteriors';
import { springsIntroDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsIntro';
import { springsMapDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsMap';
import { springsNaturePlaceDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsNaturePlace';
import { springsResidencesDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsResidences';
import { springsWellnessDef } from '@/components/modules/block-editor/blocks/_registry/defs/springsWellness';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';

export default function SpringsTemplatePreview() {
  return (
    <LandingMotionRoot>
      <main>
        <SpringsHeader content={springsHeaderDef.defaultContent.en} />
        <SpringsGallery content={springsGalleryDef.defaultContent.en} />
        <SpringsHero content={springsHeroDef.defaultContent.en} />
        <SpringsIntro content={springsIntroDef.defaultContent.en} />
        <SpringsWellness content={springsWellnessDef.defaultContent.en} />
        <SpringsNaturePlace content={springsNaturePlaceDef.defaultContent.en} />
        <SpringsMap content={springsMapDef.defaultContent.en} />
        <SpringsDesign content={springsDesignDef.defaultContent.en} />
        <SpringsResidences content={springsResidencesDef.defaultContent.en} />
        <SpringsInteriors content={springsInteriorsDef.defaultContent.en} />
        <SpringsContactFooter
          content={springsContactFooterDef.defaultContent.en}
        />
      </main>
    </LandingMotionRoot>
  );
}
