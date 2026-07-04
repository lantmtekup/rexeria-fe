/**
 * Token dùng chung cho cụm block Delvaux (delvaux_header/subnav/hero/details/
 * product/variant) — bám sát `:root` của bản gốc:
 *
 *   --font-heading: "Genath"          (self-host: /delvaux/font/Genath-*.woff2)
 *   --font-body:    "Atlas Grotesk"   (self-host: /delvaux/font/AtlasGrotesk-*.woff2)
 *   --bg-body:      #e9eaec
 *
 * Font + media đặt trong `public/delvaux/` (asset thuộc sở hữu của dự án).
 * Stack luôn có fallback (Cormorant Garamond / Inter → hệ thống) nên thiếu
 * file font vẫn render được.
 *
 * Token áp INLINE trong từng element (tuyền inline — editor override được);
 * file này chỉ giữ hằng số để 6 block không lệch nhau.
 */

export const DELVAUX_FONT_HEADING =
  "'Genath', 'Cormorant Garamond', Georgia, 'Times New Roman', serif";

export const DELVAUX_FONT_BODY =
  "'Atlas Grotesk', 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Màu nền toàn trang của bản gốc (`--bg-body`). */
export const DELVAUX_BG = '#e9eaec';

/** Màu chữ chính (gốc dùng #111). */
export const DELVAUX_INK = '#111111';

/**
 * @font-face nạp font thật self-host. Mỗi block Delvaux render `<style>` với
 * chuỗi này — khai báo lặp giữa các block vô hại, trình duyệt chỉ tải 1 lần.
 */
export const DELVAUX_FONT_CSS = `
@font-face { font-family: 'Genath'; src: url('/delvaux/font/Genath-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Atlas Grotesk'; src: url('/delvaux/font/AtlasGrotesk-Light.woff2') format('woff2'); font-weight: 300; font-style: normal; font-display: swap; }
@font-face { font-family: 'Atlas Grotesk'; src: url('/delvaux/font/AtlasGrotesk-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Atlas Grotesk'; src: url('/delvaux/font/AtlasGrotesk-Medium.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
`;
