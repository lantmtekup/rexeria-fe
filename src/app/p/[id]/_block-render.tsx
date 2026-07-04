'use client';

/**
 * FE-side block template render cho `/p/[slug]` public route. Parse
 * canvas_blueprint từ BE public response → loop blocks → render qua
 * `RenderBlock` + MotionProvider (mode='production'). Mirror logic
 * của admin overlay view nhưng tối giản.
 *
 * Tracking: `useInitTracker`/`useBlockTracking` + wrapper `data-block-id`/
 * `data-block-type` (trước đây route này KHÔNG có, chỉ `[token]/page.tsx`
 * mới có — nghĩa là mọi lượt xem `/p/[slug]` trần không hề được đo). Vá
 * lại để interactive ad creative (và mọi page khác qua route này) đo được
 * page_view/click/block_view thật khi nhúng iframe lên site đối tác.
 */

import * as React from 'react';

import { RenderBlock } from '@/components/modules/block-editor/blocks/renderBlock';
import {
  MotionBlockRoot,
  MotionProvider,
} from '@/components/modules/block-editor/motion/runtime';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import { parseCanvas } from '@/components/modules/block-editor/serialize';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  TemplateTransitions,
  asTransition,
  isVerticalTransition,
} from '@/components/modules/block-editor/transitions/TemplateTransitions';
import { brandKitToCssVars, type BrandKitData } from '@/lib/brand-kit';
import { useBlockTracking, useInitTracker } from '@/lib/analytics/use-tracker';
import type { MotionKitData, Page } from '@/services/rexer/types';

interface Props {
  page: Page;
  blueprint: Record<string, unknown>;
  /** Active brand kit → injected as CSS vars so block token styles resolve. */
  brandKit?: BrandKitData;
  /** Active motion kit → scales every block's GSAP timeline. */
  motionKit?: MotionKitData;
  /** `?embed=1` — nhúng iframe lên site đối tác. Ẩn footer "Tạo bằng REXER". */
  embed?: boolean;
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

/** `*.tekup.vn` matches `foo.tekup.vn` and `tekup.vn` itself. */
function hostMatches(host: string, pattern: string): boolean {
  if (pattern === host) return true;
  if (pattern.startsWith('*.')) {
    const base = pattern.slice(2);
    return host === base || host.endsWith(`.${base}`);
  }
  return false;
}

/**
 * Domain allowlist — CHECK PHÍA CLIENT, TẠM THỜI (honor-system, dễ bypass
 * bằng cách strip script). BE chưa enforce server-side — xem
 * docs/be-spec-interactive-ad-creative-2026-07-02.md §3. Chỉ áp dụng cho
 * page type='ad' có khai `interactive.allowed_domains`; page khác luôn qua.
 */
function useAdDomainAllowed(page: Page): boolean {
  const [allowed, setAllowed] = React.useState(true);
  React.useEffect(() => {
    if (page.type !== 'ad') return;
    const meta = page.type_metadata as {
      interactive?: { allowed_domains?: string[] };
    };
    const domains = meta?.interactive?.allowed_domains;
    if (!domains || domains.length === 0) return;
    if (!document.referrer) return; // mở trực tiếp (không nhúng) → luôn cho qua
    try {
      const referrerHost = new URL(document.referrer).hostname;
      setAllowed(domains.some(d => hostMatches(referrerHost, d)));
    } catch {
      setAllowed(true);
    }
  }, [page]);
  return allowed;
}

export function PublicBlockRender({
  page,
  blueprint,
  brandKit,
  motionKit,
  embed,
}: Props) {
  useInitTracker(page.id);
  useBlockTracking();
  const domainAllowed = useAdDomainAllowed(page);

  const parsed = parseCanvas(adaptCanvas(blueprint));
  const visible = parsed?.blocks.filter(b => b.isVisible) ?? [];
  const transition = asTransition(parsed?.transition);

  if (!domainAllowed) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-white/50'>
        Domain này chưa được phép nhúng ad creative.
      </div>
    );
  }

  // Map the BE motion kit (snake_case) to the runtime config the GSAP layer
  // reads (durationScale + easing). transition_style drives page transitions
  // (handled by the global @view-transition rule), not the per-block timeline.
  const motionConfig = motionKit
    ? { easing: motionKit.easing, durationScale: motionKit.duration_scale }
    : undefined;

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
      <MotionProvider
        key={block.id}
        mode='production'
        motion={motion}
        motionKit={motionConfig}
      >
        {/* KHÔNG overflow-hidden/rounded/ring ở wrapper public: (1) chặn
            `position: sticky` bên trong block (hero frame-scrub, variant pin
            2-stage của bộ Delvaux render trắng); (2) landing thật không có
            viền/bo góc giữa các section. Block nào cần clip tự set
            overflow-hidden trên section của nó. */}
        <div data-block-id={block.id} data-block-type={block.blockType}>
          <MotionBlockRoot className='relative'>
            <RenderBlock
              block={block}
              content={content}
              styles={styles}
              background={background}
              order={order}
            />
          </MotionBlockRoot>
        </div>
      </MotionProvider>
    );
  });

  // Brand-kit tokens as CSS vars on the page wrapper; they cascade to every
  // block so `token:*` element styles resolve to the brand's palette/fonts.
  return (
    <div className='min-h-screen bg-white' style={brandKitToCssVars(brandKit)}>
      <LandingMotionRoot enableSmooth={isVerticalTransition(transition)}>
        <main className='w-full'>
          <TemplateTransitions transition={transition} items={items} />
        </main>
      </LandingMotionRoot>
      {embed ? null : (
        <footer className='text-3xs border-t border-neutral-200 bg-white px-6 py-4 text-center tracking-widest text-neutral-400 uppercase'>
          Tạo bằng REXER · {visible.length} block · {page.slug}
        </footer>
      )}
    </div>
  );
}
