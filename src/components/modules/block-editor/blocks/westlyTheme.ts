import { findFont } from '@/lib/fonts';

/**
 * Font tokens cho cụm block Westly (port từ apps/the-westly).
 *
 * App gốc redefine `--font-sans` thành Cormorant Infant nên mọi thứ inherit
 * serif, còn Inter chỉ opt-in ở lớp label qua utility `font-ui`. Bên host ta
 * tái lập bằng cách set DISPLAY trên root mỗi block (con inherit) và chỉ set
 * UI trên đúng nhóm eyebrow / description / meta.
 *
 * Không có `FONT_CSS` như các theme khác: cả hai family đã nằm sẵn trong
 * `<head>` — Cormorant Infant qua registry `src/lib/fonts.ts` →
 * `GOOGLE_FONTS_HREF`, Inter qua `next/font` ở root layout.
 */
export const WESTLY_FONT_DISPLAY = findFont('cormorant-infant').family;
export const WESTLY_FONT_UI = findFont('inter').family;
