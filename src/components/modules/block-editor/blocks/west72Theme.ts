/** Font + palette cho cụm block 212 West 72nd (port từ apps/212-west). */

const FONT_DIR = '/212-west/fonts';

const face = (family: string, file: string, weight: number) => `
@font-face {
  font-family: '${family}';
  src: url('${FONT_DIR}/${file}.woff2') format('woff2');
  font-weight: ${weight};
  font-style: normal;
  font-display: swap;
}`;

export const WEST72_FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
${face('SF Pro Display', 'SFProDisplay-Light', 300)}
${face('SF Pro Display', 'SFProDisplay-Regular', 400)}
${face('SF Pro Display', 'SFProDisplay-Medium', 500)}
${face('SF Pro Display', 'SFProDisplay-Semibold', 600)}
${face('SF Pro Display', 'SFProDisplay-Bold', 700)}
${face('SF Pro Text', 'SFProText-Regular', 400)}
${face('SF Pro Text', 'SFProText-Medium', 500)}
${face('SF Pro Text', 'SFProText-Semibold', 600)}
`;

const SYSTEM_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export const WEST72_FONT_DISPLAY = `'SF Pro Display', 'SF Pro Text', ${SYSTEM_STACK}`;
export const WEST72_FONT_TEXT = `'SF Pro Text', ${SYSTEM_STACK}`;
export const WEST72_FONT_NAV = `'Inter', ${SYSTEM_STACK}`;

/** Palette 212 West — nền tối hero, nâu đất cho tiêu đề, kem cho chrome. */
export const WEST72_INK = '#0F0F0E';
export const WEST72_BROWN = '#763718';
export const WEST72_CREAM = '#EDE9E0';
export const WEST72_WHITE = '#FFFFFF';
export const WEST72_BLACK = '#000000';
