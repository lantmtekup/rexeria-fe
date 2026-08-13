'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

/**
 * Bậc tin cậy của một phép đo — `high | directional | early | unmeasured`.
 *
 * Thay chỗ `HealthBadge` từng đứng ở màn này. Hai thứ nói hai chuyện khác nhau:
 * health là tình trạng QUY TRÌNH (trễ hạn, còn thiếu bước) và thuộc màn Chiến
 * dịch; ở màn đo lường, câu hỏi duy nhất là con số bên cạnh có đủ mẫu để tin
 * hay không. Bậc do BE chấm — FE không tự đặt ngưỡng, hai bên lệch nhau là mở
 * đường cho một màn nói "đủ tin" trong khi màn kia nói "mẫu mỏng".
 */
const KNOWN = ['high', 'directional', 'early', 'unmeasured'] as const;

type KnownTier = (typeof KNOWN)[number];

const isKnown = (tier: string): tier is KnownTier =>
  (KNOWN as readonly string[]).includes(tier);

export const TierChip = ({ tier }: { tier: string }) => {
  const t = useTranslations('portalV2.analytics');
  if (!tier) return null;

  const tone =
    tier === 'high'
      ? 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[color-mix(in_srgb,var(--pv2-success)_80%,var(--pv2-ink))]'
      : tier === 'directional'
        ? 'bg-[color-mix(in_srgb,var(--pv2-electric)_12%,transparent)] text-[var(--pv2-electric)]'
        : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold',
        tone
      )}
    >
      {/* Bậc lạ (BE thêm bậc mới) hiện nguyên văn — im lặng bỏ qua thì màn
          hình mất luôn cảnh báo mẫu mỏng mà không ai biết. */}
      {isKnown(tier) ? t(`tier.${tier}`) : tier}
    </span>
  );
};
