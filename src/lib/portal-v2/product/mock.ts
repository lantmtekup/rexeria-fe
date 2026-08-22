import { PRODUCT_BRANDS } from '@/lib/portal-v2/product/constants';
import type {
  Product,
  ProductAsset,
  ProductCampaignLink,
  ProductExperienceLink,
} from '@/lib/portal-v2/product/types';

/**
 * Prototype mock — the Ilia Beauty catalogue from rexer-platform-v2.html :7155-7775.
 * `value` is materialised on every record (the prototype's normalizeProducts(),
 * :12810-12820) so nothing downstream needs an optional chain.
 */
const EMPTY_VALUE = () => ({
  features: [],
  benefits: [],
  competitors: [],
  claims: [],
  disclaimers: [],
});

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    handle: 'super-serum-skin-tint-spf-40',
    title: 'Super Serum Skin Tint SPF 40',
    body: 'A serum, a skin tint, and an SPF 40 in one step. Niacinamide and squalane under a mineral sunscreen that leaves no cast.',
    brand: 'Ilia Beauty',
    type: 'Complexion',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Face Makeup > Foundations',
    tags: ['bestseller', 'spf', 'clean', 'hero'],
    status: 'active',
    source: 'shopify',
    updated: '2 hours ago',
    cover: 'a1',
    grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
    channels: ['Online Store', 'ReXeR Experiences', 'Meta', 'Shop'],
    options: [
      {
        name: 'Shade',
        values: ['ST1 Rendezvous', 'ST3 Bom Bom', 'ST7 Matira', 'ST12 Dune'],
      },
    ],
    variants: [
      {
        sku: 'ILA-SST-ST1',
        opt1: 'ST1 Rendezvous',
        barcode: '818107021015',
        price: 52,
        compareAt: 0,
        cost: 14.2,
        qty: 412,
        policy: 'deny',
        grams: 30,
      },
      {
        sku: 'ILA-SST-ST3',
        opt1: 'ST3 Bom Bom',
        barcode: '818107021022',
        price: 52,
        compareAt: 0,
        cost: 14.2,
        qty: 38,
        policy: 'deny',
        grams: 30,
      },
      {
        sku: 'ILA-SST-ST7',
        opt1: 'ST7 Matira',
        barcode: '818107021039',
        price: 52,
        compareAt: 0,
        cost: 14.2,
        qty: 0,
        policy: 'continue',
        grams: 30,
      },
      {
        sku: 'ILA-SST-ST12',
        opt1: 'ST12 Dune',
        barcode: '818107021046',
        price: 52,
        compareAt: 0,
        cost: 14.2,
        qty: 186,
        policy: 'deny',
        grams: 30,
      },
    ],
    value: {
      features: [
        'SPF 40 mineral sunscreen, non-nano zinc',
        'Niacinamide 4% and squalane',
        'Buildable sheer-to-medium coverage',
        '30 shades matched to undertone, not depth',
      ],
      benefits: [
        'One step instead of three in the morning',
        'Skin looks better after wearing it, not worse',
        'No white cast, in any light',
        'You stop having to choose between skincare and colour',
      ],
      competitors: [
        {
          n: 'Traditional foundation',
          theirs: 'Coverage first. Skin pays for it.',
          ours: 'Treats while it covers — actives stay active all day.',
        },
        {
          n: 'Tinted moisturiser',
          theirs: 'Light, but no real protection.',
          ours: 'SPF 40 and clinical-grade actives, not a token dose.',
        },
      ],
      claims: [
        {
          t: 'SPF 40 broad spectrum',
          proof: '8-week clinical panel · clinical-claims.pdf',
          ok: true,
        },
        {
          t: 'Non-comedogenic',
          proof: 'Dermatologist-tested, 4-week wear study',
          ok: true,
        },
        {
          t: 'Suitable for sensitive skin',
          proof: 'Patch-tested, n=112',
          ok: true,
        },
        { t: 'Clinically proven to improve skin', proof: '', ok: false },
      ],
      disclaimers: [
        'SPF protection requires reapplication every two hours.',
        'Individual results vary. Not a treatment for any medical condition.',
      ],
    },
    seo: {
      title: 'Super Serum Skin Tint SPF 40 | Ilia',
      desc: 'Skincare-grade coverage with SPF 40. No cast, no compromise.',
    },
  },

  {
    id: 'p2',
    handle: 'liquid-powder-blush',
    title: 'Liquid Powder Blush',
    body: 'Goes on liquid, sets to a soft powder finish. Buildable, blendable, and it will not slide.',
    brand: 'Ilia Beauty',
    type: 'Cheek & Lip',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Face Makeup > Blushes',
    tags: ['blush', 'clean'],
    status: 'active',
    source: 'shopify',
    updated: 'yesterday',
    cover: 'a9',
    grad: 'linear-gradient(135deg,#E0629B,#F08FBC)',
    channels: ['Online Store', 'ReXeR Experiences', 'Meta'],
    options: [{ name: 'Shade', values: ['Cheeky', 'Embrace', 'Rosette'] }],
    variants: [
      {
        sku: 'ILA-LPB-CHK',
        opt1: 'Cheeky',
        barcode: '818107022012',
        price: 34,
        compareAt: 0,
        cost: 9.1,
        qty: 220,
        policy: 'deny',
        grams: 15,
      },
      {
        sku: 'ILA-LPB-EMB',
        opt1: 'Embrace',
        barcode: '818107022029',
        price: 34,
        compareAt: 0,
        cost: 9.1,
        qty: 97,
        policy: 'deny',
        grams: 15,
      },
      {
        sku: 'ILA-LPB-ROS',
        opt1: 'Rosette',
        barcode: '818107022036',
        price: 34,
        compareAt: 0,
        cost: 9.1,
        qty: 12,
        policy: 'deny',
        grams: 15,
      },
    ],
    value: {
      features: [
        'Weightless powder-to-cream',
        'Buildable in three layers',
        'Blends with fingers, no brush',
      ],
      benefits: [
        'Looks like a flush, not a stripe',
        'Impossible to overdo',
        'Travels in a pocket',
      ],
      competitors: [
        {
          n: 'Cream blush',
          theirs: 'Streaks on dry skin.',
          ours: 'Powder-to-cream slips, then sets.',
        },
      ],
      claims: [
        {
          t: 'Talc-free',
          proof: 'Full INCI published · ingredients.pdf',
          ok: true,
        },
        { t: 'Lasts 12 hours', proof: '', ok: false },
      ],
      disclaimers: ['Shade appears differently on different undertones.'],
    },
    seo: {
      title: 'Liquid Powder Blush | Ilia',
      desc: 'Liquid to powder. Buildable colour that stays put.',
    },
  },

  {
    id: 'p3',
    handle: 'limitless-lash-mascara',
    title: 'Limitless Lash Mascara',
    body: 'Lengthens without clumping. Beeswax and shea, no flaking through the day.',
    brand: 'Ilia Beauty',
    type: 'Eye',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Eye Makeup > Mascaras',
    tags: ['mascara', 'clean'],
    status: 'active',
    source: 'shopify',
    updated: '3 days ago',
    cover: null,
    grad: 'linear-gradient(135deg,#1E1930,#3D3950)',
    channels: ['Online Store', 'Meta'],
    options: [{ name: 'Colour', values: ['After Midnight', 'Black'] }],
    variants: [
      {
        sku: 'ILA-LLM-AM',
        opt1: 'After Midnight',
        barcode: '818107023019',
        price: 28,
        compareAt: 0,
        cost: 7.4,
        qty: 530,
        policy: 'deny',
        grams: 20,
      },
      {
        sku: 'ILA-LLM-BK',
        opt1: 'Black',
        barcode: '818107023026',
        price: 28,
        compareAt: 0,
        cost: 7.4,
        qty: 604,
        policy: 'deny',
        grams: 20,
      },
    ],
    value: EMPTY_VALUE(),
    seo: {
      title: 'Limitless Lash Mascara | Ilia',
      desc: 'Length without clumps. Clean formula.',
    },
  },

  {
    id: 'p4',
    handle: 'the-base-face-milk',
    title: 'The Base Face Milk',
    body: 'A lightweight moisturiser that doubles as a primer. Sits under everything.',
    brand: 'Ilia Skin',
    type: 'Skincare',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Skin Care > Facial Moisturizers',
    tags: ['skincare', 'primer'],
    status: 'active',
    source: 'csv',
    updated: '1 week ago',
    cover: null,
    grad: 'linear-gradient(135deg,#13B57F,#3ED2A0)',
    channels: ['Online Store', 'ReXeR Experiences'],
    options: [{ name: 'Size', values: ['50 ml'] }],
    variants: [
      {
        sku: 'ILA-BFM-50',
        opt1: '50 ml',
        barcode: '818107024016',
        price: 46,
        compareAt: 0,
        cost: 11.8,
        qty: 284,
        policy: 'deny',
        grams: 70,
      },
    ],
    value: {
      features: [
        'Ceramide and glycerin base',
        'Fragrance-free',
        'pH balanced to 5.5',
      ],
      benefits: [
        'Makeup sits better on top of it',
        'Nothing stings, ever',
        'One layer replaces a serum and a primer',
      ],
      competitors: [
        {
          n: 'Primer',
          theirs: 'Sits on the skin to fill it in.',
          ours: 'Goes into the skin and keeps working.',
        },
      ],
      claims: [
        { t: 'Fragrance-free', proof: 'Full INCI published', ok: true },
        { t: 'Suitable for eczema-prone skin', proof: '', ok: false },
      ],
      disclaimers: ['Patch test before first use if your skin is reactive.'],
    },
    seo: {
      title: 'The Base Face Milk | Ilia',
      desc: 'Moisturiser and primer in one step.',
    },
  },

  {
    id: 'p5',
    handle: 'balmy-tint-lip-conditioner',
    title: 'Balmy Tint Lip Conditioner',
    body: 'A tinted balm with tripeptide. Colour that treats.',
    brand: 'Ilia Beauty',
    type: 'Cheek & Lip',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Lip Makeup > Lip Balms',
    tags: ['lip', 'clean'],
    status: 'draft',
    source: 'shopify',
    updated: '4 days ago',
    cover: null,
    grad: 'linear-gradient(135deg,#E89A3C,#F2BE7C)',
    channels: [],
    options: [{ name: 'Shade', values: ['Faded', 'Runaway', 'Memoir'] }],
    variants: [
      {
        sku: 'ILA-BTL-FAD',
        opt1: 'Faded',
        barcode: '818107025013',
        price: 30,
        compareAt: 0,
        cost: 8.0,
        qty: 0,
        policy: 'deny',
        grams: 12,
      },
      {
        sku: 'ILA-BTL-RUN',
        opt1: 'Runaway',
        barcode: '818107025020',
        price: 30,
        compareAt: 0,
        cost: 8.0,
        qty: 0,
        policy: 'deny',
        grams: 12,
      },
      {
        sku: 'ILA-BTL-MEM',
        opt1: 'Memoir',
        barcode: '818107025037',
        price: 30,
        compareAt: 0,
        cost: 8.0,
        qty: 0,
        policy: 'deny',
        grams: 12,
      },
    ],
    value: EMPTY_VALUE(),
    seo: {
      title: 'Balmy Tint Lip Conditioner | Ilia',
      desc: 'Tinted balm with tripeptide.',
    },
  },

  {
    id: 'p6',
    handle: 'c-beyond-triple-serum',
    title: 'C Beyond Triple Serum',
    body: 'Vitamin C, ceramides, and hyaluronic acid. The one that does the work overnight.',
    brand: 'Ilia Beauty',
    type: 'Skincare',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Skin Care > Facial Serums',
    tags: ['skincare', 'vitamin-c', 'hero'],
    status: 'draft',
    source: 'manual',
    updated: 'just now',
    cover: null,
    grad: 'linear-gradient(135deg,#3B82D6,#6FA8E5)',
    channels: [],
    options: [{ name: 'Size', values: ['30 ml'] }],
    variants: [
      {
        sku: 'ILA-CBT-30',
        opt1: '30 ml',
        barcode: '818107026010',
        price: 88,
        compareAt: 98,
        cost: 22.5,
        qty: 64,
        policy: 'deny',
        grams: 60,
      },
    ],
    value: EMPTY_VALUE(),
    seo: {
      title: 'C Beyond Triple Serum | Ilia',
      desc: 'Vitamin C, ceramides, hyaluronic acid.',
    },
  },

  {
    id: 'p7',
    handle: 'skin-tint-cushion',
    title: 'Skin Tint Cushion',
    body: 'The Super Serum formula in a cushion. Tap-on coverage that refreshes over the day, mineral SPF built in.',
    brand: 'Ilia Beauty',
    type: 'Complexion',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Face Makeup > Foundations',
    tags: ['complexion', 'spf', 'clean'],
    status: 'active',
    source: 'shopify',
    updated: '1 day ago',
    cover: 'a3',
    grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
    channels: ['Online Store'],
    options: [{ name: 'Shade', values: ['ST1', 'ST5'] }],
    variants: [
      {
        sku: 'ILA-STC-1',
        opt1: 'ST1',
        barcode: '818107030011',
        price: 44,
        compareAt: 0,
        cost: 9.1,
        qty: 210,
        policy: 'deny',
        grams: 16,
      },
    ],
    value: {
      features: [
        'Refillable cushion compact',
        'Mineral SPF 30, non-nano zinc',
        'Buildable sheer coverage',
      ],
      benefits: [
        'Reapply protection without wrecking your makeup',
        'A one-tap touch-up that treats skin',
      ],
      competitors: [],
      claims: [
        {
          t: 'SPF 30 broad spectrum',
          proof: '8-week clinical panel · clinical-claims.pdf',
          ok: true,
        },
      ],
      disclaimers: [],
    },
    seo: {
      title: 'Skin Tint Cushion | Ilia',
      desc: 'Tap-on serum coverage with mineral SPF.',
    },
  },

  {
    id: 'p8',
    handle: 'weightless-serum-foundation',
    title: 'Weightless Serum Foundation',
    body: 'A serum that wears like a foundation. Medium coverage, second-skin finish, actives that keep working.',
    brand: 'Ilia Beauty',
    type: 'Complexion',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Makeup > Face Makeup > Foundations',
    tags: ['complexion', 'serum', 'new'],
    status: 'active',
    source: 'shopify',
    updated: '5 hours ago',
    cover: 'a1',
    grad: 'linear-gradient(135deg,#3B82D6,#6FA8E5)',
    channels: ['Online Store'],
    options: [{ name: 'Shade', values: ['SF2', 'SF8'] }],
    variants: [
      {
        sku: 'ILA-WSF-2',
        opt1: 'SF2',
        barcode: '818107031018',
        price: 46,
        compareAt: 0,
        cost: 9.6,
        qty: 0,
        policy: 'deny',
        grams: 30,
      },
    ],
    value: {
      features: ['Hyaluronic acid and peptides', 'Medium buildable coverage'],
      benefits: ['Coverage that treats instead of masking'],
      competitors: [],
      claims: [{ t: 'Improves skin over eight weeks', proof: '', ok: false }],
      disclaimers: [],
    },
    seo: {
      title: 'Weightless Serum Foundation | Ilia',
      desc: 'A serum that wears like a foundation.',
    },
  },

  {
    id: 'p9',
    handle: 'barrier-repair-serum',
    title: 'Barrier Repair Serum',
    body: 'Ceramides and squalane rebuild a stressed barrier overnight. Fragrance-free, for the most reactive skin.',
    brand: 'Ilia Beauty',
    type: 'Skincare',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Skin Care > Facial Serums',
    tags: ['skincare', 'barrier', 'clean'],
    status: 'active',
    source: 'shopify',
    updated: '2 days ago',
    cover: 'a6',
    grad: 'linear-gradient(135deg,#13B57F,#3ED2A0)',
    channels: ['Online Store'],
    options: [{ name: 'Size', values: ['30ml'] }],
    variants: [
      {
        sku: 'ILA-BRS-30',
        opt1: '30ml',
        barcode: '818107032015',
        price: 52,
        compareAt: 0,
        cost: 11.2,
        qty: 340,
        policy: 'deny',
        grams: 60,
      },
    ],
    value: {
      features: [
        'Ceramides NP, AP, EOP',
        'Squalane and cholesterol',
        'Fragrance-free',
      ],
      benefits: [
        'A calmer barrier by morning',
        'Stops the tight, stinging feeling',
      ],
      competitors: [],
      claims: [
        {
          t: 'Reduces redness in two weeks',
          proof: 'Consumer panel, n=98',
          ok: true,
        },
      ],
      disclaimers: [],
    },
    seo: {
      title: 'Barrier Repair Serum | Ilia',
      desc: 'Overnight ceramide barrier repair.',
    },
  },

  {
    id: 'p10',
    handle: 'bright-boost-vitamin-c-serum',
    title: 'Bright Boost Vitamin C Serum',
    body: 'A stabilised vitamin C that actually brightens, buffered so it never stings.',
    brand: 'Ilia Beauty',
    type: 'Skincare',
    category:
      'Health & Beauty > Personal Care > Cosmetics > Skin Care > Facial Serums',
    tags: ['skincare', 'brightening', 'new'],
    status: 'draft',
    source: 'shopify',
    updated: 'just now',
    cover: null,
    grad: 'linear-gradient(135deg,#E89A3C,#F2BE7C)',
    channels: [],
    options: [{ name: 'Size', values: ['30ml'] }],
    variants: [
      {
        sku: 'ILA-BBC-30',
        opt1: '30ml',
        barcode: '818107033012',
        price: 48,
        compareAt: 0,
        cost: 10.4,
        qty: 0,
        policy: 'deny',
        grams: 55,
      },
    ],
    value: EMPTY_VALUE(),
    seo: {
      title: 'Bright Boost Vitamin C Serum | Ilia',
      desc: 'Stabilised vitamin C brightening serum.',
    },
  },
];

