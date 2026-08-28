'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { EXPERIMENT_SHIP_GATE } from '@/lib/portal-v2/experiments/constants';
import { getExperimentLift } from '@/lib/portal-v2/experiments/helpers';
import { MOCK_EXPERIMENTS } from '@/lib/portal-v2/experiments/mock';
import type {
  Experiment,
  ExperimentsData,
} from '@/lib/portal-v2/experiments/types';

/**
 * Provider mock của màn Experiments — trước đây provider của module Mining
 * cũ mount ở layout cho MỌI route portal-v2; giờ chỉ mount TRONG trang
 * experiments. Hành vi stop/conclude (ship gate 95) giữ nguyên.
 */

type MutationResult =
  | { ok: true; experiment: Experiment }
  | { ok: false; reason: 'not-found' | 'gate-closed' | 'gate-open' };

type ExperimentsDataContextValue = {
  data: ExperimentsData;
  stopExperiment: (experimentId: string) => MutationResult;
  concludeExperiment: (experimentId: string) => MutationResult;
};

const ExperimentsDataContext =
  createContext<ExperimentsDataContextValue | null>(null);

export const ExperimentsDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [data, setData] = useState<ExperimentsData>(() =>
    structuredClone(MOCK_EXPERIMENTS)
  );
  const dataRef = useRef(data);

  const commit = useCallback((next: ExperimentsData) => {
    dataRef.current = next;
    setData(next);
  }, []);

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

      const experiment: Experiment = {
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
      const experiment: Experiment = {
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

  return (
    <ExperimentsDataContext.Provider
      value={{ data, stopExperiment, concludeExperiment }}
    >
      {children}
    </ExperimentsDataContext.Provider>
  );
};

export const useExperimentsData = (): ExperimentsDataContextValue => {
  const context = useContext(ExperimentsDataContext);
  if (!context) {
    throw new Error(
      'useExperimentsData must be used within ExperimentsDataProvider'
    );
  }
  return context;
};
