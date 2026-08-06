'use client';

import { Check, Loader2, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { AudiencePanel } from '@/components/organisms/portal-v2/brand/AudiencePanel';
import { EssencePanel } from '@/components/organisms/portal-v2/brand/EssencePanel';
import { IdentityPanel } from '@/components/organisms/portal-v2/brand/IdentityPanel';
import { VisualPanel } from '@/components/organisms/portal-v2/brand/VisualPanel';
import { BRAND_TABS } from '@/lib/portal-v2/brand/constants';
import { cloneBrand } from '@/lib/portal-v2/brand/mock';
import type { BrandData, BrandTabId } from '@/lib/portal-v2/brand/types';
import { saveBrandProfile } from '@/services/portal-v2/brandProfile';

type BrandWorkspaceProps = {
  /** Hồ sơ THẬT nạp từ server; `null` = brand này chưa có hồ sơ nào. */
  initialData: BrandData;
  initialVersion: number;
  brandId: string | null;
  initialError: string | null;
};

export const BrandWorkspace = ({
  initialData,
  initialVersion,
  brandId,
  initialError,
}: BrandWorkspaceProps) => {
  const t = useTranslations('portalV2.brand');
  const [tab, setTab] = useState<BrandTabId>('identity');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<BrandData>(() => cloneBrand(initialData));
  const [draft, setDraft] = useState<BrandData>(() => cloneBrand(initialData));
  /** Khoá chống ghi đè của BE — gửi lại đúng số vừa đọc khi lưu. */
  const [version, setVersion] = useState(initialVersion);
  const [saving, setSaving] = useState(false);
  const [loadError] = useState<string | null>(initialError);

  const data = editing ? draft : saved;
  const tabMeta = BRAND_TABS.find(x => x.id === tab) ?? BRAND_TABS[0]!;

  const tabItems = useMemo(
    () =>
      BRAND_TABS.map(x => ({
        id: x.id,
        label: t(x.labelKey),
        count: x.id === 'audience' ? data.audience.length : undefined,
      })),
    [t, data.audience.length]
  );

  const handleEdit = () => {
    setDraft(cloneBrand(saved));
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(cloneBrand(saved));
    setEditing(false);
  };

  const handleSave = async () => {
    if (!brandId || saving) return;
    const cleaned: BrandData = {
      ...draft,
      identity: {
        ...draft.identity,
        differentiation: draft.identity.differentiation
          .map(s => s.trim())
          .filter(Boolean),
      },
      essence: {
        ...draft.essence,
        functional: draft.essence.functional.map(s => s.trim()).filter(Boolean),
        emotional: draft.essence.emotional.map(s => s.trim()).filter(Boolean),
        social: draft.essence.social.map(s => s.trim()).filter(Boolean),
      },
      visual: {
        ...draft.visual,
        layout: draft.visual.layout.map(s => s.trim()).filter(Boolean),
      },
    };
    setSaving(true);
    try {
      // Nhận lại bản BE trả về: nó tăng `version` và có thể chuẩn hoá vài
      // trường. Giữ bản client gửi đi thì lần lưu sau mang version cũ và bị
      // từ chối.
      const res = await saveBrandProfile(brandId, cleaned, version);
      setSaved(cloneBrand(res.data));
      setDraft(cloneBrand(res.data));
      setVersion(res.version);
      setEditing(false);
      toast.success(t('toastSaved'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (id: string) => {
    setTab(id as BrandTabId);
  };

  const noop = () => undefined;
  const onChange = editing ? setDraft : noop;

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t(tabMeta.descKey)}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            {editing ? (
              <>
                <Button variant='ghost' onClick={handleCancel}>
                  {t('cancel')}
                </Button>
                <Button
                  variant='primary'
                  disabled={saving || !brandId}
                  onClick={handleSave}
                >
                  {saving ? (
                    <Loader2 className='size-[15px] animate-spin' aria-hidden />
                  ) : null}
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

      {loadError ? (
        <p className='mx-auto w-full px-5 pb-2 text-[12.5px] text-[var(--pv2-error)] md:px-8'>
          {loadError}
        </p>
      ) : !brandId ? (
        <p className='mx-auto w-full px-5 pb-2 text-[12.5px] text-[var(--pv2-warning)] md:px-8'>
          {t('noBrand')}
        </p>
      ) : null}

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={tabItems}
            value={tab}
            onChange={handleTabChange}
            aria-label={t('tabsAria')}
          />
        </div>
      </div>

      <div
        key={tab}
        role='tabpanel'
        className='mx-auto w-full px-5 py-8 md:px-8'
      >
        {tab === 'identity' ? (
          <IdentityPanel data={data} editing={editing} onChange={onChange} />
        ) : null}
        {tab === 'essence' ? (
          <EssencePanel data={data} editing={editing} onChange={onChange} />
        ) : null}
        {tab === 'audience' ? (
          <AudiencePanel data={data} editing={editing} onChange={onChange} />
        ) : null}
        {tab === 'visual' ? (
          <VisualPanel data={data} editing={editing} onChange={onChange} />
        ) : null}
      </div>
    </div>
  );
};
