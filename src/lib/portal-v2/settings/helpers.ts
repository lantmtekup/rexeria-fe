import {
  BLOCK_GAP_MAX,
  BLOCK_GAP_MIN,
  DIR_FLOOR_MIN,
  PRIVACY,
  PRIV_ORDER,
  WEIGHT_SUM,
} from '@/lib/portal-v2/settings/constants';
import {
  MOCK_FACT_ROWS,
  SETTINGS_DEFAULTS,
} from '@/lib/portal-v2/settings/mock';
import type {
  ConfidenceTierId,
  PrivacyTier,
  SettingsData,
  SettingsField,
  SettingsIssue,
  SettingsMeasurement,
} from '@/lib/portal-v2/settings/types';

/** Fixed locale — a runtime-locale number would drift between server and client. */
export const formatCount = (n: number): string => n.toLocaleString('en-US');

export const privacyIndex = (tier: PrivacyTier): number =>
  PRIV_ORDER.indexOf(tier);

export const privacyName = (tier: PrivacyTier): string => PRIVACY[tier].name;

export const sumWeights = (weights: Record<string, number>): number =>
  Object.values(weights).reduce((n, x) => n + Math.round(Number(x) || 0), 0);

/**
 * The one door for governance writes, ported from the prototype's `setGov`:
 * an invalid setting is refused out loud, never silently clamped.
 */
export const validateSettings = (data: SettingsData): SettingsIssue[] => {
  const issues: SettingsIssue[] = [];
  const { general, measurement, privacy, members } = data;

  if (!general.orgName.trim()) {
    issues.push({ field: 'orgName', messageKey: 'errOrgName' });
  }

  const high = Math.round(measurement.highFloor);
  const dir = Math.round(measurement.dirFloor);

  if (!Number.isFinite(high) || high <= dir) {
    issues.push({
      field: 'highFloor',
      messageKey: 'errHighFloor',
      values: { floor: formatCount(dir) },
    });
  }

  if (!Number.isFinite(dir) || dir < DIR_FLOOR_MIN || dir >= high) {
    issues.push({
      field: 'dirFloor',
      messageKey: 'errDirFloor',
      values: { min: formatCount(DIR_FLOOR_MIN), floor: formatCount(high) },
    });
  }

  const gap = Math.round(measurement.blkGapPts);
  if (!Number.isFinite(gap) || gap < BLOCK_GAP_MIN || gap > BLOCK_GAP_MAX) {
    issues.push({
      field: 'blkGapPts',
      messageKey: 'errBlkGap',
      values: { min: BLOCK_GAP_MIN, max: BLOCK_GAP_MAX },
    });
  }

  const scoreSum = sumWeights(measurement.scoreW);
  if (scoreSum !== WEIGHT_SUM) {
    issues.push({
      field: 'scoreW',
      messageKey: 'errWeights',
      values: { sum: scoreSum },
    });
  }

  const fitSum = sumWeights(measurement.fitW);
  if (fitSum !== WEIGHT_SUM) {
    issues.push({
      field: 'fitW',
      messageKey: 'errWeights',
      values: { sum: fitSum },
    });
  }

  if (privacyIndex(privacy.defPrivacy) > privacyIndex(privacy.maxPrivacy)) {
    issues.push({
      field: 'defPrivacy',
      messageKey: 'errDefPrivacy',
      values: { tier: privacyName(privacy.maxPrivacy) },
    });
  }

  if (!members.some(m => m.role === 'owner' && !m.pending)) {
    issues.push({ field: 'members', messageKey: 'errOwner' });
  }

  return issues;
};

export const issueFor = (
  issues: SettingsIssue[],
  field: SettingsField
): SettingsIssue | undefined => issues.find(i => i.field === field);

/** Trim the strings and round the dials — shape work only, never clamping. */
export const normalizeSettings = (data: SettingsData): SettingsData => ({
  ...data,
  general: {
    ...data.general,
    orgName: data.general.orgName.trim(),
    accountName: data.general.accountName.trim(),
    accountTitle: data.general.accountTitle.trim(),
  },
  measurement: {
    ...data.measurement,
    highFloor: Math.round(data.measurement.highFloor),
    dirFloor: Math.round(data.measurement.dirFloor),
    blkGapPts: Math.round(data.measurement.blkGapPts),
    scoreW: {
      order: Math.round(data.measurement.scoreW.order),
      blocks: Math.round(data.measurement.scoreW.blocks),
      signals: Math.round(data.measurement.scoreW.signals),
    },
    fitW: {
      obj: Math.round(data.measurement.fitW.obj),
      aud: Math.round(data.measurement.fitW.aud),
      ev: Math.round(data.measurement.fitW.ev),
    },
  },
  members: data.members.map(m => ({ ...m })),
});

/** Only the governed dials are restorable — the org's own name is not a default. */
export const isGovernanceDefault = (data: SettingsData): boolean =>
  JSON.stringify([data.measurement, data.privacy, data.defaults]) ===
  JSON.stringify([
    SETTINGS_DEFAULTS.measurement,
    SETTINGS_DEFAULTS.privacy,
    SETTINGS_DEFAULTS.defaults,
  ]);

export const restoreGovernanceDefaults = (
  data: SettingsData
): SettingsData => ({
  ...data,
  measurement: structuredClone(SETTINGS_DEFAULTS.measurement),
  privacy: structuredClone(SETTINGS_DEFAULTS.privacy),
  defaults: structuredClone(SETTINGS_DEFAULTS.defaults),
});

/**
 * The tier a body of evidence wears under the current floors. Recomputed live,
 * so moving a floor moves the chip on the same screen.
 */
export const confidenceTier = (
  sessions: number,
  hasControl: boolean,
  m: SettingsMeasurement
): ConfidenceTierId => {
  if (hasControl && sessions >= m.highFloor) return 'high';
  if (sessions >= m.dirFloor) return 'directional';
  return 'low';
};

/** The proof shown beside the floors — the widest-evidence row in the table. */
export const proofRow = () =>
  MOCK_FACT_ROWS.reduce(
    (best, row) => (row.sessions > best.sessions ? row : best),
    MOCK_FACT_ROWS[0]!
  );

export const totalSessions = (): number =>
  MOCK_FACT_ROWS.reduce((n, r) => n + r.sessions, 0);
