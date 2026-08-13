'use client';

import {
  ArrowRight,
  Beaker,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Database,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { GlossaryTip } from '@/components/molecules/portal-v2/GlossaryTip';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { ExperimentStatusChip } from '@/components/organisms/portal-v2/experiments/ExperimentStatusChip';
import { CoverageMeter } from '@/components/organisms/portal-v2/mining/CoverageMeter';
import { LeakMapChart } from '@/components/organisms/portal-v2/mining/LeakMapChart';
import { cn } from '@/lib/cn';
import {
  MINING_RISK_CLASSES,
  MINING_RISK_LABELS,
} from '@/lib/portal-v2/mining/constants';
import {
  formatMiningMoney,
  getExperimentLift,
  getMiningConfidence,
  getMiningCoverage,
  getMiningTotalRisk,
} from '@/lib/portal-v2/mining/helpers';
import { useMiningData } from '@/lib/portal-v2/mining/MiningDataProvider';
import type {
  MiningAgentDraft,
  MiningOpportunity,
  MiningOption,
} from '@/lib/portal-v2/mining/types';

type OpportunityCardProps = {
  opportunity: MiningOpportunity;
  selected: boolean;
  confidence: number;
  onSelect: (id: string) => void;
};

const OpportunityCard = ({
  opportunity,
  selected,
  confidence,
  onSelect,
}: OpportunityCardProps) => (
  <button
    type='button'
    aria-pressed={selected}
    onClick={() => onSelect(opportunity.id)}
    className={cn(
      'grid w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--pv2-hair)] px-3 py-3.5 text-left',
      'transition-colors focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
      selected
        ? 'bg-[var(--pv2-electric-soft)]'
        : 'bg-[var(--pv2-paper)] hover:bg-[var(--pv2-canvas)]'
    )}
  >
    <span
      className={cn(
        'grid size-7 place-items-center rounded-full text-[11px] font-bold',
        selected
          ? 'bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'
          : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
      )}
    >
      #{opportunity.rank}
    </span>
    <span className='min-w-0'>
      <strong className='block truncate text-[13px] text-[var(--pv2-ink)]'>
        {opportunity.title}
      </strong>
      <span className='mt-0.5 block text-[11px] text-[var(--pv2-mut)]'>
        {opportunity.stage}
      </span>
    </span>
    <span className='text-right'>
      <strong className='block text-[13px] text-[var(--pv2-error)]'>
        −{formatMiningMoney(opportunity.risk)}
        <small className='font-medium'>/mo</small>
      </strong>
      <span className='block text-[10px] text-[var(--pv2-faint)]'>
        {confidence}% conf · rec {opportunity.recovery}
      </span>
    </span>
  </button>
);

type AgentDraftModalProps = {
  draft: MiningAgentDraft | null;
  opportunity: MiningOpportunity;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

const AgentDraftModal = ({
  draft,
  opportunity,
  open,
  onClose,
  onSubmit,
}: AgentDraftModalProps) => {
  const t = useTranslations('portalV2.mining');
  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={draft?.name ?? t('draftFallbackTitle')}
      subtitle={t('draftSubtitle', { opportunity: opportunity.title })}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='primary' onClick={onSubmit}>
            <Sparkles aria-hidden />
            {t('openInStudio')}
          </Button>
        </>
      }
    >
      {draft ? (
        <div className='space-y-6'>
          <div className='border-b border-[var(--pv2-hair)] pb-5'>
            <p className='font-[family-name:var(--pv2-disp)] text-xl font-bold tracking-[-0.025em] text-[var(--pv2-ink)]'>
              {draft.tagline}
            </p>
            <p className='mt-2 max-w-3xl text-[13px] leading-6 text-[var(--pv2-mut)]'>
              {draft.summary}
            </p>
          </div>
          <div className='grid gap-px overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] md:grid-cols-3'>
            {draft.blocks.map(block => (
              <article key={block.n} className='bg-[var(--pv2-paper)] p-4'>
                <span className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-electric)] uppercase'>
                  {block.n}
                </span>
                <h3 className='mt-3 text-sm font-bold text-[var(--pv2-ink)]'>
                  {block.h ?? t('governedClaim')}
                </h3>
                {block.b ? (
                  <p className='mt-1.5 text-xs leading-5 text-[var(--pv2-mut)]'>
                    {block.b}
                  </p>
                ) : null}
                <p className='mt-4 border-t border-[var(--pv2-hair)] pt-3 text-[10px] leading-4 text-[var(--pv2-faint)]'>
                  {t('leansOn')}: {block.leans}
                </p>
              </article>
            ))}
          </div>
          <div>
            <p className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
              {t('features')}
            </p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {draft.features.map(feature => (
                <span
                  key={feature}
                  className='rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-1 text-xs text-[var(--pv2-mut)]'
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className='text-sm text-[var(--pv2-mut)]'>{t('draftUnavailable')}</p>
      )}
    </Modal>
  );
};

type MiningWorkspaceProps = {
  initialOpportunityId?: string | null;
};

export const MiningWorkspace = ({
  initialOpportunityId,
}: MiningWorkspaceProps) => {
  const t = useTranslations('portalV2.mining');
  const router = useRouter();
  const { data, startExperiment } = useMiningData();
  const initialId = data.opps.some(item => item.id === initialOpportunityId)
    ? initialOpportunityId!
    : data.opps[0]!.id;
  const [selectedId, setSelectedId] = useState(initialId);
  const [openOptionId, setOpenOptionId] = useState<string | null>(null);
  const [draftOpen, setDraftOpen] = useState(false);

  const selected =
    data.opps.find(item => item.id === selectedId) ?? data.opps[0]!;
  const coverage = useMemo(() => getMiningCoverage(data), [data]);
  const selectedConfidence = getMiningConfidence(selected, data);
  const selectedExperiments = data.experiments.filter(
    experiment => experiment.from === selected.id
  );
  const draft = selected.options.find(option => option.draft)?.draft ?? null;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setOpenOptionId(null);
  };

  const handleToggleOption = (id: string) => {
    setOpenOptionId(current => (current === id ? null : id));
  };

  const handleStartExperiment = (option: MiningOption) => {
    const result = startExperiment(selected.id, option.id);
    if (!result.ok) {
      toast.error(
        result.reason === 'running-exists'
          ? t('runningExperimentExists')
          : t('experimentStartFailed')
      );
      return;
    }
    toast.success(t('experimentDrafted', { name: result.experiment.name }));
    router.push(`/portal-v2/experiments?id=${result.experiment.id}`);
  };

  const handleDraftSubmit = () => {
    if (!draft) return;
    window.alert(
      JSON.stringify(
        {
          source: 'journey-audit',
          opportunity: selected.id,
          draft,
        },
        null,
        2
      )
    );
    setDraftOpen(false);
  };

  const renderOption = (option: MiningOption, index: number) => {
    const open = openOptionId === option.id;
    const tested = data.experiments.find(
      experiment =>
        experiment.opt === option.id && experiment.status !== 'stopped'
    );

    return (
      <div
        key={option.id}
        className='border-b border-[var(--pv2-hair)] last:border-b-0'
      >
        <button
          type='button'
          aria-expanded={open}
          onClick={() => handleToggleOption(option.id)}
          className='flex w-full items-center gap-3 py-3 text-left focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        >
          {open ? (
            <ChevronDown
              className='size-4 shrink-0 text-[var(--pv2-electric)]'
              aria-hidden
            />
          ) : (
            <ChevronRight
              className='size-4 shrink-0 text-[var(--pv2-faint)]'
              aria-hidden
            />
          )}
          <span className='min-w-0 flex-1'>
            <span className='flex flex-wrap items-center gap-2'>
              <strong className='text-[13px] text-[var(--pv2-ink)]'>
                {option.name}
              </strong>
              {index === 0 ? (
                <span className='rounded-full bg-[var(--pv2-electric-soft)] px-2 py-0.5 text-[9px] font-bold tracking-[0.06em] text-[var(--pv2-electric)] uppercase'>
                  {t('recommended')}
                </span>
              ) : null}
            </span>
            <span className='mt-0.5 block text-[11px] text-[var(--pv2-mut)]'>
              {option.angle}
            </span>
          </span>
          <span className='hidden items-center gap-2 sm:flex'>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                MINING_RISK_CLASSES[option.risk]
              )}
            >
              {MINING_RISK_LABELS[option.risk]}
            </span>
            <span className='text-[10px] text-[var(--pv2-faint)]'>
              rec {option.rec}
            </span>
            {tested ? (
              <ExperimentStatusChip
                status={tested.status}
                label={tested.status}
              />
            ) : null}
          </span>
        </button>
        {open ? (
          <div className='pb-4 pl-7'>
            <p className='border-l-2 border-[var(--pv2-electric)] pl-3 text-[11px] leading-5 text-[var(--pv2-mut)]'>
              <strong className='text-[var(--pv2-ink)]'>{t('leansOn')}:</strong>{' '}
              {option.leans}
            </p>
            <div className='mt-3 grid gap-px overflow-hidden rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-hair)] sm:grid-cols-2'>
              <div className='bg-[var(--pv2-canvas)] p-3'>
                <span className='text-[9px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
                  {t('today')}
                </span>
                {option.before.map(item => (
                  <p
                    key={item}
                    className='mt-1.5 text-[11px] text-[var(--pv2-mut)] line-through decoration-[var(--pv2-error)]/50'
                  >
                    {item}
                  </p>
                ))}
              </div>
              <div className='bg-[var(--pv2-paper)] p-3'>
                <span className='text-[9px] font-bold tracking-[0.1em] text-[var(--pv2-success)] uppercase'>
                  {t('withPlaybook')}
                </span>
                {option.after.map(item => (
                  <p
                    key={item}
                    className='mt-1.5 text-[11px] text-[var(--pv2-ink)]'
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
            {tested ? (
              <Button asChild className='mt-3 w-full' size='sm' variant='ghost'>
                <Link href={`/portal-v2/experiments?id=${tested.id}`}>
                  <Beaker aria-hidden />
                  {t('seeExperiment', { status: tested.status })}
                </Link>
              </Button>
            ) : (
              <Button
                className='mt-3 w-full'
                size='sm'
                variant='primary'
                onClick={() => handleStartExperiment(option)}
              >
                <Beaker aria-hidden />
                {t('testVsControl')}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className='flex min-h-0 flex-col'>
      <header className='pv2-page-header'>
        <div className='flex w-full flex-wrap items-end justify-between gap-5 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <p className='text-[10px] font-bold tracking-[0.16em] text-[var(--pv2-electric)] uppercase'>
              {t('eyebrow')}
            </p>
            <h1 className='mt-1 inline-flex items-center gap-2 font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
              <GlossaryTip term='journeyMining' />
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')} · {data.asOf}
            </p>
          </div>
          <div className='text-left md:text-right'>
            <strong className='block font-[family-name:var(--pv2-disp)] text-2xl tracking-[-0.04em] text-[var(--pv2-error)]'>
              −{formatMiningMoney(getMiningTotalRisk(data))}
              <small className='ml-0.5 text-xs font-semibold tracking-normal'>
                /mo
              </small>
            </strong>
            <span className='inline-flex items-center gap-1.5 text-[11px] text-[var(--pv2-mut)]'>
              {t('totalRisk', { count: data.opps.length })}
              <GlossaryTip term='revenueAtRisk' />
            </span>
          </div>
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

      <main className='w-full space-y-6 px-5 py-5 md:px-8'>
        <section className='overflow-hidden rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <div className='flex flex-wrap items-end justify-between gap-2 border-b border-[var(--pv2-hair)] px-4 py-3'>
            <div>
              <h2 className='text-sm font-bold text-[var(--pv2-ink)]'>
                {t('leakMapTitle')}
              </h2>
              <p className='mt-0.5 text-[10px] text-[var(--pv2-faint)]'>
                {t('leakMapHint')}
              </p>
            </div>
            <Link
              href='/portal-v2/sources'
              className='inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--pv2-electric)] hover:underline'
            >
              <Database className='size-3' aria-hidden />
              {t('manageSources')}
            </Link>
          </div>
          <div className='px-3 pt-4'>
            <LeakMapChart
              stages={data.stages}
              opportunities={data.opps}
              selectedId={selected.id}
              onSelect={handleSelect}
              ariaLabel={t('leakMapAria')}
              riskLabel={t('perMonthRisk')}
            />
          </div>
          <div className='border-t border-[var(--pv2-hair)] px-4 py-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='mr-1 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] text-[var(--pv2-faint)] uppercase'>
                {t('omnichannel')}
                <GlossaryTip term='journeyCoverage' />
              </span>
              {data.channels.map(channel => (
                <Link
                  key={channel.ch}
                  href={channel.hint ? '/portal-v2/sources' : '#'}
                  title={channel.hint}
                  aria-label={
                    channel.hint ? `${channel.ch}: ${channel.hint}` : undefined
                  }
                  className={cn(
                    'relative min-w-24 overflow-hidden rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-2.5 py-1.5 text-[10px]',
                    channel.hint && 'cursor-pointer'
                  )}
                >
                  <span className='relative z-[1] flex justify-between gap-2 font-semibold text-[var(--pv2-ink)]'>
                    {channel.ch}
                    <span>{Math.round(channel.share * 100)}%</span>
                  </span>
                  <span
                    aria-hidden
                    className='absolute inset-y-0 left-0 bg-[var(--pv2-electric-soft)]'
                    style={{ width: `${channel.share * 100}%` }}
                  />
                  {channel.hint ? (
                    <CircleAlert className='absolute top-0.5 right-0.5 z-[2] size-2.5 text-[var(--pv2-warning)]' />
                  ) : null}
                </Link>
              ))}
            </div>
            <p className='mt-3 text-[10px] leading-4 text-[var(--pv2-faint)]'>
              {t('formulaNote', { aov: formatMiningMoney(data.aov) })}
            </p>
          </div>
        </section>

        <section className='grid items-start gap-5 xl:grid-cols-[minmax(360px,0.84fr)_minmax(480px,1.16fr)]'>
          <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
            <div className='border-b border-[var(--pv2-hair)] px-4 py-3'>
              <h2 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
                {t('rankedOpportunities')}
              </h2>
            </div>
            {data.opps.map(opportunity => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                selected={opportunity.id === selected.id}
                confidence={getMiningConfidence(opportunity, data)}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <article className='rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-5 md:p-6'>
            <div className='flex flex-wrap items-start justify-between gap-3 border-b border-[var(--pv2-hair)] pb-4'>
              <div>
                <p className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-electric)] uppercase'>
                  {selected.stage}
                </p>
                <h2 className='mt-1 font-[family-name:var(--pv2-disp)] text-xl font-bold tracking-[-0.025em] text-[var(--pv2-ink)]'>
                  {selected.title}
                </h2>
              </div>
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-[11px] font-bold',
                  selectedConfidence < selected.conf
                    ? 'border-[color-mix(in_srgb,var(--pv2-warning)_35%,var(--pv2-hair))] text-[var(--pv2-warning)]'
                    : 'border-[color-mix(in_srgb,var(--pv2-success)_28%,var(--pv2-hair))] text-[var(--pv2-success)]'
                )}
              >
                {selectedConfidence}% {t('confidence')}
              </span>
            </div>

            <p className='py-4 text-[13px] leading-6 text-[var(--pv2-mut)]'>
              {selected.summary}
            </p>

            <div className='border-t border-[var(--pv2-hair)] pt-4'>
              <h3 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
                {t('evidence')}
              </h3>
              <div className='mt-2 grid gap-2'>
                {selected.evidence.map(evidence => {
                  const source = data.sources.find(
                    item => item.id === evidence.src
                  );
                  const healthy = source?.status === 'connected';
                  return (
                    <blockquote
                      key={`${evidence.src}-${evidence.from}`}
                      className={cn(
                        'border-l-2 bg-[var(--pv2-canvas)] px-3 py-2.5',
                        healthy
                          ? 'border-[var(--pv2-electric)]'
                          : 'border-[var(--pv2-warning)]'
                      )}
                    >
                      <cite className='text-[10px] font-semibold text-[var(--pv2-mut)] not-italic'>
                        {evidence.from}
                        {!healthy ? ` · ${t('sourceDown')}` : ''}
                      </cite>
                      <p className='mt-1 text-[12px] leading-5 text-[var(--pv2-ink)]'>
                        “{evidence.text}”
                      </p>
                    </blockquote>
                  );
                })}
              </div>
            </div>

            <div className='mt-5 border-t border-[var(--pv2-hair)] pt-4'>
              <h3 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
                {t('playbookOptions')}
              </h3>
              <div className='mt-1'>{selected.options.map(renderOption)}</div>
            </div>

            {selectedExperiments.length ? (
              <div className='mt-5 border-t border-[var(--pv2-hair)] pt-4'>
                <div className='flex items-center justify-between gap-3'>
                  <h3 className='text-[10px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
                    {t('beingTested')}
                  </h3>
                  <Link
                    href='/portal-v2/experiments'
                    className='text-[10px] font-semibold text-[var(--pv2-electric)] hover:underline'
                  >
                    {t('viewAll')}
                  </Link>
                </div>
                <div className='mt-2 grid gap-2'>
                  {selectedExperiments.map(experiment => (
                    <Link
                      key={experiment.id}
                      href={`/portal-v2/experiments?id=${experiment.id}`}
                      className='flex items-center gap-2 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2 hover:bg-[var(--pv2-canvas)]'
                    >
                      <ExperimentStatusChip
                        status={experiment.status}
                        label={experiment.status}
                      />
                      <strong className='min-w-0 flex-1 truncate text-[11px] text-[var(--pv2-ink)]'>
                        {experiment.name}
                      </strong>
                      <span className='text-[10px] text-[var(--pv2-mut)]'>
                        {experiment.days
                          ? `${getExperimentLift(experiment) >= 0 ? '+' : ''}${getExperimentLift(experiment).toFixed(1)}% · ${experiment.sig}% sig`
                          : t('draft')}
                      </span>
                      <ExternalLink
                        className='size-3 text-[var(--pv2-faint)]'
                        aria-hidden
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <Button
              className='mt-5 w-full'
              size='lg'
              disabled={!draft}
              onClick={() => setDraftOpen(true)}
            >
              <Sparkles aria-hidden />
              {t('draftWithAgent')}
              <ArrowRight className='ml-auto' aria-hidden />
            </Button>
            <p className='mt-2 text-center text-[10px] leading-4 text-[var(--pv2-faint)]'>
              {t('agentNote')}
              <GlossaryTip
                className='ml-1 align-text-top'
                term='evidenceSeededDraft'
              />
            </p>
          </article>
        </section>
      </main>

      <AgentDraftModal
        draft={draft}
        opportunity={selected}
        open={draftOpen}
        onClose={() => setDraftOpen(false)}
        onSubmit={handleDraftSubmit}
      />
    </div>
  );
};
