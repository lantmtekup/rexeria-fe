'use client';

import { useEffect, useMemo, useState } from 'react';

import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';

/**
 * Chọn workspace để tạo insight report. Dùng chung cho cả màn nhập nhanh lẫn
 * wizard 10 bước — tách ra vì hai màn phải cư xử GIỐNG HỆT nhau, copy đôi là
 * kiểu gì cũng lệch.
 *
 * Hai nguồn khác nhau tuỳ vai trò:
 *
 * - Portal (`brandLocked`): workspace lấy từ membership của user, auto-pick
 *   workspace mặc định.
 * - Admin (`!brandLocked`): admin KHÔNG là member của brand nào nên
 *   `/me/workspaces` trả rỗng — phải list brand trước rồi lấy workspace của
 *   brand đã chọn (`/brands/:id/workspaces`). Không auto-pick: admin chọn
 *   tường minh vì họ thao tác chéo nhiều brand.
 */
export function useWorkspaceScope(brandLocked: boolean) {
  const [brandId, setBrandId] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  const memberships = useRexer(
    () =>
      brandLocked ? rexerApi.workspaces.myMemberships() : Promise.resolve(null),
    [brandLocked]
  );
  const brands = useRexer(
    () =>
      brandLocked
        ? Promise.resolve(null)
        : rexerApi.brands.list({ limit: 200 }),
    [brandLocked]
  );
  const brandWorkspaces = useRexer(
    () =>
      !brandLocked && brandId
        ? rexerApi.brands.workspaces.list(brandId)
        : Promise.resolve(null),
    [brandLocked, brandId]
  );

  const brandItems = brands.data?.items ?? [];
  const workspaceItems = useMemo(
    () =>
      brandLocked
        ? (memberships.data ?? []).map(m => m.workspace)
        : (brandWorkspaces.data?.items ?? []),
    [brandLocked, memberships.data, brandWorkspaces.data]
  );

  useEffect(() => {
    if (!brandLocked || workspaceId || workspaceItems.length === 0) return;
    const preferred =
      workspaceItems.find(w => w.is_default) ?? workspaceItems[0];
    if (preferred) setWorkspaceId(preferred.id);
  }, [brandLocked, workspaceId, workspaceItems]);

  // Đổi brand → workspace cũ thuộc brand khác, bỏ chọn để không submit nhầm scope.
  useEffect(() => {
    if (brandLocked) return;
    setWorkspaceId('');
  }, [brandLocked, brandId]);

  return {
    brandId,
    setBrandId,
    workspaceId,
    setWorkspaceId,
    brandItems,
    brandsLoading: brands.loading,
    workspaceItems,
    workspaceLoading: brandLocked
      ? memberships.loading
      : brandWorkspaces.loading,
  };
}
