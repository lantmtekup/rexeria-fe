'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { EXPERIMENT_SHIP_GATE } from '@/lib/portal-v2/mining/constants';
import { getExperimentLift } from '@/lib/portal-v2/mining/helpers';
import { MOCK_MINING } from '@/lib/portal-v2/mining/mock';
import type {
  MiningData,
  MiningExperiment,
  MiningSource,
} from '@/lib/portal-v2/mining/types';

type MutationResult =
  | { ok: true; experiment: MiningExperiment }
  | {
      ok: false;
      reason: 'not-found' | 'running-exists' | 'gate-closed' | 'gate-open';
    };

type SourceMutationResult =
  { ok: true; source: MiningSource } | { ok: false; reason: 'not-found' };

type MiningDataContextValue = {
  data: MiningData;
  startExperiment: (opportunityId: string, optionId: string) => MutationResult;
  stopExperiment: (experimentId: string) => MutationResult;
  concludeExperiment: (experimentId: string) => MutationResult;
  connectSource: (sourceId: string) => SourceMutationResult;
  disconnectSource: (sourceId: string) => SourceMutationResult;
};

const MiningDataContext = createContext<MiningDataContextValue | null>(null);

const cloneMiningData = (data: MiningData): MiningData => structuredClone(data);

type MiningDataProviderProps = {
  children: ReactNode;
};

export const MiningDataProvider = ({ children }: MiningDataProviderProps) => {
  const [data, setData] = useState<MiningData>(() =>
    cloneMiningData(MOCK_MINING)
  );
  const dataRef = useRef(data);

  const commit = useCallback((next: MiningData) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const startExperiment = useCallback(
    (opportunityId: string, optionId: string): MutationResult => {
      const current = dataRef.current;
      const opportunity = current.opps.find(item => item.id === opportunityId);
      const option = opportunity?.options.find(item => item.id === optionId);
      if (!opportunity || !option) return { ok: false, reason: 'not-found' };

      const running = current.experiments.find(
        experiment =>
          experiment.from === opportunityId && experiment.status === 'running'
      );
      if (running) {
        return { ok: false, reason: 'running-exists' };
      }

      const destinationStage =
        current.stages[opportunity.leakAfter + 1]?.label ?? opportunity.stage;
      const experiment: MiningExperiment = {
        id: `x${current.experiments.length + 1}`,
        opt: option.id,
        name: option.name,
        from: opportunity.id,
        status: 'draft',
        days: 0,
        metric: `${destinationStage} conversion rate`,
        sig: 0,
        hypothesis: `${option.angle}. ${option.leans}.`,
        a: { sess: 0, conv: 0 },
        b: { sess: 0, conv: 0 },
        daily: [],
      };

      commit({
        ...current,
        experiments: [...current.experiments, experiment],
      });
      return { ok: true, experiment };
    },
    [commit]
  );

  const stopExperiment = useCallback(
    (experimentId: string): MutationResult => {
      const current = dataRef.current;
      const existing = current.experiments.find(
        item => item.id === experimentId
      );
      if (!existing || existing.status !== 'running') {
        return { ok: false, reason: 'not-found' };
      }
      if (existing.sig >= EXPERIMENT_SHIP_GATE) {
        return { ok: false, reason: 'gate-open' };
      }

      const experiment: MiningExperiment = {
        ...existing,
        status: 'stopped',
        stopped: { day: existing.days, sig: existing.sig },
      };
      commit({
        ...current,
        experiments: current.experiments.map(item =>
          item.id === experimentId ? experiment : item
        ),
      });
      return { ok: true, experiment };
    },
    [commit]
  );

  const concludeExperiment = useCallback(
    (experimentId: string): MutationResult => {
      const current = dataRef.current;
      const existing = current.experiments.find(
        item => item.id === experimentId
      );
      if (!existing || existing.status !== 'running') {
        return { ok: false, reason: 'not-found' };
      }
      if (existing.sig < EXPERIMENT_SHIP_GATE) {
        return { ok: false, reason: 'gate-closed' };
      }

      const won = getExperimentLift(existing) > 0;
      const experiment: MiningExperiment = {
        ...existing,
        status: won ? 'won' : 'lost',
        learning:
          won || existing.learning
            ? existing.learning
            : 'The variant did not beat control. The evidence stays attached to the leak so the next strategy starts from what this test learned.',
      };
      commit({
        ...current,
        experiments: current.experiments.map(item =>
          item.id === experimentId ? experiment : item
        ),
      });
      return { ok: true, experiment };
    },
    [commit]
  );

  const connectSource = useCallback(
    (sourceId: string): SourceMutationResult => {
      const current = dataRef.current;
      const existing = current.sources.find(item => item.id === sourceId);
      if (!existing) return { ok: false, reason: 'not-found' };

      const source: MiningSource = {
        ...existing,
        status: 'connected',
        err: undefined,
        fresh: 'synced just now',
      };
      commit({
        ...current,
        sources: current.sources.map(item =>
          item.id === sourceId ? source : item
        ),
      });
      return { ok: true, source };
    },
    [commit]
  );

  const disconnectSource = useCallback(
    (sourceId: string): SourceMutationResult => {
      const current = dataRef.current;
      const existing = current.sources.find(item => item.id === sourceId);
      if (!existing) return { ok: false, reason: 'not-found' };

      const source: MiningSource = {
        ...existing,
        status: 'off',
        err: undefined,
        fresh: '',
      };
      commit({
        ...current,
        sources: current.sources.map(item =>
          item.id === sourceId ? source : item
        ),
      });
      return { ok: true, source };
    },
    [commit]
  );

  return (
    <MiningDataContext.Provider
      value={{
        data,
        startExperiment,
        stopExperiment,
        concludeExperiment,
        connectSource,
        disconnectSource,
      }}
    >
      {children}
    </MiningDataContext.Provider>
  );
};

export const useMiningData = (): MiningDataContextValue => {
  const context = useContext(MiningDataContext);
  if (!context) {
    throw new Error('useMiningData must be used within MiningDataProvider');
  }
  return context;
};
