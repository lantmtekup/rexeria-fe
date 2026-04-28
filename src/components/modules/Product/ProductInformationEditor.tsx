'use client';

import * as React from 'react';
import { ChevronDown, Pencil, Plus, X } from 'lucide-react';

import { ColorSwatch } from '@/components/atoms/color-swatch';
import { Tag } from '@/components/atoms/tag';
import { cn } from '@/lib/cn';
import type {
  CreateProductRequest,
  ProductColor,
} from '@/services/rexer/types';

/** Field → form-key mapping. */
export interface ProductInformationValue {
  name: string;
  category: string;
  description: string;
  sku: string;
  sizes: string[];
  colors: ProductColor[];
  variants: string[];
  ingredients: string[];
  certifications: string[];
}

export const emptyProductInformation = (): ProductInformationValue => ({
  name: '',
  category: '',
  description: '',
  sku: '',
  sizes: [],
  colors: [],
  variants: [],
  ingredients: [],
  certifications: [],
});

/**
 * Convert editor state → BE `CreateProductRequest`. Note: BE does not have a
 * `variants` field (FE-only for now), so it is dropped here. The free-text
 * `category` is treated as a label only — link to a `category_id` once the
 * Add Category dialog is wired to the categories API.
 */
export const toCreatePayload = (
  v: ProductInformationValue
): CreateProductRequest => ({
  name: v.name.trim(),
  description: v.description.trim() || undefined,
  sku: v.sku.trim() || undefined,
  sizes: v.sizes,
  colors: v.colors,
  ingredients: v.ingredients,
  certifications: v.certifications,
});

// ── Field shell ──────────────────────────────────────────────────────────
function FieldShell({
  label,
  hint,
  children,
  trailing,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className='border-border bg-background flex items-start gap-2 rounded-xl border px-4 py-3'>
      <div className='min-w-0 flex-1'>
        <div className='text-content-muted text-xs font-semibold'>{label}</div>
        <div className='text-foreground mt-0.5 min-h-5 text-sm font-medium'>
          {children}
        </div>
        {hint && (
          <div className='text-content-muted mt-1 text-[11px]'>{hint}</div>
        )}
      </div>
      {trailing}
    </div>
  );
}

// ── Plain text field ─────────────────────────────────────────────────────
function TextField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <FieldShell
      label={label}
      trailing={
        <Pencil className='text-content-muted mt-0.5 size-4 shrink-0' />
      }
    >
      <input
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'placeholder:text-content-muted w-full bg-transparent outline-none',
          value ? 'text-foreground' : 'text-content-muted'
        )}
      />
    </FieldShell>
  );
}

// ── Category with preset options ─────────────────────────────────────────
const CATEGORY_OPTIONS = [
  'Fashion',
  'Electronics',
  'Beauty',
  'Food & Beverage',
  'Home & Living',
  'Sports',
];

function CategoryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='border-border bg-background flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-left'
      >
        <div className='min-w-0 flex-1'>
          <div className='text-content-muted text-xs font-semibold'>
            Category
          </div>
          <div
            className={cn(
              'truncate text-sm font-medium',
              value ? 'text-foreground' : 'text-content-muted'
            )}
          >
            {value || 'Select your category'}
          </div>
        </div>
        <ChevronDown className='text-content-muted size-4 shrink-0' />
      </button>
      {open && (
        <div className='border-border bg-background absolute z-20 mt-1 w-full overflow-hidden rounded-xl border shadow-lg'>
          {CATEGORY_OPTIONS.map(opt => (
            <button
              key={opt}
              type='button'
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                'hover:bg-muted block w-full px-4 py-2 text-left text-sm',
                value === opt && 'text-primary font-semibold'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Generic tags field (Enter / comma / + button) ────────────────────────
function TagsField({
  label,
  placeholder,
  testId,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  testId?: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = React.useState('');
  const commit = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) {
      setDraft('');
      return;
    }
    onChange([...value, v]);
    setDraft('');
  };
  return (
    <FieldShell
      label={label}
      hint='Type and press Enter, comma, or +'
      trailing={
        <button
          type='button'
          aria-label={`Add ${label.toLowerCase()}`}
          onClick={commit}
          className='text-content-muted hover:text-foreground inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
        >
          <Plus className='size-4' />
        </button>
      }
    >
      <div className='flex flex-wrap items-center gap-1.5'>
        {value.map(s => (
          <Tag key={s} className='gap-1 pr-1'>
            {s}
            <button
              type='button'
              onClick={() => onChange(value.filter(x => x !== s))}
              className='text-content-muted hover:text-foreground'
              aria-label={`Remove ${s}`}
            >
              <X className='size-3' />
            </button>
          </Tag>
        ))}
        <input
          type='text'
          data-testid={testId}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={
            value.length ? `Add ${label.toLowerCase()}` : placeholder
          }
          className='placeholder:text-content-muted min-w-[80px] flex-1 bg-transparent text-sm outline-none'
        />
      </div>
    </FieldShell>
  );
}

// ── Colors (swatches + add via popover) ──────────────────────────────────
const PRESET_COLORS: ProductColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#FACC15' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gray', hex: '#6B7280' },
];

function ColorsField({
  value,
  onChange,
}: {
  value: ProductColor[];
  onChange: (v: ProductColor[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customHex, setCustomHex] = React.useState('#000000');
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const addColor = (c: ProductColor) => {
    if (value.some(x => x.hex.toLowerCase() === c.hex.toLowerCase())) return;
    onChange([...value, c]);
  };

  return (
    <div className='relative' ref={ref}>
      <FieldShell
        label='Color'
        trailing={
          <button
            type='button'
            aria-label='Add color'
            onClick={() => setOpen(o => !o)}
            className='text-content-muted hover:text-foreground inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-100'
          >
            <Plus className='size-4' />
          </button>
        }
      >
        {value.length === 0 ? (
          <span className='text-content-muted'>Set Color</span>
        ) : (
          <span className='flex flex-wrap items-center gap-2 text-xs'>
            {value.map(c => (
              <span
                key={c.hex + c.name}
                className='inline-flex items-center gap-1'
              >
                <ColorSwatch asSpan color={c.hex} size={12} /> {c.name}
                <button
                  type='button'
                  onClick={() => onChange(value.filter(x => x.hex !== c.hex))}
                  className='text-content-muted hover:text-foreground'
                  aria-label={`Remove ${c.name}`}
                >
                  <X className='size-3' />
                </button>
              </span>
            ))}
          </span>
        )}
      </FieldShell>
      {open && (
        <div className='border-border bg-background absolute z-20 mt-1 w-72 rounded-xl border p-3 shadow-lg'>
          <div className='text-content-muted mb-2 text-xs font-semibold'>
            Presets
          </div>
          <div className='mb-3 flex flex-wrap gap-2'>
            {PRESET_COLORS.map(c => (
              <button
                key={c.hex}
                type='button'
                onClick={() => addColor(c)}
                title={c.name}
                className='group flex flex-col items-center gap-1'
              >
                <ColorSwatch asSpan color={c.hex} size={20} />
                <span className='text-[10px]'>{c.name}</span>
              </button>
            ))}
          </div>
          <div className='border-border border-t pt-3'>
            <div className='text-content-muted mb-2 text-xs font-semibold'>
              Custom
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='color'
                value={customHex}
                onChange={e => setCustomHex(e.target.value)}
                className='size-9 cursor-pointer rounded border'
              />
              <input
                type='text'
                placeholder='Color name'
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className='border-border flex-1 rounded-md border px-2 py-1.5 text-sm outline-none'
              />
              <button
                type='button'
                onClick={() => {
                  if (!customName.trim()) return;
                  addColor({
                    name: customName.trim(),
                    hex: customHex.toUpperCase(),
                  });
                  setCustomName('');
                }}
                className='rounded-pill bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white'
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Editor ───────────────────────────────────────────────────────────────
export interface ProductInformationEditorProps {
  value: ProductInformationValue;
  onChange: (v: ProductInformationValue) => void;
  disabled?: boolean;
}

function ProductInformationEditor({
  value,
  onChange,
  disabled,
}: ProductInformationEditorProps) {
  const set = <K extends keyof ProductInformationValue>(
    key: K,
    v: ProductInformationValue[K]
  ) => onChange({ ...value, [key]: v });

  return (
    <fieldset
      disabled={disabled}
      className='mx-auto w-full max-w-[1200px] px-6 pb-10'
    >
      <section className='mb-6'>
        <h3 className='text-foreground pb-2 text-sm font-semibold'>
          Product overview
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <CategoryField
            value={value.category}
            onChange={v => set('category', v)}
          />
          <TextField
            label='Description'
            placeholder='Describe something'
            value={value.description}
            onChange={v => set('description', v)}
          />
          <TextField
            label='SKU'
            placeholder='Select your SKU'
            value={value.sku}
            onChange={v => set('sku', v)}
          />
        </div>
      </section>

      <section>
        <h3 className='text-foreground pb-2 text-sm font-semibold'>
          Specifications
        </h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <TagsField
            label='Size'
            placeholder='Set Size'
            testId='size-input'
            value={value.sizes}
            onChange={v => set('sizes', v)}
          />
          <ColorsField value={value.colors} onChange={v => set('colors', v)} />
          <TagsField
            label='Variant'
            placeholder='Set Variant'
            testId='variant-input'
            value={value.variants}
            onChange={v => set('variants', v)}
          />
          <TagsField
            label='Ingredients'
            placeholder='Set Ingredients'
            testId='ingredients-input'
            value={value.ingredients}
            onChange={v => set('ingredients', v)}
          />
          <TagsField
            label='Certifications'
            placeholder='Set Certifications'
            testId='certifications-input'
            value={value.certifications}
            onChange={v => set('certifications', v)}
          />
        </div>
      </section>
    </fieldset>
  );
}

export { ProductInformationEditor };
