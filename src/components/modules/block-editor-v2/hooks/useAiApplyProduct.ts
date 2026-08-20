'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { pollAiJob } from '@/components/modules/AiAutomation/pollAiJob';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AIApplyProductOutput, Product } from '@/services/rexer/types';

import { applyProductToBlocks } from '../applyProduct';
import { diffCanvas, type CanvasDiff } from '../diffCanvas';
import { mergeAcceptedChanges, type AcceptMap } from '../mergeAcceptedChanges';
import {
  parseCanvas,
  serializeCanvas,
} from '@/components/modules/block-editor/serialize';
import type { Block, Lang } from '@/components/modules/block-editor/types';

/**
 * AI apply-product flow — dùng pipeline THẬT của Automation
 * (`POST /ai/apply-product`, `target_mode: 'rewrite'`), KHÔNG phải
 * `/ai/canvas-templates/:id/apply-product` — endpoint đó đã bị xoá khỏi BE
 * (be-ReXeR.ai commit `2e7a3fa`, bảng `canvas_templates` đã DROP ở migration
 * 000143). Gọi nó chỉ nhận 403 "Internal-only endpoint" rồi rơi về fallback,
 * không hề chạy AI thật — xác nhận bằng test trực tiếp trên production.
 *
 *   1. `commitDraftAsRevision()` — chốt draft hiện tại thành 1 page revision
 *      mới. BE đọc canvas từ REVISION MỚI NHẤT của page (không phải
 *      `draft_canvas_blueprint` — hai cột hoàn toàn tách biệt), nên bỏ qua
 *      bước này thì AI có thể viết đè lên bản cũ hơn những gì đang hiện trên
 *      canvas.
 *   2. Enqueue `POST /ai/apply-product` (cùng usecase Automation dùng để
 *      điền nội dung AI cho từng sản phẩm — `internal/usecase/apply_product.go`,
 *      nhánh `target_mode: 'rewrite'`).
 *   3. Poll `GET /ai/jobs/:id` bằng `pollAiJob` (helper Automation module
 *      đang dùng) tới khi xong.
 *   4. Job KHÔNG trả nội dung canvas trong `output_payload` — chỉ
 *      `{page_id, revision_no, ...}` — nên gọi thêm `GET /pages/:id/revisions`
 *      để lấy `canvas_blueprint` của đúng revision AI vừa ghi.
 *   5. Diff vs bản gốc → mở ReviewChangesDialog như luồng cũ.
 *   6. Lỗi/timeout → fallback mapping cố định phía client (như luồng cũ).
 *
 * Không còn giới hạn "chỉ chạy trên trang Home": endpoint cũ luôn đọc/ghi
 * đúng trang Home của template (không nhận `page_id`); pipeline này nhận
 * thẳng `page_id` của trang đang mở, nên chạy đúng trên bất kỳ trang nào.
 */

export interface ReviewState {
  diff: CanvasDiff;
  aiBlocks: Block[];
  originalBlocks: Block[];
  productName: string;
}

interface UseAiApplyProductArgs {
  pageId: string;
  lang: Lang;
  /** Current blocks snapshot for the diff baseline + fallback merge. */
  getBlocks: () => Block[];
  /** Current active block id — used in the debug payload when AI fails. */
  getActiveId: () => string | null;
  /** Current publish meta — used in the debug payload. */
  getPublish: () => unknown;
  /** Push to history then replace the ACTIVE PAGE's blocks. */
  applyBlocks: (next: Block[], nextActiveId?: string | null) => void;
  /** Trigger autosave after blocks change. */
  markDirty: () => void;
  /**
   * Chốt draft hiện tại thành 1 page revision mới, trả về `revisionNo` vừa
   * tạo. Xem docstring đầu file — BE apply-product (rewrite) đọc canvas từ
   * revision mới nhất, một cột tách biệt khỏi `draft_canvas_blueprint`.
   */
  commitDraftAsRevision: () => Promise<{ revisionNo: number }>;
}

export interface UseAiApplyProductApi {
  applying: boolean;
  reviewState: ReviewState | null;
  /** Kick off the AI flow. Opens review dialog on success. */
  applyProduct: (product: Product) => Promise<void>;
  /** Confirm + merge selected changes. */
  acceptReviewed: (accept: AcceptMap) => void;
  /** Close review without applying anything. */
  cancelReview: () => void;
}

