'use client';

import { useState } from 'react';
import { rexerApi } from '@/services/rexer/endpoints';
import type { CreateInsightReportBody } from '@/services/rexer/types';

/**
 * Các phase của wizard AI-Insights:
 * - `setup`: chọn workspace/product/campaign, prefill context, điền field còn thiếu.
 * - `generating`: đã enqueue job, đang poll report cho tới khi terminal.
 * - `blueprint`: report đã succeeded/failed, hiển thị blueprint hoặc lỗi.
 */
export type FlowPhase = 'setup' | 'generating' | 'blueprint';

/**
 * State machine điều phối luồng tạo insight report. Không tự poll — việc poll
 * report do `useInsightReport` trong container đảm nhiệm; hook này chỉ giữ
 * `reportId` + `phase` và lo khâu enqueue.
 */
export function useInsightsFlow() {
  const [phase, setPhase] = useState<FlowPhase>('setup');
  const [reportId, setReportId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Gửi request tạo report (enqueue job `experience_insights`). BE trả 202 kèm
   * report ở status `queued`; ta lưu id rồi chuyển sang phase `generating` để
   * container bắt đầu poll. Lỗi được giữ lại để màn setup hiển thị.
   */
  async function run(body: CreateInsightReportBody): Promise<void> {
    setSubmitting(true);
    setError(null);
    try {
      // `rexerApi.insights.create` đã unwrap `{ report }` → trả thẳng report.
      const report = await rexerApi.insights.create(body);
      setReportId(report.id);
      setPhase('generating');
    } catch (err) {
      setError(err as Error);
    } finally {
      setSubmitting(false);
    }
  }

  /** Quay về màn setup để tạo report mới (dùng cho nút "Tạo lại"). */
  function reset(): void {
    setReportId(null);
    setError(null);
    setPhase('setup');
  }

  return { phase, setPhase, reportId, submitting, error, run, reset };
}