/**
 * The assets the catalogue references (:6790-7115). A product's media is NOT a
 * field — it is every asset whose home is that product. `cover` is looked up by
 * id across the whole library, which is why a6 (homed to a campaign) is here.
 */
export const MOCK_PRODUCT_ASSETS: ProductAsset[] = [
  {
    id: 'a1',
    name: 'serum-hero-01.jpg',
    kind: 'IMG',
    grad: 'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
    home: { scope: 'product', ref: 'p1' },
  },
  {
    id: 'a2',
    name: 'serum-360.glb',
    kind: 'D3',
    grad: 'linear-gradient(135deg,#3B82D6,#6FA8E5)',
    home: { scope: 'product', ref: 'p1' },
  },
  {
    id: 'a3',
    name: 'texture-swatch.mp4',
    kind: 'VID',
    grad: 'linear-gradient(135deg,#E89A3C,#F2BE7C)',
    home: { scope: 'product', ref: 'p1' },
  },
  {
    id: 'a5',
    name: 'shade-chart.png',
    kind: 'IMG',
    grad: 'linear-gradient(135deg,#13B57F,#3ED2A0)',
    home: { scope: 'product', ref: 'p1' },
  },
  {
    id: 'a6',
    name: 'launch-key-art.psd',
    kind: 'IMG',
    grad: 'linear-gradient(135deg,#5334D6,#6C4CF1)',
    home: { scope: 'campaign', ref: 'm1' },
  },
  {
    id: 'a9',
    name: 'compact-ar.usdz',
    kind: 'D3',
    grad: 'linear-gradient(135deg,#2A66B0,#3B82D6)',
    home: { scope: 'product', ref: 'p2' },
  },
];

