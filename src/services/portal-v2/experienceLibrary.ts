import { v2ToExperienceView } from '@/lib/portal-v2/experiences/fromV2';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { rexerApi } from '@/services/rexer/endpoints';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type { RxExperience } from '@/services/rexer-v2/types/experience';

export type ExperienceLibraryQuery = {
  /** Tìm toàn văn — đẩy xuống server qua `q`. */
  q?: string;
  /** Giới hạn theo thương hiệu; chỉ platform admin dùng được. */
  brandId?: string | null;
  /**
   * Xếp theo BẰNG CHỨNG thay vì theo ngày sửa (`sort=shelf_rank`).
   *
   * Đổi luôn cách nạp, không chỉ thêm một tham số — xem `fetchRanked`.
   */
  rank?: boolean;
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
export const COPY_STATES = [
  'unassigned',
  'product_copies',
  'topic_copies',
] as const;

/** `GET /v1/templates` — 79 bản ghi thật, một trang là đủ. */
const TEMPLATE_LOOKUP_LIMIT = 200;

/** `GET /v1/blocks` — đo thật ~146 bản ghi (brand + hệ thống gộp), một trang là đủ. */
const BLOCK_LOOKUP_LIMIT = 200;

/**
 * Id của những template DO CHÍNH BRAND NÀY sở hữu.
 *
 * Phải hỏi `GET /v1/templates` (v1) chứ không hỏi `/experiences`: repository
 * gộp `brand_id IS NULL OR brand_id = ?` rồi trả ra một danh sách phẳng, và
 * `RxExperience` KHÔNG mang `brand_id` — nên từ v2 không cách nào tách template
 * hệ thống khỏi template của brand. `models.Template` thì có `brand_id`, và
 * `null` ở đó nghĩa là hàng của hệ thống.
 *
 * Hỏng thì trả `null` (KHÔNG phải set rỗng): rỗng đọc như "brand không sở hữu
 * template nào", và cả 79 template hệ thống sẽ bị loại đúng như mong muốn —
 * nhưng bản copy của người dùng cũng biến mất mà không ai báo gì.
 */
export const fetchOwnTemplateIds = async (): Promise<Set<string> | null> => {
  try {
    const res = await rexerApi.templates.list({
      page: 1,
      limit: TEMPLATE_LOOKUP_LIMIT,
    });
    return new Set(
      (res.items ?? [])
        .filter(t => (t as { brand_id?: string | null }).brand_id)
        .map(t => t.id)
    );
  } catch {
    return null;
  }
};

/**
 * Id của những block DO CHÍNH BRAND NÀY sở hữu — cùng lý do với
 * `fetchOwnTemplateIds`: `GET /v1/blocks` (v1) có `scope`/`brand_id`, còn
 * `RxExperience` (v2) thì không, nên phải tra chéo sang v1 để tách hàng của
 * brand khỏi hàng hệ thống (`scope: 'system'`).
 *
 * Hỏng thì trả `null` (KHÔNG phải set rỗng) — cùng lý do: rỗng đọc như "brand
 * không sở hữu block nào" và ẩn luôn cả block người dùng vừa fork từ Exchange.
 */
export const fetchOwnBlockIds = async (): Promise<Set<string> | null> => {
  try {
    const res = await rexerApi.blocks.list({
      page: 1,
      limit: BLOCK_LOOKUP_LIMIT,
    });
    return new Set(
      (res.items ?? []).filter(b => b.scope !== 'system').map(b => b.id)
    );
  } catch {
    return null;
  }
};

/**
 * Một truy vấn `/v1/experiences`, lặp hết trang của nó.
 *
 * Export ra module-scope (thay vì closure riêng trong `fetchExperienceLibrary`)
 * để `fetchCampaignExperienceLibrary` dùng chung đúng một đường lấy dữ liệu
 * brand-scoped — tránh lặp lại (và lệch) cùng một logic phân trang ở hai nơi.
 */
const fetchExperiencePages = async (
  query: Record<string, string | number | undefined>
): Promise<RxExperience[]> => {
  const page = (n: number) =>
    rexerV2Api.experiences.list({
      ...query,
      page: n,
      page_size: SERVER_PAGE_MAX,
    });
  // Phải lặp trang: xin `page_size: 200` thì BE trả 100 và KHÔNG báo gì —
  // màn hình sẽ hiện 100/110 mà trông như đã đủ.
  const first = await page(1);
  const items = [...(first.items ?? [])];
  const pages = Math.min(
    Math.ceil((first.total ?? items.length) / SERVER_PAGE_MAX),
    MAX_PAGES
  );
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => page(i + 2))
    );
    rest.forEach(r => items.push(...(r.items ?? [])));
  }
  return items;
};

