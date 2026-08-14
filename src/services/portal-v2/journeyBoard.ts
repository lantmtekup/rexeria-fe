import { journeyToV2, v2ToJourney } from '@/lib/portal-v2/journeys/fromV2';
import type { Journey } from '@/lib/portal-v2/journeys/types';
import { RxApiError } from '@/services/rexer/client';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Hành trình ← `/v1/journeys`, thay `MOCK_JOURNEYS`.
 *
 * `version` là khoá lạc quan: `PUT` phải gửi đúng số vừa đọc, lệch thì BE từ
 * chối. Shape UI không mang trường đó, nên giữ riêng ở đây theo id.
 */

const PAGE_LIMIT = 100;

export type JourneyBoardResult = {
  items: Journey[];
  /** version theo id — cần cho lần PUT kế tiếp. */
  versions: Record<string, number>;
  error: string | null;
};

export const fetchJourneyBoard = async (
  query: {
    brandId?: string | null;
    campaignId?: string;
  } = {}
): Promise<JourneyBoardResult> => {
  try {
    const res = await rexerV2Api.journeys.list({
      limit: PAGE_LIMIT,
      ...(query.brandId ? { brand_id: query.brandId } : {}),
      ...(query.campaignId ? { campaign_id: query.campaignId } : {}),
    });
    const rows = res.items ?? [];
    return {
      items: rows.map(x => v2ToJourney(x)),
      versions: Object.fromEntries(rows.map(x => [x.id, x.version])),
      error: null,
    };
  } catch (err) {
    return {
      items: [],
      versions: {},
      error: err instanceof Error ? err.message : 'Failed to load journeys',
    };
  }
};

export const createJourney = async (
  draft: Journey,
  brandId: string | null
): Promise<{ journey: Journey; version: number }> => {
  const saved = await rexerV2Api.journeys.create(
    journeyToV2(draft, { brandId })
  );
  return { journey: v2ToJourney(saved), version: saved.version };
};

/**
 * Lý do BE từ chối, đọc được cho người dùng.
 *
 * `PUT` là một lần commit nguyên khối: `validateGraph` chạy TOÀN BỘ hợp đồng đồ
 * thị, nên một bản nháp đang dựng dở sẽ bị từ chối 422 kèm danh sách kiểm.
 * Gộp chúng thành một câu "không lưu được" là vứt đi đúng phần người dùng cần.
 */
export const saveFailureReasons = (
  err: unknown,
  /**
   * `key → tên hiển thị`. BE gọi node bằng KHOÁ (`n3`), thứ không xuất hiện ở
   * đâu trên canvas — đọc "node n3" thì không biết phải sửa cái nào.
   */
  nodeNames: Record<string, string> = {}
): string[] => {
  if (!(err instanceof RxApiError)) return [];
  const details = err.details as
    | { errors?: { message?: string; node_key?: string }[] }
    | undefined;
  return (details?.errors ?? [])
    .map(e => {
      const msg = e.message ?? '';
      const name = e.node_key ? nodeNames[e.node_key] : undefined;
      return name && e.node_key ? msg.split(e.node_key).join(`“${name}”`) : msg;
    })
    .filter(m => m.length > 0);
};

/**
 * Lưu. `version` lệch ⇒ BE từ chối và ném lỗi — ĐỪNG nuốt nó: người dùng cần
 * biết bản của họ đã cũ, thay vì tưởng đã lưu xong.
 */
export const saveJourney = async (
  j: Journey,
  version: number
): Promise<{ journey: Journey; version: number }> => {
  const saved = await rexerV2Api.journeys.update(j.id, {
    ...journeyToV2(j),
    version,
  });
  return { journey: v2ToJourney(saved), version: saved.version };
};

/** Fork blueprint lên chiến dịch — một chiến dịch, một hành trình. */
export const useJourney = async (
  journeyId: string,
  campaignId: string
): Promise<{ journey: Journey; version: number }> => {
  const fork = await rexerV2Api.journeys.use(journeyId, campaignId);
  return { journey: v2ToJourney(fork), version: fork.version };
};

export const promoteJourney = async (
  journeyId: string,
  name: string
): Promise<{ journey: Journey; version: number }> => {
  const bp = await rexerV2Api.journeys.promote(journeyId, name);
  return { journey: v2ToJourney(bp), version: bp.version };
};

export const duplicateJourney = async (
  journeyId: string
): Promise<{ journey: Journey; version: number }> => {
  const copy = await rexerV2Api.journeys.duplicate(journeyId);
  return { journey: v2ToJourney(copy), version: copy.version };
};

/** Trả về id KHÔNG xoá được, để màn hình chỉ bỏ đi thứ server đã xoá thật. */
export const deleteJourneys = async (ids: string[]): Promise<string[]> => {
  const results = await Promise.allSettled(
    ids.map(id => rexerV2Api.journeys.remove(id))
  );
  return ids.filter((_, i) => results[i]?.status === 'rejected');
};
