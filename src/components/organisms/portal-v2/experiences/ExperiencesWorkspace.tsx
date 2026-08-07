'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ExperienceCard } from '@/components/organisms/portal-v2/experiences/ExperienceCard';
import { ExperienceDetailModal } from '@/components/organisms/portal-v2/experiences/ExperienceDetailModal';
import { ExperienceToolbar } from '@/components/organisms/portal-v2/experiences/ExperienceToolbar';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import {
  EXPERIENCE_DEFAULT_FILTERS,
  EXPERIENCE_TABS,
  refineFacetsFor,
  type RefineAxis,
} from '@/lib/portal-v2/experiences/constants';
import {
  canEditCanvas,
  canPreview,
  canvasEditorHref,
  countByTab,
  filterExperiences,
  findById,
} from '@/lib/portal-v2/experiences/helpers';
import {
  EXPERIENCE_DEFAULT_TAB,
  writeExperienceTabParam,
} from '@/lib/portal-v2/experiences/tabParam';
import type {
  ExperienceFilters,
  ExperienceTab,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import { writeExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { cn } from '@/lib/cn';

type ExperiencesWorkspaceProps = {
  initialItems: ExperienceView[];
  initialError: string | null;
  /** One source failed while the other returned rows — shown as a strip. */
  initialSoftError?: string | null;
  /** Tab from `?tab=` — reopens e.g. the Blocks tab on a pasted link. */
  initialTab?: ExperienceTab | null;
  /** Experience id from `?preview=` — reopens that preview on a pasted link. */
  initialPreviewId?: string | null;
};

type ModalMode = 'detail' | 'preview' | null;

const SEARCH_DEBOUNCE_MS = 350;

/**
 * The library of everything after the click — landing pages AND blocks.
 *
 * ONE tab row carries the whole navigation: All, the three page ownership
 * states, then Blocks. All means all; the ownership tabs are page lineage so
 * they exclude blocks by construction; Blocks is the block half and swaps the
 * Refine drawer for the two axes a block actually has on the wire.
 *
 * Everything BELOW the tabs is shared on purpose: one card, one detail modal,
 * one preview shell. A block behaves exactly like a page; only the record it
 * loads and the route it edits at differ.
 */
export const ExperiencesWorkspace = ({
  initialItems,
  initialError,
  initialSoftError = null,
  initialTab = null,
  initialPreviewId = null,
}: ExperiencesWorkspaceProps) => {
  const t = useTranslations('portalV2.experiences');
  const router = useRouter();

  /**
   * Resolved at mount only: a deep link opens the preview on the first paint
   * instead of flashing the grid, and the URL never has to be rewritten.
   */
  const [deepLinkedExperience] = useState<ExperienceView | null>(() => {
    if (!initialPreviewId) return null;
    const match = findById(initialItems, initialPreviewId);
    return match && canPreview(match) ? match : null;
  });

  const [items, setItems] = useState<ExperienceView[]>(initialItems);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [softError, setSoftError] = useState<string | null>(initialSoftError);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<ExperienceFilters>(() => ({
    ...EXPERIENCE_DEFAULT_FILTERS,
    tab: initialTab ?? EXPERIENCE_DEFAULT_TAB,
  }));

  const [activeId, setActiveId] = useState<string | null>(
    deepLinkedExperience?.id ?? null
  );
  const [modalMode, setModalMode] = useState<ModalMode>(
    deepLinkedExperience ? 'preview' : null
  );
  const [previewReturnToDetail, setPreviewReturnToDetail] = useState(false);

  const modalModeRef = useRef(modalMode);
  /** The first debounce tick would re-fetch what the server already sent. */
  const skipFirstSearch = useRef(true);
  /** `?preview=` pointed at an experience that is gone or has nothing to render. */
  const deadPreviewLinkRef = useRef(
    Boolean(initialPreviewId) && deepLinkedExperience === null
  );

  modalModeRef.current = modalMode;

  /* Search hits BOTH servers (`?q=`); the chip axes and the tab rows narrow
     client-side, so they never trigger a fetch. */
  useEffect(() => {
    if (skipFirstSearch.current) {
      skipFirstSearch.current = false;
      return;
    }

    let cancelled = false;
    const handle = setTimeout(() => {
      setSearching(true);
      void fetchExperienceLibrary({ q: filters.q })
        .then(res => {
          if (cancelled) return;
          setItems(res.items);
          setLoadError(res.error);
          setSoftError(res.softError);
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

  const visible = useMemo(
    () => filterExperiences(items, filters),
    [items, filters]
  );

  const active = findById(items, activeId);

  const isBlockTab = filters.tab === 'block';

  /* ── tabs ────────────────────────────────────────────────────────────── */

  const tabItems = useMemo(
    () =>
      EXPERIENCE_TABS.map(tab => ({
        id: tab.id,
        label: t(tab.labelKey),
        count: countByTab(items, tab.id),
      })),
    [items, t]
  );

  /**
   * Moving on or off the Blocks tab clears the axes the drawer stops showing.
   *
   * Leave them set and the next tab silently hides rows the user has no visible
   * control to release — the token that would explain it lives in a drawer they
   * are no longer looking at.
   */
  const handleTabChange = useCallback((id: string) => {
    const tab = id as ExperienceTab;
    setFilters(prev => {
      if (prev.tab === tab) return prev;
      const swapsDrawer = (prev.tab === 'block') !== (tab === 'block');
      if (!swapsDrawer) return { ...prev, tab };
      return {
        ...prev,
        tab,
        vehicle: 'all',
        objective: 'all',
        ev: 'all',
        blockCat: 'all',
        surface: 'all',
      };
    });
    writeExperienceTabParam(tab);
  }, []);

  const handleQChange = useCallback((q: string) => {
    setFilters(prev => ({ ...prev, q }));
  }, []);

  const handleFacetChange = useCallback((key: RefineAxis, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const facets = refineFacetsFor(filters.tab);

  const facetValues = useMemo(
    (): Record<RefineAxis, string> => ({
      vehicle: filters.vehicle,
      objective: filters.objective,
      ev: filters.ev,
      blockCat: filters.blockCat,
      surface: filters.surface,
    }),
    [filters]
  );

  /* ── preview ─────────────────────────────────────────────────────────── */

  const previewNeighbors = useMemo(() => visible.filter(canPreview), [visible]);

  const toPreviewItem = useCallback(
    (experience: ExperienceView): PreviewItem => ({
      id: experience.id,
      name: experience.name,
      // A page renders from `/p/{slug}`; a block from `/embed/block/{id}`.
      // `ExchangePreviewShell` already branches on this.
      source: experience.kind === 'block' ? 'block' : 'page',
      slug: experience.slug ?? undefined,
      blockId: experience.kind === 'block' ? experience.id : undefined,
      kindLabel: t(experience.kind === 'block' ? 'kindBlock' : 'kindPage'),
      evidence: experience.stats
        ? { sessions: experience.stats.sessions, lift: experience.stats.lift }
        : null,
    }),
    [t]
  );

  const previewNeighborItems = useMemo(
    () => previewNeighbors.map(toPreviewItem),
    [previewNeighbors, toPreviewItem]
  );

  /**
   * Open the shell immediately. Stage loading (logo + progress) lives inside
   * the device frame while the iframe boots.
   */
  const handlePreview = useCallback(
    (experience: ExperienceView) => {
      if (!canPreview(experience)) {
        toast.error(t('previewNoSlug'));
        return;
      }
      setPreviewReturnToDetail(modalModeRef.current === 'detail');
      setActiveId(experience.id);
      setModalMode('preview');
    },
    [t]
  );

  const handleClosePreview = useCallback(() => {
    if (previewReturnToDetail && activeId) {
      setPreviewReturnToDetail(false);
      setModalMode('detail');
      return;
    }
    setModalMode(null);
    setActiveId(null);
  }, [previewReturnToDetail, activeId]);

  const handlePreviewNavigate = useCallback(
    (item: PreviewItem) => {
      const next = findById(items, item.id);
      if (!next || !canPreview(next)) {
        toast.error(t('previewNoSlug'));
        return;
      }
      setActiveId(next.id);
    },
    [items, t]
  );

  /** Address bar follows the open preview, so the URL can be copied and pasted back. */
  useEffect(() => {
    const previewing = modalMode === 'preview' ? activeId : null;
    writeExchangePreviewParam(previewing);
  }, [modalMode, activeId]);

  useEffect(() => {
    if (!deadPreviewLinkRef.current) return;
    deadPreviewLinkRef.current = false;
    toast.error(t('previewUnavailable'));
  }, [t]);

  /* ── edit ────────────────────────────────────────────────────────────── */

  /* Same tab, so the canvas's own back button has a history entry to return to. */
  const handleEdit = useCallback(
    (experience: ExperienceView) => {
      if (!canEditCanvas(experience)) {
        toast.error(t('editExternalHint'));
        return;
      }
      router.push(canvasEditorHref(experience));
    },
    [router, t]
  );

  const handleOpen = useCallback((experience: ExperienceView) => {
    setActiveId(experience.id);
    setModalMode('detail');
  }, []);

  const handleCloseDetail = useCallback(() => {
    setModalMode(null);
    setActiveId(null);
  }, []);

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
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        {loadError && !items.length ? (
          <div
            className={cn(
              'rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)]',
              'bg-[var(--pv2-paper)] px-6 py-14 text-center'
            )}
          >
            <p className='text-[15px] font-semibold text-[var(--pv2-ink)]'>
              {t('loadError')}
            </p>
            <p className='mt-2 text-[13px] text-[var(--pv2-mut)]'>
              {loadError}
            </p>
          </div>
        ) : (
          <>
            {softError ? (
              <div
                className={cn(
                  'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                  'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
                )}
              >
                {t('loadErrorPartial')} — {softError}
              </div>
            ) : null}

            {/* The whole navigation: All · the three ownership states · Blocks. */}
            <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
              <Tabs
                items={tabItems}
                value={filters.tab}
                onChange={handleTabChange}
                aria-label={t('stateTabsAria')}
              />
            </div>

            <ExperienceToolbar
              q={filters.q}
              onQChange={handleQChange}
              facets={facets}
              values={facetValues}
              onFacetChange={handleFacetChange}
            />

            {searching ? (
              <div className='mt-4 flex items-center justify-center gap-2 py-10 text-[13px] text-[var(--pv2-mut)]'>
                <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
                {t('loading')}
              </div>
            ) : visible.length ? (
              <>
                <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
                  {t(isBlockTab ? 'resultsCountBlocks' : 'resultsCount', {
                    count: visible.length,
                  })}
                </p>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
                  {visible.map(experience => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      onOpen={handleOpen}
                      onPreview={handlePreview}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div
                className={cn(
                  'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
                  'px-10 py-12 text-center'
                )}
              >
                <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
                  {t(isBlockTab ? 'emptyBlocks' : 'empty')}
                </p>
                <p className='mt-1.5 text-[13px] text-[var(--pv2-faint)]'>
                  {t('emptyHint')}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {modalMode === 'detail' && active ? (
        <ExperienceDetailModal
          experience={active}
          onClose={handleCloseDetail}
          onPreview={handlePreview}
          onEdit={handleEdit}
        />
      ) : null}

      <ExchangePreviewShell
        open={modalMode === 'preview' && active !== null}
        listing={
          modalMode === 'preview' && active ? toPreviewItem(active) : null
        }
        neighbors={previewNeighborItems}
        onClose={handleClosePreview}
        onNavigate={handlePreviewNavigate}
      />
    </div>
  );
};
