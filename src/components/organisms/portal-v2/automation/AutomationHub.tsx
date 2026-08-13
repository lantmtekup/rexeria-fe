'use client';

import { ExternalLink, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import type {
  AutomationExperience,
  AutomationProduct,
} from '@/lib/portal-v2/automation/types';
import { masterCanvasHrefById } from '@/services/portal-v2/automationV2';
import type { RxAutomation } from '@/services/rexer-v2/types/automation';

const STATUS_KEY: Record<string, string> = {
  drafting: 'statusDrafting',
  ready: 'statusReady',
  running: 'statusRunning',
  done: 'statusDone',
};

/**
 * Hub — mọi thiết kế đã đánh dấu Proven, sẵn sàng nhân bản.
 *
 * Cột bằng chứng đứng CẠNH dấu Proven chứ không thay nó: Proven là lựa chọn
 * của người dùng, còn lift là số đo. Thiết kế chưa chạy lần nào hiện "chưa đo"
 * thay vì 0% — một con số 0 ở đây đọc như "chạy rồi mà không ăn thua".
 */
export const AutomationHub = ({
  experiences,
  runs,
  products,
  locked,
  error,
  onStart,
}: {
  experiences: AutomationExperience[];
  /**
   * Automation đã tạo (từ `GET /automations` — cùng lượt gọi với `experiences`,
   * BE trả sẵn). Trước đây field này bị bỏ hoàn toàn ở FE: chạy Run xong,
   * "Queued" chỉ hiện một lần rồi mất — rời trang là hết đường xem lại các
   * draft đã tạo. Đây là chỗ neo lại lâu dài, không phụ thuộc trạng thái tạm
   * của wizard.
   */
  runs: RxAutomation[];
  /** Để tra tên sản phẩm cho từng automation — Automation không tự mang tên. */
  products: AutomationProduct[];
  /**
   * Gói tài khoản chưa mở Automation (403 CAPABILITY_REQUIRED). Tách khỏi
   * `error` vì đây không phải hỏng hóc — hiện dòng đỏ ở đây là nói sai.
   */
  locked?: boolean;
  /** Lỗi nạp thư viện — nói thẳng, đừng để hiện "chưa có gì" cho một lần hỏng. */
  error?: string | null;
  onStart: (id: string) => void;
}) => {
  const t = useTranslations('portalV2.automation');
  // Từ vựng vehicle/objective do module Experiences sở hữu — dịch bằng namespace
  // của nó thay vì nhân đôi khoá sang `automation`.
  const tExp = useTranslations('portalV2.experiences');
  const proven = experiences.filter(x => x.proven);

  if (locked) {
    return (
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-5 py-10 text-center text-[13px] text-[var(--pv2-mut)]'>
        {t('locked')}
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-5 py-10 text-center text-[13px] text-[var(--pv2-error)]'>
        {error}
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {runs.length > 0 ? (
        <div className='flex flex-col gap-2'>
          <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
            {t('runsTitle')}
          </span>
          {runs.map(run => {
            const product = products.find(p => p.id === run.setup_product_id);
            return (
              <div
                key={run.id}
                className='flex flex-wrap items-center gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'
              >
                <span className='flex min-w-0 flex-1 flex-col'>
                  <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {product?.title ?? run.setup_product_id}
                  </span>
                  <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                    {t(STATUS_KEY[run.status] ?? 'statusDrafting')}
                  </span>
                </span>
                {run.master_page_id ? (
                  <Link
                    href={masterCanvasHrefById(run.master_page_id)}
                    className='inline-flex shrink-0 items-center gap-1 text-[12px] text-[var(--pv2-electric)] hover:underline'
                  >
                    {t('openMaster')}
                    <ExternalLink className='size-3' aria-hidden />
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {proven.length === 0 ? (
        <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-5 py-10 text-center text-[13px] text-[var(--pv2-mut)]'>
          {t('hubEmpty')}
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          {proven.map(x => (
            <div
              key={x.id}
              className='flex flex-wrap items-center gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'
            >
              <span
                aria-hidden
                className='size-11 shrink-0 rounded-[var(--pv2-r-sm)]'
                style={{ background: x.gradient }}
              />

              <span className='flex min-w-0 flex-1 flex-col'>
                <span className='truncate text-[14px] font-semibold text-[var(--pv2-ink)]'>
                  {x.name}
                </span>
                <span className='truncate text-[12px] text-[var(--pv2-mut)]'>
                  {tExp(x.categoryKey)} · {tExp(x.objectiveKey)}
                </span>
              </span>

              <span className='flex shrink-0 flex-col items-end'>
                <span className='text-[12px] font-semibold text-[var(--pv2-ink)]'>
                  {x.lift === null
                    ? t('notMeasured')
                    : t('liftVsControl', {
                        pct: `${x.lift >= 0 ? '+' : '−'}${Math.abs(Math.round(x.lift * 100))}`,
                      })}
                </span>
                <span className='text-[11px] text-[var(--pv2-faint)]'>
                  {t(`evidence.${x.evidence}`)}
                </span>
              </span>

              <Button variant='primary' size='sm' onClick={() => onStart(x.id)}>
                <Wand2 aria-hidden />
                {t('automate')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
