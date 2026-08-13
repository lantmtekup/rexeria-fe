import { v2ToExperienceView } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

export type ExperienceLibraryQuery = {
  /** Tìm toàn văn — đẩy xuống server qua `q`. */
  q?: string;
  /** Giới hạn theo thương hiệu; chỉ platform admin dùng được. */
  brandId?: string | null;
};

export type ExperienceLibraryResult = {
  items: ExperienceView[];
  error: string | null;
};

/** Trần CỨNG của BE: `normalizePage` cắt mọi `page_size` xuống 100. */
const SERVER_PAGE_MAX = 100;
/** Chặn vòng lặp — 10 trang là 1000 mục, quá xa mọi thư viện thật. */
const MAX_PAGES = 10;

/**
 * Ba `state` hợp thành "trang của brand này".
 *
 * BE không có state nào gộp sẵn mọi bản copy: `unassigned` là copy chưa gắn
 * chiến dịch, còn `product_copies` / `topic_copies` là copy đã nộp vào một
 * hạng mục. Cộng ba cái mới ra đủ.
 *
 * KHÔNG dùng `state: 'all'`: nó gộp cả template và block — thứ thuộc về màn
 * Exchange, không phải thư viện của brand. Đo trên dữ liệu thật:
 * `all` = 320 (171 template + ~146 block + 3 copy), trong khi cái người dùng
 * vào đây để tìm chỉ có 3.
 */
const COPY_STATES = ['unassigned', 'product_copies', 'topic_copies'] as const;

/**
 * Thư viện trải nghiệm ← `GET /v1/experiences`.
 *
 * Bản trước suy từ `GET /pages?type=landing&status=published`, và đó là hai
 * vấn đề gộp làm một:
 *
 * 1. Bộ lọc `published` cắt mất phần lớn thư viện — một brand có 33 landing
 *    page mà chỉ 3 cái published thì màn hình hiện 3, trông như mất dữ liệu.
 *    `/experiences` trả cả template lẫn bản copy, không lọc theo trạng thái.
 * 2. Trục sở hữu (template / product copy / topic copy), bậc bằng chứng, số
 *    phiên, độ phủ — `/pages` không có gì trong số đó, nên bản cũ BỊA bằng
 *    hàm băm id. Các số đó ổn định theo id nên đọc như phép đo thật.
 *
 * Nay `kind`, `subject`, `ev`, `signal_coverage` đều là dữ liệu; thiếu thì để
 * null và UI nói "chưa đo".
 *
 * Không có `'use client'`: hàm này chạy ở server component cho lần vẽ đầu, và
 * chạy lại từ workspace khi người dùng gõ tìm kiếm.
 */
export const fetchExperienceLibrary = async (
  query: ExperienceLibraryQuery = {}
): Promise<ExperienceLibraryResult> => {
  const common = {
    ...(query.q?.trim() ? { q: query.q.trim() } : {}),
    ...(query.brandId ? { brand_id: query.brandId } : {}),
  };

  /** Một `state`, lặp hết trang của nó. */
  const fetchState = async (state: string) => {
    // Phải lặp trang: xin `page_size: 200` thì BE trả 100 và KHÔNG báo gì —
    // màn hình sẽ hiện 100/110 mà trông như đã đủ.
    const first = await rexerV2Api.experiences.list({
      ...common,
      state,
      page: 1,
      page_size: SERVER_PAGE_MAX,
    });
    const items = [...(first.items ?? [])];
    const pages = Math.min(
      Math.ceil((first.total ?? items.length) / SERVER_PAGE_MAX),
      MAX_PAGES
    );
    if (pages > 1) {
      const rest = await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
          rexerV2Api.experiences.list({
            ...common,
            state,
            page: i + 2,
            page_size: SERVER_PAGE_MAX,
          })
        )
      );
      rest.forEach(r => items.push(...(r.items ?? [])));
    }
    return items;
  };

  try {
    const chunks = await Promise.all(COPY_STATES.map(fetchState));

    // Khử trùng theo id: ba state đáng lẽ rời nhau, nhưng dựa vào điều đó là
    // đặt cược vào một chi tiết BE có thể đổi. Trùng thì giữ bản gặp trước.
    const seen = new Set<string>();
    const items = chunks.flat().filter(x => {
      if (seen.has(x.id)) return false;
      seen.add(x.id);
      return true;
    });

    return { items: items.map(v2ToExperienceView), error: null };
  } catch (err) {
    return {
      items: [],
      error: err instanceof Error ? err.message : 'Failed to load experiences',
    };
  }
};
