import type {
  RxAuditChannel,
  RxAuditDims,
  RxAuditFinding,
  RxAuditFlag,
  RxAuditFlow,
  RxAuditFlowEdge,
  RxAuditJourney,
  RxAuditLeaksResponse,
  RxAuditProduct,
  RxAuditSeverity,
  RxAuditStage,
  RxAuditTouchpoint,
  RxAuditTouchpointDetail,
} from '@/services/rexer-v2/types/audit';

import type { AuditSnapshot, AuditSource, WizardConfig } from './types';

/**
 * Mock Phase 1 của Journey Audit — port nguyên DATA của prototype live-case
 * (JLO Beauty, captured 25 Aug 2026) sang đúng shape Rx mà BE đang xây song
 * song. Hai sản phẩm: `glow` (serum) và `ampm` (routine kit).
 *
 * Nội dung findings/narrative giữ nguyên tiếng Anh của prototype: đây là DATA
 * mẫu, không phải chrome UI (chrome đi qua i18n).
 */

export const AUDIT_STAGE_NAMES = [
  'Awareness',
  'Consideration',
  'Decision',
  'Purchase',
  'Post-Purchase',
] as const;

/* ── nguồn (12) ──────────────────────────────────────────────────────────── */

/**
 * Bộ nguồn DEMO (không brand / API lỗi) — shape VIEW trực tiếp: đường thật
 * dựng AuditSource từ `/v1/sources` + `/v1/sources/catalog` qua sourcesView.
 */
