'use client';

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

type BrandCardProps = {
  title: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  last?: boolean;
};

/** Section block - hairline rhythm, not stacked bordered cards. */
export const BrandCard = ({
  title,
  hint,
  children,
  className,
  last,
}: BrandCardProps) => (
  <section
    className={cn(
      'pb-8',
      !last && 'mb-8 border-b border-[var(--pv2-hair)]',
      className
    )}
  >
    <h2 className='font-[family-name:var(--pv2-disp)] text-lg font-semibold tracking-[-0.02em] text-[var(--pv2-ink)]'>
      {title}
    </h2>
    {hint ? (
      <p className='mt-1.5 mb-5 max-w-[62ch] text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
        {hint}
      </p>
    ) : (
      <div className='mb-5' />
    )}
    {children}
  </section>
);

const labelClass = 'mb-1.5 block text-[13px] font-medium text-[var(--pv2-mut)]';

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export const Field = ({ label, children, className }: FieldProps) => (
  <label className={cn('mb-4 block last:mb-0', className)}>
    <span className={labelClass}>{label}</span>
    {children}
  </label>
);

type ReadFieldProps = {
  label: string;
  value?: string | null;
  empty?: string;
  className?: string;
};

export const ReadField = ({
  label,
  value,
  empty = 'Not set',
  className,
}: ReadFieldProps) => (
  <div className={cn('mb-4 last:mb-0', className)}>
    <span className={labelClass}>{label}</span>
    <p
      className={cn(
        'text-[15px] leading-relaxed text-[var(--pv2-ink)]',
        !value && 'text-[var(--pv2-faint)]'
      )}
    >
      {value || empty}
    </p>
  </div>
);

const inputClass = cn(
  'w-full rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'px-3.5 py-2.5 text-[14px] text-[var(--pv2-ink)] outline-none transition-shadow',
  'placeholder:text-[var(--pv2-faint)]',
  'focus:border-[var(--pv2-electric)] focus:ring-2 focus:ring-[var(--pv2-electric)]/15'
);

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export const TextInput = ({ className, ...props }: TextInputProps) => (
  <input className={cn(inputClass, className)} {...props} />
);

type TextTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextTextarea = ({ className, ...props }: TextTextareaProps) => (
  <textarea
    className={cn(
      inputClass,
      'min-h-[96px] resize-y leading-relaxed',
      className
    )}
    {...props}
  />
);

type TextSelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const TextSelect = ({
  className,
  children,
  ...props
}: TextSelectProps) => (
  <select className={cn(inputClass, className)} {...props}>
    {children}
  </select>
);

type ChipGroupProps = {
  label: string;
  options: readonly string[];
  value: string[];
  editing: boolean;
  onToggle: (option: string) => void;
  max?: number;
};

export const ChipGroup = ({
  label,
  options,
  value,
  editing,
  onToggle,
  max,
}: ChipGroupProps) => {
  const visible = editing ? options : options.filter(o => value.includes(o));

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className='flex flex-wrap gap-2'>
        {visible.map(opt => {
          const on = value.includes(opt);
          return (
            <button
              key={opt}
              type='button'
              disabled={!editing}
              aria-pressed={on}
              tabIndex={editing ? 0 : -1}
              onClick={() => {
                if (!editing) return;
                if (!on && max !== undefined && value.length >= max) return;
                onToggle(opt);
              }}
              className={cn(
                'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
                on
                  ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
                  : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]',
                editing &&
                  !on &&
                  'hover:bg-[var(--pv2-electric-soft)] hover:text-[var(--pv2-electric)]',
                editing && on && 'ring-1 ring-[var(--pv2-electric)]/30',
                !editing && 'cursor-default'
              )}
            >
              {opt}
            </button>
          );
        })}
        {!visible.length ? (
          <span className='text-[13px] text-[var(--pv2-faint)]'>
            None selected
          </span>
        ) : null}
      </div>
    </div>
  );
};

type LineListProps = {
  items: string[];
  editing: boolean;
  empty: string;
  hint?: string;
  onChange: (lines: string[]) => void;
};

export const LineList = ({
  items,
  editing,
  empty,
  hint,
  onChange,
}: LineListProps) => {
  if (editing) {
    return (
      <label className='block'>
        {hint ? <span className={labelClass}>{hint}</span> : null}
        <TextTextarea
          rows={5}
          value={items.join('\n')}
          // KHÔNG trimEnd lúc gõ. Khi đang gõ, con trỏ luôn ở cuối dòng, nên
          // dấu cách vừa nhấn luôn là ký tự cuối — trimEnd sẽ cắt nó ngay
          // trước khi kịp gõ chữ tiếp theo, và ô này không bao giờ nhập được
          // dấu cách. Chuẩn hoá lúc rời ô là đủ: giá trị lưu xuống vẫn sạch.
          onChange={e => onChange(e.target.value.split('\n'))}
          onBlur={e =>
            onChange(e.target.value.split('\n').map(s => s.trimEnd()))
          }
        />
      </label>
    );
  }

  if (!items.length) {
    return (
      <p className='rounded-[10px] bg-[var(--pv2-canvas)] px-4 py-5 text-[13px] text-[var(--pv2-faint)]'>
        {empty}
      </p>
    );
  }

  return (
    <ol className='space-y-0 divide-y divide-[var(--pv2-hair)] rounded-[12px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      {items.map((item, i) => (
        <li
          key={`${i}-${item.slice(0, 24)}`}
          className='flex items-start gap-3 px-4 py-3'
        >
          <span className='mt-0.5 w-5 shrink-0 font-[family-name:var(--pv2-disp)] text-[12px] font-bold text-[var(--pv2-electric)]'>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className='text-[14px] leading-relaxed text-[var(--pv2-ink)]'>
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
};

type CalloutProps = {
  children: ReactNode;
  tone?: 'info' | 'warning';
};

export const Callout = ({ children, tone = 'info' }: CalloutProps) => (
  <div
    className={cn(
      'mb-6 flex items-start gap-2.5 rounded-[12px] px-4 py-3 text-[13px] leading-relaxed text-[var(--pv2-ink)]',
      tone === 'warning'
        ? 'bg-amber-50 text-amber-950'
        : 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-ink)]'
    )}
  >
    {children}
  </div>
);
