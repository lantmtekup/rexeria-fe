import type {
  Experiment,
  ExperimentOpportunityRef,
  ExperimentOptionRef,
  ExperimentsData,
} from '@/lib/portal-v2/experiments/types';

export const getExperimentLift = (experiment: Experiment): number => {
  if (!experiment.a.sess || !experiment.b.sess) return 0;
  const controlRate = experiment.a.conv / experiment.a.sess;
  const variantRate = experiment.b.conv / experiment.b.sess;
  if (!controlRate) return 0;
  return ((variantRate - controlRate) / controlRate) * 100;
};

export const getExperimentCvr = (arm: Experiment['a']): number =>
  arm.sess ? (arm.conv / arm.sess) * 100 : 0;

export const getExperimentStageSessions = (
  experiment: Experiment,
  data: ExperimentsData
): number => {
  const opportunity = data.opps.find(item => item.id === experiment.from);
  if (!opportunity) return 0;
  return data.stages[opportunity.leakAfter + 1]?.count ?? 0;
};

export const getExperimentRecoveredMonthly = (
  experiment: Experiment,
  data: ExperimentsData
): number => {
  const rateDelta =
    getExperimentCvr(experiment.b) / 100 - getExperimentCvr(experiment.a) / 100;
  return Math.round(
    rateDelta * getExperimentStageSessions(experiment, data) * data.aov
  );
};

export const getExperimentInFlight = (
  experiment: Experiment,
  data: ExperimentsData
): number => Math.round((experiment.b.conv - experiment.a.conv) * data.aov);

export const findExperimentOpportunity = (
  experiment: Experiment,
  data: ExperimentsData
): ExperimentOpportunityRef | null =>
  data.opps.find(item => item.id === experiment.from) ?? null;

export const findExperimentOption = (
  experiment: Experiment,
  data: ExperimentsData
): ExperimentOptionRef | null => {
  const opportunity = findExperimentOpportunity(experiment, data);
  return (
    opportunity?.options.find(option => option.id === experiment.opt) ?? null
  );
};
