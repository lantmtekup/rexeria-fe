import type {
  AccountType,
  CapabilityId,
  ConfidenceTierId,
  MemberRole,
  PrivacyTier,
  ProductDefaultStatus,
  SettingsMeasurement,
  SettingsTabId,
} from '@/lib/portal-v2/settings/types';

export const SETTINGS_TABS: {
  id: SettingsTabId;
  labelKey: string;
  descKey: string;
}[] = [
  { id: 'general', labelKey: 'tabGeneral', descKey: 'descGeneral' },
  {
    id: 'measurement',
    labelKey: 'tabMeasurement',
    descKey: 'descMeasurement',
  },
  { id: 'privacy', labelKey: 'tabPrivacy', descKey: 'descPrivacy' },
  { id: 'team', labelKey: 'tabTeam', descKey: 'descTeam' },
  { id: 'data', labelKey: 'tabData', descKey: 'descData' },
];

/* ── Privacy tiers ──────────────────────────────────────────────────────
   Ordered shallow → deep. The ceiling bars everything past its index. */

export const PRIV_ORDER: readonly PrivacyTier[] = [
  'anonymous',
  'pseudonymous',
  'identified',
];

export const PRIVACY: Record<PrivacyTier, { name: string; desc: string }> = {
  anonymous: { name: 'Anonymous', desc: 'No identifier stored' },
  pseudonymous: {
    name: 'Pseudonymous',
    desc: 'Tied to a hashed ID, never to a person',
  },
  identified: { name: 'Identified', desc: 'Requires consent · PII' },
};

/* ── Account archetypes ─────────────────────────────────────────────────
   The type is not a label; it is the key into the capability table. */

export const ACCOUNT_TYPES: Record<
  AccountType,
  { name: string; desc: string; scope: string }
> = {
  brand: {
    name: 'Brand owner',
    desc: 'One brand, yours end to end. The whole platform serves it.',
    scope: 'One brand · your team',
  },
  company: {
    name: 'Company',
    desc: 'A house of brands under one roof — shared assets, separate identities.',
    scope: 'Many brands · one owner',
  },
  agency: {
    name: 'Agency',
    desc: 'Campaigns for clients. Many brands, none of them yours — handoff matters.',
    scope: 'Client spaces · many teams',
  },
  freelance: {
    name: 'Freelancer',
    desc: 'You and your content. No org overhead, everything portable.',
    scope: 'Personal space · just you',
  },
};

export const CAPABILITIES: {
  id: CapabilityId;
  name: string;
  desc: string;
  types: readonly AccountType[];
}[] = [
  {
    id: 'personalLib',
    name: 'Personal library',
    desc: 'Your own templates, blocks, and media.',
    types: ['brand', 'company', 'agency', 'freelance'],
  },
  {
    id: 'team',
    name: 'Team seats & roles',
    desc: 'Invite people; owner, manager, editor, viewer.',
    types: ['brand', 'company', 'agency'],
  },
  {
    id: 'multiBrand',
    name: 'Multiple brand spaces',
    desc: 'Separate brand records, shared org assets.',
    types: ['company', 'agency'],
  },
  {
    id: 'clientSpaces',
    name: 'Client workspaces',
    desc: 'Each client walled off — their brand, their data.',
    types: ['agency'],
  },
  {
    id: 'handoff',
    name: 'Client handoff & approvals',
    desc: 'Send work for sign-off; clients see, not edit.',
    types: ['agency'],
  },
  {
    id: 'orgBilling',
    name: 'Organization billing',
    desc: 'One invoice across every brand space.',
    types: ['company', 'agency'],
  },
  {
    id: 'whiteLabel',
    name: 'White-label exports',
    desc: 'Ship the work without the ReXeR badge.',
    types: ['agency', 'freelance'],
  },
  {
    id: 'exchangeBuy',
    name: 'Exchange purchases',
    desc: 'Buy premium templates from the Exchange.',
    types: ['brand', 'company', 'agency'],
  },
  {
    id: 'automate',
    name: 'Automation',
    desc: 'Propagate a proven experience across a product class.',
    types: ['brand', 'company', 'agency'],
  },
];

/* ── Roles ──────────────────────────────────────────────────────────────
   The governance layer the plan asks for: Editor / Manager / Owner. */

export const MEMBER_ROLES: readonly MemberRole[] = [
  'owner',
  'manager',
  'editor',
  'viewer',
];

export const ROLES: Record<
  MemberRole,
  { name: string; desc: string; bg: string; fg: string }
> = {
  owner: {
    name: 'Owner',
    desc: 'Governance, billing, and every workspace. Only an owner may turn these dials.',
    bg: 'var(--pv2-electric-soft)',
    fg: 'var(--pv2-electric)',
  },
  manager: {
    name: 'Manager',
    desc: 'Campaigns, journeys, and deploys. Reads governance, cannot rewrite it.',
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
    fg: 'var(--pv2-violet)',
  },
  editor: {
    name: 'Editor',
    desc: 'Builds experiences and content. Publishes through a manager.',
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: 'var(--pv2-success)',
  },
  viewer: {
    name: 'Viewer',
    desc: 'Reads the work and the evidence. Changes nothing.',
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
  },
};

/* ── Confidence tiers ───────────────────────────────────────────────────
   The floors are governed, so the chip and the dial can never disagree. */

export const CONF_TIERS: Record<
  ConfidenceTierId,
  { name: string; bg: string; fg: string }
> = {
  high: {
    name: 'High confidence',
    bg: 'color-mix(in srgb, var(--pv2-success) 14%, transparent)',
    fg: 'var(--pv2-success)',
  },
  directional: {
    name: 'Directional',
    bg: 'color-mix(in srgb, var(--pv2-warning) 16%, transparent)',
    fg: 'var(--pv2-warning)',
  },
  low: {
    name: 'Too early',
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
  },
};

export const PRODUCT_DEFAULT_STATUS: Record<
  ProductDefaultStatus,
  { name: string; desc: string }
> = {
  draft: { name: 'Draft', desc: 'Visible to the team only' },
  active: { name: 'Active', desc: 'Ready to attach and serve' },
};

/* ── Governed guardrails ────────────────────────────────────────────────
   Ported from the prototype's setGov — the one door for governance writes. */

export const BLOCK_GAP_MIN = 1;
export const BLOCK_GAP_MAX = 40;
export const DIR_FLOOR_MIN = 100;
export const WEIGHT_SUM = 100;

export const SCORE_WEIGHT_KEYS: {
  key: keyof SettingsMeasurement['scoreW'];
  name: string;
}[] = [
  { key: 'order', name: 'Order' },
  { key: 'blocks', name: 'Blocks' },
  { key: 'signals', name: 'Signals' },
];

export const FIT_WEIGHT_KEYS: {
  key: keyof SettingsMeasurement['fitW'];
  name: string;
}[] = [
  { key: 'obj', name: 'Objective match' },
  { key: 'aud', name: 'Audience match' },
  { key: 'ev', name: 'Evidence' },
];
