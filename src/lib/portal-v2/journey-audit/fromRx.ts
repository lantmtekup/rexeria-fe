import type {
  RxAuditFlow,
  RxAuditJourney,
  RxAuditLeaksResponse,
  RxAuditProduct,
  RxAuditTouchpoint,
  RxAuditTouchpointDetail,
} from '@/services/rexer-v2/types/audit';
import type { RxSource } from '@/services/rexer-v2/types/sources';

import { AUDIT_PRODUCT_ICONS, AUDIT_STAGE_ICONS } from './mock';
import type {
  AuditDropoff,
  AuditFlow,
  AuditJourney,
  AuditProductRow,
  AuditSource,
  AuditTouchpoint,
} from './types';

/** Hợp đồng Rx (snake_case, cents) → view model (camelCase, tiền). */

const money = (cents: number): number => cents / 100;

export const auditProductFromRx = (rx: RxAuditProduct): AuditProductRow => ({
  id: rx.id,
  name: rx.name,
  sku: rx.sku,
  category: rx.category,
  icon: AUDIT_PRODUCT_ICONS[rx.id] ?? '📦',
  score: rx.score,
  touchpointCount: rx.touchpoint_count,
  auditId: rx.id,
});

const touchpointFromRx = (
  rx: RxAuditTouchpoint,
  detail: RxAuditTouchpointDetail | undefined
): AuditTouchpoint => ({
  id: rx.id,
  name: rx.name,
  channel: rx.channel,
  icon: rx.icon,
  score: rx.score,
  dims: {
    messageMatch: rx.dims.message_match,
    loadSpeed: rx.dims.load_speed,
    brandConsistency: rx.dims.brand_consistency,
    friction: rx.dims.friction,
    accessibility: rx.dims.accessibility,
  },
  flags: rx.flags.map(flag => ({ severity: flag.severity, label: flag.label })),
  sourceIds: rx.source_ids,
  findings: (detail?.findings ?? []).map(finding => ({
    severity: finding.severity,
    text: finding.text,
    evidenceSource: finding.evidence_source,
    observedAt: finding.observed_at,
  })),
  recommendation: detail?.recommendation ?? '',
  snapshot: detail?.snapshot ?? {
    kind: 'page',
    heading: rx.name,
    subline: rx.channel,
    cta: 'View',
  },
});

export const journeyFromRx = (
  productId: string,
  rx: RxAuditJourney,
  details: Record<string, RxAuditTouchpointDetail>
): AuditJourney => ({
  productId,
  stages: rx.stages.map(stage => ({
    key: stage.key,
    name: stage.name,
    icon: AUDIT_STAGE_ICONS[stage.key] ?? '◇',
    objective: stage.objective,
    touchpoints: stage.touchpoints.map(tp =>
      touchpointFromRx(tp, details[tp.id])
    ),
  })),
  handoffs: rx.handoffs.map(handoff => ({
    afterStage: handoff.after_stage,
    severity: handoff.severity,
    label: handoff.label,
    note: handoff.note,
  })),
});

export const flowFromRx = (productId: string, rx: RxAuditFlow): AuditFlow => ({
  productId,
  entry: Object.fromEntries(rx.nodes.map(node => [node.id, node.entry_volume])),
  edges: rx.edges.map(e => ({
    from: e.from,
    to: e.to,
    type: e.type,
    volume: e.volume,
    note: e.note,
  })),
  estimated: rx.nodes.every(node => node.estimated),
});

export const dropoffFromRx = (
  productId: string,
  rx: RxAuditLeaksResponse,
  measured: boolean
): AuditDropoff => ({
  productId,
  steps: rx.funnel.steps.map(step => ({
    key: step.key,
    label: step.label,
    count: step.count,
  })),
  benchmarks: rx.funnel.benchmarks,
  leaks: rx.leaks.map(leak => ({
    id: leak.id,
    rank: leak.rank,
    title: leak.title,
    fromStep: leak.from_step,
    toStep: leak.to_step,
    touchpointId: leak.touchpoint_id,
    usd: money(leak.usd_cents),
    confidence: leak.confidence,
    recoveryRange: leak.recovery_range,
    narrative: leak.narrative,
    evidence: leak.evidence.map(item => ({
      sourceId: item.source_id,
      text: item.text,
    })),
    fix: leak.fix,
  })),
  channels: rx.channels.map(channel => ({
    name: channel.name,
    sharePct: channel.share_pct,
    buyersPer1000: channel.buyers_per_1000,
    leakId: channel.leak_id,
  })),
  measured,
});

export const sourceFromRx = (rx: RxSource): AuditSource => ({
  id: rx.id,
  provider: rx.provider,
  name: rx.name,
  icon: rx.icon,
  category: rx.category,
  auth: rx.auth,
  status: rx.status,
  firstParty: rx.first_party,
  stages: rx.stages,
  observes: rx.observes,
  stats: rx.stats,
  lastSync: rx.last_sync,
  issue: rx.issue,
  value: rx.value,
  unlocks: rx.unlocks,
});
