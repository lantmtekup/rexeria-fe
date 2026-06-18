'use client';

/**
 * Section content của editor marketing (portal) — gốc theo Figma 1886-531,
 * cấu trúc lại 2026-06-13: Discovery / Concept / Assets (FeatureField) +
 * Campaign (thông số chạy). Product/landing picker render ở `_editor.tsx`.
 */

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Chip } from '@/components/atoms/chip';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { FeatureField, InfoTip } from '@/components/molecules/FeatureField';
import type { CampaignObjective } from '@/services/rexer/types';

import {
  AssetsSection,
  uploadOne,
  type AssetItem,
  type AssetsState,
} from './_assets';

/* ── shared types ──────────────────────────────────────────────────────── */

export type MarketingSection = 'discovery' | 'concept' | 'assets';

/** 1 mục brief: ô primary (Age/Budget — chỉ field có cấu hình), text mô tả
 * chính + các ô mô tả thêm (Add more feature) + file kèm. */
export interface BriefField {
  /** Giá trị ô labeled phía trên Description (Age cho Target audience,
   * Budget cho Plan). Chỉ field có `primary` trong def mới dùng. */
  primary?: string;
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

/** primary = key cấu hình ô labeled phía trên Description (Age/Budget). */
type BriefFieldDef = { key: string; label: string; primary?: 'age' | 'budget' };

export const DISCOVERY_FIELDS: readonly BriefFieldDef[] = [
  { key: 'marketingConcept', label: 'Marketing Concept' },
  { key: 'messageDevelopment', label: 'Message Development' },
  { key: 'creativeDirection', label: 'Creative Direction' },
  { key: 'contentMap', label: 'Content Map' },
];

export const CONCEPT_FIELDS: readonly BriefFieldDef[] = [
  { key: 'aboutConcept', label: 'About Concept' },
  { key: 'targetAudience', label: 'Target audience', primary: 'age' },
  { key: 'plan', label: 'Plan', primary: 'budget' },
];

/** Label + placeholder (i18n key) cho ô primary. */
const PRIMARY_CFG: Record<
  'age' | 'budget',
  { labelKey: string; phKey: string }
> = {
  age: { labelKey: 'primaryAgeLabel', phKey: 'primaryAgePh' },
  budget: { labelKey: 'primaryBudgetLabel', phKey: 'primaryBudgetPh' },
};

/** Định dạng tiền: bỏ ký tự không phải số rồi nhóm hàng nghìn (vi-VN).
 *  Lưu raw digits trong state, chỉ format khi hiển thị. */
const groupDigits = (v?: string): string => {
  const d = (v ?? '').replace(/\D/g, '');
  return d ? Number(d).toLocaleString('vi-VN') : '';
};

const OBJECTIVES: { value: CampaignObjective; infoKey: string }[] = [
  { value: 'awareness', infoKey: 'objAwareness' },
  { value: 'traffic', infoKey: 'objTraffic' },
  { value: 'conversion', infoKey: 'objConversion' },
  { value: 'retention', infoKey: 'objRetention' },
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
  const t = useTranslations('portal');
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
        toast.error(t('marketingSteps.uploadFailed', { name: file.name }));
      }
    }
    if (ok.length) patchField(key, { files: [...getField(key).files, ...ok] });
    setUploadingKey(null);
  };

  return (
    <div className='flex max-w-3xl flex-col gap-5'>
      {fields.map(f => {
        const fv = getField(f.key);
        const primary = f.primary ? PRIMARY_CFG[f.primary] : null;
        return (
          <div key={f.key} className='flex flex-col gap-2'>
            {primary && (
              // Header section + ô primary (Age/Budget) label-on-top, theo design.
              <div className='grid grid-cols-[140px_1fr] gap-4'>
                <div className='flex items-start gap-1.5 pt-2.5 text-sm font-semibold'>
                  {f.label}
                  <InfoTip text={t(`marketingSteps.info_${f.key}`)} />
                </div>
                <div className='border-input focus-within:border-foreground rounded-xl border px-3.5 py-2'>
                  <div className='text-foreground text-xs font-semibold'>
                    {t(`marketingSteps.${primary.labelKey}`)}
                  </div>
                  <div className='flex items-baseline gap-1'>
                    <input
                      inputMode={f.primary === 'budget' ? 'numeric' : undefined}
                      className='text-foreground placeholder:text-content-muted mt-0.5 w-full border-0 bg-transparent p-0 text-sm outline-none'
                      placeholder={t(`marketingSteps.${primary.phKey}`)}
                      // Budget: hiển thị phân cách nghìn (vi-VN), lưu raw digits.
                      value={
                        f.primary === 'budget'
                          ? groupDigits(fv.primary)
                          : (fv.primary ?? '')
                      }
                      onChange={e =>
                        patchField(f.key, {
                          primary:
                            f.primary === 'budget'
                              ? e.target.value.replace(/\D/g, '')
                              : e.target.value,
                        })
                      }
                    />
                    {f.primary === 'budget' && fv.primary && (
                      <span className='text-content-muted text-xs'>đ</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            <FeatureField
              label={primary ? t('marketingSteps.descriptionLabel') : f.label}
              info={!primary}
              infoText={primary ? undefined : t(`marketingSteps.info_${f.key}`)}
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
              <Button
                type='button'
                variant='pill'
                size='sm'
                className='w-fit'
                onClick={() =>
                  patchField(f.key, { extras: [...fv.extras, ''] })
                }
              >
                <Plus className='size-3.5' /> Add more feature
              </Button>
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
  const t = useTranslations('portal');
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
        <Label htmlFor='cw-name'>{t('marketingSteps.campaignName')}</Label>
        <Input
          id='cw-name'
          value={value.name}
          onChange={e => set('name', e.target.value)}
          placeholder={t('marketingSteps.campaignNamePlaceholder')}
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
              {t(`marketingSteps.${o.infoKey}`)}
            </option>
          ))}
        </select>
      </div>
      <div className='grid gap-1.5'>
        <Label>{t('marketingSteps.channels')}</Label>
        <div className='flex flex-wrap gap-2'>
          {CHANNELS.map(ch => (
            <Chip
              key={ch}
              size='sm'
              selected={value.channels.includes(ch)}
              onClick={() => toggleChannel(ch)}
            >
              {ch}
            </Chip>
          ))}
        </div>
      </div>
      <div className='grid grid-cols-3 gap-3'>
        <div className='col-span-2 grid gap-1.5'>
          <Label htmlFor='cw-budget'>{t('marketingSteps.budget')}</Label>
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
          <Label htmlFor='cw-currency'>{t('marketingSteps.currency')}</Label>
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
          <Label htmlFor='cw-start'>{t('marketingSteps.startDate')}</Label>
          <Input
            id='cw-start'
            type='date'
            value={value.startDate}
            onChange={e => set('startDate', e.target.value)}
          />
        </div>
        <div className='grid gap-1.5'>
          <Label htmlFor='cw-end'>{t('marketingSteps.endDate')}</Label>
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
