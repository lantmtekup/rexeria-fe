import { AdminGuard } from '@/components/modules/Admin/AdminGuard';
import { AdminSidebar } from '@/components/modules/Admin/AdminSidebar';

/**
 * Standalone admin shell — left vertical sidebar + full-width main pane.
 * Breaks out of the `(cms)` route group so the old "CMS / Tổng quan /
 * Cài đặt website" outer sidebar + horizontal tab bar don't double up.
 */
export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className='flex min-h-screen w-full overflow-x-hidden bg-zinc-50'>
        <AdminSidebar />
        <main className='min-h-0 min-w-0 flex-1 overflow-auto'>{children}</main>
      </div>
    </AdminGuard>
  );
}
