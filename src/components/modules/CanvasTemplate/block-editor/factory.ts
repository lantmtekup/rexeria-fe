import type {
  Block,
  BlockContent,
  BlockType,
  BookingFormContent,
  CtaSectionContent,
  FeatureSectionContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  PhotoGalleryContent,
} from './types';

const HOUSE_IMG =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80';
const ROOM_IMG =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80';
const KITCHEN_IMG =
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=80';
const POOL_IMG =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80';
const GARDEN_IMG =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80';

// ── Hero Split ──────────────────────────────────────────────────────────
const HERO_SPLIT_VI: HeroSplitContent = {
  eyebrow: 'COLLECTION • 2025',
  title: 'Tiêu đề block mới',
  description: 'Mô tả ngắn về block — sẽ hiển thị bên dưới tiêu đề.',
  imageUrl: HOUSE_IMG,
  stats: [
    { value: 'Số 1', label: 'thông số' },
    { value: 'Số 2', label: 'thông số' },
    { value: 'Số 3', label: 'thông số' },
  ],
  ctaText: '',
  ctaLink: '',
};
const HERO_SPLIT_EN: HeroSplitContent = {
  eyebrow: 'COLLECTION • 2025',
  title: 'New block title',
  description: 'Short block description — shown below the headline.',
  imageUrl: HOUSE_IMG,
  stats: [
    { value: 'Stat 1', label: 'metric' },
    { value: 'Stat 2', label: 'metric' },
    { value: 'Stat 3', label: 'metric' },
  ],
  ctaText: '',
  ctaLink: '',
};

// ── Hero Overlay ────────────────────────────────────────────────────────
const HERO_OVERLAY_VI: HeroOverlayContent = {
  tag: 'Dự án mới',
  title: 'Tận hưởng cuộc sống đẳng cấp',
  subtitle:
    'Không gian xanh, tiện ích tích hợp, vị trí trung tâm — tất cả trong một dự án.',
  ctaText: 'Đăng ký xem mẫu',
  ctaLink: '#',
  backgroundUrl: HOUSE_IMG,
};
const HERO_OVERLAY_EN: HeroOverlayContent = {
  tag: 'New project',
  title: 'Live the elevated life',
  subtitle:
    'Green spaces, integrated amenities, central location — all in one project.',
  ctaText: 'Book a tour',
  ctaLink: '#',
  backgroundUrl: HOUSE_IMG,
};

// ── Feature Section ─────────────────────────────────────────────────────
const FEATURE_VI: FeatureSectionContent = {
  eyebrow: 'TIỆN ÍCH NỔI BẬT',
  title: 'Sống xanh, sống đẳng cấp mỗi ngày',
  description:
    'Hệ tiện ích tích hợp ngay trong dự án giúp gia đình bạn cân bằng giữa công việc, nghỉ dưỡng và chăm sóc con cái.',
  features: [
    {
      icon: 'Trees' in {} ? 'TreePine' : 'TreePine',
      label: 'Công viên 2 ha',
      body: 'Mảng xanh trung tâm cho cả gia đình thư giãn và rèn luyện.',
    },
    {
      icon: 'Waves',
      label: 'Hồ bơi vô cực',
      body: 'View toàn cảnh, tách biệt khu trẻ em và người lớn.',
    },
    {
      icon: 'ShieldCheck',
      label: 'An ninh 24/7',
      body: 'Hệ thống camera AI và bảo vệ tuần tra liên tục.',
    },
    {
      icon: 'Sparkles',
      label: 'Tiện ích cao cấp',
      body: 'Phòng gym, spa, lounge — không cần ra khỏi dự án.',
    },
  ],
};
const FEATURE_EN: FeatureSectionContent = {
  eyebrow: 'KEY AMENITIES',
  title: 'Live green, live elevated every day',
  description:
    'Integrated amenities help your family balance work, leisure and family time.',
  features: [
    {
      icon: 'TreePine',
      label: '2 ha park',
      body: 'Central greenery for relaxation and exercise.',
    },
    {
      icon: 'Waves',
      label: 'Infinity pool',
      body: 'Panoramic view, separate kids zone.',
    },
    {
      icon: 'ShieldCheck',
      label: '24/7 security',
      body: 'AI cameras + on-site guards round the clock.',
    },
    {
      icon: 'Sparkles',
      label: 'Premium amenities',
      body: 'Gym, spa, lounge — never leave the project.',
    },
  ],
};

// ── Photo Gallery ───────────────────────────────────────────────────────
const GALLERY_VI: PhotoGalleryContent = {
  eyebrow: 'THƯ VIỆN ẢNH',
  title: 'Không gian sống thực tế',
  description:
    'Hình ảnh thực tế từ căn hộ mẫu — bàn giao nội thất hoàn thiện cao cấp.',
  photos: [
    { url: HOUSE_IMG, caption: 'Mặt ngoài' },
    { url: ROOM_IMG, caption: 'Phòng khách' },
    { url: KITCHEN_IMG, caption: 'Bếp & bàn ăn' },
    { url: POOL_IMG, caption: 'Hồ bơi vô cực' },
    { url: GARDEN_IMG, caption: 'Vườn cảnh' },
  ],
};
const GALLERY_EN: PhotoGalleryContent = {
  eyebrow: 'PHOTO GALLERY',
  title: 'Real living spaces',
  description:
    'Photos from the show unit — handed over with premium furnished interiors.',
  photos: [
    { url: HOUSE_IMG, caption: 'Exterior' },
    { url: ROOM_IMG, caption: 'Living room' },
    { url: KITCHEN_IMG, caption: 'Kitchen & dining' },
    { url: POOL_IMG, caption: 'Infinity pool' },
    { url: GARDEN_IMG, caption: 'Garden' },
  ],
};

