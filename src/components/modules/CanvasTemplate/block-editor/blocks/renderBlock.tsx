import * as React from 'react';

import { BookingForm } from './BookingForm';
import { Carousel3d } from './Carousel3d';
import { CtaSection } from './CtaSection';
import { FeatureSection } from './FeatureSection';
import { Flipbook } from './Flipbook';
import { HeroOverlay } from './HeroOverlay';
import { HeroSplit } from './HeroSplit';
import { ImageCarousel } from './ImageCarousel';
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
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
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
