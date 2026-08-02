'use client';

import { Check, Pencil, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { DataPanel } from '@/components/organisms/portal-v2/settings/DataPanel';
import { GeneralPanel } from '@/components/organisms/portal-v2/settings/GeneralPanel';
import { MeasurementPanel } from '@/components/organisms/portal-v2/settings/MeasurementPanel';
import { PrivacyPanel } from '@/components/organisms/portal-v2/settings/PrivacyPanel';
import { TeamPanel } from '@/components/organisms/portal-v2/settings/TeamPanel';
import { SETTINGS_TABS } from '@/lib/portal-v2/settings/constants';
import {
  isGovernanceDefault,
  normalizeSettings,
  restoreGovernanceDefaults,
  validateSettings,
} from '@/lib/portal-v2/settings/helpers';
import { MOCK_SETTINGS, cloneSettings } from '@/lib/portal-v2/settings/mock';
import type {
  SettingsData,
  SettingsTabId,
} from '@/lib/portal-v2/settings/types';

export const SettingsWorkspace = () => {
  const t = useTranslations('portalV2.settings');
  const [tab, setTab] = useState<SettingsTabId>('general');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<SettingsData>(() =>
    cloneSettings(MOCK_SETTINGS)
  );
  const [draft, setDraft] = useState<SettingsData>(() =>
    cloneSettings(MOCK_SETTINGS)
  );

  const data = editing ? draft : saved;
  const tabMeta = SETTINGS_TABS.find(x => x.id === tab) ?? SETTINGS_TABS[0]!;

  /* Refusals are computed live, so a bad dial says so before Save is pressed. */
  const issues = useMemo(
    () => (editing ? validateSettings(draft) : []),
    [editing, draft]
  );

  const tabItems = useMemo(
    () =>
      SETTINGS_TABS.map(x => ({
        id: x.id,
        label: t(x.labelKey),
        count: x.id === 'team' ? data.members.length : undefined,
      })),
    [t, data.members.length]
  );

  const handleEdit = () => {
    setDraft(cloneSettings(saved));
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(cloneSettings(saved));
    setEditing(false);
  };

  const handleRestore = () => {
    const base = editing ? draft : saved;
    setDraft(restoreGovernanceDefaults(cloneSettings(base)));
    setEditing(true);
    toast.message(t('toastRestored'));
  };

  const handleSave = () => {
    const cleaned = normalizeSettings(draft);
    const refusals = validateSettings(cleaned);

    if (refusals.length) {
      const first = refusals[0]!;
      toast.error(t(first.messageKey, first.values));
      setDraft(cleaned);
      return;
    }

    window.alert(JSON.stringify(cleaned, null, 2));
    setSaved(cloneSettings(cleaned));
    setDraft(cloneSettings(cleaned));
    setEditing(false);
    toast.success(t('toastSaved'));
  };

  const noop = () => undefined;
  const onChange = editing ? setDraft : noop;
  const restorable = !isGovernanceDefault(data);

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-[86ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(tabMeta.descKey)}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            {restorable ? (
              <Button variant='ghost' onClick={handleRestore}>
                <RotateCcw
                  className='size-[15px]'
                  strokeWidth={2}
                  aria-hidden
                />
                {t('restore')}
              </Button>
            ) : null}
            {editing ? (
              <>
                <Button variant='ghost' onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <Button variant='primary' onClick={handleSave}>
                  <Check
                    className='size-[15px]'
                    strokeWidth={2.4}
                    aria-hidden
                  />
                  {t('save')}
                </Button>
              </>
            ) : (
              <Button variant='primary' onClick={handleEdit}>
                <Pencil className='size-[15px]' strokeWidth={2} aria-hidden />
                {t('edit')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={tabItems}
            value={tab}
            onChange={id => setTab(id as SettingsTabId)}
            aria-label={t('tabsAria')}
          />
        </div>
      </div>

      <div
        key={tab}
        role='tabpanel'
        className='w-full max-w-[1000px] px-5 py-6 md:px-8'
      >
        {tab === 'general' ? (
          <GeneralPanel
            data={data}
            editing={editing}
            issues={issues}
            onChange={onChange}
          />
        ) : null}
        {tab === 'measurement' ? (
          <MeasurementPanel
            data={data}
            editing={editing}
            issues={issues}
            onChange={onChange}
          />
        ) : null}
        {tab === 'privacy' ? (
          <PrivacyPanel
            data={data}
            editing={editing}
            issues={issues}
            onChange={onChange}
          />
        ) : null}
        {tab === 'team' ? (
          <TeamPanel
            data={data}
            editing={editing}
            issues={issues}
            onChange={onChange}
          />
        ) : null}
        {tab === 'data' ? <DataPanel data={data} /> : null}
      </div>
    </div>
  );
};
