import { AdminGuard } from '@/components/modules/Admin/AdminGuard';
import { AdminSidebar } from '@/components/modules/Admin/AdminSidebar';

/**
 * Standalone admin shell — left vertical sidebar + full-width main pane.
 * Breaks out of the `(cms)` route group so the old "CMS / Tổng quan /
 * Cài đặt website" outer sidebar + horizontal tab bar don't double up.
 *
 * The shell is viewport-locked (`h-screen` + `overflow-hidden`, mirroring
 * `AppShellLayout`) and scrolling happens INSIDE `main`. With `min-h-screen`
 * the row had no definite height, so every `h-full` / `flex-1` chain below it
 * resolved to `auto` — the canvas editor then grew the document instead of
 * clipping, and zooming in scrolled the whole admin page rather than the
 * canvas. `AdminSidebar` is already `h-screen`, so it assumed this too.
 */
export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className='bg-background flex h-screen w-full overflow-hidden'>
        <AdminSidebar />
        <main className='h-full min-h-0 min-w-0 flex-1 overflow-auto'>
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
