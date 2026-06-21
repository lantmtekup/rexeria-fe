import { BLOCK_TYPE_META } from './types';
import { MEDIA, pickMedia } from './blocks/sample-media';
import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';
import type {
  Block,
  BlockContent,
  BlockType,
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
  FeatureSectionContent,
  FlipbookContent,
  FramerArpeggioHeroContent,
  FramerAvexaHeroContent,
  FramerMobiusHeroContent,
  FramerBungeeHeroContent,
  FramerDelvauxHeroIntroContent,
  FramerExploreCtaContent,
  FramerHeroContent,
  FramerPerformHeroContent,
  FramerPerformHeroV2Content,
  FramerIntroRedefinedContent,
  FramerHorizontalScrollContent,
  FramerImageStaggerContent,
  FramerLargeQuoteContent,
  FramerParadigmTitleContent,
  FramerProjectsGridContent,
  FramerStatsGridContent,
  FramerTeamDirectoryContent,
  FramerStudioManifestoContent,
  FramerYumeHeroContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  PanoramaContent,
  TextDisplaceHeroContent,
  ImageTrailContent,
  StickyScrollCardsContent,
  Gallery3dDepthContent,
  ParallaxHeroContent,
  LightboxFlipContent,
  FlipGalleryContent,
  WheelGalleryContent,
  HoverRevealListContent,
  HoverGridRevealContent,
  HoverEqualizerHeadingContent,
  ImageExplosionContent,
  CardShowcaseContent,
  StorySlidesContent,
  FlipShowreelContent,
  PeelRevealContent,
  AccordionMediaContent,
  PricingTableContent,
  ImageBannerContent,
  VideoGalleryContent,
  SpotlightContent,
  ProcessStepsContent,
  DotMatrixContent,
  InteractiveGridContent,
  PixelRevealContent,
  MarqueeBandContent,
  LetterSliderContent,
  SvgMorphOverlayContent,
  GalleryPanLensContent,
  SeamlessScrollGalleryContent,
  ProductSpecSheetContent,
  PhotoGalleryContent,
  PollContent,
  QuizContent,
  SplitScreenContent,
  StoriesContent,
  FramerContactFooterContent,
  FramerFaqMinimalContent,
  FramerFinneganExpertiseContent,
  FramerDarlingTimelineContent,
  FramerSignatureFeatureContent,
  FramerVsCollinsProjectsContent,
  FramerAvexaBentoContent,
  FramerClarityServicesContent,
  FramerVeloraServicesContent,
  FramerFirmaFeaturedContent,
  FramerAesthaEditorialContent,
  FramerAesthaProjectDetailContent,
  FramerPerformAboutContent,
  FramerPerformPricingContent,
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
// Mint-coint port — default = brand text gốc (xem templates/mint-coint/lib/content.ts).
const MINT_DETAILS_VI: MintDetailsContent = {
  title: 'The Jack Pine',
  paragraph1:
    "A 1006.1 g, 99.99% pure gold proof coin from the Royal Canadian Mint — a monumental tribute to Tom Thomson's iconic 1916–17 landscape, struck in a mintage of just 75 worldwide. The reverse captures the lone, windswept pine rising against a sunset over an Ontario lake; the obverse bears Steven Rosati's effigy of His Majesty King Charles III.",
  paragraph2:
    "101.6 mm in diameter with a serrated edge and $2,500 face value. Encapsulated in a Royal Canadian Mint wooden case with black beauty box and serialised certificate — a piece of Canada's cultural heritage rendered in pure gold.",
};
const MINT_SKU_VI: MintSkuContent = {
  title: 'The Jack Pine 1 kilo',
  paintingUrl:
    'https://d10zufojjcedud.cloudfront.net/coin-nextjs/jackpine-painting.webp',
  packagingUrl:
    'https://d10zufojjcedud.cloudfront.net/coin-nextjs/coin-packaging.webp',
};
const MINT_HERO_VI: MintHeroContent = {
  heroLine1: 'The Jack Pine',
  heroLine2: 'by Tom Thomson',
  heroLine3: '1 kilo Pure Gold Coin',
};
const MINT_VARIANTS_VI: MintVariantsContent = {
  titleLine1: '99.99%',
  titleLine2: 'Pure Gold',
  variants: [
    {
      key: 'reverse',
      label: 'Reverse',
      ref: 'rcm-252469',
      swatch: MINT_IMG.coinReverse,
      image: MINT_IMG.coinReverse,
    },
    {
      key: 'obverse',
      label: 'Obverse',
      ref: 'rcm-252469',
      swatch: MINT_IMG.coinObverse,
      image: MINT_IMG.coinObverse,
    },
    {
      key: 'packaging',
      label: 'Packaging',
      ref: 'rcm-252469',
      swatch: MINT_IMG.coinPackaging,
      image: MINT_IMG.coinPackaging,
    },
  ],
};
const MINT_DISCOVER_VI: MintDiscoverContent = {
  variant: '1',
  mainImage: MINT_IMG.coinReverse,
  mainAlt: 'Jack Pine Gold Coin — reverse',
  tabs: [
    {
      key: 'tab1',
      label: 'The Lone Pine',
      desc: "Tom Thomson's windswept jack pine, rising from rocky ground above a northern lake. The kilo-sized canvas lifts every needle, branch and crag into 99.99% pure gold relief.",
      img: MINT_IMG.coinReverse,
      dotX: 50,
      dotY: 30,
    },
    {
      key: 'tab2',
      label: 'Sky and Water',
      desc: "A monochromatic field of polished and frosted gold replaces the painting's sunset palette, deepening the impact of Thomson's dynamic composition.",
      img: MINT_IMG.coinReverse,
      dotX: 62,
      dotY: 62,
    },
    {
      key: 'tab3',
      label: 'Serrated Edge',
      desc: '101.6 mm in diameter with a serrated edge — a tactile signature of Royal Canadian Mint craftsmanship at this scale.',
      img: MINT_IMG.coinReverse,
      dotX: 38,
      dotY: 62,
    },
  ],
};

// ── Mintcoin-v2 defaults (nội dung gốc English, dùng chung VI/EN) ─────────
const MINTV2_FRAME48 =
  'https://d10zufojjcedud.cloudfront.net/coin-nextjs/frames/frame-048.webp';

const MINTV2_EMBLEM_VI: MintV2EmblemContent = {
  title: 'The Jack Pine',
  description: 'A 1006.1 g, 99.99% pure gold proof coin. Mintage 75 worldwide.',
  coinUrl: MINT_IMG.coinObverse,
  decorUrl: MINT_IMG.painting,
};

const MINTV2_SERVICES_VI: MintV2ServicesContent = {
  eyebrow: 'Two Dimensions',
  title: 'HERITAGE & CRAFT',
  items: [
    {
      key: 'thomson',
      label: 'Tom Thomson Heritage',
      preview: MINT_IMG.painting,
      caption: 'Painted 1916–17, Algonquin Park',
    },
    {
      key: 'engraving',
      label: 'Engraving Craft',
      preview: MINT_IMG.coinReverse,
      caption: 'Master engravers · hand-finished relief',
    },
    {
      key: 'gold',
      label: '99.99% Pure Gold',
      preview: MINTV2_FRAME48,
      caption: '1006.1 g · .99999 fineness',
    },
    {
      key: 'mintage',
      label: 'Limited Mintage 75',
      preview: MINT_IMG.coinPackaging,
      caption: 'Each coin individually serialised',
    },
    {
      key: 'effigy',
      label: 'King Charles III Effigy',
      preview: MINT_IMG.coinObverse,
      caption: 'By Canadian artist Steven Rosati',
    },
  ],
};

const MINTV2_MANIFESTO_VI: MintV2ManifestoContent = {
  text: 'Forged in 99.99% pure Canadian gold — mastery in every detail, artistry in every strike. We refine, we honour, we endure.',
};

const MINTV2_PROCESS_VI: MintV2ProcessContent = {
  eyebrow: 'The Making',
  title: 'From Brush to Strike',
  steps: [
    {
      key: 's1',
      no: '01',
      title: 'The Painting',
      body: 'Tom Thomson paints The Jack Pine at Algonquin Park, capturing a windswept tree above an Ontario lake (1916–17).',
    },
    {
      key: 's2',
      no: '02',
      title: 'Engraving Sketch',
      body: 'RCM master engravers translate the brushwork into millimetric relief — every needle, crag, and ripple plotted by hand.',
    },
    {
      key: 's3',
      no: '03',
      title: 'Die Cutting',
      body: "Reverse and obverse dies are CNC-cut to the engraver's spec, then hand-finished for proof-level polish and frost zones.",
    },
    {
      key: 's4',
      no: '04',
      title: 'The Strike',
      body: '1006.1 g of .99999 fine gold blanks are struck under specialised dies designed for kilo-scale coins. Multiple strikes ensure relief depth.',
    },
    {
      key: 's5',
      no: '05',
      title: 'Presentation',
      body: 'Each coin is encapsulated and presented in a Royal Canadian Mint–branded wooden case with black beauty box and serialised certificate.',
    },
  ],
};

const MINTV2_CTA_VI: MintV2CtaContent = {
  eyebrow: 'Mintage 75 Worldwide',
  title: 'Reserve Yours',
  description:
    'Leave your details and an advisor will reach out to secure your allocation before the edition closes — a 1006.1 g, 99.99% pure gold proof coin.',
  buyLabel: 'Or buy directly online →',
  buyUrl:
    'https://www.mint.ca/en/shop/coins/2026/the-jack-pine-by-tom-thomson-1-kilo-pure-gold-coin',
  contacts: [
    {
      key: 'c1',
      label: 'Customer Service',
      value: '1-800-267-1871 · Mon–Fri 8:30 am – 6 pm ET',
    },
    {
      key: 'c2',
      label: 'Mailing Address',
      value: 'Royal Canadian Mint, 320 Sussex Drive, Ottawa K1A 0G8',
    },
  ],
};

const MINTV2_CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const mintv2Frame = (n: number) =>
  `${MINTV2_CDN}/frames/frame-${String(n).padStart(3, '0')}.webp`;

const MINTV2_WORKS_VI: MintV2WorksContent = {
  eyebrow: 'The Details',
  title: 'Forged in Gold',
  cards: [
    {
      key: 'w1',
      number: '01',
      jpLabel: 'I',
      category: 'Engraving Detail',
      title: 'LONE PINE',
      hero: MINT_IMG.coinObverse,
      backdrop: MINT_IMG.coinObverse,
      thumbs: [
        MINT_IMG.coinObverse,
        mintv2Frame(12),
        mintv2Frame(36),
        MINT_IMG.painting,
      ],
      bgClass: 'bg-[#efe9dc]',
    },
    {
      key: 'w2',
      number: '02',
      jpLabel: 'II',
      category: 'Polish Finish',
      title: 'SKY & WATER',
      hero: MINT_IMG.coinReverse,
      backdrop: MINT_IMG.coinReverse,
      thumbs: [
        MINT_IMG.coinReverse,
        mintv2Frame(48),
        mintv2Frame(72),
        MINT_IMG.painting,
      ],
      bgClass: 'bg-[#efe9dc]',
    },
    {
      key: 'w3',
      number: '03',
      jpLabel: 'III',
      category: 'Die Geometry',
      title: 'SERRATED EDGE',
      hero: mintv2Frame(84),
      backdrop: MINT_IMG.painting,
      thumbs: [
        mintv2Frame(6),
        mintv2Frame(28),
        mintv2Frame(84),
        MINT_IMG.coinPackaging,
      ],
      bgClass: 'bg-[#efe9dc]',
    },
    {
      key: 'w4',
      number: '04',
      jpLabel: 'IV',
      category: 'Effigy Portrait',
      title: 'CHARLES III',
      hero: MINT_IMG.coinPackaging,
      backdrop: MINT_IMG.coinPackaging,
      thumbs: [
        MINT_IMG.coinPackaging,
        MINT_IMG.coinObverse,
        mintv2Frame(96),
        MINT_IMG.heroStorefront,
      ],
      bgClass: 'bg-[#efe9dc]',
    },
  ],
};

// ── Import từ 360-admin-cms ──────────────────────────────────────────────
const LINEA_IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

const LINEA_PORTFOLIO_VI: LineaPortfolioContent = {
  eyebrow: 'Works',
  headingPre: 'Collaboration that',
  headingAccent: 'moved',
  headingPost: 'the needle.',
  bgColor: '#ffffff',
  textColor: '#121212',
  items: [
    { img: LINEA_IMG('1517245386807-bb43f82c33c4') },
    { img: LINEA_IMG('1487014679447-9f8336841d58') },
    { img: LINEA_IMG('1486312338219-ce68d2c6f44d') },
    { img: LINEA_IMG('1498050108023-c5249f4df085') },
    { img: LINEA_IMG('1467232004584-a241de8bcf5d') },
    { img: LINEA_IMG('1531403009284-440f080d1e12') },
    { img: LINEA_IMG('1460925895917-afdab827c52f') },
    { img: LINEA_IMG('1551434678-e076c223a692') },
    { img: LINEA_IMG('1556761175-5973dc0f32e7') },
  ],
};

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

const TEXT_DISPLACE_HERO_VI: TextDisplaceHeroContent = {
  eyebrow: 'DI CHUỘT QUA',
  title: 'Trải nghiệm sống động',
  description: 'Rê con trỏ qua dòng chữ để xem nó phản ứng theo chuyển động.',
  splitBy: 'char',
  radius: 150,
  strength: 300,
  smoothing: 0.1,
};
const TEXT_DISPLACE_HERO_EN: TextDisplaceHeroContent = {
  ...TEXT_DISPLACE_HERO_VI,
  eyebrow: 'MOVE YOUR CURSOR',
  title: 'A living experience',
  description: 'Glide your cursor across the words to see them react.',
};

const IMAGE_TRAIL_VI: ImageTrailContent = {
  eyebrow: 'DI CHUỘT QUA',
  title: 'Khám phá bộ sưu tập',
  images: pickMedia(8, 0),
  threshold: 100,
  lifespan: 750,
};
const IMAGE_TRAIL_EN: ImageTrailContent = {
  ...IMAGE_TRAIL_VI,
  eyebrow: 'MOVE YOUR CURSOR',
  title: 'Explore the collection',
};

const STICKY_SCROLL_CARDS_VI: StickyScrollCardsContent = {
  eyebrow: 'CUỘN ĐỂ XEM',
  title: 'Hành trình dự án',
  cards: [
    { imageUrl: MEDIA.architecture[0], title: 'Mặt tiền' },
    { imageUrl: MEDIA.interior[0], title: 'Phòng khách' },
    { imageUrl: MEDIA.interior[2], title: 'Bếp' },
    { imageUrl: MEDIA.nature[0], title: 'Hồ bơi' },
    { imageUrl: MEDIA.architecture[4], title: 'Sân vườn' },
  ],
  finalScale: 0.5,
  rotateDeg: 10,
  imageZoom: 1.5,
};
const STICKY_SCROLL_CARDS_EN: StickyScrollCardsContent = {
  ...STICKY_SCROLL_CARDS_VI,
  eyebrow: 'SCROLL TO EXPLORE',
  title: 'Project journey',
  cards: [
    { imageUrl: MEDIA.architecture[0], title: 'Facade' },
    { imageUrl: MEDIA.interior[0], title: 'Living room' },
    { imageUrl: MEDIA.interior[2], title: 'Kitchen' },
    { imageUrl: MEDIA.nature[0], title: 'Pool' },
    { imageUrl: MEDIA.architecture[4], title: 'Garden' },
  ],
};

const GALLERY_3D_DEPTH_VI: Gallery3dDepthContent = {
  eyebrow: 'BỘ SƯU TẬP',
  title: 'Không gian sống',
  images: pickMedia(8, 8),
  stagger: 0.25,
  duration: 2,
};
const GALLERY_3D_DEPTH_EN: Gallery3dDepthContent = {
  ...GALLERY_3D_DEPTH_VI,
  eyebrow: 'COLLECTION',
  title: 'Living spaces',
};

const PARALLAX_HERO_VI: ParallaxHeroContent = {
  eyebrow: 'SÁNG TẠO',
  title: 'Trải nghiệm có chiều sâu',
  layers: [
    {
      imageUrl: MEDIA.nature[1],
      speed: -10,
      top: '70%',
      left: '18%',
      width: '20%',
    },
    {
      imageUrl: MEDIA.architecture[1],
      speed: 8,
      top: '32%',
      left: '82%',
      width: '16%',
    },
    {
      imageUrl: MEDIA.interior[1],
      speed: -6,
      top: '28%',
      left: '20%',
      width: '14%',
    },
  ],
  marqueeText: 'Creative · Technology · Media',
  marqueeSeconds: 40,
};
const PARALLAX_HERO_EN: ParallaxHeroContent = {
  ...PARALLAX_HERO_VI,
  eyebrow: 'CREATIVE',
  title: 'An experience with depth',
};

const LIGHTBOX_FLIP_VI: LightboxFlipContent = {
  eyebrow: 'THƯ VIỆN',
  title: 'Click để phóng to',
  images: pickMedia(8, 3),
  columns: 4,
  duration: 0.6,
};
const LIGHTBOX_FLIP_EN: LightboxFlipContent = {
  ...LIGHTBOX_FLIP_VI,
  eyebrow: 'GALLERY',
  title: 'Click to zoom',
};

const FLIP_GALLERY_VI: FlipGalleryContent = {
  eyebrow: 'BỘ SƯU TẬP',
  title: 'Đổi cách xem',
  images: pickMedia(4, 14),
  expandLabel: 'Dàn ra',
  collapseLabel: 'Thu gọn',
};
const FLIP_GALLERY_EN: FlipGalleryContent = {
  ...FLIP_GALLERY_VI,
  eyebrow: 'COLLECTION',
  title: 'Switch the view',
  expandLabel: 'Spread',
  collapseLabel: 'Collapse',
};

const WHEEL_GALLERY_VI: WheelGalleryContent = {
  eyebrow: 'CUỘN ĐỂ XOAY',
  title: 'Vòng quay dự án',
  images: pickMedia(12, 6),
};
const WHEEL_GALLERY_EN: WheelGalleryContent = {
  ...WHEEL_GALLERY_VI,
  eyebrow: 'SCROLL TO SPIN',
  title: 'Project carousel',
};

const HOVER_REVEAL_LIST_VI: HoverRevealListContent = {
  title: 'Dự án nổi bật',
  items: [
    { label: 'Happy City', imageUrl: MEDIA.architecture[2] },
    { label: 'Maison Noir', imageUrl: MEDIA.interior[3] },
    { label: 'The Jack Pine', imageUrl: MEDIA.nature[2] },
    { label: 'Riverside', imageUrl: MEDIA.architecture[3] },
    { label: 'Green Villa', imageUrl: MEDIA.interior[4] },
  ],
};
const HOVER_REVEAL_LIST_EN: HoverRevealListContent = {
  ...HOVER_REVEAL_LIST_VI,
  title: 'Featured projects',
};

const HOVER_GRID_REVEAL_VI: HoverGridRevealContent = {
  imageUrl: MEDIA.architecture[3],
  cols: 16,
  rows: 11,
  overlayColor: '#fd5530',
  blockColor: '#fff989',
  resetMs: 300,
};
const HOVER_GRID_REVEAL_EN: HoverGridRevealContent = {
  ...HOVER_GRID_REVEAL_VI,
};

const HOVER_EQ_HEADING_VI: HoverEqualizerHeadingContent = {
  heading: 'TRẢI NGHIỆM',
  peak: 2.2,
  neighbor: 1.6,
};
const HOVER_EQ_HEADING_EN: HoverEqualizerHeadingContent = {
  ...HOVER_EQ_HEADING_VI,
  heading: 'EXPERIENCE',
};

const IMAGE_EXPLOSION_VI: ImageExplosionContent = {
  eyebrow: 'CUỘN TỚI ĐÂY',
  title: 'Bùng nổ trải nghiệm',
  images: pickMedia(6, 18),
};
const IMAGE_EXPLOSION_EN: ImageExplosionContent = {
  ...IMAGE_EXPLOSION_VI,
  eyebrow: 'SCROLL HERE',
  title: 'Experience explosion',
};

const CARD_SHOWCASE_VI: CardShowcaseContent = {
  title: 'Dự án tiêu biểu',
  cards: [
    {
      imageUrl: MEDIA.architecture[0],
      title: 'Happy City',
      subtitle: 'Khu đô thị kiểu mẫu',
    },
    {
      imageUrl: MEDIA.interior[0],
      title: 'Maison Noir',
      subtitle: 'Không gian sống sang trọng',
    },
    {
      imageUrl: MEDIA.nature[1],
      title: 'Riverside',
      subtitle: 'Bên dòng sông xanh',
    },
  ],
};
const CARD_SHOWCASE_EN: CardShowcaseContent = {
  ...CARD_SHOWCASE_VI,
  title: 'Featured Projects',
  cards: [
    {
      imageUrl: MEDIA.architecture[0],
      title: 'Happy City',
      subtitle: 'Model urban district',
    },
    {
      imageUrl: MEDIA.interior[0],
      title: 'Maison Noir',
      subtitle: 'Luxury living space',
    },
    {
      imageUrl: MEDIA.nature[1],
      title: 'Riverside',
      subtitle: 'By the green river',
    },
  ],
};

const STORY_SLIDES_VI: StorySlidesContent = {
  duration: 4000,
  slides: [
    {
      imageUrl: MEDIA.architecture[0],
      title: 'Happy City',
      subtitle: 'Khu đô thị kiểu mẫu',
    },
    {
      imageUrl: MEDIA.interior[0],
      title: 'Maison Noir',
      subtitle: 'Không gian sống sang trọng',
    },
    {
      imageUrl: MEDIA.nature[1],
      title: 'Riverside',
      subtitle: 'Bên dòng sông xanh',
    },
  ],
};
const STORY_SLIDES_EN: StorySlidesContent = {
  ...STORY_SLIDES_VI,
  slides: [
    {
      imageUrl: MEDIA.architecture[0],
      title: 'Happy City',
      subtitle: 'Model urban district',
    },
    {
      imageUrl: MEDIA.interior[0],
      title: 'Maison Noir',
      subtitle: 'Luxury living space',
    },
    {
      imageUrl: MEDIA.nature[1],
      title: 'Riverside',
      subtitle: 'By the green river',
    },
  ],
};

const FLIP_SHOWREEL_VI: FlipShowreelContent = {
  title: 'Happy City',
  imageUrl: MEDIA.architecture[0],
};
const FLIP_SHOWREEL_EN: FlipShowreelContent = { ...FLIP_SHOWREEL_VI };

const PEEL_REVEAL_VI: PeelRevealContent = {
  title: 'Happy City',
  imageUrl: MEDIA.architecture[0],
};
const PEEL_REVEAL_EN: PeelRevealContent = {
  ...PEEL_REVEAL_VI,
};

const ACCORDION_MEDIA_VI: AccordionMediaContent = {
  items: [
    {
      title: 'Thiết kế',
      description:
        'Tinh tế trong từng chi tiết, cân bằng giữa kỹ thuật và cảm xúc.',
      imageUrl: MEDIA.architecture[0],
    },
    {
      title: 'Trải nghiệm',
      description:
        'Ánh sáng, chất liệu và sự tĩnh lặng mời mọi giác quan lắng lại.',
      imageUrl: MEDIA.interior[0],
    },
    {
      title: 'Di sản',
      description: 'Mỗi công trình kể một câu chuyện bền vững theo thời gian.',
      imageUrl: MEDIA.nature[1],
    },
  ],
};
const ACCORDION_MEDIA_EN: AccordionMediaContent = {
  items: [
    {
      title: 'Design',
      description:
        'Precision in every detail, balancing technique and emotion.',
      imageUrl: MEDIA.architecture[0],
    },
    {
      title: 'Experience',
      description: 'Light, texture and stillness invite every sense to settle.',
      imageUrl: MEDIA.interior[0],
    },
    {
      title: 'Legacy',
      description: 'Each work tells a story that endures over time.',
      imageUrl: MEDIA.nature[1],
    },
  ],
};

const PRICING_TABLE_VI: PricingTableContent = {
  title: 'Bảng giá',
  plans: [
    {
      name: 'Cơ bản',
      price: '0đ',
      period: 'tháng',
      features: ['1 landing page', 'Phân tích cơ bản', 'Hỗ trợ email'],
    },
    {
      name: 'Chuyên nghiệp',
      price: '990k',
      period: 'tháng',
      highlighted: true,
      features: [
        '10 landing page',
        'AI-Insights',
        'Tên miền riêng',
        'Hỗ trợ ưu tiên',
      ],
    },
    {
      name: 'Doanh nghiệp',
      price: 'Liên hệ',
      features: ['Không giới hạn', 'SLA riêng', 'Tích hợp CRM'],
    },
  ],
};
const PRICING_TABLE_EN: PricingTableContent = {
  title: 'Pricing',
  plans: [
    {
      name: 'Basic',
      price: '$0',
      period: 'mo',
      features: ['1 landing page', 'Basic analytics', 'Email support'],
    },
    {
      name: 'Pro',
      price: '$39',
      period: 'mo',
      highlighted: true,
      features: [
        '10 landing pages',
        'AI-Insights',
        'Custom domain',
        'Priority support',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Contact',
      features: ['Unlimited', 'Dedicated SLA', 'CRM integration'],
    },
  ],
};

const IMAGE_BANNER_VI: ImageBannerContent = {
  imageUrl: MEDIA.architecture[1],
  heading: 'Hơn cả một nơi ở',
  description:
    'Mỗi chi tiết được thiết kế để bạn cảm thấy như ở nhà, giữa sự thanh lịch.',
};
const IMAGE_BANNER_EN: ImageBannerContent = {
  imageUrl: MEDIA.architecture[1],
  heading: 'More Than a Stay',
  description:
    'Every detail is designed to make you feel at home amid quiet elegance.',
};

const VIDEO_GALLERY_VI: VideoGalleryContent = {
  title: 'Thước phim',
  videos: [
    {
      src: 'https://cdn.coverr.co/videos/coverr-a-city-at-night-9476/1080p.mp4',
      title: 'Đêm thành phố',
    },
    {
      src: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-a-forest-2633/1080p.mp4',
      title: 'Rừng xanh',
    },
    {
      src: 'https://cdn.coverr.co/videos/coverr-waves-on-the-beach-1409/1080p.mp4',
      title: 'Sóng biển',
    },
  ],
};
const VIDEO_GALLERY_EN: VideoGalleryContent = {
  ...VIDEO_GALLERY_VI,
  title: 'Reel',
};

const SPOTLIGHT_VI: SpotlightContent = {
  lines: ['Chúng tôi tạo ra', 'những trải nghiệm', 'đáng nhớ.'],
};
const SPOTLIGHT_EN: SpotlightContent = {
  lines: ['We craft', 'memorable', 'experiences.'],
};

const PROCESS_STEPS_VI: ProcessStepsContent = {
  title: 'Quy trình',
  steps: [
    {
      title: 'Khám phá',
      description: 'Tìm hiểu mục tiêu, khách hàng và bối cảnh dự án.',
    },
    {
      title: 'Ý tưởng',
      description: 'Định hình concept và định hướng sáng tạo.',
    },
    { title: 'Thực thi', description: 'Thiết kế, dựng và tối ưu trải nghiệm.' },
    {
      title: 'Đo lường',
      description: 'Theo dõi hiệu quả và cải tiến liên tục.',
    },
  ],
};
const PROCESS_STEPS_EN: ProcessStepsContent = {
  title: 'Process',
  steps: [
    {
      title: 'Discover',
      description: 'Understand goals, audience and project context.',
    },
    {
      title: 'Concept',
      description: 'Shape the concept and creative direction.',
    },
    {
      title: 'Build',
      description: 'Design, build and optimize the experience.',
    },
    {
      title: 'Measure',
      description: 'Track performance and improve continuously.',
    },
  ],
};

const DOT_MATRIX_VI: DotMatrixContent = {
  title: 'Tương tác',
  gap: 26,
  dotColor: '#5b6472',
};
const DOT_MATRIX_EN: DotMatrixContent = {
  ...DOT_MATRIX_VI,
  title: 'Interactive',
};

const INTERACTIVE_GRID_VI: InteractiveGridContent = {
  images: [
    MEDIA.architecture[0],
    MEDIA.interior[0],
    MEDIA.nature[1],
    MEDIA.architecture[1],
    MEDIA.interior[1],
    MEDIA.nature[2],
    MEDIA.architecture[2],
    MEDIA.nature[3],
  ],
};
const INTERACTIVE_GRID_EN: InteractiveGridContent = { ...INTERACTIVE_GRID_VI };

const PIXEL_REVEAL_VI: PixelRevealContent = {
  imageUrl: MEDIA.architecture[0],
  title: 'Happy City',
};
const PIXEL_REVEAL_EN: PixelRevealContent = { ...PIXEL_REVEAL_VI };

const MARQUEE_BAND_VI: MarqueeBandContent = {
  text: 'Sáng tạo · Công nghệ · Truyền thông',
  separator: ' · ',
  seconds: 24,
};
const MARQUEE_BAND_EN: MarqueeBandContent = {
  ...MARQUEE_BAND_VI,
  text: 'Creative · Technology · Media',
};

const LETTER_SLIDER_VI: LetterSliderContent = {
  slides: [
    { title: 'Happy City', imageUrl: MEDIA.architecture[1] },
    { title: 'Maison Noir', imageUrl: MEDIA.interior[1] },
    { title: 'Riverside', imageUrl: MEDIA.nature[3] },
  ],
};
const LETTER_SLIDER_EN: LetterSliderContent = { ...LETTER_SLIDER_VI };

const SVG_MORPH_OVERLAY_VI: SvgMorphOverlayContent = {
  title: 'Khám phá bộ sưu tập',
  images: pickMedia(4, 20),
  overlayColor: '#36301d',
  toggleLabel: 'Mở bộ sưu tập',
};
const SVG_MORPH_OVERLAY_EN: SvgMorphOverlayContent = {
  ...SVG_MORPH_OVERLAY_VI,
  title: 'Explore the collection',
  toggleLabel: 'Open catalog',
};

const GALLERY_PAN_LENS_VI: GalleryPanLensContent = {
  images: pickMedia(9, 11),
  radius: 260,
  maxScale: 2.4,
};
const GALLERY_PAN_LENS_EN: GalleryPanLensContent = { ...GALLERY_PAN_LENS_VI };

const SEAMLESS_SCROLL_GALLERY_VI: SeamlessScrollGalleryContent = {
  title: 'Dự án tiêu biểu',
  images: pickMedia(7, 16),
  seconds: 30,
};
const SEAMLESS_SCROLL_GALLERY_EN: SeamlessScrollGalleryContent = {
  ...SEAMLESS_SCROLL_GALLERY_VI,
  title: 'Featured projects',
};

const PRODUCT_SPEC_SHEET_VI: ProductSpecSheetContent = {
  eyebrow: 'SẢN PHẨM',
  title: 'The Jack Pine',
  description: 'Đồng vàng 99.99% — phiên bản giới hạn.',
  imageUrl: MEDIA.product[0],
  specLabel: 'Thông số',
  specs: [
    { label: 'Khối lượng', value: '1006.1 g' },
    { label: 'Đường kính', value: 'Ø 101.6 mm' },
    { label: 'Độ tinh khiết', value: '99.99% vàng' },
    { label: 'Mệnh giá', value: '$2,500 CAD' },
  ],
};
const PRODUCT_SPEC_SHEET_EN: ProductSpecSheetContent = {
  ...PRODUCT_SPEC_SHEET_VI,
  eyebrow: 'PRODUCT',
  description: '99.99% pure gold — limited edition.',
  specLabel: 'Specs',
  specs: [
    { label: 'Weight', value: '1006.1 g' },
    { label: 'Diameter', value: 'Ø 101.6 mm' },
    { label: 'Purity', value: '99.99% gold' },
    { label: 'Face value', value: '$2,500 CAD' },
  ],
};

// ── Framer-native: Hero - Yume ──────────────────────────────────────────
// Default content port từ src/blocks/framer-yume-hero/schema.ts (avatar
// object → avatarUrl string). vi/en giữ giống nhau như schema gốc.
const FRAMER_YUME_HERO_VI: FramerYumeHeroContent = {
  firstName: 'YUME',
  lastName: 'YASKUMI',
  avatarUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
  email: 'hello@yume.com',
  bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
};
const FRAMER_YUME_HERO_EN: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };

// Hero - Yuya (v2): cùng content shape với Yume.
const FRAMER_YUYA_HERO_VI: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };
const FRAMER_YUYA_HERO_EN: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };

