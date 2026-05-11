import { AdminGuard } from '@/components/modules/Admin/AdminGuard';
import { AdminNav } from '@/components/modules/Admin/AdminNav';

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className='flex flex-col'>
        <AdminNav />
        {children}
      </div>
    </AdminGuard>
  );
}
