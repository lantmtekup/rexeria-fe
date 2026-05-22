import { Building2 } from 'lucide-react';

import { AdminComingSoon } from '@/components/modules/Admin/AdminComingSoon';

export default function AdminWorkspacesPage() {
  return (
    <AdminComingSoon
      icon={Building2}
      title='Quản lý Client & Workspace'
      subtitle='Tạo, sửa, archive client (pháp nhân) và workspace (sub-brand). Quản lý plan, billing, member invite.'
      specFile='be-workspace-multitenancy-spec.md'
      estTime='~2 tuần BE'
      dependencies={[
        {
          status: 'new',
          text: 'Migration: extend bảng clients + tạo workspaces + workspace_members',
        },
        {
          status: 'new',
          text: 'JWT claims rotate khi switch workspace (client_id + active_workspace_id)',
        },
        {
          status: 'new',
          text: 'Middleware scope tự inject WHERE client_id=? AND workspace_id=?',
        },
        {
          status: 'new',
          text: 'Email invite flow với token TTL 7 ngày',
        },
        {
          status: 'in_progress',
          text: 'Tham chiếu resource clients hiện có (cần extend fields)',
        },
      ]}
    />
  );
}