export const MOCK_AUDIT_SOURCES: AuditSource[] = [
  {
    id: 'crawl',
    provider: 'crawl',
    name: 'ReXeR Public Crawl',
    icon: '🔎',
    category: 'Audit crawlers',
    auth: 'No credentials',
    status: 'connected',
    firstParty: true,
    stages: [...AUDIT_STAGE_NAMES],
    observes:
      'Live pages exactly as a customer sees them: PDPs, collection, offer pages, policies, navigation',
    stats: '14 public pages captured · 25 Aug 2026',
    lastSync: '2h ago',
    issue: null,
    value: null,
    unlocks: null,
  },
  {
    id: 'amazonmon',
    provider: 'amazonmon',
    name: 'Amazon Listing Monitor',
    icon: '📦',
    category: 'Marketplaces',
    auth: 'Public listing',
    status: 'connected',
    firstParty: false,
    stages: ['Awareness', 'Consideration'],
    observes:
      'Marketplace title, bullets, usage instructions and imagery, compared against the DTC page',
    stats: '1 listing tracked · JLO BEAUTY store',
    lastSync: '3h ago',
    issue: null,
    value: null,
    unlocks: null,
  },
  {
    id: 'reviews',
    provider: 'reviews',
    name: 'On-Site Review Feed',
    icon: '⭐',
    category: 'Reviews & UGC',
    auth: 'Public listing',
    status: 'connected',
    firstParty: false,
    stages: ['Consideration'],
    observes: 'Ratings, review themes, unanswered complaints and Q&A coverage',
    stats: '34 reviews on the serum PDP · 4.44★',
    lastSync: '3h ago',
    issue: null,
    value: null,
    unlocks: null,
  },
  {
    id: 'model',
    provider: 'model',
    name: 'Traffic Model (estimated)',
    icon: '📐',
    category: 'Analytics & Behavior',
    auth: 'Modelled',
    status: 'connected',
    firstParty: true,
    stages: ['Awareness', 'Consideration', 'Decision', 'Purchase'],
    observes:
      'Estimated session and funnel volumes, used to demonstrate the drop-off engine. Replace with GA4 for real figures.',
    stats: 'Illustrative volumes — not JLO Beauty data',
    lastSync: 'modelled',
    issue: null,
    value: null,
    unlocks: null,
  },
  {
    id: 'shopify',
    provider: 'shopify',
    name: 'Shopify',
    icon: '🛍️',
    category: 'Commerce',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Decision', 'Purchase'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Read live pricing, promotions and checkout behaviour to confirm which discount actually applies at each step.',
    unlocks:
      'Resolves the $79 / $63 / $19.99 / $49.95 price conflict definitively',
  },
  {
    id: 'woocommerce',
    provider: 'woocommerce',
    name: 'WooCommerce',
    icon: '🛒',
    category: 'Commerce',
    auth: 'API key',
    status: 'available',
    firstParty: false,
    stages: ['Decision', 'Purchase'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Read products, pricing, coupons and order flow from a WordPress store to audit every step of its checkout.',
    unlocks: 'Extends pricing and checkout auditing to WooCommerce storefronts',
  },
  {
    id: 'ga4',
    provider: 'ga4',
    name: 'Google Analytics 4',
    icon: '📊',
    category: 'Analytics & Behavior',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Awareness', 'Consideration', 'Decision', 'Purchase'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      "Replace the estimated traffic model with the brand's real funnel, channel mix and page performance.",
    unlocks: 'Turns every estimated figure in this audit into measured data',
  },
  {
    id: 'tiktokshop',
    provider: 'tiktokshop',
    name: 'TikTok Shop',
    icon: '🛍',
    category: 'Marketplaces',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Awareness', 'Consideration', 'Purchase'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Audit shop listings, livestream offers and product performance — where pricing and naming drift fastest.',
    unlocks: 'Unlocks the TikTok Shop sales channel as an audited touchpoint',
  },
  {
    id: 'meta',
    provider: 'meta',
    name: 'Meta Ads',
    icon: '🎯',
    category: 'Paid Media',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Awareness'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Audit live Instagram and Facebook creative for naming and claim consistency against the product page.',
    unlocks: 'Unlocks the Instagram touchpoint',
  },
  {
    id: 'tiktokads',
    provider: 'tiktokads',
    name: 'TikTok',
    icon: '🎵',
    category: 'Paid Media',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Awareness'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Audit creator content and link destinations — the highest-risk channel for product-name drift.',
    unlocks: 'Unlocks the TikTok touchpoint',
  },
  {
    id: 'klaviyo',
    provider: 'klaviyo',
    name: 'Klaviyo',
    icon: '✉️',
    category: 'Email & SMS',
    auth: 'OAuth',
    status: 'available',
    firstParty: false,
    stages: ['Post-Purchase'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Audit onboarding and replenishment email for usage guidance and cadence.',
    unlocks: 'Unlocks the post-purchase email touchpoint',
  },
  {
    id: 'sephora',
    provider: 'sephora',
    name: 'Retail Partner Feed',
    icon: '🏬',
    category: 'Retail partners',
    auth: 'Feed',
    status: 'available',
    firstParty: false,
    stages: ['Awareness', 'Consideration'],
    observes: null,
    stats: null,
    lastSync: null,
    issue: null,
    value:
      'Compare retail partner listings against DTC content — the same drift found on Amazon usually repeats at retail.',
    unlocks: 'Extends listing-drift auditing to retail partners',
  },
];

export const AUDIT_SOURCE_CATEGORIES = [
  'Audit crawlers',
  'Commerce',
  'Analytics & Behavior',
  'Paid Media',
  'Email & SMS',
  'Reviews & UGC',
  'Marketplaces',
  'Retail partners',
] as const;

/* ── touchpoint defs ─────────────────────────────────────────────────────── */

type TpDef = {
  id: string;
  name: string;
  channel: string;
  icon: string;
  score: number;
  dims: RxAuditDims;
  flags: RxAuditFlag[];
  source_ids: string[];
  findings: Array<[RxAuditSeverity, string]>;
  reco: string;
  snap: AuditSnapshot;
};

const dims = (
  messageMatch: number,
  loadSpeed: number,
  brandConsistency: number,
  friction: number,
  accessibility: number
): RxAuditDims => ({
  message_match: messageMatch,
  load_speed: loadSpeed,
  brand_consistency: brandConsistency,
  friction: friction,
  accessibility: accessibility,
});

const TP_DEFS: Record<string, TpDef> = {
  'g-search': {
    id: 'g-search',
    name: 'Google Search Listing',
    channel: 'OWNED · SEO',
    icon: '🔍',
    score: 71,
    dims: dims(62, 78, 58, 80, 76),
    flags: [
      { severity: 'crit', label: 'Name fragmented' },
      { severity: 'good', label: 'Ranks for brand' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'crit',
        'OBSERVED — The page title reads “Brightening Serum | Glowing Serum | That JLO Glow”, leading with a generic category term. The equity name customers search for, “That JLo Glow”, is placed last.',
      ],
      [
        'warn',
        'OBSERVED — The meta description leads with generic serum language rather than the Terralume Complex™ story that differentiates the product.',
      ],
      [
        'good',
        'OBSERVED — The page is indexed with a clean canonical URL and full product schema including price and availability.',
      ],
    ],
    reco: 'Lead the title with the equity name: “That JLO Glow® Brightening Serum — Niacinamide + Squalane”. One name, used first, everywhere.',
    snap: {
      kind: 'listing',
      heading: 'Brightening Serum | Glowing Serum | That JLO Glow',
      subline:
        "Boosts skin's radiance & luminosity… That JLo Glow is now available!",
      cta: 'jlobeauty.com',
    },
  },
  'g-amazon': {
    id: 'g-amazon',
    name: 'Amazon Listing',
    channel: 'MARKETPLACE · AMAZON',
    icon: '📦',
    score: 54,
    dims: dims(48, 85, 44, 72, 66),
    flags: [
      { severity: 'crit', label: 'Instructions conflict' },
      { severity: 'crit', label: 'Isolated channel' },
    ],
    source_ids: ['amazonmon'],
    findings: [
      [
        'crit',
        "OBSERVED — The Amazon listing instructs “Apply 1–2 pumps to clean face and neck each morning.” The brand's own FAQ says to use it morning and night. Two official answers to the same question.",
      ],
      [
        'crit',
        'OBSERVED — The listing title is “JLO BEAUTY That JLO Glow Brightening Serum, Niacinamide & Squalane, 1.5 Oz” while the DTC page headline is simply “Brightening Serum”. A shopper comparing the two cannot confirm they are the same product.',
      ],
      [
        'warn',
        "OBSERVED — The listing sits in its own ecosystem with no route into the brand's routine, replenishment or guarantee.",
      ],
      [
        'good',
        'OBSERVED — Ingredient and benefit bullets carry the Terralume Complex™ story consistently with the DTC page.',
      ],
    ],
    reco: 'Align the usage instruction across both channels first — it is a product-efficacy claim, not copy. Then match the listing title to the DTC name and add an insert routing marketplace buyers into the routine.',
    snap: {
      kind: 'listing',
      heading:
        'JLO BEAUTY That JLO Glow Brightening Serum, Niacinamide & Squalane, 1.5 Oz',
      subline: '“Apply 1–2 pumps to clean face and neck each morning.”',
      cta: 'Amazon',
    },
  },
  'g-press': {
    id: 'g-press',
    name: 'Press & Awards Row',
    channel: 'EARNED · PRESS',
    icon: '📰',
    score: 73,
    dims: dims(70, 88, 76, 66, 72),
    flags: [
      { severity: 'good', label: 'Strong mastheads' },
      { severity: 'warn', label: 'No link to proof' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        "OBSERVED — The homepage carries an “As Seen In” row featuring Harper's Bazaar, Allure, Vogue and Glamour, with a correct trademark disclaimer.",
      ],
      [
        'warn',
        'OBSERVED — The logos are static; none links to the coverage, so the strongest third-party proof the brand owns is unverifiable in one click.',
      ],
    ],
    reco: 'Link each masthead to the article. Borrowed credibility converts far better when a shopper can check it.',
    snap: {
      kind: 'page',
      heading: 'AS SEEN IN*',
      subline:
        "Harper's Bazaar · allure · vogue · glamour — logos are not linked",
      cta: 'Static row',
    },
  },
  'g-instagram': {
    id: 'g-instagram',
    name: 'Instagram @JLoBeauty',
    channel: 'SOCIAL · INSTAGRAM',
    icon: '📸',
    score: 70,
    dims: dims(68, 90, 72, 64, 62),
    flags: [{ severity: 'neutral', label: 'Needs source' }],
    source_ids: ['meta'],
    findings: [
      [
        'warn',
        'Connect Meta to audit live creative, claims and ad-to-landing consistency for this channel.',
      ],
    ],
    reco: 'Connect the Meta source to bring paid and organic Instagram touchpoints into the audit.',
    snap: {
      kind: 'social',
      heading: '@JLoBeauty',
      subline: 'Connect Meta to capture live creative and claims.',
      cta: 'Not audited',
    },
  },
  'g-tiktok': {
    id: 'g-tiktok',
    name: 'TikTok @jlobeauty',
    channel: 'SOCIAL · TIKTOK',
    icon: '🎵',
    score: 68,
    dims: dims(64, 92, 66, 70, 60),
    flags: [{ severity: 'neutral', label: 'Needs source' }],
    source_ids: ['tiktokads'],
    findings: [
      [
        'warn',
        'Connect TikTok to audit creator content, naming consistency and link destinations.',
      ],
    ],
    reco: 'Connect the TikTok source to audit creator naming — the highest-risk channel for the naming fragmentation found elsewhere.',
    snap: {
      kind: 'social',
      heading: '@jlobeauty',
      subline:
        'Connect TikTok to capture creator content and link destinations.',
      cta: 'Not audited',
    },
  },
  'g-pdp': {
    id: 'g-pdp',
    name: 'Product Detail Page',
    channel: 'OWNED · SHOPIFY',
    icon: '🛍️',
    score: 61,
    dims: dims(54, 72, 58, 56, 68),
    flags: [
      { severity: 'crit', label: 'Self-contradiction' },
      { severity: 'crit', label: 'Proof missing' },
      { severity: 'good', label: 'Before/after' },
    ],
    source_ids: ['crawl', 'model'],
    findings: [
      [
        'crit',
        'OBSERVED — The page contradicts itself on usage. “How To Use” says to apply in the AM; the FAQ lower on the same page says “Yes! Use this glowing serum in the morning and at night.”',
      ],
      [
        'crit',
        'OBSERVED — The clinical results the brand leads with elsewhere (97% saw firmer skin, 94% saw more radiant skin, from an 8-week study naming this exact serum) appear on the homepage and Results page but not on this product page.',
      ],
      [
        'warn',
        "OBSERVED — The page shows 34 reviews at 4.44★ while the homepage advertises 16,000+ reviews and “10,000+ five-star reviews”. The brand's largest trust asset is not present at the point of decision.",
      ],
      [
        'warn',
        'OBSERVED — The headline is “Brightening Serum” with “THAT JLO GLOW®” as a subtitle, demoting the name that carries the brand equity.',
      ],
      [
        'good',
        'OBSERVED — Three genuine before-and-after customer images, a complete INCI ingredient list, and a detailed FAQ are all present — above the category standard.',
      ],
    ],
    reco: 'Fix the AM-versus-AM/PM contradiction today; it undermines efficacy. Then move the 97%/94% clinical figures and the full review count above the fold, and lead the headline with That JLO Glow®.',
    snap: {
      kind: 'page',
      heading: 'Brightening Serum',
      subline:
        'THAT JLO GLOW® · 1.5 oz (45 mL) · $79.00 — clinical results not shown here',
      cta: 'Add to cart',
    },
  },
  'g-science': {
    id: 'g-science',
    name: 'Ingredients & Science Page',
    channel: 'OWNED · CONTENT',
    icon: '🧪',
    score: 82,
    dims: dims(84, 80, 88, 76, 80),
    flags: [{ severity: 'good', label: 'Strong science story' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — Terralume Complex™ is explained as a four-part olive blend with squalane, giving the brand a proprietary, defensible ingredient story.',
      ],
      [
        'warn',
        "OBSERVED — The page is reached from the top navigation but is not linked from the serum's own ingredient section, where curiosity actually peaks.",
      ],
    ],
    reco: 'Link the PDP ingredient list directly to this page. The science is the differentiator — put it one click from the buy button.',
    snap: {
      kind: 'page',
      heading: 'Terralume Complex™',
      subline: 'A four-part olive blend with squalane, clinically refined.',
      cta: 'Learn more',
    },
  },
  'g-clinical': {
    id: 'g-clinical',
    name: 'Results / Clinical Page',
    channel: 'OWNED · CONTENT',
    icon: '📊',
    score: 78,
    dims: dims(72, 82, 84, 70, 78),
    flags: [
      { severity: 'good', label: 'Real clinical data' },
      { severity: 'warn', label: 'Stranded proof' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — Clinical figures are specific and properly qualified: an 8-week study of 30 subjects, with the products named and the sample size disclosed.',
      ],
      [
        'warn',
        'OBSERVED — This proof sits one navigation click away from the product page it describes, so most shoppers deciding on the serum never see it.',
      ],
    ],
    reco: 'Syndicate the clinical figures onto the PDP hero. Proof that lives on a separate page is proof most buyers never read.',
    snap: {
      kind: 'page',
      heading: '97% saw firmer skin',
      subline:
        '8-week study, 30 subjects, That JLO Glow® Serum + That Blockbuster® Cream',
      cta: 'See results',
    },
  },
  'g-reviews': {
    id: 'g-reviews',
    name: 'On-Page Reviews',
    channel: 'OWNED · REVIEWS',
    icon: '⭐',
    score: 64,
    dims: dims(66, 74, 62, 58, 64),
    flags: [
      { severity: 'warn', label: 'Scent unanswered' },
      { severity: 'warn', label: 'Q&A empty' },
    ],
    source_ids: ['reviews'],
    findings: [
      [
        'warn',
        'OBSERVED — Scent is a recurring theme in reviews, including a 4★ review asking for it to be improved, yet scent is not addressed anywhere in the FAQ or product copy.',
      ],
      [
        'warn',
        'OBSERVED — A Q&A section is present on the page but contains no questions or answers.',
      ],
      [
        'warn',
        "OBSERVED — Only 34 reviews are shown for the brand's flagship best-seller, well below what the brand's overall review volume would support.",
      ],
      [
        'good',
        'OBSERVED — An AI review summary surfaces themes (skin health 27%, product feel 19%) and gives shoppers a fast read of consensus.',
      ],
    ],
    reco: "Add a scent line to the FAQ, seed the Q&A with the questions support already answers daily, and syndicate reviews from the brand's wider review base onto this page.",
    snap: {
      kind: 'reviews',
      heading: '4.44 ★ · 34 reviews',
      subline:
        '“…it definitely gives you a beautiful glow, but they need to make the scent a little better.”',
      cta: 'Q&A is empty',
    },
  },
  'g-offer': {
    id: 'g-offer',
    name: 'End of Summer Offer Page',
    channel: 'OWNED · PROMO',
    icon: '🏷️',
    score: 55,
    dims: dims(46, 74, 58, 48, 66),
    flags: [
      { severity: 'crit', label: 'Offers compete' },
      { severity: 'crit', label: 'Price mismatch' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'crit',
        "OBSERVED — The shop page lists this serum at $63.00, marked “SAVE 20%”, but the product page's own price block shows $79.00 with no discount applied. The promise that earned the click is not honoured on arrival.",
      ],
      [
        'crit',
        'OBSERVED — Two different offers run simultaneously in the site header: “20% OFF” for the End of Summer Event, and “DISCOVER OUR NEW AM + PM RADIANCE ROUTINE + 3 FREE GIFTS”. A shopper cannot tell which applies to them.',
      ],
      [
        'warn',
        'OBSERVED — Discounts across the catalogue are inconsistent (20%, 21%, 29%, 15%), making the promotion hard to communicate in a single message.',
      ],
    ],
    reco: 'Serve one offer from a single source of truth so the shop page, product page and cart agree. Until they do, every promotion spends media to create a contradiction.',
    snap: {
      kind: 'page',
      heading: 'THE END OF SUMMER EVENT — 20% OFF',
      subline: 'Shop page shows $63.00. The product page shows $79.00.',
      cta: 'Shop the routine',
    },
  },
  'g-subscription': {
    id: 'g-subscription',
    name: 'Subscription Module',
    channel: 'OWNED · SUBSCRIPTION',
    icon: '♻️',
    score: 58,
    dims: dims(50, 76, 60, 44, 62),
    flags: [
      { severity: 'crit', label: 'Four prices' },
      { severity: 'warn', label: 'Terms in modal' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'crit',
        'OBSERVED — Four different figures attach to one product in the same view: a $79.00 regular price, a $19.99 line beside “One-time Purchase”, a $63.00 shop-page price, and subscription terms of three monthly payments of $49.95 plus $3.99 shipping.',
      ],
      [
        'warn',
        'OBSERVED — The material terms — that the first shipment is billed in three monthly instalments and that deliveries recur every three months — are disclosed inside a “How it works” modal rather than beside the subscribe button.',
      ],
      [
        'good',
        'OBSERVED — “Cancel Anytime” and free shipping are stated plainly on the module.',
      ],
    ],
    reco: 'Show two prices only — one-time and subscribe — and put the instalment and renewal terms in plain text next to the button. Clarity converts better than a discount that needs explaining.',
    snap: {
      kind: 'page',
      heading: 'One-time Purchase — $19.99?',
      subline:
        '$79.00 regular · 3 monthly payments of $49.95 + $3.99 S&H · every 3 months',
      cta: 'Subscribe',
    },
  },
  'g-crosssell': {
    id: 'g-crosssell',
    name: 'Complete Your Glow Cross-Sell',
    channel: 'OWNED · MERCH',
    icon: '🧴',
    score: 76,
    dims: dims(78, 74, 80, 70, 72),
    flags: [{ severity: 'good', label: 'Relevant pairing' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — The module recommends the Hydrating Cream, SPF 30 and Eye Cream, matching the routine the FAQ recommends — a genuinely coherent pairing.',
      ],
      [
        'warn',
        'OBSERVED — Each cross-sell shows its own subscription discount (20.34%, 15%), adding more price variants to a decision that already has four.',
      ],
    ],
    reco: 'Keep the pairing, simplify the pricing. Present the routine as one bundled price rather than four independently discounted items.',
    snap: {
      kind: 'page',
      heading: 'COMPLETE YOUR GLOW',
      subline:
        'Hydrating Cream $47 · SPF 30 $46.75 · Eye Cream $41.65 — three more discount rates',
      cta: 'Add',
    },
  },
  'g-checkout': {
    id: 'g-checkout',
    name: 'Cart & Checkout',
    channel: 'OWNED · SHOPIFY',
    icon: '🛒',
    score: 79,
    dims: dims(68, 84, 82, 80, 76),
    flags: [
      { severity: 'good', label: 'Shop Pay ready' },
      { severity: 'warn', label: 'Shipping surprise' },
    ],
    source_ids: ['crawl', 'model'],
    findings: [
      [
        'good',
        'OBSERVED — Standard Shopify checkout with digital wallets enabled, a well-trodden and low-friction path.',
      ],
      [
        'warn',
        'OBSERVED — “Complimentary shipping” is promoted in the site header, while the subscription terms disclose a $3.99 shipping and handling charge. The two need reconciling before a customer meets them at checkout.',
      ],
    ],
    reco: 'State exactly which orders ship free and which carry the $3.99 handling charge, from the product page onward.',
    snap: {
      kind: 'page',
      heading: 'Checkout',
      subline:
        'Shop Pay · digital wallets · “complimentary shipping” vs $3.99 S&H',
      cta: 'Pay now',
    },
  },
  'g-guarantee': {
    id: 'g-guarantee',
    name: '60-Day Guarantee & Returns',
    channel: 'OWNED · POLICY',
    icon: '🛡️',
    score: 85,
    dims: dims(88, 82, 86, 84, 80),
    flags: [{ severity: 'good', label: 'Best-in-class' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        "OBSERVED — A 60-day money-back guarantee is stated on every page audited, with “Try it. Love it. Or it's on us.” — clear, confident and consistent.",
      ],
      [
        'warn',
        'OBSERVED — The returns note “Free returns (less S&H)” qualifies the guarantee in small type; the exact deduction is not stated.',
      ],
    ],
    reco: 'State the shipping deduction in figures. A guarantee with an unquantified exception is weaker than a smaller guarantee stated precisely.',
    snap: {
      kind: 'page',
      heading: "Try it. Love it. Or it's on us.",
      subline: 'Full 60-day money back guarantee · Free returns (less S&H)',
      cta: 'Shop with confidence',
    },
  },
  'g-replenish': {
    id: 'g-replenish',
    name: 'Replenishment Subscription',
    channel: 'OWNED · SUBSCRIPTION',
    icon: '📦',
    score: 66,
    dims: dims(64, 72, 70, 58, 66),
    flags: [{ severity: 'warn', label: 'Cadence mismatch' }],
    source_ids: ['crawl'],
    findings: [
      [
        'warn',
        'OBSERVED — Delivery recurs every three months, while the product page instructs one to two pumps daily. At that rate a 1.5 oz bottle is unlikely to last a full quarter, so customers may run out before the next shipment.',
      ],
      [
        'good',
        'OBSERVED — Frequency can be changed, postponed or cancelled, and this is stated clearly.',
      ],
    ],
    reco: 'Model actual depletion at the recommended dose and offer a two-month cadence. Running out mid-cycle is the most common reason a skincare ritual breaks.',
    snap: {
      kind: 'email',
      heading: 'Your next delivery',
      subline:
        'Delivered every 3 months · daily use guidance suggests faster depletion',
      cta: 'Manage plan',
    },
  },
  'g-mantra': {
    id: 'g-mantra',
    name: 'Mantra Card Loyalty Drop',
    channel: 'OWNED · LOYALTY',
    icon: '🃏',
    score: 80,
    dims: dims(82, 78, 88, 74, 70),
    flags: [{ severity: 'good', label: 'Genuine ritual hook' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        "OBSERVED — A collectible mantra card ships with the introductory routine and a new one with every replenishment order — a well-designed reason to stay subscribed that fits the brand's philosophy.",
      ],
      [
        'warn',
        'OBSERVED — The mechanic is tied to the routine kit, so a customer who buys only this serum never enters it.',
      ],
    ],
    reco: "Extend the card drop to serum replenishment orders. It is the brand's strongest retention idea and currently reaches only kit buyers.",
    snap: {
      kind: 'physical',
      heading: "Jennifer's Mantra Cards",
      subline:
        'Collect 1 of 5 — one with your routine, another with every replenishment',
      cta: 'Kit buyers only',
    },
  },
  'g-email': {
    id: 'g-email',
    name: 'Post-Purchase Email',
    channel: 'CRM · EMAIL',
    icon: '📬',
    score: 72,
    dims: dims(70, 88, 74, 68, 66),
    flags: [{ severity: 'neutral', label: 'Needs source' }],
    source_ids: ['klaviyo'],
    findings: [
      [
        'warn',
        'Connect the email platform to audit onboarding, usage guidance and replenishment timing.',
      ],
    ],
    reco: 'Connect the CRM source to audit whether the AM/PM usage contradiction is repeated in onboarding email.',
    snap: {
      kind: 'email',
      heading: 'Welcome to the ritual',
      subline: 'Connect the CRM source to audit onboarding and usage guidance.',
      cta: 'Not audited',
    },
  },
  /* ── ampm ── */
  'a-hero': {
    id: 'a-hero',
    name: 'Homepage Hero',
    channel: 'OWNED · SITE',
    icon: '🏠',
    score: 74,
    dims: dims(70, 72, 82, 68, 74),
    flags: [
      { severity: 'warn', label: 'Two offers' },
      { severity: 'good', label: 'Clear hero' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'warn',
        'OBSERVED — The header runs two competing announcements: a 20% End of Summer Event and a routine kit with three free gifts.',
      ],
      [
        'good',
        'OBSERVED — The hero leads with the routine at $79.95 against a $99.95 reference price, with the three gifts named explicitly.',
      ],
    ],
    reco: 'Run one headline offer at a time. Two simultaneous promotions halve the clarity of both.',
    snap: {
      kind: 'page',
      heading: 'THE END OF SUMMER EVENT — 20% OFF',
      subline: '+ 3 FREE GIFTS · AM + PM Radiance Routine $79.95 (was $99.95)',
      cta: 'Shop the routine',
    },
  },
  'a-press': {
    id: 'a-press',
    name: 'Press & Awards Row',
    channel: 'EARNED · PRESS',
    icon: '📰',
    score: 73,
    dims: dims(70, 88, 76, 66, 72),
    flags: [{ severity: 'good', label: 'Strong mastheads' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — Four major beauty mastheads are cited with a correct trademark disclaimer.',
      ],
      ['warn', 'OBSERVED — Logos do not link to the coverage.'],
    ],
    reco: 'Link each masthead to its article.',
    snap: {
      kind: 'page',
      heading: 'AS SEEN IN*',
      subline:
        "Harper's Bazaar · allure · vogue · glamour — logos are not linked",
      cta: 'Static row',
    },
  },
  'a-kit': {
    id: 'a-kit',
    name: 'Routine Kit Page',
    channel: 'OWNED · SHOPIFY',
    icon: '🧺',
    score: 77,
    dims: dims(76, 74, 84, 72, 76),
    flags: [
      { severity: 'good', label: 'Clear value' },
      { severity: 'warn', label: 'Proof not shown' },
    ],
    source_ids: ['crawl', 'model'],
    findings: [
      [
        'good',
        'OBSERVED — The kit is positioned as best value at $79.95 against $99.95, with a complete morning-to-night ritual narrative.',
      ],
      [
        'warn',
        'OBSERVED — The clinical study that supports the routine names the serum and hydrating cream, but those figures are not repeated on the kit page.',
      ],
    ],
    reco: 'Bring the 97%/94% clinical figures onto the kit page — they were measured on this exact combination.',
    snap: {
      kind: 'page',
      heading: 'AM + PM Radiance Routine',
      subline: 'Your complete morning-to-night ritual · $79.95 (was $99.95)',
      cta: 'Add to cart',
    },
  },
  'a-clinical': {
    id: 'a-clinical',
    name: 'Results / Clinical Page',
    channel: 'OWNED · CONTENT',
    icon: '📊',
    score: 78,
    dims: dims(72, 82, 84, 70, 78),
    flags: [{ severity: 'good', label: 'Real clinical data' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — Study parameters are disclosed: 8 weeks, 30 subjects, products named.',
      ],
    ],
    reco: 'Keep. Syndicate these figures to the kit and serum pages.',
    snap: {
      kind: 'page',
      heading: '97% saw firmer skin',
      subline:
        '8-week study, 30 subjects, That JLO Glow® Serum + That Blockbuster® Cream',
      cta: 'See results',
    },
  },
  'a-gifts': {
    id: 'a-gifts',
    name: 'Free Gifts Offer',
    channel: 'OWNED · PROMO',
    icon: '🎁',
    score: 72,
    dims: dims(74, 76, 78, 64, 70),
    flags: [
      { severity: 'good', label: 'Tangible gifts' },
      { severity: 'warn', label: 'Competing 20%' },
    ],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — The three gifts are named specifically: lip mask, eye mask and a limited-edition mirror.',
      ],
      [
        'warn',
        'OBSERVED — The concurrent 20% event makes it unclear whether both offers can be combined.',
      ],
    ],
    reco: 'State explicitly whether the gift offer stacks with the 20% event.',
    snap: {
      kind: 'page',
      heading: '3 FREE GIFTS INCLUDED',
      subline:
        'Ultra-Hydrating Lip Mask · Define & Depuff Eye Mask · Limited Edition Bling Mirror',
      cta: 'Get it now',
    },
  },
  'a-checkout': {
    id: 'a-checkout',
    name: 'Cart & Checkout',
    channel: 'OWNED · SHOPIFY',
    icon: '🛒',
    score: 79,
    dims: dims(68, 84, 82, 80, 76),
    flags: [{ severity: 'good', label: 'Shop Pay ready' }],
    source_ids: ['crawl', 'model'],
    findings: [
      ['good', 'OBSERVED — Standard Shopify checkout with digital wallets.'],
      [
        'warn',
        'OBSERVED — Free-shipping messaging and the $3.99 subscription handling charge need reconciling.',
      ],
    ],
    reco: 'Reconcile the shipping message across kit and subscription purchases.',
    snap: {
      kind: 'page',
      heading: 'Checkout',
      subline:
        'Shop Pay · digital wallets · “complimentary shipping” vs $3.99 S&H',
      cta: 'Pay now',
    },
  },
  'a-mantra': {
    id: 'a-mantra',
    name: 'Mantra Card Loyalty Drop',
    channel: 'OWNED · LOYALTY',
    icon: '🃏',
    score: 80,
    dims: dims(82, 78, 88, 74, 70),
    flags: [{ severity: 'good', label: 'Genuine ritual hook' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — One of five collectible cards ships with the routine and another with each replenishment.',
      ],
    ],
    reco: 'Show the full set of five on the kit page — collection mechanics work when the set is visible.',
    snap: {
      kind: 'physical',
      heading: "Jennifer's Mantra Cards",
      subline:
        'Collect 1 of 5 — one with your routine, another with every replenishment',
      cta: 'Kit buyers only',
    },
  },
  'a-guarantee': {
    id: 'a-guarantee',
    name: '60-Day Guarantee & Returns',
    channel: 'OWNED · POLICY',
    icon: '🛡️',
    score: 85,
    dims: dims(88, 82, 86, 84, 80),
    flags: [{ severity: 'good', label: 'Best-in-class' }],
    source_ids: ['crawl'],
    findings: [
      [
        'good',
        'OBSERVED — 60-day money-back guarantee stated consistently sitewide.',
      ],
    ],
    reco: 'Quantify the “less S&H” deduction.',
    snap: {
      kind: 'page',
      heading: "Try it. Love it. Or it's on us.",
      subline: 'Full 60-day money back guarantee · Free returns (less S&H)',
      cta: 'Shop with confidence',
    },
  },
};

