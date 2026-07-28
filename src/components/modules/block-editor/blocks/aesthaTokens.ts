/**
 * Shared tokens for Aestha blocks (Explore, Project, Studio, Contact).
 * Font families, color palette, and common CSS style objects.
 */

import type React from 'react';

/* ── Font families ─────────────────────────────────────────────── */

export const DISPLAY_FONT =
  "'Funnel Display', 'Switzer', 'Switzer Variable', ui-sans-serif, system-ui, sans-serif";

export const BODY_FONT =
  "'Switzer', 'Switzer Variable', 'Inter', ui-sans-serif, system-ui, sans-serif";

export const MONO_FONT = "'DM Mono', ui-monospace, monospace";

/* ── Color palette ──────────────────────────────────────────────── */

export const INK = '#1A1A1A';
export const INK_DARK = '#0F0F0F';
export const MUTED_LABEL = '#555';
export const MENU_IDLE = '#9C9C9C';
// `FOOTER_CURRENT` (#E0DEDE) đã bỏ cùng cơ chế tô mờ "trang hiện tại" của
// `aestha_nav`: trên nền trắng nó gần như tàng hình, đọc ra như link bị mất.
export const NEXT_IDLE = '#8A8A8A';

/* ── Layout ────────────────────────────────────────────────────── */

/**
 * Chiều cao block `aestha_nav` chiếm ở đáy khung: 2 × padding
 * (`clamp(16px, 2.2cqi, 32px)`) + 1 dòng link (`FOOTER_LINK_STYLE`,
 * lineHeight 1.25 × fontSize `clamp(16px, 1.7cqi, 20px)`).
 *
 * Nav là overlay portal nên KHÔNG đẩy layout của section. Mỗi section phải tự
 * chừa chỗ ở đáy bằng padding, nếu không nội dung sát đáy sẽ bị nav đè lên
 * (bug đã gặp ở cột trái `FramerAesthaEditorial` — description dồn xuống đáy).
 *
 * `cqi` của nav tính theo container portal (device frame) còn của section tính
 * theo block root — cả hai đều bằng bề rộng khung nên bám nhau.
 */
export const NAV_CLEARANCE = 'clamp(56px, 6.4cqi, 92px)';

/* ── Easing ────────────────────────────────────────────────────── */

export const EASE_STANDARD = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_CROSSFADE = 'cubic-bezier(0.5, 0, 0.88, 0.9)';

/* ── Common CSS style objects ───────────────────────────────────── */

export const TITLE_STYLE: React.CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: 'clamp(40px, 4.4cqi, 48px)',
  fontWeight: 500,
  letterSpacing: '-0.96px',
  lineHeight: 1,
  color: INK,
  margin: 0,
};

export const HEADING_STYLE: React.CSSProperties = {
  fontFamily: DISPLAY_FONT,
  fontSize: 'clamp(40px, 4.4cqi, 48px)',
  lineHeight: 1,
  fontWeight: 500,
  letterSpacing: '-0.96px',
  color: INK_DARK,
  margin: 0,
};

export const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: MONO_FONT,
  fontSize: 12,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: MUTED_LABEL,
  margin: 0,
};

export const BODY_P_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  fontSize: 14,
  lineHeight: 1.6,
  color: INK,
  margin: '0 0 16px',
};

// `NAV_LINK_STYLE` đã bỏ: nav tách thành block `aestha_nav`, dùng chung
// `FOOTER_LINK_STYLE` bên dưới cho mọi link nav.

export const MENU_LINK_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  fontSize: 20,
  lineHeight: '25px',
  fontWeight: 400,
  textDecoration: 'none',
  transition: `color 250ms ${EASE_CROSSFADE}`,
};

/** Link nav — nguồn duy nhất cho block `aestha_nav`. */
export const FOOTER_LINK_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  // Thống nhất mọi link nav họ Aestha — trước đây mỗi block một giá trị
  // (20 cố định / clamp 12→20 / clamp 16→20).
  fontSize: 'clamp(16px, 1.7cqi, 20px)',
  lineHeight: 1.25,
  fontWeight: 400,
  color: INK,
  textDecoration: 'none',
};

export const NEXT_LINK_STYLE: React.CSSProperties = {
  fontFamily: BODY_FONT,
  fontSize: 'clamp(15px, 1.3cqi, 18px)',
  color: NEXT_IDLE,
  textDecoration: 'none',
  cursor: 'pointer',
  marginTop: 4,
  display: 'inline-block',
};
