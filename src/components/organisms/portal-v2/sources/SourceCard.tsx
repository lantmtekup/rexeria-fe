'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import type { AuditSource } from '@/lib/portal-v2/journey-audit/types';

type SourceCardProps = {
  source: AuditSource;
  /** Số touchpoint trong các journey audit mà nguồn này nuôi. */
  feeds: number;
  /** Card ở mục Recommended next — các stage nó vá được. */
  reason?: string | null;
  onConnect: (providerId: string) => void;
  onDisconnect: (sourceId: string) => void;
  onSync: (source: AuditSource) => void;
};

const authLine = (source: AuditSource, readOnly: string): string =>
  source.auth === 'OAuth' || source.auth === 'API key'
    ? `${source.auth} · ${readOnly}`
    : source.auth;

/** Card nguồn theo prototype — biến thể connected/attention và available. */
export const SourceCard = ({
  source,
  feeds,
  reason,
  onConnect,
  onDisconnect,
  onSync,
}: SourceCardProps) => {
  const t = useTranslations('portalV2.sources');
  const connectedLike =
    source.status === 'connected' || source.status === 'attention';

  const stageChips = (
    <div className='flex flex-wrap gap-1.5'>
      {source.stages.map(stage => (
        <span
          key={stage}
          className='text-2xs rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-2.5 py-0.5 font-semibold text-[var(--pv2-mut)]'
        >
          {stage}
        </span>
      ))}
    </div>
  );

  const head = (
    <div className='flex items-center gap-3'>
      <span
        aria-hidden
        className='grid size-11 shrink-0 place-items-center rounded-[var(--pv2-r)] bg-[var(--pv2-electric-soft)] text-[21px]'
      >
        {source.icon}
      </span>
      <div className='min-w-0'>
        <div className='flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-base font-bold text-[var(--pv2-ink)]'>
          <span className='truncate'>{source.name}</span>
          {source.firstParty ? (
            <span className='text-3xs shrink-0 rounded-full bg-[var(--pv2-electric-soft)] px-2 py-0.5 font-bold text-[var(--pv2-electric)]'>
              {t('firstParty')}
            </span>
          ) : null}
        </div>
        <p className='mt-0.5 text-xs text-[var(--pv2-faint)]'>
          {authLine(source, t('readOnlyLock'))}
          {!connectedLike ? ` · ${source.category}` : ''}
        </p>
      </div>
    </div>
  );

  if (connectedLike) {
    return (
      <article
        className={cn(
          'flex flex-col gap-2.5 rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)] px-4 py-4',
          source.status === 'attention'
            ? 'border-[color-mix(in_srgb,var(--pv2-warning)_45%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_4%,var(--pv2-paper))]'
            : 'border-[var(--pv2-hair)]'
        )}
      >
        {head}
        {source.status === 'attention' && source.issue ? (
          <p className='flex gap-2 rounded-[var(--pv2-r-sm)] border border-[color-mix(in_srgb,var(--pv2-warning)_40%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-warning)_10%,var(--pv2-paper))] px-2.5 py-2 text-xs leading-relaxed text-[color-mix(in_srgb,var(--pv2-warning)_75%,var(--pv2-ink))]'>
            ⚠️ {source.issue}
          </p>
        ) : null}
        {source.stats ? (
          <p className='text-[13px] text-[var(--pv2-ink)]'>{source.stats}</p>
        ) : null}
        {stageChips}
        {source.observes ? (
          <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
            <b className='text-[var(--pv2-ink)]'>{t('observes')}</b>{' '}
            {source.observes}
          </p>
        ) : null}
        <p
          className={cn(
            'text-2xs w-fit rounded-[var(--pv2-r-sm)] px-2.5 py-1.5 font-semibold',
            feeds
              ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
              : 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
          )}
        >
          {feeds ? t('feeds', { count: feeds }) : t('feedsNone')}
        </p>
        <div className='mt-auto flex items-center border-t border-[var(--pv2-hair)] pt-2.5'>
          <span className='text-2xs flex items-center gap-1.5 text-[var(--pv2-faint)]'>
            {source.lastSync === 'live' ? (
              <>
                <span className='size-[7px] rounded-full bg-[var(--pv2-success)]' />
                {t('syncLive')}
              </>
            ) : (
              t('syncedAt', { sync: source.lastSync ?? '—' })
            )}
          </span>
          <span className='ml-auto flex gap-2'>
            {source.status === 'attention' ? (
              <Button
                variant='primary'
                size='sm'
                onClick={() => onConnect(source.provider)}
              >
                {t('reconnect')}
              </Button>
            ) : (
              <Button variant='ghost' size='sm' onClick={() => onSync(source)}>
                {t('syncNow')}
              </Button>
            )}
            <Button
              variant='ghost'
              size='sm'
              aria-label={t('disconnectAria', { name: source.name })}
              onClick={() => onDisconnect(source.id)}
            >
              {t('disconnect')}
            </Button>
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className='flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-4'>
      {head}
      {reason ? (
        <p className='text-2xs font-semibold text-[var(--pv2-electric)]'>
          ◆ {t('closesGap', { stages: reason })}
        </p>
      ) : null}
      {source.value ? (
        <p className='text-xs leading-relaxed text-[var(--pv2-mut)]'>
          {source.value}
        </p>
      ) : null}
      {stageChips}
      <p className='text-2xs w-fit rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-success)_8%,var(--pv2-paper))] px-2.5 py-1.5 font-semibold text-[var(--pv2-success)]'>
        ＋ {feeds ? t('unlocksTouchpoints', { count: feeds }) : source.unlocks}
      </p>
      <div className='mt-auto flex items-center border-t border-[var(--pv2-hair)] pt-2.5'>
        <span className='text-2xs text-[var(--pv2-faint)]'>
          {t('setupTime')}
        </span>
        <Button
          variant='primary'
          size='sm'
          className='ml-auto'
          aria-label={t('connectAria', { name: source.name })}
          onClick={() => onConnect(source.provider)}
        >
          {t('connect')}
        </Button>
      </div>
    </article>
  );
};
