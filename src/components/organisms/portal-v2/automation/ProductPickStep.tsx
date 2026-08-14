'use client';

import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ReadinessSlots } from '@/components/organisms/portal-v2/automation/ReadinessSlots';
import { cn } from '@/lib/cn';
import type { Readiness } from '@/lib/portal-v2/automation/types';
import type { AutomationProduct } from '@/lib/portal-v2/automation/types';

/**
 * Bước 2 — chọn sản phẩm để nhân bản.
 *
 * Danh sách ứng viên và điểm sẵn sàng đều do BE trả (`GET /automations/{id}/candidates`),
 * nên ở đây không còn lọc theo lớp hàng hay nút "nới lớp": BE đã quyết ai là
 * ứng viên. FE chấm lại chính là cách hai bên lệch nhau.
 *
 * Thẻ nào thiếu ô phễu vẫn CHỌN ĐƯỢC: bản copy vẫn là draft, và gap được ghi
 * lại kèm theo. Demo cũng vậy — nó chặn ở khâu deploy chứ không chặn khâu tạo.
 * Chặn ngay ở đây thì người dùng mất luôn đường tạo nháp rồi bổ sung sau.
 */
export const ProductPickStep = ({
  masterProduct,
  masterReadiness,
  eligible,
  selected,
  widen,
  onToggleWiden,
  candidatesBusy,
  onToggle,
  onBack,
  onNext,
  cap,
}: {
  masterProduct: AutomationProduct;
  /** Điểm sẵn sàng của chính sản phẩm gốc, do BE chấm cùng lượt ứng viên. */
  masterReadiness: Readiness | null;
  /**
   * Ứng viên KÈM điểm sẵn sàng do BE chấm (`core.AutoSlots`). Không chấm lại ở
   * FE: chép luật sang đây là cách hai bên lệch nhau.
   */
  eligible: (AutomationProduct & { readiness: Readiness })[];
  selected: string[];
  /** Nới lên lớp cha — BE quyết bằng `core.CategoryMatches`, đây chỉ là cờ. */
  widen: boolean;
  onToggleWiden: () => void;
  candidatesBusy: boolean;
  onToggle: (id: string) => void;
  onBack: () => void;
  /** Sang bước review brief — chạy AI thật diễn ra ở bước sau, không phải ở đây. */
  onNext: () => void;
  /** Trần mỗi lượt — nói ra chứ không lặng lẽ cắt bớt danh sách. */
  cap: number;
}) => {
  const t = useTranslations('portalV2.automation');

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-[12.5px] text-[var(--pv2-mut)]'>
          {t('candidatesFrom', {
            master: masterProduct.title,
            count: eligible.length,
          })}
        </span>
        <Button
          variant='toggle'
          size='sm'
          disabled={candidatesBusy}
          onClick={onToggleWiden}
          className={cn(
            widen &&
              'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
          )}
        >
          {candidatesBusy ? (
            <Loader2 className='animate-spin' aria-hidden />
          ) : (
            <Sparkles aria-hidden />
          )}
          {t('widen')}
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
          {masterReadiness ? (
            <div className='mt-2'>
              <ReadinessSlots readiness={masterReadiness} />
            </div>
          ) : null}
        </div>

        {eligible.map(p => {
          const on = selected.includes(p.id);
          const rd = p.readiness;
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
          {t('noCandidates')}
        </div>
      ) : null}

      <div className='flex flex-wrap items-center gap-3'>
        <Button variant='ghost' onClick={onBack}>
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
          disabled={selected.length === 0}
          onClick={onNext}
        >
          {t('next')}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
};
