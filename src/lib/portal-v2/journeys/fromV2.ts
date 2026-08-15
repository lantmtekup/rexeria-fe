import type {
  Journey,
  JourneyCompareResult,
  JourneyNode,
  JourneyNodeKind,
  JourneyReview,
  JourneyStage,
} from '@/lib/portal-v2/journeys/types';
import { formatUpdated } from '@/lib/portal-v2/experiences/helpers';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';
import type {
  RxCreateJourneyRequest,
  RxJourney,
  RxJourneyCompareResponse,
  RxJourneyNode,
  RxJourneyReview,
  RxJourneyStage,
  RxJourneyStats,
} from '@/services/rexer-v2/types/journey';

/**
 * `/v1/journeys` ↔ shape trình soạn đang dùng.
 *
 * Hai chiều, vì editor phải LƯU lại được: đổi tên trường thôi cũng phải đối
 * xứng, thiếu một chiều là mỗi lần lưu mất một phần dữ liệu.
 *
 * Bảng tên khác nhau:
 *
 *     BE key          ↔ UI id
 *     BE description  ↔ UI d
 *     BE entry_source ↔ UI src
 *     BE experience_id↔ UI x
 */

const KINDS: JourneyNodeKind[] = [
  'entry',
  'experience',
  'decision',
  'action',
  'outcome',
];
const OBJECTIVES: ExperienceObjective[] = ['insight', 'lead', 'cta', 'convert'];

const pick = <T extends string>(
  v: string | null | undefined,
  all: T[]
): T | null => (v && (all as string[]).includes(v) ? (v as T) : null);

const nodeFromV2 = (n: RxJourneyNode): JourneyNode => ({
  id: n.key,
  kind: pick(n.kind, KINDS) ?? 'action',
  name: n.name,
  d: n.description ?? '',
  to: n.to ?? [],
  ...(n.entry_source ? { src: n.entry_source } : {}),
  ...(n.via ? { via: n.via } : {}),
  ...(n.experience_id ? { x: n.experience_id } : {}),
  ...(typeof n.phase === 'number' ? { stage: n.phase } : {}),
  ...(typeof n.px === 'number' ? { px: n.px } : {}),
  ...(typeof n.py === 'number' ? { py: n.py } : {}),
  // `xName`/`xSlug`/`xCoverage`/`stats` KHÔNG có ở đây: chúng thuộc về thư viện
  // trải nghiệm, không thuộc về hành trình. Người gọi tự bù nếu cần nhãn.
});

const nodeToV2 = (n: JourneyNode): RxJourneyNode => ({
  key: n.id,
  kind: n.kind,
  name: n.name,
  description: n.d ?? '',
  to: n.to ?? [],
  ...(n.src ? { entry_source: n.src } : {}),
  ...(n.via ? { via: n.via } : {}),
  ...(n.x ? { experience_id: n.x } : {}),
  ...(typeof n.stage === 'number' ? { phase: n.stage } : {}),
  ...(typeof n.px === 'number' ? { px: n.px } : {}),
  ...(typeof n.py === 'number' ? { py: n.py } : {}),
});

const stageFromV2 = (s: RxJourneyStage): JourneyStage => ({
  id: s.id,
  name: s.name,
  kind: s.kind === 'convert' ? 'convert' : 'flow',
  hint: s.hint ?? '',
});

export const v2ToJourney = (
  x: RxJourney,
  opts: { campaignName?: string | null } = {}
): Journey => ({
  id: x.id,
  name: x.name,
  template: x.is_template,
  campaign: x.campaign_id,
  campaignName: opts.campaignName ?? null,
  origin: x.origin_id,
  obj: pick(x.objective, OBJECTIVES) ?? 'lead',
  personaId: x.persona_id,
  // Nhãn đã định dạng — UI vẽ thẳng trường này, nên trả ISO thô sẽ hiện
  // "2026-08-07T09:13:31.944122+07:00" trên thẻ.
  updated: formatUpdated(x.updated_at),
  tagline: x.tagline ?? '',
  summary: x.summary ?? '',
  // Vắng ⇒ chưa ai đặt ⇒ đọc bộ mặc định. Đừng dựng mảng rỗng, nó mang nghĩa
  // "đã xoá hết chặng", một câu khác hẳn.
  ...(x.stages ? { stages: x.stages.map(stageFromV2) } : {}),
  nodes: (x.nodes ?? []).map(nodeFromV2),
  // `0` là một target hợp lệ — không dùng truthy check.
  ...(typeof x.target === 'number' ? { target: x.target } : {}),
  ...(x.stage_targets ? { stageTargets: x.stage_targets } : {}),
});

/** Chiều ngược — thân của `POST /journeys` và `PUT /journeys/{id}`. */
export const journeyToV2 = (
  j: Journey,
  opts: { brandId?: string | null } = {}
): RxCreateJourneyRequest => ({
  ...(opts.brandId ? { brand_id: opts.brandId } : {}),
  name: j.name,
  objective: j.obj,
  persona_id: j.personaId,
  tagline: j.tagline,
  summary: j.summary,
  nodes: j.nodes.map(nodeToV2),
  ...(j.stages
    ? {
        stages: j.stages.map(s => ({
          id: s.id,
          name: s.name,
          kind: s.kind,
          hint: s.hint,
        })),
      }
    : {}),
  ...(typeof j.target === 'number' ? { target: j.target } : {}),
  ...(j.stageTargets ? { stage_targets: j.stageTargets } : {}),
});

/** `GET /journeys/{id}/review` ↔ shape hiển thị của tab Insights. */
export const journeyReviewFromV2 = (x: RxJourneyReview): JourneyReview => ({
  score: x.score,
  parts: x.parts,
  weights: x.weights,
  confidenceTier: x.confidence_tier,
  stageReads: (x.stage_reads ?? []).map(r => ({
    nodeKey: r.node_key,
    role: r.role,
    sessions: r.sessions,
    lift: r.lift,
    tier: r.tier,
  })),
  nextBest: {
    mode:
      x.next_best.mode === 'add' || x.next_best.mode === 'strengthen'
        ? x.next_best.mode
        : 'none',
    detail: x.next_best.detail
      ? {
          role: x.next_best.detail.role,
          ...(x.next_best.detail.experience
            ? {
                experienceId: x.next_best.detail.experience.id,
                experienceName: x.next_best.detail.experience.name,
                ...(typeof x.next_best.detail.experience.signal_coverage ===
                'number'
                  ? {
                      experienceCoverage: Math.round(
                        (x.next_best.detail.experience
                          .signal_coverage as number) * 100
                      ),
                    }
                  : {}),
              }
            : {}),
          reason: x.next_best.detail.reason,
          ...(x.next_best.detail.node_key
            ? { nodeKey: x.next_best.detail.node_key }
            : {}),
        }
      : null,
    noneReason: x.next_best.none_reason ?? null,
  },
});

const compareSideFromV2 = (s: RxJourneyStats) => ({
  measured: s.measured,
  reason: s.reason ?? null,
  sessions: s.sessions,
  completed: s.completed,
  completionRate: s.completion_rate,
  confidenceTier: s.confidence_tier,
});

/** `GET /journeys/compare` ↔ shape của `CompareJourneysModal`. */
export const journeyCompareFromV2 = (
  x: RxJourneyCompareResponse
): JourneyCompareResult => ({
  a: compareSideFromV2(x.a),
  b: compareSideFromV2(x.b),
  stages: (x.stages ?? []).map(s => ({
    key: s.key,
    aSessions: s.a_sessions,
    bSessions: s.b_sessions,
    delta: s.delta,
  })),
});
