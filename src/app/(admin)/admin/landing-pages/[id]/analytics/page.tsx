'use client';

/**
 * Admin landing page analytics — `/admin/landing-pages/[id]/analytics`.
 *
 * Mirror của `/portal/landing-pages/[id]/analytics` route nhưng dùng admin
 * breakdown endpoint (useAdminEndpoint=true). Param `id` ưu tiên slug ↔ page
 * UUID resolution giống editor route — nhưng BlockAnalyticsGrid hiện vẫn
 * gọi retired `canvasTemplates.get` (Wave 3 cleanup riêng). Tạm thời pass
 * raw id để component thử fetch — hiển thị error gracefully nếu fail.
 */

import * as React from 'react';
import { use } from 'react';

import { BlockAnalyticsGrid } from '@/components/modules/Analytics/BlockAnalyticsGrid';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminLandingAnalyticsPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <BlockAnalyticsGrid
      templateId={id}
      backHref='/admin/landing-pages'
      useAdminEndpoint
    />
  );
}
