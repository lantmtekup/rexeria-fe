import type { JourneySegment } from '@/lib/portal-v2/journeys/constants';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Hai trục "khách là ai", vốn bị màn Journeys gộp làm một.
 *
 *   Persona — bạn NHẮM ai. Do người soạn chọn, nằm ở `brand_profiles.audience`,
 *             và `journeys.persona_id` đã có sẵn cùng bước kiểm `PersonaExists`.
 *   Segment — khách HÀNH XỬ thế nào. Đo được, `GET /v1/intel/segments`, gắn với
 *             persona qua `ProfilePersona.behaves` (s1..s8, spec §8.6).
 *
 * Dropdown "Primary audience" trước đây liệt kê segment nhưng dán nhãn audience,
 * và lựa chọn đó không đi đâu cả vì `persona_id` bị bỏ trống.
 */

export type PersonaOption = {
  id: string;
  name: string;
  /** Phân khúc hành vi mà chân dung này thuộc về — `s1`..`s8`. */
  behaves: string;
};

/** Chân dung khách của brand. Rỗng ⇒ brand chưa khai hồ sơ, không phải lỗi. */
export const fetchPersonas = async (
  brandId: string | null
): Promise<PersonaOption[]> => {
  if (!brandId) return [];
  try {
    const profile = await rexerV2Api.brandProfile.get(brandId);
    return (profile.audience ?? []).map(p => ({
      id: p.id,
      name: p.name,
      behaves: p.behaves ?? '',
    }));
  } catch {
    return [];
  }
};

/**
 * Phân khúc hành vi kèm số ĐO ĐƯỢC.
 *
 * `share: 0` nghĩa là chưa đo được lượt nào — người gọi phải nói "chưa đo" chứ
 * đừng nhân 0 vào số phiên rồi vẽ một cái phễu bằng không.
 */
export const fetchSegments = async (
  brandId: string | null
): Promise<JourneySegment[]> => {
  try {
    const res = await rexerV2Api.intel.segments(brandId ?? undefined);
    return (res.items ?? []).map(s => ({
      id: s.id,
      n: s.name,
      share: s.share ?? 0,
      sessions: s.sessions ?? 0,
      want: s.want ?? '',
    }));
  } catch {
    return [];
  }
};
