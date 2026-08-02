'use client';

import { useTranslations } from 'next-intl';

import {
  Dial,
  Eyebrow,
  GovBox,
  GovHint,
  Pill,
  WeightSum,
} from '@/components/molecules/portal-v2/settings-form';
import {
  BLOCK_GAP_MAX,
  BLOCK_GAP_MIN,
  CONF_TIERS,
  FIT_WEIGHT_KEYS,
  SCORE_WEIGHT_KEYS,
} from '@/lib/portal-v2/settings/constants';
import {
  confidenceTier,
  formatCount,
  issueFor,
  proofRow,
  sumWeights,
} from '@/lib/portal-v2/settings/helpers';
import type {
  SettingsData,
  SettingsIssue,
  SettingsMeasurement,
} from '@/lib/portal-v2/settings/types';

type MeasurementPanelProps = {
  data: SettingsData;
  editing: boolean;
  issues: SettingsIssue[];
  onChange: (next: SettingsData) => void;
};

export const MeasurementPanel = ({
  data,
  editing,
  issues,
  onChange,
}: MeasurementPanelProps) => {
  const t = useTranslations('portalV2.settings');
  const m = data.measurement;

  const patch = (partial: Partial<SettingsMeasurement>) => {
    onChange({ ...data, measurement: { ...m, ...partial } });
  };

  const highIssue = issueFor(issues, 'highFloor');
  const dirIssue = issueFor(issues, 'dirFloor');
  const gapIssue = issueFor(issues, 'blkGapPts');
  const scoreIssue = issueFor(issues, 'scoreW');
  const fitIssue = issueFor(issues, 'fitW');

  /* The proof, live: move a floor and this chip moves with it. */
  const proof = proofRow();
  const tierId = confidenceTier(proof.sessions, proof.controlCvr !== null, m);
  const tier = CONF_TIERS[tierId];

  const scoreSum = sumWeights(m.scoreW);
  const fitSum = sumWeights(m.fitW);

  return (
    <>
      <GovBox title={t('boxTiers')} note={t('noteTiers')}>
        <Eyebrow>{t('eyebrowFloors')}</Eyebrow>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Dial
            label={t('fieldHighFloor')}
            value={m.highFloor}
            editing={editing}
            suffix={t('sessionsSuffix')}
            hint={t('hintHighFloor')}
            error={
              highIssue ? t(highIssue.messageKey, highIssue.values) : undefined
            }
            onChange={v => patch({ highFloor: v })}
          />
          <Dial
            label={t('fieldDirFloor')}
            value={m.dirFloor}
            editing={editing}
            suffix={t('sessionsSuffix')}
            hint={t('hintDirFloor')}
            error={
              dirIssue ? t(dirIssue.messageKey, dirIssue.values) : undefined
            }
            onChange={v => patch({ dirFloor: v })}
          />
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-2 rounded-[10px] bg-[var(--pv2-canvas)] px-3.5 py-2.5'>
          <span className='text-[11.5px] text-[var(--pv2-mut)]'>
            {t('proofLine', {
              name: proof.experienceName,
              sessions: formatCount(proof.sessions),
            })}
          </span>
          <Pill bg={tier.bg} fg={tier.fg}>
            {tier.name}
          </Pill>
        </div>
        <GovHint>{t('hintTiers')}</GovHint>
      </GovBox>

      <GovBox title={t('boxBench')} note={t('noteBench')}>
        <div className='grid gap-4 sm:grid-cols-2'>
          <Dial
            label={t('fieldBlkGap')}
            value={m.blkGapPts}
            editing={editing}
            suffix={t('pointsSuffix')}
            hint={t('hintBlkGap', { min: BLOCK_GAP_MIN, max: BLOCK_GAP_MAX })}
            error={
              gapIssue ? t(gapIssue.messageKey, gapIssue.values) : undefined
            }
            onChange={v => patch({ blkGapPts: v })}
          />
        </div>
        <GovHint>{t('hintBench')}</GovHint>
      </GovBox>

      <GovBox title={t('boxScoreWeights')} note={t('noteWeights')}>
        <div className='mb-2 flex flex-wrap items-baseline justify-between gap-2'>
          <Eyebrow className='mb-0'>{t('eyebrowScoreWeights')}</Eyebrow>
          <WeightSum sum={scoreSum} label={t('sumLabel')} />
        </div>
        <div className='grid gap-4 sm:grid-cols-3'>
          {SCORE_WEIGHT_KEYS.map(w => (
            <Dial
              key={w.key}
              label={w.name}
              value={m.scoreW[w.key]}
              editing={editing}
              suffix='%'
              error={
                scoreIssue && editing
                  ? t(scoreIssue.messageKey, scoreIssue.values)
                  : undefined
              }
              onChange={v => patch({ scoreW: { ...m.scoreW, [w.key]: v } })}
            />
          ))}
        </div>
      </GovBox>

      <GovBox title={t('boxFitWeights')} note={t('noteWeights')}>
        <div className='mb-2 flex flex-wrap items-baseline justify-between gap-2'>
          <Eyebrow className='mb-0'>{t('eyebrowFitWeights')}</Eyebrow>
          <WeightSum sum={fitSum} label={t('sumLabel')} />
        </div>
        <div className='grid gap-4 sm:grid-cols-3'>
          {FIT_WEIGHT_KEYS.map(w => (
            <Dial
              key={w.key}
              label={w.name}
              value={m.fitW[w.key]}
              editing={editing}
              suffix='%'
              error={
                fitIssue && editing
                  ? t(fitIssue.messageKey, fitIssue.values)
                  : undefined
              }
              onChange={v => patch({ fitW: { ...m.fitW, [w.key]: v } })}
            />
          ))}
        </div>
        <GovHint>{t('hintNotGoverned')}</GovHint>
      </GovBox>
    </>
  );
};
