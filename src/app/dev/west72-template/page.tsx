'use client';

/**
 * TRANG DEV để verify template 212 West 72nd: xếp 6 block theo đúng thứ tự
 * apps/212-west/app/page.tsx trong 1 LandingMotionRoot (scroller = window như
 * /p), render bằng CHÍNH defaultContent của BlockDef → kiểm tra đúng cái user
 * nhận được khi kéo block từ AddBlockDialog.
 *
 * Công thức template (transition template = 'none', block tự có motion):
 *   1. west72_hero
 *   2. west72_elevated
 *   3. west72_showcase_landmark   (Landmark Views)
 *   4. west72_showcase            (Custom-Designed Kitchens)
 *   5. west72_showcase_sanctuary  (Your Private Sanctuary)
 *   6. west72_footer
 *
 * `?snap=1` → bọc trong preset transition `snap` (một cú vuốt = một section,
 * thay cho `SectionSnap` của app). Không có param = `none` (cuộn tự do).
 * Media/font thật đặt tại public/212-west/.
 */
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { West72Elevated } from '@/components/modules/block-editor/blocks/West72Elevated';
import { West72Footer } from '@/components/modules/block-editor/blocks/West72Footer';
import { West72Hero } from '@/components/modules/block-editor/blocks/West72Hero';
import { West72Showcase } from '@/components/modules/block-editor/blocks/West72Showcase';
import { PageSnap } from '@/components/modules/block-editor/blocks/PageSnap';
import { pageSnapDef } from '@/components/modules/block-editor/blocks/_registry/defs/pageSnap';
import { west72ElevatedDef } from '@/components/modules/block-editor/blocks/_registry/defs/west72Elevated';
import { west72FooterDef } from '@/components/modules/block-editor/blocks/_registry/defs/west72Footer';
import { west72HeroDef } from '@/components/modules/block-editor/blocks/_registry/defs/west72Hero';
import {
  west72ShowcaseDef,
  west72ShowcaseLandmarkDef,
  west72ShowcaseSanctuaryDef,
} from '@/components/modules/block-editor/blocks/_registry/defs/west72Showcase';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  TemplateTransitions,
  isVerticalTransition,
} from '@/components/modules/block-editor/transitions/TemplateTransitions';

function West72Template() {
  const params = useSearchParams();
  const snap = params.get('snap') === '1';
  const frame = params.get('frame') === '1';
  // `?snapblock=1` — dùng block `page_snap` thay preset, và bọc mỗi item trong
  // `data-block-id` đúng như `/p` / PreviewMode để block tự tìm được section.
  const snapBlock = params.get('snapblock') === '1';
  const transition = snap ? 'snap' : 'none';
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  const raw = [
    snapBlock ? (
      <PageSnap key='snap' content={pageSnapDef.defaultContent.en} />
    ) : null,
    <West72Hero key='hero' content={west72HeroDef.defaultContent.en} />,
    <West72Elevated key='elev' content={west72ElevatedDef.defaultContent.en} />,
    <West72Showcase
      key='landmark'
      content={west72ShowcaseLandmarkDef.defaultContent.en}
    />,
    <West72Showcase
      key='kitchens'
      content={west72ShowcaseDef.defaultContent.en}
    />,
    <West72Showcase
      key='sanctuary'
      content={west72ShowcaseSanctuaryDef.defaultContent.en}
    />,
    <West72Footer key='footer' content={west72FooterDef.defaultContent.en} />,
  ].filter(Boolean) as React.ReactElement[];

  // Production bọc mỗi block trong `<div data-block-id>` — giữ nguyên ở đây để
  // đường block (`querySelectorAll('[data-block-id]')`) test được như thật.
  const items = snapBlock
    ? raw.map((node, i) => (
        <div key={node.key ?? i} data-block-id={`dev_${node.key ?? i}`}>
          {node}
        </div>
      ))
    : raw;

  const stack = (
    <TemplateTransitions
      transition={transition}
      items={items}
      className='gap-0!'
    />
  );

  // `?frame=1` — mô phỏng PreviewMode: scroller là DIV cao `100vh − 28px`
  // (PREVIEW_CHROME) nên `svh` của block KHÔNG bằng chiều cao scroller. Đây là
  // ngữ cảnh duy nhất phân biệt mốc snap bottom-align với `k·vh`.
  if (frame) {
    return (
      <div className='relative h-screen overflow-hidden bg-neutral-200 pt-7'>
        <LandingMotionRoot scrollerRef={scrollerRef} enableSmooth={false}>
          <div
            data-device-frame='true'
            className='@container relative mx-auto shrink-0 overflow-hidden bg-white'
            style={{ width: 1440, height: 'calc(100vh - 1.75rem)' }}
          >
            <div
              ref={scrollerRef}
              data-landing-preview-scroller='true'
              className='@container absolute inset-0 overflow-x-hidden overflow-y-auto'
            >
              {stack}
            </div>
          </div>
        </LandingMotionRoot>
      </div>
    );
  }

  return (
    <LandingMotionRoot enableSmooth={isVerticalTransition(transition)}>
      <main style={{ background: '#ffffff' }}>{stack}</main>
    </LandingMotionRoot>
  );
}

export default function West72TemplatePreview() {
  return (
    <React.Suspense fallback={null}>
      <West72Template />
    </React.Suspense>
  );
}
