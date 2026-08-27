import { AUDIT_STAGE_NAMES } from './mock';
import type {
  AuditDropoff,
  AuditFlow,
  AuditFlowEdge,
  AuditJourney,
  AuditLeak,
  AuditSeverity,
  AuditSource,
  AuditSourceStatus,
  AuditStage,
  AuditTouchpoint,
  AuditTouchpointState,
} from './types';

/**
 * Toàn bộ trạng thái dẫn xuất của Journey Audit — tính từ (journey, flow,
 * sources) đúng như prototype: điểm stage chỉ tính touchpoint được audit,
 * touchpoint mất nguồn thành ghost, coverage/confidence đổi ngay khi
 * connect/disconnect (FR-D9).
 */

export type SourceStatusMap = Record<string, AuditSourceStatus>;

export const sourceStatusMap = (sources: AuditSource[]): SourceStatusMap =>
  Object.fromEntries(sources.map(source => [source.id, source.status]));

/* ── touchpoint state ────────────────────────────────────────────────────── */

export const tpState = (
  tp: AuditTouchpoint,
  statuses: SourceStatusMap
): AuditTouchpointState => {
  const list = tp.sourceIds.map(id => statuses[id]);
  if (list.includes('connected')) return 'live';
  if (list.includes('attention')) return 'stale';
  return 'off';
};

export const tpOffSources = (
  tp: AuditTouchpoint,
  sources: AuditSource[]
): AuditSource[] =>
  tp.sourceIds
    .map(id => sources.find(source => source.id === id))
    .filter(
      (source): source is AuditSource =>
        source != null && source.status === 'available'
    );

export const auditedTouchpoints = (
  stage: AuditStage,
  statuses: SourceStatusMap
): AuditTouchpoint[] =>
  stage.touchpoints.filter(tp => tpState(tp, statuses) !== 'off');

/* ── điểm số ─────────────────────────────────────────────────────────────── */

export const stageScore = (
  stage: AuditStage,
  statuses: SourceStatusMap
): number | null => {
  const audited = auditedTouchpoints(stage, statuses);
  if (!audited.length) return null;
  return Math.round(
    audited.reduce((total, tp) => total + tp.score, 0) / audited.length
  );
};

export const productScore = (
  journey: AuditJourney,
  statuses: SourceStatusMap
): number | null => {
  const scores = journey.stages
    .map(stage => stageScore(stage, statuses))
    .filter((score): score is number => score != null);
  if (!scores.length) return null;
  return Math.round(
    scores.reduce((total, score) => total + score, 0) / scores.length
  );
};

export const countFindings = (
  journey: AuditJourney,
  statuses: SourceStatusMap,
  severity: AuditSeverity
): number =>
  journey.stages.reduce(
    (total, stage) =>
      total +
      auditedTouchpoints(stage, statuses).reduce(
        (sum, tp) =>
          sum + tp.findings.filter(f => f.severity === severity).length,
        0
      ),
    0
  );

export const countAuditedTouchpoints = (
  journey: AuditJourney,
  statuses: SourceStatusMap
): number =>
  journey.stages.reduce(
    (total, stage) => total + auditedTouchpoints(stage, statuses).length,
    0
  );

export const countOffTouchpoints = (
  journey: AuditJourney,
  statuses: SourceStatusMap
): number =>
  journey.stages.reduce(
    (total, stage) =>
      total +
      stage.touchpoints.filter(tp => tpState(tp, statuses) === 'off').length,
    0
  );

export const findTouchpoint = (
  journey: AuditJourney,
  touchpointId: string
): { stage: AuditStage; tp: AuditTouchpoint; stageIndex: number } | null => {
  for (let index = 0; index < journey.stages.length; index += 1) {
    const stage = journey.stages[index];
    const tp = stage.touchpoints.find(item => item.id === touchpointId);
    if (tp) return { stage, tp, stageIndex: index };
  }
  return null;
};

