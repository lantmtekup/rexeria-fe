import { UploadCloud } from 'lucide-react';

import { AdminComingSoon } from '@/components/modules/Admin/AdminComingSoon';

export default function AdminAssetsPage() {
  return (
    <AdminComingSoon
      icon={UploadCloud}
      title='Asset Library (toàn hệ thống)'
      subtitle='Browse mọi asset (hình ảnh / video / tài liệu) qua tất cả workspace. Filter theo client, brand, campaign. Quota management + virus scan dashboard.'
      specFile='be-asset-upload-spec.md'
      estTime='~2 tuần BE'
      dependencies={[
        {
          status: 'new',
          text: 'Bảng assets với workspace_id + client_id scope',
        },
        {
          status: 'new',
          text: 'Direct-to-S3 presigned upload (POST /assets/presign + confirm)',
        },
        {
          status: 'new',
          text: 'Lambda thumbnail generation + ClamAV virus scan async',
        },
        {
          status: 'new',
          text: 'Folder hierarchy (Google Drive style) — Phase 2 extension',
        },
        {
          status: 'new',
          text: 'Quota check 10GB/workspace, file size limits',
        },
      ]}
      previewHref='/overview/portal-demo/media'
      previewLabel='Xem demo /portal-demo/media'
    />
  );
}
