import { defaultContentFor } from './factory';
import type { Block, BlockType, HeroSplitContent } from './types';

const HERO_SPLIT_VI_OVERRIDE: HeroSplitContent = {
  eyebrow: 'FAMILY COLLECTION • 2025',
  title: 'Mang cả gia đình đến cùng',
  description:
    'Không gian riêng tư, an toàn cho trẻ và gần trường học, bệnh viện — giúp ngôi nhà thật sự là nơi cả gia đình muốn về sau mỗi cuối tuần.',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
  stats: [
    { value: '90 phút', label: 'thời gian thiết kế' },
    { value: 'Riêng tư', label: 'không gian riêng' },
    { value: 'Cho bé', label: 'lưu trữ kỷ niệm' },
  ],
  ctaText: '',
  ctaLink: '',
};

const HERO_SPLIT_EN_OVERRIDE: HeroSplitContent = {
  eyebrow: 'FAMILY COLLECTION • 2025',
  title: 'Bring the whole family along',
  description:
    'A private, child-safe home near schools and hospitals — where the family truly wants to come back every weekend.',
  imageUrl: HERO_SPLIT_VI_OVERRIDE.imageUrl,
  stats: [
    { value: '90 mins', label: 'design session' },
    { value: 'Private', label: 'family space' },
    { value: 'For kids', label: 'memory keepers' },
  ],
  ctaText: '',
  ctaLink: '',
};

const NAME_BY_TYPE: Record<BlockType, string> = {
  hero_split: 'Hero Split',
  hero_overlay: 'Hero Overlay',
  feature_section: 'Tiện ích nổi bật',
  photo_gallery: 'Thư viện ảnh',
  booking_form: 'Đặt chỗ',
  cta_section: 'CTA',
};

function buildBlock(id: string, type: BlockType): Block {
  return {
    id,
    blockType: type,
    name: NAME_BY_TYPE[type],
    contentVi: { desktop: defaultContentFor(type, 'vi') },
    contentEn: { desktop: defaultContentFor(type, 'en') },
    isVisible: true,
  };
}

export const MOCK_BLOCKS: Block[] = [
  {
    id: 'b1',
    blockType: 'hero_split',
    name: 'Hero Split',
    contentVi: { desktop: HERO_SPLIT_VI_OVERRIDE },
    contentEn: { desktop: HERO_SPLIT_EN_OVERRIDE },
    isVisible: true,
  },
  buildBlock('b2', 'hero_overlay'),
  buildBlock('b3', 'feature_section'),
  buildBlock('b4', 'photo_gallery'),
  buildBlock('b5', 'booking_form'),
  buildBlock('b6', 'cta_section'),
];
