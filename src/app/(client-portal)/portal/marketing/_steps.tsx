'use client';

/**
 * Section content của editor marketing (portal) — gốc theo Figma 1886-531,
 * cấu trúc lại 2026-06-13: Discovery / Concept / Assets (FeatureField) +
 * Campaign (thông số chạy). Product/landing picker render ở `_editor.tsx`.
 */

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { FeatureField } from '@/components/molecules/FeatureField';
import { cn } from '@/lib/cn';
import type { CampaignObjective } from '@/services/rexer/types';

import {
  AssetsSection,
  uploadOne,
  type AssetItem,
  type AssetsState,
} from './_assets';

/* ── shared types ──────────────────────────────────────────────────────── */

export type MarketingSection = 'discovery' | 'concept' | 'assets';

/** 1 mục brief: text chính + các ô mô tả thêm (Add more feature) + file kèm. */
export interface BriefField {
  text: string;
  extras: string[];
  files: AssetItem[];
}
export type BriefSectionState = Record<string, BriefField>;

export interface BriefState {
  discovery: BriefSectionState;
  concept: BriefSectionState;
}

export const emptyBriefField = (): BriefField => ({
  text: '',
  extras: [],
  files: [],
});

export interface CampaignState {
  name: string;
  objective: CampaignObjective;
  channels: string[];
  budget: string;
  currency: string;
  startDate: string;
  endDate: string;
}

export const DISCOVERY_FIELDS = [
  {
    key: 'marketingConcept',
    label: 'Marketing Concept',
    info: 'Định hướng tổng thể của chiến dịch — giá trị cốt lõi muốn truyền tải tới khách hàng.',
  },
  {
    key: 'messageDevelopment',
    label: 'Message Development',
    info: 'Thông điệp chính & phụ sẽ dùng xuyên suốt các kênh truyền thông.',
  },
  {
    key: 'creativeDirection',
    label: 'Creative Direction',
    info: 'Phong cách hình ảnh, tông màu, mood & tone sáng tạo của chiến dịch.',
  },
  {
    key: 'contentMap',
    label: 'Content Map',
    info: 'Loại nội dung cho từng giai đoạn trong hành trình khách hàng.',
  },
] as const;

export const CONCEPT_FIELDS = [
  {
    key: 'aboutConcept',
    label: 'About Concept',
    info: 'Mô tả ngắn gọn concept của sản phẩm / chiến dịch.',
  },
  {
    key: 'targetAudience',
    label: 'Target audience',
    info: 'Chân dung khách hàng mục tiêu: độ tuổi, hành vi, nhu cầu, nỗi đau.',
  },
  {
    key: 'plan',
    label: 'Plan',
    info: 'Kế hoạch triển khai: kênh, thời gian, ngân sách, nguồn lực.',
  },
] as const;

const OBJECTIVES: { value: CampaignObjective; label: string }[] = [
  { value: 'awareness', label: 'Nhận biết' },
  { value: 'traffic', label: 'Kéo traffic' },
  { value: 'conversion', label: 'Chuyển đổi' },
  { value: 'retention', label: 'Giữ chân' },
];

const CHANNELS = ['Facebook', 'Google', 'TikTok', 'Zalo', 'Email'];

const SELECT_CLASS =
  'border-input bg-background h-10 w-full rounded-md border px-3 text-sm outline-none disabled:opacity-60';

/* ── 02 Marketing — Discovery / Concept / Assets ───────────────────────── */

/** Field bắt buộc mỗi section (text chính phải có) — dùng cho validate. */
export const REQUIRED_FIELDS: Record<'discovery' | 'concept', string[]> = {
  discovery: DISCOVERY_FIELDS.map(f => f.key),
  concept: CONCEPT_FIELDS.map(f => f.key),
};

/** Trả danh sách label field còn trống của 1 section brief. */
export function missingBriefFields(
  section: 'discovery' | 'concept',
  brief: BriefState
): string[] {
  const defs = section === 'discovery' ? DISCOVERY_FIELDS : CONCEPT_FIELDS;
  return defs
    .filter(f => !(brief[section][f.key]?.text ?? '').trim())
    .map(f => f.label);
}

export function StepMarketing({
  section,
  brief,
  onBriefChange,
  assets,
  onAssetsChange,
  showErrors = false,
}: {
  section: MarketingSection;
  brief: BriefState;
  onBriefChange: (next: BriefState) => void;
  assets: AssetsState;
  onAssetsChange: (next: AssetsState) => void;
  showErrors?: boolean;
}) {
  if (section === 'assets')
    return <AssetsSection assets={assets} onChange={onAssetsChange} />;
  return (
    <BriefFields
      section={section}
      brief={brief}
      onBriefChange={onBriefChange}
      showErrors={showErrors}
    />
  );
}

