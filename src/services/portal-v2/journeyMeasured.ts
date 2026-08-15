import {
  journeyCompareFromV2,
  journeyReviewFromV2,
} from '@/lib/portal-v2/journeys/fromV2';
import type {
  JourneyBenchmark,
  JourneyCompareResult,
  JourneyReadiness,
  JourneyReview,
} from '@/lib/portal-v2/journeys/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Số ĐO và điểm sẵn sàng của một hành trình — hỏi server, không tự tính.
 *
 * FE có bản sao bộ kiểm đồ thị (`validateJourney`) và nó BẮT BUỘC phải còn:
 * một bản nháp chưa lưu thì không hỏi server được. Nhưng với hành trình ĐÃ LƯU
 * thì bản của server mới là bản quyết định `Use` có chạy hay không — và hai bên
 * từng lệch nhau: màn hình 62% trong khi `/readiness` nói 33%, vì BE chấm ở
 * tầng khác (hợp đồng có qua không · node đã resolve thành fork chưa · đã có
 * điểm đo chưa).
 */

/** Nhãn + độ phủ của các trải nghiệm mà node trong hành trình đang trỏ tới. */
export type ExperienceRefs = Record<
  string,
  { name: string; coverage: number | null }
>;

export const fetchJourneyReadiness = async (
  journeyId: string
): Promise<JourneyReadiness | null> => {
  try {
    const r = await rexerV2Api.journeys.readiness(journeyId);
    return {
      score: Math.round((r.score ?? 0) * 100),
      checks: (r.checks ?? []).map(c => ({ ok: c.ok, msg: c.label })),
      missing: r.missing ?? [],
    };
  } catch {
    return null;
  }
};

/**
 * `measured:false` ⇒ null, để pane hiện "chưa chạy".
 *
 * BE gửi kèm sessions/completion bằng 0 trong trường hợp đó; vẽ chúng ra sẽ
 * đọc như "đã chạy mà không ai đi tới đâu".
 */
export const fetchJourneyStats = async (
  journeyId: string
): Promise<{ sessions: number; completed: number; rate: number } | null> => {
  try {
    const s = await rexerV2Api.journeys.stats(journeyId);
    if (!s.measured) return null;
    return {
      sessions: s.sessions,
      completed: s.completed,
      rate: s.completion_rate,
    };
  } catch {
    return null;
  }
};

/**
 * Điểm "Architect" — `GET /journeys/{id}/review`. BE chấm toàn bộ
 * (contract/evidence/structure + gợi ý stage kế tiếp); FE chỉ vẽ lại.
 */
export const fetchJourneyReview = async (
  journeyId: string
): Promise<JourneyReview | null> => {
  try {
    return journeyReviewFromV2(await rexerV2Api.journeys.review(journeyId));
  } catch {
    return null;
  }
};

/** So hai hành trình — `GET /journeys/compare`. */
export const fetchJourneyCompare = async (
  aId: string,
  bId: string
): Promise<JourneyCompareResult | null> => {
  try {
    return journeyCompareFromV2(await rexerV2Api.journeys.compare(aId, bId));
  } catch {
    return null;
  }
};

/**
 * "The standard" một blueprint đã đạt được — gộp số ĐO ĐƯỢC (`/stats`) từ
 * các bản copy của nó, theo trọng số phiên. Không có cột `proven` nào ở BE:
 * đây là một con số phái sinh, tính lại mỗi lần mở, không lưu trữ.
 *
 * `null` khi chưa bản copy nào chạy — "chưa có chuẩn", không phải chuẩn 0%.
 */
export const fetchJourneyBenchmark = async (
  copyIds: string[]
): Promise<JourneyBenchmark | null> => {
  if (copyIds.length === 0) return null;
  const results = await Promise.allSettled(copyIds.map(fetchJourneyStats));
  const measured = results.flatMap(r =>
    r.status === 'fulfilled' && r.value && r.value.sessions > 0 ? [r.value] : []
  );
  if (measured.length === 0) return null;
  const sessions = measured.reduce((sum, s) => sum + s.sessions, 0);
  const completed = measured.reduce((sum, s) => sum + s.completed, 0);
  return {
    cvr: sessions ? (completed / sessions) * 100 : 0,
    sessions,
    runs: measured.length,
    maturity: measured.length >= 3 ? 'established' : 'early',
  };
};

/**
 * Nhãn và độ phủ cho các id trải nghiệm mà node đang trỏ tới.
 *
 * Node chỉ giữ `experience_id`; tên và mức gắn thẻ thuộc về THƯ VIỆN, nên phải
 * hỏi `/experiences`. Không có bước này thì luật "Every linked experience has
 * tracking points" vĩnh viễn trượt — nó đọc một trường không ai điền.
 */
export const fetchExperienceRefs = async (
  ids: string[],
  brandId: string | null
): Promise<ExperienceRefs> => {
  const wanted = new Set(ids.filter(Boolean));
  if (wanted.size === 0) return {};
  try {
    const res = await rexerV2Api.experiences.list({
      state: 'all',
      page_size: 100,
      ...(brandId ? { brand_id: brandId } : {}),
    });
    const out: ExperienceRefs = {};
    (res.items ?? []).forEach(x => {
      if (!wanted.has(x.id)) return;
      out[x.id] = {
        name: x.name,
        // BE BỎ QUA `signal_coverage` với loại không đo được — null nghĩa là
        // chưa đo, không phải 0%.
        coverage:
          typeof x.signal_coverage === 'number'
            ? Math.round(x.signal_coverage * 100)
            : null,
      };
    });
    return out;
  } catch {
    return {};
  }
};
