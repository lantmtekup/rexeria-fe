'use client';

/**
 * TRANG DEV để verify template Delvaux: xếp 6 block theo đúng thứ tự bản gốc
 * trong 1 LandingMotionRoot (scroller = window như /p), render bằng CHÍNH
 * defaultContent của BlockDef → kiểm tra đúng cái user nhận được khi kéo block
 * từ AddBlockDialog. Media/font thật đặt tại public/delvaux/.
 */
import * as React from 'react';

import { DelvauxDetails } from '@/components/modules/block-editor/blocks/DelvauxDetails';
import { DelvauxHeader } from '@/components/modules/block-editor/blocks/DelvauxHeader';
import { DelvauxHero } from '@/components/modules/block-editor/blocks/DelvauxHero';
import { DelvauxProduct } from '@/components/modules/block-editor/blocks/DelvauxProduct';
import { DelvauxSubnav } from '@/components/modules/block-editor/blocks/DelvauxSubnav';
import { DelvauxVariant } from '@/components/modules/block-editor/blocks/DelvauxVariant';
import { delvauxDetailsDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxDetails';
import { delvauxHeaderDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxHeader';
import { delvauxHeroDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxHero';
import { delvauxProductDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxProduct';
import { delvauxSubnavDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxSubnav';
import { delvauxVariantDef } from '@/components/modules/block-editor/blocks/_registry/defs/delvauxVariant';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';

export default function DelvauxTemplatePreview() {
  return (
    <LandingMotionRoot>
      <main style={{ background: '#e9eaec' }}>
        <DelvauxHeader content={delvauxHeaderDef.defaultContent.en} />
        <DelvauxSubnav content={delvauxSubnavDef.defaultContent.en} />
        <DelvauxHero content={delvauxHeroDef.defaultContent.en} />
        <DelvauxDetails content={delvauxDetailsDef.defaultContent.en} />
        <DelvauxProduct content={delvauxProductDef.defaultContent.en} />
        {/* section product-2 gốc: 2 hotspot (Flat pocket / Gold metal) */}
        <DelvauxProduct
          content={{
            imageUrl:
              'https://d10zufojjcedud.cloudfront.net/uploads/be3dd120-000b-4816-b1f4-d2ce1bd22cfd/delvaux-product-2.png',
            glowColor: '#a77c63',
            hotspots: [
              {
                title: 'Flat pocket',
                desc: delvauxProductDef.defaultContent.en.hotspots[0].desc,
                mediaType: 'image',
                mediaUrl:
                  'https://d10zufojjcedud.cloudfront.net/uploads/b14f315b-82ba-48d1-b72f-6dbb1351e1bd/delvaux-product-flat-pocket.png',
                x: 48,
                y: 47,
              },
              {
                title: 'Gold metal',
                desc: delvauxProductDef.defaultContent.en.hotspots[0].desc,
                mediaType: 'image',
                mediaUrl:
                  'https://d10zufojjcedud.cloudfront.net/uploads/e4ff0d86-eeb7-4a33-ab32-5c13368e844d/delvaux-product-gold-mental.png',
                x: 21,
                y: 62,
              },
            ],
          }}
        />
        <DelvauxVariant content={delvauxVariantDef.defaultContent.en} />
      </main>
    </LandingMotionRoot>
  );
}
