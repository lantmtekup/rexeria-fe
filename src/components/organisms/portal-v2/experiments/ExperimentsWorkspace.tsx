'use client';

import {
  ArrowLeft,
  ArrowRight,
  Beaker,
  CheckCircle2,
  FlaskConical,
  Gauge,
  OctagonX,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ExperimentDailyChart } from '@/components/organisms/portal-v2/experiments/ExperimentDailyChart';
import { ExperimentEndModal } from '@/components/organisms/portal-v2/experiments/ExperimentEndModal';
import { ExperimentStatusChip } from '@/components/organisms/portal-v2/experiments/ExperimentStatusChip';
import { cn } from '@/lib/cn';
import { writeExperimentIdParam } from '@/lib/portal-v2/experiments/idParam';
import { EXPERIMENT_SHIP_GATE } from '@/lib/portal-v2/experiments/constants';
import {
  findExperimentOpportunity,
  findExperimentOption,
  getExperimentCvr,
  getExperimentInFlight,
  getExperimentLift,
  getExperimentRecoveredMonthly,
} from '@/lib/portal-v2/experiments/helpers';
import { useExperimentsData } from '@/lib/portal-v2/experiments/ExperimentsDataProvider';
import type {
  Experiment,
  ExperimentStatus,
} from '@/lib/portal-v2/experiments/types';
import { formatCount, formatMoney } from '@/lib/portal-v2/format';

type ExperimentsWorkspaceProps = {
  initialExperimentId: string | null;
};

const isActiveExperiment = (experiment: Experiment): boolean =>
  experiment.status === 'running' || experiment.status === 'draft';

type SummaryTileProps = {
  label: string;
  value: string;
  note: string;
  icon: typeof TrendingUp;
  tone?: 'default' | 'success' | 'electric';
};

const SummaryTile = ({
  label,
  value,
  note,
  icon: Icon,
  tone = 'default',
}: SummaryTileProps) => (
  <div className='border-r border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4 last:border-r-0 md:p-5'>
    <div
      className={cn(
        'grid size-8 place-items-center rounded-[var(--pv2-r-sm)]',
        tone === 'success' &&
          'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
        tone === 'electric' &&
          'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
        tone === 'default' && 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
      )}
    >
      <Icon className='size-4' aria-hidden />
    </div>
    <p className='mt-3 text-[10px] font-bold tracking-[0.11em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </p>
    <strong className='mt-1 block font-[family-name:var(--pv2-disp)] text-2xl tracking-[-0.04em] text-[var(--pv2-ink)]'>
      {value}
    </strong>
    <span className='mt-0.5 block text-[10px] text-[var(--pv2-mut)]'>
      {note}
    </span>
  </div>
);