/**
 * Pre-derived rows for the modal's Campaigns tab, read off CAMPAIGNS[].items
 * (:9485-9700). Order follows the prototype's array order (m3 · m2 · m1 · m4).
 * The Campaigns module owns the real model — this is only what the tab renders.
 */
export const MOCK_PRODUCT_CAMPAIGN_LINKS: ProductCampaignLink[] = [
  {
    productId: 'p1',
    campaignId: 'm3',
    campaignName: 'Christmas 2026',
    campaignStatus: 'building',
    itemStatus: 'ready',
    expCount: 1,
  },
  {
    productId: 'p2',
    campaignId: 'm3',
    campaignName: 'Christmas 2026',
    campaignStatus: 'building',
    itemStatus: 'building',
    expCount: 1,
  },
  {
    productId: 'p4',
    campaignId: 'm3',
    campaignName: 'Christmas 2026',
    campaignStatus: 'building',
    itemStatus: 'todo',
    expCount: 0,
  },
  {
    productId: 'p1',
    campaignId: 'm2',
    campaignName: 'Spring Sale',
    campaignStatus: 'planning',
    itemStatus: 'building',
    expCount: 1,
  },
  {
    productId: 'p2',
    campaignId: 'm2',
    campaignName: 'Spring Sale',
    campaignStatus: 'planning',
    itemStatus: 'todo',
    expCount: 0,
  },
  {
    productId: 'p3',
    campaignId: 'm2',
    campaignName: 'Spring Sale',
    campaignStatus: 'planning',
    itemStatus: 'todo',
    expCount: 0,
  },
  {
    productId: 'p5',
    campaignId: 'm2',
    campaignName: 'Spring Sale',
    campaignStatus: 'planning',
    itemStatus: 'todo',
    expCount: 0,
  },
  {
    productId: 'p1',
    campaignId: 'm1',
    campaignName: 'Super Serum Launch',
    campaignStatus: 'live',
    itemStatus: 'live',
    expCount: 4,
  },
  {
    productId: 'p4',
    campaignId: 'm4',
    campaignName: 'Clean Beauty ’26',
    campaignStatus: 'done',
    itemStatus: 'live',
    expCount: 1,
  },
];