/* ── flow (CONN + FLOWVOL của prototype, key theo touchpoint id) ─────────── */

const edge = (
  from: string,
  to: string,
  type: RxAuditFlowEdge['type'],
  volume: number,
  note = ''
): RxAuditFlowEdge => ({ from, to, type, volume, note });

/** Lượng khách đến thẳng từng touchpoint (traffic model demo). Đường thật
 *  không có số này — service suy ngược từ `traffic.arrive` của journey. */
export const MOCK_FLOW_ENTRY: Record<string, Record<string, number>> = {
  glow: {
    'g-search': 29800,
    'g-amazon': 21400,
    'g-press': 8600,
    'g-pdp': 18900,
    'g-science': 6200,
    'g-clinical': 5100,
    'g-reviews': 12400,
    'g-offer': 16700,
    'g-instagram': 14200,
    'g-tiktok': 9800,
    'g-replenish': 3100,
    'g-mantra': 1900,
    'g-email': 2300,
  },
  ampm: {
    'a-hero': 34200,
    'a-press': 8600,
    'a-clinical': 5100,
    'a-kit': 11300,
    'a-mantra': 1900,
  },
};

const FLOW_EDGES: Record<string, RxAuditFlowEdge[]> = {
  glow: [
    edge(
      'g-search',
      'g-pdp',
      'weak',
      13600,
      'Title leads with a generic term, not the name people search'
    ),
    edge(
      'g-press',
      'g-pdp',
      'influence',
      3200,
      'Builds trust but the logos do not link to the coverage'
    ),
    edge('g-science', 'g-pdp', 'path', 4900),
    edge(
      'g-clinical',
      'g-pdp',
      'weak',
      3800,
      'Clinical proof sits here, not on the page where the decision is made'
    ),
    edge('g-reviews', 'g-pdp', 'influence', 12400),
    edge('g-pdp', 'g-subscription', 'path', 9400),
    edge('g-pdp', 'g-crosssell', 'path', 6100),
    edge(
      'g-offer',
      'g-pdp',
      'broken',
      0,
      'Offer page promises 20% off; the product page shows the full price'
    ),
    edge('g-subscription', 'g-checkout', 'path', 2600),
    edge('g-crosssell', 'g-checkout', 'path', 1400),
    edge('g-pdp', 'g-checkout', 'path', 4100),
    edge('g-checkout', 'g-guarantee', 'path', 2300),
    edge('g-checkout', 'g-replenish', 'path', 1900),
    edge('g-replenish', 'g-checkout', 'loop', 740),
    edge('g-mantra', 'g-replenish', 'loop', 1200),
  ],
  ampm: [
    edge('a-hero', 'a-kit', 'path', 14800),
    edge('a-press', 'a-kit', 'influence', 3200),
    edge(
      'a-clinical',
      'a-kit',
      'weak',
      3800,
      'Figures measured on this routine are not shown on its own page'
    ),
    edge('a-kit', 'a-gifts', 'path', 7900),
    edge('a-gifts', 'a-checkout', 'path', 3100),
    edge('a-kit', 'a-checkout', 'path', 2700),
    edge('a-checkout', 'a-mantra', 'path', 1900),
    edge('a-checkout', 'a-guarantee', 'path', 2400),
    edge('a-mantra', 'a-checkout', 'loop', 620),
  ],
};