export const ExperimentsWorkspace = ({
  initialExperimentId,
}: ExperimentsWorkspaceProps) => {
  const t = useTranslations('portalV2.experiments');
  const { data, stopExperiment, concludeExperiment } = useExperimentsData();
  const validInitialId = data.experiments.some(
    experiment => experiment.id === initialExperimentId
  )
    ? initialExperimentId
    : null;
  const [selectedId, setSelectedId] = useState<string | null>(validInitialId);
  const [endModalOpen, setEndModalOpen] = useState(false);

  const selected =
    data.experiments.find(experiment => experiment.id === selectedId) ?? null;
  const active = data.experiments.filter(isActiveExperiment);
  const completed = data.experiments.filter(
    experiment => !isActiveExperiment(experiment)
  );
  const recovered = data.experiments
    .filter(experiment => experiment.status === 'won')
    .reduce(
      (total, experiment) =>
        total + getExperimentRecoveredMonthly(experiment, data),
      0
    );
  const inFlight = data.experiments
    .filter(experiment => experiment.status === 'running')
    .reduce(
      (total, experiment) => total + getExperimentInFlight(experiment, data),
      0
    );
  const runningCount = data.experiments.filter(
    experiment => experiment.status === 'running'
  ).length;

  const statusLabel = (status: ExperimentStatus): string => {
    if (status === 'running') return t('statusRunning');
    if (status === 'draft') return t('statusDraft');
    if (status === 'won') return t('statusWon');
    if (status === 'lost') return t('statusLost');
    return t('statusStopped');
  };

  const handleOpen = (id: string) => {
    setSelectedId(id);
    writeExperimentIdParam(id);
  };

  const handleBack = () => {
    setSelectedId(null);
    writeExperimentIdParam(null);
  };

  const handleStop = () => {
    if (!selected) return;
    const result = stopExperiment(selected.id);
    if (!result.ok) {
      toast.error(t('actionFailed'));
      return;
    }
    setEndModalOpen(false);
    toast.success(t('toastStopped', { name: result.experiment.name }));
  };

  const handleConclude = () => {
    if (!selected) return;
    const result = concludeExperiment(selected.id);
    if (!result.ok) {
      toast.error(t('actionFailed'));
      return;
    }
    setEndModalOpen(false);
    toast.success(
      result.experiment.status === 'won'
        ? t('toastWon', { name: result.experiment.name })
        : t('toastLost', { name: result.experiment.name })
    );
  };

  const renderRow = (experiment: Experiment) => {
    const opportunity = findExperimentOpportunity(experiment, data);
    const sessions = experiment.a.sess + experiment.b.sess;
    const lift = getExperimentLift(experiment);
    return (
      <button
        key={experiment.id}
        type='button'
        onClick={() => handleOpen(experiment.id)}
        aria-label={t('openExperiment', { name: experiment.name })}
        className='grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--pv2-hair)] px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-[var(--pv2-canvas)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none md:grid-cols-[minmax(0,1.5fr)_minmax(120px,0.7fr)_minmax(110px,0.55fr)_auto]'
      >
        <span className='min-w-0'>
          <strong className='block truncate text-[13px] text-[var(--pv2-ink)]'>
            {experiment.name}
          </strong>
          <span className='mt-0.5 block truncate text-[10px] text-[var(--pv2-mut)]'>
            {opportunity?.title ?? t('unknownLeak')}
          </span>
        </span>
        <span className='hidden text-[11px] text-[var(--pv2-mut)] md:block'>
          {experiment.days
            ? t('daysAndSessions', {
                days: experiment.days,
                sessions: formatCount(sessions),
              })
            : t('notStarted')}
        </span>
        <span className='hidden text-right md:block'>
          <strong className='block text-[12px] text-[var(--pv2-ink)]'>
            {experiment.a.sess
              ? `${lift >= 0 ? '+' : ''}${lift.toFixed(1)}%`
              : '—'}
          </strong>
          <span className='text-[10px] text-[var(--pv2-faint)]'>
            {experiment.sig}% {t('sigShort')}
          </span>
        </span>
        <span className='flex items-center gap-2'>
          <ExperimentStatusChip
            status={experiment.status}
            label={statusLabel(experiment.status)}
          />
          <ArrowRight
            className='size-3.5 text-[var(--pv2-faint)]'
            aria-hidden
          />
        </span>
      </button>
    );
  };

  const listView = (
    <>
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
              {t('subtitle', { gate: EXPERIMENT_SHIP_GATE })}
            </p>
          </div>
          <Button asChild variant='primary'>
            <Link href='/portal-v2/journey-audit'>
              <Beaker aria-hidden />
              {t('newExperiment')}
            </Link>
          </Button>
        </div>
      </header>

      <main className='w-full space-y-5 px-5 py-5 md:px-8'>
        <section
          aria-label={t('summaryAria')}
          className='grid overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] md:grid-cols-3'
        >
          <SummaryTile
            label={t('shippedRecovery')}
            value={formatMoney(recovered)}
            note={t('perMonthRecovered')}
            icon={CheckCircle2}
            tone='success'
          />
          <SummaryTile
            label={t('inFlight')}
            value={formatMoney(inFlight)}
            note={t('observedVariantGain')}
            icon={TrendingUp}
            tone='electric'
          />
          <SummaryTile
            label={t('activeTests')}
            value={`${runningCount}/${data.experiments.length}`}
            note={t('runningOfTotal')}
            icon={FlaskConical}
          />
        </section>

        <section className='overflow-hidden rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <div className='border-b border-[var(--pv2-hair)] px-4 py-3'>
            <h2 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('activeHeading')} · {active.length}
            </h2>
          </div>
          {active.length ? (
            active.map(renderRow)
          ) : (
            <p className='px-4 py-8 text-center text-xs text-[var(--pv2-faint)]'>
              {t('activeEmpty')}
            </p>
          )}
        </section>

        <section className='overflow-hidden rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <div className='border-b border-[var(--pv2-hair)] px-4 py-3'>
            <h2 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('completedHeading')} · {completed.length}
            </h2>
          </div>
          {completed.length ? (
            completed.map(renderRow)
          ) : (
            <p className='px-4 py-8 text-center text-xs text-[var(--pv2-faint)]'>
              {t('completedEmpty')}
            </p>
          )}
        </section>
      </main>
    </>
  );

  const detailView = useMemo(() => {
    if (!selected) return null;
    const opportunity = findExperimentOpportunity(selected, data);
    const option = findExperimentOption(selected, data);
    const lift = getExperimentLift(selected);
    const gateOpen = selected.sig >= EXPERIMENT_SHIP_GATE;
    const recoveredMonthly = getExperimentRecoveredMonthly(selected, data);

    return (
      <>
        <header className='pv2-page-header'>
          <div className='w-full px-5 pt-5 pb-4 md:px-8'>
            <button
              type='button'
              onClick={handleBack}
              className='inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
            >
              <ArrowLeft className='size-3.5' aria-hidden />
              {t('backToList')}
            </button>
            <div className='mt-4 flex flex-wrap items-end justify-between gap-4'>
              <div className='min-w-0'>
                <Link
                  href='/portal-v2/journey-audit'
                  className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-electric)] uppercase hover:underline'
                >
                  {t('fromLeak', {
                    leak: opportunity?.title ?? t('unknownLeak'),
                  })}
                </Link>
                <h1 className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
                  {selected.name}
                </h1>
                <p className='mt-1 text-[12px] text-[var(--pv2-mut)]'>
                  {selected.metric}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <ExperimentStatusChip
                  status={selected.status}
                  label={statusLabel(selected.status)}
                />
                {selected.status === 'running' ? (
                  <Button
                    variant={gateOpen ? 'primary' : 'ghost'}
                    onClick={() => setEndModalOpen(true)}
                  >
                    {gateOpen ? (
                      <CheckCircle2 aria-hidden />
                    ) : (
                      <OctagonX aria-hidden />
                    )}
                    {gateOpen ? t('concludeAtGate') : t('endTest')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className='w-full space-y-5 px-5 py-5 md:px-8'>
          <section className='border-l-2 border-[var(--pv2-electric)] bg-[var(--pv2-paper)] px-4 py-3'>
            <p className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('hypothesis')}
            </p>
            <p className='mt-1 text-[13px] leading-6 text-[var(--pv2-ink)]'>
              {selected.hypothesis}
            </p>
          </section>

          <section className='grid gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-2 xl:grid-cols-4'>
            <SummaryTile
              label={t('control')}
              value={
                selected.a.sess
                  ? `${getExperimentCvr(selected.a).toFixed(2)}%`
                  : '—'
              }
              note={t('sessionCount', {
                count: formatCount(selected.a.sess),
              })}
              icon={Gauge}
            />
            <SummaryTile
              label={t('variant')}
              value={
                selected.b.sess
                  ? `${getExperimentCvr(selected.b).toFixed(2)}%`
                  : '—'
              }
              note={t('sessionCount', {
                count: formatCount(selected.b.sess),
              })}
              icon={FlaskConical}
              tone='electric'
            />
            <SummaryTile
              label={t('lift')}
              value={
                selected.a.sess
                  ? `${lift >= 0 ? '+' : ''}${lift.toFixed(1)}%`
                  : '—'
              }
              note={t('variantVsControl')}
              icon={TrendingUp}
              tone={lift > 0 ? 'success' : 'default'}
            />
            <SummaryTile
              label={t('significance')}
              value={`${selected.sig}%`}
              note={
                selected.status === 'won'
                  ? t('recoveredMonthly', {
                      value: formatMoney(recoveredMonthly),
                    })
                  : gateOpen
                    ? t('gateOpen')
                    : t('gateHolding', {
                        remaining: EXPERIMENT_SHIP_GATE - selected.sig,
                      })
              }
              icon={CheckCircle2}
              tone={gateOpen ? 'success' : 'default'}
            />
          </section>

          {selected.stopped ? (
            <section className='border-l-2 border-[var(--pv2-warning)] bg-[color-mix(in_srgb,var(--pv2-warning)_6%,var(--pv2-paper))] px-4 py-3 text-[12px] text-[var(--pv2-mut)]'>
              {t('stoppedCallout', {
                day: selected.stopped.day,
                significance: selected.stopped.sig,
              })}
            </section>
          ) : null}

          <section className='rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4 md:p-5'>
            <div className='flex flex-wrap items-end justify-between gap-2 border-b border-[var(--pv2-hair)] pb-3'>
              <div>
                <h2 className='text-sm font-bold text-[var(--pv2-ink)]'>
                  {t('dailyChart')}
                </h2>
                <p className='mt-0.5 text-[10px] text-[var(--pv2-faint)]'>
                  {t('dailyChartHint')}
                </p>
              </div>
              <span className='text-[10px] text-[var(--pv2-mut)]'>
                {t('dayCount', { count: selected.days })}
              </span>
            </div>
            <div className='pt-4'>
              <ExperimentDailyChart
                experiment={selected}
                controlLabel={t('control')}
                variantLabel={t('variant')}
                emptyLabel={t('chartEmpty')}
                ariaLabel={t('chartAria', { name: selected.name })}
              />
            </div>
          </section>

          {option ? (
            <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4'>
              <p className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
                {t('playbook')}
              </p>
              <div className='mt-2 flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <h2 className='text-sm font-bold text-[var(--pv2-ink)]'>
                    {option.name}
                  </h2>
                  <p className='mt-1 text-[12px] text-[var(--pv2-mut)]'>
                    {option.angle}
                  </p>
                </div>
                <span className='rounded-full bg-[var(--pv2-electric-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--pv2-electric)]'>
                  {t('recommendedRecovery', { value: option.rec })}
                </span>
              </div>
              <p className='mt-3 border-l-2 border-[var(--pv2-electric)] pl-3 text-[11px] leading-5 text-[var(--pv2-mut)]'>
                {t('leansOn')}: {option.leans}
              </p>
            </section>
          ) : null}

          {selected.learning ? (
            <section className='rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_20%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_5%,var(--pv2-paper))] p-4'>
              <p className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-error)] uppercase'>
                {t('learning')}
              </p>
              <p className='mt-2 text-[12px] leading-6 text-[var(--pv2-ink)]'>
                {selected.learning}
              </p>
            </section>
          ) : null}
        </main>
      </>
    );
  }, [data, selected, t]);

  return (
    <div className='flex min-h-0 flex-col'>
      {selected ? detailView : listView}
      <ExperimentEndModal
        experiment={selected}
        open={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        onStop={handleStop}
        onConclude={handleConclude}
      />
    </div>
  );
};
