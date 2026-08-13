import {
  experienceRows,
  signalCoverageForExperience,
} from '@/lib/portal-v2/analytics/facts';
import { fmtLift, fmtMoney } from '@/lib/portal-v2/analytics/helpers';
import { insItems } from '@/lib/portal-v2/analytics/insights';
import type {
  ExperienceInsightItem,
  JourneyInsightItem,
  ProductInsightItem,
} from '@/lib/portal-v2/analytics/types';
import {
  MOCK_CAMPAIGN_EXPERIENCES,
  MOCK_CAMPAIGNS,
} from '@/lib/portal-v2/campaigns/mock';
import { TEMPLATE_OBJECTIVE } from '@/lib/portal-v2/intelligence/constants';
import type { IntelFinding } from '@/lib/portal-v2/intelligence/types';

const campaignOrder = new Map(
  MOCK_CAMPAIGNS.map((campaign, index) => [campaign.id, index])
);

const medianLift = (items: ExperienceInsightItem[]): number => {
  const lifts = items
    .map(item => item.rollup.lift)
    .filter(value => value != null)
    .sort((a, b) => a - b);
  return lifts.length ? lifts[Math.floor(lifts.length / 2)]! : 0;
};

export const buildIntelFindings = (): IntelFinding[] => {
  const findings: IntelFinding[] = [];
  const experiences = insItems('experiences') as ExperienceInsightItem[];
  const products = insItems('products') as ProductInsightItem[];
  const journeys = insItems('journeys') as JourneyInsightItem[];
  const med = medianLift(experiences);

  experiences
    .filter(
      item =>
        item.rollup.lift > 0.15 &&
        item.rollup.sessions > 1200 &&
        (item.variance == null || item.variance < 0.12)
    )
    .forEach(item => {
      findings.push({
        act: 'scale',
        title: item.name,
        experienceId: item.id,
        objective: TEMPLATE_OBJECTIVE[item.id],
        lift: item.rollup.lift,
        what: `lifts ${fmtLift(item.rollup.lift)} vs control${
          item.campaigns > 1
            ? `, holding steady across ${item.campaigns} campaigns`
            : ''
        }`,
        why: `${fmtMoney(item.rollup.revenue)} assisted so far. One of your most dependable reusable assets. Reuse it, feature it, fund it.`,
        impact: item.rollup.revenue,
        conf: item.rollup.sessions > 3000 ? 'high' : 'moderate',
        link: {
          type: 'experiences',
          id: item.id,
          labelKey: 'seeTrackRecord',
        },
      });
    });

  products
    .slice()
    .sort((a, b) => b.rollup.revenue - a.rollup.revenue)
    .slice(0, 1)
    .forEach(item => {
      findings.push({
        act: 'scale',
        title: item.name,
        what: `your top-revenue product at ${fmtMoney(item.rollup.revenue)}${
          item.bestExp ? `, sold best via ${item.bestExp.name}` : ''
        }`,
        why: 'Lean into what already sells. Pair it with the experience that converts it best.',
        impact: item.rollup.revenue,
        conf: 'high',
        link: {
          type: 'products',
          id: item.id,
          labelKey: 'seeRecord',
        },
      });
    });

  experiences
    .filter(item => item.rollup.lift < 0 && item.rollup.sessions > 600)
    .forEach(item => {
      findings.push({
        act: 'fix',
        title: item.name,
        experienceId: item.id,
        objective: TEMPLATE_OBJECTIVE[item.id],
        lift: item.rollup.lift,
        what: `converts ${fmtLift(item.rollup.lift)} vs control. Below the baseline it is meant to beat`,
        why: `${item.rollup.sessions.toLocaleString()} sessions are running through an underperformer (your median is ${fmtLift(med)}). Rework it or pull it.`,
        impact: item.rollup.sessions,
        conf: 'high',
        link: {
          type: 'experiences',
          id: item.id,
          labelKey: 'seeRecord',
        },
      });
    });

  journeys
    .filter(
      item =>
        item.funnel.weakest != null && (item.funnel.weakest.rate ?? 1) < 0.45
    )
    .forEach(item => {
      const weakest = item.funnel.weakest!;
      const parts = weakest.name.split('→');
      const into = parts[1]?.trim() ?? weakest.name;
      findings.push({
        act: 'fix',
        title: item.name,
        what: `leaks at ${into}. Only ${Math.round((weakest.rate ?? 0) * 100)}% carry through`,
        why: 'The biggest drop in this blueprint, and every campaign that forks it inherits the leak. Fix it once, upstream.',
        impact: item.rollup.sessions,
        conf: 'high',
        link: {
          type: 'journeys',
          id: item.id,
          labelKey: 'seeLeak',
        },
      });
    });

  MOCK_CAMPAIGN_EXPERIENCES.filter(item => item.template).forEach(template => {
    const stats = experienceRows(template.id);
    const sessions = stats.reduce((total, row) => total + row.sessions, 0);
    const cov = signalCoverageForExperience(template.id);
    if (sessions > 900 && cov.pct < 35) {
      findings.push({
        act: 'instrument',
        title: template.name,
        experienceId: template.id,
        objective: TEMPLATE_OBJECTIVE[template.id],
        what: `only ${cov.pct}% of its components carry a meaning (${cov.compsTracked} of ${cov.comps})`,
        why: `${sessions.toLocaleString()} sessions you cannot fully explain. A blind spot. Wire it in the experience editor.`,
        impact: sessions,
        conf: 'high',
        link: {
          type: 'experiences',
          id: template.id,
          labelKey: 'seeCoverage',
        },
      });
    }
  });

  experiences
    .filter(item => item.campaigns >= 2)
    .forEach(item => {
      const dated = item.splits
        .filter(split => split.rollup.lift != null)
        .sort(
          (a, b) =>
            (campaignOrder.get(a.campaignId) ?? 0) -
            (campaignOrder.get(b.campaignId) ?? 0)
        );
      if (dated.length < 2) return;
      const first = dated[0]!.rollup.lift;
      const last = dated[dated.length - 1]!.rollup.lift;
      if (first - last > 0.1) {
        findings.push({
          act: 'refresh',
          title: item.name,
          experienceId: item.id,
          objective: TEMPLATE_OBJECTIVE[item.id],
          lift: item.rollup.lift,
          what: `lift faded from ${fmtLift(first)} to ${fmtLift(last)} across its runs`,
          why: 'It used to win by more. Its edge is slipping. Rework the story or rest it before the next campaign.',
          impact: item.rollup.sessions,
          conf: 'moderate',
          link: {
            type: 'experiences',
            id: item.id,
            labelKey: 'seeTrend',
          },
        });
      }
    });

  return findings;
};

export const sortFindingsByImpact = (
  findings: IntelFinding[]
): IntelFinding[] => [...findings].sort((a, b) => b.impact - a.impact);
