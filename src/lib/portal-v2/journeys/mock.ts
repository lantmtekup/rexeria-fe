/**
 * Portal V2 — Journey Builder seed.
 *
 * The four records of `DATA.journeys` (~L6383), node for node: two blueprints
 * that belong to nobody, and the two campaign copies forked from them. The
 * copy ids are the prototype's own deterministic `j-{origin}-{campaign}`.
 *
 * Numbers live only on the copies. A blueprint has never run — it has no
 * numbers, and that is not the same as zero.
 *
 * NO SEEDED EXPERIENCE LINKS. Experience nodes ship unlinked, on purpose: the
 * library is real pages from `GET /pages`, and an invented `x: 'e2'` points at
 * a page that does not exist — a link that renders a name, fails preview, and
 * lies to the readiness score. The planner links a real page through the
 * picker; until then the node says so, in the error colour, which is exactly
 * what the "every experience node links an experience" check is for.
 *
 * A blueprint's figures roll up from its copies BY LINK ID (`resolveNodeStats`),
 * so with nothing linked the blueprints carry no numbers either. The copies keep
 * their own `stats` — what a campaign measured is not the link's to erase.
 */

import type { Journey } from '@/lib/portal-v2/journeys/types';

export const MOCK_JOURNEYS: Journey[] = [
  {
    id: 'j1',
    name: 'Product Launch Journey',
    template: true,
    campaign: null,
    campaignName: null,
    origin: null,
    obj: 'insight',
    personaId: null,
    updated: '2 hours ago',
    tagline: 'The whole launch, not one page of it.',
    summary:
      'Tease, reveal, inspect, convert — the shopper (and their profile) hand from one page to the next, so the last page already knows what the first one learned.',
    nodes: [
      {
        id: 'n1',
        kind: 'entry',
        name: 'Paid social',
        d: 'Launch-day click from the reveal creative.',
        src: 'paid',
        via: 'Meta · TikTok',
        to: ['n2'],
      },
      {
        id: 'n2',
        kind: 'experience',
        name: 'Reveal',
        d: 'Full-bleed launch moment. One idea, no price.',
        x: 'e2',
        to: ['n3'],
      },
      {
        id: 'n3',
        kind: 'experience',
        name: 'Inspect',
        d: 'Spin it, zoom it, compare finishes.',
        x: 'e6',
        to: ['n4'],
      },
      {
        id: 'n4',
        kind: 'decision',
        name: 'Ready to buy?',
        d: 'High-intent shoppers skip the education.',
        to: ['n5', 'n6'],
      },
      {
        id: 'n5',
        kind: 'experience',
        name: 'Explain & prove',
        d: 'Ingredients and clinicals, for the undecided.',
        x: 'e8',
        to: ['n6'],
      },
      {
        id: 'n6',
        kind: 'action',
        name: 'Save the profile',
        d: 'What the journey learned becomes a first-party record.',
        via: 'CRM sync',
        to: ['n7'],
      },
      {
        id: 'n7',
        kind: 'outcome',
        name: 'Purchase',
        d: 'Checkout, carrying the profile the journey built.',
        via: 'Shopify checkout',
        to: [],
      },
    ],
  },

  {
    id: 'j2',
    name: 'Gift Season Journey',
    template: true,
    campaign: null,
    campaignName: null,
    origin: null,
    obj: 'convert',
    personaId: null,
    updated: '3 days ago',
    tagline: 'For the shopper buying for someone who is not them.',
    summary:
      'A gift buyer knows nothing about the product and everything about the person. The journey asks about the recipient — and re-reads itself around the answer.',
    nodes: [
      {
        id: 'n1',
        kind: 'entry',
        name: 'Retail QR & email',
        d: 'The shelf QR and the holiday send land here.',
        src: 'qr',
        via: 'Retail QR · Email',
        to: ['n2'],
      },
      {
        id: 'n2',
        kind: 'experience',
        name: 'Who is it for?',
        d: 'The only question a gift buyer can actually answer.',
        x: 'e1',
        to: ['n3'],
      },
      {
        id: 'n3',
        kind: 'decision',
        name: 'Recipient known?',
        d: 'Splits on whether the profile was filled in.',
        to: ['n4', 'n5'],
      },
      {
        id: 'n4',
        kind: 'experience',
        name: 'The edit, for them',
        d: 'Three picks, chosen from the answer.',
        x: 'e3',
        to: ['n6'],
      },
      {
        /* The one untracked link in the library. It is why this blueprint —
           and every copy of it — reads 90% ready instead of 100%. */
        id: 'n5',
        kind: 'experience',
        name: 'The safe edit',
        d: 'Bestsellers with easy returns, for the unsure.',
        x: 'e4',
        to: ['n6'],
      },
      {
        id: 'n6',
        kind: 'action',
        name: 'Gift note & date',
        d: 'Recipient details become a delivery promise.',
        via: 'OMS delivery promise',
        to: ['n7'],
      },
      {
        id: 'n7',
        kind: 'outcome',
        name: 'Gift purchase',
        d: 'Wrapped, dated, one tap.',
        via: 'Shopify checkout',
        to: [],
      },
    ],
  },

  /* THE COPY — Product Launch, forked for the live Super Serum campaign. The
     whole point of its decision node is that ready buyers skip the education,
     and every stage has run, so Simulate tells the full story. */
  {
    id: 'j-j1-m1',
    name: 'Product Launch Journey',
    template: false,
    campaign: 'm1',
    campaignName: 'Super Serum Launch',
    origin: 'j1',
    obj: 'insight',
    personaId: null,
    updated: '2 hours ago',
    tagline: 'The whole launch, not one page of it.',
    summary:
      'The Product Launch blueprint, forked for Super Serum. Cold traffic lands in the reveal; the ready skip straight past the education; everyone leaves as a saved profile.',
    nodes: [
      {
        id: 'n1',
        kind: 'entry',
        name: 'Paid social',
        d: 'Launch-day click from the reveal creative.',
        src: 'paid',
        via: 'Meta · TikTok',
        to: ['n2'],
      },
      {
        id: 'n2',
        kind: 'experience',
        name: 'Reveal',
        d: 'Full-bleed launch moment. One idea, no price.',
        x: 'e2',
        stats: { sessions: 12400, lift: 0.31 },
        to: ['n3'],
      },
      {
        id: 'n3',
        kind: 'experience',
        name: 'Inspect',
        d: 'Spin it, zoom it, compare finishes.',
        x: 'e6',
        stats: { sessions: 7800, lift: 0.22 },
        to: ['n4'],
      },
      {
        id: 'n4',
        kind: 'decision',
        name: 'Ready to buy?',
        d: 'High-intent shoppers skip the education.',
        to: ['n5', 'n6'],
      },
      {
        id: 'n5',
        kind: 'experience',
        name: 'Explain & prove',
        d: 'Ingredients and clinicals, for the undecided.',
        x: 'e8',
        stats: { sessions: 3100, lift: 0.14 },
        to: ['n6'],
      },
      {
        id: 'n6',
        kind: 'action',
        name: 'Save the profile',
        d: 'What the journey learned becomes a first-party record.',
        via: 'CRM sync',
        to: ['n7'],
      },
      {
        id: 'n7',
        kind: 'outcome',
        name: 'Purchase',
        d: 'Checkout, carrying the profile the journey built.',
        via: 'Shopify checkout',
        to: [],
      },
    ],
  },

  /* THE COPY — Gift Season, forked for Christmas 2026. Its two edits are
     siblings on one column, so the arriving flow SPLITS between them: two
     branches cannot both claim the whole river. */
  {
    id: 'j-j2-m3',
    name: 'Gift Season Journey',
    template: false,
    campaign: 'm3',
    campaignName: 'Christmas 2026',
    origin: 'j2',
    obj: 'convert',
    personaId: null,
    updated: 'yesterday',
    tagline: 'For the shopper buying for someone who is not them.',
    summary:
      'The Gift Season blueprint, forked for Christmas 2026. Edits here never touch the blueprint; numbers here are this campaign’s own.',
    nodes: [
      {
        id: 'n1',
        kind: 'entry',
        name: 'Retail QR & email',
        d: 'The shelf QR and the holiday send land here.',
        src: 'qr',
        via: 'Retail QR · Email',
        to: ['n2'],
      },
      {
        id: 'n2',
        kind: 'experience',
        name: 'Who is it for?',
        d: 'The only question a gift buyer can actually answer.',
        x: 'e1',
        stats: { sessions: 9600, lift: 0.11 },
        to: ['n3'],
      },
      {
        id: 'n3',
        kind: 'decision',
        name: 'Recipient known?',
        d: 'Splits on whether the profile was filled in.',
        to: ['n4', 'n5'],
      },
      {
        id: 'n4',
        kind: 'experience',
        name: 'The edit, for them',
        d: 'Three picks, chosen from the answer.',
        x: 'e3',
        stats: { sessions: 4100, lift: 0.19 },
        to: ['n6'],
      },
      {
        id: 'n5',
        kind: 'experience',
        name: 'The safe edit',
        d: 'Bestsellers with easy returns, for the unsure.',
        x: 'e4',
        stats: { sessions: 2600, lift: -0.06 },
        to: ['n6'],
      },
      {
        id: 'n6',
        kind: 'action',
        name: 'Gift note & date',
        d: 'Recipient details become a delivery promise.',
        via: 'OMS delivery promise',
        to: ['n7'],
      },
      {
        id: 'n7',
        kind: 'outcome',
        name: 'Gift purchase',
        d: 'Wrapped, dated, one tap.',
        via: 'Shopify checkout',
        to: [],
      },
    ],
  },
];

export const cloneJourneys = (list: Journey[]): Journey[] =>
  structuredClone(list);
