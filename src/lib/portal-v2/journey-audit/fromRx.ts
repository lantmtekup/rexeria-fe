import type {
  RxAuditEvidenceItem,
  RxAuditFlow,
  RxAuditJourney,
  RxAuditLeaksResponse,
  RxAuditProduct,
  RxAuditSnapshot,
  RxAuditTouchpoint,
  RxAuditTouchpointDetail,
} from '@/services/rexer-v2/types/audit';

import { formatMoney } from '@/lib/portal-v2/format';

import { AUDIT_PRODUCT_ICONS, AUDIT_STAGE_ICONS } from './mock';
import type {
  AuditDropoff,
  AuditFlow,
  AuditJourney,
  AuditProductRow,
  AuditSnapshot,
  AuditTouchpoint,
} from './types';

/** Hợp đồng Rx (snake_case, cents, phân số) → view model (camelCase, tiền, %). */

const money = (cents: number): number => cents / 100;

/** BE trả TÊN icon lucide-ish; prototype/mock dùng emoji. Quy về emoji. */
const ICON_EMOJI: Record<string, string> = {
  megaphone: '📣',
  music: '🎵',
  search: '🔍',
  instagram: '📸',
  layout: '🖥️',
  star: '⭐',
  'message-square': '💬',
  tag: '🏷️',
  'shopping-cart': '🛒',
  wallet: '💳',
  'credit-card': '💳',
  package: '📦',
  mail: '✉️',
  'refresh-cw': '♻️',
  gift: '🎁',
  'check-circle': '✅',
};

export const iconEmoji = (icon: string): string => ICON_EMOJI[icon] ?? icon;

export const auditProductFromRx = (rx: RxAuditProduct): AuditProductRow => ({
  id: rx.id,
  name: rx.name,
  sku: rx.sku,
  category: rx.category,
  source: rx.source ?? 'manual',
  icon: AUDIT_PRODUCT_ICONS[rx.id] ?? '📦',
  score: rx.score,
  touchpointCount: rx.touchpoint_count,
  auditId: rx.id,
});

/** Snapshot BE (url + extract có cấu trúc) → khung hiển thị của drawer. */
const snapshotFromRaw = (raw: RxAuditSnapshot | null): AuditSnapshot | null => {
  if (!raw) return null;
  const subline = Object.entries(raw.extract ?? {})
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(' · ');
  return {
    kind: 'page',
    heading: raw.url,
    subline: subline || raw.content_hash,
    cta: 'OBSERVED',
  };
};

/** continue_rate của BE là phân số 0..1; mock cũng vậy sau khi đồng bộ. */
const ratePct = (rate: number): number =>
  Math.round(rate <= 1 ? rate * 100 : rate);

const touchpointFromRx = (
  rx: RxAuditTouchpoint,
  detail: RxAuditTouchpointDetail | undefined,
  displaySnapshot: AuditSnapshot | undefined
): AuditTouchpoint => ({
  id: rx.id,
  name: rx.name,
  channel: rx.channel,
  icon: iconEmoji(rx.icon),
  score: rx.score,
  dims: rx.dims
    ? {
        messageMatch: rx.dims.message_match,
        loadSpeed: rx.dims.load_speed,
        brandConsistency: rx.dims.brand_consistency,
        friction: rx.dims.friction,
        accessibility: rx.dims.accessibility,
      }
    : null,
  flags: rx.flags.map(flag => ({ severity: flag.severity, label: flag.label })),
  sourceIds: rx.source_ids,
  state: rx.state,
  traffic: rx.traffic
    ? {
        arrive: rx.traffic.arrive,
        continueRatePct: ratePct(rx.traffic.continue_rate),
        leave: rx.traffic.leave,
        estimated: rx.traffic.estimated,
      }
    : null,
  findings: (detail?.findings ?? []).map(finding => ({
    severity: finding.severity,
    text: finding.text,
    evidenceSource: finding.evidence_source,
    observedAt: finding.observed_at,
  })),
  recommendation: detail?.recommendation ?? '',
  snapshot: displaySnapshot ??
    snapshotFromRaw(detail?.snapshot ?? null) ?? {
      kind: 'page',
      heading: rx.name,
      subline: rx.channel,
      cta: 'OBSERVED',
    },
});

