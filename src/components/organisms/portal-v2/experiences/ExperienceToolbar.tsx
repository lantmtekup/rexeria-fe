'use client';

import { ListFilter, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import type {
  RefineAxis,
  RefineFacet,
} from '@/lib/portal-v2/experiences/constants';
import { cn } from '@/lib/cn';

type ExperienceToolbarProps = {
  q: string;
  onQChange: (q: string) => void;
  /** The facet rows for the ACTIVE tab — see `refineFacetsFor`. */
  facets: RefineFacet[];
  /** Current value of every axis this toolbar can write. */
  values: Record<RefineAxis, string>;
  onFacetChange: (key: RefineAxis, value: string) => void;
};

/**
 * Search + the collapsible Refine drawer.
 *
 * Lifted out of `ExperiencesWorkspace` so the workspace reads as what it is —
 * one tab row, one grid, two modals — instead of burying that structure under a
 * hundred lines of chip markup. It is deliberately TAB-AGNOSTIC: it renders
 * whatever `facets` it is handed, so landing on the Blocks tab swaps the entire
 * drawer without this component knowing blocks exist.
 *
 * Same shape as `MediaToolbar` + `MediaFacetPanel`, which is the most
 * fully-realised version of this pattern in portal-v2.
 */
export const ExperienceToolbar = ({
  q,
  onQChange,
  facets,
  values,
  onFacetChange,
}: ExperienceToolbarProps) => {
  const t = useTranslations('portalV2.experiences');

  /** Collapsed until asked for — the axes are a refinement, not the navigation. */
  const [refineOpen, setRefineOpen] = useState(false);

  const handleToggleRefine = useCallback(() => {
    setRefineOpen(prev => !prev);
  }, []);

  /** One dismissible token per axis the user has actually narrowed. */
  const activeRefines = useMemo(
    () =>
      facets.flatMap(facet => {
        const value = values[facet.key];
        if (!value || value === 'all') return [];
        const opt = facet.options.find(o => o.id === value);
        if (!opt) return [];
        return [
          {
            key: facet.key,
            label: opt.label ?? (opt.labelKey ? t(opt.labelKey) : opt.id),
          },
        ];
      }),
    [facets, values, t]
  );

  const chipOptions = useCallback(
    (options: RefineFacet['options']) =>
      options.map(o => ({
        id: o.id,
        label: o.label ?? (o.labelKey ? t(o.labelKey) : o.id),
      })),
    [t]
  );

  return (
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
          <Search className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
          <input
            type='search'
            value={q}
            onChange={e => onQChange(e.target.value)}
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
            onClick={() => onFacetChange(token.key, 'all')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFacetChange(token.key, 'all');
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
            <span className='text-[13px] leading-none opacity-75' aria-hidden>
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
          {facets.map(facet => (
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
                value={values[facet.key]}
                onChange={id => onFacetChange(facet.key, id)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
