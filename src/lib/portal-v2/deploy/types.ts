/**
 * Portal V2 — Deploy model.
 *
 * Ported from `plan-v2/rexer-platform-v2.html` (`deployView` ~L18441,
 * `DATA.channels` ~L7778, `HEALTH` ~L18289) against `plan-v2/index.html`
 * §`#mod-deploy`.
 *
 * DEPLOY IS OPERATIONAL, NOT ANALYTICAL. The numbers on this route are the
 * ones you check before you push something out, or the morning after you did:
 * is it serving, is it reporting, is anything broken. Funnels, attribution and
 * insight belong to the AI route — nothing here duplicates them.
 *
 * ONE PLACE STATE CHANGES. The plan is explicit: LIVE only happens through
 * Deploy. So a `Deployment` is not a status column on a campaign item — it is
 * the join of an experience, the campaign that owns it, and the channels it is
 * served on. Campaigns mark work `ready`; this route is what turns that into
 * `live`.
 *
 * P0 is mock. When `/v1/deployments` lands, `ops` becomes a measured join and
 * `mock.ts` is the only file that goes — the view types do not move.
 */

/** `DTABS` (~L18270) — three tabs, in the order a person actually works. */
export type DeployTabId = 'live' | 'ready' | 'channels';

/**
 * `HEALTH` (~L18289). Operational, not analytical: is the thing working, not
 * is it good. `quiet` is live-but-silent, which is a different failure from
 * `broken` (live with a failing tracking point).
 */
export type DeployHealth = 'ok' | 'stale' | 'quiet' | 'broken';

/** Where a deployment sits. There is no third state — it is out, or it waits. */
export type DeployStatus = 'live' | 'ready';

/** A campaign item is about a SKU or a topic that has none — `SUBJECT_KINDS`. */
export type DeploySubjectKind = 'product' | 'topic';

/** `CAMP_TYPES` (~L9401), carried so a live group reads like its campaign. */
export type DeployCampaignType =
  | 'launch'
  | 'seasonal'
  | 'sale'
  | 'always'
  | 'retention';

/**
 * A publishing surface — `DATA.channels`. `connected` is the only mutable
 * field: everything else describes the pipe, not its state.
 */
export type DeployChannel = {
  id: string;
  name: string;
  /** Two-character mark for the square badge. */
  abbr: string;
  connected: boolean;
  /** Studio token used as the badge fill. */
  tint: string;
  /** What the pipe is, in one sentence — shown on the card and in the modal. */
  body: string;
};

/**
 * 24 hours, not lifetime. Seeded from the deployment id in `mock.ts` so the
 * figures are identical on the server and after hydration.
 */
export type DeployOps = {
  sessions: number;
  /** Already formatted — `'3.4%'`. Percent maths does not belong in a cell. */
  cvr: string;
  /** Signed percent against the previous 24h. */
  trend: number;
  /** Failing tracking points. Any at all ⇒ `health: 'broken'`. */
  errors: number;
  health: DeployHealth;
  /** Experience-assisted, in whole dollars. */
  revenue: number;
};

/** The experience being served — the record, not the page. */
export type DeployExperience = {
  id: string;
  name: string;
  /** `DATA.expCats` id — microsite / showcase / curated / ads. */
  category: string;
  /** The record's own cover gradient, carried verbatim from the prototype. */
  grad: string;
};

/** The campaign that owns the work. Deploy never owns anything. */
export type DeployCampaign = {
  id: string;
  name: string;
  type: DeployCampaignType;
  owner: string;
  /** `YYYY-MM-DD`. */
  start: string;
  /** `YYYY-MM-DD`, or null for ongoing. */
  end: string | null;
};

/**
 * One experience, in one campaign, on a set of channels.
 *
 * `channels` means two things depending on `status`, and that is deliberate:
 * on a live row it is where the thing IS served; on a ready row it is the
 * selection that will be published — the prototype's `S.deploy.chan[item]`,
 * pulled onto the row so nothing has to be looked up by id.
 */
export type Deployment = {
  id: string;
  status: DeployStatus;
  experience: DeployExperience;
  campaign: DeployCampaign;
  subject: { name: string; kind: DeploySubjectKind };
  owner: string;
  /** `DeployChannel` ids. */
  channels: string[];
  /** `YYYY-MM-DD` — live rows only. */
  since: string | null;
  ops: DeployOps;
};

/** The board this route owns, whole. One object so a reset is one assignment. */
export type DeployBoard = {
  channels: DeployChannel[];
  deployments: Deployment[];
};

/** `deployTotals` (~L18397) — the roll-up across everything that is live. */
export type DeployTotals = {
  live: number;
  ready: number;
  sessions: number;
  revenue: number;
  issues: number;
  /** Distinct channels carrying at least one live deployment. */
  channels: number;
  /** Mean across everything live, formatted — `'—'` when nothing is out. */
  cvr: string;
};

/** One campaign's live rows, with the two figures its header states. */
export type DeployCampaignGroup = {
  campaign: DeployCampaign;
  rows: Deployment[];
  sessions: number;
  issues: number;
};

/** What one channel is carrying — the channel card footer and its modal. */
export type DeployChannelStats = {
  rows: Deployment[];
  sessions: number;
  issues: number;
  campaigns: number;
};
