import { CAMPAIGN_DEFAULT_CURRENCY } from '@/lib/portal-v2/campaigns/constants';
import type {
  CampaignDraft,
  CampaignItem,
  CampaignWizard,
} from '@/lib/portal-v2/campaigns/types';

/**
 * The create wizard (prototype `cpFresh` / `cpcreate`, rexer-demo-v3.html
 * :30671).
 *
 * Four questions in the order a campaign is actually decided: what the moment
 * is, what it has to say, which route the shopper walks, and what is being sold.
 * Asking for the merchandise last is deliberate — the brief should not be
 * reverse-engineered from a product list.
 */

export const blankWizard = (owner: string): CampaignWizard => ({
  step: 1,
  type: null,
  name: '',
  owner,
  startDate: '',
  endDate: '',
  budget: '',
  channels: [],
  goal: null,
  objective: '',
  audience: '',
  message: '',
  offer: '',
  journeyId: null,
  skipJourney: false,
  subjects: [],
  topics: [],
});

export const WIZARD_LAST_STEP = 4;

/** What each step insists on before it lets go. */
export const stepBlocker = (
  wizard: CampaignWizard,
  step: number
): string | null => {
  if (step === 1) {
    if (!wizard.type) return 'errTypeRequired';
    if (!wizard.name.trim()) return 'errNameRequired';
    if (
      wizard.startDate &&
      wizard.endDate &&
      wizard.endDate < wizard.startDate
    ) {
      return 'errEndBeforeStart';
    }
    return null;
  }
  if (step === 2) {
    return wizard.objective.trim() ? null : 'errObjectiveRequired';
  }
  if (step === 3) {
    return wizard.journeyId || wizard.skipJourney ? null : 'errRouteRequired';
  }
  if (step === 4) {
    return wizard.subjects.length || wizard.topics.length
      ? null
      : 'errSubjectRequired';
  }
  return null;
};

export const canLeaveStep = (wizard: CampaignWizard, step: number): boolean =>
  stepBlocker(wizard, step) === null;

/** An always-on campaign has no end date to give, so the field is not offered. */
export const isAlwaysOn = (wizard: CampaignWizard): boolean =>
  wizard.type === 'always';

const budgetAmount = (raw: string): number | null => {
  const parsed = Number(raw.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/**
 * The work the wizard's answers imply: one subject per product, one per topic,
 * all of it unstarted and owned by whoever owns the campaign. Experiences are
 * not attached here — the route carries them down once the journey is forked.
 */
export const wizardItems = (wizard: CampaignWizard): CampaignItem[] => {
  const due = isAlwaysOn(wizard) ? null : wizard.endDate || null;

  const products: CampaignItem[] = wizard.subjects.map((productId, index) => ({
    id: `it${index + 1}`,
    kind: 'product',
    productId,
    expIds: [],
    status: 'todo',
    owner: wizard.owner,
    due,
    note: '',
  }));

  const topics: CampaignItem[] = wizard.topics.map((name, index) => ({
    id: `it${products.length + index + 1}`,
    kind: 'topic',
    name,
    expIds: [],
    status: 'todo',
    owner: wizard.owner,
    due,
    note: '',
  }));

  return [...products, ...topics];
};

export const wizardDraft = (wizard: CampaignWizard): CampaignDraft => ({
  name: wizard.name.trim(),
  type: wizard.type ?? 'launch',
  goal: wizard.goal,
  owner: wizard.owner,
  status: 'draft',
  channels: [...wizard.channels],
  budgetAmount: budgetAmount(wizard.budget),
  budgetCurrency: CAMPAIGN_DEFAULT_CURRENCY,
  startDate: wizard.startDate || null,
  endDate: isAlwaysOn(wizard) ? null : wizard.endDate || null,
  productId: wizard.subjects[0] ?? null,
  brief: {
    objective: wizard.objective.trim(),
    audience: wizard.audience.trim(),
    message: wizard.message.trim(),
    offer: wizard.offer.trim(),
  },
  items: wizardItems(wizard),
  /* Set after the blueprint is forked — the fork id is not knowable until then. */
  journeyId: null,
});
