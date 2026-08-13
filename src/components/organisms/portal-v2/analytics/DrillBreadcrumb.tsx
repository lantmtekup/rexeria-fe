import { cn } from '@/lib/cn';

type DrillCrumb = {
  label: string;
  onClick: () => void;
};

type DrillBreadcrumbProps = {
  crumbs: DrillCrumb[];
};

export const DrillBreadcrumb = ({ crumbs }: DrillBreadcrumbProps) => {
  if (!crumbs.length) return null;

  return (
    <nav
      aria-label='Analytics drill'
      className='mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px]'
    >
      {crumbs.map((crumb, index) => {
        const active = index === crumbs.length - 1;
        return (
          <span
            key={`${crumb.label}-${index}`}
            className='inline-flex items-center gap-1.5'
          >
            {index > 0 ? (
              <span className='text-[var(--pv2-faint)]' aria-hidden>
                ›
              </span>
            ) : null}
            <button
              type='button'
              onClick={crumb.onClick}
              className={cn(
                'rounded-[6px] px-1.5 py-0.5 font-medium transition-colors',
                active
                  ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
                  : 'text-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]'
              )}
            >
              {crumb.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
};
