'use client';
import { useMemo } from 'react';
import { useLocale } from '@/components/shared/locale-provider';
import {
  MediaPanelTrack,
  type TrackItem,
} from '@/components/shared/media-panel-track';

type SlideData = {
  src: string;
  alt: string;
  amenityIndex: number;
  tourUrl: string;
};

const slides: SlideData[] = [
  {
    src: '/images/assets/horizontal-slide/slide-1.webp',
    alt: 'The Place',
    amenityIndex: 0,
    tourUrl: 'https://themagnolia360.vistax.vn/?s=pano10&/tong-the-01.html',
  },
  {
    src: '/images/assets/horizontal-slide/slide-2.webp',
    alt: 'The Private Arrival',
    amenityIndex: 1,
    tourUrl:
      'https://themagnolia360.vistax.vn/?s=pano33273&/sanh-don-tiep-pavillion.html',
  },
  {
    src: '/images/assets/horizontal-slide/slide-3.webp',
    alt: 'The Pavilion Lobby',
    amenityIndex: 2,
    tourUrl:
      'https://themagnolia360.vistax.vn/?s=pano36996&/sanh-don-tiep-pavillion.html',
  },
  {
    src: '/images/assets/horizontal-slide/slide-4.webp',
    alt: 'The Car Gallery',
    amenityIndex: 3,
    tourUrl:
      'https://themagnolia360.vistax.vn/?s=pano36994&/khu-trung-bay-sieu-xe-tang-b1.html',
  },
  {
    src: '/images/assets/horizontal-slide/slide-5.webp',
    alt: 'The Vertical Garden',
    amenityIndex: 4,
    tourUrl:
      'https://themagnolia360.vistax.vn/?s=pano36997&/vuon-rieng-tang-5.html',
  },
];

/**
 * Image journey. The composition comes from the rexerai block `the_grand_service`; see
 * components/shared/media-panel-track.tsx for what it borrows and why.
 *
 * The descriptions shown here exist in the dictionary for all five amenities in both languages
 * and were never rendered by the original site. Without them the section is five nouns.
 */
export function HorizontalSlideSection() {
  const { t } = useLocale();

  const items: TrackItem[] = useMemo(
    () =>
      slides.map(slide => ({
        key: slide.src,
        src: slide.src,
        alt: t.amenities.items[slide.amenityIndex]?.title ?? slide.alt,
        title: t.amenities.items[slide.amenityIndex]?.title ?? slide.alt,
        body: t.amenities.items[slide.amenityIndex]?.body,
        cta: t.amenities.explore,
        href: slide.tourUrl,
      })),
    [t]
  );

  return (
    <section
      id='horizontal-slide'
      aria-label='The Magnolia image journey'
      className='bg-charcoal-950 relative snap-start max-md:py-16'
    >
      <MediaPanelTrack items={items} chip={t.amenities.eyebrow} />
    </section>
  );
}
