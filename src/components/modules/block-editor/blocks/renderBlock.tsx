import * as React from 'react';
import dynamic from 'next/dynamic';

import { getBlockDef } from './_registry/registry';
import type {
  Block,
  BlockBackground,
  BlockContent,
  ElementPositionsMap,
  ElementStylesMap,
} from '../types';

/**
 * Map type → component qua `next/dynamic` (audit FE 2026-07-04 P1): file này
 * được import bởi cả editor lẫn trang public `/p/[id]`, static-import ~70
 * block (nhiều block kéo gsap/framer-motion/three) sẽ bắt visitor ẩn danh
 * hydrate toàn bộ thư viện dù trang chỉ dùng vài block. Dynamic import để
 * webpack tách chunk per-block — cùng pattern `src/templates/registry.tsx`.
 * SSR vẫn bật (mặc định của dynamic) nên HTML public không đổi.
 */
type BlockRendererProps = {
  content: BlockContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
};

type BlockRenderer = React.ComponentType<BlockRendererProps>;

// Mỗi block component khai báo content type hẹp hơn BlockContent — cast về
// BlockRenderer tương đương `content as XContent` ở switch cũ.
const lazyBlock = <P,>(
  loader: () => Promise<React.ComponentType<P>>
): BlockRenderer => dynamic(loader) as unknown as BlockRenderer;

