import { genId } from './ids';
import { BLOCK_TYPE_META } from './types';
import { getBlockDef } from './blocks/_registry/registry';
import { delvauxDetailsDef } from './blocks/_registry/defs/delvauxDetails';
import { delvauxHeaderDef } from './blocks/_registry/defs/delvauxHeader';
import { delvauxHeroDef } from './blocks/_registry/defs/delvauxHero';
import { delvauxProductDef } from './blocks/_registry/defs/delvauxProduct';
import { delvauxSubnavDef } from './blocks/_registry/defs/delvauxSubnav';
import { delvauxVariantDef } from './blocks/_registry/defs/delvauxVariant';
import { gambitProductOverviewDef } from './blocks/_registry/defs/gambitProductOverview';
import { gambitDelvauxIntroDef } from './blocks/_registry/defs/gambitDelvauxIntro';
import { lusionLpRevealDef } from './blocks/_registry/defs/lusionLpReveal';
import { gambitProductDetailsDef } from './blocks/_registry/defs/gambitProductDetails';
import { gambitBrandHeritageDef } from './blocks/_registry/defs/gambitBrandHeritage';
import { gambitRelatedProductsDef } from './blocks/_registry/defs/gambitRelatedProducts';
import { gambitSectionNavDef } from './blocks/_registry/defs/gambitSectionNav';
import { framerAesthaEditorialDef } from './blocks/_registry/defs/framerAesthaEditorial';
import { aesthaExploreDef } from './blocks/_registry/defs/aesthaExplore';
import { aesthaStudioDef } from './blocks/_registry/defs/aesthaStudio';
import { aesthaContactDef } from './blocks/_registry/defs/aesthaContact';
import { aesthaProjectDef } from './blocks/_registry/defs/aesthaProject';
import { aesthaNavDef } from './blocks/_registry/defs/aesthaNav';
import { q80ExperienceDef } from './blocks/_registry/defs/q80Experience';
import { q80MenuDef } from './blocks/_registry/defs/q80Menu';
import { housentHeroDef } from './blocks/_registry/defs/housentHero';
import { alturaOlympusDef } from './blocks/_registry/defs/alturaOlympus';
import { heroScrollDef } from './blocks/_registry/defs/heroScroll';
import { citeFlowHeroDef } from './blocks/_registry/defs/citeFlowHero';
import { citeFlowIntroDef } from './blocks/_registry/defs/citeFlowIntro';
import { citeFlowStatsDef } from './blocks/_registry/defs/citeFlowStats';
import { citeFlowFaqDef } from './blocks/_registry/defs/citeFlowFaq';
import { citeFlowAmenityDef } from './blocks/_registry/defs/citeFlowAmenity';
import { citeFlowGalleryDef } from './blocks/_registry/defs/citeFlowGallery';
import { citeFlowHeaderDef } from './blocks/_registry/defs/citeFlowHeader';
import { citeFlowFooterDef } from './blocks/_registry/defs/citeFlowFooter';
import { citeFlowContactFormDef } from './blocks/_registry/defs/citeFlowContactForm';
import { citeFlowSignatureDef } from './blocks/_registry/defs/citeFlowSignature';
import { scrollMattisDef } from './blocks/_registry/defs/scrollMattis';
import { coolHunterHeroDef } from './blocks/_registry/defs/coolHunterHero';
import { belgoBrewingProcessDef } from './blocks/_registry/defs/belgoBrewingProcess';
import { belgoFooterDef } from './blocks/_registry/defs/belgoFooter';
import { belgoHeroDef } from './blocks/_registry/defs/belgoHero';
import { belgoAboutProductDef } from './blocks/_registry/defs/belgoAboutProduct';
import { belgoScrollFramesDef } from './blocks/_registry/defs/belgoScrollFrames';
import { belgoOurProductsDef } from './blocks/_registry/defs/belgoOurProducts';
import { belgoMoreFlavorsDef } from './blocks/_registry/defs/belgoMoreFlavors';
import { coolHunterSectionProgressDef } from './blocks/_registry/defs/coolHunterSectionProgress';
import { coolHunterStoryDef } from './blocks/_registry/defs/coolHunterStory';
import { coolHunterGalleryDef } from './blocks/_registry/defs/coolHunterGallery';
import { scrollImgScaleDef } from './blocks/_registry/defs/scrollImgScale';
import { letterSliderDef } from './blocks/_registry/defs/letterSlider';
import { cgModularSliderDef } from './blocks/_registry/defs/cgModularSlider';
import { cgResponsiveTeamDef } from './blocks/_registry/defs/cgResponsiveTeam';
import { cgRadgaHorizontalDef } from './blocks/_registry/defs/cgRadgaHorizontal';
import { cgPageTransitionsDef } from './blocks/_registry/defs/cgPageTransitions';
import { cgResponsiveLandingLoaderDef } from './blocks/_registry/defs/cgResponsiveLandingLoader';
import { cgLandingPageRevealDef } from './blocks/_registry/defs/cgLandingPageReveal';
import { cg3dSliderDef } from './blocks/_registry/defs/cg3dSlider';
import { coolHunterProductDef } from './blocks/_registry/defs/coolHunterProduct';
import { coolHunterQuoteDef } from './blocks/_registry/defs/coolHunterQuote';
import { coolHunterFooterDef } from './blocks/_registry/defs/coolHunterFooter';
import { lineaPortfolioDef } from './blocks/_registry/defs/lineaPortfolio';
import { pnjHeroDef } from './blocks/_registry/defs/pnjHero';
import { pnjDetailsDef } from './blocks/_registry/defs/pnjDetails';
import { mintDiscoverDef } from './blocks/_registry/defs/mintDiscover';
import { pnjVariantDef } from './blocks/_registry/defs/pnjVariant';
import { pnjHeaderDef } from './blocks/_registry/defs/pnjHeader';
import { belgoHeaderDef } from './blocks/_registry/defs/belgoHeader';
import { pnjStickyMenuDef } from './blocks/_registry/defs/pnjStickyMenu';
import { pnjCtaDef } from './blocks/_registry/defs/pnjCta';
import { theGrandIntroDef } from './blocks/_registry/defs/theGrandIntro';
import { theGrandLocationDef } from './blocks/_registry/defs/theGrandLocation';
import { theGrandDiscoverDef } from './blocks/_registry/defs/theGrandDiscover';
import { theGrandServiceDef } from './blocks/_registry/defs/theGrandService';
import { theGrandAboutDef } from './blocks/_registry/defs/theGrandAbout';
import { theGrandFooterDef } from './blocks/_registry/defs/theGrandFooter';
import { housentStatsDef } from './blocks/_registry/defs/housentStats';
import { housentListingsDef } from './blocks/_registry/defs/housentListings';
import { housentCtaDef } from './blocks/_registry/defs/housentCta';
import { housentFooterDef } from './blocks/_registry/defs/housentFooter';
import { housentAboutDef } from './blocks/_registry/defs/housentAbout';
import { housentExcellenceDef } from './blocks/_registry/defs/housentExcellence';
import { housentOurExcellenceDef } from './blocks/_registry/defs/housentOurExcellence';
import { housentSolutionsDef } from './blocks/_registry/defs/housentSolutions';
import { housentValuesDef } from './blocks/_registry/defs/housentValues';
import { housentFaqDef } from './blocks/_registry/defs/housentFaq';
import { housentTestimonialDef } from './blocks/_registry/defs/housentTestimonial';
import { housentBlogsDef } from './blocks/_registry/defs/housentBlogs';
import { lumeaHeroDef } from './blocks/_registry/defs/lumeaHero';
import { lumeaStatementDef } from './blocks/_registry/defs/lumeaStatement';
import { lumeaImmersiveDef } from './blocks/_registry/defs/lumeaImmersive';
import { lumeaHandcraftedDef } from './blocks/_registry/defs/lumeaHandcrafted';
import { lumeaAmenitiesDef } from './blocks/_registry/defs/lumeaAmenities';
import { lumeaTestimonialDef } from './blocks/_registry/defs/lumeaTestimonial';
import { lumeaGalleryDef } from './blocks/_registry/defs/lumeaGallery';
import { lumeaFooterDef } from './blocks/_registry/defs/lumeaFooter';
import { nordhavenHeroDef } from './blocks/_registry/defs/nordhavenHero';
import { nordhavenAboutDef } from './blocks/_registry/defs/nordhavenAbout';
import { nordhavenServicesDef } from './blocks/_registry/defs/nordhavenServices';
import { nordhavenPropertiesDef } from './blocks/_registry/defs/nordhavenProperties';
import { nordhavenTestimonialsDef } from './blocks/_registry/defs/nordhavenTestimonials';
import { nordhavenFaqDef } from './blocks/_registry/defs/nordhavenFaq';
import { nordhavenGalleryDef } from './blocks/_registry/defs/nordhavenGallery';
import { nordhavenFooterDef } from './blocks/_registry/defs/nordhavenFooter';
import { firmaHeroDef } from './blocks/_registry/defs/firmaHero';
import { firmaStatementDef } from './blocks/_registry/defs/firmaStatement';
import { firmaWorkDef } from './blocks/_registry/defs/firmaWork';
import { firmaTestimonialDef } from './blocks/_registry/defs/firmaTestimonial';
import { firmaServicesDef } from './blocks/_registry/defs/firmaServices';
import { firmaFooterDef } from './blocks/_registry/defs/firmaFooter';
import { ignitexHeroDef } from './blocks/_registry/defs/ignitexHero';
import { ignitexServicesDef } from './blocks/_registry/defs/ignitexServices';
import { ignitexProjectsDef } from './blocks/_registry/defs/ignitexProjects';
import { ignitexAboutDef } from './blocks/_registry/defs/ignitexAbout';
import { ignitexCtaDef } from './blocks/_registry/defs/ignitexCta';
import { ignitexFooterDef } from './blocks/_registry/defs/ignitexFooter';
import { readymagMarqueeDef } from './blocks/_registry/defs/readymagMarquee';
import { readymagProjectsDef } from './blocks/_registry/defs/readymagProjects';
import { readymagFooterDef } from './blocks/_registry/defs/readymagFooter';
import { protectionScrollytellingDef } from './blocks/_registry/defs/protectionScrollytelling';
import { framerFlatWhiteProcessDef } from './blocks/_registry/defs/framerFlatWhiteProcess';
import { framerEstanciaAboutUsDef } from './blocks/_registry/defs/framerEstanciaAboutUs';
import { rolexCollectionHeroDef } from './blocks/_registry/defs/rolexCollectionHero';
import { rolexCollectionNavDef } from './blocks/_registry/defs/rolexCollectionNav';
import { rolexContactDef } from './blocks/_registry/defs/rolexContact';
import { rolexCollectionWorkDef } from './blocks/_registry/defs/rolexCollectionWork';
import { rolexCollectionProjectDef } from './blocks/_registry/defs/rolexCollectionProject';
import { framerDarlingTimelineDef } from './blocks/_registry/defs/framerDarlingTimeline';
import { framerPerformAboutDef } from './blocks/_registry/defs/framerPerformAbout';
import { framerPerformPricingDef } from './blocks/_registry/defs/framerPerformPricing';
import { framerNftpullTimelineDef } from './blocks/_registry/defs/framerNftpullTimeline';
import { springsContactFooterDef } from './blocks/_registry/defs/springsContactFooter';
import { springsDesignDef } from './blocks/_registry/defs/springsDesign';
import { springsHeaderDef } from './blocks/_registry/defs/springsHeader';
import { springsGalleryDef } from './blocks/_registry/defs/springsGallery';
import { springsHeroDef } from './blocks/_registry/defs/springsHero';
import { springsInteriorsDef } from './blocks/_registry/defs/springsInteriors';
import { springsIntroDef } from './blocks/_registry/defs/springsIntro';
import { springsMapDef } from './blocks/_registry/defs/springsMap';
import { realEstateHeroDef } from './blocks/_registry/defs/realEstateHero';
import { realEstateInfoDef } from './blocks/_registry/defs/realEstateInfo';
import { realEstateLocationDef } from './blocks/_registry/defs/realEstateLocation';
import { realEstateHighlightsDef } from './blocks/_registry/defs/realEstateHighlights';
import { realEstateOverviewDef } from './blocks/_registry/defs/realEstateOverview';
import { realEstateUtilitiesDef } from './blocks/_registry/defs/realEstateUtilities';
import { realEstateVillaDef } from './blocks/_registry/defs/realEstateVilla';
import { springsNaturePlaceDef } from './blocks/_registry/defs/springsNaturePlace';
import { springsResidencesDef } from './blocks/_registry/defs/springsResidences';
import { springsWellnessDef } from './blocks/_registry/defs/springsWellness';
import { sustainitOurExpertiseDef } from './blocks/_registry/defs/sustainitOurExpertise';
import { MEDIA, pickMedia } from './blocks/sample-media';
import { masteriseHomeInsideDef } from './blocks/_registry/defs/masteriseHomeInside';
import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';
import { readymagCaseSectionDef } from './blocks/_registry/defs/readymagCaseSection';
import { framerIgnitexStepDef } from './blocks/_registry/defs/framerIgnitexStep';
import { framerRealEstate02StoryDef } from './blocks/_registry/defs/framerRealEstate02Story';
import { framerRealEstate02QuoteDef } from './blocks/_registry/defs/framerRealEstate02Quote';
import { framerRealEstate02ProductDef } from './blocks/_registry/defs/framerRealEstate02Product';
import { framerRealEstate02OverviewDef } from './blocks/_registry/defs/framerRealEstate02Overview';
import { framerRealEstate02LocationDef } from './blocks/_registry/defs/framerRealEstate02Location';
import { framerRealEstate02CommuteDef } from './blocks/_registry/defs/framerRealEstate02Commute';
import { framerRealEstate02MapDef } from './blocks/_registry/defs/framerRealEstate02Map';
import { framerRealEstate02GalleryDef } from './blocks/_registry/defs/framerRealEstate02Gallery';
import { framerRealEstate02MenuDef } from './blocks/_registry/defs/framerRealEstate02Menu';
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
  MintV2EmblemContent,
  MintV2ServicesContent,
  MintV2ManifestoContent,
  MintV2ProcessContent,
  MintV2CtaContent,
  MintV2WorksContent,
  MintVaultHeroContent,
  MintVaultCraftContent,
  MintVaultRevealContent,
  MintVaultCollectionContent,
  MintVaultInvitationContent,
  MintVaultCoin,
  FeatureSectionContent,
  FlipbookContent,
  FramerArpeggioHeroV2Content,
  FramerBungeeHeroV2Content,
  FramerPurevisualsHeroContent,
  FramerExploreCtaContent,
  FramerPerformHeroContent,
  FramerIntroRedefinedContent,
  FramerImageStaggerContent,
  FramerProjectsGridContent,
  FramerStatsGridContent,
  FramerTeamDirectoryContent,
  FramerStudioManifestoContent,
  FramerYumeHeroContent,
  HeroOverlayContent,
  HeroSplitContent,
  ImageCarouselContent,
  InteractiveAdWidgetContent,
  BrightedgeHeroContent,
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
  HoverEqualizerHeadingContent,
  BrutalistTextContent,
  ImageExplosionContent,
  StorySlidesContent,
  AccordionMediaContent,
  SpotlightContent,
  ProcessStepsContent,
  DotMatrixContent,
  InteractiveGridContent,
  PixelRevealContent,
  MarqueeBandContent,
  SeamlessScrollGalleryContent,
  ProductSpecSheetContent,
  PollContent,
  QuizContent,
  SplitScreenContent,
  StoriesContent,
  FramerFaqMinimalContent,
  FramerSignatureFeatureContent,
  FramerVsCollinsProjectsContent,
  FramerClarityServicesContent,
} from './types';
import { framerFirmaTemplateStrategyDigitalDef } from './blocks/_registry/defs/framerFirmaTemplateStrategyDigital';

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
  discover: {
    title: 'The Jack Pine by Tom Thomson — 1 Kilo Pure Gold Coin',
    badge: 'Mintage 75',
    subtitle: '99.99% Pure Gold · Proof',
    dimensions: 'Weight: 1006.1 g / Diameter: 101.6 mm / Edge: Serrated',
    faceValue: 'CAD $2,500',
    detailsText: [
      'REF. 252469',
      'Composition: 99.99% pure gold',
      'Weight: 1006.1 g',
      'Diameter: 101.6 mm · Edge: serrated',
      'Finish: proof',
      'Face value: CAD $2,500',
      'Worldwide mintage: 75',
      'Obverse effigy: Steven Rosati',
      'Reverse: Tom Thomson’s “The Jack Pine” (1916–17)',
    ].join('\n'),
    packagingText:
      'Encapsulated and presented in a Royal Canadian Mint-branded wooden case with black beauty box. Includes a serialised certificate of authenticity.',
    shippingText:
      'Shipped fully insured. International availability subject to Royal Canadian Mint regional policies.',
  },
};
// mint_discover defaults → mintDiscoverDef (registry)

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
      bgColor: '#efe9dc',
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
      bgColor: '#efe9dc',
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
      bgColor: '#efe9dc',
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
      bgColor: '#efe9dc',
    },
  ],
};

