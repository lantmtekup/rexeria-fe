/**
 * Token dùng chung của họ block `real_estate_*` — port template Framer
 * real-estate-1 (`apps/real-estate-1`). KHÔNG đăng ký vào registry: đây là
 * helper, không phải block.
 *
 * Mọi số/màu dưới đây truy được về `apps/real-estate-1/app/framer.css` trên
 * canvas 372px cố định. Xem `apps/real-estate-1/PORTING.md` — không đọc số từ
 * ảnh chụp khi số đó có sẵn trong nguồn.
 */

// Màu gốc: framer.css / inline `--framer-text-color` trong Page.tsx.
export const GREEN = 'rgb(0, 147, 54)';
export const BROWN = 'rgb(116, 96, 74)';
/** Nền trang, framer.css:1907 `.framer-AUAI2.framer-19nsx14`. */
export const SAND = '#f8f1e9';

/**
 * Khoảng hở TRÊN của một section real-estate — 104px trên canvas 372 =
 * 27.96cqi. Đo `4. MaP` (đáy 1896) → `5. Tổng quan` (top 2000). KHÔNG dùng
 * khoảng hở 580px phía trên `3. Vị trí`: đó là lỗ hổng do designer xoá section
 * `2.`, không mang ý đồ thiết kế (xem PORTING.md).
 *
 * Section ĐẦU TIÊN của trang (`1. Banner`, top:0) KHÔNG dùng hằng này — nó
 * không có section nào phía trước.
 */
export const RE_SECTION_GAP = 'clamp(40px, 27.96cqi, 120px)';

/**
 * Bản gốc khai SemiBold và Light thành HAI family riêng (không phải 2 weight
 * của một family) — framer.css:44-53. Mirror đúng vậy, nên `fontWeight: 400`
 * trên chữ đậm là chính xác: bản thân face đã là semibold.
 */
export const FONT_HEADING =
  "'SVN-Adero SemiBold', 'Be Vietnam Pro', system-ui, sans-serif";
export const FONT_BODY =
  "'SVN-Adero Light', 'Be Vietnam Pro', system-ui, sans-serif";

/**
 * Self-host 2 file woff2 → `public/real-estate/fonts/` (bản copy nội bộ, KHÔNG
 * trỏ CDN Framer: một lần republish là nguồn đổi thầm lặng — PORTING.md).
 *
 * Block nhúng qua `<style>{FONT_CSS}</style>`. Hai block real-estate cùng nằm
 * trên một trang sẽ emit khối này 2 lần — vô hại, trình duyệt gộp @font-face
 * trùng family+src và chỉ tải font một lần.
 */
export const FONT_CSS = `
@font-face { font-family: 'SVN-Adero SemiBold'; src: url('/real-estate/fonts/Nuz7kEROxLMDh3fFgoJzqDWnYU.woff2') format('woff2'); font-display: swap; }
@font-face { font-family: 'SVN-Adero Light'; src: url('/real-estate/fonts/ka6swfnIlD5Xj0Y3BnE0cOpnuw.woff2') format('woff2'); font-display: swap; }
`;