/* ── drop-off (FUNNELS của prototype) ────────────────────────────────────── */

const usd = (dollars: number): number => dollars * 100;

/** Kênh demo: sessions theo share prototype, converted giữ đúng buyers/1000. */
const ch = (
  channel: string,
  sessions: number,
  per1000: number
): RxAuditChannel => ({
  channel,
  sessions,
  converted: Math.round((sessions * per1000) / 1000),
  revenue_cents: 0,
  estimated: true,
});

export const MOCK_AUDIT_LEAKS: Record<string, RxAuditLeaksResponse> = {
  glow: {
    funnel: {
      steps: [
        {
          key: 'sessions',
          label: 'Sessions',
          count: 96000,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'product_view',
          label: 'Product view',
          count: 41000,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'add_to_cart',
          label: 'Add to cart',
          count: 7800,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'checkout',
          label: 'Checkout',
          count: 4100,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'purchase',
          label: 'Purchase',
          count: 2300,
          drop_pct: null,
          estimated: true,
        },
      ],
      benchmarks: [
        { key: 'sessions', rate: 0.46 },
        { key: 'product_view', rate: 0.26 },
        { key: 'add_to_cart', rate: 0.55 },
        { key: 'checkout', rate: 0.66 },
      ],
    },
    leaks: [
      {
        id: 'g2',
        rank: 1,
        title: "The proof isn't on the page where people decide",
        from_step: 'product_view',
        to_step: 'add_to_cart',
        touchpoint_id: 'g-pdp',
        usd_cents: usd(27300),
        confidence: '86%',
        recovery_range: { lo_usd_cents: 440000, hi_usd_cents: 650000 },
        narrative:
          'The product page carries 34 reviews and no clinical figures, while the brand advertises 16,000+ reviews and a study showing 97% of users saw firmer skin. The evidence that would close the sale exists — it is simply on other pages. The same page also contradicts itself on how to use the product.',
        evidence: [
          {
            source: 'crawl',
            text: 'Clinical figures appear on the homepage and Results page, not on the serum PDP',
          },
          {
            source: 'reviews',
            text: '34 reviews shown at 4.44★ against 16,000+ advertised sitewide',
          },
          {
            source: 'crawl',
            text: '“How To Use” says AM; the FAQ on the same page says morning and night',
          },
        ],
        fix: 'Move the 97%/94% clinical figures and the full review count above the fold, and resolve the AM versus AM/PM contradiction. Estimated recovery: $4,400–6,500/mo.',
        estimated: true,
      },
      {
        id: 'g1',
        rank: 2,
        title: 'One product, four different names',
        from_step: 'sessions',
        to_step: 'product_view',
        touchpoint_id: 'g-search',
        usd_cents: usd(21600),
        confidence: '79%',
        recovery_range: { lo_usd_cents: 300000, hi_usd_cents: 480000 },
        narrative:
          'The serum is called “Brightening Serum” on its own page, “That JLO Glow Brightening Serum” on Amazon, “That JLo Glow Multitasking Serum” in press coverage, and “That JLo Glow Serum” in resale listings. Recognition breaks between the channel that creates demand and the page that captures it.',
        evidence: [
          {
            source: 'crawl',
            text: 'PDP headline is “Brightening Serum” with That JLO Glow® as a subtitle',
          },
          {
            source: 'amazonmon',
            text: 'Amazon title leads with the full equity name; the DTC page does not',
          },
        ],
        fix: 'Adopt one canonical product name and lead with it everywhere — page title, PDP headline, marketplace listing and creator briefs. Estimated recovery: $3,000–4,800/mo.',
        estimated: true,
      },
      {
        id: 'g3',
        rank: 3,
        title: 'Three prices for one product at the moment of choice',
        from_step: 'add_to_cart',
        to_step: 'checkout',
        touchpoint_id: 'g-offer',
        usd_cents: usd(15900),
        confidence: '81%',
        recovery_range: { lo_usd_cents: 190000, hi_usd_cents: 290000 },
        narrative:
          'The shop page shows $63.00 with a 20% saving. The product page shows $79.00. The subscription module shows $19.99 alongside terms of three monthly payments of $49.95 plus shipping. A shopper cannot tell what the product costs.',
        evidence: [
          {
            source: 'crawl',
            text: 'Shop page: $79.00 struck through, $63.00, SAVE 20%',
          },
          {
            source: 'crawl',
            text: 'Product page price block: $79.00, no discount applied',
          },
          {
            source: 'crawl',
            text: 'Subscription terms: 3 × $49.95 + $3.99 S&H, described as 66% off the first shipment',
          },
        ],
        fix: 'Serve one price and one offer from a single source of truth across shop page, product page and cart. Estimated recovery: $1,900–2,900/mo.',
        estimated: true,
      },
      {
        id: 'g4',
        rank: 4,
        title: 'Subscription terms disclosed inside a modal',
        from_step: 'checkout',
        to_step: 'purchase',
        touchpoint_id: 'g-subscription',
        usd_cents: usd(9700),
        confidence: '72%',
        recovery_range: { lo_usd_cents: 90000, hi_usd_cents: 150000 },
        narrative:
          'The instalment structure and the three-month renewal cadence are explained in a “How it works” overlay rather than beside the subscribe button, so the commitment is only clear to shoppers who open it.',
        evidence: [
          {
            source: 'crawl',
            text: 'Terms appear in a modal; the button area shows only price and “Cancel Anytime”',
          },
          {
            source: 'crawl',
            text: 'Header promotes complimentary shipping while subscription terms add $3.99 S&H',
          },
        ],
        fix: 'Put the instalment and renewal terms in plain text beside the button and reconcile the shipping message. Estimated recovery: $900–1,500/mo.',
        estimated: true,
      },
    ],
    channels: [
      ch('Organic search', 29760, 24),
      ch('Direct', 21120, 33),
      ch('Instagram', 16320, 14),
      ch('TikTok', 11520, 11),
      ch('Email', 9600, 41),
      ch('Amazon referral', 7680, 19),
    ],
  },
  ampm: {
    funnel: {
      steps: [
        {
          key: 'sessions',
          label: 'Sessions',
          count: 58000,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'product_view',
          label: 'Product view',
          count: 26000,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'add_to_cart',
          label: 'Add to cart',
          count: 5400,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'checkout',
          label: 'Checkout',
          count: 3100,
          drop_pct: null,
          estimated: true,
        },
        {
          key: 'purchase',
          label: 'Purchase',
          count: 1950,
          drop_pct: null,
          estimated: true,
        },
      ],
      benchmarks: [
        { key: 'sessions', rate: 0.46 },
        { key: 'product_view', rate: 0.24 },
        { key: 'add_to_cart', rate: 0.55 },
        { key: 'checkout', rate: 0.66 },
      ],
    },
    leaks: [
      {
        id: 'a1',
        rank: 1,
        title: 'Two headline offers competing in the header',
        from_step: 'sessions',
        to_step: 'product_view',
        touchpoint_id: 'a-hero',
        usd_cents: usd(14800),
        confidence: '74%',
        recovery_range: { lo_usd_cents: 180000, hi_usd_cents: 280000 },
        narrative:
          'The site header runs a 20% End of Summer Event and a routine-plus-three-gifts offer simultaneously, with no statement of whether they combine. Shoppers arriving on either promise cannot tell which applies to them.',
        evidence: [
          {
            source: 'crawl',
            text: 'Header carries both announcements at the same time',
          },
          {
            source: 'crawl',
            text: 'Catalogue discounts range across 15%, 20%, 21% and 29%',
          },
        ],
        fix: 'Run one headline offer at a time, and state explicitly whether gifts stack with the percentage discount. Estimated recovery: $1,800–2,800/mo.',
        estimated: true,
      },
      {
        id: 'a2',
        rank: 2,
        title: "The routine's own clinical proof isn't on its page",
        from_step: 'product_view',
        to_step: 'add_to_cart',
        touchpoint_id: 'a-kit',
        usd_cents: usd(11200),
        confidence: '80%',
        recovery_range: { lo_usd_cents: 110000, hi_usd_cents: 180000 },
        narrative:
          "The 8-week study was run on the serum and hydrating cream — the core of this routine — yet the kit page does not carry those figures, so the strongest argument for buying the routine is absent from the routine's page.",
        evidence: [
          {
            source: 'crawl',
            text: 'Clinical figures appear on the homepage and Results page only',
          },
          {
            source: 'crawl',
            text: 'Kit page leads on value framing rather than proof',
          },
        ],
        fix: 'Put the 97% firmer skin and 94% radiance figures on the kit page hero. Estimated recovery: $1,100–1,800/mo.',
        estimated: true,
      },
    ],
    channels: [
      ch('Direct', 19720, 38),
      ch('Organic search', 15080, 29),
      ch('Instagram', 10440, 17),
      ch('Email', 8120, 44),
      ch('TikTok', 4640, 12),
    ],
  },
};