/** Số touchpoint trong journey hiện tại được một nguồn nuôi. */
export const feedsCount = (sourceId: string, journey: AuditJourney): number =>
  journey.stages.reduce(
    (total, stage) =>
      total +
      stage.touchpoints.filter(tp => tp.sourceIds.includes(sourceId)).length,
    0
  );

/* ── flow (chỉ tính cạnh mà cả hai đầu đều được audit) ───────────────────── */

export const liveConns = (
  flow: AuditFlow,
  journey: AuditJourney,
  statuses: SourceStatusMap
): AuditFlowEdge[] => {
  const liveIds = new Set<string>();
  journey.stages.forEach(stage =>
    stage.touchpoints.forEach(tp => {
      if (tpState(tp, statuses) !== 'off') liveIds.add(tp.id);
    })
  );
  return flow.edges.filter(e => liveIds.has(e.from) && liveIds.has(e.to));
};

export const inboundEdges = (
  conns: AuditFlowEdge[],
  id: string
): AuditFlowEdge[] => conns.filter(e => e.to === id);

export const outboundEdges = (
  conns: AuditFlowEdge[],
  id: string
): AuditFlowEdge[] => conns.filter(e => e.from === id);

export type FlowStats = {
  direct: number;
  arrive: number;
  cont: number;
  leave: number;
  rate: number;
  inEdges: AuditFlowEdge[];
  outEdges: AuditFlowEdge[];
  influence: AuditFlowEdge[];
  isEnd: boolean;
};

export const flowStats = (
  flow: AuditFlow,
  conns: AuditFlowEdge[],
  id: string
): FlowStats => {
  const direct = flow.entry[id] ?? 0;
  const inEdges = inboundEdges(conns, id).filter(e => e.type !== 'influence');
  const outEdges = outboundEdges(conns, id).filter(e => e.type !== 'influence');
  const arrive = direct + inEdges.reduce((total, e) => total + e.volume, 0);
  const cont = outEdges.reduce((total, e) => total + e.volume, 0);
  const leave = Math.max(0, arrive - cont);
  return {
    direct,
    arrive,
    cont,
    leave,
    rate: arrive ? Math.round((100 * cont) / arrive) : 0,
    inEdges,
    outEdges,
    influence: inboundEdges(conns, id).filter(e => e.type === 'influence'),
    isEnd: !outEdges.length,
  };
};

export const isEntry = (conns: AuditFlowEdge[], id: string): boolean =>
  !inboundEdges(conns, id).some(e => e.type === 'path' || e.type === 'weak');

export const isIsland = (conns: AuditFlowEdge[], id: string): boolean =>
  conns.every(e => e.from !== id && e.to !== id);

export const downstreamCount = (
  conns: AuditFlowEdge[],
  id: string,
  seen: Set<string> = new Set()
): number => {
  let total = 0;
  outboundEdges(conns, id)
    .filter(e => e.type === 'path' || e.type === 'weak')
    .forEach(e => {
      if (seen.has(e.to)) return;
      seen.add(e.to);
      total += 1 + downstreamCount(conns, e.to, seen);
    });
  return total;
};

/* ── coverage (Sources) ──────────────────────────────────────────────────── */

export type StageCoverage = {
  stage: string;
  live: number;
  stale: number;
  state: 'ok' | 'weak' | 'gap';
};

export const stageCoverage = (sources: AuditSource[]): StageCoverage[] =>
  AUDIT_STAGE_NAMES.map(stageName => {
    const live = sources.filter(
      source =>
        source.status === 'connected' && source.stages.includes(stageName)
    ).length;
    const stale = sources.filter(
      source =>
        source.status === 'attention' && source.stages.includes(stageName)
    ).length;
    const state: StageCoverage['state'] =
      live >= 2
        ? 'ok'
        : live === 1
          ? stale
            ? 'weak'
            : 'ok'
          : stale
            ? 'weak'
            : 'gap';
    return { stage: stageName, live, stale, state };
  });