const BLOCK_RENDERERS: Record<string, BlockRenderer> = {
  hero_split: lazyBlock(() => import('./HeroSplit').then(m => m.HeroSplit)),
  hero_overlay: lazyBlock(() =>
    import('./HeroOverlay').then(m => m.HeroOverlay)
  ),
  feature_section: lazyBlock(() =>
    import('./FeatureSection').then(m => m.FeatureSection)
  ),
  booking_form: lazyBlock(() =>
    import('./BookingForm').then(m => m.BookingForm)
  ),
  cta_section: lazyBlock(() => import('./CtaSection').then(m => m.CtaSection)),
  mint_details: lazyBlock(() =>
    import('./MintDetails').then(m => m.MintDetails)
  ),
  mint_sku: lazyBlock(() => import('./MintSku').then(m => m.MintSku)),
  mint_hero: lazyBlock(() => import('./MintHero').then(m => m.MintHero)),
  mint_variants: lazyBlock(() =>
    import('./MintVariants').then(m => m.MintVariants)
  ),
  mint_discover: lazyBlock(() =>
    import('./MintDiscover').then(m => m.MintDiscover)
  ),
  mintv2_emblem: lazyBlock(() =>
    import('./MintV2Emblem').then(m => m.MintV2Emblem)
  ),
  mintv2_services: lazyBlock(() =>
    import('./MintV2Services').then(m => m.MintV2Services)
  ),
  mintv2_manifesto: lazyBlock(() =>
    import('./MintV2Manifesto').then(m => m.MintV2Manifesto)
  ),
  mintv2_process: lazyBlock(() =>
    import('./MintV2Process').then(m => m.MintV2Process)
  ),
  mintv2_cta: lazyBlock(() => import('./MintV2Cta').then(m => m.MintV2Cta)),
  mintv2_works: lazyBlock(() =>
    import('./MintV2Works').then(m => m.MintV2Works)
  ),
  linea_portfolio: lazyBlock(() =>
    import('./LineaPortfolio').then(m => m.LineaPortfolio)
  ),
  mint_vault_hero: lazyBlock(() =>
    import('./MintVaultHero').then(m => m.MintVaultHero)
  ),
  mint_vault_craft: lazyBlock(() =>
    import('./MintVaultCraft').then(m => m.MintVaultCraft)
  ),
  mint_vault_reveal: lazyBlock(() =>
    import('./MintVaultReveal').then(m => m.MintVaultReveal)
  ),
  mint_vault_collection: lazyBlock(() =>
    import('./MintVaultCollection').then(m => m.MintVaultCollection)
  ),
  mint_vault_invitation: lazyBlock(() =>
    import('./MintVaultInvitation').then(m => m.MintVaultInvitation)
  ),
  image_carousel: lazyBlock(() =>
    import('./ImageCarousel').then(m => m.ImageCarousel)
  ),
  stories: lazyBlock(() => import('./Stories').then(m => m.Stories)),
  split_screen: lazyBlock(() =>
    import('./SplitScreen').then(m => m.SplitScreen)
  ),
  quiz: lazyBlock(() => import('./Quiz').then(m => m.Quiz)),
  poll: lazyBlock(() => import('./Poll').then(m => m.Poll)),
  carousel_3d: lazyBlock(() => import('./Carousel3d').then(m => m.Carousel3d)),
  flipbook: lazyBlock(() => import('./Flipbook').then(m => m.Flipbook)),
  panorama: lazyBlock(() => import('./Panorama').then(m => m.Panorama)),
  text_displace_hero: lazyBlock(() =>
    import('./TextDisplaceHero').then(m => m.TextDisplaceHero)
  ),
  image_trail: lazyBlock(() => import('./ImageTrail').then(m => m.ImageTrail)),
  sticky_scroll_cards: lazyBlock(() =>
    import('./StickyScrollCards').then(m => m.StickyScrollCards)
  ),
  gallery_3d_depth: lazyBlock(() =>
    import('./Gallery3dDepth').then(m => m.Gallery3dDepth)
  ),
  parallax_hero: lazyBlock(() =>
    import('./ParallaxHero').then(m => m.ParallaxHero)
  ),
  lightbox_flip: lazyBlock(() =>
    import('./LightboxFlip').then(m => m.LightboxFlip)
  ),
  flip_gallery: lazyBlock(() =>
    import('./FlipGallery').then(m => m.FlipGallery)
  ),
  wheel_gallery: lazyBlock(() =>
    import('./WheelGallery').then(m => m.WheelGallery)
  ),
  hover_reveal_list: lazyBlock(() =>
    import('./HoverRevealList').then(m => m.HoverRevealList)
  ),
  hover_equalizer_heading: lazyBlock(() =>
    import('./HoverEqualizerHeading').then(m => m.HoverEqualizerHeading)
  ),
  brutalist_text: lazyBlock(() =>
    import('./BrutalistText').then(m => m.BrutalistText)
  ),
  image_explosion: lazyBlock(() =>
    import('./ImageExplosion').then(m => m.ImageExplosion)
  ),
  marquee_band: lazyBlock(() =>
    import('./MarqueeBand').then(m => m.MarqueeBand)
  ),
  story_slides: lazyBlock(() =>
    import('./StorySlides').then(m => m.StorySlides)
  ),
  accordion_media: lazyBlock(() =>
    import('./AccordionMedia').then(m => m.AccordionMedia)
  ),
  spotlight: lazyBlock(() => import('./Spotlight').then(m => m.Spotlight)),
  process_steps: lazyBlock(() =>
    import('./ProcessSteps').then(m => m.ProcessSteps)
  ),
  dot_matrix: lazyBlock(() => import('./DotMatrix').then(m => m.DotMatrix)),
  interactive_grid: lazyBlock(() =>
    import('./InteractiveGrid').then(m => m.InteractiveGrid)
  ),
  pixel_reveal: lazyBlock(() =>
    import('./PixelReveal').then(m => m.PixelReveal)
  ),
  letter_slider: lazyBlock(() =>
    import('./LetterSlider').then(m => m.LetterSlider)
  ),
  seamless_scroll_gallery: lazyBlock(() =>
    import('./SeamlessScrollGallery').then(m => m.SeamlessScrollGallery)
  ),
  product_spec_sheet: lazyBlock(() =>
    import('./ProductSpecSheet').then(m => m.ProductSpecSheet)
  ),
  framer_arpeggio_hero_v2: lazyBlock(() =>
    import('./FramerArpeggioHeroV2').then(m => m.FramerArpeggioHeroV2)
  ),
  framer_clarity_services: lazyBlock(() =>
    import('./FramerClarityServices').then(m => m.FramerClarityServices)
  ),
  framer_perform_hero: lazyBlock(() =>
    import('./FramerPerformHero').then(m => m.FramerPerformHero)
  ),
  framer_intro_redefined: lazyBlock(() =>
    import('./FramerIntroRedefined').then(m => m.FramerIntroRedefined)
  ),
  framer_explore_cta: lazyBlock(() =>
    import('./FramerExploreCta').then(m => m.FramerExploreCta)
  ),
  framer_studio_manifesto: lazyBlock(() =>
    import('./FramerStudioManifesto').then(m => m.FramerStudioManifesto)
  ),
  framer_stats_grid: lazyBlock(() =>
    import('./FramerStatsGrid').then(m => m.FramerStatsGrid)
  ),
  framer_projects_grid: lazyBlock(() =>
    import('./FramerProjectsGrid').then(m => m.FramerProjectsGrid)
  ),
  framer_team_directory: lazyBlock(() =>
    import('./FramerTeamDirectory').then(m => m.FramerTeamDirectory)
  ),
  framer_image_stagger: lazyBlock(() =>
    import('./FramerImageStagger').then(m => m.FramerImageStagger)
  ),
  framer_faq_minimal: lazyBlock(() =>
    import('./FramerFaqMinimal').then(m => m.FramerFaqMinimal)
  ),
  framer_darling_timeline: lazyBlock(() =>
    import('./FramerDarlingTimeline').then(m => m.FramerDarlingTimeline)
  ),
  framer_signature_feature: lazyBlock(() =>
    import('./FramerSignatureFeature').then(m => m.FramerSignatureFeature)
  ),
  framer_vs_collins_projects: lazyBlock(() =>
    import('./FramerVsCollinsProjects').then(m => m.FramerVsCollinsProjects)
  ),
  framer_aestha_editorial: lazyBlock(() =>
    import('./FramerAesthaEditorial').then(m => m.FramerAesthaEditorial)
  ),
  framer_perform_about: lazyBlock(() =>
    import('./FramerPerformAbout').then(m => m.FramerPerformAbout)
  ),
  framer_perform_pricing: lazyBlock(() =>
    import('./FramerPerformPricing').then(m => m.FramerPerformPricing)
  ),
  // Yuya ≈ Yume (cùng design) → dùng chung renderer + content shape.
  framer_yuya_hero: lazyBlock(() =>
    import('./FramerYumeHero').then(m => m.FramerYumeHero)
  ),
  housent_our_excellence: lazyBlock(() =>
    import('./HousentOurExcellence').then(m => m.HousentOurExcellence)
  ),
};