// ── Framer-native: Hero - 03 (Arpeggio) ─────────────────────────────────
// Port từ src/blocks/framer-arpeggio-hero/schema.ts (backgroundImage → backgroundUrl).
const FRAMER_ARPEGGIO_HERO_VI: FramerArpeggioHeroContent = {
  backgroundUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1600&q=80',
  headline: 'One subscription,\nunlimited design iterations.',
  subtitle: 'Freedom beyond the traditional project scope',
  topRightLabel: 'The Creative Agency—',
  wordmark: 'Arpeggio',
  wordmarkSuffix: '®',
};
const FRAMER_ARPEGGIO_HERO_EN: FramerArpeggioHeroContent = {
  ...FRAMER_ARPEGGIO_HERO_VI,
};

// ── Framer-native: Delvaux Hero Intro ───────────────────────────────────
const FRAMER_DELVAUX_HERO_INTRO_VI: FramerDelvauxHeroIntroContent = {
  storefrontImageUrl:
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
  productImageUrl:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80',
  productAlt: 'Sản phẩm nổi bật',
};
const FRAMER_DELVAUX_HERO_INTRO_EN: FramerDelvauxHeroIntroContent = {
  ...FRAMER_DELVAUX_HERO_INTRO_VI,
  productAlt: 'Featured product',
};

