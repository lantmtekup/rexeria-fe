'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface MarketingInstance {
  id: string;
  title: string;
  /** Allowed sub-sections for this marketing (usually all 4) */
  sections?: readonly MarketingSection[];
}

export type MarketingSection = 'discovery' | 'concept' | 'assets' | 'campaign';

const ALL_SECTIONS: { key: MarketingSection; label: string }[] = [
  { key: 'discovery', label: 'Discovery' },
  { key: 'concept', label: 'Concept' },
  { key: 'assets', label: 'Assets' },
  { key: 'campaign', label: 'Campaign' },
];

export interface MarketingSidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** `basePath` like `/product/123/marketing` or `/ai-agents/123/marketing` */
  basePath: string;
  marketings: MarketingInstance[];
  activeMarketingId?: string;
  activeSection?: MarketingSection;
  /** Override the rendered sections — e.g. AI-Agents flow omits Campaign */
  sections?: MarketingSection[];
}

/**
 * Left-hand sub-sidebar of the Marketing pages listing each Marketing instance
 * with an expandable 4-section sub-nav (Discovery / Concept / Assets / Campaign).
 */
function MarketingSidebar({
  basePath,
  marketings,
  activeMarketingId,
  activeSection,
  sections,
  className,
  ...props
}: MarketingSidebarProps) {
  const [openId, setOpenId] = React.useState<string | null>(
    activeMarketingId ?? marketings[0]?.id ?? null
  );
  const visibleSections = sections
    ? ALL_SECTIONS.filter(s => sections.includes(s.key))
    : ALL_SECTIONS;
  return (
    <aside
      className={cn(
        'border-border bg-background w-56 shrink-0 border-r',
        className
      )}
      {...props}
    >
      <ul className='flex flex-col py-3'>
        {marketings.map(m => {
          const isOpen = openId === m.id;
          const isActive = activeMarketingId === m.id;
          return (
            <li key={m.id}>
              <button
                type='button'
                onClick={() => setOpenId(isOpen ? null : m.id)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-2 px-5 py-3 text-left text-sm font-semibold tracking-[-0.02em] transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-foreground/90 hover:text-foreground'
                )}
              >
                <span className='flex-1 truncate'>{m.title}</span>
                <MoreHorizontal className='text-content-muted size-4' />
                {isOpen ? (
                  <ChevronUp className='text-content-muted size-4' />
                ) : (
                  <ChevronDown className='text-content-muted size-4' />
                )}
              </button>
              {isOpen && (
                <ul className='border-border border-l pb-2 pl-6'>
                  {visibleSections.map(s => {
                    const itemActive = isActive && activeSection === s.key;
                    return (
                      <li key={s.key}>
                        <Link
                          href={`${basePath}/${m.id}/${s.key}`}
                          className={cn(
                            'block border-l-2 px-4 py-2 text-sm transition-colors',
                            itemActive
                              ? 'border-foreground text-foreground -ml-px font-semibold'
                              : 'text-content-muted hover:text-foreground border-transparent'
                          )}
                        >
                          {s.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export { MarketingSidebar };