// ── Import từ 360-admin-cms ──────────────────────────────────────────────

// ── Mint2026 "The Vault" defaults ────────────────────────────────────────
const VAULT_U = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;

const MINT_VAULT_HERO_VI: MintVaultHeroContent = {
  eyebrow: 'Royal Canadian Mint · 2026',
  title: 'The collection of a year.',
  description:
    'Thirty treasures in pure gold and silver. Struck in limited mintage, each with its own story.',
  hintText: 'Move your cursor to wake the vault',
  images: [
    MINT_IMG.coinObverse,
    MINT_IMG.coinReverse,
    MINT_IMG.coinPackaging,
    MINT_IMG.painting,
    VAULT_U('1610375461246-83df859d849d'),
    VAULT_U('1624365169364-0640dd10e180'),
    VAULT_U('1543699565-003b8adda5fc'),
    VAULT_U('1622467827417-bbe2237067a9'),
  ],
};

const MINT_VAULT_CRAFT_VI: MintVaultCraftContent = {
  eyebrow: 'III · The Craft',
  title: 'Why each coin is worth holding.',
  items: [
    {
      title: '99.99% Pure Gold',
      description:
        'Each coin is struck from precious metal of the highest standard. Value that endures over time.',
      imageUrl: VAULT_U('1624365169364-0640dd10e180'),
    },
    {
      title: 'Limited Mintage',
      description:
        'The mintage is sealed and never struck again. Scarcity is what creates the value.',
      imageUrl: VAULT_U('1582139329536-e7284fece509'),
    },
    {
      title: 'Proof Finish',
      description:
        'Hand-polished to collector grade, every detail of the engraving razor-sharp.',
      imageUrl: VAULT_U('1628058494685-6c2f796ac24a'),
    },
    {
      title: 'Backed by the Royal Canadian Mint',
      description:
        "Issued by Canada's national mint, trusted for over a century.",
      imageUrl: VAULT_U('1640549755250-04d2751c5aba'),
    },
  ],
};