// ── Framer-native: Framer Hero ──────────────────────────────────────────
const FRAMER_HERO_VI: FramerHeroContent = {
  logo: 'ecopark',
  navLink: 'Liên hệ',
  navHref: '#contact',
  title: 'Sống cùng thiên nhiên\nTắm trong thanh thản',
  backgroundUrl:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80',
};
const FRAMER_HERO_EN: FramerHeroContent = {
  logo: 'ecopark',
  navLink: 'Contact',
  navHref: '#contact',
  title: 'Live with Nature\nBathe in Serenity',
  backgroundUrl: FRAMER_HERO_VI.backgroundUrl,
};

// ── Framer-native: Perform Hero v1 ──────────────────────────────────────
const FRAMER_PERFORM_HERO_VI: FramerPerformHeroContent = {
  eyebrow: 'Huấn luyện viên ba môn phối hợp giàu kinh nghiệm',
  title: 'Nâng Tầm\nHiệu Suất',
  subtitle:
    'Cải thiện thành tích của bạn với các kế hoạch tập luyện được cá nhân hóa từ huấn luyện viên tận tâm.',
  ctaLabel: 'Bắt đầu ngay',
  ctaHref: '#start',
  backgroundUrl:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
  reviewStars: 5,
  reviewCount: '100+ đánh giá tích cực từ khách hàng',
};
const FRAMER_PERFORM_HERO_EN: FramerPerformHeroContent = {
  eyebrow: 'Experienced triathlon coach',
  title: 'Level Up Your\nPerformance',
  subtitle:
    'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
  ctaLabel: 'Start now',
  ctaHref: '#start',
  backgroundUrl: FRAMER_PERFORM_HERO_VI.backgroundUrl,
  reviewStars: 5,
  reviewCount: '100+ Positive Client Reviews',
};

