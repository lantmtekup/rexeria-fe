import { RETENTION_LABELS } from '@/lib/portal-v2/analytics/constants';
import type {
  ChannelMixRow,
  FunnelLeak,
  FunnelStep,
  PulseFactRow,
  PulseRollup,
} from '@/lib/portal-v2/analytics/types';

const SUM_KEYS = [
  'sessions',
  'engaged',
  'explored',
  'convinced',
  'converted',
  'leads',
  'revenue',
  'spend',
] as const;

export const fmtCount = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));

export const fmtMoney = (value: number): string =>
  value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${Math.round(value)}`;

export const fmtPct = (ratio: number | null | undefined): string =>
  ratio == null ? '—' : `${Math.round(ratio * 100)}%`;

export const fmtLift = (lift: number | null | undefined): string => {
  if (lift == null) return '—';
  const sign = lift >= 0 ? '+' : '−';
  return `${sign}${Math.abs(Math.round(lift * 100))}%`;
};

export const fmtAssist = (assist: number | null | undefined): string => {
  if (assist == null) return '—';
  const sign = assist >= 0 ? '+' : '−';
  return `${sign}${Math.abs(Math.round(assist * 100))}%`;
};

export const fmtRoas = (revenue: number, spend: number): string =>
  spend ? `${(revenue / spend).toFixed(1)}×` : '—';

export const rollup = (rows: PulseFactRow[]): PulseRollup => {
  const total = SUM_KEYS.reduce(
    (acc, key) => {
      acc[key] = rows.reduce((sum, row) => sum + row[key], 0);
      return acc;
    },
    {} as Record<(typeof SUM_KEYS)[number], number>
  );

  const sessions = total.sessions;
  const converted = total.converted;
  const controlCvr = sessions
    ? rows.reduce(
        (sum, row) =>
          sum + row.sessions * (row.controlCvr ?? row.cvr / (1 + row.lift)),
        0
      ) / sessions
    : 0;
  const cvr = sessions ? converted / sessions : 0;

  return {
    ...total,
    cvr,
    controlCvr,
    lift: controlCvr ? cvr / controlCvr - 1 : 0,
    aov: converted ? total.revenue / converted : 0,
    rows: rows.length,
  };
};

export const funnel = (rows: PulseFactRow[]): FunnelStep[] => {
  const total = rollup(rows);
  const values = [
    total.sessions,
    total.engaged,
    total.explored,
    total.convinced,
    total.converted,
  ];
  const labels = ['Sessions', 'Engaged', 'Explored', 'Convinced', 'Converted'];

  return labels.map((label, index) => ({
    label,
    value: values[index] ?? 0,
    lost:
      index === 0
        ? 0
        : Math.max(0, (values[index - 1] ?? 0) - (values[index] ?? 0)),
  }));
};

export const leakFunnel = (
  rows: PulseFactRow[]
): { total: PulseRollup; steps: FunnelStep[]; leaks: FunnelLeak[] } => {
  const total = rollup(rows);
  const steps = funnel(rows);
  const leaks = steps.slice(1).map((step, index) => {
    const previous = steps[index]!;
    const downstreamCvr = step.value ? total.converted / step.value : 0;
    return {
      after: previous.label,
      into: step.label,
      lost: step.lost,
      risk: Math.round(step.lost * downstreamCvr * total.aov),
    };
  });

  return { total, steps, leaks };
};

export const channelMix = (rows: PulseFactRow[]): ChannelMixRow[] => {
  const groups = new Map<string, PulseFactRow[]>();
  for (const row of rows) {
    groups.set(row.channel, [...(groups.get(row.channel) ?? []), row]);
  }

  return [...groups.entries()]
    .map(([channel, group]) => ({
      channel,
      ...rollup(group),
    }))
    .map(item => ({
      channel: item.channel,
      sessions: item.sessions,
      cvr: item.cvr,
      lift: item.lift,
    }))
    .sort((a, b) => b.sessions - a.sessions);
};

export const groupBySubject = (
  rows: PulseFactRow[]
): { key: string; rows: PulseFactRow[]; rollup: PulseRollup }[] => {
  const groups = new Map<string, PulseFactRow[]>();
  for (const row of rows) {
    groups.set(row.subjectName, [...(groups.get(row.subjectName) ?? []), row]);
  }

  return [...groups.entries()]
    .map(([key, group]) => ({ key, rows: group, rollup: rollup(group) }))
    .sort((a, b) => b.rollup.sessions - a.rollup.sessions);
};

export const retentionFunnel = (
  total: PulseRollup
): { name: string; rate: number | null }[] => {
  const pairs: [string, number, number][] = [
    [RETENTION_LABELS[0]!, total.engaged, total.sessions],
    [RETENTION_LABELS[1]!, total.explored, total.engaged],
    [RETENTION_LABELS[2]!, total.convinced, total.explored],
    [RETENTION_LABELS[3]!, total.converted, total.convinced],
  ];

  return pairs.map(([name, current, previous]) => ({
    name,
    rate: previous ? current / previous : null,
  }));
};

export const subjectLabel = (row: PulseFactRow): string => row.subjectName;

export const shortExperienceName = (name: string): string =>
  name.split(' — ')[0] ?? name;
