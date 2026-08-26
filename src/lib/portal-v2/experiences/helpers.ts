import type {
  ExperienceFilters,
  ExperienceState,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';

/**
 * Formatting is PINNED to one locale and one time zone.
 *
 * These values render on cards, and cards render on the server. A bare
 * `.toLocaleString()` / `new Date().toLocaleDateString()` resolves against
 * Node's ICU locale on the server and the browser's during hydration — a
 * mismatch waiting for the first user whose machine disagrees with the build
 * box. Same reason there is no relative "2 hours ago": that needs `Date.now()`,
 * which differs between render passes.
 */
const NUM = new Intl.NumberFormat('en-US');
const NUM_1DP = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const DATE = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const formatCount = (n: number): string => NUM.format(Math.round(n));

export const formatMoney = (n: number): string =>
  `$${NUM.format(Math.round(n))}`;

/** 0.123 → '12.3%' */
export const formatPct01 = (n: number): string => `${NUM_1DP.format(n * 100)}%`;

/** Signed, with a true minus sign. 0.18 → '+18%', −0.09 → '−9%'. */
export const formatLift = (lift: number): string => {
  const pct = Math.round(lift * 100);
  return pct >= 0 ? `+${pct}%` : `−${Math.abs(pct)}%`;
};

/** ISO timestamp → '14 Mar 2026'. Empty/invalid input renders as an em dash. */
export const formatUpdated = (iso: string | undefined): string => {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? '—' : DATE.format(ms);
};

/**
 * The filtered set. The query is applied server-side (`?q=`); the chip axes
 * and the ownership tab are seeded values, so they narrow client-side. Every
 * axis follows the prototype's "unset means ANY" rule.
 */
export const filterExperiences = (
  list: ExperienceView[],
  filters: ExperienceFilters
): ExperienceView[] =>
  list.filter(e => {
    if (filters.state !== 'all' && e.state !== filters.state) return false;
    if (filters.category !== 'all' && e.category !== filters.category)
      return false;
    if (filters.vehicle !== 'all' && e.vehicle !== filters.vehicle)
      return false;
    if (filters.objective !== 'all' && e.objective !== filters.objective)
      return false;
    if (filters.ev !== 'all' && e.evidence.tier !== filters.ev) return false;
    return true;
  });

/** Tab badge counts — prototype `tabs[].n` (~L16076). */
export const countByState = (
  list: ExperienceView[],
  state: ExperienceState | 'all'
): number => {
  if (state === 'all') return list.length;
  return list.filter(e => e.state === state).length;
};

export const findById = (
  list: ExperienceView[],
  id: string | null
): ExperienceView | null => (id ? (list.find(e => e.id === id) ?? null) : null);

/**
 * Where the canvas editor lives for this row.
 *
 * `slug || id` because a page created without a slug still has to be openable,
 * and the editor route resolves both shapes. A `block`-state row has no page
 * behind it at all — `?kind=block` tells `CanvasEditor` to load
 * `blocks.get(id)` instead of resolving a page/source experience (see
 * `CanvasEditor.tsx`'s two-mode contract).
 */
export const canvasEditorHref = (experience: ExperienceView): string => {
  const base = `/portal-v2/${encodeURIComponent(experience.slug || experience.id)}/canvas`;
  return experience.state === 'block' ? `${base}?kind=block` : base;
};

/**
 * An external landing has no canvas of ours to open.
 *
 * Bản chưa gán hạng mục (`state: 'unassigned'`) từng bị khoá sửa ở đây, với lý
 * do hai đường đang lỗi trên loại bản ghi này: đổi tên gọi nhầm API của trang
 * (404 "Page not found"), và mở canvas đọc nội dung sai chỗ (khung trắng).
 * Verify lại 2026-08-26: cả hai bug đó chỉ xảy ra ở luồng CŨ "Duplicate →
 * promotePage" (dựng ra một TEMPLATE — `state` luôn là `'template'`, không
 * bao giờ là `'unassigned'`, nên khoá ở đây thật ra không hề chặn được hai
 * đường lỗi đó). Với một bản copy chưa gán THẬT (`kind: 'copy'`, page thật,
 * id thật), `PATCH /v1/pages/{id}` và `useResolvedCanvasTarget` đều chạy đúng
 * — test trực tiếp trên dữ liệu thật (Royal Mint / "Belgo (Exchange)") ra
 * 200, không 404. Luồng "Duplicate" cũ giờ cũng không còn ai dùng nữa (Use
 * đã fork thẳng từ 2026-08-25). Bỏ khoá theo yêu cầu — sửa bản chưa gán ảnh
 * hưởng tới các bản fork MỚI từ đó về sau (bản đã fork trước đó không đổi,
 * mỗi fork có canvas riêng); người dùng tự biết đánh đổi này.
 */
export const canEditCanvas = (experience: ExperienceView): boolean =>
  !experience.externalUrl;

/**
 * Xem trước được không.
 *
 * Chỉ một điều kiện: có canvas để dựng. Trang ngoài (`externalUrl`) không có.
 *
 * KHÔNG hỏi slug, và KHÔNG hỏi `status`. Cả hai đều từng được dùng làm chỉ dấu
 * "có trang công khai", và cả hai đều sai:
 *
 *   - slug có mặt trên cả bản nháp, mà `/p/{slug}` của nháp trả 404
 *   - `status: 'published'` KHÔNG bảo đảm có Release. Đo trên dữ liệu thật:
 *     "The Jack Pine" mang status published, `releases: []`, và `/p/{slug}`
 *     vẫn 404. Trang công khai phục vụ từ RELEASE, không phải từ cột status.
 */
export const canPreview = (experience: ExperienceView): boolean =>
  !experience.externalUrl;
