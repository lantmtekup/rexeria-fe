'use client';

/**
 * Tab "Media/Assets" trong màn quản lý brand — admin upload/quản lý asset hộ
 * brand. Tái dùng <MediaLibrary brandId={clientId} />.
 *
 * ⚠️ Cần BE ship brand_id scoping cho media/folders/upload
 * (docs/be-spec-admin-asset-scope-2026-06-07.md) thì mới scope đúng brand;
 * trước đó BE có thể trả 403 cho platform admin.
 */

import * as React from 'react';

import { MediaLibrary } from '@/components/modules/Media/MediaLibrary';

export function AssetsTab({
  clientId,
  onCount,
}: {
  clientId: string;
  onCount: (n: number) => void;
}) {
  return (
    <div className='p-4'>
      <MediaLibrary brandId={clientId} onCount={onCount} />
    </div>
  );
}
