export type SettingsTabId =
  | 'general'
  | 'measurement'
  | 'privacy'
  | 'team'
  | 'data';

export type PrivacyTier = 'anonymous' | 'pseudonymous' | 'identified';

export type ProductDefaultStatus = 'draft' | 'active';

export type AccountType = 'brand' | 'company' | 'agency' | 'freelance';

export type MemberRole = 'owner' | 'manager' | 'editor' | 'viewer';

export type ConfidenceTierId = 'high' | 'directional' | 'low';

export type CapabilityId =
  | 'personalLib'
  | 'team'
  | 'multiBrand'
  | 'clientSpaces'
  | 'handoff'
  | 'orgBilling'
  | 'whiteLabel'
  | 'exchangeBuy'
  | 'automate';

export type SettingsGeneral = {
  orgName: string;
  orgPlan: string;
  accountName: string;
  accountEmail: string;
  accountTitle: string;
  accountType: AccountType;
  planTier: string;
  seats: number;
  since: string;
};

/** The Measurement Bible's dials — every verdict on every screen derives here. */
export type SettingsMeasurement = {
  highFloor: number;
  dirFloor: number;
  blkGapPts: number;
  scoreW: { order: number; blocks: number; signals: number };
  fitW: { obj: number; aud: number; ev: number };
};

export type SettingsPrivacy = {
  defPrivacy: PrivacyTier;
  maxPrivacy: PrivacyTier;
};

export type SettingsDefaults = {
  productStatus: ProductDefaultStatus;
};

export type SettingsMember = {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: MemberRole;
  lastActive: string;
  pending?: boolean;
};

export type SettingsData = {
  general: SettingsGeneral;
  measurement: SettingsMeasurement;
  privacy: SettingsPrivacy;
  defaults: SettingsDefaults;
  members: SettingsMember[];
};

/** A workspace the account holds — derived from the account type. */
export type SettingsSpace = {
  name: string;
  role: string;
  desc: string;
};

/** One flattened row of the fact table — the ground-truth export shape. */
export type SettingsFactRow = {
  campaign: string;
  campaignName: string;
  channel: string;
  subject: { kind: string; ref: string } | null;
  experience: string;
  origin: string;
  experienceName: string;
  sessions: number;
  engaged: number;
  explored: number;
  convinced: number;
  converted: number;
  leads: number;
  revenue: number;
  spend: number;
  controlCvr: number | null;
};

/** Which dial a refusal points at — drives inline error placement. */
export type SettingsField =
  | 'orgName'
  | 'highFloor'
  | 'dirFloor'
  | 'blkGapPts'
  | 'scoreW'
  | 'fitW'
  | 'defPrivacy'
  | 'members';

/** A refusal: never silently clamped, always said out loud. */
export type SettingsIssue = {
  field: SettingsField;
  messageKey: string;
  values?: Record<string, string | number>;
};
