'use client';

import {
  BrandCard,
  Callout,
  ChipGroup,
  Field,
  LineList,
  ReadField,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import {
  INDUSTRIES,
  MARKET_CATEGORIES,
  TONES,
} from '@/lib/portal-v2/brand/constants';
import type { BrandData } from '@/lib/portal-v2/brand/types';

type IdentityPanelProps = {
  data: BrandData;
  editing: boolean;
  onChange: (next: BrandData) => void;
};

const toggleIn = (list: string[], item: string, max?: number): string[] => {
  if (list.includes(item)) return list.filter(x => x !== item);
  if (max !== undefined && list.length >= max) return list;
  return [...list, item];
};

export const IdentityPanel = ({
  data,
  editing,
  onChange,
}: IdentityPanelProps) => {
  const B = data.identity;

  const patchIdentity = (partial: Partial<typeof B>) => {
    onChange({ ...data, identity: { ...B, ...partial } });
  };

  return (
    <>
      <BrandCard
        title='The brand'
        hint='Who you are and what you sell. Everything ReXeR generates is anchored here.'
      >
        <div className='grid gap-0 sm:grid-cols-2 sm:gap-4'>
          {editing ? (
            <>
              <Field label='Brand name'>
                <TextInput
                  value={B.name}
                  placeholder='Your brand name'
                  onChange={e => patchIdentity({ name: e.target.value })}
                />
              </Field>
              <Field label='Industry'>
                <TextSelect
                  value={B.industry}
                  onChange={e => patchIdentity({ industry: e.target.value })}
                >
                  {Object.entries(INDUSTRIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.n}
                    </option>
                  ))}
                </TextSelect>
              </Field>
            </>
          ) : (
            <>
              <ReadField label='Brand name' value={B.name} />
              <ReadField
                label='Industry'
                value={INDUSTRIES[B.industry]?.n ?? B.industry}
              />
            </>
          )}
        </div>

        {editing ? (
          <>
            <Field label='Brand description'>
              <TextTextarea
                rows={2}
                value={B.description}
                placeholder='What you make, in two sentences'
                onChange={e => patchIdentity({ description: e.target.value })}
              />
            </Field>
            <Field label='Mission'>
              <TextTextarea
                rows={2}
                value={B.mission}
                placeholder='What you are trying to change'
                onChange={e => patchIdentity({ mission: e.target.value })}
              />
            </Field>
            <Field label='Value proposition'>
              <TextTextarea
                rows={2}
                value={B.valueProp}
                placeholder='What a customer gets that they cannot get elsewhere'
                onChange={e => patchIdentity({ valueProp: e.target.value })}
              />
            </Field>
          </>
        ) : (
          <>
            <ReadField label='Brand description' value={B.description} />
            <ReadField label='Mission' value={B.mission} />
            <ReadField label='Value proposition' value={B.valueProp} />
          </>
        )}
      </BrandCard>

      <BrandCard
        title='Positioning'
        hint={
          <>
            Category shelves you beside rivals. Alternative feeds Comparison.
            Reason is what Trust has to prove.
          </>
        }
      >
        <div className='grid gap-0 sm:grid-cols-2 sm:gap-4'>
          {editing ? (
            <>
              <Field label='The category you win'>
                <TextInput
                  value={B.positioning.category}
                  placeholder='The space you intend to own'
                  onChange={e =>
                    patchIdentity({
                      positioning: {
                        ...B.positioning,
                        category: e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label='The alternative you win it from'>
                <TextInput
                  value={B.positioning.against}
                  placeholder='What they would buy instead'
                  onChange={e =>
                    patchIdentity({
                      positioning: {
                        ...B.positioning,
                        against: e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </>
          ) : (
            <>
              <ReadField
                label='The category you win'
                value={B.positioning.category}
              />
              <ReadField
                label='The alternative you win it from'
                value={B.positioning.against}
              />
            </>
          )}
        </div>

        {editing ? (
          <Field label='Because - the reason you are credible'>
            <TextInput
              value={B.positioning.because}
              placeholder='The single proof that makes the claim land'
              onChange={e =>
                patchIdentity({
                  positioning: { ...B.positioning, because: e.target.value },
                })
              }
            />
          </Field>
        ) : (
          <ReadField
            label='Because - the reason you are credible'
            value={B.positioning.because}
          />
        )}

        {!B.positioning.against ? (
          <Callout tone='warning'>
            <span>
              You have named no alternative. A Comparison experience has nothing
              to compare, and you may not make a superiority claim.
            </span>
          </Callout>
        ) : null}
      </BrandCard>

      <BrandCard
        title='Market categories'
        hint='The shelves you compete on. A brand can be on several, and each one has a different set of rivals and a different set of things a shopper needs to believe.'
      >
        <ChipGroup
          label='Categories'
          options={MARKET_CATEGORIES}
          value={B.categories}
          editing={editing}
          onToggle={opt =>
            patchIdentity({ categories: toggleIn(B.categories, opt) })
          }
        />
      </BrandCard>

      <BrandCard
        title='Points of differentiation'
        hint='What is true of you and not of them. This is the raw material for every Explore and Trust block ReXeR builds - and it is the first thing an AI invents if you leave it empty.'
      >
        <LineList
          items={B.differentiation}
          editing={editing}
          hint='One per line · each becomes a claim an experience can make'
          empty='Nothing on file. Every generated page will have to invent its own reason to believe you.'
          onChange={lines => patchIdentity({ differentiation: lines })}
        />
      </BrandCard>

      <BrandCard
        title='Tone'
        hint='Up to three. A constraint on every headline the AI writes - not an adjective in a document.'
        last
      >
        <ChipGroup
          label='Tone'
          options={TONES}
          value={B.tones}
          editing={editing}
          max={3}
          onToggle={opt => patchIdentity({ tones: toggleIn(B.tones, opt, 3) })}
        />
      </BrandCard>
    </>
  );
};
