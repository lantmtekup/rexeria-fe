'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  GovBox,
  GovHint,
  Pill,
} from '@/components/molecules/portal-v2/settings-form';
import { CONF_TIERS } from '@/lib/portal-v2/settings/constants';
import {
  confidenceTier,
  formatCount,
  totalSessions,
} from '@/lib/portal-v2/settings/helpers';
import { MOCK_FACT_ROWS } from '@/lib/portal-v2/settings/mock';
import type { SettingsData } from '@/lib/portal-v2/settings/types';

type DataPanelProps = {
  data: SettingsData;
};

const PREVIEW_ROWS = 6;

export const DataPanel = ({ data }: DataPanelProps) => {
  const t = useTranslations('portalV2.settings');
  const rows = MOCK_FACT_ROWS;
  const sessions = totalSessions();

  const handleExport = () => {
    if (typeof document === 'undefined') {
      toast.message(t('toastExportReady', { count: formatCount(rows.length) }));
      return;
    }
    const link = document.createElement('a');
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
    );
    link.href = url;
    link.download = 'rexer-ground-truth.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('toastExported', { count: formatCount(rows.length) }));
  };

  return (
    <>
      <GovBox title={t('boxFacts')} note={t('noteFacts')}>
        <div className='flex flex-wrap items-center gap-4 rounded-[10px] bg-[var(--pv2-canvas)] px-4 py-3.5'>
          <span
            aria-hidden
            className='size-2.5 shrink-0 rounded-full bg-[var(--pv2-success)]'
          />
          <span className='min-w-0 flex-1'>
            <span className='block font-[family-name:var(--pv2-disp)] text-[14px] font-bold text-[var(--pv2-ink)]'>
              {t('factsHead', {
                rows: formatCount(rows.length),
                sessions: formatCount(sessions),
              })}
            </span>
            <span className='mt-0.5 block max-w-[70ch] text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('factsBody')}
            </span>
          </span>
          <Button variant='primary' onClick={handleExport}>
            <Download className='size-[15px]' strokeWidth={2.2} aria-hidden />
            {t('export')}
          </Button>
        </div>
        <GovHint>{t('hintMediaGov')}</GovHint>
      </GovBox>

      <GovBox title={t('boxPreview')} note={t('notePreview')}>
        <div className='-mx-1 overflow-x-auto px-1'>
          <table className='w-full min-w-[620px] border-collapse text-left'>
            <thead>
              <tr className='border-b border-[var(--pv2-hair)]'>
                {[
                  t('colCampaign'),
                  t('colChannel'),
                  t('colExperience'),
                  t('colSessions'),
                  t('colTier'),
                ].map((label, i) => (
                  <th
                    key={label}
                    className={
                      i > 2
                        ? 'pb-2 text-right text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'
                        : 'pb-2 text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'
                    }
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, PREVIEW_ROWS).map(row => {
                const tier =
                  CONF_TIERS[
                    confidenceTier(
                      row.sessions,
                      row.controlCvr !== null,
                      data.measurement
                    )
                  ];
                return (
                  <tr
                    key={`${row.campaign}-${row.channel}-${row.experience}`}
                    className='border-b border-[var(--pv2-hair)] last:border-b-0'
                  >
                    <td className='py-2.5 text-[12.5px] text-[var(--pv2-ink)]'>
                      {row.campaignName}
                    </td>
                    <td className='py-2.5 text-[12.5px] text-[var(--pv2-mut)]'>
                      {row.channel}
                    </td>
                    <td className='py-2.5 text-[12.5px] text-[var(--pv2-mut)]'>
                      {row.experienceName}
                    </td>
                    <td className='py-2.5 text-right text-[12.5px] font-semibold text-[var(--pv2-ink)] tabular-nums'>
                      {formatCount(row.sessions)}
                    </td>
                    <td className='py-2.5 text-right'>
                      <Pill bg={tier.bg} fg={tier.fg}>
                        {tier.name}
                      </Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length > PREVIEW_ROWS ? (
          <GovHint>
            {t('previewMore', { count: rows.length - PREVIEW_ROWS })}
          </GovHint>
        ) : null}
      </GovBox>
    </>
  );
};
