import { ITEM_STATUS, TRUST_FLOOR } from '@/lib/portal-v2/campaigns/constants';
import { deriveStage } from '@/lib/portal-v2/campaigns/helpers';
import { campReadiness } from '@/lib/portal-v2/campaigns/readiness';
import { itemShipGate } from '@/lib/portal-v2/campaigns/shipGate';
import type {
  CampaignExperience,
  CampaignHealth,
  CampaignVerdict,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { MOCK_FACT_ROWS } from '@/lib/portal-v2/settings/mock';
import type { SettingsFactRow } from '@/lib/portal-v2/settings/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

/**
 * What the numbers say.
 *
 * Every figure on the Run and Learn phases derives from the fact table — one row
 * per campaign × subject × experience × channel, the same rows Analytics and
 * Intelligence read. Nothing here is stored on the campaign: if the rows change,
 * the verdict changes, and the two can never disagree.
 */

/** A subject needs this much traffic before its lift means anything. */
const minVolume = (sessions: number): number => Math.max(200, sessions * 0.05);

const factsFor = (campaignId: string): SettingsFactRow[] =>
  MOCK_FACT_ROWS.filter(row => row.campaign === campaignId);

const sum = (rows: SettingsFactRow[], pick: (r: SettingsFactRow) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

/**
 * The control conversion rate, weighted by the traffic that measured it. Rows
 * with no control are excluded rather than counted as zero — an unmeasured row
 * has no opinion, and treating it as one would flatter every campaign.
 */
const controlCvr = (rows: SettingsFactRow[]): number | null => {
  const measured = rows.filter(row => row.controlCvr !== null);
  const sessions = sum(measured, r => r.sessions);
  if (!sessions) return null;
  return sum(measured, r => r.sessions * (r.controlCvr ?? 0)) / sessions;
};

const liftOf = (rows: SettingsFactRow[]): number => {
  const sessions = sum(rows, r => r.sessions);
  const control = controlCvr(rows);
  if (!sessions || !control) return 0;
  return sum(rows, r => r.converted) / sessions / control - 1;
};

/**
 * How much of this campaign's traffic ran through something we can actually
 * measure. Coverage lives on the experience, so the fact row's `origin` is
 * resolved back to the master it was forked from.
 */
const trustOf = (
  rows: SettingsFactRow[],
  experiences: CampaignExperience[]
): number => {
  const sessions = sum(rows, r => r.sessions);
  if (!sessions) return 0;
  const covered = sum(rows, row => {
    const found =
      experiences.find(e => e.id === row.experience) ??
      experiences.find(e => e.id === row.origin);
    return row.sessions * (found?.coverage ?? 0);
  });
  return covered / sessions;
};

const bySubject = (
  rows: SettingsFactRow[]
): { name: string; lift: number; sessions: number }[] => {
  const groups = new Map<string, SettingsFactRow[]>();
  for (const row of rows) {
    const name = row.subject?.ref ?? row.experienceName;
    groups.set(name, [...(groups.get(name) ?? []), row]);
  }
  return [...groups.entries()].map(([name, group]) => ({
    name,
    lift: liftOf(group),
    sessions: sum(group, r => r.sessions),
  }));
};

export const campVerdict = (
  campaign: CampaignView,
  experiences: CampaignExperience[]
): CampaignVerdict | null => {
  const rows = factsFor(campaign.id);
  if (!rows.length) return null;

  const sessions = sum(rows, r => r.sessions);
  const converted = sum(rows, r => r.converted);
  const revenue = sum(rows, r => r.revenue);
  const spend = sum(rows, r => r.spend);
  const floor = minVolume(sessions);

  const ranked = bySubject(rows)
    .filter(group => group.sessions >= floor)
    .sort((a, b) => b.lift - a.lift);

  return {
    sessions,
    converted,
    leads: sum(rows, r => r.leads),
    revenue,
    spend,
    cvr: sessions ? converted / sessions : 0,
    lift: liftOf(rows),
    roas: spend ? revenue / spend : 0,
    roi: spend ? (revenue - spend) / spend : 0,
    cac: converted ? spend / converted : 0,
    trust: trustOf(rows, experiences),
    best: ranked.length ? { name: ranked[0].name, lift: ranked[0].lift } : null,
    worst:
      ranked.length > 1
        ? {
            name: ranked[ranked.length - 1].name,
            lift: ranked[ranked.length - 1].lift,
          }
        : null,
  };
};

/**
 * The bar a campaign is measured against: what the whole network has already
 * proved is possible. Beating your own control is table stakes; beating this is
 * the thing worth promoting.
 */
export const earnedBar = (): number => liftOf(MOCK_FACT_ROWS);

/* ── health ─────────────────────────────────────────────────────────────── */

const pct = (ratio: number): number => Math.round(ratio * 100);

/**
 * The operating state, in priority order (prototype `campHealth`, :14545).
 *
 * At risk beats delayed beats valuable: a campaign that is behind AND winning is
 * still behind, and the person reading this card needs the problem first.
 */
export const campHealth = (
  campaign: CampaignView,
  experiences: CampaignExperience[],
  today: string,
  journeys: Journey[]
): CampaignHealth => {
  const stage = deriveStage(campaign);
  const verdict = campVerdict(campaign, experiences);
  const live = stage === 'live';
  const started = Boolean(campaign.startDate && campaign.startDate <= today);

  if (stage === 'done') {
    return {
      state: 'complete',
      whyKey: verdict ? 'whyCompleteRoi' : 'whyComplete',
      values: verdict ? { roi: pct(verdict.roi) } : undefined,
    };
  }

  if (verdict && (live || started) && verdict.lift < 0) {
    return {
      state: 'risk',
      whyKey: 'whyBelowControl',
      values: { lift: pct(Math.abs(verdict.lift)) },
    };
  }

  if (verdict && live && verdict.trust < TRUST_FLOOR) {
    return {
      state: 'risk',
      whyKey: 'whyUntrusted',
      values: { trust: pct(verdict.trust) },
    };
  }

  const blocked = campaign.items.filter(
    item =>
      item.due !== null &&
      item.due < today &&
      ITEM_STATUS[item.status].step < ITEM_STATUS.ready.step &&
      !itemShipGate(item, experiences).ok
  ).length;

  if (blocked) {
    return { state: 'risk', whyKey: 'whyBlocked', values: { count: blocked } };
  }

  if (started && !live) {
    return { state: 'delayed', whyKey: 'whyStartedNotLive' };
  }

  const late = campaign.items.filter(
    item =>
      item.due !== null &&
      item.due < today &&
      ITEM_STATUS[item.status].step < ITEM_STATUS.ready.step
  ).length;

  if (late) {
    return { state: 'delayed', whyKey: 'whyLate', values: { count: late } };
  }

  if (!live) {
    const readiness = campReadiness(campaign, experiences, journeys);
    if (readiness.score < 100) {
      return {
        state: 'delayed',
        whyKey: 'whyPlanIncomplete',
        values: { score: readiness.score },
      };
    }
  }

  if (
    verdict &&
    live &&
    verdict.lift >= earnedBar() &&
    verdict.roi > 0 &&
    verdict.sessions >= 1000
  ) {
    return {
      state: 'valuable',
      whyKey: 'whyValuable',
      values: { lift: pct(verdict.lift), roas: verdict.roas.toFixed(1) },
    };
  }

  return { state: 'healthy', whyKey: 'whyHealthy' };
};