export const journeyFromRx = (
  productId: string,
  rx: RxAuditJourney,
  details: Record<string, RxAuditTouchpointDetail>,
  displaySnapshots: Record<string, AuditSnapshot> = {}
): AuditJourney => ({
  productId,
  stages: rx.stages.map(stage => ({
    key: stage.key,
    name: stage.name,
    icon: AUDIT_STAGE_ICONS[stage.key] ?? '◇',
    objective: stage.objective,
    touchpoints: stage.touchpoints.map(tp =>
      touchpointFromRx(tp, details[tp.id], displaySnapshots[tp.id])
    ),
  })),
  handoffs: rx.handoffs.map(handoff => ({
    afterStage: handoff.after_stage,
    severity: handoff.severity,
    label: handoff.label,
    note: handoff.note,
  })),
});

/**
 * Flow Rx (node BE không mang entry volume) → view. `entry` do caller cấp:
 * mock lấy từ MOCK_FLOW_ENTRY; đường thật suy ngược từ `traffic.arrive` của
 * journey (arrive − tổng cạnh vào không-influence).
 */
export const flowFromRx = (
  productId: string,
  rx: RxAuditFlow,
  entry: Record<string, number>,
  estimated: boolean
): AuditFlow => ({
  productId,
  entry,
  edges: rx.edges.map(e => ({
    from: e.from,
    to: e.to,
    type: e.type,
    volume: e.volume,
    note: e.note || null,
  })),
  estimated,
});

const evidenceText = (item: RxAuditEvidenceItem): string => {
  if (item.text) return item.text;
  if (item.metric) return `${item.metric}: ${String(item.value ?? '')}`;
  if (item.snapshot_id) return `Snapshot ${item.snapshot_id.slice(0, 8)}`;
  return JSON.stringify(item);
};

export const dropoffFromRx = (
  productId: string,
  rx: RxAuditLeaksResponse,
  measured: boolean
): AuditDropoff => {
  const steps = rx.funnel.steps.map(step => ({
    key: step.key,
    label: step.label,
    count: step.count,
  }));
  const stepIndex = (key: string): number => {
    const index = steps.findIndex(step => step.key === key);
    return index >= 0 ? index : 0;
  };
  const benchByKey = Object.fromEntries(
    rx.funnel.benchmarks.map(bench => [bench.key, ratePct(bench.rate)])
  );
  const totalSessions = rx.channels.reduce(
    (total, channel) => total + channel.sessions,
    0
  );

  return {
    productId,
    steps,
    // benchmarks[i] áp cho lần chuyển steps[i] → steps[i+1], key = bước nguồn.
    benchmarks: steps.slice(0, -1).map(step => benchByKey[step.key] ?? null),
    leaks: rx.leaks.map(leak => ({
      id: leak.id,
      rank: leak.rank,
      title: leak.title,
      fromStep: stepIndex(leak.from_step),
      toStep: stepIndex(leak.to_step),
      touchpointId: leak.touchpoint_id,
      usd: money(leak.usd_cents),
      confidence: leak.confidence,
      recoveryRange: `${formatMoney(money(leak.recovery_range.lo_usd_cents))}–${formatMoney(
        money(leak.recovery_range.hi_usd_cents)
      )}/mo`,
      narrative: leak.narrative,
      evidence: leak.evidence.map(item => ({
        sourceId: item.source ?? 'audit',
        text: evidenceText(item),
      })),
      fix: leak.fix,
      estimated: leak.estimated,
    })),
    channels: rx.channels.map(channel => ({
      name: channel.channel,
      sessions: channel.sessions,
      sharePct: totalSessions
        ? Math.round((100 * channel.sessions) / totalSessions)
        : 0,
      buyersPer1000: channel.sessions
        ? Math.round((1000 * channel.converted) / channel.sessions)
        : 0,
    })),
    measured,
  };
};