/**
 * Empty on purpose: in the prototype's boot data every experience is a source
 * experience (`template: true`, `subject: null`), so expsOf('product', id) returns nothing
 * for all ten products. Copies only exist once a campaign forks one.
 */
export const MOCK_PRODUCT_EXPERIENCE_LINKS: ProductExperienceLink[] = [];

export const cloneProducts = (products: Product[]): Product[] =>
  structuredClone(products);

export const cloneProduct = (product: Product): Product =>
  structuredClone(product);

/** BLANK_PRODUCT() (:19636-19657) — the same fields Shopify would send. */
export const blankProduct = (): Product => ({
  id: 'new',
  handle: '',
  title: '',
  body: '',
  brand: PRODUCT_BRANDS[0],
  type: '',
  category: '',
  tags: [],
  status: 'draft',
  source: 'manual',
  updated: 'not saved yet',
  cover: null,
  grad: 'linear-gradient(135deg,var(--pv2-violet),var(--pv2-hair))',
  channels: [],
  options: [{ name: 'Shade', values: [] }],
  variants: [
    {
      sku: '',
      opt1: '',
      barcode: '',
      price: 0,
      compareAt: 0,
      cost: 0,
      qty: 0,
      policy: 'deny',
      grams: 0,
    },
  ],
  value: EMPTY_VALUE(),
  seo: { title: '', desc: '' },
});
