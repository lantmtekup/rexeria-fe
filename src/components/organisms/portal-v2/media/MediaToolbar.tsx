'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ViewToggle } from '@/components/molecules/portal-v2/ViewToggle';
import { TextSelect } from '@/components/molecules/portal-v2/brand-form';
import { MediaSearchField } from '@/components/organisms/portal-v2/media/MediaSearchField';
import { MEDIA_KINDS, MEDIA_STATUS } from '@/lib/portal-v2/media/constants';
import type {
  MediaFilters,
  MediaFolderGroup,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type MediaToolbarProps = {
  filters: MediaFilters;
  folders: MediaFolderGroup[];
  assetCount: number;
  onPatch: (patch: Partial<MediaFilters>) => void;
};

export const MediaToolbar = ({
  filters,
  folders,
  assetCount,
  onPatch,
}: MediaToolbarProps) => {
  const t = useTranslations('portalV2.media');

  const refineActiveCount =
    (filters.kind !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  const activeRefinements = useMemo(() => {
    const items: { key: 'kind' | 'status'; label: string }[] = [];
    if (filters.kind !== 'all') {
      items.push({ key: 'kind', label: t(MEDIA_KINDS[filters.kind].labelKey) });
    }
    if (filters.status !== 'all') {
      items.push({
        key: 'status',
        label: t(MEDIA_STATUS[filters.status].labelKey),
      });
    }
    return items;
  }, [filters.kind, filters.status, t]);

  return (
    <div className='mb-3.5 flex flex-wrap items-center gap-2'>
      <MediaSearchField value={filters.q} onChange={q => onPatch({ q })} />

      <Button
        variant='toggle'
        size='sm'
        aria-pressed={filters.refine}
        onClick={() => onPatch({ refine: !filters.refine })}
        className={cn(
          filters.refine &&
            'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)] hover:border-[var(--pv2-electric)] hover:text-[var(--pv2-electric)]'
        )}
      >
        <SlidersHorizontal strokeWidth={2} aria-hidden />
        {t('refine')}
        {refineActiveCount ? (
          <span className='rounded-md bg-[var(--pv2-electric)] px-1.5 py-px text-[10px] text-white'>
            {refineActiveCount}
          </span>
        ) : null}
      </Button>

      {activeRefinements.map(item => (
        <Button
          key={item.key}
          variant='toggle'
          size='sm'
          title={t('removeRefinementAria')}
          onClick={() => onPatch({ [item.key]: 'all' })}
          className='border-[var(--pv2-electric)]/25 bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric)] hover:text-[var(--pv2-paper)]'
        >
          {item.label}
          <X strokeWidth={2.4} aria-hidden />
        </Button>
      ))}

      <TextSelect
        value={filters.folder}
        onChange={e => onPatch({ folder: e.target.value })}
        aria-label={t('folderAria')}
        className='w-auto px-3 py-2 text-[12.5px]! focus:ring-0'
      >
        <option value='all'>{t('folderAll', { count: assetCount })}</option>
        {folders.map(group => (
          <optgroup key={group.labelKey} label={t(group.labelKey)}>
            {group.options.map(opt => (
              <option key={opt.id} value={opt.id}>
                {opt.label} ({opt.count})
              </option>
            ))}
          </optgroup>
        ))}
      </TextSelect>

      <ViewToggle
        value={filters.view}
        onChange={view => onPatch({ view })}
        className='ml-auto'
      />
    </div>
  );
};
