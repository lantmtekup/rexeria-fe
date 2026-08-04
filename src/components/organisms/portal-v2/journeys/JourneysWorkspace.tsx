'use client';

import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { DeleteJourneyModal } from '@/components/organisms/portal-v2/journeys/DeleteJourneyModal';
import { ForkJourneyModal } from '@/components/organisms/portal-v2/journeys/ForkJourneyModal';
import { JourneyCard } from '@/components/organisms/portal-v2/journeys/JourneyCard';
import { JourneyDetailModal } from '@/components/organisms/portal-v2/journeys/JourneyDetailModal';
import { JourneyEditor } from '@/components/organisms/portal-v2/journeys/editor/JourneyEditor';
import { NewJourneyModal } from '@/components/organisms/portal-v2/journeys/NewJourneyModal';
import { cn } from '@/lib/cn';
import {
  JOURNEY_DEFAULT_FILTERS,
  JOURNEY_STATE_TABS,
} from '@/lib/portal-v2/journeys/constants';
import { writeJourneyEditParam } from '@/lib/portal-v2/journeys/editParam';
import {
  copiesOfJourney,
  countByState,
  createJourney,
  deleteJourney,
  duplicateJourney,
  filterJourneys,
  findJourney,
  forkJourney,
  journeyHome,
  journeyStats,
} from '@/lib/portal-v2/journeys/helpers';
import { MOCK_JOURNEYS, cloneJourneys } from '@/lib/portal-v2/journeys/mock';
import type {
  Journey,
  JourneyDraftInput,
  JourneyFilters,
  JourneyStateFilter,
} from '@/lib/portal-v2/journeys/types';

/** Which overlay owns the screen. Only one at a time, by construction. */
type Overlay =
  | { kind: 'detail'; id: string }
  | { kind: 'edit'; id: string }
  | { kind: 'fork'; id: string }
  | { kind: 'delete'; id: string }
  | { kind: 'new' }
  | null;

type JourneysWorkspaceProps = {
  /** Journey id from `?edit=` — reopens the canvas editor on a pasted / reloaded link. */
  initialEditId?: string | null;
};