/** "What ReXeR is learning" — khối pattern cuối màn Drop-off (chung cả brand). */
export const MOCK_AUDIT_PATTERNS: Array<{ title: string; body: string }> = [
  {
    title: 'Proof is stranded.',
    body: 'The brand owns unusually strong evidence — an 8-week clinical study, 16,000+ reviews, four major mastheads — and almost none of it appears on the pages where people decide. This is the highest-value, lowest-effort fix in the audit.',
  },
  {
    title: 'One product, many names.',
    body: '“Brightening Serum”, “That JLO Glow Brightening Serum”, “That JLo Glow Multitasking Serum”. Demand is created under one name and captured under another.',
  },
  {
    title: 'Price and offer multiply.',
    body: 'Four figures attach to one serum and two headline offers run at once. Every additional number is a reason to postpone the decision.',
  },
  {
    title: "Channels don't meet.",
    body: 'The Amazon listing gives different usage instructions and routes buyers nowhere — a separate business running under the same brand.',
  },
];

/* ── journey builders (state/traffic/score dựng từ defs + flow + nguồn) ──── */

type StageDef = {
  key: string;
  name: string;
  icon: string;
  objective: string;
  tpIds: string[];
};

const GLOW_STAGES: StageDef[] = [
  {
    key: 'awareness',
    name: 'Awareness',
    icon: '📡',
    objective:
      'Be found under the name customers actually search for, with one consistent product identity.',
    tpIds: ['g-search', 'g-amazon', 'g-press', 'g-instagram', 'g-tiktok'],
  },
  {
    key: 'consideration',
    name: 'Consideration',
    icon: '🔬',
    objective:
      'Put the proof where the decision happens — on the product page itself.',
    tpIds: ['g-pdp', 'g-science', 'g-clinical', 'g-reviews'],
  },
  {
    key: 'decision',
    name: 'Decision',
    icon: '⚖️',
    objective:
      'Give one clear price and one clear offer at the moment of choice.',
    tpIds: ['g-offer', 'g-subscription', 'g-crosssell'],
  },
  {
    key: 'purchase',
    name: 'Purchase',
    icon: '💳',
    objective:
      'Convert without surprises between the price shown and the price charged.',
    tpIds: ['g-checkout'],
  },
  {
    key: 'post_purchase',
    name: 'Post-Purchase',
    icon: '🔁',
    objective:
      "Turn a first order into the ritual the brand's whole story is built on.",
    tpIds: ['g-guarantee', 'g-replenish', 'g-mantra', 'g-email'],
  },
];

