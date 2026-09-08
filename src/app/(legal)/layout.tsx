import Link from 'next/link';

import { Logo } from '@/components/atoms/logo';

/**
 * Khung cho hai trang pháp lý `/privacy` và `/terms`.
 *
 * TỰ CHỨA, cố ý: hai trang này được link từ chân trang đăng nhập
 * (`AuthenticationLayout`) nên phải mở được trên `portal.rexerstudio.com` khi
 * người dùng CHƯA đăng nhập. Dùng `(landing)` thì kéo theo navbar marketing
 * (menu trỏ về `/rexer/*`) — lạc chỗ khi người ta đang ở giữa luồng đăng nhập.
 *
 * Middleware KHÔNG chặn hai đường này: `/privacy` và `/terms` không nằm trong
 * `protectedRoutes`, nên chúng rơi xuống luồng thường và render công khai trên
 * mọi host nền tảng. Riêng `{slug}.rexerstudio.com/privacy` vẫn rewrite sang
 * trang của brand đó (đúng ý đồ — subdomain là trang của brand, không phải của
 * nền tảng).
 */
export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-portal-v2
      className='min-h-dvh bg-[#f5f7fb] font-sans text-[#0e1117] antialiased'
    >
      <header className='border-b border-[#e2e7f0] bg-white'>
        <div className='mx-auto flex max-w-3xl items-center justify-between px-6 py-4'>
          <Link
            href='/'
            aria-label='ReXeR Studio'
            className='transition-opacity hover:opacity-80'
          >
            <Logo size={20} />
          </Link>
          <nav className='flex items-center gap-4 text-xs text-[#8b95a8]'>
            <Link href='/privacy' className='hover:text-[#0e1117]'>
              Quyền riêng tư
            </Link>
            <Link href='/terms' className='hover:text-[#0e1117]'>
              Điều khoản
            </Link>
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-3xl px-6 py-12'>{children}</main>

      <footer className='border-t border-[#e2e7f0] bg-white'>
        <div className='mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-[#8b95a8]'>
          <span>&copy; {new Date().getFullYear()} ReXeR Studio</span>
          <a
            href='mailto:info@rexerstudio.com'
            className='hover:text-[#0e1117]'
          >
            info@rexerstudio.com
          </a>
        </div>
      </footer>
    </div>
  );
}
