'use client';

import { Check, Pencil, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
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
import { cloneSettings } from '@/lib/portal-v2/settings/mock';
import { saveSettings } from '@/services/portal-v2/settingsData';
import type {
  SettingsData,
  SettingsTabId,
} from '@/lib/portal-v2/settings/types';

type SettingsWorkspaceProps = {
  /** Dữ liệu THẬT — governance + capabilities + hồ sơ người đăng nhập. */
  initialData: SettingsData;
  /** Khoá lạc quan của governance; `PUT` bắt gửi đúng số này. */
  initialVersion: number;
  /** null = admin chưa chọn thương hiệu ⇒ không hỏi được, cũng không lưu được. */
  brandId: string | null;
  initialError?: string | null;
};

export const SettingsWorkspace = ({
  initialData,
  initialVersion,
  brandId,
  initialError = null,
}: SettingsWorkspaceProps) => {
  const t = useTranslations('portalV2.settings');
  const [tab, setTab] = useState<SettingsTabId>('general');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<SettingsData>(() =>
    cloneSettings(initialData)
  );
  const [draft, setDraft] = useState<SettingsData>(() =>
    cloneSettings(initialData)
  );
  const versionRef = useRef(initialVersion);
  const [loadError] = useState<string | null>(initialError);

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

    if (!brandId) {
      toast.error(t('toastNeedBrand'));
      return;
    }

    void saveSettings(cleaned, versionRef.current, brandId)
      .then(res => {
        // Nhận lại BẢN CỦA SERVER, không giữ bản vừa gõ: governance tự hạ
        // `default_privacy` khi `max_privacy` bị hạ xuống, nên hai bên có thể
        // khác nhau và bản đúng là bản server trả về.
        versionRef.current = res.version;
        setSaved(cloneSettings(res.data));
        setDraft(cloneSettings(res.data));
        setEditing(false);
        toast.success(t('toastSaved'));
      })
      .catch(() => toast.error(t('toastSaveFailed')));
  };

  const noop = () => undefined;
  const onChange = editing ? setDraft : noop;
  const restorable = !isGovernanceDefault(data);

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-[86ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(tabMeta.descKey)}
            </p>
            {/*
              Nạp hỏng ⇒ nói ra. Các ô sẽ hiện số 0 của khung trống, và im lặng
              ở đây khiến người dùng tưởng đó là cấu hình thật của họ.
            */}
            {loadError ? (
              <p className='mt-1.5 text-[12.5px] text-[var(--pv2-error)]'>
                {loadError}
              </p>
            ) : null}
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
