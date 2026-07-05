import { AwardBadge } from './AwardBadge';
import { CursorBalls } from './CursorBalls';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Khung chung cho các trang phụ — mirror pattern gốc:
 * header cố định + breadcrumb "home./" (xám nhỏ) + heading lớn vàng "<tên>."
 * + nội dung. Cursor balls + award badge + footer dùng chung.
 */
export function PageShell({
  crumb = 'home',
  title,
  children,
}: {
  crumb?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <main className='relative min-h-screen'>
      <CursorBalls />
      <Header />
      <AwardBadge />

      <div className='relative z-10 px-6 pt-28 pb-16 md:px-12 md:pt-36'>
        <div className='mx-auto max-w-6xl'>
          <span className='dot text-lg font-semibold text-[var(--grey)]/70'>
            {crumb}
          </span>
          <span className='ml-1 text-lg font-semibold text-[var(--grey)]/40'>
            /
          </span>
          <h1 className='dot mt-1 text-6xl font-semibold text-[var(--yellow)] lowercase md:text-8xl'>
            {title}
          </h1>

          <div className='mt-10'>{children}</div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
