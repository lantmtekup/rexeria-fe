import { findFont } from '@/lib/fonts';

/**
 * Token dùng chung cho các block port từ apps/ecommerce-landing (Le Cool Move).
 *
 * Font: apps khai `--font-libertinus` / `--font-montserrat` bằng next/font ở
 * layout riêng, host không có biến đó. Lấy stack từ registry `src/lib/fonts.ts`
 * (giống `westlyTheme.ts`) chứ KHÔNG tự viết tay — registry vừa là nguồn duy
 * nhất của chuỗi fallback, vừa là thứ sinh ra `GOOGLE_FONTS_HREF` nạp font ở
 * `<head>`. Viết tay thì sửa fallback một chỗ sẽ lệch chỗ kia, tệ hơn là gõ tên
 * một family chưa đăng ký → không bao giờ được nạp mà nhìn vẫn "có vẻ đúng".
 *
 * Không cần `FONT_CSS`: cả hai đã nằm trong registry nên `<head>` tự có.
 */
export const LECOOL_DISPLAY_FONT = findFont('libertinus-math').family;
export const LECOOL_BODY_FONT = findFont('montserrat').family;

export const LECOOL_GOLD = '#B68D45';
export const LECOOL_PAPER = '#F5F5F5';
export const LECOOL_INK = '#1D1D1B';

/**
 * Header của landing gốc `sticky` cao 72px — mốc `top` cho mọi thứ sticky và
 * mốc trừ vào chiều cao "một màn" của các section.
 */
export const LECOOL_HEADER_H = 72;

/** `calc(100dvh - 72px)` — một màn trừ header. */
export const LECOOL_STAGE_H = `calc(100dvh - ${LECOOL_HEADER_H}px)`;

/**
 * `.no-scrollbar` sống ở globals.css của apps; host không có nên block nào cần
 * thì tự kèm theo `<style>`. Tên có tiền tố để không đụng block khác trong cùng
 * trang; hai block cùng nhả ra một bộ rule y hệt thì vô hại.
 */
export const LECOOL_NO_SCROLLBAR_CSS = `
.lecool-no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.lecool-no-scrollbar::-webkit-scrollbar { display: none; }
`;
