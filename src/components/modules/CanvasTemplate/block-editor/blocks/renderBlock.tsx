import * as React from 'react';

import { BookingForm } from './BookingForm';
import { Carousel3d } from './Carousel3d';
import { CtaSection } from './CtaSection';
import { FeatureSection } from './FeatureSection';
import { Flipbook } from './Flipbook';
import { FramerAesthaEditorial } from './FramerAesthaEditorial';
import { FramerAesthaProjectDetail } from './FramerAesthaProjectDetail';
import { FramerArpeggioHero } from './FramerArpeggioHero';
import { FramerAvexaBento } from './FramerAvexaBento';
import { FramerAvexaHero } from './FramerAvexaHero';
import { FramerBungeeHero } from './FramerBungeeHero';
import { FramerClarityServices } from './FramerClarityServices';
import { FramerContactFooter } from './FramerContactFooter';
import { FramerDarlingTimeline } from './FramerDarlingTimeline';
import { FramerDelvauxHeroIntro } from './FramerDelvauxHeroIntro';
import { FramerExploreCta } from './FramerExploreCta';
import { FramerFaqMinimal } from './FramerFaqMinimal';
import { FramerFinneganExpertise } from './FramerFinneganExpertise';
import { FramerFirmaFeatured } from './FramerFirmaFeatured';
import { FramerHero } from './FramerHero';
import { FramerHorizontalScroll } from './FramerHorizontalScroll';
import { FramerImageStagger } from './FramerImageStagger';
import { FramerIntroRedefined } from './FramerIntroRedefined';
import { FramerLargeQuote } from './FramerLargeQuote';
import { FramerMobiusHero } from './FramerMobiusHero';
import { FramerParadigmTitle } from './FramerParadigmTitle';
import { FramerPerformAbout } from './FramerPerformAbout';
import { FramerPerformHero } from './FramerPerformHero';
import { FramerPerformHeroV2 } from './FramerPerformHeroV2';
import { FramerPerformPricing } from './FramerPerformPricing';
import { FramerProjectsGrid } from './FramerProjectsGrid';
import { FramerSignatureFeature } from './FramerSignatureFeature';
import { FramerStatsGrid } from './FramerStatsGrid';
import { FramerStudioManifesto } from './FramerStudioManifesto';
import { FramerTeamDirectory } from './FramerTeamDirectory';
import { FramerVeloraServices } from './FramerVeloraServices';
import { FramerVsCollinsProjects } from './FramerVsCollinsProjects';
import { FramerYumeHero } from './FramerYumeHero';
import { HeroOverlay } from './HeroOverlay';
import { HeroSplit } from './HeroSplit';
import { ImageCarousel } from './ImageCarousel';
import { LegacyEmbed } from './LegacyEmbed';
import { Panorama } from './Panorama';
import { PhotoGallery } from './PhotoGallery';
import { Poll } from './Poll';
import { Quiz } from './Quiz';
import { SplitScreen } from './SplitScreen';
import { Stories } from './Stories';
import type {
  Block,
  BlockBackground,
  BlockContent,
  BookingFormContent,
  Carousel3dContent,
  CtaSectionContent,
  ElementPositionsMap,
  ElementStylesMap,
  FeatureSectionContent,
  FlipbookContent,
  FramerAesthaEditorialContent,
  FramerAesthaProjectDetailContent,
  FramerArpeggioHeroContent,
  FramerAvexaBentoContent,
  FramerAvexaHeroContent,
  FramerBungeeHeroContent,
  FramerClarityServicesContent,
  FramerContactFooterContent,
  FramerDarlingTimelineContent,
  FramerDelvauxHeroIntroContent,
  FramerExploreCtaContent,
  FramerFaqMinimalContent,
  FramerFinneganExpertiseContent,
  FramerFirmaFeaturedContent,
  FramerHeroContent,
  FramerHorizontalScrollContent,
  FramerImageStaggerContent,
  FramerIntroRedefinedContent,
  FramerLargeQuoteContent,
  FramerMobiusHeroContent,
  FramerParadigmTitleContent,
  FramerPerformAboutContent,
  FramerPerformHeroContent,
  FramerPerformHeroV2Content,
  FramerPerformPricingContent,
  FramerProjectsGridContent,
  FramerSignatureFeatureContent,
  FramerStatsGridContent,
  FramerStudioManifestoContent,
  FramerTeamDirectoryContent,
  FramerVeloraServicesContent,
  FramerVsCollinsProjectsContent,
  FramerYumeHeroContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  LegacyEmbedContent,
  PanoramaContent,
  PhotoGalleryContent,
  PollContent,
  QuizContent,
  SplitScreenContent,
  StoriesContent,
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
    case 'photo_gallery':
      return (
        <PhotoGallery
          content={content as PhotoGalleryContent}
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
    case 'framer_yume_hero':
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
    case 'framer_arpeggio_hero':
      return (
        <FramerArpeggioHero
          content={content as FramerArpeggioHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_mobius_hero':
      return (
        <FramerMobiusHero
          content={content as FramerMobiusHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_avexa_hero':
      return (
        <FramerAvexaHero
          content={content as FramerAvexaHeroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_avexa_bento':
      return (
        <FramerAvexaBento
          content={content as FramerAvexaBentoContent}
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
    case 'framer_velora_services':
      return (
        <FramerVeloraServices
          content={content as FramerVeloraServicesContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_firma_featured':
      return (
        <FramerFirmaFeatured
          content={content as FramerFirmaFeaturedContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_delvaux_hero_intro':
      return (
        <FramerDelvauxHeroIntro
          content={content as FramerDelvauxHeroIntroContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_hero':
      return (
        <FramerHero
          content={content as FramerHeroContent}
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
    case 'framer_perform_hero_v2':
      return (
        <FramerPerformHeroV2
          content={content as FramerPerformHeroV2Content}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_bungee_hero':
      return (
        <FramerBungeeHero
          content={content as FramerBungeeHeroContent}
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
    case 'framer_paradigm_title':
      return (
        <FramerParadigmTitle
          content={content as FramerParadigmTitleContent}
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
    case 'framer_large_quote':
      return (
        <FramerLargeQuote
          content={content as FramerLargeQuoteContent}
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
    case 'framer_horizontal_scroll':
      return (
        <FramerHorizontalScroll
          content={content as FramerHorizontalScrollContent}
          styles={styles}
          background={background}
          order={order}
          positions={positions}
          activeKey={activeKey}
        />
      );
    case 'framer_contact_footer':
      return (
        <FramerContactFooter
          content={content as FramerContactFooterContent}
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
    case 'framer_finnegan_expertise':
      return (
        <FramerFinneganExpertise
          content={content as FramerFinneganExpertiseContent}
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
    case 'framer_aestha_project_detail':
      return (
        <FramerAesthaProjectDetail
          content={content as FramerAesthaProjectDetailContent}
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
    case 'legacy_embed':
      return <LegacyEmbed content={content as LegacyEmbedContent} />;
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