// ── Framer-native: Perform Hero v2 ──────────────────────────────────────
const FRAMER_PERFORM_HERO_V2_VI: FramerPerformHeroV2Content = {
  eyebrow: 'Huấn luyện viên ba môn phối hợp giàu kinh nghiệm',
  title: 'Nâng Tầm Hiệu Suất Của Bạn',
  subtitle:
    'Cải thiện thành tích với kế hoạch tập luyện được cá nhân hóa từ huấn luyện viên tận tâm.',
  buttonText: 'Bắt đầu ngay',
  buttonHref: '#start',
  reviewsText: '100+ đánh giá tích cực',
  bgImageUrl:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
};
const FRAMER_PERFORM_HERO_V2_EN: FramerPerformHeroV2Content = {
  eyebrow: 'Experienced triathlon coach',
  title: 'Level Up Your Performance',
  subtitle:
    'Improve your triathlon performance with personalized training plans guided by an experienced coach.',
  buttonText: 'Start now',
  buttonHref: '#start',
  reviewsText: '100+ Positive Client Reviews',
  bgImageUrl: FRAMER_PERFORM_HERO_V2_VI.bgImageUrl,
};

// ── Framer-native: Bungee Hero ──────────────────────────────────────────
const FRAMER_BUNGEE_HERO_VI: FramerBungeeHeroContent = {
  wordmarkUrl: '',
  subtitle: 'Studio sáng tạo đặt tại Hà Nội.',
  timerLabel: 'HN',
  link1Label: 'BE',
  link1Url: 'https://www.behance.net/',
  link2Label: 'DR',
  link2Url: 'https://dribbble.com/',
  link3Label: 'X',
  link3Url: 'https://x.com/',
  marqueeSpeed: 40,
  cardImages: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=70',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=70',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=70',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=70',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=800&q=70',
    },
  ],
};
const FRAMER_BUNGEE_HERO_EN: FramerBungeeHeroContent = {
  ...FRAMER_BUNGEE_HERO_VI,
  subtitle: 'Creative studio based in Hanoi.',
};

// ── Framer-native: Hero - Mobius ─────────────────────────────────────────────
const FRAMER_MOBIUS_HERO_VI: FramerMobiusHeroContent = {
  brand: 'Mobius',
  introBody: 'A creative studio building bold experiences for the modern web.',
  navItems: [
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],
  cards: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&q=80',
      href: '#',
      rotation: -6,
      offsetX: -60,
      offsetY: -20,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      href: '#',
      rotation: 3,
      offsetX: 40,
      offsetY: 20,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&q=80',
      href: '#',
      rotation: 10,
      offsetX: 100,
      offsetY: -30,
    },
  ],
  copyright: '© 2025 Mobius',
  location: 'Ho Chi Minh City, Vietnam',
  bgColor: '#f5f0eb',
};
const FRAMER_MOBIUS_HERO_EN: FramerMobiusHeroContent = {
  ...FRAMER_MOBIUS_HERO_VI,
};

// ── Framer-native: Hero - Avexa ──────────────────────────────────────────────
const FRAMER_AVEXA_HERO_VI: FramerAvexaHeroContent = {
  backgroundUrl:
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80',
  brandMark: 'Avexa',
  topHeading: 'Defining the future\nof modern living.',
  tagline: 'Where craft meets culture,\nand beauty lives in detail.',
  wordmark: 'Avexa',
  wordmarkSuffix: '®',
  wordmarkAfter: 'Studio',
};
const FRAMER_AVEXA_HERO_EN: FramerAvexaHeroContent = {
  ...FRAMER_AVEXA_HERO_VI,
};

// ── Framer-native: Intro Redefined ──────────────────────────────────────
const FRAMER_INTRO_REDEFINED_VI: FramerIntroRedefinedContent = {
  eyebrow: 'Epictower Onsen',
  title: 'Life Style Redefined.',
  body: 'Một không gian sống vượt qua ranh giới của sự sang trọng thông thường — nơi thiên nhiên hòa quyện cùng kiến trúc đương đại.',
};
const FRAMER_INTRO_REDEFINED_EN: FramerIntroRedefinedContent = {
  eyebrow: 'Epictower Onsen',
  title: 'Life Style Redefined.',
  body: 'A living space that transcends the boundaries of ordinary luxury — where nature merges with contemporary architecture.',
};

// ── Framer-native: Paradigm Title ───────────────────────────────────────
const FRAMER_PARADIGM_TITLE_VI: FramerParadigmTitleContent = {
  titleTop: 'Khám phá một mô hình mới',
  titleBottom: 'Về Sức Khỏe & Wellness',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  overlayText: 'Trải Nghiệm Đặc Quyền',
};
const FRAMER_PARADIGM_TITLE_EN: FramerParadigmTitleContent = {
  titleTop: 'Explore a new paradigm',
  titleBottom: 'In Residential Wellness',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  overlayText: 'Signature Experiences',
};

