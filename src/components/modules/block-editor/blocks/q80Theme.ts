/**
 * Theme chung cho bộ block `q80_*` (migrate từ quadplex80.com — 111 West 57th).
 *
 * Font gốc: Neue Haas Grotesk TX Pro (55Rg/65Md, sans) + Teodor Regular
 * (serif hiển thị). Self-host woff2 tại `public/quadplex80/font/` (asset thuộc
 * sở hữu dự án). Màu "gold" gốc: #7c7262 (trích tailwind inline của bản gốc —
 * border-gold/20 = #7c726233).
 */
export const Q80_FONT_SANS =
  "'NHaasGroteskTXPro', 'Helvetica Neue', Arial, sans-serif";
export const Q80_FONT_SERIF = "'Teodor', 'Times New Roman', Georgia, serif";

export const Q80_GOLD = '#7c7262';
export const Q80_INK = '#1a1a1a';
export const Q80_WHITE = '#ffffff';

export const Q80_FONT_CSS = `
@font-face {
  font-family: 'NHaasGroteskTXPro';
  src: url('/quadplex80/font/NHaasGroteskTXPro-55Rg.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'NHaasGroteskTXPro';
  src: url('/quadplex80/font/NHaasGroteskTXPro-65Md.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Teodor';
  src: url('/quadplex80/font/Teodor-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
`;

/** Logo "111 W 57" 3 dòng serif (thay svg logo gốc bằng text cùng layout). */
export const Q80_LOGO_LINES = ['111', 'W', '57'];