export const fetchExperienceState = (
  common: { q?: string; brand_id?: string },
  state: string,
  sort?: string
): Promise<RxExperience[]> =>
  fetchExperiencePages({ ...common, state, ...(sort ? { sort } : {}) });

/**
 * `category: 'blocks'` — chỉ nạp khi caller đã tự lọc lại theo `ownIds`
 * (`fetchOwnBlockIds`): BE trả brand + hệ thống gộp (`ListBlocks`,
 * `brand_id = ? OR scope = system`), và `RxExperience` không mang `brand_id`
 * để tách ở đây.
 */
const fetchExperienceCategory = (
  common: { q?: string; brand_id?: string },
  category: string
): Promise<RxExperience[]> => fetchExperiencePages({ ...common, category });

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

  const fetchState = (state: string, sort?: string) =>
    fetchExperienceState(common, state, sort);

  /**
   * Template CỦA CHÍNH BRAND — bản sao mà `Duplicate` sinh ra sống ở đây.
   *
   * Nhân bản một copy cho ra một **template nháp** (`promotePage`,
   * `experience.go:831`), nên nó không rơi vào ba state copy. Trước đây nó cũng
   * không hiện ở Exchange (màn đó lọc `status: 'active'`), tức là bấm Nhân bản
   * xong không màn nào bày ra thứ vừa tạo.
   *
   * Chỉ lấy template của brand, KHÔNG lấy template hệ thống: hệ thống là hàng
   * dùng chung, thuộc về Exchange. Đo thật trên brand đang dùng: 79 template
   * thấy được thì 76 là hệ thống, 3 là của brand — nên chỗ này thêm 3 mục, chứ
   * không phải kéo cả kho về như hồi còn tab template cũ.
   */
  // `ownIds` chỉ hai nhánh dưới đây cần — `await` NGAY TRONG closure (không
  // phải một biến chờ sẵn ở ngoài) để lookup template không chặn nhánh
  // COPY_STATES độc lập trong `Promise.all` bên dưới.
  const fetchOwnTemplates = async (): Promise<RxExperience[]> => {
    const ownIds = await fetchOwnTemplateIds();
    if (!ownIds || ownIds.size === 0) return [];
    const all = await fetchState('templates');
    return all.filter(x => ownIds.has(x.id));
  };

  /**
   * Block CỦA CHÍNH BRAND — nơi bản fork từ Exchange (`exchange.add` trên một
   * item `kind: 'block'`, xem `ExchangeWorkspace.installListing`) sống sau khi
   * thêm. Cùng khuôn với `fetchOwnTemplates`: tra `ownIds` trước ở v1, rồi lọc
   * lại nhánh `category: 'blocks'` của v2 — vì `RxExperience` không mang
   * `brand_id` để tự tách brand khỏi hệ thống.
   */
  const fetchOwnBlocks = async (): Promise<RxExperience[]> => {
    const ownIds = await fetchOwnBlockIds();
    if (!ownIds || ownIds.size === 0) return [];
    const all = await fetchExperienceCategory(common, 'blocks');
    return all.filter(x => ownIds.has(x.id));
  };

  /**
   * Chế độ xếp hạng — MỘT lời gọi `state: 'all'` rồi lọc ở FE.
   *
   * Không thể giữ nhiều lời gọi rồi nối lại: BE xếp hạng TRONG từng phản hồi,
   * nên nối các dải đã xếp cho ra thứ tự theo nhóm, không phải thứ tự chung —
   * một mục `unassigned` chưa đo sẽ đứng trên một `topic_copies` bậc cao, đúng
   * ngược với điều cái nút hứa.
   *
   * `state: 'all'` gộp cả template hệ thống và block (đo thật: 320 bản ghi),
   * nên phải lọc lại: giữ bản copy, cộng template + block của chính brand. Lọc
   * GIỮ NGUYÊN thứ tự, nên hạng chung vẫn đúng sau khi lọc.
   */
  const fetchRanked = async (): Promise<RxExperience[]> => {
    // Ba lookup này độc lập — chạy song song, chỉ lọc kết quả cuối cần đợi cả ba.
    const [ownTemplateIds, ownBlockIds, all] = await Promise.all([
      fetchOwnTemplateIds(),
      fetchOwnBlockIds(),
      fetchState('all', 'shelf_rank'),
    ]);
    const ownIds = new Set([...(ownTemplateIds ?? []), ...(ownBlockIds ?? [])]);
    return all.filter(x => x.kind === 'copy' || ownIds.has(x.id));
  };

  try {
    if (query.rank) {
      const ranked = await fetchRanked();
      return { items: ranked.map(v2ToExperienceView), error: null };
    }

    const chunks = await Promise.all([
      ...COPY_STATES.map(s => fetchState(s)),
      fetchOwnTemplates(),
      fetchOwnBlocks(),
    ]);

    // Khử trùng theo id: các state đáng lẽ rời nhau, nhưng dựa vào điều đó là
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
