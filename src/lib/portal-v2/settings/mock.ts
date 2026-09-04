/**
 * Portal V2 — Settings mock (P0).
 *
 * Settings does not store preferences; it governs the constitution. Every
 * value below is a constant from the prototype's Measurement Bible registry
 * (`GOV_DEFAULTS`), the account record, and the org — kept byte-identical so
 * the numbers here agree with every other module's mock.
 */

import type {
  AccountType,
  SettingsData,
  SettingsFactRow,
  SettingsSpace,
} from '@/lib/portal-v2/settings/types';

/** The Bible's defaults — what "Restore defaults" restores. */
export const SETTINGS_DEFAULTS: SettingsData = {
  general: {
    orgName: 'Ilia Beauty',
    orgPlan: 'Growth',
    accountName: 'Toan Nguyen',
    accountEmail: 'toan@iliabeauty.com',
    accountTitle: 'Founder',
    accountType: 'brand',
    planTier: 'Pro',
    seats: 4,
    since: 'March 2026',
  },
  measurement: {
    gaMeasurementId: '',
    highFloor: 5000,
    dirFloor: 1000,
    blkGapPts: 10,
    scoreW: { order: 40, blocks: 40, signals: 20 },
    fitW: { obj: 40, aud: 30, ev: 30 },
  },
  privacy: {
    defPrivacy: 'pseudonymous',
    maxPrivacy: 'identified',
  },
  defaults: {
    productStatus: 'draft',
  },
  members: [
    {
      id: 'u1',
      name: 'Toan Nguyen',
      initials: 'TN',
      email: 'toan@iliabeauty.com',
      role: 'owner',
      lastActive: 'now',
    },
    {
      id: 'u2',
      name: 'Maya Okonjo',
      initials: 'MO',
      email: 'maya@iliabeauty.com',
      role: 'manager',
      lastActive: '2 hours ago',
    },
    {
      id: 'u3',
      name: 'Linh Tran',
      initials: 'LT',
      email: 'linh@iliabeauty.com',
      role: 'editor',
      lastActive: 'yesterday',
    },
    {
      id: 'u4',
      name: 'Diego Salcedo',
      initials: 'DS',
      email: 'diego@iliabeauty.com',
      role: 'viewer',
      lastActive: '4 days ago',
      pending: true,
    },
  ],
};

/** The workspace as it stands today — the seed the module opens on. */
export const MOCK_SETTINGS: SettingsData = SETTINGS_DEFAULTS;

export const cloneSettings = (data: SettingsData): SettingsData =>
  structuredClone(data);

/**
 * The spaces an account type would hold. The `brand` space is the platform's
 * own org, so the profile and the workspaces name the same world.
 */
export const spacesFor = (
  type: AccountType,
  orgName: string
): SettingsSpace[] => {
  const mine = orgName || 'Your brand';

  if (type === 'company') {
    return [
      {
        name: mine,
        role: 'Owner',
        desc: 'The flagship — this workspace’s data lives here.',
      },
      {
        name: 'Aere Skincare',
        role: 'Owner',
        desc: 'Sister brand · shares the asset library.',
      },
      {
        name: 'Halo Haircare',
        role: 'Owner',
        desc: 'Sister brand · separate identity, same roof.',
      },
    ];
  }

  if (type === 'agency') {
    return [
      {
        name: mine,
        role: 'Lead',
        desc: 'Client space — this workspace’s data lives here.',
      },
      {
        name: 'Nordic Outdoor',
        role: 'Editor',
        desc: 'Client space · campaigns only.',
      },
      {
        name: 'Casa Verde Home',
        role: 'Reviewer',
        desc: 'Client space · read and approve.',
      },
    ];
  }

  if (type === 'freelance') {
    return [
      {
        name: 'Personal library',
        role: 'Just you',
        desc: 'Templates and content, portable anywhere.',
      },
    ];
  }

  return [
    {
      name: mine,
      role: 'Owner',
      desc: 'The whole platform serves this brand.',
    },
  ];
};

/**
 * The fact table, flattened — every number on every screen derives from these
 * rows. Brands own their evidence; the export carries no lock-in.
 */
