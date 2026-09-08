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
import { LeadCaptureProvider } from '@/components/modules/block-editor/leads/LeadCaptureContext';
import { LinkNav } from '@/components/modules/block-editor/links/LinkNav';
import { blockAnchorId } from '@/components/modules/block-editor/links/linkToken';
import { resolveLinksDeep } from '@/components/modules/block-editor/links/resolveLinks';
import {
  findHomePage,
  readSitePages,
} from '@/components/modules/block-editor/links/sitePages';
import {
  adaptCanvasBlueprint,
  parseCanvas,
} from '@/components/modules/block-editor/serialize';
import { LandingMotionRoot } from '@/components/modules/block-editor/motion/LandingMotion';
import {
  TemplateTransitions,
  asTransition,
  isVerticalTransition,
} from '@/components/modules/block-editor/transitions/TemplateTransitions';
import { brandKitToCssVars, type BrandKitData } from '@/lib/brand-kit';
import { useBlockTracking, useInitTracker } from '@/lib/analytics/use-tracker';
import type { BlockSignalConfig } from '@/components/modules/block-editor/types';
import type { MotionKitData, Page } from '@/services/rexer/types';

interface Props {
  page: Page;
  blueprint: Record<string, unknown>;
  /** Which page of the template to render. Defaults to home. */
  activePageId?: string;
  /** Public slug the template is published under — the `/p/{rootSlug}` prefix
   *  used to build internal links and to recognise them on click. */
  rootSlug?: string;
  /** Active brand kit → injected as CSS vars so block token styles resolve. */
  brandKit?: BrandKitData;
  /** Active motion kit → scales every block's GSAP timeline. */
  motionKit?: MotionKitData;
  /** `?embed=1` — nhúng iframe lên site đối tác. Ẩn footer "Tạo bằng REXER". */
  embed?: boolean;
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
      // Navigating between pages of the same template makes the referrer our
      // OWN host, which is not in `allowed_domains` — without this, clicking
      // through to a sub-page would show "Domain này chưa được phép nhúng".
      if (referrerHost === window.location.hostname) return;
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
  activePageId,
  rootSlug,
  brandKit,
  motionKit,
  embed,
}: Props) {
  const parsed = parseCanvas(adaptCanvasBlueprint(blueprint));
  const transition = asTransition(parsed?.transition);

  const sitePages = React.useMemo(() => readSitePages(blueprint), [blueprint]);
  const current = React.useMemo(
    () => sitePages.find(p => p.id === activePageId) ?? findHomePage(sitePages),
    [sitePages, activePageId]
  );

  // `block.signal` (Signal panel config) → visitor tracker, so it can gate
  // block/element events on opt-in instead of tracking everything blindly.
  const signalByBlockId = React.useMemo(() => {
    const map: Record<string, BlockSignalConfig> = {};
    for (const block of current.blocks) {
      if (block.signal) map[block.id] = block.signal;
    }
    return map;
  }, [current]);

  useInitTracker(page.id, current.isHome ? undefined : current.slug);
  useBlockTracking(signalByBlockId);
  const domainAllowed = useAdDomainAllowed(page);

  const linkCtx = React.useMemo(
    () => ({
      pages: sitePages,
      rootSlug: rootSlug ?? page.slug,
      mode: 'public' as const,
      // `?embed=1` must survive internal navigation or clicking through inside
      // a partner iframe suddenly shows the "Tạo bằng REXER" footer.
      search: embed ? '?embed=1' : undefined,
    }),
    [sitePages, rootSlug, page.slug, embed]
  );

  const visible = React.useMemo(
    () => current.blocks.filter(b => b.isVisible),
    [current]
  );

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
    // Rewrite `#page:` / `#block:` tokens into real hrefs. Value-driven and
    // structurally shared, so blocks whose content has no token get the exact
    // same object back and their GSAP effect deps don't change identity.
    const content = resolveLinksDeep(block.contentVi.desktop, linkCtx);
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
        <div
          id={blockAnchorId(block.id)}
          data-block-id={block.id}
          data-block-type={block.blockType}
        >
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
      {/* Block có form đọc `pageId` ở đây để biết gửi lead về trang nào —
          không có provider thì form chỉ hiện bản xem trước, không gửi. */}
      <LeadCaptureProvider pageId={page.id} pageSlug={rootSlug ?? page.slug}>
        <LandingMotionRoot enableSmooth={isVerticalTransition(transition)}>
          <LinkNav mode='public' rootSlug={rootSlug ?? page.slug}>
            <main className='w-full'>
              {/* `!gap-0`: trang published là landing full-bleed — gap mặc định
                của PlainStack (gap-3/4) tạo sọc trắng giữa các section (lộ rõ
                với block full-viewport như q80_experience). */}
              <TemplateTransitions
                transition={transition}
                items={items}
                className='!gap-0'
              />
            </main>
          </LinkNav>
        </LandingMotionRoot>
      </LeadCaptureProvider>
      {/* {embed ? null : (
        <footer className='text-3xs border-t border-neutral-200 bg-white px-6 py-4 text-center tracking-widest text-neutral-400 uppercase'>
          Tạo bằng REXER · {visible.length} block ·{' '}
          {current.isHome ? page.slug : `${page.slug}/${current.slug}`}
        </footer>
      )} */}
    </div>
  );
}
