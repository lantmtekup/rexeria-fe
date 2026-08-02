/**
 * Portal V2 — Command Center mock (P0).
 *
 * Every date is generated *relative to a supplied `now`* instead of being
 * hard-coded. The first pass pinned dates in 2026-2027, so once the calendar
 * caught up nothing was ever overdue and the whole "what is late" half of the
 * module rendered empty. Building from an offset keeps every state the UI can
 * show — overdue, in review, blocked, launching next week — permanently
 * reachable.
 *
 * `now` is resolved on the server and passed down, so server and client agree
 * on which day it is and hydration stays stable.
 */

import { COMMAND_LINKS } from '@/lib/portal-v2/command/constants';
import { formatDate } from '@/lib/portal-v2/command/helpers';
import type { CommandSnapshot } from '@/lib/portal-v2/command/types';

const DAY_MS = 86_400_000;

/** `YYYY-MM-DD`, `days` away from the anchor. Negative reaches into the past. */
const shift = (anchor: number, days: number): string =>
  new Date(anchor + days * DAY_MS).toISOString().slice(0, 10);

export const buildCommandSnapshot = (nowIso: string): CommandSnapshot => {
  const now = new Date(nowIso).getTime();
  const at = (days: number) => shift(now, days);

  return {
    user: {
      name: 'Toan Nguyen',
      initials: 'TN',
      email: 'toan@iliabeauty.com',
      role: 'Owner',
    },
    org: {
      name: 'Ilia Beauty',
      plan: 'Growth',
    },
    team: [
      { name: 'Toan Nguyen', initials: 'TN', role: 'Owner' },
      { name: 'Maya Okonjo', initials: 'MO', role: 'Brand lead' },
      { name: 'Linh Tran', initials: 'LT', role: 'Experience producer' },
      { name: 'Diego Salcedo', initials: 'DS', role: 'Growth analyst' },
    ],
    campaigns: [
      {
        id: 'm5',
        name: 'Back to Ritual',
        type: 'always',
        status: 'building',
        start: at(-6),
        end: at(24),
        owner: 'Toan Nguyen',
        sessions: 6180,
        lift: 0.12,
        items: [
          {
            id: 'i11',
            subjectName: 'Morning Ritual Set',
            status: 'building',
            owner: 'Toan Nguyen',
            due: at(-3),
            expCount: 2,
          },
          {
            id: 'i12',
            subjectName: 'Ritual Builder Quiz',
            status: 'ready',
            owner: 'Linh Tran',
            due: at(2),
            expCount: 1,
          },
          {
            id: 'i13',
            subjectName: 'Skin Diary Editorial',
            status: 'review',
            owner: 'Maya Okonjo',
            due: at(4),
            expCount: 1,
          },
          {
            id: 'i14',
            subjectName: 'Refill Programme',
            status: 'todo',
            owner: 'Unassigned',
            due: at(7),
            expCount: 0,
          },
        ],
      },
      {
        id: 'm6',
        name: 'Fall Refresh Drop',
        type: 'launch',
        status: 'building',
        start: at(9),
        end: at(40),
        owner: 'Maya Okonjo',
        sessions: 0,
        lift: 0,
        items: [
          {
            id: 'i15',
            subjectName: 'Limitless Lash Mascara',
            status: 'building',
            owner: 'Maya Okonjo',
            due: at(-1),
            expCount: 1,
          },
          {
            id: 'i16',
            subjectName: 'True Skin Serum Foundation',
            status: 'ready',
            owner: 'Toan Nguyen',
            due: at(3),
            expCount: 2,
          },
          {
            id: 'i17',
            subjectName: 'Shade Match Guide',
            status: 'review',
            owner: 'Linh Tran',
            due: at(5),
            expCount: 1,
          },
          {
            id: 'i18',
            subjectName: 'Fall Palette Story',
            status: 'todo',
            owner: 'Unassigned',
            due: at(6),
            expCount: 0,
          },
        ],
      },
      {
        id: 'm1',
        name: 'Super Serum Launch',
        type: 'launch',
        status: 'live',
        start: at(-52),
        end: null,
        owner: 'Toan Nguyen',
        sessions: 28400,
        lift: 0.31,
        items: [
          {
            id: 'i9',
            subjectName: 'Super Serum SPF Bundle',
            status: 'live',
            owner: 'Toan Nguyen',
            due: null,
            expCount: 4,
          },
          {
            id: 'i10',
            subjectName: 'Shade Finder',
            status: 'live',
            owner: 'Linh Tran',
            due: null,
            expCount: 2,
          },
        ],
      },
      {
        id: 'm3',
        name: 'Christmas 2026',
        type: 'seasonal',
        status: 'planning',
        start: at(91),
        end: at(146),
        owner: 'Maya Okonjo',
        sessions: 0,
        lift: 0,
        items: [
          {
            id: 'i1',
            subjectName: 'The Gift Guide',
            status: 'building',
            owner: 'Maya Okonjo',
            due: at(62),
            expCount: 1,
          },
          {
            id: 'i2',
            subjectName: 'Multi-Stick Blush',
            status: 'todo',
            owner: 'Toan Nguyen',
            due: at(70),
            expCount: 0,
          },
          {
            id: 'i3',
            subjectName: 'Balmy Gloss Tint',
            status: 'todo',
            owner: 'Unassigned',
            due: at(74),
            expCount: 0,
          },
        ],
      },
      {
        id: 'm2',
        name: 'Spring Sale',
        type: 'sale',
        status: 'planning',
        start: at(213),
        end: at(227),
        owner: 'Toan Nguyen',
        sessions: 0,
        lift: 0,
        items: [
          {
            id: 'i5',
            subjectName: 'Super Serum SPF Bundle',
            status: 'todo',
            owner: 'Diego Salcedo',
            due: at(196),
            expCount: 0,
          },
          {
            id: 'i7',
            subjectName: 'True Skin Serum Foundation',
            status: 'todo',
            owner: 'Unassigned',
            due: at(200),
            expCount: 0,
          },
        ],
      },
      {
        id: 'm4',
        name: 'Clean Beauty 26',
        type: 'always',
        status: 'done',
        start: at(-206),
        end: at(-94),
        owner: 'Maya Okonjo',
        sessions: 15600,
        lift: 0.22,
        items: [
          {
            id: 'i19',
            subjectName: 'Ingredient Editorial',
            status: 'live',
            owner: 'Maya Okonjo',
            due: null,
            expCount: 1,
          },
        ],
      },
    ],
    liveExperiences: [
      {
        id: 'e2',
        name: '360 Serum Reveal',
        campaignName: 'Super Serum Launch',
        channels: 3,
        sessions24h: 9240,
        sessionsPrev24h: 8710,
        health: 'ok',
      },
      {
        id: 'e3',
        name: 'Shade Finder',
        campaignName: 'Super Serum Launch',
        channels: 2,
        sessions24h: 4130,
        sessionsPrev24h: 5480,
        health: 'stale',
      },
      {
        id: 'e5',
        name: 'Founder Proof Page',
        campaignName: 'Super Serum Launch',
        channels: 3,
        sessions24h: 2870,
        sessionsPrev24h: 2640,
        health: 'ok',
      },
      {
        id: 'e6',
        name: 'Morning Ritual Set',
        campaignName: 'Back to Ritual',
        channels: 2,
        sessions24h: 1490,
        sessionsPrev24h: 980,
        health: 'ok',
      },
      {
        id: 'e4',
        name: 'Ingredient Deep Dive',
        campaignName: 'Clean Beauty 26',
        channels: 2,
        sessions24h: 610,
        sessionsPrev24h: 705,
        health: 'quiet',
      },
      {
        id: 'e7',
        name: 'Refill Calculator',
        campaignName: 'Back to Ritual',
        channels: 1,
        sessions24h: 0,
        sessionsPrev24h: 340,
        health: 'broken',
      },
    ],
    blockers: [
      {
        id: 'b1',
        reason: 'media-expired',
        experienceName: 'Ritual Builder Quiz',
        campaignName: 'Back to Ritual',
        detail: `Hero film licence ran out on ${formatDate(at(-2))}`,
        owner: 'Linh Tran',
        waitingDays: 2,
        href: COMMAND_LINKS.media,
        fixLabelKey: 'fixInMedia',
      },
      {
        id: 'b2',
        reason: 'missing-channel',
        experienceName: 'True Skin Serum Foundation',
        campaignName: 'Fall Refresh Drop',
        detail: 'Built and approved, but no channel is attached to it',
        owner: 'Toan Nguyen',
        waitingDays: 4,
        href: COMMAND_LINKS.deploy,
        fixLabelKey: 'fixInDeploy',
      },
      {
        id: 'b3',
        reason: 'brand-approval',
        experienceName: 'Skin Diary Editorial',
        campaignName: 'Back to Ritual',
        detail: 'Claims copy still needs brand sign-off before it can ship',
        owner: 'Maya Okonjo',
        waitingDays: 6,
        href: COMMAND_LINKS.brand,
        fixLabelKey: 'fixInBrand',
      },
      {
        id: 'b4',
        reason: 'no-owner',
        experienceName: 'Refill Calculator',
        campaignName: 'Back to Ritual',
        detail: 'Live and broken since Linh handed the campaign over',
        owner: null,
        waitingDays: 9,
        href: COMMAND_LINKS.campaigns,
        fixLabelKey: 'fixInCampaigns',
      },
    ],
    reviews: [
      {
        id: 'r1',
        experienceName: 'Ritual Refill Explainer',
        campaignName: 'Back to Ritual',
        requestedBy: 'Maya Okonjo',
        reviewer: 'Toan Nguyen',
        waitingDays: 3,
        href: COMMAND_LINKS.campaigns,
      },
      {
        id: 'r2',
        experienceName: 'Shade Match Guide',
        campaignName: 'Fall Refresh Drop',
        requestedBy: 'Linh Tran',
        reviewer: 'Toan Nguyen',
        waitingDays: 1,
        href: COMMAND_LINKS.campaigns,
      },
      {
        id: 'r3',
        experienceName: 'Gift Guide Landing',
        campaignName: 'Christmas 2026',
        requestedBy: 'Maya Okonjo',
        reviewer: 'Diego Salcedo',
        waitingDays: 5,
        href: COMMAND_LINKS.campaigns,
      },
    ],
    journeys: [
      {
        id: 'j1',
        name: 'Serum discovery to first order',
        campaignName: 'Super Serum Launch',
        template: false,
        steps: 7,
      },
      {
        id: 'j2',
        name: 'Shade match to checkout',
        campaignName: 'Super Serum Launch',
        template: false,
        steps: 5,
      },
      {
        id: 'j3',
        name: 'Refill reminder to repeat order',
        campaignName: 'Back to Ritual',
        template: false,
        steps: 6,
      },
      {
        id: 'j4',
        name: 'Seasonal gifting blueprint',
        campaignName: null,
        template: true,
        steps: 8,
      },
      {
        id: 'j5',
        name: 'Product launch blueprint',
        campaignName: null,
        template: true,
        steps: 6,
      },
    ],
    readyCount: 3,
    totals: {
      sessions: 52480,
      lift: 0.24,
      revenue: 318400,
      leads: 1904,
    },
    previousTotals: {
      sessions: 44150,
      lift: 0.19,
      revenue: 271900,
      leads: 1612,
    },
    trendWindowDays: 14,
    activity: [
      {
        experienceName: '360 Serum Reveal',
        campaignName: 'Super Serum Launch',
        sessions: 28400,
        lift: 0.31,
      },
      {
        experienceName: 'Ingredient Deep Dive',
        campaignName: 'Clean Beauty 26',
        sessions: 15600,
        lift: 0.22,
      },
      {
        experienceName: 'Morning Ritual Set',
        campaignName: 'Back to Ritual',
        sessions: 6180,
        lift: 0.12,
      },
      {
        experienceName: 'Shade Finder',
        campaignName: 'Super Serum Launch',
        sessions: 4130,
        lift: -0.06,
      },
    ],
    recommendations: [
      {
        id: 'rec-1',
        severity: 'high',
        level: 'Deploy',
        tierName: 'Observed',
        tierWhy: 'Read straight off deploy state, no modelling involved',
        finding: 'Four experiences are built but cannot go out.',
        why: 'One waits on an expired film licence, one has no channel attached, one needs brand sign-off, and one has no owner at all. Together they have been sitting for 21 days.',
        who: '4 experiences · 3 campaigns · oldest stuck 9 days',
        impact:
          'Fall Refresh Drop opens in 9 days with a third of its subjects unable to ship.',
        evidence: ['4 blocked', '21 days idle', '2 campaigns at risk'],
        actionLabel: 'Clear the blockers',
        actionHref: COMMAND_LINKS.deploy,
      },
      {
        id: 'rec-2',
        severity: 'high',
        level: 'Experience',
        tierName: 'Measured',
        tierWhy: 'Enough sessions against a concurrent control',
        finding: 'Shade Finder has stopped earning its traffic.',
        why: 'It fell from 5,480 to 4,130 sessions in a day and now converts 6% below the page it replaced. Its content has not changed in five weeks.',
        who: '1 experience · 4,130 sessions · owner Linh Tran',
        impact: 'At this volume the gap is worth about $11,200 a month.',
        evidence: ['cvr 2.4%', 'control 2.6%', 'lift -6%'],
        actionLabel: 'Open the experience',
        actionHref: COMMAND_LINKS.deploy,
      },
      {
        id: 'rec-3',
        severity: 'medium',
        level: 'Block',
        tierName: 'Measured',
        tierWhy: 'Component-level signals across live experiences',
        finding: 'The Proof Carousel is your strongest block.',
        why: 'It completes at 68% wherever it appears, and is associated with a 24% lift versus pages that skip it.',
        who: '3 experiences · 12,400 views',
        impact:
          'Copy this block arc into Fall Refresh subjects that do not carry it yet.',
        evidence: ['interaction 54%', 'exit 12%', 'confidence 91%'],
        actionLabel: 'See block performance',
        actionHref: COMMAND_LINKS.intel,
      },
      {
        id: 'rec-4',
        severity: 'info',
        level: 'Journey',
        tierName: 'Directional',
        tierWhy: 'Segment-scaled walk, not yet at full volume',
        finding: 'Super Serum Launch is your best campaign, 31% above control.',
        why: '8,420 conversions from 28,400 sessions at $74 average order.',
        who: '28,400 sessions · measured against its own controls',
        impact: '$210k assisted revenue; its block arc is the one to copy.',
        evidence: ['lift +31%', 'cvr 4.2%', '$210k assisted'],
        actionLabel: 'See campaigns by contribution',
        actionHref: COMMAND_LINKS.campaigns,
      },
    ],
  };
};

/**
 * A stable snapshot for consumers that only need the shape of the portfolio and
 * not today's dates — `FORK_CAMPAIGNS` in the Journey module reads ids, names,
 * status and owner off this.
 */
export const MOCK_COMMAND: CommandSnapshot = buildCommandSnapshot(
  '2026-08-02T09:00:00.000Z'
);