const MINT_VAULT_REVEAL_VI: MintVaultRevealContent = {
  eyebrow: 'The vault opens',
  title: '30 treasures, one collection',
  images: [
    MINT_IMG.coinObverse,
    MINT_IMG.coinReverse,
    MINT_IMG.coinPackaging,
    MINT_IMG.painting,
    VAULT_U('1610375461246-83df859d849d'),
    VAULT_U('1624365169364-0640dd10e180'),
  ],
};

const MINT_VAULT_COIN = (
  key: string,
  name: string,
  image: string,
  metal: string,
  weight: string,
  price: string
): MintVaultCoin => ({ key, name, image, metal, weight, price, url: '#' });

const MINT_VAULT_COLLECTION_VI: MintVaultCollectionContent = {
  eyebrow: 'II · The Collection',
  subLabel: 'Most coveted first',
  coins: [
    MINT_VAULT_COIN(
      'c1',
      'The Jack Pine — 1 Kilo Pure Gold',
      MINT_IMG.coinReverse,
      'Gold',
      '1 kg',
      '$89,950'
    ),
    MINT_VAULT_COIN(
      'c2',
      'Charles III Effigy — 5 oz Gold',
      MINT_IMG.coinObverse,
      'Gold',
      '5 oz',
      '$49,900'
    ),
    MINT_VAULT_COIN(
      'c3',
      'Maple Heritage — 1 oz Gold Proof',
      VAULT_U('1610375461246-83df859d849d'),
      'Gold',
      '1 oz',
      '$3,250'
    ),
    MINT_VAULT_COIN(
      'c4',
      'Northern Lights — 2 oz Silver',
      VAULT_U('1624365169364-0640dd10e180'),
      'Silver',
      '2 oz',
      '$249'
    ),
    MINT_VAULT_COIN(
      'c5',
      'Presentation Case Edition',
      MINT_IMG.coinPackaging,
      'Gold',
      '1 oz',
      '$3,490'
    ),
    MINT_VAULT_COIN(
      'c6',
      'The Source Painting Tribute',
      MINT_IMG.painting,
      'Gold',
      '1 oz',
      '$3,150'
    ),
  ],
};

const MINT_VAULT_INVITATION_VI: MintVaultInvitationContent = {
  eyebrow: 'IV · The Invitation',
  title: 'Claim a treasure before it fades into history.',
  note: 'Limited release. Priority for the collector list.',
  backgroundImageUrl: VAULT_U('1624365169364-0640dd10e180'),
  images: [
    MINT_IMG.coinObverse,
    MINT_IMG.coinReverse,
    MINT_IMG.coinPackaging,
    VAULT_U('1610375461246-83df859d849d'),
  ],
  emailPlaceholder: 'Your email',
  submitText: 'Reserve yours',
  successMessage:
    'Thank you! We will reach out when the collection goes on sale.',
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

// ── BrightEdge hero (clone layout/animation — copy/ảnh placeholder) ─────
const BRIGHTEDGE_HERO: BrightedgeHeroContent = {
  eyebrow: 'Chúng tôi là studio thiết kế số',
  heading: 'Sáng tạo',
  subtitle:
    'Từ ý tưởng đến hiện thực — thiết kế đẹp có sức mạnh thu hút mọi ánh nhìn.',
  ctaLabel: 'Gặp đội ngũ',
  ctaHref: '#team',
  avatars: [
    { id: 'a1', imageUrl: '' },
    { id: 'a2', imageUrl: '' },
    { id: 'a3', imageUrl: '' },
    { id: 'a4', imageUrl: '' },
  ],
  badgeText: 'SÁNG TẠO • Ý TƯỞNG • GIẢI PHÁP • ',
  badgeSubtext: 'Kiến tạo giá trị khác biệt',
  imageUrl: '',
};

// ── Interactive ad widget ───────────────────────────────────────────────
const INTERACTIVE_AD_WIDGET: InteractiveAdWidgetContent = {
  slides: [
    {
      id: 'slide-1',
      backgroundType: 'image',
      backgroundUrl:
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      hotspots: [
        {
          id: 'hotspot-1',
          xPct: 50,
          yPct: 50,
          label: 'Xem chi tiết',
          ctaId: 'cta-1',
        },
      ],
      ctas: [
        {
          id: 'cta-1',
          label: 'Tìm hiểu thêm',
          href: '#',
          style: 'primary',
        },
      ],
    },
  ],
  closeable: true,
  autoplayMs: 4500,
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

const HOVER_EQ_HEADING_VI: HoverEqualizerHeadingContent = {
  heading: 'TRẢI NGHIỆM',
  peak: 2.2,
  neighbor: 1.6,
};
const HOVER_EQ_HEADING_EN: HoverEqualizerHeadingContent = {
  ...HOVER_EQ_HEADING_VI,
  heading: 'EXPERIENCE',
};

const BRUTALIST_TEXT_VI: BrutalistTextContent = {
  heading: 'BRUTALISM',
  echoCount: 3,
  layerStep: 0.09,
  textColor: '#FFFFFF',
  bgColor: '#000000',
};
const BRUTALIST_TEXT_EN: BrutalistTextContent = {
  ...BRUTALIST_TEXT_VI,
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
    'https://framerusercontent.com/images/j1OWdec3GtorzmtyEO583X355k.png',
  email: 'hello@yume.com',
  bio: "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!",
};
const FRAMER_YUME_HERO_EN: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };

// Hero - Yuya (v2): cùng content shape với Yume.
const FRAMER_YUYA_HERO_VI: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };
const FRAMER_YUYA_HERO_EN: FramerYumeHeroContent = { ...FRAMER_YUME_HERO_VI };

