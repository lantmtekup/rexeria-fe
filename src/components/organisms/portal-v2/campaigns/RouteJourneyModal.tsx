'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import { routeMastersFor } from '@/lib/portal-v2/campaigns/journeyLink';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type RouteJourneyModalProps = {
  campaignName: string;
  blueprints: Journey[];
  /** The blueprint currently behind this campaign's fork, if any. */
  currentOrigin: string | null;
  /** True when swapping a route the work already carries. */
  replacing: boolean;
  onClose: () => void;
  onPick: (blueprintId: string) => void;
};

/**
 * `croute` — pick the route this campaign runs on.
 *
 * Picking forks the blueprint: the copy is this campaign's to edit, and the
 * library is left exactly as it was. Swapping a route on a campaign that already
 * has work carries the new route's experiences in alongside the old ones rather
 * than deleting anything — nobody's afternoon disappears because of a click here.
 */
export const RouteJourneyModal = ({
  campaignName,
  blueprints,
  currentOrigin,
  replacing,
  onClose,
  onPick,
}: RouteJourneyModalProps) => {
  const t = useTranslations('portalV2.campaigns');
  const [picked, setPicked] = useState<string | null>(currentOrigin);

  return (
    <Modal
      open
      onClose={onClose}
      title={t('routeTitle')}
      subtitle={t('routeSub', { campaign: campaignName })}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='primary'
            disabled={!picked || picked === currentOrigin}
            onClick={() => {
              if (picked) onPick(picked);
            }}
          >
            {t('routeConfirm')}
          </Button>
        </>
      }
    >
      {replacing ? (
        <p className='mb-4 rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('routeReplaceNote')}
        </p>
      ) : null}

      {blueprints.length ? (
        <div className='flex flex-col gap-2'>
          {blueprints.map(blueprint => {
            const on = picked === blueprint.id;
            const stages = routeMastersFor(blueprint.id, blueprints).length;
            return (
              <button
                key={blueprint.id}
                type='button'
                aria-pressed={on}
                onClick={() => setPicked(blueprint.id)}
                className={cn(
                  'cursor-pointer rounded-[var(--pv2-r)] border px-4 py-3.5 text-left transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  on
                    ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
                    : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]'
                )}
              >
                <span className='flex items-center justify-between gap-3'>
                  <span className='truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                    {blueprint.name}
                  </span>
                  {on ? (
                    <Check
                      className='size-4 shrink-0 text-[var(--pv2-electric)]'
                      strokeWidth={2.6}
                      aria-hidden
                    />
                  ) : null}
                </span>
                <span className='mt-1 block text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {blueprint.tagline}
                </span>
                <span className='mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1.5'>
                  {blueprint.nodes.slice(0, 4).map((node, index, all) => (
                    <span key={node.id} className='flex items-center gap-1.5'>
                      <span className='rounded-full bg-[var(--pv2-paper)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--pv2-faint)]'>
                        {node.name}
                      </span>
                      {index < all.length - 1 ? (
                        <ArrowRight
                          className='size-2.5 text-[var(--pv2-faint)]'
                          strokeWidth={2.4}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                  ))}
                </span>
                {stages ? (
                  <span className='mt-2 block text-[11px] text-[var(--pv2-faint)]'>
                    {t('routeCarries', { count: stages })}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <p className='py-6 text-center text-[12.5px] text-[var(--pv2-faint)]'>
          {t('routeNoBlueprints')}
        </p>
      )}
    </Modal>
  );
};
