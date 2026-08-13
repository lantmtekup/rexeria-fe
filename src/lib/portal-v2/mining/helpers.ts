import { MINING_TOUCHPOINTS } from '@/lib/portal-v2/mining/touchpoints';
import type {
  MiningData,
  MiningExperiment,
  MiningOpportunity,
  MiningSource,
  MiningStageId,
} from '@/lib/portal-v2/mining/types';

export const getMiningCoverage = (data: MiningData): Set<MiningStageId> => {
  const covered = new Set<MiningStageId>();
  data.sources.forEach(source => {
    if (source.status !== 'connected') return;
    source.covers.forEach(stage => covered.add(stage));
  });
  return covered;
};

export const getMiningConfidence = (
  opportunity: MiningOpportunity,
  data: MiningData
): number => {
  const unhealthySources = new Set(
    opportunity.evidence
      .map(evidence => evidence.src)
      .filter(
        sourceId =>
          data.sources.find(source => source.id === sourceId)?.status !==
          'connected'
      )
  );

  return Math.max(0, opportunity.conf - unhealthySources.size * 8);
};

export const getMiningTotalRisk = (data: MiningData): number =>
  data.opps.reduce((total, opportunity) => total + opportunity.risk, 0);

export const getExperimentLift = (experiment: MiningExperiment): number => {
  if (!experiment.a.sess || !experiment.b.sess) return 0;
  const controlRate = experiment.a.conv / experiment.a.sess;
  const variantRate = experiment.b.conv / experiment.b.sess;
  if (!controlRate) return 0;
  return ((variantRate - controlRate) / controlRate) * 100;
};

export const getExperimentCvr = (arm: MiningExperiment['a']): number =>
  arm.sess ? (arm.conv / arm.sess) * 100 : 0;

export const getExperimentStageSessions = (
  experiment: MiningExperiment,
  data: MiningData
): number => {
  const opportunity = data.opps.find(item => item.id === experiment.from);
  if (!opportunity) return 0;
  return data.stages[opportunity.leakAfter + 1]?.count ?? 0;
};

export const getExperimentRecoveredMonthly = (
  experiment: MiningExperiment,
  data: MiningData
): number => {
  const rateDelta =
    getExperimentCvr(experiment.b) / 100 - getExperimentCvr(experiment.a) / 100;
  return Math.round(
    rateDelta * getExperimentStageSessions(experiment, data) * data.aov
  );
};

export const getExperimentInFlight = (
  experiment: MiningExperiment,
  data: MiningData
): number => Math.round((experiment.b.conv - experiment.a.conv) * data.aov);

export const findExperimentOpportunity = (
  experiment: MiningExperiment,
  data: MiningData
): MiningOpportunity | null =>
  data.opps.find(item => item.id === experiment.from) ?? null;

export const findExperimentOption = (
  experiment: MiningExperiment,
  data: MiningData
) => {
  const opportunity = findExperimentOpportunity(experiment, data);
  return (
    opportunity?.options.find(option => option.id === experiment.opt) ?? null
  );
};

export const getSourceTouchpoints = (source: MiningSource): string[] =>
  MINING_TOUCHPOINTS.filter(touchpoint =>
    touchpoint.measuredBy.includes(source.id)
  ).map(touchpoint => touchpoint.name);

export const countSourceCitations = (
  sourceId: string,
  data: MiningData
): number =>
  data.opps.filter(opportunity =>
    opportunity.evidence.some(evidence => evidence.src === sourceId)
  ).length;

export const formatMiningMoney = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const formatMiningCount = (value: number): string =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
