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
  return { schema_version: '2.0', blocks };
}

export function PublicBlockRender({ page, blueprint }: Props) {
  const parsed = parseCanvas(adaptCanvas(blueprint));
  const visible = parsed?.blocks.filter(b => b.isVisible) ?? [];

  if (visible.length === 0) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500'>
        Trang chưa có nội dung.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <main className='@container mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 py-6 md:gap-4 md:py-10'>
        {visible.map(block => {
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
        })}
      </main>
      <footer className='border-t border-neutral-200 bg-white px-6 py-4 text-center text-[10px] tracking-widest text-neutral-400 uppercase'>
        Tạo bằng REXER · {visible.length} block · {page.slug}
      </footer>
    </div>
  );
}
