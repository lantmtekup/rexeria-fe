'use client';

import { Archive, Check, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { AssetThumb } from '@/components/organisms/portal-v2/media/AssetThumb';
import { FUNNEL_ROLES, mediaToneColor } from '@/lib/portal-v2/media/constants';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type AssetCardProps = {
  asset: MediaAsset;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

const QuickAction = ({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  danger?: boolean;
  onClick: (e: MouseEvent) => void;
}) => (
  <Button
    variant={danger ? 'danger' : 'ghost'}
    size='icon'
    aria-label={label}
    title={label}
    onClick={onClick}
    className={cn(
      'size-6 rounded-md border-0 bg-[var(--pv2-hair)] p-0 text-[var(--pv2-slate-500)] backdrop-blur-sm [&_svg]:size-3.5',
      'hover:bg-[var(--pv2-hair)] hover:text-[var(--pv2-electric)]',
      danger && 'hover:bg-[var(--pv2-hair)] hover:text-[var(--pv2-error)]'
    )}
  >
    <Icon strokeWidth={2.2} aria-hidden />
  </Button>
);

export const AssetCard = ({
  asset,
  selected,
  onToggleSelect,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
}: AssetCardProps) => {
  const t = useTranslations('portalV2.media');
  const archived = asset.status === 'archived';
  const kindBadge =
    asset.kind === 'D3' ? '3D' : asset.kind === 'P360' ? '360' : asset.kind;

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)] transition-colors',
        'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
        selected
          ? 'border-[var(--pv2-electric)] ring-1 ring-[var(--pv2-electric)]/30'
          : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)]'
      )}
    >
      <div className='absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'>
        <QuickAction
          icon={Pencil}
          label={t('editMetadataAria', { name: asset.name })}
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
        />
        <QuickAction
          icon={Archive}
          label={t('archiveAssetAria', { name: asset.name })}
          onClick={e => {
            e.stopPropagation();
            onArchive();
          }}
        />
        <QuickAction
          icon={Trash2}
          danger
          label={t('deleteAssetAria', { name: asset.name })}
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>

      <Button
        variant='toggle'
        size='icon'
        aria-label={t('selectAssetAria', { name: asset.name })}
        aria-pressed={selected}
        onClick={e => {
          e.stopPropagation();
          onToggleSelect();
        }}
        className={cn(
          'absolute top-2 left-2 z-10 size-5 rounded-sm border p-0 backdrop-blur-sm [&_svg]:size-3.5',
          selected
            ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-[var(--pv2-paper)] opacity-100'
            : 'bg-[var(--pv2-hair)] text-transparent opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:scale-95 hover:text-transparent'
        )}
      >
        <Check strokeWidth={3} aria-hidden />
      </Button>

      <div
        className='relative h-[132px] overflow-hidden'
        style={
          archived ? { filter: 'grayscale(.7)', opacity: 0.72 } : undefined
        }
      >
        <AssetThumb
          asset={asset}
          className='h-full w-full'
          iconClassName='size-7 opacity-90'
        />
        <span className='absolute right-2.5 bottom-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm'>
          {kindBadge}
        </span>
      </div>

      <div className='flex flex-1 flex-col gap-1 px-3 py-2.5'>
        <div className='truncate text-[12px] font-semibold text-[var(--pv2-ink)]'>
          {asset.name}
        </div>
        <div className='flex items-center gap-1.5 text-[11px] text-[var(--pv2-mut)]'>
          <span
            className='size-1.5 shrink-0 rounded-full'
            style={{
              background: mediaToneColor(FUNNEL_ROLES[asset.role].tone),
            }}
            aria-hidden
          />
          <span className='truncate'>
            {t(FUNNEL_ROLES[asset.role].labelKey)} · {asset.size}
          </span>
          {asset.links.length ? (
            <span className='ml-auto shrink-0 font-semibold text-[var(--pv2-ink)]'>
              ↻ {asset.links.length}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
