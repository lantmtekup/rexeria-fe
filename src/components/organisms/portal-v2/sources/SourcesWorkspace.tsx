'use client';

import { Beaker } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { GlossaryTip } from '@/components/molecules/portal-v2/GlossaryTip';
import { CoverageMeter } from '@/components/organisms/portal-v2/mining/CoverageMeter';
import { DisconnectSourceModal } from '@/components/organisms/portal-v2/sources/DisconnectSourceModal';
import { SourceCard } from '@/components/organisms/portal-v2/sources/SourceCard';
import {
  countSourceCitations,
  getMiningCoverage,
} from '@/lib/portal-v2/mining/helpers';
import { useMiningData } from '@/lib/portal-v2/mining/MiningDataProvider';
import type {
  MiningSource,
  MiningSourceStatus,
} from '@/lib/portal-v2/mining/types';

const GROUP_ORDER: Array<{
  status: MiningSourceStatus;
  headingKey: 'groupConnected' | 'groupAttention' | 'groupAvailable';
}> = [
  { status: 'connected', headingKey: 'groupConnected' },
  { status: 'error', headingKey: 'groupAttention' },
  { status: 'off', headingKey: 'groupAvailable' },
];

export const SourcesWorkspace = () => {
  const t = useTranslations('portalV2.sources');
  const { data, connectSource, disconnectSource } = useMiningData();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const coverage = getMiningCoverage(data);
  const pending = data.sources.find(source => source.id === pendingId) ?? null;
  const pendingCitations = pending ? countSourceCitations(pending.id, data) : 0;

  const groups = useMemo(
    () =>
      GROUP_ORDER.map(group => ({
        ...group,
        sources: data.sources.filter(source => source.status === group.status),
      })).filter(group => group.sources.length > 0),
    [data.sources]
  );

  const handleConnect = (id: string) => {
    const result = connectSource(id);
    if (!result.ok) {
      toast.error(t('actionFailed'));
      return;
    }
    toast.success(t('toastConnected', { name: result.source.name }));
  };

  const handleDisconnectRequest = (id: string) => {
    setPendingId(id);
  };

  const handleDisconnectConfirm = () => {
    if (!pending) return;
    const result = disconnectSource(pending.id);
    setPendingId(null);
    if (!result.ok) {
      toast.error(t('actionFailed'));
      return;
    }
    toast.success(t('toastDisconnected'));
  };

  const renderGroup = (
    headingKey: 'groupConnected' | 'groupAttention' | 'groupAvailable',
    sources: MiningSource[]
  ) => (
    <section key={headingKey} className='space-y-3.5'>
      <div className='flex items-baseline gap-2'>
        <h2 className='text-[13px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
          {t(headingKey)}
        </h2>
        <span className='text-[12px] text-[var(--pv2-faint)]'>
          {t('groupCount', { count: sources.length })}
        </span>
      </div>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {sources.map(source => (
          <SourceCard
            key={source.id}
            source={source}
            stages={data.stages}
            onConnect={handleConnect}
            onDisconnect={handleDisconnectRequest}
          />
        ))}
      </div>
    </section>
  );

  return (
    <div className='flex min-h-0 flex-col'>
      <header className='pv2-page-header'>
        <div className='flex w-full flex-wrap items-end justify-between gap-5 px-5 pt-6 pb-4 md:px-8'>
          <div>
            <p className='text-[10px] font-bold tracking-[0.16em] text-[var(--pv2-electric)] uppercase'>
              {t('eyebrow')}
            </p>
            <h1 className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-3xl text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>
          <Button asChild variant='ghost'>
            <Link href='/portal-v2/mining'>
              <Beaker aria-hidden />
              {t('openAudit')}
            </Link>
          </Button>
        </div>
      </header>

      <CoverageMeter
        stages={data.stages}
        covered={coverage}
        label={t('coverage')}
        summary={t('coverageSummary', {
          covered: coverage.size,
          total: data.stages.length,
        })}
        tip={<GlossaryTip term='journeyCoverage' />}
      />

      <main className='w-full space-y-8 px-5 py-6 md:px-8'>
        {groups.map(group => renderGroup(group.headingKey, group.sources))}
      </main>

      <DisconnectSourceModal
        source={pending}
        citations={pendingCitations}
        open={Boolean(pending)}
        onClose={() => setPendingId(null)}
        onConfirm={handleDisconnectConfirm}
      />
    </div>
  );
};