// ── Framer-native: Hero - Arpeggio v2 ───────────────────────────────────
// Default trỏ URL S3 (uploaded 2026-07-10) thay vì asset local —
// src/assets/images/arpeggio_hero_v2/hero.avif vẫn giữ làm fallback cuối
// cùng trong FramerArpeggioHeroV2.tsx (`backgroundUrl || ARPEGGIO_HERO_V2_BG`).
const FRAMER_ARPEGGIO_HERO_V2_VI: FramerArpeggioHeroV2Content = {
  backgroundUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/2d028b4d-641a-4696-920b-4f5dcf86bf39/arpeggio_hero_v2_bg.avif',
  headline: 'One subscription,\nunlimited design iterations.',
  subtitle: 'Freedom beyond the traditional project scope',
  topRightLabel: 'The Creative Agency—',
  wordmark: 'Arpeggio',
  wordmarkSuffix: '',
};
const FRAMER_ARPEGGIO_HERO_V2_EN: FramerArpeggioHeroV2Content = {
  ...FRAMER_ARPEGGIO_HERO_V2_VI,
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

// ── Framer-native: Hero - Bungee v2 (recon spec) ─────────────────────────
const FRAMER_BUNGEE_HERO_V2_VI: FramerBungeeHeroV2Content = {
  wordmarkUrl: '',
  subtitle: 'Studio sáng tạo đặt tại Gotham.',
  timerLabel: 'HN',
  link1Label: 'BE',
  link1Url: 'https://www.behance.net/',
  link2Label: 'DR',
  link2Url: 'https://dribbble.com/',
  link3Label: 'X',
  link3Url: 'https://x.com/',
  marqueeSpeed: 30,
  cardImages: [
    {
      imageUrl:
        'https://framerusercontent.com/images/LOSSn1XuJFxdkQeIdkzwe48fY.png',
    },
    {
      videoUrl:
        'https://framerusercontent.com/assets/o6ocbBu8Ta7VUr372p01yKOGtY.mp4',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/ui0xiw6ho8t85E3453z1YpP1M.png',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/GGQuG2gM9TePsmC84XEwEaDl3g.png',
    },
    {
      videoUrl:
        'https://framerusercontent.com/assets/y2VIDcwXz3puEBTpkCi51q9buBs.mp4',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/Fih75Xv1jAnsMiQgavGmyB6AgI.png',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/HfoXDGQsWsPpJU5TGy2N63TFYnc.png',
    },
    {
      imageUrl:
        'https://framerusercontent.com/images/mGQ8JCIsW2AAEHxOugX4Lrge2s.png',
    },
  ],
  accentColor: 'rgb(30, 30, 30)',
};
const FRAMER_BUNGEE_HERO_V2_EN: FramerBungeeHeroV2Content = {
  ...FRAMER_BUNGEE_HERO_V2_VI,
  subtitle: 'Creative studio based in Gotham.',
};

// ── Framer-native: Hero - PureVisuals (Flash Screen Reveal) ──────────────────
const FRAMER_PUREVISUALS_HERO_VI: FramerPurevisualsHeroContent = {
  leftImageUrl:
    'https://framerusercontent.com/images/47vWLizj8nJWWX1ItmZK8MEspc.png',
  rightImageUrl:
    'https://framerusercontent.com/images/YDcBLDpZXBmQp6m1BDMjM5L5s.png',
  eyebrow: 'PureVisuals',
  heading: 'PureVisuals',
  subheading: 'Blending creativity & strategy',
  bgColor: '#ffffff',
  textColor: '#0a0a0a',
};
const FRAMER_PUREVISUALS_HERO_EN: FramerPurevisualsHeroContent = {
  ...FRAMER_PUREVISUALS_HERO_VI,
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

// ── Framer-native: Clarity Services ────────────────────────────────────
const FRAMER_CLARITY_SERVICES_VI: FramerClarityServicesContent = {
  bgColor: '#ffffff',
  cardBg: '#f3f6e6',
  centerImageUrl:
    'https://framerusercontent.com/images/jOJJM3SIzRix55uIXIomAXX4YIk.png',
  services: [
    {
      iconUrl:
        'https://framerusercontent.com/images/ugycgoOkv3p1p1LgDNQKUj0DMw.svg',
      title: 'Tư vấn chiến lược',
      description: 'Xác định hướng đi rõ ràng cho doanh nghiệp của bạn.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/hkvMklMx6UMQAP554YRJlGFEC38.svg?width=52&height=52',
      title: 'Thiết kế thương hiệu',
      description: 'Xây dựng bản sắc thương hiệu mạnh mẽ và nhất quán.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/wcJdPBWrhic7UC9lCPXawWPP6OM.svg?width=52&height=52',
      title: 'Phát triển kỹ thuật số',
      description: 'Giải pháp công nghệ hiện đại phục vụ tăng trưởng.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/nvcIvRkMNCueCZAw3q3pHxc3mc4.svg?width=52&height=52',
      title: 'Tối ưu hoá hiệu suất',
      description: 'Cải thiện kết quả thông qua phân tích dữ liệu.',
    },
  ],
};
const FRAMER_CLARITY_SERVICES_EN: FramerClarityServicesContent = {
  bgColor: '#ffffff',
  cardBg: '#f3f6e6',
  centerImageUrl:
    'https://framerusercontent.com/images/jOJJM3SIzRix55uIXIomAXX4YIk.png',
  services: [
    {
      iconUrl:
        'https://framerusercontent.com/images/ugycgoOkv3p1p1LgDNQKUj0DMw.svg',
      title: 'Strategy Consulting',
      description: 'Define a clear direction for your business.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/hkvMklMx6UMQAP554YRJlGFEC38.svg?width=52&height=52',
      title: 'Brand Design',
      description: 'Build a strong, consistent brand identity.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/wcJdPBWrhic7UC9lCPXawWPP6OM.svg?width=52&height=52',
      title: 'Digital Development',
      description: 'Modern technology solutions for growth.',
    },
    {
      iconUrl:
        'https://framerusercontent.com/images/nvcIvRkMNCueCZAw3q3pHxc3mc4.svg?width=52&height=52',
      title: 'Performance Optimization',
      description: 'Improve results through data analysis.',
    },
  ],
};

// ── Framer-native: Housent Our Excellence ────────────────────────────
const HOUSENT_OUR_EXCELLENCE_VI = housentOurExcellenceDef.defaultContent.vi;
const HOUSENT_OUR_EXCELLENCE_EN = housentOurExcellenceDef.defaultContent.en;

// Derive từ registry BLOCK_TYPE_META (nguồn duy nhất) — thêm block type mới
// chỉ cần thêm 1 entry ở types.ts, map này tự đầy đủ.
const NAME_BY_TYPE: Record<BlockType, string> = Object.fromEntries(
  Object.values(BLOCK_TYPE_META).map(m => [m.type, m.defaultName])
) as Record<BlockType, string>;

const DEFAULTS_VI: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_VI,
  altura_olympus: alturaOlympusDef.defaultContent.vi,
  hero_scroll: heroScrollDef.defaultContent.vi,
  cite_flow_hero: citeFlowHeroDef.defaultContent.vi,
  cite_flow_intro: citeFlowIntroDef.defaultContent.vi,
  cite_flow_stats: citeFlowStatsDef.defaultContent.vi,
  cite_flow_faq: citeFlowFaqDef.defaultContent.vi,
  cite_flow_amenity: citeFlowAmenityDef.defaultContent.vi,
  cite_flow_gallery: citeFlowGalleryDef.defaultContent.vi,
  cite_flow_header: citeFlowHeaderDef.defaultContent.vi,
  cite_flow_footer: citeFlowFooterDef.defaultContent.vi,
  cite_flow_contact_form: citeFlowContactFormDef.defaultContent.vi,
  cite_flow_signature: citeFlowSignatureDef.defaultContent.vi,
  scroll_mattis: scrollMattisDef.defaultContent.vi,
  hero_overlay: HERO_OVERLAY_VI,
  feature_section: FEATURE_VI,
  booking_form: BOOKING_VI,
  cta_section: CTA_VI,
  mint_details: MINT_DETAILS_VI,
  mint_sku: MINT_SKU_VI,
  mint_hero: MINT_HERO_VI,
  mint_variants: MINT_VARIANTS_VI,
  mint_discover: mintDiscoverDef.defaultContent.vi,
  cool_hunter_hero: coolHunterHeroDef.defaultContent.vi,
  belgo_hero: belgoHeroDef.defaultContent.vi,
  belgo_about_product: belgoAboutProductDef.defaultContent.vi,
  belgo_scroll_frames: belgoScrollFramesDef.defaultContent.vi,
  belgo_brewing_process: belgoBrewingProcessDef.defaultContent.vi,
  belgo_footer: belgoFooterDef.defaultContent.vi,
  belgo_our_products: belgoOurProductsDef.defaultContent.vi,
  belgo_more_flavors: belgoMoreFlavorsDef.defaultContent.vi,
  cool_hunter_section_progress: coolHunterSectionProgressDef.defaultContent.vi,
  cool_hunter_story: coolHunterStoryDef.defaultContent.vi,
  cool_hunter_gallery: coolHunterGalleryDef.defaultContent.vi,
  scroll_img_scale: scrollImgScaleDef.defaultContent.vi,
  letter_slider: letterSliderDef.defaultContent.vi,
  cg_modular_slider: cgModularSliderDef.defaultContent.vi,
  cg_responsive_team: cgResponsiveTeamDef.defaultContent.vi,
  cg_radga_horizontal: cgRadgaHorizontalDef.defaultContent.vi,
  cg_page_transitions: cgPageTransitionsDef.defaultContent.vi,
  cg_responsive_landing_loader: cgResponsiveLandingLoaderDef.defaultContent.vi,
  cg_landing_page_reveal: cgLandingPageRevealDef.defaultContent.vi,
  cg_3d_slider: cg3dSliderDef.defaultContent.vi,
  cool_hunter_product: coolHunterProductDef.defaultContent.vi,
  cool_hunter_quote: coolHunterQuoteDef.defaultContent.vi,
  cool_hunter_footer: coolHunterFooterDef.defaultContent.vi,
  pnj_hero: pnjHeroDef.defaultContent.vi,
  pnj_details: pnjDetailsDef.defaultContent.vi,
  pnj_variant: pnjVariantDef.defaultContent.vi,
  pnj_header: pnjHeaderDef.defaultContent.vi,
  belgo_header: belgoHeaderDef.defaultContent.vi,
  pnj_sticky_menu: pnjStickyMenuDef.defaultContent.vi,
  pnj_cta: pnjCtaDef.defaultContent.vi,
  the_grand_intro: theGrandIntroDef.defaultContent.vi,
  the_grand_location: theGrandLocationDef.defaultContent.vi,
  the_grand_discover: theGrandDiscoverDef.defaultContent.vi,
  the_grand_service: theGrandServiceDef.defaultContent.vi,
  the_grand_about: theGrandAboutDef.defaultContent.vi,
  the_grand_footer: theGrandFooterDef.defaultContent.vi,
  mintv2_emblem: MINTV2_EMBLEM_VI,
  mintv2_services: MINTV2_SERVICES_VI,
  mintv2_manifesto: MINTV2_MANIFESTO_VI,
  mintv2_process: MINTV2_PROCESS_VI,
  mintv2_cta: MINTV2_CTA_VI,
  mintv2_works: MINTV2_WORKS_VI,
  linea_portfolio: lineaPortfolioDef.defaultContent.vi,
  mint_vault_hero: MINT_VAULT_HERO_VI,
  mint_vault_craft: MINT_VAULT_CRAFT_VI,
  mint_vault_reveal: MINT_VAULT_REVEAL_VI,
  mint_vault_collection: MINT_VAULT_COLLECTION_VI,
  mint_vault_invitation: MINT_VAULT_INVITATION_VI,
  interactive_ad_widget: INTERACTIVE_AD_WIDGET,
  brightedge_hero: BRIGHTEDGE_HERO,
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
  hover_equalizer_heading: HOVER_EQ_HEADING_VI,
  brutalist_text: BRUTALIST_TEXT_VI,
  image_explosion: IMAGE_EXPLOSION_VI,
  story_slides: STORY_SLIDES_VI,
  accordion_media: ACCORDION_MEDIA_VI,
  spotlight: SPOTLIGHT_VI,
  process_steps: PROCESS_STEPS_VI,
  dot_matrix: DOT_MATRIX_VI,
  interactive_grid: INTERACTIVE_GRID_VI,
  pixel_reveal: PIXEL_REVEAL_VI,
  marquee_band: MARQUEE_BAND_VI,
  seamless_scroll_gallery: SEAMLESS_SCROLL_GALLERY_VI,
  product_spec_sheet: PRODUCT_SPEC_SHEET_VI,
  framer_yume_hero: FRAMER_YUME_HERO_VI,
  framer_yuya_hero: FRAMER_YUYA_HERO_VI,
  framer_arpeggio_hero_v2: FRAMER_ARPEGGIO_HERO_V2_VI,
  framer_perform_hero: FRAMER_PERFORM_HERO_VI,
  framer_bungee_hero_v2: FRAMER_BUNGEE_HERO_V2_VI,
  framer_purevisuals_hero: FRAMER_PUREVISUALS_HERO_VI,
  framer_intro_redefined: FRAMER_INTRO_REDEFINED_VI,
  framer_explore_cta: FRAMER_EXPLORE_CTA_VI,
  framer_flat_white_process: framerFlatWhiteProcessDef.defaultContent.vi,
  framer_studio_manifesto: FRAMER_STUDIO_MANIFESTO_VI,
  framer_ignitex_step: framerIgnitexStepDef.defaultContent.vi,
  framer_realestate02_story: framerRealEstate02StoryDef.defaultContent.vi,
  framer_realestate02_quote: framerRealEstate02QuoteDef.defaultContent.vi,
  framer_realestate02_product: framerRealEstate02ProductDef.defaultContent.vi,
  framer_realestate02_overview: framerRealEstate02OverviewDef.defaultContent.vi,
  framer_realestate02_location: framerRealEstate02LocationDef.defaultContent.vi,
  framer_realestate02_commute: framerRealEstate02CommuteDef.defaultContent.vi,
  framer_realestate02_map: framerRealEstate02MapDef.defaultContent.vi,
  framer_realestate02_gallery: framerRealEstate02GalleryDef.defaultContent.vi,
  framer_realestate02_menu: framerRealEstate02MenuDef.defaultContent.vi,
  framer_stats_grid: FRAMER_STATS_GRID_VI,
  framer_projects_grid: FRAMER_PROJECTS_GRID_VI,
  framer_team_directory: FRAMER_TEAM_DIRECTORY_VI,
  framer_image_stagger: FRAMER_IMAGE_STAGGER_VI,
  framer_clarity_services: FRAMER_CLARITY_SERVICES_VI,
  framer_faq_minimal: FRAMER_FAQ_MINIMAL_VI,
  framer_darling_timeline: framerDarlingTimelineDef.defaultContent.vi,
  framer_nftpull_timeline: framerNftpullTimelineDef.defaultContent.vi,
  delvaux_header: delvauxHeaderDef.defaultContent.vi,
  delvaux_subnav: delvauxSubnavDef.defaultContent.vi,
  delvaux_hero: delvauxHeroDef.defaultContent.vi,
  delvaux_details: delvauxDetailsDef.defaultContent.vi,
  delvaux_product: delvauxProductDef.defaultContent.vi,
  delvaux_variant: delvauxVariantDef.defaultContent.vi,
  gambit_product_overview: gambitProductOverviewDef.defaultContent.vi,
  gambit_delvaux_intro: gambitDelvauxIntroDef.defaultContent.vi,
  lusion_lp_reveal: lusionLpRevealDef.defaultContent.vi,
  gambit_product_details: gambitProductDetailsDef.defaultContent.vi,
  gambit_brand_heritage: gambitBrandHeritageDef.defaultContent.vi,
  gambit_related_products: gambitRelatedProductsDef.defaultContent.vi,
  gambit_section_nav: gambitSectionNavDef.defaultContent.vi,
  q80_experience: q80ExperienceDef.defaultContent.vi,
  q80_menu: q80MenuDef.defaultContent.vi,
  housent_hero: housentHeroDef.defaultContent.vi,
  housent_stats: housentStatsDef.defaultContent.vi,
  housent_listings: housentListingsDef.defaultContent.vi,
  housent_cta: housentCtaDef.defaultContent.vi,
  housent_footer: housentFooterDef.defaultContent.vi,
  housent_about: housentAboutDef.defaultContent.vi,
  housent_excellence: housentExcellenceDef.defaultContent.vi,
  housent_solutions: housentSolutionsDef.defaultContent.vi,
  housent_values: housentValuesDef.defaultContent.vi,
  housent_faq: housentFaqDef.defaultContent.vi,
  housent_testimonial: housentTestimonialDef.defaultContent.vi,
  housent_blogs: housentBlogsDef.defaultContent.vi,
  lumea_hero: lumeaHeroDef.defaultContent.vi,
  lumea_statement: lumeaStatementDef.defaultContent.vi,
  lumea_immersive: lumeaImmersiveDef.defaultContent.vi,
  lumea_handcrafted: lumeaHandcraftedDef.defaultContent.vi,
  lumea_amenities: lumeaAmenitiesDef.defaultContent.vi,
  lumea_testimonial: lumeaTestimonialDef.defaultContent.vi,
  lumea_gallery: lumeaGalleryDef.defaultContent.vi,
  lumea_footer: lumeaFooterDef.defaultContent.vi,
  nordhaven_hero: nordhavenHeroDef.defaultContent.vi,
  nordhaven_about: nordhavenAboutDef.defaultContent.vi,
  nordhaven_services: nordhavenServicesDef.defaultContent.vi,
  nordhaven_properties: nordhavenPropertiesDef.defaultContent.vi,
  nordhaven_testimonials: nordhavenTestimonialsDef.defaultContent.vi,
  nordhaven_faq: nordhavenFaqDef.defaultContent.vi,
  nordhaven_gallery: nordhavenGalleryDef.defaultContent.vi,
  nordhaven_footer: nordhavenFooterDef.defaultContent.vi,
  firma_hero: firmaHeroDef.defaultContent.vi,
  firma_statement: firmaStatementDef.defaultContent.vi,
  firma_work: firmaWorkDef.defaultContent.vi,
  firma_testimonial: firmaTestimonialDef.defaultContent.vi,
  firma_services: firmaServicesDef.defaultContent.vi,
  firma_footer: firmaFooterDef.defaultContent.vi,
  ignitex_hero: ignitexHeroDef.defaultContent.vi,
  ignitex_services: ignitexServicesDef.defaultContent.vi,
  ignitex_projects: ignitexProjectsDef.defaultContent.vi,
  ignitex_about: ignitexAboutDef.defaultContent.vi,
  ignitex_cta: ignitexCtaDef.defaultContent.vi,
  ignitex_footer: ignitexFooterDef.defaultContent.vi,
  readymag_marquee: readymagMarqueeDef.defaultContent.vi,
  readymag_projects: readymagProjectsDef.defaultContent.vi,
  readymag_footer: readymagFooterDef.defaultContent.vi,
  protection_scrollytelling: protectionScrollytellingDef.defaultContent.vi,
  springs_header: springsHeaderDef.defaultContent.vi,
  springs_gallery: springsGalleryDef.defaultContent.vi,
  springs_hero: springsHeroDef.defaultContent.vi,
  springs_intro: springsIntroDef.defaultContent.vi,
  springs_wellness: springsWellnessDef.defaultContent.vi,
  springs_nature_place: springsNaturePlaceDef.defaultContent.vi,
  springs_map: springsMapDef.defaultContent.vi,
  real_estate_location: realEstateLocationDef.defaultContent.vi,
  real_estate_hero: realEstateHeroDef.defaultContent.vi,
  real_estate_info: realEstateInfoDef.defaultContent.vi,
  real_estate_overview: realEstateOverviewDef.defaultContent.vi,
  real_estate_highlights: realEstateHighlightsDef.defaultContent.vi,
  real_estate_villa: realEstateVillaDef.defaultContent.vi,
  real_estate_utilities: realEstateUtilitiesDef.defaultContent.vi,
  springs_design: springsDesignDef.defaultContent.vi,
  springs_residences: springsResidencesDef.defaultContent.vi,
  springs_interiors: springsInteriorsDef.defaultContent.vi,
  springs_contact_footer: springsContactFooterDef.defaultContent.vi,
  sustainit_our_expertise: sustainitOurExpertiseDef.defaultContent.vi,
  framer_signature_feature: FRAMER_SIGNATURE_FEATURE_VI,
  housent_our_excellence: HOUSENT_OUR_EXCELLENCE_VI,
  framer_vs_collins_projects: FRAMER_VS_COLLINS_PROJECTS_VI,
  framer_aestha_editorial: framerAesthaEditorialDef.defaultContent.vi,
  aestha_explore: aesthaExploreDef.defaultContent.vi,
  aestha_studio: aesthaStudioDef.defaultContent.vi,
  aestha_contact: aesthaContactDef.defaultContent.vi,
  aestha_project: aesthaProjectDef.defaultContent.vi,
  aestha_nav: aesthaNavDef.defaultContent.vi,
  masterise_home_inside: masteriseHomeInsideDef.defaultContent.vi,
  framer_perform_about: framerPerformAboutDef.defaultContent.vi,
  framer_perform_pricing: framerPerformPricingDef.defaultContent.vi,
  framer_firma_template_strategy_digital:
    framerFirmaTemplateStrategyDigitalDef.defaultContent.vi,
  readymag_case_section: readymagCaseSectionDef.defaultContent.vi,
  framer_estancia_about_us: framerEstanciaAboutUsDef.defaultContent.vi,
  rolex_collection_hero: rolexCollectionHeroDef.defaultContent.vi,
  rolex_collection_nav: rolexCollectionNavDef.defaultContent.vi,
  rolex_collection_contact: rolexContactDef.defaultContent.vi,
  rolex_collection_work: rolexCollectionWorkDef.defaultContent.vi,
  rolex_collection_project: rolexCollectionProjectDef.defaultContent.vi,
};
const DEFAULTS_EN: Record<BlockType, BlockContent> = {
  hero_split: HERO_SPLIT_EN,
  altura_olympus: alturaOlympusDef.defaultContent.en,
  hero_scroll: heroScrollDef.defaultContent.en,
  cite_flow_hero: citeFlowHeroDef.defaultContent.en,
  cite_flow_intro: citeFlowIntroDef.defaultContent.en,
  cite_flow_stats: citeFlowStatsDef.defaultContent.en,
  cite_flow_faq: citeFlowFaqDef.defaultContent.en,
  cite_flow_amenity: citeFlowAmenityDef.defaultContent.en,
  cite_flow_gallery: citeFlowGalleryDef.defaultContent.en,
  cite_flow_header: citeFlowHeaderDef.defaultContent.en,
  cite_flow_footer: citeFlowFooterDef.defaultContent.en,
  cite_flow_contact_form: citeFlowContactFormDef.defaultContent.en,
  cite_flow_signature: citeFlowSignatureDef.defaultContent.en,
  scroll_mattis: scrollMattisDef.defaultContent.en,
  hero_overlay: HERO_OVERLAY_EN,
  feature_section: FEATURE_EN,
  booking_form: BOOKING_EN,
  cta_section: CTA_EN,
  mint_details: MINT_DETAILS_VI,
  mint_sku: MINT_SKU_VI,
  mint_hero: MINT_HERO_VI,
  mint_variants: MINT_VARIANTS_VI,
  mint_discover: mintDiscoverDef.defaultContent.en,
  cool_hunter_hero: coolHunterHeroDef.defaultContent.en,
  belgo_hero: belgoHeroDef.defaultContent.en,
  belgo_about_product: belgoAboutProductDef.defaultContent.en,
  belgo_scroll_frames: belgoScrollFramesDef.defaultContent.en,
  belgo_brewing_process: belgoBrewingProcessDef.defaultContent.en,
  belgo_footer: belgoFooterDef.defaultContent.en,
  belgo_our_products: belgoOurProductsDef.defaultContent.en,
  belgo_more_flavors: belgoMoreFlavorsDef.defaultContent.en,
  cool_hunter_section_progress: coolHunterSectionProgressDef.defaultContent.en,
  cool_hunter_story: coolHunterStoryDef.defaultContent.en,
  cool_hunter_gallery: coolHunterGalleryDef.defaultContent.en,
  scroll_img_scale: scrollImgScaleDef.defaultContent.en,
  letter_slider: letterSliderDef.defaultContent.en,
  cg_modular_slider: cgModularSliderDef.defaultContent.en,
  cg_responsive_team: cgResponsiveTeamDef.defaultContent.en,
  cg_radga_horizontal: cgRadgaHorizontalDef.defaultContent.en,
  cg_page_transitions: cgPageTransitionsDef.defaultContent.en,
  cg_responsive_landing_loader: cgResponsiveLandingLoaderDef.defaultContent.en,
  cg_landing_page_reveal: cgLandingPageRevealDef.defaultContent.en,
  cg_3d_slider: cg3dSliderDef.defaultContent.en,
  cool_hunter_product: coolHunterProductDef.defaultContent.en,
  cool_hunter_quote: coolHunterQuoteDef.defaultContent.en,
  cool_hunter_footer: coolHunterFooterDef.defaultContent.en,
  pnj_hero: pnjHeroDef.defaultContent.en,
  pnj_details: pnjDetailsDef.defaultContent.en,
  pnj_variant: pnjVariantDef.defaultContent.en,
  pnj_header: pnjHeaderDef.defaultContent.en,
  belgo_header: belgoHeaderDef.defaultContent.en,
  pnj_sticky_menu: pnjStickyMenuDef.defaultContent.en,
  pnj_cta: pnjCtaDef.defaultContent.en,
  the_grand_intro: theGrandIntroDef.defaultContent.en,
  the_grand_location: theGrandLocationDef.defaultContent.en,
  the_grand_discover: theGrandDiscoverDef.defaultContent.en,
  the_grand_service: theGrandServiceDef.defaultContent.en,
  the_grand_about: theGrandAboutDef.defaultContent.en,
  the_grand_footer: theGrandFooterDef.defaultContent.en,
  mintv2_emblem: MINTV2_EMBLEM_VI,
  mintv2_services: MINTV2_SERVICES_VI,
  mintv2_manifesto: MINTV2_MANIFESTO_VI,
  mintv2_process: MINTV2_PROCESS_VI,
  mintv2_cta: MINTV2_CTA_VI,
  mintv2_works: MINTV2_WORKS_VI,
  linea_portfolio: lineaPortfolioDef.defaultContent.vi,
  mint_vault_hero: MINT_VAULT_HERO_VI,
  mint_vault_craft: MINT_VAULT_CRAFT_VI,
  mint_vault_reveal: MINT_VAULT_REVEAL_VI,
  mint_vault_collection: MINT_VAULT_COLLECTION_VI,
  mint_vault_invitation: MINT_VAULT_INVITATION_VI,
  interactive_ad_widget: INTERACTIVE_AD_WIDGET,
  brightedge_hero: BRIGHTEDGE_HERO,
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
  hover_equalizer_heading: HOVER_EQ_HEADING_EN,
  brutalist_text: BRUTALIST_TEXT_EN,
  image_explosion: IMAGE_EXPLOSION_EN,
  story_slides: STORY_SLIDES_EN,
  accordion_media: ACCORDION_MEDIA_EN,
  spotlight: SPOTLIGHT_EN,
  process_steps: PROCESS_STEPS_EN,
  dot_matrix: DOT_MATRIX_EN,
  interactive_grid: INTERACTIVE_GRID_EN,
  pixel_reveal: PIXEL_REVEAL_EN,
  marquee_band: MARQUEE_BAND_EN,
  seamless_scroll_gallery: SEAMLESS_SCROLL_GALLERY_EN,
  product_spec_sheet: PRODUCT_SPEC_SHEET_EN,
  framer_yume_hero: FRAMER_YUME_HERO_EN,
  framer_yuya_hero: FRAMER_YUYA_HERO_EN,
  framer_arpeggio_hero_v2: FRAMER_ARPEGGIO_HERO_V2_EN,
  framer_perform_hero: FRAMER_PERFORM_HERO_EN,
  framer_bungee_hero_v2: FRAMER_BUNGEE_HERO_V2_EN,
  framer_purevisuals_hero: FRAMER_PUREVISUALS_HERO_EN,
  framer_intro_redefined: FRAMER_INTRO_REDEFINED_EN,
  framer_explore_cta: FRAMER_EXPLORE_CTA_EN,
  framer_flat_white_process: framerFlatWhiteProcessDef.defaultContent.en,
  framer_studio_manifesto: FRAMER_STUDIO_MANIFESTO_EN,
  framer_ignitex_step: framerIgnitexStepDef.defaultContent.en,
  framer_realestate02_story: framerRealEstate02StoryDef.defaultContent.en,
  framer_realestate02_quote: framerRealEstate02QuoteDef.defaultContent.en,
  framer_realestate02_product: framerRealEstate02ProductDef.defaultContent.en,
  framer_realestate02_overview: framerRealEstate02OverviewDef.defaultContent.en,
  framer_realestate02_location: framerRealEstate02LocationDef.defaultContent.en,
  framer_realestate02_commute: framerRealEstate02CommuteDef.defaultContent.en,
  framer_realestate02_map: framerRealEstate02MapDef.defaultContent.en,
  framer_realestate02_gallery: framerRealEstate02GalleryDef.defaultContent.en,
  framer_realestate02_menu: framerRealEstate02MenuDef.defaultContent.en,
  framer_stats_grid: FRAMER_STATS_GRID_EN,
  framer_projects_grid: FRAMER_PROJECTS_GRID_EN,
  framer_team_directory: FRAMER_TEAM_DIRECTORY_EN,
  framer_image_stagger: FRAMER_IMAGE_STAGGER_EN,
  framer_clarity_services: FRAMER_CLARITY_SERVICES_EN,
  framer_faq_minimal: FRAMER_FAQ_MINIMAL_EN,
  framer_darling_timeline: framerDarlingTimelineDef.defaultContent.en,
  framer_nftpull_timeline: framerNftpullTimelineDef.defaultContent.en,
  delvaux_header: delvauxHeaderDef.defaultContent.en,
  delvaux_subnav: delvauxSubnavDef.defaultContent.en,
  delvaux_hero: delvauxHeroDef.defaultContent.en,
  delvaux_details: delvauxDetailsDef.defaultContent.en,
  delvaux_product: delvauxProductDef.defaultContent.en,
  delvaux_variant: delvauxVariantDef.defaultContent.en,
  gambit_product_overview: gambitProductOverviewDef.defaultContent.en,
  gambit_delvaux_intro: gambitDelvauxIntroDef.defaultContent.en,
  lusion_lp_reveal: lusionLpRevealDef.defaultContent.en,
  gambit_product_details: gambitProductDetailsDef.defaultContent.en,
  gambit_brand_heritage: gambitBrandHeritageDef.defaultContent.en,
  gambit_related_products: gambitRelatedProductsDef.defaultContent.en,
  gambit_section_nav: gambitSectionNavDef.defaultContent.en,
  q80_experience: q80ExperienceDef.defaultContent.en,
  q80_menu: q80MenuDef.defaultContent.en,
  housent_hero: housentHeroDef.defaultContent.en,
  housent_stats: housentStatsDef.defaultContent.en,
  housent_listings: housentListingsDef.defaultContent.en,
  housent_cta: housentCtaDef.defaultContent.en,
  housent_footer: housentFooterDef.defaultContent.en,
  housent_about: housentAboutDef.defaultContent.en,
  housent_excellence: housentExcellenceDef.defaultContent.en,
  housent_solutions: housentSolutionsDef.defaultContent.en,
  housent_values: housentValuesDef.defaultContent.en,
  housent_faq: housentFaqDef.defaultContent.en,
  housent_testimonial: housentTestimonialDef.defaultContent.en,
  housent_blogs: housentBlogsDef.defaultContent.en,
  lumea_hero: lumeaHeroDef.defaultContent.en,
  lumea_statement: lumeaStatementDef.defaultContent.en,
  lumea_immersive: lumeaImmersiveDef.defaultContent.en,
  lumea_handcrafted: lumeaHandcraftedDef.defaultContent.en,
  lumea_amenities: lumeaAmenitiesDef.defaultContent.en,
  lumea_testimonial: lumeaTestimonialDef.defaultContent.en,
  lumea_gallery: lumeaGalleryDef.defaultContent.en,
  lumea_footer: lumeaFooterDef.defaultContent.en,
  nordhaven_hero: nordhavenHeroDef.defaultContent.en,
  nordhaven_about: nordhavenAboutDef.defaultContent.en,
  nordhaven_services: nordhavenServicesDef.defaultContent.en,
  nordhaven_properties: nordhavenPropertiesDef.defaultContent.en,
  nordhaven_testimonials: nordhavenTestimonialsDef.defaultContent.en,
  nordhaven_faq: nordhavenFaqDef.defaultContent.en,
  nordhaven_gallery: nordhavenGalleryDef.defaultContent.en,
  nordhaven_footer: nordhavenFooterDef.defaultContent.en,
  firma_hero: firmaHeroDef.defaultContent.en,
  firma_statement: firmaStatementDef.defaultContent.en,
  firma_work: firmaWorkDef.defaultContent.en,
  firma_testimonial: firmaTestimonialDef.defaultContent.en,
  firma_services: firmaServicesDef.defaultContent.en,
  firma_footer: firmaFooterDef.defaultContent.en,
  ignitex_hero: ignitexHeroDef.defaultContent.en,
  ignitex_services: ignitexServicesDef.defaultContent.en,
  ignitex_projects: ignitexProjectsDef.defaultContent.en,
  ignitex_about: ignitexAboutDef.defaultContent.en,
  ignitex_cta: ignitexCtaDef.defaultContent.en,
  ignitex_footer: ignitexFooterDef.defaultContent.en,
  readymag_marquee: readymagMarqueeDef.defaultContent.en,
  readymag_projects: readymagProjectsDef.defaultContent.en,
  readymag_footer: readymagFooterDef.defaultContent.en,
  protection_scrollytelling: protectionScrollytellingDef.defaultContent.en,
  springs_header: springsHeaderDef.defaultContent.en,
  springs_gallery: springsGalleryDef.defaultContent.en,
  springs_hero: springsHeroDef.defaultContent.en,
  springs_intro: springsIntroDef.defaultContent.en,
  springs_wellness: springsWellnessDef.defaultContent.en,
  springs_nature_place: springsNaturePlaceDef.defaultContent.en,
  springs_map: springsMapDef.defaultContent.en,
  real_estate_location: realEstateLocationDef.defaultContent.en,
  real_estate_hero: realEstateHeroDef.defaultContent.en,
  real_estate_info: realEstateInfoDef.defaultContent.en,
  real_estate_overview: realEstateOverviewDef.defaultContent.en,
  real_estate_highlights: realEstateHighlightsDef.defaultContent.en,
  real_estate_villa: realEstateVillaDef.defaultContent.en,
  real_estate_utilities: realEstateUtilitiesDef.defaultContent.en,
  springs_design: springsDesignDef.defaultContent.en,
  springs_residences: springsResidencesDef.defaultContent.en,
  springs_interiors: springsInteriorsDef.defaultContent.en,
  springs_contact_footer: springsContactFooterDef.defaultContent.en,
  sustainit_our_expertise: sustainitOurExpertiseDef.defaultContent.en,
  framer_signature_feature: FRAMER_SIGNATURE_FEATURE_EN,
  housent_our_excellence: HOUSENT_OUR_EXCELLENCE_EN,
  framer_vs_collins_projects: FRAMER_VS_COLLINS_PROJECTS_EN,
  framer_aestha_editorial: framerAesthaEditorialDef.defaultContent.en,
  aestha_explore: aesthaExploreDef.defaultContent.en,
  aestha_studio: aesthaStudioDef.defaultContent.en,
  aestha_contact: aesthaContactDef.defaultContent.en,
  aestha_project: aesthaProjectDef.defaultContent.en,
  aestha_nav: aesthaNavDef.defaultContent.en,
  masterise_home_inside: masteriseHomeInsideDef.defaultContent.en,
  framer_perform_about: framerPerformAboutDef.defaultContent.en,
  framer_perform_pricing: framerPerformPricingDef.defaultContent.en,
  framer_firma_template_strategy_digital:
    framerFirmaTemplateStrategyDigitalDef.defaultContent.en,
  readymag_case_section: readymagCaseSectionDef.defaultContent.en,
  framer_estancia_about_us: framerEstanciaAboutUsDef.defaultContent.en,
  rolex_collection_hero: rolexCollectionHeroDef.defaultContent.en,
  rolex_collection_nav: rolexCollectionNavDef.defaultContent.en,
  rolex_collection_contact: rolexContactDef.defaultContent.en,
  rolex_collection_work: rolexCollectionWorkDef.defaultContent.en,
  rolex_collection_project: rolexCollectionProjectDef.defaultContent.en,
};

export function createBlock(type: BlockType): Block {
  // New blocks start with `mobile` undefined so the renderer falls back to
  // `desktop`. User customizes mobile later via the Mobile device toggle.
  // Registry-first: block đã có BlockDef thì lấy name + default từ def.
  const reg = getBlockDef(type);
  return {
    id: genId(),
    blockType: type,
    name: reg ? reg.meta.defaultName : NAME_BY_TYPE[type],
    contentVi: {
      desktop: structuredClone(reg ? reg.defaultContent.vi : DEFAULTS_VI[type]),
    },
    contentEn: {
      desktop: structuredClone(reg ? reg.defaultContent.en : DEFAULTS_EN[type]),
    },
    isVisible: true,
  };
}

export function defaultContentFor(
  type: BlockType,
  lang: 'vi' | 'en'
): BlockContent {
  const reg = getBlockDef(type);
  if (reg) return structuredClone(reg.defaultContent[lang]);
  return structuredClone(lang === 'vi' ? DEFAULTS_VI[type] : DEFAULTS_EN[type]);
}
