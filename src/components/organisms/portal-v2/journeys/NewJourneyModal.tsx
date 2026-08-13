'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { PersonaOption } from '@/services/portal-v2/journeyAudience';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  Callout,
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import {
  JOURNEY_OBJECTIVES,
  OUTCOME_FOR_OBJECTIVE,
} from '@/lib/portal-v2/journeys/constants';
import type { JourneyDraftInput } from '@/lib/portal-v2/journeys/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

type NewJourneyModalProps = {
  /** Chân dung của brand — `brand_profiles.audience`. Rỗng ⇒ chỉ có "mọi khách". */
  personas?: PersonaOption[];
  onClose: () => void;
  onCreate: (input: JourneyDraftInput) => void;
};

export const NewJourneyModal = ({
  personas = [],
  onClose,
  onCreate,
}: NewJourneyModalProps) => {
  const t = useTranslations('portalV2.journeys');
  const [name, setName] = useState('');
  const [obj, setObj] = useState<ExperienceObjective>('insight');
  const [personaId, setPersonaId] = useState('');
  const [tagline, setTagline] = useState('');
  const [summary, setSummary] = useState('');

  const outcome = OUTCOME_FOR_OBJECTIVE[obj];

  return (
    <Modal
      open
      onClose={onClose}
      title={t('newTitle')}
      subtitle={t('newSubtitle')}
      footer={
        <>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            size='sm'
            onClick={() =>
              onCreate({
                name,
                obj,
                personaId: personaId || null,
                tagline,
                summary,
              })
            }
          >
            {t('create')}
          </Button>
        </>
      }
    >
      <Callout>
        <Sparkles className='mt-0.5 size-3.5 shrink-0 text-[var(--pv2-electric)]' />
        <span>
          A new journey is never an empty canvas. The objective decides the
          result it already ends in — you design the middle, which is the only
          part that is actually yours to decide.
        </span>
      </Callout>

      <Field label={t('fieldName')}>
        <TextInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('fieldNamePlaceholder')}
          autoFocus
        />
      </Field>

      <Field label={t('fieldObjective')}>
        <TextSelect
          value={obj}
          onChange={e => setObj(e.target.value as ExperienceObjective)}
        >
          {JOURNEY_OBJECTIVES.map(o => (
            <option key={o.id} value={o.id}>
              {t(o.labelKey)}
            </option>
          ))}
        </TextSelect>
      </Field>

      <Field label={t('fieldAudience')}>
        {/* Chân dung của brand; rỗng = chưa nhắm ai cụ thể. */}
        <TextSelect
          value={personaId}
          onChange={e => setPersonaId(e.target.value)}
        >
          <option value=''>{t('segmentAll')}</option>
          {personas.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </TextSelect>
      </Field>

      <Field label={t('overDescription')}>
        <TextInput
          value={tagline}
          onChange={e => setTagline(e.target.value)}
          placeholder={t('metaTaglinePlaceholder')}
        />
      </Field>

      <Field label={t('metaSummary')}>
        <TextTextarea
          rows={3}
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder={t('metaSummaryPlaceholder')}
        />
      </Field>

      <p className='rounded-[10px] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
        {t('newDraftHint', { outcome: outcome.name })}
      </p>
    </Modal>
  );
};