export function useAiApplyProduct({
  pageId,
  lang,
  getBlocks,
  getActiveId,
  getPublish,
  applyBlocks,
  markDirty,
  commitDraftAsRevision,
}: UseAiApplyProductArgs): UseAiApplyProductApi {
  const [applying, setApplying] = React.useState(false);
  const [reviewState, setReviewState] = React.useState<ReviewState | null>(
    null
  );

  const applyProduct = React.useCallback(
    async (product: Product) => {
      if (applying) return;
      setApplying(true);
      const toastId = toast.loading(`AI đang phân tích "${product.name}"…`);
      const originalBlocks = structuredClone(getBlocks());
      let jobId: string | undefined;

      try {
        await commitDraftAsRevision();

        const job = await rexerApi.aiJobs.applyProduct({
          product_id: product.id,
          target_mode: 'rewrite',
          page_id: pageId,
          lang,
        });
        jobId = job.id;

        const done = await pollAiJob(job.id, {
          onTick: j => {
            if (j.status === 'running') {
              toast.loading(`AI đang viết lại nội dung "${product.name}"…`, {
                id: toastId,
              });
            }
          },
        });

        if (done.status !== 'succeeded') {
          throw new Error(done.error_message || 'AI job failed');
        }

        const output = done.output_payload as unknown as
          | AIApplyProductOutput
          | undefined;
        if (!output?.revision_no) {
          throw new Error('AI job succeeded but returned no revision_no');
        }

        // Job không trả canvas_blueprint — đọc lại revision nó vừa ghi.
        const revs = await rexerApi.pages.revisions(pageId, { limit: 1 });
        const latest = revs.items?.[0];
        if (!latest || latest.revision_no !== output.revision_no) {
          throw new Error('Không đọc lại được revision AI vừa tạo');
        }

        const parsed = parseCanvas(latest.canvas_blueprint);
        if (!parsed?.blocks.length) {
          throw new Error('Revision AI trả về rỗng');
        }

        const diff = diffCanvas(originalBlocks, parsed.blocks, lang);
        if (diff.totalChanges === 0) {
          toast.info('AI không đề xuất thay đổi nào — canvas giữ nguyên.', {
            id: toastId,
          });
          return;
        }
        setReviewState({
          diff,
          aiBlocks: parsed.blocks,
          originalBlocks,
          productName: product.name,
        });
        toast.dismiss(toastId);
      } catch (err) {
        // Build a debug payload that the user can paste straight into a BE
        // ticket without DevTools gymnastics.
        const isRx = err instanceof RxApiError;
        const debugPayload = {
          endpoint: "POST /v1/ai/apply-product (target_mode: 'rewrite')",
          jobId,
          request: { product_id: product.id, page_id: pageId, lang },
          response: isRx
            ? {
                status: err.status,
                code: err.code,
                message: err.message,
                details: err.details,
                request_id: err.requestId,
              }
            : { error: err instanceof Error ? err.message : String(err) },
          context: {
            page_id: pageId,
            blocks_in_memory: getBlocks().length,
            active_block_id: getActiveId(),
            product: { id: product.id, name: product.name },
          },
          canvas_data_inmemory: serializeCanvas(
            getBlocks(),
            getActiveId() ?? undefined,
            getPublish() as never
          ),
        };
        // eslint-disable-next-line no-console
        console.groupCollapsed(
          `%c[apply-product FAILED] ${isRx ? `${err.status} ${err.code}` : 'unknown'}`,
          'color:#dc2626;font-weight:600'
        );
        // eslint-disable-next-line no-console
        console.log('Copy this for BE:', debugPayload);
        // eslint-disable-next-line no-console
        console.log(
          'JSON (copy from here):',
          JSON.stringify(debugPayload, null, 2)
        );
        // eslint-disable-next-line no-console
        console.groupEnd();

        // Client-side deterministic fallback so user gets SOMETHING.
        applyBlocks(applyProductToBlocks(getBlocks(), product));
        markDirty();
        toast.error(
          `AI thất bại (${err instanceof Error ? err.message : 'unknown'}) — đã fill bằng mapping mặc định`,
          {
            id: toastId,
            duration: 12000,
            action: {
              label: 'Copy debug',
              onClick: () => {
                const text = JSON.stringify(debugPayload, null, 2);
                const done = () => toast.success('Đã copy debug payload');
                if (navigator.clipboard?.writeText) {
                  navigator.clipboard.writeText(text).then(done, () => {
                    // eslint-disable-next-line no-console
                    console.log('Clipboard blocked — payload:', text);
                    toast.info('Clipboard bị block — payload trong console');
                  });
                } else {
                  // eslint-disable-next-line no-console
                  console.log(text);
                  toast.info('Payload đã in ra console (F12)');
                }
              },
            },
          }
        );
      } finally {
        setApplying(false);
      }
    },
    [
      applying,
      pageId,
      lang,
      getBlocks,
      getActiveId,
      getPublish,
      applyBlocks,
      markDirty,
      commitDraftAsRevision,
    ]
  );

  const acceptReviewed = React.useCallback(
    (accept: AcceptMap) => {
      if (!reviewState) return;
      const { aiBlocks, originalBlocks, productName } = reviewState;
      const merged = mergeAcceptedChanges(originalBlocks, aiBlocks, accept);
      let acceptedFields = 0;
      for (const [, groups] of accept) acceptedFields += groups.size;
      // If the active id disappeared in the merge result, hand back the first
      // block as the new active.
      const nextActiveId = merged.find(b => b.id === getActiveId())
        ? undefined
        : (merged[0]?.id ?? null);
      applyBlocks(merged, nextActiveId);
      markDirty();
      setReviewState(null);
      toast.success(
        `Đã áp dụng ${acceptedFields} nhóm thay đổi từ "${productName}"`
      );
    },
    [reviewState, applyBlocks, markDirty, getActiveId]
  );

  const cancelReview = React.useCallback(() => setReviewState(null), []);

  return {
    applying,
    reviewState,
    applyProduct,
    acceptReviewed,
    cancelReview,
  };
}
