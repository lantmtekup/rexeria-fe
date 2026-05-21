import type {
  Block,
  BlockContent,
  BlockType,
  BookingFormContent,
  Carousel3dContent,
  CtaSectionContent,
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

// ── Stories ─────────────────────────────────────────────────────────────
const STORIES_VI: StoriesContent = {
  eyebrow: 'KHÁM PHÁ',
  title: 'Câu chuyện dự án',
  slides: [
    {
      id: 'st1',
      mediaUrl: HOUSE_IMG,
      mediaType: 'image',
      title: 'Mặt tiền sang trọng',
      body: 'Kiến trúc châu Âu hiện đại pha trộn nét Á Đông.',
    },
    {
      id: 'st2',
      mediaUrl: ROOM_IMG,
      mediaType: 'image',
      title: 'Phòng khách view sông',
      body: 'Cửa kính lớn đón trọn ánh sáng tự nhiên.',
    },
    {
      id: 'st3',
      mediaUrl: POOL_IMG,
      mediaType: 'image',
      title: 'Hồ bơi vô cực',
      body: 'Thư giãn giữa lòng thành phố.',
      ctaText: 'Đăng ký xem',
      ctaUrl: '#',
    },
  ],
  defaultDurationMs: 4500,
  loop: true,
  showProgress: true,
};
const STORIES_EN: StoriesContent = {
  eyebrow: 'EXPLORE',
  title: 'Project stories',
  slides: STORIES_VI.slides.map(s => ({
    ...s,
    title:
      s.id === 'st1'
        ? 'Elegant façade'
        : s.id === 'st2'
          ? 'Living room'
          : 'Infinity pool',
    body:
      s.id === 'st1'
        ? 'Modern European architecture with Asian accents.'
        : s.id === 'st2'
          ? 'Large glass windows for natural light.'
          : 'Relax in the heart of the city.',
    ctaText: s.ctaText ? 'Book a tour' : undefined,
  })),
  defaultDurationMs: 4500,
  loop: true,
  showProgress: true,
};

// ── Split Screen ────────────────────────────────────────────────────────
const SPLIT_VI: SplitScreenContent = {
  eyebrow: 'SO SÁNH',
  title: 'Hai phong cách, một dự án',
  description: 'Chọn loại căn hộ phù hợp với gia đình bạn.',
  views: [
    {
      id: 'sv1',
      label: 'Căn duplex',
      imageUrl: ROOM_IMG,
      title: 'Duplex 120m²',
      body: '2 tầng riêng tư, ban công rộng, phù hợp gia đình 4-5 người.',
      ctaText: 'Xem chi tiết',
      ctaUrl: '#',
    },
    {
      id: 'sv2',
      label: 'Căn studio',
      imageUrl: KITCHEN_IMG,
      title: 'Studio 45m²',
      body: 'Nhỏ gọn, sang trọng — lý tưởng cho người độc thân.',
      ctaText: 'Xem chi tiết',
      ctaUrl: '#',
    },
  ],
  defaultIndex: 0,
};
const SPLIT_EN: SplitScreenContent = {
  eyebrow: 'COMPARE',
  title: 'Two styles, one project',
  description: 'Pick the apartment type that fits your family.',
  views: SPLIT_VI.views.map((v, i) => ({
    ...v,
    label: i === 0 ? 'Duplex unit' : 'Studio',
    title: i === 0 ? '120m² duplex' : '45m² studio',
    body:
      i === 0
        ? 'Two private floors, wide balcony — perfect for families.'
        : 'Compact and elegant — ideal for singles.',
    ctaText: 'View detail',
  })),
  defaultIndex: 0,
};

// ── Quiz ────────────────────────────────────────────────────────────────
const QUIZ_VI: QuizContent = {
  eyebrow: 'TRẮC NGHIỆM',
  title: 'Căn hộ nào phù hợp với bạn?',
  description: 'Trả lời 3 câu hỏi nhanh để nhận gợi ý.',
  questions: [
    {
      id: 'q1',
      prompt: 'Gia đình bạn có bao nhiêu người?',
      options: [
        { id: 'q1a', label: '1-2 người', score: 1 },
        { id: 'q1b', label: '3-4 người', score: 3 },
        { id: 'q1c', label: '5+ người', score: 5 },
      ],
    },
    {
      id: 'q2',
      prompt: 'Bạn ưu tiên điều gì nhất?',
      options: [
        { id: 'q2a', label: 'View đẹp', score: 2 },
        { id: 'q2b', label: 'Diện tích rộng', score: 4 },
        { id: 'q2c', label: 'Giá hợp lý', score: 1 },
      ],
    },
    {
      id: 'q3',
      prompt: 'Ngân sách của bạn?',
      options: [
        { id: 'q3a', label: 'Dưới 2 tỷ', score: 1 },
        { id: 'q3b', label: '2-4 tỷ', score: 3 },
        { id: 'q3c', label: 'Trên 4 tỷ', score: 5 },
      ],
    },
  ],
  results: [
    {
      id: 'r1',
      minScore: 0,
      title: 'Studio nhỏ gọn',
      body: 'Phù hợp với người độc thân hoặc cặp đôi trẻ.',
      imageUrl: KITCHEN_IMG,
      ctaText: 'Xem studio',
      ctaUrl: '#',
    },
    {
      id: 'r2',
      minScore: 7,
      title: 'Căn 2 phòng ngủ',
      body: 'Đủ không gian cho gia đình nhỏ.',
      imageUrl: ROOM_IMG,
      ctaText: 'Xem căn 2PN',
      ctaUrl: '#',
    },
    {
      id: 'r3',
      minScore: 11,
      title: 'Duplex / Penthouse',
      body: 'Đẳng cấp cho gia đình lớn.',
      imageUrl: HOUSE_IMG,
      ctaText: 'Xem penthouse',
      ctaUrl: '#',
    },
  ],
  nextLabel: 'Tiếp',
  finishLabel: 'Xem kết quả',
};
const QUIZ_EN: QuizContent = {
  ...QUIZ_VI,
  eyebrow: 'QUIZ',
  title: 'Which apartment suits you?',
  description: 'Answer 3 quick questions for a tailored suggestion.',
  nextLabel: 'Next',
  finishLabel: 'See result',
};

// ── Poll ────────────────────────────────────────────────────────────────
const POLL_VI: PollContent = {
  eyebrow: 'BÌNH CHỌN',
  question: 'Bạn ưu tiên tiện ích nào nhất?',
  options: [
    { id: 'po1', label: 'Hồ bơi vô cực', baseVotes: 142 },
    { id: 'po2', label: 'Phòng gym + spa', baseVotes: 98 },
    { id: 'po3', label: 'Công viên 2ha', baseVotes: 176 },
    { id: 'po4', label: 'Khu vui chơi trẻ em', baseVotes: 87 },
  ],
  hideResultsUntilVoted: true,
  voteLabel: 'Bình chọn',
  thankYouText: 'Cảm ơn bạn đã bình chọn!',
};
const POLL_EN: PollContent = {
  ...POLL_VI,
  eyebrow: 'VOTE',
  question: 'Which amenity do you value most?',
  options: POLL_VI.options.map((o, i) => ({
    ...o,
    label:
      ['Infinity pool', 'Gym + spa', '2ha park', 'Kids zone'][i] ?? o.label,
  })),
  voteLabel: 'Vote',
  thankYouText: 'Thanks for voting!',
};

// ── Carousel 3D ─────────────────────────────────────────────────────────
const CAROUSEL_3D_VI: Carousel3dContent = {
  ...CAROUSEL_VI,
  mode3d: '3d-coverflow',
  perspectivePx: 1200,
};
const CAROUSEL_3D_EN: Carousel3dContent = {
  ...CAROUSEL_EN,
  mode3d: '3d-coverflow',
  perspectivePx: 1200,
};

// ── Flipbook ────────────────────────────────────────────────────────────
const FLIPBOOK_VI: FlipbookContent = {
  eyebrow: 'BROCHURE',
  title: 'Lật để xem trọn dự án',
  pages: [
    { id: 'fp1', imageUrl: HOUSE_IMG, caption: 'Mặt tiền dự án' },
    { id: 'fp2', imageUrl: ROOM_IMG, caption: 'Phòng khách' },
    { id: 'fp3', imageUrl: KITCHEN_IMG, caption: 'Phòng bếp' },
    { id: 'fp4', imageUrl: POOL_IMG, caption: 'Hồ bơi' },
    { id: 'fp5', imageUrl: GARDEN_IMG, caption: 'Sân vườn' },
  ],
  aspect: '3/4',
  showPageNumbers: true,
};
const FLIPBOOK_EN: FlipbookContent = {
  ...FLIPBOOK_VI,
  eyebrow: 'BROCHURE',
  title: 'Flip through the full project',
  pages: FLIPBOOK_VI.pages.map((p, i) => ({
    ...p,
    caption: ['Project façade', 'Living room', 'Kitchen', 'Pool', 'Garden'][i],
  })),
};

// ── Panorama ────────────────────────────────────────────────────────────
const PANORAMA_VI: PanoramaContent = {
  eyebrow: 'KHÁM PHÁ 360°',
  title: 'Tham quan ảo dự án',
  description: 'Kéo ngang để xoay góc nhìn — chạm hotspot để xem chi tiết.',
  // Equirectangular sample from Unsplash (2:1 ratio). Real projects supply
  // their own pano (drone shot stitched 360).
  imageUrl:
    'https://images.unsplash.com/photo-1707343843598-39755549ac9a?auto=format&fit=crop&w=2400&q=80',
  initialYaw: 0,
  sensitivity: 1,
  hint: 'Kéo để xoay',
};
const PANORAMA_EN: PanoramaContent = {
  ...PANORAMA_VI,
  eyebrow: 'EXPLORE 360°',
  title: 'Virtual project tour',
  description:
    'Drag horizontally to rotate the view — tap hotspots for detail.',
  hint: 'Drag to rotate',
};

const NAME_BY_TYPE: Record<BlockType, string> = {
  hero_split: 'Hero Split',
  hero_overlay: 'Hero Overlay',
  feature_section: 'Tiện ích nổi bật',
  photo_gallery: 'Thư viện ảnh',
  booking_form: 'Đặt chỗ',
  cta_section: 'CTA',
  image_carousel: 'Slide ảnh',
  stories: 'Stories',
  split_screen: 'Split screen',
  quiz: 'Quiz',
  poll: 'Bình chọn',
  carousel_3d: 'Coverflow 3D',
  flipbook: 'Flipbook',
  panorama: 'Panorama 360°',
};

const DEFAULTS_VI: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_VI,
  hero_overlay: HERO_OVERLAY_VI,
  feature_section: FEATURE_VI,
  photo_gallery: GALLERY_VI,
  booking_form: BOOKING_VI,
  cta_section: CTA_VI,
  image_carousel: CAROUSEL_VI,
  stories: STORIES_VI,
  split_screen: SPLIT_VI,
  quiz: QUIZ_VI,
  poll: POLL_VI,
  carousel_3d: CAROUSEL_3D_VI,
  flipbook: FLIPBOOK_VI,
  panorama: PANORAMA_VI,
};
const DEFAULTS_EN: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_EN,
  hero_overlay: HERO_OVERLAY_EN,
  feature_section: FEATURE_EN,
  photo_gallery: GALLERY_EN,
  booking_form: BOOKING_EN,
  cta_section: CTA_EN,
  image_carousel: CAROUSEL_EN,
  stories: STORIES_EN,
  split_screen: SPLIT_EN,
  quiz: QUIZ_EN,
  poll: POLL_EN,
  carousel_3d: CAROUSEL_3D_EN,
  flipbook: FLIPBOOK_EN,
  panorama: PANORAMA_EN,
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