export const JourneysWorkspace = ({
  initialEditId = null,
}: JourneysWorkspaceProps) => {
  const t = useTranslations('portalV2.journeys');

  const [journeys, setJourneys] = useState<Journey[]>(() =>
    cloneJourneys(MOCK_JOURNEYS)
  );
  const [filters, setFilters] = useState<JourneyFilters>(
    JOURNEY_DEFAULT_FILTERS
  );

  /**
   * Resolved at mount only: a deep link opens the editor on the first paint
   * instead of flashing the grid. Dead ids fall through to the list.
   */
  const [overlay, setOverlay] = useState<Overlay>(() => {
    if (!initialEditId) return null;
    return findJourney(MOCK_JOURNEYS, initialEditId)
      ? { kind: 'edit', id: initialEditId }
      : null;
  });

  /** `?edit=` pointed at a journey that is gone from the seed. */
  const deadEditLinkRef = useRef(
    Boolean(initialEditId) && !findJourney(MOCK_JOURNEYS, initialEditId)
  );

  const visible = useMemo(
    () => filterJourneys(journeys, filters),
    [journeys, filters]
  );

  const stateTabs = useMemo(
    () =>
      JOURNEY_STATE_TABS.map(tab => ({
        id: tab.id,
        label: t(tab.labelKey),
        count: countByState(journeys, tab.id),
      })),
    [journeys, t]
  );

  const activeId = overlay && 'id' in overlay ? overlay.id : null;
  const active = findJourney(journeys, activeId);

  /* Keep `?edit=` in the address bar while the canvas is open — reload restores it. */
  useEffect(() => {
    writeJourneyEditParam(overlay?.kind === 'edit' ? overlay.id : null);
  }, [overlay]);

  useEffect(() => {
    if (!deadEditLinkRef.current) return;
    deadEditLinkRef.current = false;
    writeJourneyEditParam(null);
  }, []);

  const handleStateChange = useCallback((id: string) => {
    setFilters(prev => ({ ...prev, state: id as JourneyStateFilter }));
  }, []);

  const handleOpen = useCallback((journey: Journey) => {
    setOverlay({ kind: 'detail', id: journey.id });
  }, []);

  const handleClose = useCallback(() => setOverlay(null), []);

  const handleDuplicate = useCallback((journey: Journey) => {
    setJourneys(prev => {
      const result = duplicateJourney(prev, journey.id);
      if (!result) return prev;
      toast.success(`Duplicated — ${result.journey.name}`);
      return result.list;
    });
  }, []);

  const handleCreate = useCallback((input: JourneyDraftInput) => {
    const journey = createJourney(input);
    setJourneys(prev => [journey, ...prev]);
    /* Rule 10 — never create into a filter that would hide the result. */
    setFilters(prev => ({ ...prev, state: 'all', q: '' }));
    setOverlay({ kind: 'detail', id: journey.id });
    toast.success(`Created — ${journey.name}`);
  }, []);

  const handleFork = useCallback(
    (campaignId: string, campaignName: string) => {
      if (!activeId) return;
      const result = forkJourney(journeys, activeId, campaignId, campaignName);
      if (!result) return;

      if (result.existed) {
        toast(`${campaignName} already has this journey`);
      } else {
        setJourneys(result.list);
        toast.success(
          `Forked into ${campaignName} — the blueprint is untouched`
        );
      }
      setFilters(prev => ({ ...prev, state: 'copy', q: '' }));
      setOverlay({ kind: 'detail', id: result.journey.id });
    },
    [activeId, journeys]
  );

  /**
   * Save writes the edited graph back over the record it came from — and only
   * that record. A copy's edit never reaches its blueprint, and a blueprint's
   * never reaches the copies already forked from it; the toast says which.
   */
  const handleSaveEdit = useCallback((next: Journey) => {
    setJourneys(prev => prev.map(j => (j.id === next.id ? next : j)));
    setOverlay({ kind: 'detail', id: next.id });
    toast.success(
      next.template
        ? 'Blueprint saved — existing campaign copies are untouched'
        : `Saved to ${journeyHome(next)}'s copy — the blueprint is untouched`
    );
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!activeId) return;
    const target = findJourney(journeys, activeId);
    setJourneys(prev => deleteJourney(prev, activeId));
    setOverlay(null);
    if (target) toast.success(`Deleted — ${target.name}`);
  }, [activeId, journeys]);

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-[80ch] text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button
              variant='primary'
              onClick={() => setOverlay({ kind: 'new' })}
            >
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('newJourney')}
            </Button>
          </div>
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <div className='sticky top-0 z-10 -mx-5 mb-3.5 bg-[var(--pv2-canvas)] px-5 md:-mx-8 md:px-8'>
          <Tabs
            items={stateTabs}
            value={filters.state}
            onChange={handleStateChange}
            aria-label={t('stateTabsAria')}
          />
        </div>

        <label
          className={cn(
            'mb-3.5 flex w-full max-w-[320px] items-center gap-2 rounded-[10px]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
            'transition-colors focus-within:border-[var(--pv2-violet)]'
          )}
        >
          <Search className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
          <input
            type='search'
            value={filters.q}
            onChange={e => setFilters(prev => ({ ...prev, q: e.target.value }))}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
          />
        </label>

        {visible.length ? (
          <>
            <p className='mb-3 text-[12px] text-[var(--pv2-faint)]'>
              {t('resultsCount', { count: visible.length })}
            </p>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(258px,1fr))] gap-4'>
              {visible.map(journey => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  stats={journeyStats(journeys, journey)}
                  onOpen={handleOpen}
                  onEdit={j => setOverlay({ kind: 'edit', id: j.id })}
                  onDuplicate={handleDuplicate}
                  onDelete={j => setOverlay({ kind: 'delete', id: j.id })}
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
      </div>

      {overlay?.kind === 'detail' && active ? (
        <JourneyDetailModal
          key={active.id}
          journey={active}
          journeys={journeys}
          onClose={handleClose}
          onEdit={j => setOverlay({ kind: 'edit', id: j.id })}
          onFork={j => setOverlay({ kind: 'fork', id: j.id })}
          onDuplicate={handleDuplicate}
          onOpenJourney={id => setOverlay({ kind: 'detail', id })}
        />
      ) : null}

      {overlay?.kind === 'edit' && active ? (
        <JourneyEditor
          key={active.id}
          journey={active}
          journeys={journeys}
          onCancel={() => setOverlay({ kind: 'detail', id: active.id })}
          onSave={handleSaveEdit}
        />
      ) : null}

      {overlay?.kind === 'fork' && active ? (
        <ForkJourneyModal
          journey={active}
          forkedInto={copiesOfJourney(journeys, active).flatMap(c =>
            c.campaign ? [c.campaign] : []
          )}
          onClose={() => setOverlay({ kind: 'detail', id: active.id })}
          onPick={handleFork}
        />
      ) : null}

      {overlay?.kind === 'delete' && active ? (
        <DeleteJourneyModal
          journey={active}
          copies={copiesOfJourney(journeys, active).length}
          onClose={handleClose}
          onConfirm={handleConfirmDelete}
        />
      ) : null}

      {overlay?.kind === 'new' ? (
        <NewJourneyModal onClose={handleClose} onCreate={handleCreate} />
      ) : null}
    </div>
  );
};