export const MOCK_FACT_ROWS: SettingsFactRow[] = [
  {
    campaign: 'm1',
    campaignName: 'Super Serum Launch',
    channel: 'Meta',
    subject: { kind: 'product', ref: 'Super Serum Skin Tint SPF 40' },
    experience: 'e2-m1',
    origin: 'e2',
    experienceName: 'Super Serum 360°',
    sessions: 8420,
    engaged: 5310,
    explored: 3180,
    convinced: 1490,
    converted: 612,
    leads: 933,
    revenue: 38_640,
    spend: 9200,
    controlCvr: 0.052,
  },
  {
    campaign: 'm1',
    campaignName: 'Super Serum Launch',
    channel: 'Email',
    subject: { kind: 'product', ref: 'Super Serum Skin Tint SPF 40' },
    experience: 'e2-m1',
    origin: 'e2',
    experienceName: 'Super Serum 360°',
    sessions: 3140,
    engaged: 2260,
    explored: 1490,
    convinced: 880,
    converted: 402,
    leads: 511,
    revenue: 25_320,
    spend: 1100,
    controlCvr: 0.094,
  },
  {
    campaign: 'm1',
    campaignName: 'Super Serum Launch',
    channel: 'Google',
    subject: { kind: 'collection', ref: 'Complexion' },
    experience: 'e1-m1',
    origin: 'e1',
    experienceName: 'Shade Finder',
    sessions: 5260,
    engaged: 3980,
    explored: 2740,
    convinced: 1310,
    converted: 486,
    leads: 1204,
    revenue: 21_870,
    spend: 6400,
    controlCvr: 0.061,
  },
  {
    campaign: 'm2',
    campaignName: 'Spring Sale',
    channel: 'Meta',
    subject: { kind: 'collection', ref: 'Spring Edit' },
    experience: 'e5-m2',
    origin: 'e5',
    experienceName: 'Tint vs. Foundation',
    sessions: 4180,
    engaged: 2610,
    explored: 1520,
    convinced: 690,
    converted: 251,
    leads: 402,
    revenue: 12_940,
    spend: 5100,
    controlCvr: 0.048,
  },
  {
    campaign: 'm2',
    campaignName: 'Spring Sale',
    channel: 'TikTok',
    subject: { kind: 'product', ref: 'Lip Wrapper Balmplicity' },
    experience: 'e4-m2',
    origin: 'e4',
    experienceName: 'Which Finish Are You?',
    sessions: 2260,
    engaged: 1580,
    explored: 910,
    convinced: 344,
    converted: 118,
    leads: 286,
    revenue: 4820,
    spend: 2400,
    controlCvr: null,
  },
  {
    campaign: 'm3',
    campaignName: 'Christmas 2026',
    channel: 'Email',
    subject: { kind: 'collection', ref: 'Gift Sets' },
    experience: 'e3-m3',
    origin: 'e3',
    experienceName: 'Holiday Gift Edit',
    sessions: 6910,
    engaged: 4870,
    explored: 3260,
    convinced: 1780,
    converted: 812,
    leads: 1044,
    revenue: 52_180,
    spend: 3200,
    controlCvr: 0.088,
  },
  {
    campaign: 'm3',
    campaignName: 'Christmas 2026',
    channel: 'Retail QR',
    subject: { kind: 'collection', ref: 'Gift Sets' },
    experience: 'e3-m3',
    origin: 'e3',
    experienceName: 'Holiday Gift Edit',
    sessions: 1180,
    engaged: 820,
    explored: 540,
    convinced: 260,
    converted: 96,
    leads: 132,
    revenue: 6140,
    spend: 900,
    controlCvr: null,
  },
  {
    campaign: 'm4',
    campaignName: 'Clean Beauty 26',
    channel: 'Web microsite',
    subject: { kind: 'brand', ref: 'Ilia Beauty' },
    experience: 'e6-m4',
    origin: 'e6',
    experienceName: 'The Clean Edit',
    sessions: 2740,
    engaged: 2010,
    explored: 1380,
    convinced: 720,
    converted: 214,
    leads: 618,
    revenue: 9840,
    spend: 2100,
    controlCvr: 0.039,
  },
  {
    campaign: 'm5',
    campaignName: 'Back to Ritual',
    channel: 'Email',
    subject: { kind: 'product', ref: 'Morning Ritual Set' },
    experience: 'e7-m5',
    origin: 'e7',
    experienceName: 'Ingredient Deep Dive',
    sessions: 3820,
    engaged: 2640,
    explored: 1710,
    convinced: 902,
    converted: 341,
    leads: 566,
    revenue: 17_460,
    spend: 1400,
    controlCvr: 0.071,
  },
  {
    campaign: 'm5',
    campaignName: 'Back to Ritual',
    channel: 'Meta',
    subject: { kind: 'product', ref: 'Refill System' },
    experience: 'e8-m5',
    origin: 'e8',
    experienceName: 'Refill Calculator',
    sessions: 2360,
    engaged: 1490,
    explored: 880,
    convinced: 402,
    converted: 143,
    leads: 318,
    revenue: 5980,
    spend: 2600,
    controlCvr: 0.044,
  },
  {
    campaign: 'm6',
    campaignName: 'Fall Refresh Drop',
    channel: 'TikTok',
    subject: { kind: 'collection', ref: 'Fall Edit' },
    experience: 'e9-m6',
    origin: 'e9',
    experienceName: '360 Serum Reveal',
    sessions: 940,
    engaged: 610,
    explored: 380,
    convinced: 148,
    converted: 44,
    leads: 96,
    revenue: 1980,
    spend: 1200,
    controlCvr: null,
  },
];
