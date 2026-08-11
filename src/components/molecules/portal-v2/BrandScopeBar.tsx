'use client';

import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { PortalScope } from '@/services/portal-v2/scope';

/**
 * Thanh cho biết ĐANG SỬA HỒ SƠ CỦA BRAND NÀO — dùng chung cho mọi màn v2.
 *
 * Với người dùng thường, brand suy ra từ membership nên thanh này im lặng
 * (không có gì để chọn thì đừng bày thêm một ô chọn).
 *
 * Với ADMIN — người không thuộc brand nào và thao tác chéo mọi brand — nó là
 * bắt buộc. Không có nó thì màn hình hiện hồ sơ của một brand ngẫu nhiên và
 * người dùng sửa nhầm mà không biết; đó là chuyện đã xảy ra thật.
 *
 * Lựa chọn ghi vào `?brand=` chứ không phải localStorage: server component đọc
 * được ngay ở lần render đầu, link chia sẻ được, và không lệch SSR/hydrate.
 */
export const BrandScopeBar = ({ scope }: { scope: PortalScope }) => {
  const t = useTranslations('portalV2.shell');
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Không có gì để chọn ⇒ không bày ra.
  if (!scope.brands.length) return null;

  const change = (id: string) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set('brand', id);
    else next.delete('brand');
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div
      className={
        scope.needsPick
          ? 'border-b border-[var(--pv2-warning)] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,transparent)]'
          : 'border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]'
      }
    >
      <div className='mx-auto flex w-full flex-wrap items-center gap-2.5 px-5 py-2 md:px-8'>
        <Building2
          className='size-3.5 shrink-0 text-[var(--pv2-mut)]'
          strokeWidth={2}
          aria-hidden
        />
        <span className='text-[12px] font-semibold text-[var(--pv2-mut)]'>
          {t('scopeLabel')}
        </span>
        <select
          value={scope.brandId ?? ''}
          onChange={e => change(e.target.value)}
          aria-label={t('scopeLabel')}
          className='h-[28px] max-w-[280px] rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2 text-[12.5px] text-[var(--pv2-ink)]'
        >
          <option value=''>{t('scopePlaceholder')}</option>
          {scope.brands.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        {scope.needsPick ? (
          <span className='text-[11.5px] text-[var(--pv2-warning)]'>
            {t('scopeNeedsPick')}
          </span>
        ) : null}
      </div>
    </div>
  );
};
