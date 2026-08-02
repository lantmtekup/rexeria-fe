'use client';

import { Plus, Sparkles, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  EmptyState,
  ProductThumb,
} from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import {
  CAMPAIGN_ITEM_STATUS,
  CAMPAIGN_STATUS,
} from '@/lib/portal-v2/product/constants';
import type {
  Product,
  ProductCampaignLink,
  ProductExperienceLink,
} from '@/lib/portal-v2/product/types';

type ProductRelatedPanelProps = {
  kind: 'experiences' | 'campaigns';
  product: Product;
  experiences: ProductExperienceLink[];
  campaigns: ProductCampaignLink[];
};

const rowClass = cn(
  'flex w-full cursor-pointer items-center gap-3 rounded-[var(--pv2-r-sm)] px-3 py-2.5',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-left transition-colors',
  'hover:border-[var(--pv2-slate-300)] hover:shadow-[var(--pv2-sh-sm)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

export const ProductRelatedPanel = ({
  kind,
  product,
  experiences,
  campaigns,
}: ProductRelatedPanelProps) => {
  const t = useTranslations('portalV2.products');

  if (kind === 'experiences') {
    if (!experiences.length) {
      return (
        <EmptyState
          dashed={false}
          icon={<Sparkles className='size-6' strokeWidth={1.6} aria-hidden />}
          title={t('expEmptyTitle')}
          action={
            <Button
              variant='primary'
              size='sm'
              onClick={() => toast.message(t('toastBuildExperience'))}
            >
              <Plus className='size-3' strokeWidth={2.4} aria-hidden />
              {t('buildExperience')}
            </Button>
          }
        >
          {t('expEmptyBody', { name: product.title })}
        </EmptyState>
      );
    }

    return (
      <div className='flex flex-col gap-2'>
        {experiences.map(e => (
          <button
            key={e.id}
            type='button'
            className={rowClass}
            onClick={() => toast.message(e.name)}
          >
            <ProductThumb letter={e.name[0] ?? '?'} size={36} />
            <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='flex items-center gap-2 truncate text-[13.5px] font-bold text-[var(--pv2-ink)]'>
                {e.name}
                {e.proven ? (
                  <span className='rounded-full bg-[var(--pv2-electric-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--pv2-electric)]'>
                    {t('proven')}
                  </span>
                ) : null}
              </span>
              <span className='truncate text-[11.5px] text-[var(--pv2-faint)]'>
                {e.catName} · {e.home}
              </span>
            </span>
            <span
              className={cn(
                'shrink-0 text-[12px] font-semibold',
                e.lift === null
                  ? 'text-[var(--pv2-mut)]'
                  : e.lift >= 0
                    ? 'text-[var(--pv2-success)]'
                    : 'text-[var(--pv2-error)]'
              )}
            >
              {e.sessions === null || e.lift === null
                ? t('notYetRun')
                : `${e.sessions.toLocaleString()} ${t('sessions')} · ${
                    e.lift >= 0 ? '+' : '−'
                  }${Math.abs(Math.round(e.lift * 100))}%`}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <EmptyState
        dashed={false}
        icon={<Target className='size-6' strokeWidth={1.6} aria-hidden />}
        title={t('campEmptyTitle')}
      >
        {t('campEmptyBody', { name: product.title })}
      </EmptyState>
    );
  }

  return (
    <div className='flex flex-col gap-2'>
      {campaigns.map(c => {
        const cs = CAMPAIGN_STATUS[c.campaignStatus];
        const is = CAMPAIGN_ITEM_STATUS[c.itemStatus];
        return (
          <button
            key={c.campaignId}
            type='button'
            className={rowClass}
            onClick={() => toast.message(c.campaignName)}
          >
            <span
              className='size-[9px] shrink-0 rounded-full'
              style={{ background: cs.dot }}
            />
            <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className='truncate text-[13.5px] font-bold text-[var(--pv2-ink)]'>
                {c.campaignName}
              </span>
              <span className='truncate text-[11.5px] text-[var(--pv2-faint)]'>
                {cs.name} ·{' '}
                {t('experiencesOnThisProduct', { count: c.expCount })}
              </span>
            </span>
            <span
              className='shrink-0 rounded-full px-2.5 py-[3px] text-[10.5px] font-bold'
              style={{ background: cs.bg, color: is.fg }}
            >
              {is.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
