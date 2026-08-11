'use client';

import { Megaphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import {
  CAMPAIGN_HEALTH,
  CAMPAIGN_STAGES,
  ITEM_FLOW,
  ITEM_STATUS,
  campaignTypeStyle,
} from '@/lib/portal-v2/campaigns/constants';
import type {
  CampaignHealth,
  CampaignItemStatus,
  CampaignStage,
  CampaignType,
  ShipGate,
} from '@/lib/portal-v2/campaigns/types';

/** `.stp` + `.sd` — the campaign stage pill, shared by card, table and detail. */
export const StagePill = ({ stage }: { stage: CampaignStage }) => {
  const t = useTranslations('portalV2.campaigns');
  const s = CAMPAIGN_STAGES[stage];
  return (
    <span
      className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap'
      style={{ background: s.bg, color: s.fg }}
    >
      <span
        className='size-1.5 shrink-0 rounded-full'
        style={{ background: s.dot }}
      />
      {t(s.labelKey)}
    </span>
  );
};

/**
 * The operating state, said in one word. Sits next to the stage pill rather
 * than replacing it: the stage is where the campaign is in its life, the health
 * is whether that is going well.
 */
export const HealthBadge = ({
  health,
  withReason = false,
}: {
  health: CampaignHealth;
  withReason?: boolean;
}) => {
  const t = useTranslations('portalV2.campaigns');
  const tone = CAMPAIGN_HEALTH[health.state];
  return (
    <span className='inline-flex items-center gap-2'>
      <span
        className='inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.02em] whitespace-nowrap'
        style={{ background: tone.bg, color: tone.fg }}
        title={t(health.whyKey, health.values)}
      >
        {t(tone.labelKey)}
      </span>
      {withReason ? (
        <span className='text-[12px] text-[var(--pv2-mut)]'>
          {t(health.whyKey, health.values)}
        </span>
      ) : null}
    </span>
  );
};

/** `.gdot` — green when this subject is allowed to ship, hollow when it is not. */
export const GateDot = ({ gate }: { gate: ShipGate }) => {
  const t = useTranslations('portalV2.campaigns');
  const reason = gate.ok
    ? t('gateItemOk')
    : t('gateItemBlocked', {
        checks: gate.missing.map(id => t(`ship_${id}`)).join(', '),
      });

  return (
    <span
      title={reason}
      aria-label={reason}
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        gate.ok
          ? 'bg-[var(--pv2-success)]'
          : 'border-[1.5px] border-[var(--pv2-warning)] bg-transparent'
      )}
    />
  );
};

/** `.cc-i` — the tinted square that stands in for a campaign's type. */
export const TypeSwatch = ({
  type,
  size = 34,
  radius = 10,
}: {
  type: CampaignType | null;
  size?: number;
  radius?: number;
}) => (
  <span
    aria-hidden
    className='grid shrink-0 place-items-center text-[var(--pv2-paper)]'
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      background: campaignTypeStyle(type).color,
    }}
  >
    <Megaphone
      style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }}
      strokeWidth={2}
    />
  </span>
);

/** `.cc-bar` — items at Ready or beyond, over the total. */
export const ProgressBar = ({
  done,
  total,
  pct,
  thick = false,
  className,
}: {
  done: number;
  total: number;
  pct: number;
  thick?: boolean;
  className?: string;
}) => {
  const t = useTranslations('portalV2.campaigns');
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-[var(--pv2-hair)]',
          thick ? 'h-2' : 'h-1.5'
        )}
      >
        <span
          className='block h-full rounded-full transition-[width] duration-300'
          style={{
            width: `${pct}%`,
            background: 'var(--pv2-success)',
          }}
        />
      </span>
      <span
        className={cn(
          'shrink-0 font-semibold whitespace-nowrap tabular-nums',
          thick
            ? 'text-[13px] text-[var(--pv2-ink)]'
            : 'text-[11px] text-[var(--pv2-faint)]'
        )}
      >
        {t('readyOf', { done, total })}
      </span>
    </span>
  );
};

/** `stageBar()` — five pills, filled up to the item's current step. */
export const StageBar = ({
  status,
  showLabel = true,
}: {
  status: CampaignItemStatus;
  showLabel?: boolean;
}) => {
  const t = useTranslations('portalV2.campaigns');
  const current = ITEM_STATUS[status];
  return (
    <span className='flex items-center gap-2'>
      <span className='flex gap-[3px]' aria-hidden>
        {ITEM_FLOW.map(id => (
          <span
            key={id}
            className='h-1 w-3 rounded-full'
            style={{
              background:
                ITEM_STATUS[id].step <= current.step
                  ? current.dot
                  : 'var(--pv2-hair)',
            }}
          />
        ))}
      </span>
      {showLabel ? (
        <span
          className='text-[11.5px] font-semibold whitespace-nowrap'
          style={{ color: current.fg }}
        >
          {t(current.labelKey)}
        </span>
      ) : null}
    </span>
  );
};

/** A 6px dot in the item's stage colour — used inside the card's subject chips. */
export const ItemDot = ({ status }: { status: CampaignItemStatus }) => (
  <span
    aria-hidden
    className='size-1.5 shrink-0 rounded-full'
    style={{ background: ITEM_STATUS[status].dot }}
  />
);

/** `.tag` — the read-mode channel chips in the brief. */
export const ChannelTags = ({
  channels,
  empty,
}: {
  channels: string[];
  empty: string;
}) => {
  if (!channels.length) {
    return (
      <span className='text-[12.5px] text-[var(--pv2-faint)]'>{empty}</span>
    );
  }
  return (
    <span className='flex flex-wrap gap-1.5'>
      {channels.map(channel => (
        <span
          key={channel}
          className='rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11px] font-semibold text-[var(--pv2-mut)]'
        >
          {channel}
        </span>
      ))}
    </span>
  );
};

/** `.subj-k` — the PRODUCT / TOPIC micro-badge on a work row. */
export const SubjectBadge = ({ children }: { children: ReactNode }) => (
  <span className='rounded-[4px] bg-[var(--pv2-canvas)] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
    {children}
  </span>
);

/** `.cb-k` — the uppercase key above a brief value. */
export const BriefLabel = ({ children }: { children: ReactNode }) => (
  <span className='mb-1 block text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
    {children}
  </span>
);
