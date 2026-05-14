import * as React from 'react';

import { BookingForm } from './BookingForm';
import { CtaSection } from './CtaSection';
import { FeatureSection } from './FeatureSection';
import { HeroOverlay } from './HeroOverlay';
import { HeroSplit } from './HeroSplit';
import { ImageCarousel } from './ImageCarousel';
import { PhotoGallery } from './PhotoGallery';
import type {
  Block,
  BlockBackground,
  BlockContent,
  BookingFormContent,
  CtaSectionContent,
  ElementPositionsMap,
  ElementStylesMap,
  FeatureSectionContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  PhotoGalleryContent,
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
