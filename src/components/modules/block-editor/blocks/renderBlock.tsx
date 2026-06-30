import * as React from 'react';

import { BookingForm } from './BookingForm';
import { Carousel3d } from './Carousel3d';
import { CtaSection } from './CtaSection';
import { MintDetails } from './MintDetails';
import { MintSku } from './MintSku';
import { MintHero } from './MintHero';
import { MintVariants } from './MintVariants';
import { MintDiscover } from './MintDiscover';
import { MintV2Emblem } from './MintV2Emblem';
import { MintV2Services } from './MintV2Services';
import { MintV2Manifesto } from './MintV2Manifesto';
import { MintV2Process } from './MintV2Process';
import { MintV2Cta } from './MintV2Cta';
import { MintV2Works } from './MintV2Works';
import { LineaPortfolio } from './LineaPortfolio';
import { MintVaultHero } from './MintVaultHero';
import { MintVaultCraft } from './MintVaultCraft';
import { MintVaultReveal } from './MintVaultReveal';
import { MintVaultCollection } from './MintVaultCollection';
import { MintVaultInvitation } from './MintVaultInvitation';
import { FeatureSection } from './FeatureSection';
import { Flipbook } from './Flipbook';
import { FramerAesthaEditorial } from './FramerAesthaEditorial';
import { FramerArpeggioHeroV2 } from './FramerArpeggioHeroV2';
import { FramerClarityServices } from './FramerClarityServices';
import { FramerDarlingTimeline } from './FramerDarlingTimeline';
import { FramerExploreCta } from './FramerExploreCta';
import { FramerFaqMinimal } from './FramerFaqMinimal';
import { FramerImageStagger } from './FramerImageStagger';
import { FramerIntroRedefined } from './FramerIntroRedefined';
import { FramerPerformAbout } from './FramerPerformAbout';
import { FramerPerformHero } from './FramerPerformHero';
import { FramerPerformPricing } from './FramerPerformPricing';
import { FramerProjectsGrid } from './FramerProjectsGrid';
import { HousentOurExcellence } from './HousentOurExcellence';
import { FramerSignatureFeature } from './FramerSignatureFeature';
import { FramerStatsGrid } from './FramerStatsGrid';
import { FramerStudioManifesto } from './FramerStudioManifesto';
import { FramerTeamDirectory } from './FramerTeamDirectory';
import { FramerVsCollinsProjects } from './FramerVsCollinsProjects';
import { FramerYumeHero } from './FramerYumeHero';
import { HeroOverlay } from './HeroOverlay';
import { HeroSplit } from './HeroSplit';
import { ImageCarousel } from './ImageCarousel';
import { Panorama } from './Panorama';
import { Poll } from './Poll';
import { Quiz } from './Quiz';
import { FlipGallery } from './FlipGallery';
import { Gallery3dDepth } from './Gallery3dDepth';
import { HoverEqualizerHeading } from './HoverEqualizerHeading';
import { HoverRevealList } from './HoverRevealList';
import { ImageExplosion } from './ImageExplosion';
import { ImageTrail } from './ImageTrail';
import { StorySlides } from './StorySlides';
import { AccordionMedia } from './AccordionMedia';
import { Spotlight } from './Spotlight';
import { ProcessSteps } from './ProcessSteps';
import { DotMatrix } from './DotMatrix';
import { InteractiveGrid } from './InteractiveGrid';
import { PixelReveal } from './PixelReveal';
import { LetterSlider } from './LetterSlider';
import { LightboxFlip } from './LightboxFlip';
import { MarqueeBand } from './MarqueeBand';
import { ParallaxHero } from './ParallaxHero';
import { ProductSpecSheet } from './ProductSpecSheet';
import { SeamlessScrollGallery } from './SeamlessScrollGallery';
import { SplitScreen } from './SplitScreen';
import { StickyScrollCards } from './StickyScrollCards';
import { Stories } from './Stories';
import { TextDisplaceHero } from './TextDisplaceHero';
import { WheelGallery } from './WheelGallery';
import { getBlockDef } from './_registry/registry';
import type {
  Block,
  BlockBackground,
  BlockContent,
  BookingFormContent,
  Carousel3dContent,
  CtaSectionContent,
  MintDetailsContent,
  MintSkuContent,
  MintHeroContent,
  MintVariantsContent,
  MintDiscoverContent,
  MintV2EmblemContent,
  MintV2ServicesContent,
  MintV2ManifestoContent,
  MintV2ProcessContent,
  MintV2CtaContent,
  MintV2WorksContent,
  LineaPortfolioContent,
  MintVaultHeroContent,
  MintVaultCraftContent,
  MintVaultRevealContent,
  MintVaultCollectionContent,
  MintVaultInvitationContent,
  ElementPositionsMap,
  ElementStylesMap,
  FeatureSectionContent,
  FlipbookContent,
  FramerAesthaEditorialContent,
  FramerArpeggioHeroV2Content,
  FramerClarityServicesContent,
  FramerDarlingTimelineContent,
  FramerExploreCtaContent,
  FramerFaqMinimalContent,
  FramerImageStaggerContent,
  FramerIntroRedefinedContent,
  FramerPerformAboutContent,
  FramerPerformHeroContent,
  FramerPerformPricingContent,
  FramerProjectsGridContent,
  FramerSignatureFeatureContent,
  FramerStatsGridContent,
  FramerStudioManifestoContent,
  FramerTeamDirectoryContent,
  FramerVsCollinsProjectsContent,
  HousentOurExcellenceContent,
  FramerYumeHeroContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  PanoramaContent,
  PollContent,
  QuizContent,
  SplitScreenContent,
  StoriesContent,
  TextDisplaceHeroContent,
  ImageTrailContent,
  StickyScrollCardsContent,
  Gallery3dDepthContent,
  ParallaxHeroContent,
  LightboxFlipContent,
  FlipGalleryContent,
  WheelGalleryContent,
  HoverRevealListContent,
  HoverEqualizerHeadingContent,
  ImageExplosionContent,
  StorySlidesContent,
  AccordionMediaContent,
  SpotlightContent,
  ProcessStepsContent,
  DotMatrixContent,
  InteractiveGridContent,
  PixelRevealContent,
  MarqueeBandContent,
  LetterSliderContent,
  SeamlessScrollGalleryContent,
  ProductSpecSheetContent,
} from '../types';

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
  // case trong switch dưới (xem blocks/_registry/registry.ts).
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
  switch (block.blockType) {
    case 'hero_split':
      return (
        <HeroSplit
          content={content as HeroSplitContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'hero_overlay':
      return (
        <HeroOverlay
          content={content as HeroOverlayContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'feature_section':
      return (
        <FeatureSection
          content={content as FeatureSectionContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'booking_form':
      return (
        <BookingForm
          content={content as BookingFormContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'cta_section':
      return (
        <CtaSection
          content={content as CtaSectionContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_details':
      return (
        <MintDetails
          content={content as MintDetailsContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_sku':
      return (
        <MintSku
          content={content as MintSkuContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_hero':
      return (
        <MintHero
          content={content as MintHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_variants':
      return (
        <MintVariants
          content={content as MintVariantsContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_discover':
      return (
        <MintDiscover
          content={content as MintDiscoverContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_emblem':
      return (
        <MintV2Emblem
          content={content as MintV2EmblemContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_services':
      return (
        <MintV2Services
          content={content as MintV2ServicesContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_manifesto':
      return (
        <MintV2Manifesto
          content={content as MintV2ManifestoContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_process':
      return (
        <MintV2Process
          content={content as MintV2ProcessContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_cta':
      return (
        <MintV2Cta
          content={content as MintV2CtaContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mintv2_works':
      return (
        <MintV2Works
          content={content as MintV2WorksContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'linea_portfolio':
      return (
        <LineaPortfolio
          content={content as LineaPortfolioContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_vault_hero':
      return (
        <MintVaultHero
          content={content as MintVaultHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_vault_craft':
      return (
        <MintVaultCraft
          content={content as MintVaultCraftContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_vault_reveal':
      return (
        <MintVaultReveal
          content={content as MintVaultRevealContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_vault_collection':
      return (
        <MintVaultCollection
          content={content as MintVaultCollectionContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'mint_vault_invitation':
      return (
        <MintVaultInvitation
          content={content as MintVaultInvitationContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'image_carousel':
      return (
        <ImageCarousel
          content={content as ImageCarouselContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'stories':
      return (
        <Stories
          content={content as StoriesContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'split_screen':
      return (
        <SplitScreen
          content={content as SplitScreenContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'quiz':
      return (
        <Quiz
          content={content as QuizContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'poll':
      return (
        <Poll
          content={content as PollContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'carousel_3d':
      return (
        <Carousel3d
          content={content as Carousel3dContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'flipbook':
      return (
        <Flipbook
          content={content as FlipbookContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'panorama':
      return (
        <Panorama
          content={content as PanoramaContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'text_displace_hero':
      return (
        <TextDisplaceHero
          content={content as TextDisplaceHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'image_trail':
      return (
        <ImageTrail
          content={content as ImageTrailContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'sticky_scroll_cards':
      return (
        <StickyScrollCards
          content={content as StickyScrollCardsContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'gallery_3d_depth':
      return (
        <Gallery3dDepth
          content={content as Gallery3dDepthContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'parallax_hero':
      return (
        <ParallaxHero
          content={content as ParallaxHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'lightbox_flip':
      return (
        <LightboxFlip
          content={content as LightboxFlipContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'flip_gallery':
      return (
        <FlipGallery
          content={content as FlipGalleryContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'wheel_gallery':
      return (
        <WheelGallery
          content={content as WheelGalleryContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'hover_reveal_list':
      return (
        <HoverRevealList
          content={content as HoverRevealListContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'hover_equalizer_heading':
      return (
        <HoverEqualizerHeading
          content={content as HoverEqualizerHeadingContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'image_explosion':
      return (
        <ImageExplosion
          content={content as ImageExplosionContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'marquee_band':
      return (
        <MarqueeBand
          content={content as MarqueeBandContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'story_slides':
      return (
        <StorySlides
          content={content as StorySlidesContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'accordion_media':
      return (
        <AccordionMedia
          content={content as AccordionMediaContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'spotlight':
      return (
        <Spotlight
          content={content as SpotlightContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'process_steps':
      return (
        <ProcessSteps
          content={content as ProcessStepsContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'dot_matrix':
      return (
        <DotMatrix
          content={content as DotMatrixContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'interactive_grid':
      return (
        <InteractiveGrid
          content={content as InteractiveGridContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'pixel_reveal':
      return (
        <PixelReveal
          content={content as PixelRevealContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'letter_slider':
      return (
        <LetterSlider
          content={content as LetterSliderContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'seamless_scroll_gallery':
      return (
        <SeamlessScrollGallery
          content={content as SeamlessScrollGalleryContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'product_spec_sheet':
      return (
        <ProductSpecSheet
          content={content as ProductSpecSheetContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    // `framer_yume_hero` đã chuyển sang registry (intercept ở đầu hàm).
    case 'framer_yuya_hero':
      // Yuya ≈ Yume (cùng design) → dùng chung renderer + content shape.
      return (
        <FramerYumeHero
          content={content as FramerYumeHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_arpeggio_hero_v2':
      return (
        <FramerArpeggioHeroV2
          content={content as FramerArpeggioHeroV2Content}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_clarity_services':
      return (
        <FramerClarityServices
          content={content as FramerClarityServicesContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_perform_hero':
      return (
        <FramerPerformHero
          content={content as FramerPerformHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_intro_redefined':
      return (
        <FramerIntroRedefined
          content={content as FramerIntroRedefinedContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_explore_cta':
      return (
        <FramerExploreCta
          content={content as FramerExploreCtaContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_studio_manifesto':
      return (
        <FramerStudioManifesto
          content={content as FramerStudioManifestoContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_stats_grid':
      return (
        <FramerStatsGrid
          content={content as FramerStatsGridContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_projects_grid':
      return (
        <FramerProjectsGrid
          content={content as FramerProjectsGridContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_team_directory':
      return (
        <FramerTeamDirectory
          content={content as FramerTeamDirectoryContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_image_stagger':
      return (
        <FramerImageStagger
          content={content as FramerImageStaggerContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_faq_minimal':
      return (
        <FramerFaqMinimal
          content={content as FramerFaqMinimalContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_darling_timeline':
      return (
        <FramerDarlingTimeline
          content={content as FramerDarlingTimelineContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_signature_feature':
      return (
        <FramerSignatureFeature
          content={content as FramerSignatureFeatureContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_vs_collins_projects':
      return (
        <FramerVsCollinsProjects
          content={content as FramerVsCollinsProjectsContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_aestha_editorial':
      return (
        <FramerAesthaEditorial
          content={content as FramerAesthaEditorialContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_perform_about':
      return (
        <FramerPerformAbout
          content={content as FramerPerformAboutContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_perform_pricing':
      return (
        <FramerPerformPricing
          content={content as FramerPerformPricingContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'housent_our_excellence':
      return (
        <HousentOurExcellence
          content={content as HousentOurExcellenceContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    default:
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
}
