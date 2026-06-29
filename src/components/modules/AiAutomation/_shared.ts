import type {
  AIApplyProductOutput,
  AIChannel,
  AIJobStatus,
} from '@/services/rexer/types';

export type Step = 'template' | 'product' | 'running' | 'results';
export type RunStatus = AIJobStatus | 'enqueuing';

export interface RunItem {
  productId: string;
  productName: string;
  status: RunStatus;
  jobId?: string;
  output?: AIApplyProductOutput;
  error?: string;
}

export const CHANNELS: { id: AIChannel; label: string }[] = [
  { id: 'ad', label: 'Ad' },
  { id: 'email', label: 'Email' },
  { id: 'curate', label: 'Curate' },
  { id: 'landing', label: 'Landing' },
];

// Portal review-only (Phase 1) → mở bản xem trước landing đã tạo.
export const PREVIEW_HREF = (pageId: string) =>
  `/portal/landing-pages/${pageId}/preview`;
