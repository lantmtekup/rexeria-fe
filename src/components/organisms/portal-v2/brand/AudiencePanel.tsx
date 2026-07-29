'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { BrandCard } from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';
import {
  AWARENESS,
  BUY_STAGES,
  ROLE_STYLES,
} from '@/lib/portal-v2/brand/constants';
import type { BrandData, BrandPersona } from '@/lib/portal-v2/brand/types';

type AudiencePanelProps = {
  data: BrandData;
  editing: boolean;
  onChange: (next: BrandData) => void;
};

const newPersona = (): BrandPersona => ({
  id: `a${Date.now()}`,
  n: 'New persona',
  tier: 'Primary',
  stage: 'discovery',
  awareness: 'unaware',
  motivations: [],
  objections: ['Their biggest objection'],
  action: 'lead',
  desired: '',
});

export const AudiencePanel = ({
  data,
  editing,
  onChange,
}: AudiencePanelProps) => {
  const handleDelete = (id: string) => {
    onChange({
      ...data,
      audience: data.audience.filter(a => a.id !== id),
    });
  };

  const handleAdd = () => {
    onChange({
      ...data,
      audience: [...data.audience, newPersona()],
    });
  };

  return (
    <BrandCard
      title='Audience personas'
      hint={
        <>
          A persona is an awareness level, an objection, and an action you want.
          Awareness decides where an experience for them must start.
        </>
      }
      last
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {data.audience.map(a => {
          const aw = AWARENESS[a.awareness] ?? AWARENESS.unaware!;
          const role = ROLE_STYLES[aw.r] ?? ROLE_STYLES.ATT!;
          const stage = BUY_STAGES[a.stage]?.n ?? a.stage;

          return (
            <article
              key={a.id}
              className={cn(
                'relative rounded-[14px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4',
                'transition-colors hover:border-[var(--pv2-slate-300)]'
              )}
            >
              {editing ? (
                <Button
                  variant='danger'
                  size='icon'
                  aria-label={`Delete ${a.n}`}
                  className='absolute top-2.5 right-2.5 size-8'
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
                </Button>
              ) : null}

              <div className='mb-3 flex items-center gap-3 pr-8'>
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-full text-sm font-bold',
                    role.bg,
                    role.fg
                  )}
                >
                  {a.n.charAt(0)}
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-[15px] font-semibold text-[var(--pv2-ink)]'>
                    {a.n}
                  </span>
                  <span className='block text-[12px] text-[var(--pv2-faint)]'>
                    {a.tier} · {stage}
                  </span>
                </span>
              </div>

              <div
                className={cn(
                  'mb-3 rounded-[10px] px-3 py-2',
                  role.bg,
                  role.fg
                )}
              >
                <b className='block text-[12.5px] font-semibold'>{aw.n}</b>
                <span className='block text-[11.5px] opacity-80'>
                  Starts at {role.name}
                </span>
              </div>

              <div className='mb-3'>
                <span className='block text-[12px] font-medium text-[var(--pv2-mut)]'>
                  Biggest objection
                </span>
                <span className='mt-1 block text-[13.5px] leading-snug text-[var(--pv2-ink)]'>
                  “{a.objections[0] || 'None recorded'}”
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <span className='rounded-full bg-[var(--pv2-canvas)] px-2.5 py-0.5 text-[11.5px] font-semibold text-[var(--pv2-mut)] capitalize'>
                  {a.action}
                </span>
                <span className='grow' />
                <span className='text-[11.5px] text-[var(--pv2-faint)]'>
                  {a.motivations.length} mot. · {a.objections.length} obj.
                </span>
              </div>
            </article>
          );
        })}

        {editing ? (
          <button
            type='button'
            onClick={handleAdd}
            className={cn(
              'flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-[14px]',
              'border border-dashed border-[var(--pv2-hair)] px-4 py-6 text-center',
              'text-[var(--pv2-electric)] transition-colors',
              'hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]'
            )}
          >
            <Plus className='size-5' strokeWidth={2.2} aria-hidden />
            <b className='text-[14px] font-semibold'>New persona</b>
            <span className='max-w-[18ch] text-[12.5px] text-[var(--pv2-mut)]'>
              Name them, then say what they must get past
            </span>
          </button>
        ) : null}
      </div>

      {!data.audience.length ? (
        <div className='mt-4 rounded-[14px] bg-[var(--pv2-canvas)] px-6 py-10 text-center'>
          <b className='block text-[15px] text-[var(--pv2-ink)]'>
            No personas yet
          </b>
          <p className='mt-1 text-[13px] text-[var(--pv2-mut)]'>
            Every experience will be written for nobody in particular.
          </p>
        </div>
      ) : null}
    </BrandCard>
  );
};
