/**
 * Intel (spec §8) — số liệu suy từ `fact_daily` lúc đọc, không lưu sẵn.
 */

export type RxIntelSegment = {
  /** `s1`..`s8` — cùng namespace với `ProfilePersona.behaves`. */
  id: string;
  name: string;
  /** 0..1, ĐO ĐƯỢC. 0 = chưa có lượt nào, không phải "phân khúc này nhỏ". */
  share: number;
  sessions: number;
  score: number;
  trend: string;
  tells: string[];
  want: string;
  action: string;
  confidence_tier: string;
};

export type RxIntelSegmentsResponse = { items: RxIntelSegment[] };
