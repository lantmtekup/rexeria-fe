'use client';

import { useTranslations } from 'next-intl';

import { Label } from '@/components/atoms/label';
import type { useWorkspaceScope } from './useWorkspaceScope';

/** Select native, style khớp `Input` của design system (brand + workspace). */
export const SELECT_CLASS =
  'border-border text-content-main focus:border-primary focus:ring-primary/20 bg-background w-full appearance-none rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-60';

export function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label>
        {label}
        {hint && (
          <span className='text-content-muted ml-1 text-xs font-normal'>
            · {hint}
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

/**
 * Hai select brand + workspace cho admin (`brandLocked=false`). Portal khoá
 * brand theo workspace đang active nên bình thường không render gì — workspace
 * đã được `useWorkspaceScope` auto-pick.
 *
 * Ngoại lệ: auto-pick THẤT BẠI (`/me/workspaces` rỗng hoặc lỗi vì phiên hết
 * hạn). Trước đây màn hình vẫn không render gì, để lại đúng một dòng "Chọn
 * workspace trước" mà không có chỗ nào chọn — bế tắc câm. Giờ hiện lý do, và
 * hiện select nếu có gì để chọn.
 */
export function ScopeFields({
  brandLocked,
  scope,
}: {
  brandLocked: boolean;
  scope: ReturnType<typeof useWorkspaceScope>;
}) {
  const t = useTranslations('insights');

  if (brandLocked) {
    if (scope.workspaceId || scope.workspaceLoading) return null;
    return (
      <FieldRow label={t('setup.workspace')}>
        {scope.workspaceItems.length > 0 ? (
          <select
            value={scope.workspaceId}
            onChange={e => scope.setWorkspaceId(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value=''>-</option>
            {scope.workspaceItems.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        ) : (
          <p
            role='alert'
            className='border-warning/30 bg-warning/5 text-content-muted rounded-xl border px-3 py-2.5 text-sm'
          >
            {scope.workspaceError ? t('setup.wsError') : t('setup.wsEmpty')}
          </p>
        )}
      </FieldRow>
    );
  }

  return (
    <>
      <FieldRow label={t('setup.brand')}>
        <select
          value={scope.brandId}
          onChange={e => scope.setBrandId(e.target.value)}
          disabled={scope.brandsLoading}
          className={SELECT_CLASS}
        >
          <option value=''>-</option>
          {scope.brandItems.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label={t('setup.workspace')}>
        <select
          value={scope.workspaceId}
          onChange={e => scope.setWorkspaceId(e.target.value)}
          disabled={!scope.brandId || scope.workspaceLoading}
          className={SELECT_CLASS}
        >
          <option value=''>
            {scope.brandId ? '-' : t('setup.brandFirst')}
          </option>
          {scope.workspaceItems.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </FieldRow>
    </>
  );
}