interface RenderBlockProps {
  block: Block;
  /** Already resolved per-device content. */
  content: BlockContent;
  /** Already resolved per-device element styles. */
  styles?: ElementStylesMap;
  /** Already resolved per-device background. */
  background?: BlockBackground;
  /** Already resolved per-device element order. */
  order?: string[];
  /** Already resolved per-device free-form drag offsets. */
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  fallback?: React.ReactNode;
}

export function RenderBlock({
  block,
  content,
  styles,
  background,
  order,
  positions,
  activeKey,
  fallback,
}: RenderBlockProps) {
  // Registry-first: block đã có BlockDef thì render thẳng từ def, KHÔNG cần
  // entry trong map dưới (xem blocks/_registry/registry.ts).
  const def = getBlockDef(block.blockType);
  if (def) {
    const Comp = def.component;
    return (
      <Comp
        content={content}
        styles={styles}
        background={background}
        order={order}
        positions={positions}
        activeKey={activeKey}
      />
    );
  }

  const Renderer = BLOCK_RENDERERS[block.blockType];
  if (Renderer) {
    return (
      <Renderer
        content={content}
        styles={styles}
        background={background}
        order={order}
        positions={positions}
        activeKey={activeKey}
      />
    );
  }

  return (
    <>
      {fallback ?? (
        <div className='flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 px-6 text-center text-sm text-neutral-500'>
          Block <strong className='ml-1'>{block.name}</strong> (
          {block.blockType}) chưa có renderer.
        </div>
      )}
    </>
  );
}
