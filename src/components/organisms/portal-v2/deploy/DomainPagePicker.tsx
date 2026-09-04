'use client';

import { Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type { Page } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

type DomainPagePickerProps = {
  pages: Page[];
  loading: boolean;
  /** Currently-bound page id, or `null` when nothing is picked yet. */
  value: string | null;
  onChange: (pageId: string) => void;
};

/**
 * The "which landing page does this domain serve?" picker — a searchable radio
 * list of the brand's PUBLISHED landing pages. Shared by the add-domain flow
 * and the per-domain rebind. Binds on `page.id` (the `BrandDomain.page_id` FK);
 * the label is the page name with its `/p/{slug}` as a secondary URL hint.
 */
export const DomainPagePicker = ({
  pages,
  loading,
  value,
  onChange,
}: DomainPagePickerProps) => {
  const t = useTranslations('portalV2.deploy');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return pages;
    return pages.filter(
      p =>
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle)
    );
  }, [pages, q]);

  return (
    <div className='overflow-hidden rounded-[9px] border border-[var(--pv2-hair)]'>
      <div className='relative border-b border-[var(--pv2-hair)]'>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[var(--pv2-faint)]'
          aria-hidden
        />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={t('domainPagePickerSearch')}
          className='w-full bg-transparent py-2.5 pr-3 pl-9 text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
        />
      </div>
      <div className='max-h-[190px] overflow-y-auto'>
        {loading ? (
          <div className='flex items-center justify-center gap-2 py-6 text-[12px] text-[var(--pv2-faint)]'>
            <Loader2 className='size-3.5 animate-spin' aria-hidden />
            {t('domainPagesLoading')}
          </div>
        ) : shown.length === 0 ? (
          <div className='py-6 text-center text-[12px] text-[var(--pv2-faint)]'>
            {t('domainPagesEmpty')}
          </div>
        ) : (
          shown.map(p => {
            const selected = p.id === value;
            return (
              <button
                key={p.id}
                type='button'
                aria-pressed={selected}
                onClick={() => onChange(p.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 border-t border-[var(--pv2-hair)] px-3 py-2 text-left transition-colors first:border-t-0',
                  selected
                    ? 'bg-[var(--pv2-electric-soft)]'
                    : 'hover:bg-[var(--pv2-canvas)]'
                )}
              >
                <span
                  className={cn(
                    'relative grid size-4 shrink-0 place-items-center rounded-full border',
                    selected
                      ? 'border-[var(--pv2-electric)]'
                      : 'border-[var(--pv2-hair-strong,var(--pv2-hair))]'
                  )}
                >
                  {selected ? (
                    <span className='size-2 rounded-full bg-[var(--pv2-electric)]' />
                  ) : null}
                </span>
                {p.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail_url}
                    alt=''
                    className='size-7 shrink-0 rounded-[6px] border border-[var(--pv2-hair)] object-cover'
                  />
                ) : (
                  <span className='grid size-7 shrink-0 place-items-center rounded-[6px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] text-[11px] text-[var(--pv2-faint)]'>
                    ◈
                  </span>
                )}
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                    {p.name}
                  </span>
                  <span className='block truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
                    /p/{p.slug}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
