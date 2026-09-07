/**
 * Default + normalizer cho block `lecool_showcase`.
 *
 * Canvas, LayersPanel và ElementToolbar phải đọc CÙNG normalizer này, nếu không
 * số slot trong panel Lớp sẽ lệch với số node trên canvas.
 */
import type { LecoolShowcaseCard, LecoolShowcaseContent } from '../types';

export const DEFAULT_SHOWCASE_CARDS: LecoolShowcaseCard[] = [
  {
    // Cùng file với vương miện của Hero (apps để 2 bản trùng byte ở 2 thư mục).
    emblemUrl: '/lecool/hero-emblem.png',
    emblemWidth: 300,
    isCrown: true,
    images: [
      {
        imageUrl: '/lecool/showcase/image-1.png',
        alt: 'Le Cool Move — three-quarter view',
        title:
          'Some bags carry essentials. Others improve the atmosphere slighty.',
      },
      {
        imageUrl: '/lecool/showcase/image-2.png',
        alt: 'Le Cool Move — front view',
      },
    ],
  },
  {
    emblemUrl: '/lecool/showcase/logo.svg',
    emblemWidth: 232,
    captionLines: ['With love,', 'From the Kingdom', 'of Belgium'],
    images: [
      {
        imageUrl: '/lecool/showcase/image-3.png',
        alt: 'Le Cool Move — strap detail from above',
      },
      {
        imageUrl: '/lecool/showcase/image-4.jpg',
        alt: 'Le Cool Move — carried cross-body',
      },
    ],
  },
];

export function resolveShowcaseCards(
  content: LecoolShowcaseContent
): LecoolShowcaseCard[] {
  const raw = content.cards;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_SHOWCASE_CARDS;
  return raw.map(card =>
    card && typeof card === 'object' ? card : ({} as LecoolShowcaseCard)
  );
}
