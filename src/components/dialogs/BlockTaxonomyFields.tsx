'use client';

/**
 * Field "Taxonomy cho AI gợi ý" dùng chung — engine `recommend_blocks` khớp brief
 * (mục tiêu / ngành / giai đoạn phễu / tông giọng) với các tín hiệu này.
 *
 * Trước đây sống ở block_type form. Đã chuyển xuống **per-block**
 * (sửa ở /admin/blocks). Component này tái dùng cho cả tạo + sửa block.
 */

import * as React from 'react';
import { X } from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { Switch } from '@/components/atoms/switch';
import { cn } from '@/lib/cn';

// Enum đồng bộ BE (validate `oneof`).
export const FUNCTION_OPTS = [
  'hook',
  'pain',
  'value_prop',
  'how_it_works',
  'benefits',
  'social_proof',
  'objection',
  'offer',
  'urgency',
  'lead_capture',
  'final_cta',
];
export const PAGE_ROLE_OPTS = ['opener', 'body', 'closer'];
export const PROOF_TYPE_OPTS = ['logos', 'testimonial', 'stats', 'review'];
export const NEEDS_MEDIA_OPTS = ['image', 'video', 'none'];
export const FUNNEL_OPTS = [
  'awareness',
  'consideration',
  'conversion',
  'retention',
];
export const GOAL_OPTS = ['lead_gen', 'sales', 'awareness', 'launch', 'event'];
export const TONE_OPTS = ['warm', 'minimal', 'bold', 'corporate', 'playful'];

/** Giữ phần tử hợp lệ theo enum BE (`oneof`) — tránh PATCH fail khi DB còn giá trị cũ/AI. */
export function sanitizeTaxonomyArrays(
  src: Pick<BlockTaxonomyValue, 'funnel_stage' | 'goal_tags' | 'tone'>
): Pick<BlockTaxonomyValue, 'funnel_stage' | 'goal_tags' | 'tone'> {
  return {
    funnel_stage: src.funnel_stage.filter(v =>
      (FUNNEL_OPTS as readonly string[]).includes(v)
    ),
    goal_tags: src.goal_tags.filter(v =>
      (GOAL_OPTS as readonly string[]).includes(v)
    ),
    tone: src.tone.filter(v => (TONE_OPTS as readonly string[]).includes(v)),
  };
}

function orphanValues(selected: string[], allowed: readonly string[]) {
  return selected.filter(v => !allowed.includes(v));
}

export interface BlockTaxonomyValue {
  function: string;
  page_role: string;
  proof_type: string;
  needs_media: string; // default 'none'
  has_cta: boolean;
  funnel_stage: string[];
  goal_tags: string[];
  tone: string[];
  industry_fit: string[];
}

export function emptyTaxonomy(): BlockTaxonomyValue {
  return {
    function: '',
    page_role: '',
    proof_type: '',
    needs_media: 'none',
    has_cta: false,
    funnel_stage: [],
    goal_tags: [],
    tone: [],
    industry_fit: [],
  };
}

/** Dựng value từ object BE (Block — dùng snake_case). */
export function taxonomyFrom(
  src?: Partial<BlockTaxonomyValue> | null
): BlockTaxonomyValue {
  return {
    function: src?.function ?? '',
    page_role: src?.page_role ?? '',
    proof_type: src?.proof_type ?? '',
    needs_media: src?.needs_media ?? 'none',
    has_cta: src?.has_cta ?? false,
    funnel_stage: src?.funnel_stage ?? [],
    goal_tags: src?.goal_tags ?? [],
    tone: src?.tone ?? [],
    industry_fit: src?.industry_fit ?? [],
  };
}

/** Tách field gửi lên API (select rỗng → undefined; mảng/bool gửi thẳng). */
export function taxonomyToPayload(v: BlockTaxonomyValue) {
  const arrays = sanitizeTaxonomyArrays(v);
  return {
    function:
      v.function && (FUNCTION_OPTS as readonly string[]).includes(v.function)
        ? v.function
        : undefined,
    page_role:
      v.page_role && (PAGE_ROLE_OPTS as readonly string[]).includes(v.page_role)
        ? v.page_role
        : undefined,
    proof_type:
      v.proof_type &&
      (PROOF_TYPE_OPTS as readonly string[]).includes(v.proof_type)
        ? v.proof_type
        : undefined,
    needs_media:
      v.needs_media &&
      (NEEDS_MEDIA_OPTS as readonly string[]).includes(v.needs_media)
        ? v.needs_media
        : undefined,
    has_cta: v.has_cta,
    funnel_stage: arrays.funnel_stage,
    goal_tags: arrays.goal_tags,
    tone: arrays.tone,
    industry_fit: v.industry_fit,
  };
}