// ── Framer-native: Explore CTA ──────────────────────────────────────────
const FRAMER_EXPLORE_CTA_VI: FramerExploreCtaContent = {
  eyebrow: 'KHÁM PHÁ',
  headline: 'Xem thêm các dự án của chúng tôi',
  linkLabel: 'KHÁM PHÁ THÊM',
  linkHref: '#',
};
const FRAMER_EXPLORE_CTA_EN: FramerExploreCtaContent = {
  eyebrow: 'DISCOVER',
  headline: 'Explore more of our work',
  linkLabel: 'EXPLORE MORE',
  linkHref: '#',
};

// ── Framer-native: Studio Manifesto ────────────────────────────────────
const FRAMER_STUDIO_MANIFESTO_VI: FramerStudioManifestoContent = {
  eyebrow: 'TRIẾT LÝ',
  title: 'Phương châm của chúng tôi',
  body: 'Chúng tôi tin rằng kiến trúc tốt nhất là kiến trúc phục vụ con người — không chỉ đẹp về hình thức mà còn nuôi dưỡng tâm hồn và kết nối cộng đồng.',
  signature: '— Studio Rexer, 2025',
};
const FRAMER_STUDIO_MANIFESTO_EN: FramerStudioManifestoContent = {
  eyebrow: 'PHILOSOPHY',
  title: 'Our approach',
  body: 'We believe the best architecture serves people — not only beautiful in form but nourishing to the soul and connecting communities.',
  signature: '— Studio Rexer, 2025',
};

// ── Framer-native: Large Quote ──────────────────────────────────────────
const FRAMER_LARGE_QUOTE_VI: FramerLargeQuoteContent = {
  quote: 'Kiến trúc là âm nhạc được đóng băng trong không gian.',
  author: 'Nguyễn Văn A',
  role: 'GIÁM ĐỐC SÁNG TẠO',
  variant: 'light',
};
const FRAMER_LARGE_QUOTE_EN: FramerLargeQuoteContent = {
  quote: 'Architecture is music frozen in space.',
  author: 'John Smith',
  role: 'CREATIVE DIRECTOR',
  variant: 'light',
};

// ── Framer-native: Stats Grid ───────────────────────────────────────────
const FRAMER_STATS_GRID_VI: FramerStatsGridContent = {
  backgroundUrl:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
  stats: [
    { value: '120+', label: 'Dự án hoàn thành' },
    { value: '15', label: 'Năm kinh nghiệm' },
    { value: '98%', label: 'Khách hàng hài lòng' },
    { value: '40+', label: 'Giải thưởng thiết kế' },
  ],
};
const FRAMER_STATS_GRID_EN: FramerStatsGridContent = {
  backgroundUrl:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=80',
  stats: [
    { value: '120+', label: 'Projects Completed' },
    { value: '15', label: 'Years Experience' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '40+', label: 'Design Awards' },
  ],
};

// ── Framer-native: Projects Grid ────────────────────────────────────────
const FRAMER_PROJECTS_GRID_VI: FramerProjectsGridContent = {
  eyebrow: 'DỰ ÁN',
  title: 'Công trình tiêu biểu',
  projects: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      name: 'Biệt thự Hà Nội',
      category: 'Nhà ở',
      href: '#',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      name: 'Penthouse Sài Gòn',
      category: 'Nội thất',
      href: '#',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      name: 'Studio Đà Nẵng',
      category: 'Thương mại',
      href: '#',
    },
  ],
};
const FRAMER_PROJECTS_GRID_EN: FramerProjectsGridContent = {
  eyebrow: 'PROJECTS',
  title: 'Selected Works',
  projects: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      name: 'Hanoi Villa',
      category: 'Residential',
      href: '#',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      name: 'Saigon Penthouse',
      category: 'Interior',
      href: '#',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      name: 'Da Nang Studio',
      category: 'Commercial',
      href: '#',
    },
  ],
};

// ── Framer-native: Team Directory ───────────────────────────────────────
const FRAMER_TEAM_DIRECTORY_VI: FramerTeamDirectoryContent = {
  eyebrow: 'ĐỘI NGŨ',
  title: 'Những người tạo nên thương hiệu',
  members: [
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      name: 'Nguyễn Thị Lan',
      role: 'GIÁM ĐỐC SÁNG TẠO',
    },
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      name: 'Trần Minh Khoa',
      role: 'KIẾN TRÚC SƯ TRƯỞNG',
    },
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      name: 'Phạm Hương Giang',
      role: 'NHÀ THIẾT KẾ NỘI THẤT',
    },
  ],
};
const FRAMER_TEAM_DIRECTORY_EN: FramerTeamDirectoryContent = {
  eyebrow: 'TEAM',
  title: 'The people behind the brand',
  members: [
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      name: 'Lan Nguyen',
      role: 'CREATIVE DIRECTOR',
    },
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      name: 'Khoa Tran',
      role: 'LEAD ARCHITECT',
    },
    {
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      name: 'Giang Pham',
      role: 'INTERIOR DESIGNER',
    },
  ],
};

// ── Framer-native: Image Stagger ────────────────────────────────────────
const FRAMER_IMAGE_STAGGER_VI: FramerImageStaggerContent = {
  eyebrow: 'THƯ VIỆN',
  title: 'Không gian sống đẹp',
  images: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      alt: 'Phòng khách',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
      alt: 'Phòng ngủ',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      alt: 'Bếp',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      alt: 'Phòng tắm',
    },
  ],
};
const FRAMER_IMAGE_STAGGER_EN: FramerImageStaggerContent = {
  eyebrow: 'GALLERY',
  title: 'Beautiful living spaces',
  images: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      alt: 'Living room',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
      alt: 'Bedroom',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80',
      alt: 'Kitchen',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
      alt: 'Bathroom',
    },
  ],
};

// ── Framer-native: Horizontal Scroll ────────────────────────────────────
const FRAMER_HORIZONTAL_SCROLL_VI: FramerHorizontalScrollContent = {
  eyebrow: 'BỘ SƯU TẬP',
  title: 'Khám phá các thiết kế',
  items: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      label: 'Biệt thự Hà Nội',
      caption: 'Nhà ở • 2024',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      label: 'Penthouse Sky',
      caption: 'Nội thất • 2024',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      label: 'Resort Phú Quốc',
      caption: 'Thương mại • 2023',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
      label: 'Villa Đà Lạt',
      caption: 'Nhà nghỉ dưỡng • 2023',
    },
  ],
};
const FRAMER_HORIZONTAL_SCROLL_EN: FramerHorizontalScrollContent = {
  eyebrow: 'COLLECTION',
  title: 'Explore the designs',
  items: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
      label: 'Hanoi Villa',
      caption: 'Residential • 2024',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
      label: 'Sky Penthouse',
      caption: 'Interior • 2024',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      label: 'Phu Quoc Resort',
      caption: 'Commercial • 2023',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
      label: 'Da Lat Villa',
      caption: 'Hospitality • 2023',
    },
  ],
};

// ── Framer-native: Contact Footer ──────────────────────────────────────
const FRAMER_CONTACT_FOOTER_VI: FramerContactFooterContent = {
  greeting: 'Liên hệ với chúng tôi',
  email: 'hello@rexer.ai',
  copyright: '© 2025 Rexer. Bảo lưu mọi quyền.',
  navLinks: [
    { label: 'Trang chủ', href: '#' },
    { label: 'Dịch vụ', href: '#' },
    { label: 'Dự án', href: '#' },
    { label: 'Liên hệ', href: '#' },
  ],
  socialLinks: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};
const FRAMER_CONTACT_FOOTER_EN: FramerContactFooterContent = {
  greeting: 'Say Hello!',
  email: 'hello@rexer.ai',
  copyright: '© 2025 Rexer. All rights reserved.',
  navLinks: [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'Projects', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  socialLinks: [
    { label: 'Facebook', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
  ],
};

// ── Framer-native: FAQ Minimal ──────────────────────────────────────────
const FRAMER_FAQ_MINIMAL_VI: FramerFaqMinimalContent = {
  title: 'Câu hỏi thường gặp?',
  ctaText: 'Đặt câu hỏi',
  ctaHref: '#',
  items: [
    {
      question: 'Dịch vụ của bạn bao gồm những gì?',
      answer:
        'Chúng tôi cung cấp đầy đủ các dịch vụ thiết kế, phát triển và triển khai cho thương hiệu của bạn.',
    },
    {
      question: 'Quy trình làm việc như thế nào?',
      answer:
        'Chúng tôi bắt đầu bằng một cuộc trao đổi để hiểu nhu cầu, sau đó lên kế hoạch và thực hiện từng bước rõ ràng.',
    },
    {
      question: 'Thời gian hoàn thành dự án là bao lâu?',
      answer: 'Tùy thuộc vào quy mô dự án, thời gian thường từ 2 đến 8 tuần.',
    },
  ],
};
const FRAMER_FAQ_MINIMAL_EN: FramerFaqMinimalContent = {
  title: 'Have some questions?',
  ctaText: 'Ask a question',
  ctaHref: '#',
  items: [
    {
      question: 'What services do you offer?',
      answer:
        'We provide end-to-end design, development, and deployment services for your brand.',
    },
    {
      question: 'What does your workflow look like?',
      answer:
        'We start with a discovery call to understand your needs, then plan and execute each step clearly.',
    },
    {
      question: 'How long does a project take?',
      answer:
        'Depending on the scope, projects typically take between 2 and 8 weeks.',
    },
  ],
};

// ── Framer-native: Finnegan Expertise ──────────────────────────────────
const FRAMER_FINNEGAN_EXPERTISE_VI: FramerFinneganExpertiseContent = {
  heading: 'Chuyên Môn',
  cardBg: '#e85a2c',
  slides: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      title: 'Thiết kế thương hiệu',
      description:
        'Xây dựng bản sắc thương hiệu độc đáo và nhất quán trên mọi nền tảng.',
      bgColor: '#e85a2c',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      title: 'Phát triển web',
      description:
        'Tạo ra các trang web nhanh, đẹp và dễ sử dụng với công nghệ hiện đại.',
      bgColor: '#2c7be8',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
      title: 'Chiến lược nội dung',
      description:
        'Lên kế hoạch và thực thi nội dung thu hút, chuyển đổi khách hàng tiềm năng.',
      bgColor: '#1f9d55',
    },
  ],
};
const FRAMER_FINNEGAN_EXPERTISE_EN: FramerFinneganExpertiseContent = {
  heading: 'My Expertise',
  cardBg: '#e85a2c',
  slides: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
      title: 'Brand Design',
      description:
        'Building a unique and consistent brand identity across all platforms.',
      bgColor: '#e85a2c',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
      title: 'Web Development',
      description:
        'Creating fast, beautiful, and user-friendly websites with modern technology.',
      bgColor: '#2c7be8',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
      title: 'Content Strategy',
      description:
        'Planning and executing compelling content that converts potential customers.',
      bgColor: '#1f9d55',
    },
  ],
};