// ── Booking Form ────────────────────────────────────────────────────────
const BOOKING_VI: BookingFormContent = {
  eyebrow: 'ĐẶT CHỖ ƯU TIÊN',
  title: 'Giữ chỗ căn hộ trước người khác',
  description:
    'Để lại thông tin, chuyên viên sẽ gọi lại trong 15 phút và gửi tài liệu chi tiết.',
  reasons: [
    { value: '15’', label: 'Phản hồi nhanh' },
    { value: '2.4 tỷ', label: 'Giá khởi điểm' },
    { value: '0%', label: 'Phí giữ chỗ' },
    { value: 'Q4/2026', label: 'Bàn giao' },
  ],
  submitText: 'Đăng ký giữ chỗ',
  noteText:
    'Bằng cách gửi form, bạn đồng ý với chính sách bảo mật của chúng tôi.',
};
const BOOKING_EN: BookingFormContent = {
  eyebrow: 'PRIORITY BOOKING',
  title: 'Reserve your unit before anyone else',
  description:
    'Leave your info — our consultant calls back within 15 minutes with full docs.',
  reasons: [
    { value: '15 min', label: 'Quick reply' },
    { value: '$96k', label: 'Starting price' },
    { value: '0%', label: 'Reservation fee' },
    { value: 'Q4/2026', label: 'Handover' },
  ],
  submitText: 'Reserve my unit',
  noteText: 'By submitting you agree to our privacy policy.',
};

// ── CTA Section ─────────────────────────────────────────────────────────
const CTA_VI: CtaSectionContent = {
  eyebrow: 'SẴN SÀNG?',
  title: 'Đến tham quan căn hộ mẫu cuối tuần này',
  subtitle:
    'Có shuttle đưa đón từ trung tâm Sài Gòn. Đặt lịch trước để nhận quà tặng.',
  primaryText: 'Đặt lịch tham quan',
  primaryLink: '#booking',
  secondaryText: 'Tải brochure PDF',
  secondaryLink: '#',
  backgroundUrl: HOUSE_IMG,
};
const CTA_EN: CtaSectionContent = {
  eyebrow: 'READY?',
  title: 'Tour the show unit this weekend',
  subtitle: 'Free shuttle from downtown. Book ahead for a welcome gift.',
  primaryText: 'Schedule a tour',
  primaryLink: '#booking',
  secondaryText: 'Download brochure',
  secondaryLink: '#',
  backgroundUrl: HOUSE_IMG,
};

// ── Block name + defaults registry ──────────────────────────────────────
const CAROUSEL_VI: ImageCarouselContent = {
  eyebrow: 'BỘ SƯU TẬP',
  title: 'Khám phá không gian sống',
  description: 'Trượt qua các thiết kế nổi bật của dự án.',
  slides: [
    {
      id: 's1',
      imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      caption: 'Phòng khách view sông',
    },
    {
      id: 's2',
      imageUrl:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80',
      caption: 'Sảnh đôi 12m',
    },
    {
      id: 's3',
      imageUrl:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      caption: 'Tiện ích cao cấp',
    },
  ],
  autoplayMs: 4500,
  showPagination: true,
  showNavArrows: true,
};

const CAROUSEL_EN: ImageCarouselContent = {
  eyebrow: 'COLLECTION',
  title: 'Discover the living space',
  description: 'Swipe through the highlights of the project.',
  slides: CAROUSEL_VI.slides,
  autoplayMs: 4500,
  showPagination: true,
  showNavArrows: true,
};

const NAME_BY_TYPE: Record<BlockType, string> = {
  hero_split: 'Hero Split',
  hero_overlay: 'Hero Overlay',
  feature_section: 'Tiện ích nổi bật',
  photo_gallery: 'Thư viện ảnh',
  booking_form: 'Đặt chỗ',
  cta_section: 'CTA',
  image_carousel: 'Slide ảnh',
};

const DEFAULTS_VI: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_VI,
  hero_overlay: HERO_OVERLAY_VI,
  feature_section: FEATURE_VI,
  photo_gallery: GALLERY_VI,
  booking_form: BOOKING_VI,
  cta_section: CTA_VI,
  image_carousel: CAROUSEL_VI,
};
const DEFAULTS_EN: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_EN,
  hero_overlay: HERO_OVERLAY_EN,
  feature_section: FEATURE_EN,
  photo_gallery: GALLERY_EN,
  booking_form: BOOKING_EN,
  cta_section: CTA_EN,
  image_carousel: CAROUSEL_EN,
};

function genId() {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

export function createBlock(type: BlockType): Block {
  // New blocks start with `mobile` undefined so the renderer falls back to
  // `desktop`. User customizes mobile later via the Mobile device toggle.
  return {
    id: genId(),
    blockType: type,
    name: NAME_BY_TYPE[type],
    contentVi: { desktop: structuredClone(DEFAULTS_VI[type]) },
    contentEn: { desktop: structuredClone(DEFAULTS_EN[type]) },
    isVisible: true,
  };
}

export function defaultContentFor(
  type: BlockType,
  lang: 'vi' | 'en'
): BlockContent {
  return structuredClone(lang === 'vi' ? DEFAULTS_VI[type] : DEFAULTS_EN[type]);
}