export function BlockTaxonomyFields({
  value,
  onChange,
}: {
  value: BlockTaxonomyValue;
  onChange: (v: BlockTaxonomyValue) => void;
}) {
  const [industryInput, setIndustryInput] = React.useState('');
  const set = (patch: Partial<BlockTaxonomyValue>) =>
    onChange({ ...value, ...patch });
  const toggleIn = (key: 'funnel_stage' | 'goal_tags' | 'tone', v: string) =>
    set({
      [key]: value[key].includes(v)
        ? value[key].filter(x => x !== v)
        : [...value[key], v],
    } as Partial<BlockTaxonomyValue>);
  const removeOrphan = (
    key: 'funnel_stage' | 'goal_tags' | 'tone',
    v: string
  ) => set({ [key]: value[key].filter(x => x !== v) });
  const addIndustry = () => {
    const t = industryInput.trim().toLowerCase();
    setIndustryInput('');
    if (t && !value.industry_fit.includes(t))
      set({ industry_fit: [...value.industry_fit, t] });
  };

  return (
    <div className='border-border flex flex-col gap-4 rounded-lg border border-dashed p-3'>
      <div>
        <p className='text-content-muted text-xs font-semibold tracking-wide uppercase'>
          Taxonomy cho AI gợi ý
        </p>
        <p className='text-2xs text-content-muted mt-0.5'>
          Engine recommend_blocks khớp brief (mục tiêu / ngành / giai đoạn phễu
          / tông giọng) với các tín hiệu này khi chọn block.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <MetaSelect
          id='tx-fn'
          label='Function (vai trò trong recipe)'
          value={value.function}
          options={FUNCTION_OPTS}
          onChange={v => set({ function: v })}
        />
        <MetaSelect
          id='tx-page-role'
          label='Vị trí trang'
          value={value.page_role}
          options={PAGE_ROLE_OPTS}
          onChange={v => set({ page_role: v })}
        />
        <MetaSelect
          id='tx-proof'
          label='Loại proof'
          value={value.proof_type}
          options={PROOF_TYPE_OPTS}
          onChange={v => set({ proof_type: v })}
        />
        <MetaSelect
          id='tx-media'
          label='Cần media'
          value={value.needs_media}
          options={NEEDS_MEDIA_OPTS}
          placeholder='— none —'
          onChange={v => set({ needs_media: v })}
        />
      </div>

      <TagToggleGroup
        label='Giai đoạn phễu (funnel_stage)'
        options={FUNNEL_OPTS}
        selected={value.funnel_stage}
        onToggle={v => toggleIn('funnel_stage', v)}
        orphans={orphanValues(value.funnel_stage, FUNNEL_OPTS)}
        onRemoveOrphan={v => removeOrphan('funnel_stage', v)}
      />
      <TagToggleGroup
        label='Mục tiêu (goal_tags)'
        options={GOAL_OPTS}
        selected={value.goal_tags}
        onToggle={v => toggleIn('goal_tags', v)}
        orphans={orphanValues(value.goal_tags, GOAL_OPTS)}
        onRemoveOrphan={v => removeOrphan('goal_tags', v)}
        orphanHint='VD: conversion thuộc funnel_stage, không phải goal_tags — chọn lead_gen hoặc sales.'
      />
      <TagToggleGroup
        label='Tông giọng (tone)'
        options={TONE_OPTS}
        selected={value.tone}
        onToggle={v => toggleIn('tone', v)}
        orphans={orphanValues(value.tone, TONE_OPTS)}
        onRemoveOrphan={v => removeOrphan('tone', v)}
        orphanHint='Chỉ dùng enum tiếng Anh: warm, minimal, bold, corporate, playful.'
      />

      <div className='flex flex-col gap-1'>
        <Label htmlFor='tx-industry'>Ngành phù hợp (industry_fit)</Label>
        {value.industry_fit.length > 0 && (
          <div className='flex flex-wrap items-center gap-1.5'>
            {value.industry_fit.map(v => (
              <span
                key={v}
                className='bg-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs'
              >
                {v}
                <button
                  type='button'
                  onClick={() =>
                    set({
                      industry_fit: value.industry_fit.filter(x => x !== v),
                    })
                  }
                  className='text-content-muted hover:text-foreground'
                  aria-label={`Bỏ ${v}`}
                >
                  <X className='size-3' />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          id='tx-industry'
          value={industryInput}
          onChange={e => setIndustryInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addIndustry();
            }
          }}
          onBlur={addIndustry}
          placeholder='agnostic, saas, fnb… (Enter để thêm)'
        />
      </div>

      <label className='inline-flex w-fit cursor-pointer items-center gap-2'>
        <Switch
          checked={value.has_cta}
          onCheckedChange={v => set({ has_cta: v })}
        />
        <span className='text-sm'>Có call-to-action (has_cta)</span>
      </label>
    </div>
  );
}

/** Native single-select cho 1 thuộc tính taxonomy (option rỗng = không chọn). */
function MetaSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder = '— Không chọn —',
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className='border-border h-9 rounded-md border bg-white px-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      >
        <option value=''>{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Nhóm chip bật/tắt cho thuộc tính taxonomy dạng mảng (multi-select). */
function TagToggleGroup({
  label,
  options,
  selected,
  onToggle,
  orphans = [],
  onRemoveOrphan,
  orphanHint,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  orphans?: string[];
  onRemoveOrphan?: (v: string) => void;
  orphanHint?: string;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <Label>{label}</Label>
      {orphans.length > 0 && (
        <div className='flex flex-col gap-1'>
          <p className='text-2xs text-amber-700'>
            Giá trị không hợp lệ (BE sẽ từ chối) — bỏ hoặc chọn lại:
            {orphanHint ? ` ${orphanHint}` : ''}
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {orphans.map(o => (
              <span
                key={o}
                className='inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-2.5 py-1 text-xs text-amber-900'
              >
                {o}
                {onRemoveOrphan && (
                  <button
                    type='button'
                    onClick={() => onRemoveOrphan(o)}
                    className='text-amber-700 hover:text-amber-950'
                    aria-label={`Bỏ ${o}`}
                  >
                    <X className='size-3' />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className='flex flex-wrap gap-1.5'>
        {options.map(o => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type='button'
              onClick={() => onToggle(o)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                on
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-border text-content-muted hover:bg-muted bg-white'
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
