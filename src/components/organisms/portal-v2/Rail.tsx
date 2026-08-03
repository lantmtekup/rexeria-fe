'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { cn } from '@/lib/cn';
import {
  PORTAL_V2_NAV,
  isPortalV2NavActive,
  type PortalV2NavItem,
} from '@/lib/portal-v2/nav';

type RailProps = {
  /** true = icon-only; false = full sidebar with labels */
  collapsed?: boolean;
};

export const Rail = ({ collapsed = false }: RailProps) => {
  const tNav = useTranslations('portalV2.nav');
  const tGroups = useTranslations('portalV2.groups');
  const tShell = useTranslations('portalV2.shell');
  const pathname = usePathname() ?? '';
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>(
    {}
  );
  const [tip, setTip] = useState<{
    label: string;
    top: number;
    left: number;
  } | null>(null);

  const isIconOnly = collapsed;

  const handleToggleGroup = (group: string) => {
    if (isIconOnly) return;
    setGroupCollapsed(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleShowTip = useCallback(
    (label: string, el: HTMLElement) => {
      if (!isIconOnly) return;
      const r = el.getBoundingClientRect();
      setTip({
        label,
        top: r.top + r.height / 2,
        left: r.right + 12,
      });
    },
    [isIconOnly]
  );

  const handleHideTip = useCallback(() => setTip(null), []);

  const renderItem = (item: PortalV2NavItem) => {
    const active = isPortalV2NavActive(pathname, item.href);
    const Icon = item.icon;
    const label = tNav(item.labelKey);

    if (isIconOnly) {
      return (
        <Link
          key={item.id}
          href={item.href}
          aria-label={label}
          aria-current={active ? 'page' : undefined}
          data-tip={label}
          onMouseEnter={e => handleShowTip(label, e.currentTarget)}
          onMouseLeave={handleHideTip}
          onFocus={e => handleShowTip(label, e.currentTarget)}
          onBlur={handleHideTip}
          className={cn(
            'group relative grid w-14 place-items-center rounded-[var(--pv2-r)] py-1.5 transition-all duration-200',
            'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]',
            active && 'text-[var(--pv2-electric)]'
          )}
        >
          {active && (
            <div
              className='absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[var(--pv2-electric)] shadow-[1px_0_4px_rgba(56,98,255,0.4)]'
              aria-hidden
            />
          )}
          <span
            className={cn(
              'grid size-11 place-items-center rounded-[var(--pv2-r)] transition-all duration-200',
              'group-hover:bg-[var(--pv2-canvas)] group-active:scale-[0.96]',
              active &&
                'bg-[var(--pv2-electric-soft)] ring-1 ring-[var(--pv2-electric)]/10'
            )}
          >
            <Icon
              className='size-[22px]'
              strokeWidth={active ? 2.25 : 1.75}
              aria-hidden
            />
          </span>
        </Link>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative mx-3 flex items-center gap-3 rounded-[var(--pv2-r)] px-3 py-2.5 transition-all duration-200',
          'text-[15px] font-medium text-[var(--pv2-slate-500)]',
          'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
          'active:scale-[0.98]',
          active &&
            'bg-[var(--pv2-electric-soft)] font-semibold text-[var(--pv2-electric)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.6)] ring-1 ring-[var(--pv2-electric)]/10'
        )}
      >
        <Icon
          className='size-[18px] shrink-0 transition-transform duration-200 group-active:scale-[0.94]'
          strokeWidth={active ? 2.5 : 1.75}
          aria-hidden
        />
        <span className='truncate'>{label}</span>
      </Link>
    );
  };

  return (
    <>
      <nav
        id='portal-v2-rail'
        aria-label={tShell('navAria')}
        className={cn(
          'z-[var(--pv2-z-rail)] flex min-w-0 flex-col overflow-y-auto',
          'border-r border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-3',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          isIconOnly
            ? 'w-[var(--pv2-rail)] items-center'
            : 'w-full items-stretch'
        )}
      >
        {PORTAL_V2_NAV.map((g, gi) => {
          const items = g.items;
          if (!items.length) return null;

          if (!g.groupKey) {
            return (
              <div
                key={gi}
                className={cn(
                  'flex w-full flex-col',
                  isIconOnly ? 'items-center gap-0.5' : 'gap-1 px-0',
                  g.bottom && 'mt-auto border-t border-[var(--pv2-hair)] pt-3'
                )}
              >
                {items.map(renderItem)}
              </div>
            );
          }

          const key = g.groupKey;
          const groupLabel = tGroups(key);
          const groupShort = tGroups(`${key}Short`);
          // Icon-only rail: groups stay expanded; no per-group collapse.
          const isGroupCollapsed = isIconOnly
            ? false
            : Boolean(groupCollapsed[key]);
          const hasOn = items.some(i => isPortalV2NavActive(pathname, i.href));

          return (
            <div
              key={key}
              className={cn(
                'mt-4 flex w-full flex-col',
                isIconOnly ? 'items-center' : 'items-stretch'
              )}
            >
              {isIconOnly ? (
                <div
                  className={cn(
                    'flex h-6 w-14 items-center justify-center',
                    'text-[9px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase',
                    hasOn && 'text-[var(--pv2-electric)]'
                  )}
                  aria-hidden
                >
                  <span className='truncate'>{groupShort}</span>
                </div>
              ) : (
                <button
                  type='button'
                  aria-expanded={!isGroupCollapsed}
                  aria-label={
                    isGroupCollapsed
                      ? tShell('expandGroup', { group: groupLabel })
                      : tShell('collapseGroup', { group: groupLabel })
                  }
                  tabIndex={0}
                  onClick={() => handleToggleGroup(key)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleGroup(key);
                    }
                  }}
                  className={cn(
                    'group mx-3 mb-1.5 flex h-8 items-center justify-between gap-1 rounded-[var(--pv2-r-sm)] px-3',
                    'text-[11.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase',
                    'transition-colors duration-200 hover:text-[var(--pv2-ink)]',
                    hasOn && isGroupCollapsed && 'text-[var(--pv2-electric)]'
                  )}
                >
                  <span className='truncate'>{groupLabel}</span>
                  <ChevronDown
                    aria-hidden
                    strokeWidth={2}
                    className={cn(
                      'size-3.5 shrink-0 text-[var(--pv2-hair)] transition-all duration-200 group-hover:text-[var(--pv2-faint)]',
                      isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                    )}
                  />
                </button>
              )}
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
                  isIconOnly
                    ? 'mt-1 flex flex-col items-center gap-0.5'
                    : 'flex flex-col gap-0.5',
                  isGroupCollapsed
                    ? 'mt-0 max-h-0 opacity-0'
                    : 'max-h-[480px] opacity-100'
                )}
              >
                {items.map(renderItem)}
              </div>
            </div>
          );
        })}
      </nav>

      <div
        role='tooltip'
        aria-hidden={!tip || !isIconOnly}
        className={cn(
          'pointer-events-none fixed z-[var(--pv2-z-tip)] -translate-y-1/2',
          'rounded-[6px] bg-[var(--pv2-ink)] px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-[var(--pv2-paper)]',
          'shadow-[var(--pv2-sh-deep)] transition-all duration-200 ease-out',
          tip && isIconOnly
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1.5 opacity-0'
        )}
        style={
          tip
            ? { top: tip.top, left: tip.left }
            : { top: 0, left: 0, visibility: 'hidden' }
        }
      >
        {tip?.label}
      </div>
    </>
  );
};
