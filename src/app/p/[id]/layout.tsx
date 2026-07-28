/**
 * Layout cho route public landing `/p/[id]`. Chỉ để nạp CSS bật native
 * cross-document View Transitions (xem `public-transitions.css`) cho luồng
 * chuyển trang giữa các landing page, và mở gate entrance seed
 * (`public-entrance.css`) — không thêm chrome nào khác.
 */
import './public-transitions.css';
import './public-entrance.css';

/**
 * Bật gate ẩn-trước-paint cho `[data-entrance]`. Đặt class ở đây (JS) chứ
 * không hard-code trong CSS để JS tắt / script lỗi ⇒ nội dung vẫn hiện đầy đủ.
 * Timeout 4s là failsafe cho case JS bật nhưng hydration crash: gỡ class →
 * element chưa được GSAP chạm sẽ hiện lại. Gỡ class KHÔNG đè inline style nên
 * element đã animate xong không bị ảnh hưởng.
 *
 * Script nằm ngay trước `children` trong body → chạy lúc parse, trước khi
 * markup của block được parse và paint.
 */
const ENTRANCE_GATE =
  "document.documentElement.classList.add('rx-motion');" +
  "setTimeout(function(){document.documentElement.classList.remove('rx-motion')},4000);";

export default function PublicLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: ENTRANCE_GATE }} />
      {children}
    </>
  );
}
