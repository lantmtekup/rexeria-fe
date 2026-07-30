'use client';

import {
  AlertTriangle,
  LayoutGrid,
  List,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  TextInput,
  TextSelect,
} from '@/components/molecules/portal-v2/brand-form';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { AssetCard } from '@/components/organisms/portal-v2/media/AssetCard';
import { AssetDetailModal } from '@/components/organisms/portal-v2/media/AssetDetailModal';
import { AssetTable } from '@/components/organisms/portal-v2/media/AssetTable';
import {
  MEDIA_DEFAULT_FILTERS,
  MEDIA_KINDS,
  MEDIA_STATUS,
  MEDIA_USE_TABS,
} from '@/lib/portal-v2/media/constants';
import {
  MOCK_STORAGE,
  cloneMediaAssets,
  deriveMediaFolders,
  filterMediaAssets,
} from '@/lib/portal-v2/media/mock';
import type {
  MediaAsset,
  MediaFilters,
  MediaKindId,
  MediaStatusId,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';
import { fetchMediaCatalog } from '@/services/portal-v2/mediaCatalog';
import { RxApiError } from '@/services/rexer/client';

const SEARCH_DEBOUNCE_MS = 350;

type FacetOption = { id: string; label: string; count?: number };

const FacetRow = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FacetOption[];
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

type MediaWorkspaceProps = {
  initialAssets: MediaAsset[];
  initialError?: string | null;
};

export const MediaWorkspace = ({
  initialAssets,
  initialError = null,
}: MediaWorkspaceProps) => {
  const t = useTranslations('portalV2.media');
  const [assets, setAssets] = useState<MediaAsset[]>(() =>
    cloneMediaAssets(initialAssets)
  );
  const [loadError, setLoadError] = useState(initialError);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<MediaFilters>(MEDIA_DEFAULT_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<MediaAsset | null>(null);
  const skipFirstSearch = useRef(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQ(filters.q.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }

    let cancelled = false;
    setSearching(true);

    fetchMediaCatalog({ q: debouncedQ || undefined })
      .then(result => {
        if (cancelled) return;
        setAssets(result.assets);
        setLoadError(result.error);
        setSelected(prev =>
          prev.filter(id => result.assets.some(a => a.id === id))
        );
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to load media'
        );
        setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const filtered = useMemo(
    () => filterMediaAssets(assets, { ...filters, q: '' }),
    [assets, filters]
  );
  const folders = useMemo(() => deriveMediaFolders(assets), [assets]);
  const expiringCount = useMemo(
    () => assets.filter(a => a.status === 'expiring').length,
    [assets]
  );
  const activeAsset = assets.find(a => a.id === activeId) ?? null;
  const modalAsset = editing ? draft : activeAsset;

  const useTabs = useMemo(
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

  const kindOptions = useMemo<FacetOption[]>(
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

  const statusOptions = useMemo<FacetOption[]>(
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

  const openAsset = (asset: MediaAsset, startEditing = false) => {
    setActiveId(asset.id);
    if (startEditing) {
      setDraft(structuredClone(asset));
      setEditing(true);
    } else {
      setDraft(null);
      setEditing(false);
    }
  };

  const closeModal = () => {
    setActiveId(null);
    setEditing(false);
    setDraft(null);
  };

  const startEdit = () => {
    if (!activeAsset) return;
    setDraft(structuredClone(activeAsset));
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(activeAsset ? structuredClone(activeAsset) : null);
    setEditing(false);
  };

  const patchDraft = (patch: Partial<MediaAsset>) =>
    setDraft(prev => (prev ? { ...prev, ...patch } : prev));

  const saveEdit = () => {
    if (!draft) return;
    const cleaned: MediaAsset = {
      ...draft,
      alt: draft.alt.trim(),
      caption: draft.caption.trim(),
      tags: draft.tags.map(x => x.trim()).filter(Boolean),
    };
    window.alert(JSON.stringify(cleaned, null, 2));
    setAssets(prev => prev.map(a => (a.id === cleaned.id ? cleaned : a)));
    setDraft(cleaned);
    setEditing(false);
    toast.success(t('metadataSaved'));
  };

  const deleteAsset = (asset: MediaAsset) => {
    if (!window.confirm(t('confirmDelete', { name: asset.name }))) return;
    setAssets(prev => prev.filter(a => a.id !== asset.id));
    setSelected(prev => prev.filter(id => id !== asset.id));
    if (activeId === asset.id) closeModal();
    toast.success(t('deletedToast', { name: asset.name }));
  };

  const archiveAsset = (asset: MediaAsset) => {
    setAssets(prev =>
      prev.map(a => (a.id === asset.id ? { ...a, status: 'archived' } : a))
    );
    toast.success(t('archivedToast', { name: asset.name }));
  };

  const toggleSelect = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelected(prev =>
      prev.length === filtered.length ? [] : filtered.map(a => a.id)
    );

  const clearSelection = () => setSelected([]);

  const bulkArchive = () => {
    setAssets(prev =>
      prev.map(a =>
        selected.includes(a.id) ? { ...a, status: 'archived' } : a
      )
    );
    toast.success(t('bulkArchivedToast', { count: selected.length }));
    clearSelection();
  };

  const bulkDelete = () => {
    if (!window.confirm(t('confirmBulkDelete', { count: selected.length })))
      return;
    setAssets(prev => prev.filter(a => !selected.includes(a.id)));
    toast.success(t('bulkDeletedToast', { count: selected.length }));
    clearSelection();
  };

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle', {
                count: assets.length,
                usedPct: MOCK_STORAGE.usedPct,
                cap: MOCK_STORAGE.cap,
              })}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button
              variant='ghost'
              onClick={() => toast.message(t('autoTagToast'))}
            >
              <Sparkles className='size-[15px]' strokeWidth={2.2} aria-hidden />
              {t('autoTag')}
            </Button>
            <Button
              variant='primary'
              onClick={() => toast.message(t('uploadToast'))}
            >
              <Plus className='size-[15px]' strokeWidth={2.1} aria-hidden />
              {t('upload')}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {loadError ? (
          <div className='mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
            <span className='font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </span>{' '}
            {loadError}
          </div>
        ) : null}

        {expiringCount ? (
          <div className='mb-4 flex items-start gap-3 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_25%,var(--pv2-hair))] bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-3'>
            <AlertTriangle
              className='mt-0.5 size-4 shrink-0 text-[var(--pv2-error)]'
              strokeWidth={2}
              aria-hidden
            />
            <div className='min-w-0 flex-1'>
              <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {t('expiringWarning', { count: expiringCount })}
              </p>
              <p className='mt-0.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('expiringWarningBody')}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                setFilters(prev => ({ ...prev, status: 'expiring' }))
              }
            >
              {t('review')}
            </Button>
          </div>
        ) : null}

        <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <Tabs
            items={useTabs}
            value={filters.use}
            onChange={id =>
              setFilters(prev => ({ ...prev, use: id as MediaFilters['use'] }))
            }
            aria-label={t('useTabsAria')}
          />
        </div>

        <div className='mb-3.5 flex flex-wrap items-center gap-2'>
          <label
            className={cn(
              'flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px]',
              'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
              'transition-colors focus-within:border-[var(--pv2-electric)]'
            )}
          >
            <Search
              className='size-3.5 shrink-0'
              strokeWidth={2.2}
              aria-hidden
            />
            <TextInput
              type='search'
              value={filters.q}
              onChange={e =>
                setFilters(prev => ({ ...prev, q: e.target.value }))
              }
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAria')}
              className='w-auto min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-[12.5px]! text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] focus:border-0 focus:ring-0'
            />
          </label>

          <Button
            variant='toggle'
            size='sm'
            aria-pressed={filters.refine}
            onClick={() =>
              setFilters(prev => ({ ...prev, refine: !prev.refine }))
            }
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
              onClick={() =>
                setFilters(prev => ({ ...prev, [item.key]: 'all' }))
              }
              className='border-[var(--pv2-electric)]/25 bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric)] hover:text-[var(--pv2-paper)]'
            >
              {item.label}
              <X strokeWidth={2.4} aria-hidden />
            </Button>
          ))}

          <TextSelect
            value={filters.folder}
            onChange={e =>
              setFilters(prev => ({ ...prev, folder: e.target.value }))
            }
            aria-label={t('folderAria')}
            className='w-auto px-3 py-2 text-[12.5px]! focus:ring-0'
          >
            <option value='all'>
              {t('folderAll', { count: assets.length })}
            </option>
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

          <span className='ml-auto inline-flex items-center gap-0.5 rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-0.5'>
            <Button
              variant='toggle'
              aria-pressed={filters.view === 'table'}
              aria-label={t('viewList')}
              title={t('viewList')}
              onClick={() => setFilters(prev => ({ ...prev, view: 'table' }))}
              className={cn(
                'size-7 rounded-[8px] border-0 p-0 hover:border-0',
                filters.view === 'table'
                  ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
                  : 'bg-transparent text-[var(--pv2-faint)] hover:text-[var(--pv2-ink)]'
              )}
            >
              <List strokeWidth={2} aria-hidden />
            </Button>
            <Button
              variant='toggle'
              aria-pressed={filters.view === 'grid'}
              aria-label={t('viewGrid')}
              title={t('viewGrid')}
              onClick={() => setFilters(prev => ({ ...prev, view: 'grid' }))}
              className={cn(
                'size-7 rounded-[8px] border-0 p-0 hover:border-0',
                filters.view === 'grid'
                  ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
                  : 'bg-transparent text-[var(--pv2-faint)] hover:text-[var(--pv2-ink)]'
              )}
            >
              <LayoutGrid strokeWidth={2} aria-hidden />
            </Button>
          </span>
        </div>

        {filters.refine ? (
          <div className='mb-3.5 flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5'>
            <FacetRow
              label={t('facetType')}
              options={kindOptions}
              value={filters.kind}
              onChange={id =>
                setFilters(prev => ({
                  ...prev,
                  kind: id as MediaFilters['kind'],
                }))
              }
            />
            <FacetRow
              label={t('facetStatus')}
              options={statusOptions}
              value={filters.status}
              onChange={id =>
                setFilters(prev => ({
                  ...prev,
                  status: id as MediaFilters['status'],
                }))
              }
            />
          </div>
        ) : null}

        {selected.length ? (
          <div className='mb-3.5 flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-2.5'>
            <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
              {t('selectedCount', { count: selected.length })}
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => toast.message(t('autoTagSelectionToast'))}
            >
              {t('autoTag')}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => toast.message(t('linkToProductToast'))}
            >
              {t('linkToProduct')}
            </Button>
            <Button variant='ghost' size='sm' onClick={bulkArchive}>
              {t('archive')}
            </Button>
            <Button variant='danger' size='sm' onClick={bulkDelete}>
              {t('delete')}
            </Button>
            <div className='grow' />
            <Button variant='ghost' size='sm' onClick={clearSelection}>
              {t('clear')}
            </Button>
          </div>
        ) : null}

        {searching ? (
          <div className='flex items-center justify-center gap-2 py-14 text-[13px] text-[var(--pv2-mut)]'>
            <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
            {t('searching')}
          </div>
        ) : !filtered.length ? (
          <div
            className={cn(
              'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
              'px-10 py-14 text-center'
            )}
          >
            <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
              {t('emptyTitle')}
            </p>
            <p className='mt-1.5 text-[12.5px] text-[var(--pv2-faint)]'>
              {t('emptyBody')}
            </p>
          </div>
        ) : filters.view === 'grid' ? (
          <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3.5'>
            {filtered.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selected.includes(asset.id)}
                onToggleSelect={() => toggleSelect(asset.id)}
                onOpen={() => openAsset(asset)}
                onEdit={() => openAsset(asset, true)}
                onArchive={() => archiveAsset(asset)}
                onDelete={() => deleteAsset(asset)}
              />
            ))}
          </div>
        ) : (
          <AssetTable
            assets={filtered}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onOpen={openAsset}
            onEdit={asset => openAsset(asset, true)}
            onArchive={archiveAsset}
            onDelete={deleteAsset}
          />
        )}
      </div>

      {modalAsset ? (
        <AssetDetailModal
          asset={modalAsset}
          editing={editing}
          onChange={patchDraft}
          onEdit={startEdit}
          onCancel={cancelEdit}
          onSave={saveEdit}
          onDelete={() => deleteAsset(modalAsset)}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
};