// ── Framer-native: Darling Timeline ────────────────────────────────────
const FRAMER_DARLING_TIMELINE_VI: FramerDarlingTimelineContent = {
  heading: 'Hành Trình',
  intro:
    'Chúng tôi tin rằng mỗi dự án là một câu chuyện cần được kể bằng sự chăm chút và tận tâm.',
  items: [
    {
      time: '9:00 SA',
      title: 'Khởi đầu',
      description:
        'Cuộc họp khởi động để hiểu rõ mục tiêu và kỳ vọng của khách hàng.',
      imageUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    },
    {
      time: '11:00 SA',
      title: 'Lên kế hoạch',
      description: 'Xây dựng lộ trình chi tiết cho từng giai đoạn dự án.',
      imageUrl:
        'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
    },
    {
      time: '2:00 CH',
      title: 'Thực hiện',
      description:
        'Đội ngũ sáng tạo bắt tay vào công việc với toàn bộ nhiệt huyết.',
      imageUrl:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    },
  ],
};
const FRAMER_DARLING_TIMELINE_EN: FramerDarlingTimelineContent = {
  heading: 'The Day',
  intro:
    "Here\'s what to expect. Everything takes place here, and we\'ll guide you throughout the day.",
  items: [
    {
      time: '9:00 AM',
      title: 'Kickoff',
      description:
        'A kickoff meeting to understand the goals and expectations.',
      imageUrl:
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    },
    {
      time: '11:00 AM',
      title: 'Planning',
      description: 'Building a detailed roadmap for each project phase.',
      imageUrl:
        'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
    },
    {
      time: '2:00 PM',
      title: 'Execution',
      description: 'The creative team gets to work with full dedication.',
      imageUrl:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    },
  ],
};

// ── Framer-native: Signature Feature ───────────────────────────────────
const FRAMER_SIGNATURE_FEATURE_VI: FramerSignatureFeatureContent = {
  eyebrow: 'TRẢI NGHIỆM ĐẶC QUYỀN',
  title: 'Khu Nghỉ Dưỡng Onsen & Wellness',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  bullets: [
    { text: 'Hồ bơi khoáng nóng thiên nhiên ngoài trời' },
    { text: 'Phòng trị liệu và spa cao cấp' },
    { text: 'Nhà hàng ẩm thực Nhật Bản truyền thống' },
    { text: 'Trải nghiệm thiền định và yoga' },
  ],
};
const FRAMER_SIGNATURE_FEATURE_EN: FramerSignatureFeatureContent = {
  eyebrow: 'SIGNATURE EXPERIENCES',
  title: 'Onsen & Wellness Pavilion',
  imageUrl:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  bullets: [
    { text: 'Outdoor natural hot spring pools' },
    { text: 'Premium spa and therapy rooms' },
    { text: 'Traditional Japanese cuisine restaurant' },
    { text: 'Meditation and yoga experiences' },
  ],
};

// ── Framer-native: VS Collins Projects ─────────────────────────────────
const FRAMER_VS_COLLINS_PROJECTS_VI: FramerVsCollinsProjectsContent = {
  bgColor: '#ffffff',
  items: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      year: '2024',
      name: 'Dự án Alpha',
      href: '#',
      spacerBefore: 0,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&q=80',
      year: '2024',
      name: 'Dự án Beta',
      href: '#',
      spacerBefore: 2,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      year: '2023',
      name: 'Dự án Gamma',
      href: '#',
      spacerBefore: 1,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
      year: '2023',
      name: 'Dự án Delta',
      href: '#',
      spacerBefore: 3,
    },
  ],
};
const FRAMER_VS_COLLINS_PROJECTS_EN: FramerVsCollinsProjectsContent = {
  bgColor: '#ffffff',
  items: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
      year: '2024',
      name: 'Project Alpha',
      href: '#',
      spacerBefore: 0,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&q=80',
      year: '2024',
      name: 'Project Beta',
      href: '#',
      spacerBefore: 2,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      year: '2023',
      name: 'Project Gamma',
      href: '#',
      spacerBefore: 1,
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
      year: '2023',
      name: 'Project Delta',
      href: '#',
      spacerBefore: 3,
    },
  ],
};

