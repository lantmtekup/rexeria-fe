'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  EXPERIENCE_CATEGORIES,
  EXPERIENCE_INTERACTIONS,
  EXPERIENCE_OBJECTIVES,
  EXPERIENCE_VEHICLES,
} from '@/lib/portal-v2/experiences/constants';
import type { NewExperienceDraft } from '@/services/portal-v2/experienceActions';
import { cn } from '@/lib/cn';

type NewExperienceModalProps = {
  onClose: () => void;
  /** Ném lỗi ra để modal hiện nguyên văn của BE, đừng nuốt. */
  onConfirm: (draft: NewExperienceDraft) => Promise<void>;
};

const labelClass =
  'text-[10px] font-bold tracking-[0.08em] text-[var(--pv2-faint)] uppercase';

const inputClass = cn(
  'w-full rounded-[9px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2',
  'text-[13px] text-[var(--pv2-ink)] outline-none transition-colors',
  'focus:border-[var(--pv2-violet)]'
);

/** Bỏ `all` — đó là giá trị của BỘ LỌC, không phải một lựa chọn khi tạo. */
const realOptions = <T extends { id: string; labelKey: string }>(opts: T[]) =>
  opts.filter(o => o.id !== 'all');

/**
 * Tạo trải nghiệm mới — prototype `ednew`.
 *
 * MỘT ĐIỀU PHẢI NÓI THẲNG: `POST /v1/experiences` KHÔNG tạo ra một mục cho màn
 * này. `category: 'collection'` dựng một **trải nghiệm gốc** nháp, `'blocks'`
 * dựng một **Block** — cả hai đều không phải bản copy, mà thư viện Experiences chỉ nạp
 * ba state copy. Nên món vừa tạo sẽ không hiện trong lưới, và (vì còn `draft`)
 * cũng chưa hiện ở Exchange.
 *
 * Vì vậy màn hình đi theo đúng lời hứa của prototype — "The canvas opens next"
 * — bằng `edit_url` BE trả về. Người dùng rơi thẳng vào canvas thay vì nhìn một
 * lưới không đổi và tưởng nút hỏng. Dòng chú thích dưới tiêu đề nói trước điều
 * đó, không để họ tự phát hiện.
 */
export const NewExperienceModal = ({
  onClose,
  onConfirm,
}: NewExperienceModalProps) => {
  const t = useTranslations('portalV2.experiences');

  const [draft, setDraft] = useState<NewExperienceDraft>({
    name: '',
    category: 'collection',
    vehicle: 'curated',
    objective: 'lead',
    interactions: [],
    tagline: '',
    summary: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof NewExperienceDraft>(
    key: K,
    value: NewExperienceDraft[K]
  ) => setDraft(prev => ({ ...prev, [key]: value }));

  const toggleInteraction = (id: string) =>
    setDraft(prev => ({
      ...prev,
      interactions: prev.interactions.includes(id)
        ? prev.interactions.filter(x => x !== id)
        : [...prev.interactions, id],
    }));

  /* Tên là trường DUY NHẤT bắt buộc ở BE (`validate:"required,min=1"`). */
  const ready = draft.name.trim().length > 0;

  const handleConfirm = async () => {
    if (!ready || pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm(draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('createFailed'));
      setPending(false);
    }
  };

  return (
    <Modal
      open
      wide
      onClose={pending ? () => undefined : onClose}
      title={t('newTitle')}
      subtitle={t('newSubtitle')}
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='flex flex-col gap-3'>
          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newName')}</span>
            <input
              autoFocus
              value={draft.name}
              onChange={e => set('name', e.target.value)}
              placeholder={t('newNamePlaceholder')}
              className={inputClass}
            />
          </label>

          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newTagline')}</span>
            <input
              value={draft.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder={t('newTaglinePlaceholder')}
              className={inputClass}
            />
          </label>

          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newSummary')}</span>
            <textarea
              rows={4}
              value={draft.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder={t('newSummaryPlaceholder')}
              className={cn(inputClass, 'resize-y')}
            />
          </label>
        </div>

        <div className='flex flex-col gap-3'>
          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newCategory')}</span>
            <select
              value={draft.category}
              onChange={e =>
                set(
                  'category',
                  e.target.value as NewExperienceDraft['category']
                )
              }
              className={cn(inputClass, 'cursor-pointer')}
            >
              {realOptions(EXPERIENCE_CATEGORIES).map(o => (
                <option key={o.id} value={o.id}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
            <span className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
              {draft.category === 'blocks'
                ? t('newCategoryBlocksHint')
                : t('newCategoryCollectionHint')}
            </span>
          </label>

          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newVehicle')}</span>
            <select
              value={draft.vehicle}
              onChange={e => set('vehicle', e.target.value)}
              className={cn(inputClass, 'cursor-pointer')}
            >
              {realOptions(EXPERIENCE_VEHICLES).map(o => (
                <option key={o.id} value={o.id}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newObjective')}</span>
            <select
              value={draft.objective}
              onChange={e => set('objective', e.target.value)}
              className={cn(inputClass, 'cursor-pointer')}
            >
              {realOptions(EXPERIENCE_OBJECTIVES).map(o => (
                <option key={o.id} value={o.id}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <div className='flex flex-col gap-1.5'>
            <span className={labelClass}>{t('newInteractions')}</span>
            <div className='flex flex-wrap gap-1.5'>
              {EXPERIENCE_INTERACTIONS.map(o => {
                const on = draft.interactions.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type='button'
                    title={t(o.descKey)}
                    aria-pressed={on}
                    onClick={() => toggleInteraction(o.id)}
                    className={cn(
                      'cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors',
                      on
                        ? 'border-[var(--pv2-violet)] bg-[var(--pv2-violet)] text-[var(--pv2-paper)]'
                        : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
                    )}
                  >
                    {t(o.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/*
        Nói trước món này đi đâu. Nếu để người dùng bấm Tạo rồi tự nhận ra lưới
        không đổi, họ sẽ bấm thêm vài lần nữa — và mỗi lần là một trải nghiệm
        gốc nháp thật nằm lại trong kho.
      */}
      <p className='mt-4 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
        {t('newLandsHint')}
      </p>

      {error ? (
        <p className='mt-3 text-[12.5px] text-[var(--pv2-error)]'>{error}</p>
      ) : null}

      <div className='mt-4 flex justify-end gap-2'>
        <Button variant='ghost' onClick={onClose} disabled={pending}>
          {t('cancel')}
        </Button>
        <Button
          variant='primary'
          onClick={handleConfirm}
          disabled={!ready || pending}
        >
          {pending ? (
            <Loader2 className='size-3.5 animate-spin' aria-hidden />
          ) : null}
          {t('newConfirm')}
        </Button>
      </div>
    </Modal>
  );
};
