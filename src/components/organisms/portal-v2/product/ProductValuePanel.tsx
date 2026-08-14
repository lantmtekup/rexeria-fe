'use client';

import { Check, Plus, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import {
  TextInput,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import {
  Hint,
  SectionBox,
  WarnBox,
} from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import { VALUE_USED_FOR } from '@/lib/portal-v2/product/constants';
import { valueFilledCount } from '@/lib/portal-v2/product/helpers';
import type { Product, ProductValue } from '@/lib/portal-v2/product/types';

type ProductValuePanelProps = {
  product: Product;
  editing: boolean;
  onChange: (next: Product) => void;
};

const NoneOnFile = ({ children }: { children: ReactNode }) => (
  <p className='text-[12px] text-[var(--pv2-faint)] italic'>{children}</p>
);

const FbList = ({ items }: { items: string[] }) => (
  <ul className='flex list-disc flex-col gap-1 pl-4 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
    {items.map((x, i) => (
      <li key={`${i}-${x.slice(0, 24)}`}>{x}</li>
    ))}
  </ul>
);

export const ProductValuePanel = ({
  product: p,
  editing,
  onChange,
}: ProductValuePanelProps) => {
  const t = useTranslations('portalV2.products');
  const v = p.value;

  const claimsOk = v.claims.filter(c => c.ok).length;
  const claimsNo = v.claims.filter(c => !c.ok).length;
  const filled = valueFilledCount(p);

  const patchValue = (partial: Partial<ProductValue>) =>
    onChange({ ...p, value: { ...v, ...partial } });

  const toLines = (raw: string) => raw.split('\n').map(s => s.trimEnd());

  return (
    <div className='grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_268px]'>
      <div className='flex min-w-0 flex-col gap-3.5'>
        {!filled ? (
          <WarnBox title={t('valueEmptyTitle')}>{t('valueEmptyBody')}</WarnBox>
        ) : null}

        <SectionBox title={t('boxFeaturesBenefits')}>
          <Hint>
            A feature is a fact. A benefit is what that fact does to somebody’s
            life. ReXeR leads with the benefit and substantiates it with the
            feature — never the other way round.
          </Hint>
          <div className='grid gap-3.5 sm:grid-cols-2'>
            <div>
              <p className='mb-2 text-[9px] font-bold tracking-[0.08em] text-[var(--pv2-blue-500)] uppercase'>
                FEATURES · what it is
              </p>
              {editing ? (
                <TextTextarea
                  value={v.features.join('\n')}
                  placeholder={t('onePerLine')}
                  className='min-h-[132px]'
                  onChange={e =>
                    patchValue({ features: toLines(e.target.value) })
                  }
                />
              ) : v.features.length ? (
                <FbList items={v.features} />
              ) : (
                <NoneOnFile>{t('nothingOnFile')}</NoneOnFile>
              )}
            </div>
            <div>
              <p className='mb-2 text-[9px] font-bold tracking-[0.08em] text-[var(--pv2-success)] uppercase'>
                BENEFITS · what it does for them
              </p>
              {editing ? (
                <TextTextarea
                  value={v.benefits.join('\n')}
                  placeholder={t('onePerLine')}
                  className='min-h-[132px]'
                  onChange={e =>
                    patchValue({ benefits: toLines(e.target.value) })
                  }
                />
              ) : v.benefits.length ? (
                <FbList items={v.benefits} />
              ) : (
                <NoneOnFile>{t('nothingOnFile')}</NoneOnFile>
              )}
            </div>
          </div>
        </SectionBox>

        <SectionBox title={t('boxCompetitors')}>
          <Hint>
            What they do, and what you do instead. This is what a Comparison
            experience is built from — and you cannot claim superiority over an
            alternative you have never named.
          </Hint>
          {v.competitors.length ? (
            <div className='flex flex-col gap-2.5'>
              {v.competitors.map((c, i) => (
                <div
                  key={i}
                  className='rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3.5 py-3'
                >
                  {editing ? (
                    <div className='flex flex-col gap-1.5'>
                      <TextInput
                        value={c.n}
                        className='py-1.5 text-[13px]'
                        onChange={e =>
                          patchValue({
                            competitors: v.competitors.map((x, xi) =>
                              xi === i ? { ...x, n: e.target.value } : x
                            ),
                          })
                        }
                      />
                      <TextInput
                        value={c.theirs}
                        className='py-1.5 text-[12px]'
                        onChange={e =>
                          patchValue({
                            competitors: v.competitors.map((x, xi) =>
                              xi === i ? { ...x, theirs: e.target.value } : x
                            ),
                          })
                        }
                      />
                      <TextInput
                        value={c.ours}
                        className='py-1.5 text-[12px]'
                        onChange={e =>
                          patchValue({
                            competitors: v.competitors.map((x, xi) =>
                              xi === i ? { ...x, ours: e.target.value } : x
                            ),
                          })
                        }
                      />
                      <button
                        type='button'
                        aria-label={t('removeRow')}
                        title={t('removeRow')}
                        className='mt-1 self-start text-[11px] text-[var(--pv2-error)] hover:underline'
                        onClick={() =>
                          patchValue({
                            competitors: v.competitors.filter(
                              (_, xi) => xi !== i
                            ),
                          })
                        }
                      >
                        {t('removeRow')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className='font-[family-name:var(--pv2-disp)] text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {c.n}
                      </p>
                      <p className='mt-1.5 flex items-baseline gap-2.5 text-[12px] text-[var(--pv2-mut)]'>
                        <span className='w-8 shrink-0 text-[8.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)]'>
                          THEY
                        </span>
                        {c.theirs}
                      </p>
                      <p className='mt-1 flex items-baseline gap-2.5 text-[12px] text-[var(--pv2-ink)]'>
                        <span className='w-8 shrink-0 text-[8.5px] font-bold tracking-[0.06em] text-[var(--pv2-success)]'>
                          WE
                        </span>
                        {c.ours}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <NoneOnFile>{t('noCompetitor')}</NoneOnFile>
          )}
          {editing ? (
            <Button
              variant='dashed'
              size='sm'
              className='mt-2.5'
              onClick={() =>
                patchValue({
                  competitors: [
                    ...v.competitors,
                    { n: '', theirs: '', ours: '' },
                  ],
                })
              }
            >
              <Plus className='size-3' strokeWidth={2.6} aria-hidden />
              {t('addCompetitor')}
            </Button>
          ) : null}
        </SectionBox>

        <SectionBox
          title={t('boxClaims')}
          action={
            <span className='text-[11px] font-semibold'>
              <span className='text-[var(--pv2-success)]'>
                {t('claimsSubstantiated', { count: claimsOk })}
              </span>
              {claimsNo ? (
                <>
                  {' · '}
                  <span className='text-[var(--pv2-error)]'>
                    {t('claimsUnproven', { count: claimsNo })}
                  </span>
                </>
              ) : null}
            </span>
          }
        >
          <Hint>
            A claim without proof is a claim you cannot make. ReXeR will not
            write an unproven claim into an experience — it leaves the space
            empty and tells you why.
          </Hint>
          <div className='flex flex-col gap-2'>
            {v.claims.map((c, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2.5 rounded-[var(--pv2-r-sm)] border px-3 py-2.5',
                  c.ok
                    ? 'border-[color-mix(in_srgb,var(--pv2-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--pv2-success)_7%,transparent)]'
                    : 'border-[color-mix(in_srgb,var(--pv2-error)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-error)_6%,transparent)]'
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-[6px] text-[var(--pv2-paper)]',
                    c.ok ? 'bg-[var(--pv2-success)]' : 'bg-[var(--pv2-error)]'
                  )}
                >
                  {c.ok ? (
                    <Check className='size-3' strokeWidth={3} aria-hidden />
                  ) : (
                    <X className='size-3' strokeWidth={3} aria-hidden />
                  )}
                </span>

                <span className='min-w-0 flex-1'>
                  {editing ? (
                    <>
                      <TextInput
                        value={c.t}
                        className='mb-1.5 py-1.5 text-[12.5px]'
                        onChange={e =>
                          patchValue({
                            claims: v.claims.map((x, xi) =>
                              xi === i ? { ...x, t: e.target.value } : x
                            ),
                          })
                        }
                      />
                      <TextInput
                        value={c.proof}
                        placeholder='What substantiates it — without this, the claim is blocked'
                        className='py-1.5 text-[12px]'
                        onChange={e =>
                          patchValue({
                            claims: v.claims.map((x, xi) =>
                              xi === i
                                ? {
                                    ...x,
                                    proof: e.target.value,
                                    ok: !!e.target.value.trim(),
                                  }
                                : x
                            ),
                          })
                        }
                      />
                      <button
                        type='button'
                        aria-label={t('removeRow')}
                        title={t('removeRow')}
                        className='mt-1 text-[11px] text-[var(--pv2-error)] hover:underline'
                        onClick={() =>
                          patchValue({
                            claims: v.claims.filter((_, xi) => xi !== i),
                          })
                        }
                      >
                        {t('removeRow')}
                      </button>
                    </>
                  ) : (
                    <>
                      <b className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                        {c.t}
                      </b>
                      <span className='mt-0.5 block text-[11px] text-[var(--pv2-mut)]'>
                        {c.proof || t('claimNoProof')}
                      </span>
                    </>
                  )}
                </span>

                {!editing ? (
                  <span
                    className='shrink-0 text-[8.5px] font-bold tracking-[0.06em]'
                    style={{
                      color: c.ok ? 'var(--pv2-success)' : 'var(--pv2-error)',
                    }}
                  >
                    {c.ok ? 'USABLE' : 'BLOCKED'}
                  </span>
                ) : null}
              </div>
            ))}
            {!v.claims.length ? (
              <NoneOnFile>{t('nothingOnFile')}</NoneOnFile>
            ) : null}
          </div>
          {editing ? (
            <Button
              variant='dashed'
              size='sm'
              className='mt-2.5'
              onClick={() =>
                // `ok` do BE tự tính lại qua core.DeriveClaims khi lưu; đặt
                // false ở đây chỉ để hàng mới hiện đúng trạng thái "chưa có
                // bằng chứng" trước khi người dùng gõ.
                patchValue({
                  claims: [...v.claims, { t: '', proof: '', ok: false }],
                })
              }
            >
              <Plus className='size-3' strokeWidth={2.6} aria-hidden />
              {t('addClaim')}
            </Button>
          ) : null}
        </SectionBox>

        <SectionBox title={t('boxDisclaimers')}>
          <Hint>
            Carried automatically into every experience that makes the claim
            they qualify. Not something a generated page should be trusted to
            remember on its own.
          </Hint>
          {editing ? (
            <TextTextarea
              value={v.disclaimers.join('\n')}
              placeholder={t('onePerLine')}
              className='min-h-[76px]'
              onChange={e =>
                patchValue({ disclaimers: toLines(e.target.value) })
              }
            />
          ) : v.disclaimers.length ? (
            <div className='flex flex-col gap-1.5'>
              {v.disclaimers.map((x, i) => (
                <p
                  key={`${i}-${x.slice(0, 24)}`}
                  className='flex items-start gap-2 text-[12px] leading-relaxed text-[var(--pv2-mut)]'
                >
                  <Sparkles
                    className='mt-0.5 size-3 shrink-0'
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  {x}
                </p>
              ))}
            </div>
          ) : (
            <NoneOnFile>{t('noneOnFile')}</NoneOnFile>
          )}
        </SectionBox>
      </div>

      <aside className='flex min-w-0 flex-col gap-3'>
        <SectionBox title={t('boxWhatRexerDoes')}>
          <div className='flex flex-col'>
            {VALUE_USED_FOR.map(u => (
              <div
                key={u.k}
                className='flex items-baseline gap-2.5 border-b border-[var(--pv2-hair)] py-[7px] last:border-b-0'
              >
                <span className='w-14 shrink-0 text-[8.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)]'>
                  {u.k}
                </span>
                <span className='text-[11.5px] leading-snug text-[var(--pv2-slate-500)]'>
                  {u.v}
                </span>
              </div>
            ))}
          </div>
        </SectionBox>

        <SectionBox title={t('boxCompleteness')}>
          {(
            [
              ['Features', v.features.length],
              ['Benefits', v.benefits.length],
              ['Competitors', v.competitors.length],
              ['Claims', v.claims.length],
              ['Disclaimers', v.disclaimers.length],
            ] as const
          ).map(([k, n]) => (
            <div key={k} className='flex items-center gap-2.5 py-1'>
              <span className='flex-1 text-[12px] text-[var(--pv2-mut)]'>
                {k}
              </span>
              <span
                className='size-[7px] shrink-0 rounded-full'
                style={{
                  background: n ? 'var(--pv2-success)' : 'var(--pv2-hair)',
                }}
              />
              <span className='w-[22px] shrink-0 text-right font-[family-name:var(--pv2-disp)] text-[12.5px] font-bold text-[var(--pv2-ink)]'>
                {n || '—'}
              </span>
            </div>
          ))}
          <p className='mt-2.5 text-[11px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('completenessHint')}
          </p>
        </SectionBox>
      </aside>
    </div>
  );
};
