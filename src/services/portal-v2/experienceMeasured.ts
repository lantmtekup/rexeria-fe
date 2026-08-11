import { v2ToSignalCoverage } from '@/lib/portal-v2/experiences/fromV2';
import type {
  ExperienceStats,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Số ĐO của một trải nghiệm — nạp khi mở chi tiết, không nạp ở danh sách.
 *
 * Bản trước không gọi gì cả: `seed.ts` băm id ra `+45%`, `HIGH CONFIDENCE`,
 * `15,993 sessions`. Các số đó ổn định theo id nên trông như phép đo, và đó
 * mới là chỗ nguy hiểm.
 */

/** Hỏng thì trả null — "chưa đo" đọc đúng hơn một dòng lỗi ở góc màn hình. */
export const fetchExperienceCoverage = async (
  experienceId: string
): Promise<SignalCoverage | null> => {
  try {
    return v2ToSignalCoverage(
      await rexerV2Api.experiences.coverage(experienceId)
    );
  } catch {
    return null;
  }
};

/**
 * `measured:false` ⇒ trả null để pane hiện "chưa chạy".
 *
 * BE gửi kèm sessions/cvr/lift bằng 0 trong trường hợp đó; vẽ chúng ra sẽ đọc
 * như "đã chạy và thua", trong khi sự thật là chưa có lượt nào.
 */
export const fetchExperienceStats = async (
  experienceId: string
): Promise<ExperienceStats | null> => {
  try {
    const s = await rexerV2Api.experiences.stats(experienceId);
    if (!s.measured) return null;
    return {
      sessions: s.sessions,
      // Bốn chặng phễu chưa có endpoint nào trả; để 0 chứ không chia phần trăm
      // từ sessions cho có hình.
      engaged: 0,
      explored: 0,
      convinced: 0,
      converted: 0,
      leads: s.leads,
      revenue: Math.round(s.revenue_cents / 100),
      cvr: s.cvr,
      lift: s.lift ?? 0,
      campaigns: 0,
      campaignNames: [],
      channels: [],
    };
  } catch {
    return null;
  }
};
