'use client';

import { Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { CampaignBulkBar } from '@/components/organisms/portal-v2/campaigns/CampaignBulkBar';
import { CampaignGrid } from '@/components/organisms/portal-v2/campaigns/CampaignGrid';
import { CampaignTable } from '@/components/organisms/portal-v2/campaigns/CampaignTable';
import { CampaignToolbar } from '@/components/organisms/portal-v2/campaigns/CampaignToolbar';
import { DeleteCampaignModal } from '@/components/organisms/portal-v2/campaigns/DeleteCampaignModal';
import { NewCampaignModal } from '@/components/organisms/portal-v2/campaigns/NewCampaignModal';
import { cn } from '@/lib/cn';
import {
  CAMPAIGN_DEFAULT_FILTERS,
  CAMPAIGN_STAGES,
  CAMPAIGN_STAGE_ORDER,
} from '@/lib/portal-v2/campaigns/constants';
import {
  countByStage,
  visibleCampaigns,
} from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignDraft,
  CampaignFilters,
  CampaignSource,
  CampaignStage,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import {
  createCampaign,
  deleteCampaign,
  fetchCampaignBoard,
  fetchCampaignProducts,
} from '@/services/portal-v2/campaignBoard';

type CampaignsWorkspaceProps = {
  initialItems: CampaignView[];
  initialError: string | null;
  initialSource: CampaignSource;
  initialDegraded: boolean;
};

const SEARCH_DEBOUNCE_MS = 350;

export const CampaignsWorkspace = ({
  initialItems,
  initialError,
  initialSource,
  initialDegraded,
}: CampaignsWorkspaceProps) => {
  const t = useTranslations('portalV2.campaigns');
  const router = useRouter();

  const [items, setItems] = useState<CampaignView[]>(initialItems);
  const [source, setSource] = useState<CampaignSource>(initialSource);
  const [degraded, setDegraded] = useState(initialDegraded);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [filters, setFilters] = useState<CampaignFilters>(
    CAMPAIGN_DEFAULT_FILTERS
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [newOpen, setNewOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  /** The first debounce tick would re-fetch what the server already sent. */
  const skipFirstSearch = useRef(true);

  useEffect(() => {
    let cancelled = false;
    void fetchCampaignProducts().then(res => {
      if (!cancelled) setProducts(res.products);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Only the search goes to the server. The stage axis narrows client-side even
   * though `?status=` exists: pushing it to the server would leave `items`
   * holding just that one stage, and the tab counts — which are read off
   * `items` — would all collapse to zero. The whole workspace therefore has to
   * fit in one page; see `CAMPAIGN_PAGE_LIMIT`.
   */
  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      setSearching(true);
      void fetchCampaignBoard({ q: filters.q })
        .then(res => {
          if (cancelled) return;
          setItems(res.items);
          setSource(res.source);
          setDegraded(res.degraded);
          setLoadError(res.error);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [filters.q]);

  const productNames = useMemo(
    () => Object.fromEntries(products.map(p => [p.id, p.name])),
    [products]
  );

  const visible = useMemo(
    () => visibleCampaigns(items, filters),
    [items, filters]
  );

  const stageTabs = useMemo(
    () => [
      { id: 'all', label: t('tabAll'), count: items.length },
      ...CAMPAIGN_STAGE_ORDER.map(stage => ({
        id: stage,
        label: t(CAMPAIGN_STAGES[stage].labelKey),
        count: countByStage(items, stage),
      })),
    ],
    [items, t]
  );

  const reload = async () => {
    const res = await fetchCampaignBoard({ q: filters.q });
    setItems(res.items);
    setSource(res.source);
    setDegraded(res.degraded);
    setLoadError(res.error);
  };

  const patchFilters = (partial: Partial<CampaignFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
    /* A changed facet invalidates the selection; a view swap does not. */
    if (!('view' in partial)) setSelected([]);
  };

  const handleCreate = async (draft: CampaignDraft) => {
    setSaving(true);
    try {
      const created = await createCampaign(source, draft);
      toast.success(t('toastCreated', { name: created.name }));
      setNewOpen(false);
      setFilters(CAMPAIGN_DEFAULT_FILTERS);
      setSelected([]);
      router.push(`/portal-v2/campaigns/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastCreateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteIds?.length) return;
    setSaving(true);
    try {
      await Promise.all(deleteIds.map(id => deleteCampaign(source, id)));
      toast.success(t('toastDeleted', { count: deleteIds.length }));
      setDeleteIds(null);
      setSelected([]);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('toastDeleteFailed'));
    } finally {
      setSaving(false);
    }
  };

  const open = (id: string) => router.push(`/portal-v2/campaigns/${id}`);

  const deleteItems = deleteIds
    ? items.filter(campaign => deleteIds.includes(campaign.id))
    : [];

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button variant='primary' onClick={() => setNewOpen(true)}>
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('newCampaign')}
            </Button>
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={stageTabs}
            value={filters.stage}
            onChange={id =>
              patchFilters({ stage: id as CampaignStage | 'all' })
            }
            aria-label={t('stageTabsAria')}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {degraded ? (
          <p className='mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
            {t('degradedNotice')}
          </p>
        ) : null}

        {loadError ? (
          <p
            className={cn(
              'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
              'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
            )}
          >
            {loadError}
          </p>
        ) : null}

        <CampaignToolbar filters={filters} onChange={patchFilters} />

        {selected.length ? (
          <CampaignBulkBar
            count={selected.length}
            onDelete={() => setDeleteIds(selected)}
            onClear={() => setSelected([])}
          />
        ) : null}

        {searching ? (
          <div className='flex items-center justify-center gap-2 py-10 text-[13px] text-[var(--pv2-mut)]'>
            <Loader2
              className='size-4 animate-spin text-[var(--pv2-electric)]'
              aria-hidden
            />
            {t('loading')}
          </div>
        ) : !visible.length ? (
          <EmptyState
            title={t('emptyTitle')}
            action={
              <Button variant='primary' onClick={() => setNewOpen(true)}>
                <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
                {t('newCampaign')}
              </Button>
            }
          >
            {t('emptyBody')}
          </EmptyState>
        ) : filters.view === 'grid' ? (
          <CampaignGrid
            campaigns={visible}
            productNames={productNames}
            selected={selected}
            onToggleSelect={id =>
              setSelected(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
            onOpen={open}
            onEdit={open}
            onDelete={id => setDeleteIds([id])}
          />
        ) : (
          <CampaignTable
            campaigns={visible}
            selected={selected}
            onToggleSelect={id =>
              setSelected(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
            onToggleAll={() =>
              setSelected(prev =>
                prev.length === visible.length ? [] : visible.map(c => c.id)
              )
            }
            onOpen={open}
            onEdit={open}
            onDelete={id => setDeleteIds([id])}
          />
        )}
      </div>

      {newOpen ? (
        <NewCampaignModal
          source={source}
          products={products}
          saving={saving}
          onClose={() => setNewOpen(false)}
          onCreate={draft => void handleCreate(draft)}
        />
      ) : null}

      {deleteItems.length ? (
        <DeleteCampaignModal
          items={deleteItems}
          saving={saving}
          onClose={() => setDeleteIds(null)}
          onConfirm={() => void handleDelete()}
        />
      ) : null}
    </div>
  );
};
