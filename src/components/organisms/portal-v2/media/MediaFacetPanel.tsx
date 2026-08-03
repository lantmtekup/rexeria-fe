'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { MEDIA_KINDS, MEDIA_STATUS } from '@/lib/portal-v2/media/constants';
import type {
  MediaAsset,
  MediaFacetOption,
  MediaFilters,
  MediaKindId,
  MediaStatusId,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

const FacetRow = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: MediaFacetOption[];
  value: string;
  onChange: (id: string) => void;
}) => (
  <div className='flex flex-wrap items-center gap-2'>
    <span className='w-16 shrink-0 text-[11px] font-semibold tracking-[0.04em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <div className='flex flex-wrap items-center gap-1.5'>
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <Button
            key={opt.id}
            variant='toggle'
            size='sm'
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              active &&
                'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)] hover:border-[var(--pv2-ink)] hover:text-[var(--pv2-paper)]'
            )}
          >
            {opt.label}
            {opt.count !== undefined ? (
              <span className='tabular-nums opacity-70'>{opt.count}</span>
            ) : null}
          </Button>
        );
      })}
    </div>
  </div>
);

type MediaFacetPanelProps = {
  assets: MediaAsset[];
  kind: MediaFilters['kind'];
  status: MediaFilters['status'];
  onPatch: (patch: Partial<MediaFilters>) => void;
};

export const MediaFacetPanel = ({
  assets,
  kind,
  status,
  onPatch,
}: MediaFacetPanelProps) => {
  const t = useTranslations('portalV2.media');

  const kindOptions = useMemo<MediaFacetOption[]>(
    () => [
      { id: 'all', label: t('facetAll'), count: assets.length },
      ...(Object.keys(MEDIA_KINDS) as MediaKindId[]).map(k => ({
        id: k,
        label: t(MEDIA_KINDS[k].labelKey),
        count: assets.filter(a => a.kind === k).length,
      })),
    ],
    [assets, t]
  );

  const statusOptions = useMemo<MediaFacetOption[]>(
    () => [
      { id: 'all', label: t('facetAll'), count: assets.length },
      ...(Object.keys(MEDIA_STATUS) as MediaStatusId[]).map(s => ({
        id: s,
        label: t(MEDIA_STATUS[s].labelKey),
        count: assets.filter(a => a.status === s).length,
      })),
    ],
    [assets, t]
  );

  return (
    <div className='mb-3.5 flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5'>
      <FacetRow
        label={t('facetType')}
        options={kindOptions}
        value={kind}
        onChange={id => onPatch({ kind: id as MediaFilters['kind'] })}
      />
      <FacetRow
        label={t('facetStatus')}
        options={statusOptions}
        value={status}
        onChange={id => onPatch({ status: id as MediaFilters['status'] })}
      />
    </div>
  );
};
