'use client';

import { ArrowRight, Loader2, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ReadinessSlots } from '@/components/organisms/portal-v2/automation/ReadinessSlots';
import { readinessOf } from '@/lib/portal-v2/automation/readiness';
import type {
  AutomationCampaign,
  AutomationExperience,
  AutomationProduct,
} from '@/lib/portal-v2/automation/types';

/**
 * Bước 1 — dựng master trên MỘT sản phẩm.
 *
 * Master là bản nháp thật của thiết kế, gắn với sản phẩm đã chọn, mở được
 * trong canvas để chỉnh tay. Mọi sản phẩm ở bước 2 thừa hưởng bản ĐÃ CHỈNH này
 * — nên chỉnh ở đây một lần thay vì sửa N bản copy về sau.
 */
export const MasterSetupStep = ({
  experience,
  products,
  campaigns,
  setupProductId,
  campaignId,
  onSetupProductChange,
  onCampaignChange,
  onAdjust,
  adjustBusy,
  adjustError,
  onCancel,
  onNext,
}: {
  experience: AutomationExperience;
  products: AutomationProduct[];
  campaigns: AutomationCampaign[];
  setupProductId: string;
  campaignId: string;
  onSetupProductChange: (id: string) => void;
  onCampaignChange: (id: string) => void;
  onAdjust: () => void;
  /** Đang tạo bản nháp master — khoá nút để không tạo trùng. */
  adjustBusy: boolean;
  /** Tạo master hỏng — nói ra tại chỗ, đừng để người dùng bấm lại trong mù mờ. */
  adjustError: string | null;
  onCancel: () => void;
  onNext: () => void;
}) => {
  const t = useTranslations('portalV2.automation');
  const setupProduct = products.find(p => p.id === setupProductId);
  const readiness = readinessOf(experience, setupProduct);

  const selectClass =
    'h-[34px] w-full rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 text-[13px] text-[var(--pv2-ink)]';

  return (
    <div className='flex flex-col gap-5'>
      <div className='grid gap-4 md:max-w-[620px] md:grid-cols-2'>
        <label className='flex flex-col gap-1.5'>
          <span className='text-[12px] font-semibold text-[var(--pv2-mut)]'>
            {t('setupWith')}
          </span>
          <select
            className={selectClass}
            value={setupProductId}
            disabled={products.length === 0}
            onChange={e => onSetupProductChange(e.target.value)}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.title}
                {p.type ? ` · ${p.type}` : ''}
              </option>
            ))}
          </select>
          {products.length === 0 ? (
            <span className='text-[11.5px] text-[var(--pv2-warning)]'>
              {t('noProducts')}
            </span>
          ) : null}
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='text-[12px] font-semibold text-[var(--pv2-mut)]'>
            {t('intoCampaign')}
          </span>
          <select
            className={selectClass}
            value={campaignId}
            disabled={campaigns.length === 0}
            onChange={e => onCampaignChange(e.target.value)}
          >
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {campaigns.length === 0 ? (
            <span className='text-[11.5px] text-[var(--pv2-warning)]'>
              {t('noCampaigns')}
            </span>
          ) : null}
        </label>
      </div>

      <div className='flex flex-wrap items-center gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'>
        <span
          aria-hidden
          className='size-11 shrink-0 rounded-[var(--pv2-r-sm)]'
          style={{ background: setupProduct?.gradient ?? experience.gradient }}
        />
        <span className='flex min-w-0 flex-1 flex-col gap-1.5'>
          <span className='truncate text-[14px] font-semibold text-[var(--pv2-ink)]'>
            {experience.name} — {setupProduct?.title ?? '—'}
          </span>
          <span className='text-[12px] text-[var(--pv2-mut)]'>
            {t('masterSlots', {
              filled: readiness.filled,
              total: readiness.total,
              product: setupProduct?.title ?? '—',
            })}
          </span>
          <ReadinessSlots readiness={readiness} />
        </span>
        <Button
          variant='ghost'
          size='sm'
          disabled={adjustBusy || !setupProduct}
          onClick={onAdjust}
        >
          {adjustBusy ? (
            <Loader2 className='animate-spin' aria-hidden />
          ) : (
            <Pencil aria-hidden />
          )}
          {adjustBusy ? t('adjustOpening') : t('adjustMaster')}
        </Button>
      </div>

      {adjustError ? (
        <p className='text-[12px] text-[var(--pv2-error)]'>{adjustError}</p>
      ) : null}

      <div className='flex flex-wrap items-center gap-3'>
        <Button variant='ghost' onClick={onCancel}>
          {t('cancel')}
        </Button>
        <span className='max-w-[420px] text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('masterNote')}
        </span>
        <span className='flex-1' />
        <Button variant='primary' disabled={!setupProduct} onClick={onNext}>
          {t('readyToAutomate')}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
};
