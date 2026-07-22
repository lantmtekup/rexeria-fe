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
 * Bề rộng cột nội dung — KHOÁ ở 372px (chính là bề rộng canvas Framer nguồn) và
 * canh giữa ở MỌI breakpoint. `100cqw` để dưới 372 thì co theo khung thay vì
 * tràn; phải là `cqw` chứ không phải `vw` vì block sống trong device frame của
 * editor, nơi bề rộng khung khác bề rộng cửa sổ.
 *
 * Dùng trên một `<div className='@container mx-auto' style={{ width: RE_CONTENT_W }}>`.
 * Lớp đó BẮT BUỘC phải riêng: một element không query được chính container-type
 * của nó, nên `@container` và `width` nằm cùng chỗ thì `cqi` bên trong vẫn
 * resolve theo container tổ tiên.
 *
 * Lớp này re-scope mọi `cqi` bên trong về 372, nên các con số cqi transcribe từ
 * canvas gốc ra THẲNG pixel gốc — đó là lý do không block real-estate nào còn
 * cần `clamp()`. Clamp chỉ tồn tại hồi cột còn co theo container, để chặn chữ
 * phình ở desktop; nay cột đã khoá thì clamp chỉ làm sai tỉ lệ gốc.
 */
export const RE_CONTENT_W = 'min(100cqw, 372px)';

/**
 * Khoảng hở TRÊN của một section real-estate — 104px trên canvas 372 =
 * 27.96cqi. Đo `4. MaP` (đáy 1896) → `5. Tổng quan` (top 2000). KHÔNG dùng
 * khoảng hở 580px phía trên `3. Vị trí`: đó là lỗ hổng do designer xoá section
 * `2.`, không mang ý đồ thiết kế (xem PORTING.md).
 *
 * Suy từ `RE_CONTENT_W` chứ không phải `cqi` trần: block bọc ngoài là full-bleed
 * nên `27.96cqi` ở đó đo theo bề rộng BLOCK (1440 trên canvas desktop) chứ không
 * theo cột 372 — bản `clamp(40px, 27.96cqi, 120px)` cũ vì vậy luôn kịch trần
 * 120px ở desktop, lệch khỏi cột vừa khoá. Công thức này ra đúng 104px ở mọi bề
 * rộng ≥372 và co theo khung khi <372, lại cho cùng kết quả dù đặt TRONG hay
 * NGOÀI lớp `@container` 372 (vì `min()` đều kẹp về 372).
 *
 * Section ĐẦU TIÊN của trang (`1. Banner`, top:0) KHÔNG dùng hằng này — nó
 * không có section nào phía trước.
 */
export const RE_SECTION_GAP = `calc(${RE_CONTENT_W} * 0.2796)`;

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
