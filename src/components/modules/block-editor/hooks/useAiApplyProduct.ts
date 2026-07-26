'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Product } from '@/services/rexer/types';

import { applyProductToBlocks } from '../applyProduct';
import { diffCanvas, type CanvasDiff } from '../diffCanvas';
import { mergeAcceptedChanges, type AcceptMap } from '../mergeAcceptedChanges';
import { parseCanvas, serializeCanvas } from '../serialize';
import type { Block, Lang } from '../types';

/**
 * AI apply-product flow:
 *   1. Snapshot original blocks (for diff baseline).
 *   2. POST /v1/ai/canvas-templates/:id/apply-product.
 *   3. Diff AI output vs original → open ReviewChangesDialog.
 *   4. On user accept → merge selected (block, group) pairs → update blocks.
 *   5. On AI failure → fall back to deterministic client mapping so user
 *      still gets something.
 *
 * The hook owns the per-product loading state and the review dialog state.
 * Callers wire `setBlocks` + `markDirty` so the merge step lands in canvas.
 */

export interface ReviewState {
  diff: CanvasDiff;
  aiBlocks: Block[];
  originalBlocks: Block[];
  productName: string;
}

interface UseAiApplyProductArgs {
  templateId: string;
  lang: Lang;
  /** Current blocks snapshot for the diff baseline + fallback merge. */
  getBlocks: () => Block[];
  /** ETag the BE expects for concurrency. */
  getCanvasEtag: () => string | undefined;
  /** Current active block id — used in the debug payload when AI fails. */
  getActiveId: () => string | null;
  /** Current publish meta — used in the debug payload. */
  getPublish: () => unknown;
  /** Push to history then replace the ACTIVE PAGE's blocks. */
  applyBlocks: (next: Block[], nextActiveId?: string | null) => void;
  /**
   * Whether the active page is the home page.
   *
   * The BE endpoint takes only `product_id` + etag and reads its own stored
   * canvas, which under the multi-page mirror is the home page's blocks. So it
   * would silently diff the AI result against whichever page the user is on
   * and overwrite it with home's content. Block the flow until BE accepts a
   * `page_id`.
   */
  isHomePage?: () => boolean;
  /** Trigger autosave after blocks change. */
  markDirty: () => void;
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
  templateId,
  lang,
  getBlocks,
  getCanvasEtag,
  getActiveId,
  getPublish,
  applyBlocks,
  isHomePage,
  markDirty,
}: UseAiApplyProductArgs): UseAiApplyProductApi {
  const [applying, setApplying] = React.useState(false);
  const [reviewState, setReviewState] = React.useState<ReviewState | null>(
    null
  );

  const applyProduct = React.useCallback(
    async (product: Product) => {
      if (applying) return;
      if (isHomePage && !isHomePage()) {
        toast.error(
          'AI áp sản phẩm hiện chỉ chạy trên trang chủ — chuyển về trang chủ rồi thử lại.'
        );
        return;
      }
      setApplying(true);
      const toastId = toast.loading(`AI đang phân tích "${product.name}"…`);
      const requestBody = {
        product_id: product.id,
        lang,
        preserve_user_overrides: true,
        expected_canvas_etag: getCanvasEtag(),
      };
      const originalBlocks = structuredClone(getBlocks());
      try {
        const res = await rexerApi.ai.canvasApplyProduct(
          templateId,
          requestBody
        );
        const parsed = parseCanvas(res.canvas_data);
        if (!parsed?.blocks.length) {
          throw new Error('BE returned empty canvas_data');
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
          endpoint: `POST /v1/ai/canvas-templates/${templateId}/apply-product`,
          request: requestBody,
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
            template_id: templateId,
            canvas_etag: getCanvasEtag(),
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
      templateId,
      lang,
      getBlocks,
      getCanvasEtag,
      getActiveId,
      getPublish,
      applyBlocks,
      isHomePage,
      markDirty,
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
