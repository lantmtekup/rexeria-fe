'use client';

import * as React from 'react';
import { Plus, Pencil, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

interface SpecField {
  key: string;
  label: string;
  value?: React.ReactNode;
  placeholder?: string;
}

interface OverviewField {
  key: string;
  label: string;
  value?: string;
  placeholder?: string;
  isSelect?: boolean;
}

export interface ProductInformationFormProps {
  overview?: OverviewField[];
  spec?: SpecField[];
  /** Show pencil edit indicators next to populated fields */
  editable?: boolean;
  onAddCategory?: () => void;
  onAddFeature?: () => void;
}

const DEFAULT_OVERVIEW: OverviewField[] = [
  {
    key: 'category',
    label: 'Category',
    placeholder: 'Select your category',
    isSelect: true,
  },
  {
    key: 'description',
    label: 'Description',
    placeholder: 'Describe something',
  },
  { key: 'sku', label: 'SKU', placeholder: 'Select your SKU' },
];

const DEFAULT_SPEC: SpecField[] = [
  { key: 'size', label: 'Size', placeholder: 'Set Size' },
  { key: 'color', label: 'Color', placeholder: 'Set Color' },
  { key: 'variant', label: 'Variant', placeholder: 'Set Variant' },
  { key: 'ingredients', label: 'Ingredients', placeholder: 'Set Ingredients' },
  {
    key: 'certifications',
    label: 'Certifications',
    placeholder: 'Set Certifications',
  },
];

function Field({
  label,
  value,
  placeholder,
  editable,
  isSelect,
}: {
  label: string;
  value?: React.ReactNode;
  placeholder?: string;
  editable?: boolean;
  isSelect?: boolean;
}) {
  const hasValue = value !== undefined && value !== null && value !== '';
  return (
    <div className='border-border bg-background flex items-center gap-2 rounded-xl border px-4 py-3'>
      <div className='min-w-0 flex-1'>
        <div className='text-content-muted text-xs font-semibold'>{label}</div>
        <div
          className={cn(
            'truncate text-sm font-medium',
            hasValue ? 'text-foreground' : 'text-content-muted'
          )}
        >
          {hasValue ? value : placeholder}
        </div>
      </div>
      {hasValue && editable && (
        <Pencil className='text-content-muted size-4 shrink-0' />
      )}
      {isSelect ? (
        <ChevronDown className='text-content-muted size-4 shrink-0' />
      ) : (
        <button
          type='button'
          aria-label='Add'
          className='text-content-muted hover:text-foreground inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
        >
          <Plus className='size-4' />
        </button>
      )}
    </div>
  );
}

function SectionTitle({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className='flex items-center justify-between pb-2'>
      <h3 className='text-foreground text-sm font-semibold'>{title}</h3>
      {onAdd && (
        <button
          type='button'
          onClick={onAdd}
          className='rounded-pill text-neutral-0 inline-flex cursor-pointer items-center gap-1 bg-neutral-900 px-3 py-1 text-xs font-semibold hover:bg-neutral-800'
        >
          Add
          <Plus className='size-3' />
        </button>
      )}
    </div>
  );
}

/**
 * Product → Information form. Renders two sections (Product overview &
 * Specifications) each with a responsive 3-column grid of fields. Fields
 * render placeholder text when empty and the value + pencil when filled.
 */
function ProductInformationForm({
  overview = DEFAULT_OVERVIEW,
  spec = DEFAULT_SPEC,
  editable = true,
  onAddCategory,
  onAddFeature,
}: ProductInformationFormProps) {
  return (
    <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
      <section className='mb-6'>
        <SectionTitle title='Product overview' onAdd={onAddCategory} />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {overview.map(f => (
            <Field
              key={f.key}
              label={f.label}
              value={f.value}
              placeholder={f.placeholder}
              editable={editable}
              isSelect={f.isSelect}
            />
          ))}
        </div>
      </section>
      <section>
        <SectionTitle title='Specifications' onAdd={onAddFeature} />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {spec.map(f => (
            <Field
              key={f.key}
              label={f.label}
              value={f.value}
              placeholder={f.placeholder}
              editable={editable}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export { ProductInformationForm };
