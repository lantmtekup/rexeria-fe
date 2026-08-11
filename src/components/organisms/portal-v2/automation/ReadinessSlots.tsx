'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import type { Readiness } from '@/lib/portal-v2/automation/types';

/**
 * Hàng chip 5 ô phễu của một sản phẩm.
 *
 * Ô lấp được thì tô đặc, ô thiếu để rỗng và viền đứt — nhìn lướt là thấy chỗ
 * hổng mà không cần đọc chữ. `title` mang câu giải thích đầy đủ cho ai rê chuột.
 */
export const ReadinessSlots = ({ readiness }: { readiness: Readiness }) => {
  const t = useTranslations('portalV2.automation');

  if (readiness.total === 0) return null;

  return (
    <div className='flex flex-wrap gap-1'>
      {readiness.slots.map(slot => (
        <span
          key={slot.role}
          title={
            slot.ok
              ? t('slotFilled', { role: slot.role })
              : t('slotGap', { need: t(slot.needKey) })
          }
          className={cn(
            'rounded-full px-2 py-[3px] text-[10px] font-bold tracking-[0.04em]',
            slot.ok
              ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
              : 'border border-dashed border-[var(--pv2-slate-300)] text-[var(--pv2-faint)]'
          )}
        >
          {slot.role}
        </span>
      ))}
    </div>
  );
};
