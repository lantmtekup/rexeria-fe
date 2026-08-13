'use client';

import {
  BarChart3,
  Clapperboard,
  Headphones,
  Mail,
  MousePointer2,
  Star,
  Store,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import { getSourceTouchpoints } from '@/lib/portal-v2/mining/helpers';
import type {
  MiningSource,
  MiningStage,
  MiningStageId,
} from '@/lib/portal-v2/mining/types';

type SourceCardProps = {
  source: MiningSource;
  stages: MiningStage[];
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
};

const AUTH_KEY: Record<
  MiningSource['auth'],
  'authOauth' | 'authApikey' | 'authSnippet'
> = {
  oauth: 'authOauth',
  apikey: 'authApikey',
  snippet: 'authSnippet',
};

const SOURCE_ICON: Record<string, LucideIcon> = {
  shopify: Store,
  ga4: BarChart3,
  klaviyo: Mail,
  gorgias: Headphones,
  judgeme: Star,
  tag: Tag,
  hotjar: MousePointer2,
  tiktok: Clapperboard,
};

const stageLabel = (stageId: MiningStageId, stages: MiningStage[]): string =>
  stages.find(stage => stage.id === stageId)?.label ?? stageId;

export const SourceCard = ({
  source,
  stages,
  onConnect,
  onDisconnect,
}: SourceCardProps) => {
  const t = useTranslations('portalV2.sources');
  const touchpoints = getSourceTouchpoints(source);
  const Icon = SOURCE_ICON[source.id] ?? Store;
  const isError = source.status === 'error';
  const isConnected = source.status === 'connected';
  const isOff = source.status === 'off';

  return (
    <article
      className={cn(
        'group flex min-h-[220px] flex-col overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)]',
        'transition-[box-shadow,border-color] duration-[140ms]',
        isError
          ? 'border-[color-mix(in_srgb,var(--pv2-error)_45%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_4%,var(--pv2-paper))]'
          : 'border-[var(--pv2-hair)] hover:border-[color-mix(in_srgb,var(--pv2-electric)_28%,var(--pv2-hair))] hover:shadow-[var(--pv2-sh-sm)]',
        isOff && 'bg-[var(--pv2-canvas)]'
      )}
    >
      <div className='flex flex-1 flex-col gap-4 p-4 md:p-5'>
        <div className='flex items-start gap-3'>
          <span
            aria-hidden
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-[var(--pv2-r)]',
              isConnected &&
                'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
              isError &&
                'bg-[color-mix(in_srgb,var(--pv2-error)_12%,var(--pv2-paper))] text-[var(--pv2-error)]',
              isOff && 'bg-[var(--pv2-paper)] text-[var(--pv2-faint)]'
            )}
          >
            <Icon className='size-[18px]' strokeWidth={1.75} />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
                {source.name}
              </h3>
              {source.own ? (
                <span className='rounded-md bg-[color-mix(in_srgb,var(--pv2-violet)_12%,var(--pv2-paper))] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--pv2-violet)]'>
                  {t('firstParty')}
                </span>
              ) : null}
            </div>
            <p className='mt-0.5 text-[11px] text-[var(--pv2-mut)]'>
              {t(AUTH_KEY[source.auth])}
            </p>
          </div>
        </div>

        {source.entities ? (
          <p className='text-[13px] leading-5 text-[var(--pv2-mut)]'>
            {source.entities}
          </p>
        ) : null}

        {source.covers.length ? (
          <div className='flex flex-wrap gap-1.5'>
            {source.covers.map(stageId => (
              <span
                key={stageId}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-medium text-[var(--pv2-mut)] ring-1 ring-[var(--pv2-hair)] ring-inset',
                  isOff ? 'bg-[var(--pv2-paper)]' : 'bg-[var(--pv2-canvas)]'
                )}
              >
                {stageLabel(stageId, stages)}
              </span>
            ))}
          </div>
        ) : null}

        {touchpoints.length ? (
          <p className='text-[12px] leading-5 text-[var(--pv2-faint)]'>
            <span className='font-semibold text-[var(--pv2-mut)]'>
              {t('observes')}
            </span>{' '}
            {touchpoints.join(', ')}
          </p>
        ) : null}

        {isError && source.err ? (
          <p className='rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-error)_8%,var(--pv2-paper))] px-2.5 py-2 text-[12px] leading-5 text-[var(--pv2-error)]'>
            {source.err}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          'mt-auto flex items-center gap-3 border-t border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3 md:px-5',
          isError ? 'justify-end' : 'justify-between'
        )}
      >
        {isError ? null : (
          <p className='min-w-0 truncate text-[11px] text-[var(--pv2-faint)]'>
            {isConnected ? source.fresh : t('notConnected')}
          </p>
        )}
        {isConnected ? (
          <Button
            variant='ghost'
            size='sm'
            aria-label={t('disconnectAria', { name: source.name })}
            onClick={() => onDisconnect(source.id)}
          >
            {t('disconnect')}
          </Button>
        ) : (
          <Button
            variant='primary'
            size='sm'
            aria-label={
              isError
                ? t('reconnectAria', { name: source.name })
                : t('connectAria', { name: source.name })
            }
            onClick={() => onConnect(source.id)}
          >
            {isError ? t('reconnect') : t('connect')}
          </Button>
        )}
      </div>
    </article>
  );
};
