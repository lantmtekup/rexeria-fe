'use client';

import { Archive, Check, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/atoms/table';
import {
  KindPill,
  RoleTag,
  StatusPill,
} from '@/components/organisms/portal-v2/media/AssetPills';
import { AssetThumb } from '@/components/organisms/portal-v2/media/AssetThumb';
import { homeLabel } from '@/lib/portal-v2/media/helpers';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

type AssetTableProps = {
  assets: MediaAsset[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpen: (asset: MediaAsset) => void;
  onEdit: (asset: MediaAsset) => void;
  onArchive: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
};

const HEAD_CELL =
  'h-auto px-3 py-2.5 text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase';

export const AssetTable = ({
  assets,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onOpen,
  onEdit,
  onArchive,
  onDelete,
}: AssetTableProps) => {
  const t = useTranslations('portalV2.media');
  const allSelected = assets.length > 0 && selected.length === assets.length;

  return (
    <div className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <Table className='min-w-[920px] border-collapse text-left'>
        <TableHeader>
          <TableRow className='border-[var(--pv2-hair)] hover:bg-transparent'>
            <TableHead className={cn(HEAD_CELL, 'w-9')}>
              <Button
                variant='toggle'
                size='icon'
                aria-label={t('selectAllAria')}
                aria-pressed={allSelected}
                onClick={onToggleSelectAll}
                className={cn(
                  'size-5 rounded-md border p-0 [&_svg]:size-3',
                  allSelected
                    ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-white'
                    : 'border-[var(--pv2-hair)] text-transparent hover:border-[var(--pv2-slate-300)]'
                )}
              >
                <Check strokeWidth={3} aria-hidden />
              </Button>
            </TableHead>
            <TableHead className={HEAD_CELL}>{t('colAsset')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colType')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colFolder')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colStatus')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colRole')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colUsedIn')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colRights')}</TableHead>
            <TableHead className={HEAD_CELL}>{t('colUpdated')}</TableHead>
            <TableHead className={cn(HEAD_CELL, 'w-[96px]')} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(asset => {
            const isSelected = selected.includes(asset.id);
            const expires = asset.rights.expires;
            return (
              <TableRow
                key={asset.id}
                role='button'
                tabIndex={0}
                onClick={() => onOpen(asset)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(asset);
                  }
                }}
                className={cn(
                  'cursor-pointer border-[var(--pv2-hair)] hover:bg-[var(--pv2-canvas)]',
                  isSelected && 'bg-[var(--pv2-electric-soft)]'
                )}
              >
                <TableCell
                  className='px-3 py-2.5'
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    variant='toggle'
                    size='icon'
                    aria-label={t('selectAssetAria', { name: asset.name })}
                    aria-pressed={isSelected}
                    onClick={() => onToggleSelect(asset.id)}
                    className={cn(
                      'size-5 rounded-md border p-0 [&_svg]:size-3',
                      isSelected
                        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-white'
                        : 'border-[var(--pv2-hair)] text-transparent hover:border-[var(--pv2-slate-300)]'
                    )}
                  >
                    <Check strokeWidth={3} aria-hidden />
                  </Button>
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  <div className='flex items-center gap-2.5'>
                    <AssetThumb
                      asset={asset}
                      className='size-8 shrink-0 rounded-[8px]'
                      iconClassName='size-4'
                    />
                    <span className='min-w-0'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {asset.name}
                      </span>
                      <span className='block text-[11px] text-[var(--pv2-faint)]'>
                        {asset.dims} · {asset.size}
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  <KindPill kind={asset.kind} />
                </TableCell>
                <TableCell className='px-3 py-2.5 text-[11.5px] text-[var(--pv2-mut)]'>
                  {homeLabel(asset)}
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  <StatusPill status={asset.status} />
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  <RoleTag role={asset.role} />
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  {asset.links.length ? (
                    <span className='text-[12px] font-semibold text-[var(--pv2-ink)]'>
                      {t('placesCount', { count: asset.links.length })}
                    </span>
                  ) : (
                    <span className='text-[12px] text-[var(--pv2-faint)]'>
                      {t('unused')}
                    </span>
                  )}
                </TableCell>
                <TableCell className='px-3 py-2.5'>
                  {expires ? (
                    <span className='text-[11.5px] font-semibold text-[var(--pv2-error)]'>
                      {t('expiresOn', { date: expires })}
                    </span>
                  ) : (
                    <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                      {asset.rights.licence}
                    </span>
                  )}
                </TableCell>
                <TableCell className='px-3 py-2.5 text-[11.5px] text-[var(--pv2-faint)]'>
                  {asset.updated}
                </TableCell>
                <TableCell
                  className='px-3 py-2.5'
                  onClick={e => e.stopPropagation()}
                >
                  <div className='flex items-center justify-end gap-1'>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label={t('editMetadataAria', { name: asset.name })}
                      title={t('editMetadataAria', { name: asset.name })}
                      onClick={() => onEdit(asset)}
                      className='size-7 rounded-md border-0 p-0 text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] [&_svg]:size-3.5'
                    >
                      <Pencil strokeWidth={2} aria-hidden />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      aria-label={t('archiveAssetAria', { name: asset.name })}
                      title={t('archiveAssetAria', { name: asset.name })}
                      onClick={() => onArchive(asset)}
                      className='size-7 rounded-md border-0 p-0 text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] [&_svg]:size-3.5'
                    >
                      <Archive strokeWidth={2} aria-hidden />
                    </Button>
                    <Button
                      variant='danger'
                      size='icon'
                      aria-label={t('deleteAssetAria', { name: asset.name })}
                      title={t('deleteAssetAria', { name: asset.name })}
                      onClick={() => onDelete(asset)}
                      className='size-7 rounded-md p-0 hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] [&_svg]:size-3.5'
                    >
                      <Trash2 strokeWidth={2} aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
