'use client';

import { Sparkles } from 'lucide-react';

import {
  BrandCard,
  Callout,
  ChipGroup,
  Field,
  LineList,
  ReadField,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { TRAITS } from '@/lib/portal-v2/brand/constants';
import type { BrandData } from '@/lib/portal-v2/brand/types';

type EssencePanelProps = {
  data: BrandData;
  editing: boolean;
  onChange: (next: BrandData) => void;
};

const toggleIn = (list: string[], item: string): string[] =>
  list.includes(item) ? list.filter(x => x !== item) : [...list, item];

type ValueCardProps = {
  title: string;
  colourClass: string;
  what: string;
  why: string;
  items: string[];
  editing: boolean;
  onChange: (lines: string[]) => void;
};

const ValueCard = ({
  title,
  colourClass,
  what,
  why,
  items,
  editing,
  onChange,
}: ValueCardProps) => (
  <BrandCard title={title} hint={why}>
    <div
      className={`-mt-1.5 mb-2.5 text-[9px] font-bold tracking-[0.09em] ${colourClass}`}
    >
      {what}
    </div>
    <LineList
      items={items}
      editing={editing}
      hint='One per line'
      empty='Nothing on file.'
      onChange={onChange}
    />
  </BrandCard>
);

export const EssencePanel = ({
  data,
  editing,
  onChange,
}: EssencePanelProps) => {
  const E = data.essence;

  const patchEssence = (partial: Partial<typeof E>) => {
    onChange({ ...data, essence: { ...E, ...partial } });
  };

  return (
    <>
      <Callout>
        <Sparkles className='mt-0.5 size-3.5 shrink-0 text-[var(--pv2-electric)]' />
        <span>
          Three kinds of value, and an experience should reach for all three.
          Most brands write only the functional - which converts the people who
          were already ready, and loses everyone else. ReXeR uses{' '}
          <b>functional</b> at Educate, <b>emotional</b> at Explore, and{' '}
          <b>social</b> at Trust.
        </span>
      </Callout>

      <ValueCard
        title='Functional value'
        colourClass='text-[var(--pv2-blue-500)]'
        what='WHAT IT DOES'
        why='The job it gets done. Facts, not adjectives - these are what a claim is built on.'
        items={E.functional}
        editing={editing}
        onChange={functional => patchEssence({ functional })}
      />

      <ValueCard
        title='Emotional value'
        colourClass='text-rose-600'
        what='HOW IT MAKES THEM FEEL'
        why='The feeling on the other side of the purchase. This is what a hook is written from.'
        items={E.emotional}
        editing={editing}
        onChange={emotional => patchEssence({ emotional })}
      />

      <ValueCard
        title='Social value'
        colourClass='text-emerald-600'
        what='WHAT IT SAYS ABOUT THEM'
        why='What owning it signals to other people. The most under-used and most persuasive of the three.'
        items={E.social}
        editing={editing}
        onChange={social => patchEssence({ social })}
      />

      <BrandCard
        title='Personality'
        hint='How the brand behaves when it speaks. A constraint on every AI draft - which is why it is a fixed vocabulary and not a free-text box: a mood board cannot constrain a headline.'
      >
        <ChipGroup
          label='Traits'
          options={TRAITS}
          value={E.personality}
          editing={editing}
          onToggle={opt =>
            patchEssence({ personality: toggleIn(E.personality, opt) })
          }
        />
      </BrandCard>

      <BrandCard
        title='Desired perception'
        hint='The sentence you want a customer to say about you to someone else, unprompted. If an experience does not move a shopper toward saying this, it has not done its job.'
        last
      >
        {editing ? (
          <Field label='In their words, not yours'>
            <TextTextarea
              rows={3}
              value={E.perception}
              onChange={e => patchEssence({ perception: e.target.value })}
            />
          </Field>
        ) : E.perception ? (
          <blockquote className='rounded-[14px] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-5 py-4'>
            <div className='flex items-start gap-3'>
              <Sparkles
                className='mt-0.5 size-4 shrink-0 text-[var(--pv2-electric)]'
                aria-hidden
              />
              <p className='font-[family-name:var(--pv2-disp)] text-[15px] leading-relaxed font-medium text-[var(--pv2-ink)]'>
                “{E.perception}”
              </p>
            </div>
          </blockquote>
        ) : (
          <ReadField
            label='Perception'
            value={null}
            empty='Not set. Nothing is aiming at anything.'
          />
        )}
      </BrandCard>
    </>
  );
};
