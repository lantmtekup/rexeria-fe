'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  ChoiceField,
  GovBox,
  GovHint,
  Pill,
} from '@/components/molecules/portal-v2/settings-form';
import { PRIVACY, PRIV_ORDER } from '@/lib/portal-v2/settings/constants';
import { issueFor, privacyIndex } from '@/lib/portal-v2/settings/helpers';
import type {
  PrivacyTier,
  SettingsData,
  SettingsIssue,
} from '@/lib/portal-v2/settings/types';

type PrivacyPanelProps = {
  data: SettingsData;
  editing: boolean;
  issues: SettingsIssue[];
  onChange: (next: SettingsData) => void;
};

export const PrivacyPanel = ({
  data,
  editing,
  issues,
  onChange,
}: PrivacyPanelProps) => {
  const t = useTranslations('portalV2.settings');
  const p = data.privacy;
  const ceiling = privacyIndex(p.maxPrivacy);
  const defIssue = issueFor(issues, 'defPrivacy');

  const setDefault = (tier: PrivacyTier) => {
    onChange({ ...data, privacy: { ...p, defPrivacy: tier } });
  };

  /* The default follows the ceiling down — said out loud, never silent. */
  const setCeiling = (tier: PrivacyTier) => {
    const follows = privacyIndex(p.defPrivacy) > privacyIndex(tier);
    onChange({
      ...data,
      privacy: {
        maxPrivacy: tier,
        defPrivacy: follows ? tier : p.defPrivacy,
      },
    });
    if (follows) {
      toast.message(t('privacyFollowed', { tier: PRIVACY[tier].name }));
    }
  };

  return (
    <>
      <GovBox title={t('boxPrivacy')} note={t('notePrivacy')}>
        <div className='grid gap-4 sm:grid-cols-2'>
          <ChoiceField
            label={t('fieldDefPrivacy')}
            value={p.defPrivacy}
            editing={editing}
            options={PRIV_ORDER.map(k => ({
              value: k,
              label: PRIVACY[k].name,
              disabled: privacyIndex(k) > ceiling,
            }))}
            error={
              defIssue ? t(defIssue.messageKey, defIssue.values) : undefined
            }
            hint={PRIVACY[p.defPrivacy].desc}
            onChange={v => setDefault(v as PrivacyTier)}
          />
          <ChoiceField
            label={t('fieldMaxPrivacy')}
            value={p.maxPrivacy}
            editing={editing}
            options={PRIV_ORDER.map(k => ({
              value: k,
              label: PRIVACY[k].name,
              desc: PRIVACY[k].desc,
            }))}
            hint={t('hintCeiling')}
            onChange={v => setCeiling(v as PrivacyTier)}
          />
        </div>
        <GovHint>{t('hintPrivacy')}</GovHint>
      </GovBox>

      <GovBox title={t('boxTiersRef')} note={t('noteTiersRef')}>
        <ul className='divide-y divide-[var(--pv2-hair)] rounded-[10px] border border-[var(--pv2-hair)]'>
          {PRIV_ORDER.map(k => {
            const barred = privacyIndex(k) > ceiling;
            return (
              <li key={k} className='flex items-center gap-3 px-3.5 py-2.5'>
                <span className='min-w-0 flex-1'>
                  <span className='block text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                    {PRIVACY[k].name}
                  </span>
                  <span className='block text-[11.5px] text-[var(--pv2-faint)]'>
                    {PRIVACY[k].desc}
                  </span>
                </span>
                {k === p.defPrivacy ? (
                  <Pill bg='var(--pv2-electric-soft)' fg='var(--pv2-electric)'>
                    {t('pillDefault')}
                  </Pill>
                ) : null}
                {k === p.maxPrivacy ? (
                  <Pill
                    bg='color-mix(in srgb, var(--pv2-violet) 12%, transparent)'
                    fg='var(--pv2-violet)'
                  >
                    {t('pillCeiling')}
                  </Pill>
                ) : null}
                {barred ? (
                  <Pill bg='var(--pv2-canvas)' fg='var(--pv2-faint)'>
                    {t('pillBarred')}
                  </Pill>
                ) : null}
              </li>
            );
          })}
        </ul>
        <GovHint>{t('hintLaw')}</GovHint>
      </GovBox>
    </>
  );
};
