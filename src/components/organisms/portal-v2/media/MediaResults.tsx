'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AssetCard } from '@/components/organisms/portal-v2/media/AssetCard';
import { AssetTable } from '@/components/organisms/portal-v2/media/AssetTable';
import { MEDIA_UPLOAD_INPUT_ID } from '@/lib/portal-v2/media/constants';
import type { MediaAsset, MediaViewMode } from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type MediaResultsProps = {
  searching: boolean;
  assets: MediaAsset[];
  view: MediaViewMode;
  selected: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpen: (asset: MediaAsset) => void;
  onEdit: (asset: MediaAsset) => void;
  onArchive: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
};

export const MediaResults = ({
  searching,
  assets,
  view,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
}: MediaResultsProps) => {
  const t = useTranslations('portalV2.media');

  if (searching) {
    return (
      <div className='flex items-center justify-center gap-2 py-14 text-[13px] text-[var(--pv2-mut)]'>
        <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
        {t('searching')}
      </div>
    );
  }

  if (!assets.length) {
    // `htmlFor` trỏ tới <input> nằm trong MediaHeader — id phải đến từ constants.
    return (
      <label
        htmlFor={MEDIA_UPLOAD_INPUT_ID}
        className={cn(
          'block cursor-pointer rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
          'px-10 py-14 text-center transition-colors',
          'hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]'
        )}
      >
        <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
          {t('emptyTitle')}
        </p>
        <p className='mt-1.5 text-[12.5px] text-[var(--pv2-faint)]'>
          {t('emptyBody')}
        </p>
        <p className='mt-2.5 text-[12.5px] font-semibold text-[var(--pv2-electric)]'>
          {t('emptyUploadHint')}
        </p>
      </label>
    );
  }

  if (view === 'grid') {
    return (
      <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5'>
        {assets.map(asset => (
          <AssetCard
            key={asset.id}
            asset={asset}
            selected={selected.includes(asset.id)}
            onToggleSelect={() => onToggleSelect(asset.id)}
            onOpen={() => onOpen(asset)}
            onEdit={() => onEdit(asset)}
            onArchive={() => onArchive(asset)}
            onDelete={() => onDelete(asset)}
          />
        ))}
      </div>
    );
  }

  return (
    <AssetTable
      assets={assets}
      selected={selected}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      onOpen={onOpen}
      onEdit={onEdit}
      onArchive={onArchive}
      onDelete={onDelete}
    />
  );
};
