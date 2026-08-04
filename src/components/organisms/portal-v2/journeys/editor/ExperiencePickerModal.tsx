'use client';

import { Check, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { FilterChips } from '@/components/molecules/portal-v2/FilterChips';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import { objectivePillStyle } from '@/lib/portal-v2/experiences/roleStyles';
import { JOURNEY_OBJECTIVES } from '@/lib/portal-v2/journeys/constants';
import type {
  ExperienceObjective,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import type { JourneyExperienceLink } from '@/lib/portal-v2/journeys/types';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';

/**
 * The Experiences library, in miniature.
 *
 * REAL PAGES, NOT A SECOND LIST. Same source the Experiences workspace reads —
 * `fetchExperienceLibrary` over `GET /pages?type=landing&status=published` — so
 * a stage can only ever point at a page that exists. Search goes to the server;
 * the objective axis is a seeded value and narrows client-side, exactly as it
 * does on that workspace.
 *
 * The node stores three fields, not a page record: id, name, coverage. That is
 * what `xName` and `xCoverage` have always been, and it keeps the journey
 * readable when the page it links is renamed later.
 */

const SEARCH_DEBOUNCE_MS = 350;

type ExperiencePickerModalProps = {
  /** Already linked on this node — shown as picked. */
  currentId: string | null;
  onClose: () => void;
  onPick: (link: JourneyExperienceLink) => void;
};

export const ExperiencePickerModal = ({
  currentId,
  onClose,
  onPick,
}: ExperiencePickerModalProps) => {
  const t = useTranslations('portalV2.journeys');

  const [query, setQuery] = useState('');
  const [objective, setObjective] = useState<ExperienceObjective | 'all'>(
    'all'
  );
  const [items, setItems] = useState<ExperienceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* One effect for both the first load and every debounced search: the picker
     has no server-rendered first paint to protect. */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const handle = setTimeout(
      () => {
        void fetchExperienceLibrary({ q: query })
          .then(res => {
            if (cancelled) return;
            setItems(res.items);
            setError(res.error);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
      },
      query ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const visible = useMemo(
    () =>
      objective === 'all'
        ? items
        : items.filter(item => item.objective === objective),
    [items, objective]
  );

  /** The journey module's own objective labels — one vocabulary, one namespace. */
  const objectiveLabel = useMemo(
    () => new Map(JOURNEY_OBJECTIVES.map(o => [o.id, t(o.labelKey)] as const)),
    [t]
  );

  const objectiveOptions = useMemo(
    () => [
      { id: 'all' as const, label: t('pickerAllObjectives') },
      ...JOURNEY_OBJECTIVES.map(o => ({
        id: o.id,
        label: objectiveLabel.get(o.id) ?? o.id,
      })),
    ],
    [objectiveLabel, t]
  );

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('pickerTitle')}
      subtitle={t('pickerSubtitle')}
      footer={
        <>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('pickerNote')}
          </span>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
        </>
      }
    >
      <div className='mb-3.5 flex flex-wrap items-center gap-2.5'>
        <label
          className={cn(
            'flex min-w-[220px] flex-1 items-center gap-2 rounded-[10px]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
            'transition-colors focus-within:border-[var(--pv2-violet)]'
          )}
        >
          {loading ? (
            <Loader2
              className='size-3.5 shrink-0 animate-spin'
              strokeWidth={2.2}
              aria-hidden
            />
          ) : (
            <Search
              className='size-3.5 shrink-0'
              strokeWidth={2.2}
              aria-hidden
            />
          )}
          <input
            type='search'
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('pickerSearchPlaceholder')}
            aria-label={t('pickerSearchPlaceholder')}
            autoFocus
            className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
          />
        </label>

        <FilterChips
          inline
          options={objectiveOptions}
          value={objective}
          onChange={setObjective}
        />
      </div>

      {error ? (
        <p className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-[12px] text-[#9a2436]'>
          {error}
        </p>
      ) : null}

      {!error && !visible.length ? (
        <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-8 py-12 text-center'>
          <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
            {loading ? t('pickerLoading') : t('pickerEmpty')}
          </p>
          {!loading ? (
            <p className='mt-1.5 text-[13px] text-[var(--pv2-faint)]'>
              {t('pickerEmptyHint')}
            </p>
          ) : null}
        </div>
      ) : null}

      {visible.length ? (
        <div className='grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3'>
          {visible.map(experience => {
            const pill = objectivePillStyle(experience.objective);
            const picked = experience.id === currentId;

            return (
              <button
                key={experience.id}
                type='button'
                onClick={() =>
                  onPick({
                    id: experience.id,
                    name: experience.name,
                    coverage: experience.coverage.pct,
                  })
                }
                className={cn(
                  'flex cursor-pointer flex-col gap-1.5 rounded-[var(--pv2-r)] border px-3 py-2.5 text-left',
                  'transition-[border-color,box-shadow] duration-[140ms]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  picked
                    ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
                    : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] hover:border-[var(--pv2-electric)] hover:shadow-[var(--pv2-sh-soft)]'
                )}
              >
                <span className='flex items-start gap-1.5'>
                  <span className='min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {experience.name}
                  </span>
                  {picked ? (
                    <Check
                      className='mt-px size-3.5 shrink-0 text-[var(--pv2-electric)]'
                      strokeWidth={3}
                      aria-hidden
                    />
                  ) : null}
                </span>

                <span
                  className='line-clamp-2 text-[11px] leading-snug text-[var(--pv2-faint)]'
                  title={experience.tagline}
                >
                  {experience.tagline}
                </span>

                <span className='mt-auto flex items-center gap-1.5 pt-1'>
                  <span
                    className='inline-flex rounded-full px-2 py-[3px] text-[9px] font-bold tracking-[0.05em] uppercase'
                    style={{ background: pill.bg, color: pill.fg }}
                  >
                    {objectiveLabel.get(experience.objective)}
                  </span>
                  <span
                    className={cn(
                      'text-[10.5px] tabular-nums',
                      experience.coverage.pct > 0
                        ? 'text-[var(--pv2-faint)]'
                        : 'font-semibold text-[#9a2436]'
                    )}
                  >
                    {t('pickerTracked', { pct: experience.coverage.pct })}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </Modal>
  );
};
