'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { MEDIA_USE_TABS } from '@/lib/portal-v2/media/constants';
import type { MediaAsset, MediaFilters } from '@/lib/portal-v2/media/types';

type MediaUseTabsProps = {
  assets: MediaAsset[];
  value: MediaFilters['use'];
  onChange: (use: MediaFilters['use']) => void;
};

export const MediaUseTabs = ({
  assets,
  value,
  onChange,
}: MediaUseTabsProps) => {
  const t = useTranslations('portalV2.media');

  const items = useMemo(
    () => [
      { id: 'all', label: t('tabAll'), count: assets.length },
      ...MEDIA_USE_TABS.map(u => ({
        id: u.id,
        label: t(u.labelKey),
        count: assets.filter(a => a.uses.includes(u.id)).length,
      })),
    ],
    [assets, t]
  );

  return (
    // Negative margin để sticky bar tràn hết padding ngang của container cha.
    <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
      <Tabs
        items={items}
        value={value}
        onChange={id => onChange(id as MediaFilters['use'])}
        aria-label={t('useTabsAria')}
      />
    </div>
  );
};