const AMPM_STAGES: StageDef[] = [
  {
    key: 'awareness',
    name: 'Awareness',
    icon: '📡',
    objective:
      'Make the routine, not the single product, the thing customers discover.',
    tpIds: ['a-hero', 'a-press'],
  },
  {
    key: 'consideration',
    name: 'Consideration',
    icon: '🔬',
    objective: 'Show why the routine outperforms the individual products.',
    tpIds: ['a-kit', 'a-clinical'],
  },
  {
    key: 'decision',
    name: 'Decision',
    icon: '⚖️',
    objective: 'Make the gifts and the guarantee do the closing work.',
    tpIds: ['a-gifts'],
  },
  {
    key: 'purchase',
    name: 'Purchase',
    icon: '💳',
    objective: 'A checkout that matches the premium positioning.',
    tpIds: ['a-checkout'],
  },
  {
    key: 'post_purchase',
    name: 'Post-Purchase',
    icon: '🔁',
    objective: 'Convert the kit buyer into a subscriber.',
    tpIds: ['a-mantra', 'a-guarantee'],
  },
];

const HANDOFFS: Record<
  string,
  Array<{ sev: 'crit' | 'warn' | 'ok'; label: string; note: string }>
> = {
  glow: [
    {
      sev: 'crit',
      label: 'Name splits',
      note: 'The product carries a different name on search, on Amazon and on its own page.',
    },
    {
      sev: 'crit',
      label: 'Proof stranded',
      note: 'Clinical results and review volume sit on other pages, not where the decision is made.',
    },
    {
      sev: 'crit',
      label: 'Price conflict',
      note: '$79 on the product page, $63 on the shop page, $19.99 and $49.95×3 in the subscription module.',
    },
    {
      sev: 'warn',
      label: 'Ritual gap',
      note: 'Three-month replenishment against daily use; the loyalty mechanic excludes serum-only buyers.',
    },
  ],
  ampm: [
    {
      sev: 'warn',
      label: 'Two offers',
      note: 'The 20% event and the free-gift routine offer run at the same time.',
    },
    {
      sev: 'warn',
      label: 'Proof stranded',
      note: 'Clinical figures measured on this routine are not shown on its own page.',
    },
    {
      sev: 'ok',
      label: 'Clean handoff',
      note: 'Kit price and gifts carry into checkout consistently.',
    },
    {
      sev: 'ok',
      label: 'Clean handoff',
      note: 'Guarantee and loyalty card are consistent post-purchase.',
    },
  ],
};

const defaultSourceStatus = (sourceId: string): AuditSource['status'] =>
  MOCK_AUDIT_SOURCES.find(source => source.id === sourceId)?.status ??
  'available';

const tpStateOf = (def: TpDef): RxAuditTouchpoint['state'] => {
  const statuses = def.source_ids.map(defaultSourceStatus);
  if (statuses.includes('connected')) return 'live';
  if (statuses.includes('attention')) return 'stale';
  return 'off';
};

const trafficOf = (
  productId: string,
  tpId: string
): RxAuditTouchpoint['traffic'] => {
  const edges = FLOW_EDGES[productId] ?? [];
  const entry = MOCK_FLOW_ENTRY[productId]?.[tpId] ?? 0;
  const inbound = edges
    .filter(e => e.to === tpId && e.type !== 'influence')
    .reduce((total, e) => total + e.volume, 0);
  const outbound = edges
    .filter(e => e.from === tpId && e.type !== 'influence')
    .reduce((total, e) => total + e.volume, 0);
  const arrive = entry + inbound;
  if (!arrive) return null;
  const leave = Math.max(0, arrive - outbound);
  // continue_rate là PHÂN SỐ 0..1 như BE.
  return {
    arrive,
    continue_rate: Math.min(1, outbound / arrive),
    leave,
    estimated: true,
  };
};

const buildJourney = (
  productId: string,
  stageDefs: StageDef[]
): RxAuditJourney => {
  const leaks = MOCK_AUDIT_LEAKS[productId]?.leaks ?? [];
  const stages: RxAuditStage[] = stageDefs.map(stage => {
    const touchpoints: RxAuditTouchpoint[] = stage.tpIds.map(tpId => {
      const def = TP_DEFS[tpId];
      return {
        id: def.id,
        name: def.name,
        channel: def.channel,
        icon: def.icon,
        state: tpStateOf(def),
        score: def.score,
        dims: def.dims,
        flags: def.flags,
        traffic: trafficOf(productId, tpId),
        source_ids: def.source_ids,
      };
    });
    const audited = touchpoints.filter(tp => tp.state !== 'off');
    const score = audited.length
      ? Math.round(
          audited.reduce((total, tp) => total + (tp.score ?? 0), 0) /
            audited.length
        )
      : null;
    const leakCents = leaks
      .filter(
        leak =>
          leak.touchpoint_id != null && stage.tpIds.includes(leak.touchpoint_id)
      )
      .reduce((total, leak) => total + leak.usd_cents, 0);
    return {
      key: stage.key,
      name: stage.name,
      objective: stage.objective,
      score,
      leak_usd_cents: leakCents,
      touchpoints,
    };
  });

  return {
    stages,
    handoffs: (HANDOFFS[productId] ?? []).map((handoff, index) => ({
      after_stage: stageDefs[index]?.key ?? '',
      severity: handoff.sev,
      label: handoff.label,
      note: handoff.note,
    })),
  };
};

export const MOCK_AUDIT_JOURNEYS: Record<string, RxAuditJourney> = {
  glow: buildJourney('glow', GLOW_STAGES),
  ampm: buildJourney('ampm', AMPM_STAGES),
};

const stageKeyOf = (tpId: string): string => {
  const defs = tpId.startsWith('g-') ? GLOW_STAGES : AMPM_STAGES;
  return defs.find(stage => stage.tpIds.includes(tpId))?.key ?? '';
};

/** Flow mock theo shape BE: node không mang entry — entry ở MOCK_FLOW_ENTRY. */
export const MOCK_AUDIT_FLOWS: Record<string, RxAuditFlow> = Object.fromEntries(
  Object.entries(FLOW_EDGES).map(([productId, edges]) => {
    const ids = new Set<string>();
    edges.forEach(e => {
      ids.add(e.from);
      ids.add(e.to);
    });
    Object.keys(MOCK_FLOW_ENTRY[productId] ?? {}).forEach(id => ids.add(id));
    return [
      productId,
      {
        nodes: [...ids].map(id => {
          const def = TP_DEFS[id];
          return {
            id,
            name: def?.name ?? id,
            stage: stageKeyOf(id),
            channel: def?.channel ?? '',
            state: def ? tpStateOf(def) : 'off',
            score: def?.score ?? null,
          };
        }),
        edges,
      },
    ];
  })
);

/** Icon stage theo key — phần trình bày, không nằm trong hợp đồng Rx. */
export const AUDIT_STAGE_ICONS: Record<string, string> = {
  awareness: '📡',
  consideration: '🔬',
  decision: '⚖️',
  purchase: '💳',
  post_purchase: '🔁',
};

/* ── product catalog (rail) ──────────────────────────────────────────────── */

const auditedCount = (productId: string): number =>
  MOCK_AUDIT_JOURNEYS[productId].stages.reduce(
    (total, stage) =>
      total + stage.touchpoints.filter(tp => tp.state !== 'off').length,
    0
  );