export type CoverageHint =
  | { kind: 'gap'; stage: string; recommended: string[] }
  | { kind: 'strengthenAwareness' }
  | { kind: 'attention'; sourceName: string; stages: string }
  | null;

export const coverageHint = (
  coverage: StageCoverage[],
  sources: AuditSource[]
): CoverageHint => {
  const gap = coverage.find(item => item.state === 'gap');
  if (gap) {
    const recommended = sources
      .filter(
        source =>
          source.status === 'available' && source.stages.includes(gap.stage)
      )
      .slice(0, 2)
      .map(source => source.name);
    return { kind: 'gap', stage: gap.stage, recommended };
  }
  const awareness = coverage[0];
  if (
    awareness.live === 1 &&
    !sources.some(
      source =>
        source.status !== 'available' && source.category === 'Paid Media'
    )
  ) {
    return { kind: 'strengthenAwareness' };
  }
  const attention = sources.find(source => source.status === 'attention');
  if (attention) {
    return {
      kind: 'attention',
      sourceName: attention.name,
      stages: attention.stages.join(' & '),
    };
  }
  return null;
};

/** Nguồn analytics — bất kỳ nguồn nào thuộc category Analytics & Behavior. */
export const analyticsSources = (sources: AuditSource[]): AuditSource[] =>
  sources.filter(source => source.category === 'Analytics & Behavior');

export const analyticsOn = (sources: AuditSource[]): boolean =>
  analyticsSources(sources).some(source => source.status !== 'available');

/* ── leaks ───────────────────────────────────────────────────────────────── */

export const leaksForTouchpoint = (
  dropoff: AuditDropoff | null,
  touchpointId: string
): AuditLeak[] =>
  dropoff
    ? dropoff.leaks.filter(leak => leak.touchpointId === touchpointId)
    : [];

export const stageLeaks = (
  dropoff: AuditDropoff | null,
  stage: AuditStage
): AuditLeak[] => {
  if (!dropoff) return [];
  const ids = new Set(stage.touchpoints.map(tp => tp.id));
  return dropoff.leaks.filter(leak => ids.has(leak.touchpointId));
};

export const totalRisk = (dropoff: AuditDropoff | null): number =>
  dropoff ? dropoff.leaks.reduce((total, leak) => total + leak.usd, 0) : 0;

/* ── score → màu/hạng ────────────────────────────────────────────────────── */

export type ScoreTone = 'good' | 'warn' | 'crit';

/** Ngưỡng của prototype: ≥80 good · ≥65 warn · còn lại crit. */
export const scoreTone = (score: number): ScoreTone =>
  score >= 80 ? 'good' : score >= 65 ? 'warn' : 'crit';

export const TONE_COLOR: Record<ScoreTone, string> = {
  good: 'var(--pv2-success)',
  warn: 'var(--pv2-warning)',
  crit: 'var(--pv2-error)',
};

export const TONE_SOFT: Record<ScoreTone, string> = {
  good: 'color-mix(in srgb, var(--pv2-success) 10%, var(--pv2-paper))',
  warn: 'color-mix(in srgb, var(--pv2-warning) 12%, var(--pv2-paper))',
  crit: 'color-mix(in srgb, var(--pv2-error) 9%, var(--pv2-paper))',
};

export const scoreColor = (score: number): string =>
  TONE_COLOR[scoreTone(score)];

export const scoreSoft = (score: number): string => TONE_SOFT[scoreTone(score)];

/** A ≥90 · B ≥80 · C ≥70 · D ≥60 · F còn lại. */
export const grade = (score: number): string =>
  score >= 90
    ? 'A'
    : score >= 80
      ? 'B'
      : score >= 70
        ? 'C'
        : score >= 60
          ? 'D'
          : 'F';
