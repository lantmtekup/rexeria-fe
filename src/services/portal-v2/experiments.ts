import { experimentFromRx } from '@/lib/portal-v2/experiments/fromRx';
import { MOCK_EXPERIMENTS } from '@/lib/portal-v2/experiments/mock';
import type {
  Experiment,
  ExperimentsData,
} from '@/lib/portal-v2/experiments/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Experiments — ĐƯỜNG THẬT `GET /v1/experiments` (BE scope theo principal,
 * `brand_id` là override admin kiểu audit). API lỗi (BE chưa ship nhánh
 * experiments / mất mạng) → demo mock với `live:false`, không để trắng màn.
 *
 * List rỗng mà đọc ĐƯỢC là chuyện thật của một brand chưa chạy thử nghiệm —
 * trả `live:true` + items rỗng để màn hiện empty state (FR-E4 trỏ về
 * Drop-off), KHÔNG lấp bằng mock.
 */

export type ExperimentsBundle = {
  experiments: Experiment[];
  /** Kinh tế mock (stages/opps/aov) cho các tile tiền — chỉ ở demo. */
  demoData: ExperimentsData | null;
  live: boolean;
  error: string | null;
};

export const fetchExperiments = async (
  query: { brandId?: string | null } = {}
): Promise<ExperimentsBundle> => {
  try {
    const res = await rexerV2Api.experiments.list(
      query.brandId ? { brand_id: query.brandId } : {}
    );
    return {
      experiments: (res.items ?? []).map(experimentFromRx),
      demoData: null,
      live: true,
      error: null,
    };
  } catch (err) {
    return {
      experiments: structuredClone(MOCK_EXPERIMENTS.experiments),
      demoData: structuredClone(MOCK_EXPERIMENTS),
      live: false,
      error: err instanceof Error ? err.message : 'Failed to load experiments',
    };
  }
};
