'use client';

import { ListFilter, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ExperienceCard } from '@/components/organisms/portal-v2/experiences/ExperienceCard';
import { ExperienceDetailModal } from '@/components/organisms/portal-v2/experiences/ExperienceDetailModal';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import {
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_DEFAULT_FILTERS,
  EXPERIENCE_EVIDENCE,
  EXPERIENCE_OBJECTIVES,
  EXPERIENCE_STATES,
  EXPERIENCE_VEHICLES,
} from '@/lib/portal-v2/experiences/constants';
import {
  canEditCanvas,
  canPreview,
  canvasEditorHref,
  countByState,
  filterExperiences,
  findById,
} from '@/lib/portal-v2/experiences/helpers';
import { writeExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import type {
  ExperienceFilters,
  ExperienceState,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { cn } from '@/lib/cn';

type ExperiencesWorkspaceProps = {
  initialItems: ExperienceView[];
  initialError: string | null;
  /** Experience id from `?preview=` — reopens that preview on a pasted link. */
  initialPreviewId?: string | null;
};

type ModalMode = 'detail' | 'preview' | null;

/** Facet axes that live behind the Refine toggle (prototype `RKEYS`). */
type RefineAxis = 'category' | 'vehicle' | 'objective' | 'ev';

const SEARCH_DEBOUNCE_MS = 350;

const REFINE_FACETS: {
  key: RefineAxis;
  labelKey: string;
  options:
    | typeof EXPERIENCE_CATEGORIES
    | typeof EXPERIENCE_VEHICLES
    | typeof EXPERIENCE_OBJECTIVES
    | typeof EXPERIENCE_EVIDENCE;
}[] = [
  {
    key: 'category',
    labelKey: 'filterCategory',
    options: EXPERIENCE_CATEGORIES,
  },
  { key: 'vehicle', labelKey: 'filterVehicle', options: EXPERIENCE_VEHICLES },
  {
    key: 'objective',
    labelKey: 'filterObjective',
    options: EXPERIENCE_OBJECTIVES,
  },
  { key: 'ev', labelKey: 'filterEvidence', options: EXPERIENCE_EVIDENCE },
];

export const ExperiencesWorkspace = ({
  initialItems,
  initialError,
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
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<ExperienceFilters>(
    EXPERIENCE_DEFAULT_FILTERS
  );
  /** Category / Type / Objective / Evidence — collapsed until asked for. */
  const [refineOpen, setRefineOpen] = useState(false);

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

  /* Search hits the server (`?q=`); the chip axes are seeded values and narrow
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

  const stateTabs = useMemo(
    () =>
      EXPERIENCE_STATES.map(s => ({
        id: s.id,
        label: t(s.labelKey),
        count: countByState(items, s.id),
      })),
    [items, t]
  );

  const handleStateChange = useCallback((id: string) => {
    setFilters(prev => ({
      ...prev,
      state: id as ExperienceState | 'all',
    }));
  }, []);

  const chipOptions = <T extends string>(defs: { id: T; labelKey: string }[]) =>
    defs.map(d => ({ id: d.id, label: t(d.labelKey) }));

  const activeRefines = useMemo(
    () =>
      REFINE_FACETS.flatMap(facet => {
        const value = filters[facet.key];
        if (value === 'all') return [];
        const opt = facet.options.find(o => o.id === value);
        if (!opt) return [];
        return [{ key: facet.key, label: t(opt.labelKey) }];
      }),
    [filters, t]
  );

  const handleClearRefine = useCallback((key: RefineAxis) => {
    setFilters(prev => ({ ...prev, [key]: 'all' }));
  }, []);

  const handleToggleRefine = useCallback(() => {
    setRefineOpen(prev => !prev);
  }, []);

  /* ── preview ─────────────────────────────────────────────────────────── */

  const previewNeighbors = useMemo(() => visible.filter(canPreview), [visible]);

  const toPreviewItem = useCallback(
    (experience: ExperienceView): PreviewItem => ({
      id: experience.id,
      name: experience.name,
      source: 'page',
      slug: experience.slug ?? undefined,
      kindLabel: t('catCollection'),
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
            {loadError ? (
              <div
                className={cn(
                  'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                  'bg-[var(--pv2-paper)] px-4 py-3 text-[12.5px] text-[var(--pv2-mut)]'
                )}
              >
                {loadError}
              </div>
            ) : null}

            <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
              <Tabs
                items={stateTabs}
                value={filters.state}
                onChange={handleStateChange}
                aria-label={t('stateTabsAria')}
              />
            </div>

            <div className='mb-3.5 flex flex-col gap-2.5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <label
                  className={cn(
                    'flex w-full max-w-[320px] shrink-0 items-center gap-2 rounded-[10px]',
                    'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
                    'transition-colors focus-within:border-[var(--pv2-violet)]',
                    'sm:w-[320px]'
                  )}
                >
                  <Search
                    className='size-3.5 shrink-0'
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  <input
                    type='search'
                    value={filters.q}
                    onChange={e =>
                      setFilters(prev => ({ ...prev, q: e.target.value }))
                    }
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchAria')}
                    className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
                  />
                </label>

                <button
                  type='button'
                  aria-expanded={refineOpen}
                  aria-controls='experiences-refine-panel'
                  aria-label={t('filterRefineAria')}
                  tabIndex={0}
                  onClick={handleToggleRefine}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleRefine();
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                    'text-[12px] font-semibold transition-colors duration-150',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                    'active:scale-[0.98]',
                    refineOpen
                      ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                      : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:text-[var(--pv2-ink)]'
                  )}
                >
                  <ListFilter
                    className='size-3.5 shrink-0'
                    strokeWidth={2}
                    aria-hidden
                  />
                  {t('filterRefine')}
                  {activeRefines.length > 0 ? (
                    <span
                      className={cn(
                        'ml-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                        refineOpen
                          ? 'bg-[var(--pv2-paper)]/20 text-[var(--pv2-paper)]'
                          : 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
                      )}
                    >
                      {activeRefines.length}
                    </span>
                  ) : null}
                </button>

                {activeRefines.map(token => (
                  <button
                    key={token.key}
                    type='button'
                    tabIndex={0}
                    title={t('clearRefineAria', { label: token.label })}
                    aria-label={t('clearRefineAria', { label: token.label })}
                    onClick={() => handleClearRefine(token.key)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClearRefine(token.key);
                      }
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
                      'text-[12px] font-semibold transition-colors duration-150',
                      'border-[color-mix(in_srgb,var(--pv2-violet)_28%,var(--pv2-hair))]',
                      'bg-[color-mix(in_srgb,var(--pv2-violet)_12%,var(--pv2-paper))] text-[var(--pv2-violet)]',
                      'hover:border-[var(--pv2-violet)] hover:bg-[var(--pv2-violet)] hover:text-[var(--pv2-paper)]',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                      'active:scale-[0.98]'
                    )}
                  >
                    {token.label}
                    <span
                      className='text-[13px] leading-none opacity-75'
                      aria-hidden
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>

              {refineOpen ? (
                <div
                  id='experiences-refine-panel'
                  className={cn(
                    'flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
                    'bg-[var(--pv2-paper)] px-4 py-3.5'
                  )}
                >
                  {REFINE_FACETS.map(facet => (
                    <div
                      key={facet.key}
                      className='flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5'
                    >
                      <span
                        className={cn(
                          'w-[74px] shrink-0 text-[9.5px] font-bold tracking-[0.09em]',
                          'text-[var(--pv2-faint)] uppercase'
                        )}
                      >
                        {t(facet.labelKey)}
                      </span>
                      <FilterChips
                        inline
                        options={chipOptions(facet.options)}
                        value={filters[facet.key]}
                        onChange={id =>
                          setFilters(prev => ({ ...prev, [facet.key]: id }))
                        }
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {searching ? (
              <div className='mt-4 flex items-center justify-center gap-2 py-10 text-[13px] text-[var(--pv2-mut)]'>
                <Loader2 className='size-4 animate-spin text-[var(--pv2-electric)]' />
                {t('loading')}
              </div>
            ) : visible.length ? (
              <>
                <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
                  {t('resultsCount', { count: visible.length })}
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
                  {t('empty')}
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
