import { briefFromProduct } from '@/lib/portal-v2/automation/briefFromProduct';
import { productImageUrls } from '@/services/portal-v2/productBrief';
import type { AutomationProduct } from '@/lib/portal-v2/automation/types';
import { pollInsightReport } from '@/components/modules/Insights/intake/pollInsightReport';
import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Nhân bản một thiết kế sang N sản phẩm — luồng THẬT, dùng API insight.
 *
 * Mỗi sản phẩm đi trọn ba chặng, đúng chuỗi mà luồng "Từ template" của v1 đã
 * chạy được:
 *
 *   insights.create({ inputs: brief từ record sản phẩm })
 *     → pollInsightReport
 *     → insights.handoff({ source_template_id: MASTER, publish: false })
 *     → pages.create(draft)
 *
 * `source_template_id` trỏ vào MASTER (bản đã chỉnh tay), không phải template
 * gốc — đó là điểm mấu chốt của cả module: mọi bản copy thừa hưởng thay đổi
 * của người dùng.
 *
 * `publish: false` — bản copy dừng ở nháp. Plan yêu cầu "copy chưa gắn chiến
 * dịch", và trang tự lên sóng khi người dùng chưa xem là điều không ai muốn.
 *
 * CHẠY TUẦN TỰ, cố ý. Mỗi lượt là 6–8 lời gọi LLM và BE viết từng block nối
 * tiếp; bắn song song chỉ làm cạn quota nhanh hơn chứ không nhanh hơn thật.
 */

export type RunProgress = {
  productId: string;
  productTitle: string;
  /** Vị trí trong hàng đợi, tính từ 1. */
  index: number;
  total: number;
  stage: 'report' | 'writing' | 'page' | 'done' | 'failed';
  error?: string;
};

export type RunOutcome = {
  productId: string;
  productTitle: string;
  pageId?: string;
  pageSlug?: string;
  templateId?: string;
  error?: string;
};

/**
 * Trần số sản phẩm mỗi lượt.
 *
 * Mỗi sản phẩm mất 1–3 phút và luồng chạy đồng bộ trong tab — 5 cái đã là ~10
 * phút giữ tab mở. Cao hơn nữa thì gần như chắc chắn có người đóng tab giữa
 * chừng và mất trắng phần token đã tiêu. Muốn hơn thì phải chuyển sang job nền.
 */
export const AUTOMATION_BATCH_CAP = 5;

export const runAutomation = async ({
  workspaceId,
  sourceTemplateId,
  experienceName,
  products,
  onProgress,
}: {
  workspaceId: string;
  /** Template của MASTER — bản người dùng đã chỉnh. */
  sourceTemplateId: string;
  experienceName: string;
  products: AutomationProduct[];
  onProgress?: (p: RunProgress) => void;
}): Promise<RunOutcome[]> => {
  const queue = products.slice(0, AUTOMATION_BATCH_CAP);
  const results: RunOutcome[] = [];

  for (let i = 0; i < queue.length; i += 1) {
    const product = queue[i]!;
    const base = {
      productId: product.id,
      productTitle: product.title,
      index: i + 1,
      total: queue.length,
    };
    const pageName = `${experienceName} — ${product.title}`;

    try {
      onProgress?.({ ...base, stage: 'report' });

      // Lấy TOÀN BỘ ảnh của sản phẩm, không chỉ ảnh bìa: khuôn có nhiều ô ảnh,
      // cấp một tấm thì AI phải dùng lại tấm đó cho mọi ô.
      const media = await productImageUrls(product.id);

      const report = await rexerApi.insights.create({
        workspace_id: workspaceId,
        title: pageName,
        inputs: {
          brief_text: briefFromProduct(product),
          // BE đọc ảnh brief ở khoá `media` (briefMedia,
          // insight_block_schema.go) — KHÔNG đọc `image_urls`.
          ...(media.length ? { media } : {}),
          source: 'automation',
        },
      });

      const done = await pollInsightReport(report.id);
      if (done.status !== 'succeeded') {
        throw new Error(done.error_message || 'REPORT_FAILED');
      }

      onProgress?.({ ...base, stage: 'writing' });
      const handoff = await rexerApi.insights.handoff(done.id, {
        template: { name: pageName, source_template_id: sourceTemplateId },
        publish: false,
        workspace_id: workspaceId,
      });

      onProgress?.({ ...base, stage: 'page' });
      const page = await rexerApi.pages.create(workspaceId, {
        type: 'landing',
        template_id: handoff.template_id,
        name: pageName,
      });

      onProgress?.({ ...base, stage: 'done' });
      results.push({
        productId: product.id,
        productTitle: product.title,
        pageId: page.id,
        pageSlug: page.slug,
        templateId: handoff.template_id,
      });
    } catch (err) {
      // Một sản phẩm hỏng KHÔNG dừng cả hàng đợi: những cái sau vẫn chạy, và
      // cái hỏng được ghi lại để báo đích danh ở cuối.
      const message = err instanceof Error ? err.message : String(err);
      onProgress?.({ ...base, stage: 'failed', error: message });
      results.push({
        productId: product.id,
        productTitle: product.title,
        error: message,
      });
    }
  }

  return results;
};
