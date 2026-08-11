import type { BrandData } from '@/lib/portal-v2/brand/types';

/** Prototype mock — Ilia Beauty profile from rexer-platform-v2.html */
export const MOCK_BRAND: BrandData = {
  identity: {
    name: 'Ilia Beauty',
    description:
      'Clean colour cosmetics built on skincare actives. Makeup that treats the skin it sits on, rather than sitting on top of it.',
    mission: 'Make colour good for skin — not just on it.',
    valueProp:
      'Skincare-grade actives, in a colour product you would wear anyway.',
    positioning: {
      category: 'Tinted skincare',
      against: 'Traditional full-coverage foundation',
      because: 'SPF 40 and serum actives in a single step',
    },
    categories: ['Complexion', 'Skincare', 'Suncare'],
    industry: 'beauty',
    differentiation: [
      'SPF 40 and clinical-grade actives in one step — nobody else does both at this level',
      'Every claim is backed by an eight-week panel',
      '4,182 reviews, filterable by skin type',
    ],
    tones: ['Direct', 'Warm', 'Minimal'],
  },
  essence: {
    functional: [
      'One step instead of three in the morning',
      'SPF 40 without the white cast',
      'Actives that keep working all day, not just on application',
    ],
    emotional: [
      'Confidence without concealment',
      'Relief from choosing between skin health and colour',
      'The quiet certainty of having got it right',
    ],
    social: [
      'Signals care, not vanity',
      'Belongs to the ingredient-literate',
      'The thing a friend asks you about',
    ],
    personality: ['Precise', 'Warm', 'Unfussy'],
    perception:
      'The brand that told the truth about what makeup does to skin — and then fixed it.',
  },
  audience: [
    {
      id: 'a1',
      n: 'Skin-first buyer',
      tier: 'Primary',
      behaves: '',
      stage: 'consideration',
      awareness: 'problem',
      motivations: [
        'Wants fewer products, not more',
        'Skin health is the point, not coverage',
        'Has been let down by makeup before',
      ],
      objections: [
        'Makeup has broken me out before',
        'Clean usually means it does not work',
        'I cannot tell if the SPF is real',
      ],
      action: 'lead',
      desired:
        'Take the shade quiz and give us an email so we can send the match.',
    },
    {
      id: 'a2',
      n: 'Switcher',
      tier: 'Secondary',
      behaves: '',
      stage: 'decision',
      awareness: 'solution',
      motivations: [
        'Already owns a foundation they half-like',
        'Will move for a better reason, not a discount',
        'Reads the ingredient list before the review',
      ],
      objections: [
        'Mine is fine — why change?',
        'Switching is a risk I do not need',
        'I have heard clean formulas break down by lunch',
      ],
      action: 'convert',
      desired: 'Compare it against what they already own, then buy the single.',
    },
    {
      id: 'a3',
      n: 'Repeat buyer',
      tier: 'Retention',
      behaves: '',
      stage: 'loyalty',
      awareness: 'most',
      motivations: [
        'Liked it. Has simply not reordered',
        'Wants the routine completed',
        'Responds to a reason, not a reminder',
      ],
      objections: [
        'I still have some left',
        'Do I really need the second product?',
      ],
      action: 'convert',
      desired: 'Buy the bundle instead of the single.',
    },
  ],
  visual: {
    logos: [
      {
        id: 'lg1',
        n: 'Primary lockup',
        use: 'Default. Use wherever there is room to breathe.',
        asset: 'a7',
      },
      {
        id: 'lg2',
        n: 'Monogram',
        use: 'Favicons, avatars, anywhere under 32px.',
        asset: null,
      },
      {
        id: 'lg3',
        n: 'Reversed',
        use: 'On photography and on any dark ground.',
        asset: null,
      },
    ],
    colors: [
      {
        id: 'cl1',
        n: 'Ink',
        hex: '#1A1A1A',
        role: 'Primary · type and rules',
      },
      {
        id: 'cl2',
        n: 'Bone',
        hex: '#F4F1EC',
        role: 'Ground · the default page',
      },
      {
        id: 'cl3',
        n: 'Clay',
        hex: '#C8785B',
        role: 'Accent · one per page, never two',
      },
      {
        id: 'cl4',
        n: 'Sage',
        hex: '#7E8F7C',
        role: 'Support · proof and evidence',
      },
    ],
    type: {
      display: 'Canela Deck',
      body: 'Suisse Int’l',
      weights: 'Display 400 only. Body 400 / 600.',
      scale: '1.25 minor third. Never more than three sizes on one screen.',
      files: [],
    },
    layout: [
      'One idea per block. If a block needs a subheading, it is two blocks.',
      'Full-bleed imagery, generous margins, no boxes inside boxes.',
      'The product is photographed on Bone, never on white.',
      'One accent colour per experience. A second accent means neither is an accent.',
    ],
    imagery: {
      direction:
        'Natural light, no gloss, no retouching of skin texture. Shot on Bone or on skin. If it looks like a stock photograph, it is wrong.',
      refs: [],
    },
  },
};

export const cloneBrand = (data: BrandData): BrandData => structuredClone(data);
