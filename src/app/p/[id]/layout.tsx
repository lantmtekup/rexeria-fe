/**
 * Layout cho route public landing `/p/[id]`. Chỉ để nạp CSS bật native
 * cross-document View Transitions (xem `public-transitions.css`) cho luồng
 * chuyển trang giữa các landing page — không thêm chrome nào khác.
 */
import './public-transitions.css';

export default function PublicLandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
