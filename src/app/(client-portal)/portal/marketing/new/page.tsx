'use client';

/**
 * `/marketing/new` — giữ URL cũ chạy được: mở popup tạo campaign (mini-form
 * Tên + nhiều sản phẩm) trên nền list. Đóng popup → về list. Tạo nháp thành
 * công → popup tự điều hướng sang editor `/[id]`.
 */

import { useRouter } from 'next/navigation';

import { PortalShell } from '../../_shell';
import { NewCampaignDialog } from '../_NewCampaignDialog';

export default function NewMarketingPage() {
  const router = useRouter();
  return (
    <PortalShell fullBleed>
      <NewCampaignDialog
        open
        onOpenChange={o => {
          if (!o) router.push('/portal/marketing');
        }}
      />
    </PortalShell>
  );
}