const productScoreOf = (productId: string): number | null => {
  const scores = MOCK_AUDIT_JOURNEYS[productId].stages
    .map(stage => stage.score)
    .filter((score): score is number => score != null);
  return scores.length
    ? Math.round(
        scores.reduce((total, score) => total + score, 0) / scores.length
      )
    : null;
};

export const MOCK_AUDIT_PRODUCTS: RxAuditProduct[] = [
  {
    id: 'glow',
    name: 'That JLO Glow® Brightening Serum',
    sku: '1.5 OZ · $79.00',
    category: 'JLO Beauty · Skincare',
    score: productScoreOf('glow'),
    touchpoint_count: auditedCount('glow'),
  },
  {
    id: 'ampm',
    name: 'AM + PM Radiance Routine',
    sku: 'KIT · $79.95',
    category: 'JLO Beauty · Skincare',
    score: productScoreOf('ampm'),
    touchpoint_count: auditedCount('ampm'),
  },
];

/** Icon thumbnail của product mock (không nằm trong hợp đồng Rx). */
export const AUDIT_PRODUCT_ICONS: Record<string, string> = {
  glow: '✨',
  ampm: '🌗',
};

/* ── touchpoint detail (drawer) ──────────────────────────────────────────── */

const detailOf = (tpId: string): RxAuditTouchpointDetail => {
  const def = TP_DEFS[tpId];
  const productId = tpId.startsWith('g-') ? 'glow' : 'ampm';
  const edges = FLOW_EDGES[productId] ?? [];
  const findings: RxAuditFinding[] = def.findings.map(([severity, text]) => ({
    severity,
    text,
    evidence_source: def.source_ids[0] ?? 'crawl',
    observed_at: '2026-08-25',
    snapshot_id: null,
  }));
  return {
    id: def.id,
    product_id: productId,
    stage: stageKeyOf(tpId),
    name: def.name,
    channel: def.channel,
    icon: def.icon,
    state: tpStateOf(def),
    score: def.score,
    dims: def.dims,
    findings,
    recommendation: def.reco,
    // Snapshot BE là extract có cấu trúc; bản hiển thị demo nằm ở
    // MOCK_SNAPSHOTS bên dưới.
    snapshot: null,
    flows_in: edges.filter(e => e.to === tpId),
    flows_out: edges.filter(e => e.from === tpId),
    leaks: [],
    source_ids: def.source_ids,
  };
};

/** Snapshot hiển thị (kind/heading/subline/cta) — bản demo theo prototype. */
export const MOCK_SNAPSHOTS: Record<string, AuditSnapshot> = Object.fromEntries(
  Object.values(TP_DEFS).map(def => [def.id, def.snap])
);

export const MOCK_AUDIT_TOUCHPOINT_DETAILS: Record<
  string,
  RxAuditTouchpointDetail
> = Object.fromEntries(
  Object.keys(TP_DEFS).map(tpId => [tpId, detailOf(tpId)])
);

/* ── connect wizard configs (SRC_AUTH của prototype, demo mode) ──────────── */

