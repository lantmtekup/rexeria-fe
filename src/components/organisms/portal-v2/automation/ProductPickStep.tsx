'use client';

import { ArrowLeft, Check, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ReadinessSlots } from '@/components/organisms/portal-v2/automation/ReadinessSlots';
import { cn } from '@/lib/cn';
import {
  categoryLeaf,
  categoryParent,
  readinessOf,
} from '@/lib/portal-v2/automation/readiness';
import type {
  AutomationExperience,
  AutomationProduct,
} from '@/lib/portal-v2/automation/types';
import type {
  RunOutcome,
  RunProgress,
} from '@/services/portal-v2/automationRun';

/**
 * Bước 2 — chọn sản phẩm cùng lớp để nhân bản.
 *
 * Thẻ nào thiếu ô phễu vẫn CHỌN ĐƯỢC: bản copy vẫn là draft, và gap được ghi
 * lại kèm theo. Demo cũng vậy — nó chặn ở khâu deploy chứ không chặn khâu tạo.
 * Chặn ngay ở đây thì người dùng mất luôn đường tạo nháp rồi bổ sung sau.
 */
export const ProductPickStep = ({
  experience,
  masterProduct,
  eligible,
  unclassified,
  selected,
  widen,
  onToggle,
  onToggleWiden,
  onBack,
  onRun,
  cap,
  progress,
  outcomes,
  runError,
  running,
}: {
  experience: AutomationExperience;
  masterProduct: AutomationProduct;
  eligible: AutomationProduct[];
  /** Sản phẩm gốc chưa phân loại ⇒ danh sách là "mọi sản phẩm khác". */
  unclassified: boolean;
  selected: string[];
  widen: boolean;
  onToggle: (id: string) => void;
  onToggleWiden: () => void;
  onBack: () => void;
  onRun: () => void;
  /** Trần mỗi lượt — nói ra chứ không lặng lẽ cắt bớt danh sách. */
  cap: number;
  progress: RunProgress | null;
  outcomes: RunOutcome[] | null;
  runError: string | null;
  running: boolean;
}) => {
  const t = useTranslations('portalV2.automation');

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-[12.5px] text-[var(--pv2-mut)]'>
          {unclassified
            ? t('unclassified', {
                master: masterProduct.title,
                count: eligible.length,
              })
            : t('sameClass', {
                klass: widen
                  ? categoryParent(masterProduct.category)
                  : categoryLeaf(masterProduct.category),
                master: masterProduct.title,
                count: eligible.length,
              })}
        </span>
        <Button
          variant='toggle'
          size='sm'
          disabled={unclassified}
          title={unclassified ? t('widenDisabled') : undefined}
          onClick={onToggleWiden}
          className={cn(
            widen &&
              'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
          )}
        >
          <Sparkles aria-hidden />
          {t('widenTo', { klass: categoryParent(masterProduct.category) })}
        </Button>
      </div>

      <div className='grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3'>
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] px-3.5 py-3'>
          <div className='flex items-center gap-2.5'>
            <span className='flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'>
              <Check className='size-3' strokeWidth={3.4} aria-hidden />
            </span>
            <span
              aria-hidden
              className='size-[34px] shrink-0 rounded-[var(--pv2-r-sm)]'
              style={{ background: masterProduct.gradient }}
            />
            <span className='flex min-w-0 flex-col'>
              <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {masterProduct.title}
              </span>
              <span className='text-[11.5px] text-[var(--pv2-electric)]'>
                {t('theMaster')}
              </span>
            </span>
          </div>
        </div>

        {eligible.map(p => {
          const on = selected.includes(p.id);
          const rd = readinessOf(experience, p);
          return (
            <button
              key={p.id}
              type='button'
              aria-pressed={on}
              onClick={() => onToggle(p.id)}
              className={cn(
                'flex cursor-pointer flex-col gap-2 rounded-[var(--pv2-r)] border px-3.5 py-3 text-left transition-colors',
                on
                  ? 'border-[var(--pv2-electric)] bg-[var(--pv2-paper)]'
                  : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] hover:border-[var(--pv2-slate-300)]'
              )}
            >
              <div className='flex items-center gap-2.5'>
                <span
                  className={cn(
                    'flex size-[18px] shrink-0 items-center justify-center rounded-full border',
                    on
                      ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'
                      : 'border-[var(--pv2-slate-300)]'
                  )}
                >
                  {on ? (
                    <Check className='size-3' strokeWidth={3.4} aria-hidden />
                  ) : null}
                </span>
                <span
                  aria-hidden
                  className='size-[34px] shrink-0 rounded-[var(--pv2-r-sm)]'
                  style={{ background: p.gradient }}
                />
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {p.title}
                  </span>
                  <span className='truncate text-[11.5px] text-[var(--pv2-mut)]'>
                    {p.type}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 text-[11.5px] font-semibold',
                    rd.gaps.length === 0
                      ? 'text-[var(--pv2-success)]'
                      : 'text-[var(--pv2-warning)]'
                  )}
                >
                  {t('slotsReady', { filled: rd.filled, total: rd.total })}
                </span>
              </div>

              <ReadinessSlots readiness={rd} />

              <span
                className={cn(
                  'text-[11.5px] leading-relaxed',
                  rd.gaps.length === 0
                    ? 'text-[var(--pv2-success)]'
                    : 'text-[var(--pv2-warning)]'
                )}
              >
                {rd.gaps.length === 0
                  ? t('readyToDeploy')
                  : t('needsBeforeDeploy', {
                      needs: rd.gaps.map(g => t(g.needKey)).join(', '),
                    })}
              </span>
            </button>
          );
        })}
      </div>

      {eligible.length === 0 ? (
        <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-5 py-8 text-center text-[13px] text-[var(--pv2-mut)]'>
          {t('noneInClass', {
            klass: categoryParent(masterProduct.category),
          })}
        </div>
      ) : null}

      {progress ? (
        <div className='flex flex-col gap-1 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'>
          <span className='flex items-center gap-2 text-[13px] font-semibold text-[var(--pv2-ink)]'>
            <Loader2 className='size-4 animate-spin' aria-hidden />
            {t('runProgress', {
              index: progress.index,
              total: progress.total,
              product: progress.productTitle,
            })}
          </span>
          <span className='text-[12px] text-[var(--pv2-mut)]'>
            {t(`runStage.${progress.stage}`)}
          </span>
          <span className='text-[11.5px] text-[var(--pv2-faint)]'>
            {t('dontClose')}
          </span>
        </div>
      ) : null}

      {outcomes ? (
        <div className='flex flex-col gap-1.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'>
          <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {t('runDone', {
              ok: outcomes.filter(o => !o.error).length,
              total: outcomes.length,
            })}
          </span>
          {outcomes.map(o => (
            <span
              key={o.productId}
              className={cn(
                'text-[12px]',
                o.error
                  ? 'text-[var(--pv2-error)]'
                  : 'text-[var(--pv2-success)]'
              )}
            >
              {o.error
                ? t('runItemFailed', { product: o.productTitle })
                : t('runItemOk', { product: o.productTitle })}
            </span>
          ))}
        </div>
      ) : null}

      {runError ? (
        <p className='text-[12px] text-[var(--pv2-error)]'>{runError}</p>
      ) : null}

      <div className='flex flex-wrap items-center gap-3'>
        <Button variant='ghost' disabled={running} onClick={onBack}>
          <ArrowLeft aria-hidden />
          {t('back')}
        </Button>
        <span className='text-[12.5px] text-[var(--pv2-mut)]'>
          {t('toGenerate', { n: selected.length })}
          {selected.length > cap ? ` · ${t('capNote', { cap })}` : ''}
        </span>
        <span className='flex-1' />
        <Button
          variant='primary'
          disabled={running || selected.length === 0}
          onClick={onRun}
        >
          {running ? (
            <Loader2 className='animate-spin' aria-hidden />
          ) : (
            <Wand2 aria-hidden />
          )}
          {running ? t('running') : t('automate')}
        </Button>
      </div>
    </div>
  );
};
