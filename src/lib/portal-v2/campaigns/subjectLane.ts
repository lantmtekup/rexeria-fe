import { subjectRef } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignExperience,
  CampaignItem,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey, JourneyNode } from '@/lib/portal-v2/journeys/types';

/**
 * How one subject fits a journey stage (prototype `stageFit`, :20731).
 *
 * Exact means the copy speaks this subject's words; edit/shared/open are the
 * three ways a stage can still block the shopper.
 */
export type StageFit = 'exact' | 'edit' | 'shared' | 'open';

/** i18n keys under `portalV2.journeys` — demo `stageFit().why` labels. */
export type StageFitLabelKey =
  | 'lensFitBuiltForTopic'
  | 'lensFitMatchesProduct'
  | 'lensFitGenericEdit'
  | 'lensFitWrongProduct'
  | 'lensFitSharedNotOwn'
  | 'lensFitNotCarried';

export type StageFitInfo = {
  ok: boolean;
  labelKey: StageFitLabelKey;
};

export type SubjectLaneCard = {
  node: JourneyNode;
  mine: CampaignExperience | null;
  other: CampaignExperience | null;
  fit: StageFit;
  /** Null for structural (non-experience) nodes. */
  label: StageFitInfo | null;
};

export type SubjectLane = {
  journey: Journey | null;
  cards: SubjectLaneCard[];
  off: CampaignExperience[];
};

/** One node's lens chrome on the journey canvas (demo `jedLensFor`). */
export type LensNodeOverlay = {
  state: 'experience' | 'context';
  fit: StageFit | null;
  ok: boolean;
  labelKey: StageFitLabelKey | null;
};

/** Product lens overlay on the journey editor (prototype `S.jed.lens`). */
export type CampaignSubjectLens = {
  subjectName: string;
  cardsByNodeId: Record<string, SubjectLaneCard>;
  overlaysByNodeId: Record<string, LensNodeOverlay>;
};

export const subjectLensFromLane = (
  subjectName: string,
  lane: SubjectLane
): CampaignSubjectLens => {
  const cardsByNodeId = Object.fromEntries(
    lane.cards.map(card => [card.node.id, card])
  );
  const overlaysByNodeId = Object.fromEntries(
    lane.cards.map(card => [card.node.id, lensOverlayForCard(card)])
  );
  return { subjectName, cardsByNodeId, overlaysByNodeId };
};

export const lensOverlayForCard = (card: SubjectLaneCard): LensNodeOverlay => {
  if (card.node.kind !== 'experience' || !card.node.x || !card.label) {
    return { state: 'context', fit: null, ok: false, labelKey: null };
  }
  return {
    state: 'experience',
    fit: card.fit,
    ok: card.label.ok,
    labelKey: card.label.labelKey,
  };
};

/** Parse `x-{origin}-{campaign}-{subject}` — the subject the copy is filed under. */
export const experienceSubjectRef = (
  exp: CampaignExperience
): string | null => {
  if (exp.template || !exp.campaign) return null;
  const parts = exp.id.split('-');
  if (parts[0] !== 'x' || parts.length < 4) return null;
  return parts.slice(3).join('-');
};

/**
 * Whether an experience stage is an exact match for this subject.
 * Mirrors demo `stageFit`: topics always match; products match only when adapted.
 */
export const stageFit = (
  item: CampaignItem,
  mine: CampaignExperience | null,
  other: CampaignExperience | null
): StageFit => {
  if (mine) {
    if (item.kind !== 'product') return 'exact';
    if (mine.adapted) return 'exact';
    return 'edit';
  }
  if (other) return 'shared';
  return 'open';
};

/**
 * The why-string behind a stage fit (demo `stageFit` return `{ ok, why }`).
 * Distinguishes generic masters from wrong-product masters when unadapted.
 */
export const stageFitLabel = (
  item: CampaignItem,
  mine: CampaignExperience | null,
  other: CampaignExperience | null,
  experiences: CampaignExperience[]
): StageFitInfo => {
  if (mine) {
    if (item.kind !== 'product') {
      return { ok: true, labelKey: 'lensFitBuiltForTopic' };
    }
    if (mine.adapted) {
      return { ok: true, labelKey: 'lensFitMatchesProduct' };
    }
    const master = mine.origin
      ? (experiences.find(e => e.id === mine.origin) ?? null)
      : null;
    return master?.productId
      ? { ok: false, labelKey: 'lensFitWrongProduct' }
      : { ok: false, labelKey: 'lensFitGenericEdit' };
  }
  if (other) return { ok: false, labelKey: 'lensFitSharedNotOwn' };
  return { ok: false, labelKey: 'lensFitNotCarried' };
};

/** Whether stageFit counts as an exact match (for subline tallies). */
export const stageFitExact = (fit: StageFit): boolean => fit === 'exact';

/**
 * The campaign route as one subject travels it (prototype `subjectLane`, :20809).
 *
 * Each journey node becomes a card; experience nodes resolve to this subject's
 * copy, a shared copy from another subject, or open. Bindings outside the route
 * are listed as off-journey.
 */
export const subjectLane = (
  campaign: CampaignView,
  item: CampaignItem,
  journeys: Journey[],
  experiences: CampaignExperience[]
): SubjectLane => {
  const ref = subjectRef(item);
  const routeX = new Set<string>();

  const fork =
    journeys.find(j => !j.template && j.campaign === campaign.id) ?? null;

  if (!fork) {
    return { journey: null, cards: [], off: [] };
  }

  const cards: SubjectLaneCard[] = fork.nodes.map(node => {
    if (node.kind !== 'experience' || !node.x) {
      return { node, mine: null, other: null, fit: 'open', label: null };
    }

    routeX.add(node.x);
    const forks = experiences.filter(
      e => !e.template && e.campaign === campaign.id && e.origin === node.x
    );
    const mine = forks.find(e => experienceSubjectRef(e) === ref) ?? null;
    const other = mine ? null : (forks[0] ?? null);

    return {
      node,
      mine,
      other,
      fit: stageFit(item, mine, other),
      label: stageFitLabel(item, mine, other, experiences),
    };
  });

  const attached = item.expIds
    .map(id => experiences.find(e => e.id === id))
    .filter((e): e is CampaignExperience => Boolean(e));

  const off = attached.filter(e => e.origin && !routeX.has(e.origin));

  return { journey: fork, cards, off };
};