// ── Framer-native: Avexa Bento ─────────────────────────────────────────
const AVEXA_IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70`;
const FRAMER_AVEXA_BENTO_VI: FramerAvexaBentoContent = {
  card1ImageUrl: AVEXA_IMG('1454165804606-c3d57bc86b40'),
  card1Title: 'Chiến lược dẫn đầu',
  card1Desc: 'Mọi quyết định đều dựa trên sự rõ ràng, không phải phỏng đoán.',
  card2ImageUrl: AVEXA_IMG('1513364776144-60967b0f800f'),
  card2Title: 'Chất lượng hơn số lượng',
  card2Caption:
    'Chúng tôi tập trung vào ít dự án hơn để mang lại kết quả tốt hơn.',
  card3Big: '24/7',
  card3Sub: 'Hỗ trợ ưu tiên',
  card3BadgeBrand: 'Rexer',
  card3BadgeLabel: 'Ticket hỗ trợ',
  card4ImageUrl: AVEXA_IMG('1497366216548-37526070297c'),
  card4Title: 'Giải pháp tuỳ chỉnh',
  card4Desc:
    'Không có một kích cỡ nào phù hợp tất cả — mọi thứ được định hình cho mục tiêu của bạn.',
  card5ImageUrl: AVEXA_IMG('1522071820081-009f0129c71c'),
  card5Title: 'Quy trình hợp tác',
  card5Caption: 'Chúng tôi làm việc cùng bạn, không chỉ cho bạn.',
  card6Image1Url: AVEXA_IMG('1559136555-9303baea8ebd'),
  card6Image2Url: AVEXA_IMG('1551434678-e076c223a692'),
  card6Title: 'Sáng tạo gặp thực tiễn',
  card6Desc: 'Thiết kế thông minh thực sự hoạt động trong thế giới thực.',
};
const FRAMER_AVEXA_BENTO_EN: FramerAvexaBentoContent = {
  card1ImageUrl: '',
  card1Title: 'Strategy-First Approach',
  card1Desc: 'Every decision is rooted in clarity, not guesswork.',
  card2ImageUrl: '',
  card2Title: 'Quality Over Quantity, Always',
  card2Caption: 'We focus on fewer projects to deliver better outcomes.',
  card3Big: '24/7',
  card3Sub: 'Priority Support',
  card3BadgeBrand: 'Rexer',
  card3BadgeLabel: 'Support Ticket',
  card4ImageUrl: '',
  card4Title: 'Tailored Solutions',
  card4Desc: 'No one-size-fits-all — everything is shaped to fit your goals.',
  card5ImageUrl: '',
  card5Title: 'Collaborative Process',
  card5Caption: 'We work with you, not just for you.',
  card6Image1Url: '',
  card6Image2Url: '',
  card6Title: 'Creative Meets Practical',
  card6Desc: 'Smart design that actually works in the real world.',
};

// ── Framer-native: Clarity Services ────────────────────────────────────
const FRAMER_CLARITY_SERVICES_VI: FramerClarityServicesContent = {
  bgColor: '#f8faf2',
  cardBg: '#f3f6e6',
  centerImageUrl: '',
  services: [
    {
      iconUrl: '',
      title: 'Tư vấn chiến lược',
      description: 'Xác định hướng đi rõ ràng cho doanh nghiệp của bạn.',
    },
    {
      iconUrl: '',
      title: 'Thiết kế thương hiệu',
      description: 'Xây dựng bản sắc thương hiệu mạnh mẽ và nhất quán.',
    },
    {
      iconUrl: '',
      title: 'Phát triển kỹ thuật số',
      description: 'Giải pháp công nghệ hiện đại phục vụ tăng trưởng.',
    },
    {
      iconUrl: '',
      title: 'Tối ưu hoá hiệu suất',
      description: 'Cải thiện kết quả thông qua phân tích dữ liệu.',
    },
  ],
};
const FRAMER_CLARITY_SERVICES_EN: FramerClarityServicesContent = {
  bgColor: '#f8faf2',
  cardBg: '#f3f6e6',
  centerImageUrl: '',
  services: [
    {
      iconUrl: '',
      title: 'Strategy Consulting',
      description: 'Define a clear direction for your business.',
    },
    {
      iconUrl: '',
      title: 'Brand Design',
      description: 'Build a strong, consistent brand identity.',
    },
    {
      iconUrl: '',
      title: 'Digital Development',
      description: 'Modern technology solutions for growth.',
    },
    {
      iconUrl: '',
      title: 'Performance Optimization',
      description: 'Improve results through data analysis.',
    },
  ],
};

// ── Framer-native: Velora Services ─────────────────────────────────────
const FRAMER_VELORA_SERVICES_VI: FramerVeloraServicesContent = {
  items: [
    {
      title: 'Thiết kế thương hiệu',
      description: 'Định hình bản sắc thương hiệu độc đáo và đáng nhớ.',
      imageUrl: '',
    },
    {
      title: 'Chiến lược nội dung',
      description: 'Xây dựng câu chuyện thương hiệu kết nối với khách hàng.',
      imageUrl: '',
    },
    {
      title: 'Phát triển kỹ thuật số',
      description: 'Giải pháp số hiện đại giúp doanh nghiệp tăng trưởng.',
      imageUrl: '',
    },
  ],
};
const FRAMER_VELORA_SERVICES_EN: FramerVeloraServicesContent = {
  items: [
    {
      title: 'Brand Design',
      description: 'Shape a unique and memorable brand identity.',
      imageUrl: '',
    },
    {
      title: 'Content Strategy',
      description: 'Build brand stories that connect with customers.',
      imageUrl: '',
    },
    {
      title: 'Digital Development',
      description: 'Modern digital solutions to grow your business.',
      imageUrl: '',
    },
  ],
};

// ── Framer-native: Firma Featured ──────────────────────────────────────
const FRAMER_FIRMA_FEATURED_VI: FramerFirmaFeaturedContent = {
  imageUrl: '',
  category: 'CHIẾN LƯỢC / KỸ THUẬT SỐ',
  heading: 'Dự án nổi bật',
  description:
    'Một câu chuyện thương hiệu mạnh mẽ bắt đầu từ sự rõ ràng về mục tiêu và khách hàng.',
  ctaLabel: 'Xem case study',
  ctaHref: '#',
};
const FRAMER_FIRMA_FEATURED_EN: FramerFirmaFeaturedContent = {
  imageUrl: '',
  category: 'STRATEGY / DIGITAL',
  heading: 'Featured Project',
  description:
    'A strong brand story starts with clarity about goals and customers.',
  ctaLabel: 'Case Study',
  ctaHref: '#',
};

// ── Framer-native: Aestha Editorial ────────────────────────────────────
const FRAMER_AESTHA_EDITORIAL_VI: FramerAesthaEditorialContent = {
  brand: 'RAMSA',
  tagline: 'Nơi thanh lịch cổ điển gặp gỡ tinh tế hiện đại.',
  scrollLabel: 'scroll',
  description:
    'Tọa lạc giữa lòng đô thị, dự án là hiện thân cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại.',
  image1Url:
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  image2Url:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
  image3Url:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
  ctaText: 'KHÁM PHÁ THÊM',
  ctaHref: '/projects',
  navLinks: [
    { label: 'Dự án', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Liên hệ', href: '/contact' },
  ],
};
const FRAMER_AESTHA_EDITORIAL_EN: FramerAesthaEditorialContent = {
  brand: 'RAMSA',
  tagline: 'Where classic elegance meets modern refinement.',
  scrollLabel: 'scroll',
  description:
    'Nestled in the heart of the city, the project embodies refined urban living — every detail tuned to the demands of modern luxury.',
  image1Url:
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  image2Url:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
  image3Url:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
  ctaText: 'EXPLORE MORE',
  ctaHref: '/projects',
  navLinks: [
    { label: 'Projects', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Contact', href: '/contact' },
  ],
};

// ── Framer-native: Aestha Project Detail ───────────────────────────────
const FRAMER_AESTHA_PROJECT_DETAIL_VI: FramerAesthaProjectDetailContent = {
  projectTitle: 'TẦM NHÌN',
  sectionLabel: 'Khái niệm',
  body: 'Tọa lạc giữa lòng đô thị, dự án là biểu tượng cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại.\n\nTòa tháp 36 tầng với 62 căn hộ cao cấp từ studio đến penthouse 4 phòng ngủ.',
  images: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
      aspect: '5:4',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      aspect: '4:5',
    },
  ],
  nextLabel: 'Dự án tiếp theo',
  nextProjectText: 'Kiến trúc',
  nextProjectHref: '#',
  navLinks: [
    { label: 'Dự án', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Liên hệ', href: '/contact' },
  ],
};
const FRAMER_AESTHA_PROJECT_DETAIL_EN: FramerAesthaProjectDetailContent = {
  projectTitle: 'VISION',
  sectionLabel: 'Concept',
  body: 'Nestled in the heart of the city, the project embodies refined urban living — every detail tuned to the demands of modern luxury.\n\nA 36-story tower housing 62 sophisticated condominiums from studios to four-bedroom penthouses.',
  images: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
      aspect: '5:4',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
      aspect: '4:5',
    },
  ],
  nextLabel: 'Next project',
  nextProjectText: 'Architecture',
  nextProjectHref: '#',
  navLinks: [
    { label: 'Projects', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Contact', href: '/contact' },
  ],
};

// ── Framer-native: Perform About ───────────────────────────────────────
const FRAMER_PERFORM_ABOUT_VI: FramerPerformAboutContent = {
  testimonials: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
      textHighlight:
        'Hành trình triathlon của tôi bắt đầu từ những khó khăn về kỹ thuật và sức bền.',
      textRest:
        'Giờ đây, tôi hướng dẫn người khác đạt được tiềm năng tối đa của họ.',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
      textHighlight: 'Phương pháp huấn luyện kết hợp thể chất và tinh thần,',
      textRest:
        'giúp vận động viên xây dựng sức mạnh và tự tin để vượt qua giới hạn.',
    },
  ],
};
const FRAMER_PERFORM_ABOUT_EN: FramerPerformAboutContent = {
  testimonials: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1024&q=80',
      textHighlight:
        'I started my triathlon journey struggling with balance and technique.',
      textRest: 'Now, I guide others to achieve their full potential.',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
      textHighlight:
        'My coaching blends physical training and mental strategies,',
      textRest:
        'helping athletes build strength and confidence to overcome their limits.',
    },
  ],
};

// ── Framer-native: Perform Pricing ─────────────────────────────────────
const FRAMER_PERFORM_PRICING_VI: FramerPerformPricingContent = {
  eyebrow: 'Pricing',
  heading: 'Chọn gói của bạn',
  subheading:
    'Chọn gói phù hợp với mục tiêu tập luyện. Hủy hoặc nâng cấp bất cứ lúc nào.',
  tiers: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
      price: '$59/tháng',
      title: 'Cơ bản',
      features:
        'Tư vấn ban đầu miễn phí\nCập nhật kế hoạch tập 2 tuần/lần\nKiểm tra hàng tuần',
      ctaLabel: 'Liên hệ',
      ctaHref: '#contact',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
      price: '$99/tháng',
      title: 'Tiêu chuẩn',
      features:
        'Tất cả của gói trước\nXây dựng chiến lược đua cụ thể\nƯu đãi từ đối tác',
      ctaLabel: 'Liên hệ',
      ctaHref: '#contact',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
      price: '$169/tháng',
      title: 'Cao cấp',
      features:
        'Tất cả của gói trước\nCập nhật kế hoạch không giới hạn\nHỗ trợ tư duy hiệu suất tối ưu',
      ctaLabel: 'Liên hệ',
      ctaHref: '#contact',
    },
  ],
};
const FRAMER_PERFORM_PRICING_EN: FramerPerformPricingContent = {
  eyebrow: 'Pricing',
  heading: 'Choose your plan',
  subheading:
    'Pick the plan that fits your training goals. Cancel or upgrade any time.',
  tiers: [
    {
      imageUrl:
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1024&q=80',
      price: '$59/month',
      title: 'Basic',
      features:
        'Free initial consultation\n1x per 2 weeks training plan update\nWeekly checking',
      ctaLabel: 'Get in touch',
      ctaHref: '#contact',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1486218119243-13883505764c?w=1024&q=80',
      price: '$99/month',
      title: 'Standard',
      features:
        'All of the previous\nDevelopment of a specific race strategy\nBenefits from my partners',
      ctaLabel: 'Get in touch',
      ctaHref: '#contact',
    },
    {
      imageUrl:
        'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1024&q=80',
      price: '$169/month',
      title: 'Premium',
      features:
        'All of the previous\nUnlimited plan updates and modifications\nWorking together on mindset for optimal performance',
      ctaLabel: 'Get in touch',
      ctaHref: '#contact',
    },
  ],
};

// Derive từ registry BLOCK_TYPE_META (nguồn duy nhất) — thêm block type mới
// chỉ cần thêm 1 entry ở types.ts, map này tự đầy đủ.
const NAME_BY_TYPE: Record<BlockType, string> = Object.fromEntries(
  Object.values(BLOCK_TYPE_META).map(m => [m.type, m.defaultName])
) as Record<BlockType, string>;

const LEGACY_EMBED_EMPTY: BlockContent = { schemaId: '' };

const DEFAULTS_VI: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_VI,
  hero_overlay: HERO_OVERLAY_VI,
  feature_section: FEATURE_VI,
  photo_gallery: GALLERY_VI,
  booking_form: BOOKING_VI,
  cta_section: CTA_VI,
  mint_details: MINT_DETAILS_VI,
  mint_sku: MINT_SKU_VI,
  mint_hero: MINT_HERO_VI,
  mint_variants: MINT_VARIANTS_VI,
  mint_discover: MINT_DISCOVER_VI,
  mintv2_emblem: MINTV2_EMBLEM_VI,
  mintv2_services: MINTV2_SERVICES_VI,
  mintv2_manifesto: MINTV2_MANIFESTO_VI,
  mintv2_process: MINTV2_PROCESS_VI,
  mintv2_cta: MINTV2_CTA_VI,
  mintv2_works: MINTV2_WORKS_VI,
  linea_portfolio: LINEA_PORTFOLIO_VI,
  image_carousel: CAROUSEL_VI,
  stories: STORIES_VI,
  split_screen: SPLIT_VI,
  quiz: QUIZ_VI,
  poll: POLL_VI,
  carousel_3d: CAROUSEL_3D_VI,
  flipbook: FLIPBOOK_VI,
  panorama: PANORAMA_VI,
  text_displace_hero: TEXT_DISPLACE_HERO_VI,
  image_trail: IMAGE_TRAIL_VI,
  sticky_scroll_cards: STICKY_SCROLL_CARDS_VI,
  gallery_3d_depth: GALLERY_3D_DEPTH_VI,
  parallax_hero: PARALLAX_HERO_VI,
  lightbox_flip: LIGHTBOX_FLIP_VI,
  flip_gallery: FLIP_GALLERY_VI,
  wheel_gallery: WHEEL_GALLERY_VI,
  hover_reveal_list: HOVER_REVEAL_LIST_VI,
  hover_grid_reveal: HOVER_GRID_REVEAL_VI,
  hover_equalizer_heading: HOVER_EQ_HEADING_VI,
  image_explosion: IMAGE_EXPLOSION_VI,
  card_showcase: CARD_SHOWCASE_VI,
  story_slides: STORY_SLIDES_VI,
  flip_showreel: FLIP_SHOWREEL_VI,
  peel_reveal: PEEL_REVEAL_VI,
  accordion_media: ACCORDION_MEDIA_VI,
  pricing_table: PRICING_TABLE_VI,
  image_banner: IMAGE_BANNER_VI,
  video_gallery: VIDEO_GALLERY_VI,
  spotlight: SPOTLIGHT_VI,
  process_steps: PROCESS_STEPS_VI,
  dot_matrix: DOT_MATRIX_VI,
  interactive_grid: INTERACTIVE_GRID_VI,
  pixel_reveal: PIXEL_REVEAL_VI,
  marquee_band: MARQUEE_BAND_VI,
  letter_slider: LETTER_SLIDER_VI,
  svg_morph_overlay: SVG_MORPH_OVERLAY_VI,
  gallery_pan_lens: GALLERY_PAN_LENS_VI,
  seamless_scroll_gallery: SEAMLESS_SCROLL_GALLERY_VI,
  product_spec_sheet: PRODUCT_SPEC_SHEET_VI,
  framer_yume_hero: FRAMER_YUME_HERO_VI,
  framer_yuya_hero: FRAMER_YUYA_HERO_VI,
  framer_arpeggio_hero: FRAMER_ARPEGGIO_HERO_VI,
  framer_delvaux_hero_intro: FRAMER_DELVAUX_HERO_INTRO_VI,
  framer_hero: FRAMER_HERO_VI,
  framer_perform_hero: FRAMER_PERFORM_HERO_VI,
  framer_perform_hero_v2: FRAMER_PERFORM_HERO_V2_VI,
  framer_bungee_hero: FRAMER_BUNGEE_HERO_VI,
  framer_mobius_hero: FRAMER_MOBIUS_HERO_VI,
  framer_avexa_hero: FRAMER_AVEXA_HERO_VI,
  framer_intro_redefined: FRAMER_INTRO_REDEFINED_VI,
  framer_paradigm_title: FRAMER_PARADIGM_TITLE_VI,
  framer_explore_cta: FRAMER_EXPLORE_CTA_VI,
  framer_studio_manifesto: FRAMER_STUDIO_MANIFESTO_VI,
  framer_large_quote: FRAMER_LARGE_QUOTE_VI,
  framer_stats_grid: FRAMER_STATS_GRID_VI,
  framer_projects_grid: FRAMER_PROJECTS_GRID_VI,
  framer_team_directory: FRAMER_TEAM_DIRECTORY_VI,
  framer_image_stagger: FRAMER_IMAGE_STAGGER_VI,
  framer_horizontal_scroll: FRAMER_HORIZONTAL_SCROLL_VI,
  framer_avexa_bento: FRAMER_AVEXA_BENTO_VI,
  framer_clarity_services: FRAMER_CLARITY_SERVICES_VI,
  framer_velora_services: FRAMER_VELORA_SERVICES_VI,
  framer_firma_featured: FRAMER_FIRMA_FEATURED_VI,
  framer_contact_footer: FRAMER_CONTACT_FOOTER_VI,
  framer_faq_minimal: FRAMER_FAQ_MINIMAL_VI,
  framer_finnegan_expertise: FRAMER_FINNEGAN_EXPERTISE_VI,
  framer_darling_timeline: FRAMER_DARLING_TIMELINE_VI,
  framer_signature_feature: FRAMER_SIGNATURE_FEATURE_VI,
  framer_vs_collins_projects: FRAMER_VS_COLLINS_PROJECTS_VI,
  framer_aestha_editorial: FRAMER_AESTHA_EDITORIAL_VI,
  framer_aestha_project_detail: FRAMER_AESTHA_PROJECT_DETAIL_VI,
  framer_perform_about: FRAMER_PERFORM_ABOUT_VI,
  framer_perform_pricing: FRAMER_PERFORM_PRICING_VI,
  legacy_embed: LEGACY_EMBED_EMPTY,
};
const DEFAULTS_EN: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_EN,
  hero_overlay: HERO_OVERLAY_EN,
  feature_section: FEATURE_EN,
  photo_gallery: GALLERY_EN,
  booking_form: BOOKING_EN,
  cta_section: CTA_EN,
  mint_details: MINT_DETAILS_VI,
  mint_sku: MINT_SKU_VI,
  mint_hero: MINT_HERO_VI,
  mint_variants: MINT_VARIANTS_VI,
  mint_discover: MINT_DISCOVER_VI,
  mintv2_emblem: MINTV2_EMBLEM_VI,
  mintv2_services: MINTV2_SERVICES_VI,
  mintv2_manifesto: MINTV2_MANIFESTO_VI,
  mintv2_process: MINTV2_PROCESS_VI,
  mintv2_cta: MINTV2_CTA_VI,
  mintv2_works: MINTV2_WORKS_VI,
  linea_portfolio: LINEA_PORTFOLIO_VI,
  image_carousel: CAROUSEL_EN,
  stories: STORIES_EN,
  split_screen: SPLIT_EN,
  quiz: QUIZ_EN,
  poll: POLL_EN,
  carousel_3d: CAROUSEL_3D_EN,
  flipbook: FLIPBOOK_EN,
  panorama: PANORAMA_EN,
  text_displace_hero: TEXT_DISPLACE_HERO_EN,
  image_trail: IMAGE_TRAIL_EN,
  sticky_scroll_cards: STICKY_SCROLL_CARDS_EN,
  gallery_3d_depth: GALLERY_3D_DEPTH_EN,
  parallax_hero: PARALLAX_HERO_EN,
  lightbox_flip: LIGHTBOX_FLIP_EN,
  flip_gallery: FLIP_GALLERY_EN,
  wheel_gallery: WHEEL_GALLERY_EN,
  hover_reveal_list: HOVER_REVEAL_LIST_EN,
  hover_grid_reveal: HOVER_GRID_REVEAL_EN,
  hover_equalizer_heading: HOVER_EQ_HEADING_EN,
  image_explosion: IMAGE_EXPLOSION_EN,
  card_showcase: CARD_SHOWCASE_EN,
  story_slides: STORY_SLIDES_EN,
  flip_showreel: FLIP_SHOWREEL_EN,
  peel_reveal: PEEL_REVEAL_EN,
  accordion_media: ACCORDION_MEDIA_EN,
  pricing_table: PRICING_TABLE_EN,
  image_banner: IMAGE_BANNER_EN,
  video_gallery: VIDEO_GALLERY_EN,
  spotlight: SPOTLIGHT_EN,
  process_steps: PROCESS_STEPS_EN,
  dot_matrix: DOT_MATRIX_EN,
  interactive_grid: INTERACTIVE_GRID_EN,
  pixel_reveal: PIXEL_REVEAL_EN,
  marquee_band: MARQUEE_BAND_EN,
  letter_slider: LETTER_SLIDER_EN,
  svg_morph_overlay: SVG_MORPH_OVERLAY_EN,
  gallery_pan_lens: GALLERY_PAN_LENS_EN,
  seamless_scroll_gallery: SEAMLESS_SCROLL_GALLERY_EN,
  product_spec_sheet: PRODUCT_SPEC_SHEET_EN,
  framer_yume_hero: FRAMER_YUME_HERO_EN,
  framer_yuya_hero: FRAMER_YUYA_HERO_EN,
  framer_arpeggio_hero: FRAMER_ARPEGGIO_HERO_EN,
  framer_delvaux_hero_intro: FRAMER_DELVAUX_HERO_INTRO_EN,
  framer_hero: FRAMER_HERO_EN,
  framer_perform_hero: FRAMER_PERFORM_HERO_EN,
  framer_perform_hero_v2: FRAMER_PERFORM_HERO_V2_EN,
  framer_bungee_hero: FRAMER_BUNGEE_HERO_EN,
  framer_mobius_hero: FRAMER_MOBIUS_HERO_EN,
  framer_avexa_hero: FRAMER_AVEXA_HERO_EN,
  framer_intro_redefined: FRAMER_INTRO_REDEFINED_EN,
  framer_paradigm_title: FRAMER_PARADIGM_TITLE_EN,
  framer_explore_cta: FRAMER_EXPLORE_CTA_EN,
  framer_studio_manifesto: FRAMER_STUDIO_MANIFESTO_EN,
  framer_large_quote: FRAMER_LARGE_QUOTE_EN,
  framer_stats_grid: FRAMER_STATS_GRID_EN,
  framer_projects_grid: FRAMER_PROJECTS_GRID_EN,
  framer_team_directory: FRAMER_TEAM_DIRECTORY_EN,
  framer_image_stagger: FRAMER_IMAGE_STAGGER_EN,
  framer_horizontal_scroll: FRAMER_HORIZONTAL_SCROLL_EN,
  framer_avexa_bento: FRAMER_AVEXA_BENTO_EN,
  framer_clarity_services: FRAMER_CLARITY_SERVICES_EN,
  framer_velora_services: FRAMER_VELORA_SERVICES_EN,
  framer_firma_featured: FRAMER_FIRMA_FEATURED_EN,
  framer_contact_footer: FRAMER_CONTACT_FOOTER_EN,
  framer_faq_minimal: FRAMER_FAQ_MINIMAL_EN,
  framer_finnegan_expertise: FRAMER_FINNEGAN_EXPERTISE_EN,
  framer_darling_timeline: FRAMER_DARLING_TIMELINE_EN,
  framer_signature_feature: FRAMER_SIGNATURE_FEATURE_EN,
  framer_vs_collins_projects: FRAMER_VS_COLLINS_PROJECTS_EN,
  framer_aestha_editorial: FRAMER_AESTHA_EDITORIAL_EN,
  framer_aestha_project_detail: FRAMER_AESTHA_PROJECT_DETAIL_EN,
  framer_perform_about: FRAMER_PERFORM_ABOUT_EN,
  framer_perform_pricing: FRAMER_PERFORM_PRICING_EN,
  legacy_embed: LEGACY_EMBED_EMPTY,
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

/**
 * Create a `legacy_embed` block wrapping a registry legacy/framer block.
 * The renderer resolves the design via `getLegacyBlock(schemaId)`.
 */
export function createLegacyBlock(schemaId: string, name: string): Block {
  const content: BlockContent = { schemaId, legacyName: name };
  return {
    id: genId(),
    blockType: 'legacy_embed',
    name: name || 'Legacy block',
    contentVi: { desktop: structuredClone(content) },
    contentEn: { desktop: structuredClone(content) },
    isVisible: true,
  };
}

export function defaultContentFor(
  type: BlockType,
  lang: 'vi' | 'en'
): BlockContent {
  return structuredClone(lang === 'vi' ? DEFAULTS_VI[type] : DEFAULTS_EN[type]);
}
