'use client';

/**
 * FE-side block template render cho `/p/[slug]` public route. Parse
 * canvas_blueprint từ BE public response → loop blocks → render qua
 * `RenderBlock` + MotionProvider (mode='production'). Mirror logic
 * của admin overlay view nhưng tối giản — không có data-block-id wrapper
 * vì public render không host StatsAnnotationOverlay.
 */

import * as React from 'react';

import { RenderBlock } from '@/components/modules/CanvasTemplate/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/CanvasTemplate/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/CanvasTemplate/block-editor/motion/types';
import { parseCanvas } from '@/components/modules/CanvasTemplate/block-editor/serialize';
import { SmoothScroll } from '@/components/modules/CanvasTemplate/block-editor/transitions/SmoothScroll';
import {
  TemplateTransitions,
  asTransition,
  isVerticalTransition,
} from '@/components/modules/CanvasTemplate/block-editor/transitions/TemplateTransitions';
import type { Page } from '@/services/rexer/types';

interface Props {
  page: Page;
  blueprint: Record<string, unknown>;
}

function adaptCanvas(
  raw: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const blocks = Array.isArray((raw as { blocks?: unknown }).blocks)
    ? ((raw as { blocks: unknown[] }).blocks as unknown[])
    : [];
  const transition = (raw as { transition?: unknown }).transition;
  return { schema_version: '2.0', blocks, transition };
}

export function PublicBlockRender({ page, blueprint }: Props) {
  const parsed = parseCanvas(adaptCanvas(blueprint));
  const visible = parsed?.blocks.filter(b => b.isVisible) ?? [];
  const transition = asTransition(parsed?.transition);

  if (visible.length === 0) {
    return (
      <div className='bg-muted text-content-muted flex min-h-screen items-center justify-center text-sm'>
        Trang chưa có nội dung.
      </div>
    );
  }

  const items = visible.map(block => {
    const content = block.contentVi.desktop;
    const styles = block.elementStyles?.desktop;
    const background = block.background?.desktop;
    const order = block.elementOrder?.desktop;
    const motion = block.motion?.desktop as BlockMotion | undefined;
    return (
      <MotionProvider key={block.id} mode='production' motion={motion}>
        <MotionBlockRoot className='overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5'>
          <RenderBlock
            block={block}
            content={content}
            styles={styles}
            background={background}
            order={order}
          />
        </MotionBlockRoot>
      </MotionProvider>
    );
  });

  return (
    <div className='min-h-screen bg-white'>
      <SmoothScroll enabled={isVerticalTransition(transition)}>
        <main className='@container mx-auto w-full max-w-[1280px] px-4 py-6 md:py-10'>
          <TemplateTransitions transition={transition} items={items} />
        </main>
      </SmoothScroll>
      <footer className='text-3xs border-t border-neutral-200 bg-white px-6 py-4 text-center tracking-widest text-neutral-400 uppercase'>
        Tạo bằng REXER · {visible.length} block · {page.slug}
      </footer>
    </div>
  );
}
