import { rexerApi } from '@/services/rexer/endpoints';
import type { AIJob } from '@/services/rexer/types';

/**
 * Poll 1 AI job tới khi `succeeded`/`failed` (hoặc timeout). Dùng cho luồng
 * bất đồng bộ AI-Automation: enqueue → poll `GET /v1/ai/jobs/{id}`.
 */
export async function pollAiJob(
  jobId: string,
  opts?: {
    intervalMs?: number;
    timeoutMs?: number;
    onTick?: (job: AIJob) => void;
  }
): Promise<AIJob> {
  const interval = opts?.intervalMs ?? 1500;
  const timeout = opts?.timeoutMs ?? 90_000;
  const start = Date.now();

  for (;;) {
    const job = await rexerApi.aiJobs.get(jobId);
    opts?.onTick?.(job);
    if (job.status === 'succeeded' || job.status === 'failed') return job;
    if (Date.now() - start > timeout) {
      return {
        ...job,
        status: 'failed',
        error_message: 'Hết thời gian chờ (timeout)',
      };
    }
    await new Promise(r => setTimeout(r, interval));
  }
}
