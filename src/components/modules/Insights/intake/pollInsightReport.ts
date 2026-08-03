import { rexerApi } from '@/services/rexer/endpoints';
import type { InsightReport } from '@/services/rexer/types';

/**
 * Poll 1 insight report tới khi `succeeded`/`failed` (hoặc timeout).
 *
 * Wizard `guided`/`quick` poll bằng hook `useInsightReport` vì chúng render một
 * màn `generating` riêng. Màn "Từ template" chạy 3 bước liên tiếp trong CÙNG một
 * hàm async (report → handoff) nên cần dạng imperative — cùng lý do và cùng
 * hình dạng với `pollAiJob` của AI-Automation.
 *
 * Timeout để rộng: engine chạy 5 bước LLM, thực đo 40–90s và có lúc chạm 2 phút
 * khi BE bận. Cắt sớm là bỏ đi một report đã tốn tiền token mà vẫn đang chạy.
 */
export async function pollInsightReport(
  reportId: string,
  opts?: {
    intervalMs?: number;
    timeoutMs?: number;
    onTick?: (report: InsightReport) => void;
  }
): Promise<InsightReport> {
  const interval = opts?.intervalMs ?? 2000;
  const timeout = opts?.timeoutMs ?? 240_000;
  const start = Date.now();

  for (;;) {
    const report = await rexerApi.insights.get(reportId);
    opts?.onTick?.(report);
    if (report.status === 'succeeded' || report.status === 'failed') {
      return report;
    }
    if (Date.now() - start > timeout) {
      return {
        ...report,
        status: 'failed',
        error_message: 'Hết thời gian chờ (timeout)',
      };
    }
    await new Promise(r => setTimeout(r, interval));
  }
}
