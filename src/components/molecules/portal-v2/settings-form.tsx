'use client';

import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/** `.box` — one governed area. Bordered, because a dial group is a unit. */
export const GovBox = ({
  title,
  note,
  children,
  className,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      'mb-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[18px] py-4',
      className
    )}
  >
    <h2 className='mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1'>
      <span className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
        {title}
      </span>
      {note ? (
        <span className='ml-auto text-[11.5px] text-[var(--pv2-faint)]'>
          {note}
        </span>
      ) : null}
    </h2>
    {children}
  </section>
);

/** `.eyebrow` — the label above a dial group. */
export const Eyebrow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p
    className={cn(
      'mb-2 text-[11px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase',
      className
    )}
  >
    {children}
  </p>
);

/** `.jrhint` — the explanation under a group, never wider than a comfortable read. */
export const GovHint = ({ children }: { children: ReactNode }) => (
  <p className='mt-3 max-w-[78ch] text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
    {children}
  </p>
);

/** A refusal, said out loud beside the dial that earned it. */
export const RefusalText = ({ children }: { children: ReactNode }) => (
  <span className='mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[var(--pv2-error)]'>
    <TriangleAlert className='mt-px size-3.5 shrink-0' strokeWidth={2.2} />
    {children}
  </span>
);

const controlClass = cn(
  'w-full rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'px-3 py-2 text-[14px] text-[var(--pv2-ink)] outline-none transition-shadow',
  'focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15',
  'disabled:cursor-not-allowed disabled:bg-[var(--pv2-canvas)] disabled:text-[var(--pv2-mut)]'
);

const invalidClass =
  'border-[var(--pv2-error)] focus:border-[var(--pv2-error)] focus:ring-[var(--pv2-error)]/15';

type FieldShellProps = {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
};

const FieldShell = ({
  label,
  hint,
  error,
  children,
  className,
}: FieldShellProps) => (
  <label className={cn('block', className)}>
    <span className='mb-1.5 block text-[12.5px] font-medium text-[var(--pv2-mut)]'>
      {label}
    </span>
    {children}
    {error ? <RefusalText>{error}</RefusalText> : null}
    {!error && hint ? (
      <span className='mt-1.5 block text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {hint}
      </span>
    ) : null}
  </label>
);

/** A governed number — the dial itself. Read mode prints the value, not a box. */
export const Dial = ({
  label,
  value,
  editing,
  hint,
  error,
  suffix,
  onChange,
  className,
}: {
  label: string;
  value: number;
  editing: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  suffix?: string;
  onChange: (value: number) => void;
  className?: string;
}) => (
  <FieldShell label={label} hint={hint} error={error} className={className}>
    {editing ? (
      <input
        type='number'
        inputMode='numeric'
        value={Number.isFinite(value) ? value : ''}
        onChange={e => onChange(Number(e.target.value))}
        className={cn(
          controlClass,
          'tabular-nums',
          error && invalidClass,
          'appearance-none'
        )}
      />
    ) : (
      <span className='block py-2 font-[family-name:var(--pv2-disp)] text-[17px] font-bold text-[var(--pv2-ink)] tabular-nums'>
        {value.toLocaleString('en-US')}
        {suffix ? (
          <span className='ml-1 text-[12px] font-medium text-[var(--pv2-faint)]'>
            {suffix}
          </span>
        ) : null}
      </span>
    )}
  </FieldShell>
);

/** A governed string. */
export const TextField = ({
  label,
  value,
  editing,
  hint,
  error,
  disabled,
  onChange,
  className,
}: {
  label: string;
  value: string;
  editing: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
}) => (
  <FieldShell label={label} hint={hint} error={error} className={className}>
    {editing && !disabled ? (
      <input
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className={cn(controlClass, error && invalidClass)}
      />
    ) : (
      <span className='block py-2 text-[14px] text-[var(--pv2-ink)]'>
        {value || <span className='text-[var(--pv2-faint)]'>&mdash;</span>}
      </span>
    )}
  </FieldShell>
);

export type ChoiceOption = {
  value: string;
  label: string;
  desc?: string;
  disabled?: boolean;
};

/** A governed choice — the ceiling disables everything past it, visibly. */
export const ChoiceField = ({
  label,
  value,
  options,
  editing,
  hint,
  error,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: ChoiceOption[];
  editing: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  onChange: (value: string) => void;
  className?: string;
}) => {
  const current = options.find(o => o.value === value);

  return (
    <FieldShell label={label} hint={hint} error={error} className={className}>
      {editing ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn(controlClass, error && invalidClass)}
        >
          {options.map(o => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.desc ? `${o.label} — ${o.desc}` : o.label}
            </option>
          ))}
        </select>
      ) : (
        <span className='block py-2 text-[14px] text-[var(--pv2-ink)]'>
          {current?.label ?? value}
          {current?.desc ? (
            <span className='ml-1.5 text-[12px] text-[var(--pv2-faint)]'>
              · {current.desc}
            </span>
          ) : null}
        </span>
      )}
    </FieldShell>
  );
};

/** A tone pill — roles, confidence tiers, plan badges. */
export const Pill = ({
  children,
  bg,
  fg,
  className,
}: {
  children: ReactNode;
  bg: string;
  fg: string;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap',
      className
    )}
    style={{ background: bg, color: fg }}
  >
    {children}
  </span>
);

/** A read-mode key/value row inside a GovBox. */
export const KvRow = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <div className='flex items-center justify-between gap-3 border-b border-[var(--pv2-hair)] py-[7px] text-[12.5px] last:border-b-0'>
    <span className='text-[var(--pv2-mut)]'>{label}</span>
    <span className='text-right font-semibold text-[var(--pv2-ink)]'>
      {value}
    </span>
  </div>
);

/** The initials disc used by member rows. */
export const Initials = ({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) => (
  <span
    aria-hidden
    className={cn(
      'grid size-9 shrink-0 place-items-center rounded-full font-[family-name:var(--pv2-disp)] text-[12.5px] font-bold',
      muted
        ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
        : 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
    )}
  >
    {children}
  </span>
);

/** The weight-sum readout — green at 100, refused otherwise. */
export const WeightSum = ({ sum, label }: { sum: number; label: string }) => (
  <span
    className='inline-flex items-center gap-1.5 text-[11.5px] font-semibold tabular-nums'
    style={{
      color: sum === 100 ? 'var(--pv2-success)' : 'var(--pv2-error)',
    }}
  >
    {label} {sum}/100
  </span>
);