export const MOCK_WIZARDS: Record<string, WizardConfig> = {
  shopify: {
    provider: 'shopify',
    steps: [
      {
        kind: 'form',
        title: 'Store',
        cta: 'Continue',
        lead: 'Point ReXeR at the Shopify store behind this journey. The audit reads pricing, promotions and checkout behaviour — it never edits your store.',
        fields: [
          {
            label: 'Store domain',
            value: 'jlobeauty.myshopify.com',
            help: 'Find it in Shopify admin → Settings → Domains.',
          },
        ],
      },
      {
        kind: 'oauth',
        title: 'Authorize',
        cta: 'Install app',
        popup: {
          url: 'admin.shopify.com/oauth/authorize?client_id=rexer-audit',
          brandBg: '#95BF47',
          brandLetter: 'S',
          brandName: 'Shopify',
          brandSub:
            '<b>ReXeR Audit</b> wants to access <b>JLO Beauty</b> (jlobeauty.myshopify.com)',
        },
        perms: [
          {
            title: 'Products & pricing',
            code: 'read_products',
            desc: 'Product names, variants, prices and compare-at prices — resolves the $79 / $63 conflict',
          },
          {
            title: 'Orders',
            code: 'read_orders',
            desc: "Order totals, applied discounts and shipping lines (last 60 days — older history needs Shopify's read_all_orders approval)",
          },
          {
            title: 'Abandoned checkouts',
            code: 'read_checkouts',
            desc: 'Where carts stall — feeds the Checkout step of the drop-off funnel. Requires Shopify protected-data approval.',
          },
          {
            title: 'Discounts & promotions',
            code: 'read_price_rules',
            desc: 'Which discount is actually active at each step',
          },
        ],
        denyNote: 'ReXeR cannot change products, prices, orders or settings.',
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Reading catalog', '2 products'],
          ['Reading price rules', '1 active promotion'],
          ['Backfilling orders', '60 days'],
          ['Importing abandoned checkouts', '312 carts'],
        ],
        done: {
          stats: '2 products · 1 active promotion · 60-day order history',
          msg: 'The $79 / $63 / $19.99 / $49.95 price conflict is now audited against live store data.',
        },
      },
    ],
  },
  woocommerce: {
    provider: 'woocommerce',
    steps: [
      {
        kind: 'form',
        title: 'Site',
        cta: 'Continue',
        lead: 'Connect the WordPress store running WooCommerce. ReXeR reads products, coupons and orders over the REST API.',
        fields: [
          {
            label: 'Site URL',
            value: 'https://shop.jlobeauty.com',
            help: 'The public address of the WordPress site.',
          },
        ],
      },
      {
        kind: 'form',
        title: 'API keys',
        cta: 'Test & connect',
        guide: {
          title: 'Where to create read-only keys',
          body: 'WooCommerce → Settings → Advanced → REST API → Add key. Set Permissions to Read, then paste the pair below.',
        },
        fields: [
          {
            label: 'Consumer key',
            value: 'ck_9f2a………………………………7d31',
            help: 'Starts with ck_ — identifies this connection.',
          },
          {
            label: 'Consumer secret',
            value: 'cs_84be………………………………02ef',
            help: 'Starts with cs_ — shown once when the key is created.',
            type: 'password',
          },
        ],
        denyNote:
          'Keys created with Read permission cannot modify the store, even if leaked.',
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Verifying credentials', 'GET /wc/v3'],
          ['Reading products & coupons', '14 items'],
          ['Backfilling orders', '90 days'],
        ],
        done: {
          stats: 'Store verified · read-only keys · 90-day order history',
          msg: 'Checkout pricing and coupon behaviour on the WooCommerce storefront is now auditable.',
        },
      },
    ],
  },
  ga4: {
    provider: 'ga4',
    steps: [
      {
        kind: 'oauth',
        title: 'Account',
        cta: 'Continue',
        popup: {
          url: 'accounts.google.com/o/oauth2/v2/auth',
          brandBg: '#ffffff',
          brandLetter: 'G',
          brandName: 'Sign in with Google',
          brandSub: 'Choose an account to continue to <b>ReXeR</b>',
        },
        accounts: {
          key: 'gaAcct',
          items: [
            {
              bg: '#4285F4',
              initials: 'M',
              name: 'marketing@jlobeauty.com',
              sub: 'Owner · JLO Beauty Analytics',
            },
            {
              bg: '#0FA36B',
              initials: 'A',
              name: 'analytics@jlobeauty.com',
              sub: 'Analyst access',
            },
          ],
        },
      },
      {
        kind: 'oauth',
        title: 'Consent',
        cta: 'Allow',
        popup: {
          url: 'accounts.google.com/signin/oauth/consent',
          brandBg: '#ffffff',
          brandLetter: 'G',
          brandName: 'ReXeR wants access to your Google Account',
          brandSub: 'marketing@jlobeauty.com',
        },
        perms: [
          {
            title: 'View your Google Analytics data',
            code: 'analytics.readonly',
            desc: 'Sessions, funnel events and channel mix — replaces every estimated figure in this audit',
          },
          {
            title: 'See your primary email address',
            desc: 'Used only to label this connection',
          },
        ],
        denyNote: 'ReXeR cannot edit properties, audiences or settings.',
      },
      {
        kind: 'picker',
        title: 'Property',
        cta: 'Connect property',
        lead: 'Pick the GA4 property that measures this journey.',
        accountsKey: 'gaProp',
        accounts: [
          {
            bg: '#F9AB00',
            initials: 'W',
            name: 'JLO Beauty — Web',
            sub: 'Property 384412765 · stream jlobeauty.com',
          },
          {
            bg: '#5F6368',
            initials: 'A',
            name: 'JLO Beauty — App',
            sub: 'Property 384412801 · iOS + Android',
          },
        ],
        help: 'ReXeR reads view_item → add_to_cart → begin_checkout → purchase from this property to build the drop-off funnel.',
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Backfilling funnel events', '90 days'],
          ['Reading channel mix', '7 channels'],
          ['Reading landing pages', '41 pages'],
        ],
        done: {
          stats: 'Property 384412765 · funnel events backfilled 90 days',
          msg: 'Every estimated figure in the audit is replaced with measured GA4 data.',
        },
      },
    ],
  },
  tiktokshop: {
    provider: 'tiktokshop',
    steps: [
      {
        kind: 'oauth',
        title: 'Authorize',
        cta: 'Authorize',
        popup: {
          url: 'auth.tiktok-shops.com/oauth/authorize?app_key=rexer',
          brandBg: '#000000',
          brandLetter: 'T',
          brandName: 'TikTok Shop',
          brandSub:
            '<b>ReXeR Audit</b> requests seller authorization for the following scopes',
        },
        perms: [
          {
            title: 'Product listings',
            code: 'product.read',
            desc: 'Titles, prices and imagery on shop listings — where naming drift starts',
          },
          {
            title: 'Orders',
            code: 'order.read',
            desc: "Order volumes per listing, for the funnel's Purchase step",
          },
          {
            title: 'Shop analytics',
            code: 'analytics.read',
            desc: 'Product-level performance, live and video attribution',
          },
          {
            title: 'Promotions',
            code: 'promotion.read',
            desc: 'Flash-sale and livestream offers, compared against DTC pricing',
          },
        ],
        denyNote: 'ReXeR cannot list, edit or fulfil anything in the shop.',
      },
      {
        kind: 'picker',
        title: 'Shop',
        cta: 'Link shop',
        lead: 'This seller account manages 2 shops. Choose the one behind this journey.',
        accountsKey: 'ttShop',
        accounts: [
          {
            bg: '#000000',
            initials: 'US',
            name: 'JLO Beauty Official',
            sub: 'US market · 34 listings',
          },
          {
            bg: '#E4405F',
            initials: 'VN',
            name: 'JLO Beauty VN',
            sub: 'Vietnam market · 12 listings',
          },
        ],
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Reading listings', '34 products'],
          ['Reading live & video offers', '6 active'],
          ['Backfilling order analytics', '90 days'],
        ],
        done: {
          stats: '1 shop linked · US market · 34 listings',
          msg: 'TikTok Shop listings, livestream offers and product performance are now audited as a sales channel.',
        },
      },
    ],
  },
  meta: {
    provider: 'meta',
    steps: [
      {
        kind: 'oauth',
        title: 'Log in',
        cta: 'Continue as JLO Beauty',
        popup: {
          url: 'facebook.com/v19.0/dialog/oauth',
          brandBg: '#1877F2',
          brandLetter: 'f',
          brandName: 'Log in with Facebook',
          brandSub:
            '<b>ReXeR Audit</b> will receive your name and the assets you grant below',
        },
        perms: [
          {
            title: 'Read ad performance',
            code: 'ads_read',
            desc: 'Active creative, copy and landing URLs — checked for naming and claim drift',
          },
          {
            title: 'Read Page content',
            code: 'pages_read_engagement',
            desc: 'Organic posts on the brand Page, compared against the product page',
          },
        ],
        denyNote: 'ReXeR cannot publish, boost or edit ads or posts.',
      },
      {
        kind: 'picker',
        title: 'Ad account',
        cta: 'Connect account',
        lead: 'Choose the ad account whose creative should be audited.',
        accountsKey: 'metaAcct',
        accounts: [
          {
            bg: '#1877F2',
            initials: 'US',
            name: 'JLO Beauty US',
            sub: 'act_238412 · active',
          },
          {
            bg: '#5F6368',
            initials: 'EU',
            name: 'JLO Beauty EU',
            sub: 'act_238499 · paused',
          },
        ],
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Reading active creative', '18 ads'],
          ['Scanning names & claims', 'vs product page'],
        ],
        done: {
          stats: '1 ad account · 18 active creatives scanned',
          msg: 'Instagram and Facebook creative is now audited for naming and claim consistency.',
        },
      },
    ],
  },
  tiktokads: {
    provider: 'tiktokads',
    steps: [
      {
        kind: 'oauth',
        title: 'Authorize',
        cta: 'Authorize',
        popup: {
          url: 'business-api.tiktok.com/portal/auth?app_id=rexer',
          brandBg: '#000000',
          brandLetter: 'T',
          brandName: 'TikTok for Business',
          brandSub:
            '<b>ReXeR Audit</b> requests read access to your advertiser account',
        },
        perms: [
          {
            title: 'Ad account',
            code: 'advertiser.read',
            desc: 'Campaign structure and spend context',
          },
          {
            title: 'Creative library',
            code: 'creative.read',
            desc: 'Creator content and captions — the highest-risk channel for product-name drift',
          },
          {
            title: 'Landing URLs',
            desc: 'Where each ad actually sends people, checked against the journey map',
          },
        ],
        denyNote: 'ReXeR cannot create or edit campaigns.',
      },
      {
        kind: 'picker',
        title: 'Advertiser',
        cta: 'Connect account',
        lead: 'Choose the advertiser account to audit.',
        accountsKey: 'ttAds',
        accounts: [
          {
            bg: '#000000',
            initials: 'JB',
            name: 'JLO Beauty',
            sub: 'Advertiser 7418302 · active',
          },
        ],
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Reading creator content', '23 videos'],
          ['Checking link destinations', '23 URLs'],
        ],
        done: {
          stats: '1 advertiser account · 23 creatives checked',
          msg: 'TikTok creative and link destinations are now part of the Awareness audit.',
        },
      },
    ],
  },
  klaviyo: {
    provider: 'klaviyo',
    steps: [
      {
        kind: 'oauth',
        title: 'Authorize',
        cta: 'Allow access',
        popup: {
          url: 'www.klaviyo.com/oauth/authorize?client_id=rexer',
          brandBg: '#111827',
          brandLetter: 'K',
          brandName: 'Klaviyo',
          brandSub:
            '<b>ReXeR Audit</b> is requesting the following read-only scopes',
        },
        perms: [
          {
            title: 'Campaigns & flows',
            code: 'campaigns:read flows:read',
            desc: 'Onboarding and replenishment sequences, in the order customers receive them',
          },
          {
            title: 'Templates',
            code: 'templates:read',
            desc: 'Email content — checked for usage guidance and price consistency',
          },
          {
            title: 'Metrics',
            code: 'metrics:read',
            desc: 'Send and engagement volumes for the Post-Purchase stage',
          },
        ],
        denyNote: 'ReXeR cannot send, schedule or edit any email or SMS.',
      },
      {
        kind: 'picker',
        title: 'Account',
        cta: 'Connect account',
        lead: 'Choose the Klaviyo account for this brand.',
        accountsKey: 'klAcct',
        accounts: [
          {
            bg: '#111827',
            initials: 'JB',
            name: 'JLO Beauty',
            sub: 'PK4xd9 · 2 flows · 5 campaigns',
          },
        ],
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Reading flows', '2 flows'],
          ['Reading templates', '11 emails'],
          ['Backfilling metrics', '90 days'],
        ],
        done: {
          stats: '2 flows · 5 campaigns · 11 templates',
          msg: 'The onboarding and replenishment emails are now audited for usage guidance and cadence.',
        },
      },
    ],
  },
  amazon: {
    provider: 'amazon',
    steps: [
      {
        kind: 'form',
        title: 'Listing',
        cta: 'Connect listing',
        lead: 'Point ReXeR at the public marketplace listing. The audit reads title, bullets, imagery and price — compared against the DTC page on every sync.',
        fields: [
          {
            label: 'Listing URL',
            value: 'https://www.amazon.com/dp/B0EXAMPLE01',
            help: 'The public product page (amazon.com/dp/…). No seller credentials needed.',
          },
        ],
        denyNote: 'ReXeR cannot edit listings, prices or orders.',
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Fetching listing', '1 page'],
          ['Extracting title, bullets & price', 'vs DTC page'],
        ],
        done: {
          stats: '1 listing tracked · re-crawled daily',
          msg: 'The marketplace listing is now audited against the DTC page.',
        },
      },
    ],
  },
  retail_feed: {
    provider: 'retail_feed',
    steps: [
      {
        kind: 'form',
        title: 'Feed',
        cta: 'Validate feed',
        lead: 'Retail partners share catalog data as a feed. ReXeR pulls it on a schedule and compares each listing against your DTC content.',
        fields: [
          {
            label: 'Feed URL',
            value: 'sftp://feeds.retailpartner.com/jlo/catalog.xml',
            help: 'SFTP, HTTPS and Google Sheets feeds are supported.',
          },
          {
            label: 'Pull schedule',
            value: 'Daily · 06:00 America/New_York',
            help: 'How often the feed is re-read. Listings are re-audited after every pull.',
          },
        ],
      },
      {
        kind: 'form',
        title: 'Mapping',
        cta: 'Confirm mapping',
        lead: 'Tell ReXeR which feed column carries each meaning. The defaults match the columns detected in the last pull.',
        fields: [
          {
            label: 'SKU column',
            value: 'sku',
            help: 'Matched against the products in your catalog.',
          },
          {
            label: 'Price column',
            value: 'retail_price',
            help: 'Compared against the DTC price at every pull.',
          },
          {
            label: 'Name column',
            value: 'display_name',
            help: 'Checked for the naming drift already found on marketplaces.',
          },
          {
            label: 'Bullets column',
            value: 'bullets',
            help: 'Checked against How-To-Use on the product page.',
          },
        ],
      },
      {
        kind: 'sync',
        title: 'Sync',
        rows: [
          ['Fetching feed', '128 rows'],
          ['Validating rows', '128 ok'],
          ['Mapping to touchpoints', '2 products'],
        ],
        done: {
          stats: '128 rows validated · pulls daily 06:00',
          msg: 'Retail partner listings are now compared against DTC content after every pull.',
        },
      },
    ],
  },
};