function BriefFields({
  section,
  brief,
  onBriefChange,
  showErrors,
}: {
  section: 'discovery' | 'concept';
  brief: BriefState;
  onBriefChange: (next: BriefState) => void;
  showErrors?: boolean;
}) {
  // key đang upload file đính kèm (spinner trên icon ⬆ của đúng mục đó)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fields = section === 'discovery' ? DISCOVERY_FIELDS : CONCEPT_FIELDS;

  const getField = (key: string): BriefField =>
    brief[section][key] ?? emptyBriefField();
  const patchField = (key: string, patch: Partial<BriefField>) =>
    onBriefChange({
      ...brief,
      [section]: {
        ...brief[section],
        [key]: { ...getField(key), ...patch },
      },
    });

  const handlePickFiles = async (key: string, files: File[]) => {
    setUploadingKey(key);
    const ok: AssetItem[] = [];
    for (const file of files) {
      try {
        ok.push(await uploadOne(file));
      } catch {
        toast.error(`Upload "${file.name}" thất bại`);
      }
    }
    if (ok.length) patchField(key, { files: [...getField(key).files, ...ok] });
    setUploadingKey(null);
  };

  return (
    <div className='flex max-w-3xl flex-col gap-5'>
      {fields.map(f => {
        const fv = getField(f.key);
        return (
          <div key={f.key} className='flex flex-col gap-2'>
            <FeatureField
              label={f.label}
              infoText={f.info}
              rows={3}
              collapsible
              placeholder={`Describe about ${f.label}`}
              value={fv.text}
              onChange={next => patchField(f.key, { text: next })}
              onPickFiles={files => handlePickFiles(f.key, files)}
              uploading={uploadingKey === f.key}
              attachments={fv.files}
              onRemoveAttachment={i =>
                patchField(f.key, {
                  files: fv.files.filter((_, x) => x !== i),
                })
              }
              error={showErrors && !fv.text.trim()}
            />
            {fv.extras.map((extra, i) => (
              <FeatureField
                key={i}
                label=''
                info={false}
                showUpload={false}
                rows={3}
                collapsible
                placeholder={`Describe more about ${f.label}`}
                value={extra}
                onChange={next =>
                  patchField(f.key, {
                    extras: fv.extras.map((x, xi) => (xi === i ? next : x)),
                  })
                }
                onRemove={() =>
                  patchField(f.key, {
                    extras: fv.extras.filter((_, xi) => xi !== i),
                  })
                }
              />
            ))}
            {/* Nút thêm ô mô tả — luôn ở CUỐI cụm, dưới mọi ô extra. */}
            <div className='grid grid-cols-[140px_1fr] gap-4'>
              <span />
              <button
                type='button'
                onClick={() =>
                  patchField(f.key, { extras: [...fv.extras, ''] })
                }
                className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
              >
                <Plus className='size-3.5' /> Add more feature
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── 04 Campaign ───────────────────────────────────────────────────────── */

export function StepCampaign({
  value,
  onChange,
}: {
  value: CampaignState;
  onChange: (next: CampaignState) => void;
}) {
  const set = <K extends keyof CampaignState>(k: K, v: CampaignState[K]) =>
    onChange({ ...value, [k]: v });
  const toggleChannel = (ch: string) =>
    set(
      'channels',
      value.channels.includes(ch)
        ? value.channels.filter(c => c !== ch)
        : [...value.channels, ch]
    );

  return (
    <div className='flex max-w-xl flex-col gap-4'>
      <div className='grid gap-1.5'>
        <Label htmlFor='cw-name'>Tên campaign</Label>
        <Input
          id='cw-name'
          value={value.name}
          onChange={e => set('name', e.target.value)}
          placeholder='VD: Tết 2027 — Mở bán đợt 1'
        />
      </div>
      <div className='grid gap-1.5'>
        <Label htmlFor='cw-objective'>Objective</Label>
        <select
          id='cw-objective'
          className={SELECT_CLASS}
          value={value.objective}
          onChange={e => set('objective', e.target.value as CampaignObjective)}
        >
          {OBJECTIVES.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className='grid gap-1.5'>
        <Label>Kênh</Label>
        <div className='flex flex-wrap gap-2'>
          {CHANNELS.map(ch => (
            <button
              key={ch}
              type='button'
              onClick={() => toggleChannel(ch)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                value.channels.includes(ch)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-content-muted hover:text-foreground'
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>
      <div className='grid grid-cols-3 gap-3'>
        <div className='col-span-2 grid gap-1.5'>
          <Label htmlFor='cw-budget'>Ngân sách</Label>
          <Input
            id='cw-budget'
            type='number'
            min='0'
            value={value.budget}
            onChange={e => set('budget', e.target.value)}
            placeholder='50000000'
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='cw-currency'>Tiền tệ</Label>
          <select
            id='cw-currency'
            className={SELECT_CLASS}
            value={value.currency}
            onChange={e => set('currency', e.target.value)}
          >
            <option value='VND'>VND</option>
            <option value='USD'>USD</option>
          </select>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='grid gap-1.5'>
          <Label htmlFor='cw-start'>Bắt đầu</Label>
          <Input
            id='cw-start'
            type='date'
            value={value.startDate}
            onChange={e => set('startDate', e.target.value)}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='cw-end'>Kết thúc</Label>
          <Input
            id='cw-end'
            type='date'
            value={value.endDate}
            onChange={e => set('endDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
