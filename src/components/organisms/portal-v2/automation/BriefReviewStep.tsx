'use client';

import { ArrowLeft, ExternalLink, Loader2, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';
import type { AiBrandBrief } from '@/lib/ai-brief/types';
import type { AutomationProduct } from '@/lib/portal-v2/automation/types';
import type {
  RxAutomationRunItem,
  RxAutomationRunSkip,
} from '@/services/rexer-v2/types/automation';

/**
 * Bước 3 — review "brief cho AI" trước khi chạy thật.
 *
 * Gộp những gì hệ thống ĐÃ có (brand: logo/màu/font/tone, product: mô tả/lợi
 * ích/khẳng định) thành một bản tóm tắt để AI viết đúng giọng, đúng sản phẩm —
 * thay vì chỉ nhận id rồi tự đoán. Không sửa được ở đây: brand sửa ở màn
 * Brand riêng, sản phẩm sửa ở màn Sản phẩm — bước này chỉ soát lại trước khi
 * gửi, và cho gõ thêm định hướng tự do.
 */
export const BriefReviewStep = ({
  masterProduct,
  selectedProducts,
  brandBrief,
  note,
  onNoteChange,
  onBack,
  onRun,
  cap,
  queued,
  skipped,
  runError,
  running,
}: {
  masterProduct: AutomationProduct;
  selectedProducts: AutomationProduct[];
  brandBrief: AiBrandBrief | null;
  note: string;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onRun: () => void;
  cap: number;
  queued: RxAutomationRunItem[] | null;
  skipped: RxAutomationRunSkip[] | null;
  runError: string | null;
  running: boolean;
}) => {
  const t = useTranslations('portalV2.automation');
  const hasBrand = Boolean(
    brandBrief &&
    (brandBrief.name ||
      brandBrief.logo_url ||
      brandBrief.colors?.length ||
      brandBrief.fonts ||
      brandBrief.tone?.length)
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5'>
        <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
          {t('briefBrandTitle')}
        </h3>
        {hasBrand && brandBrief ? (
          <div className='mt-2.5 flex flex-col gap-2.5'>
            <div className='flex items-center gap-2.5'>
              {brandBrief.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandBrief.logo_url}
                  alt={brandBrief.name ?? ''}
                  className='size-8 shrink-0 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] object-contain'
                />
              ) : null}
              <div className='flex min-w-0 flex-col'>
                {brandBrief.name ? (
                  <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {brandBrief.name}
                  </span>
                ) : null}
                {brandBrief.tagline ? (
                  <span className='truncate text-[11.5px] text-[var(--pv2-mut)]'>
                    {brandBrief.tagline}
                  </span>
                ) : null}
              </div>
            </div>

            {brandBrief.colors?.length ? (
              <div className='flex flex-wrap items-center gap-1.5'>
                {brandBrief.colors.map(c => (
                  <span
                    key={c.role + c.hex}
                    className='flex items-center gap-1 rounded-full border border-[var(--pv2-hair)] py-0.5 pr-2 pl-0.5 text-[11px] text-[var(--pv2-mut)]'
                  >
                    <span
                      aria-hidden
                      className='size-3.5 rounded-full border border-[var(--pv2-hair)]'
                      style={{ background: c.hex }}
                    />
                    {c.role}
                  </span>
                ))}
              </div>
            ) : null}

            {brandBrief.fonts?.display || brandBrief.fonts?.body ? (
              <span className='text-[11.5px] text-[var(--pv2-mut)]'>
                {t('briefFonts')}:{' '}
                {[brandBrief.fonts.display, brandBrief.fonts.body]
                  .filter(Boolean)
                  .join(' / ')}
              </span>
            ) : null}

            {brandBrief.tone?.length ? (
              <div className='flex flex-wrap gap-1.5'>
                {brandBrief.tone.map(tone => (
                  <span
                    key={tone}
                    className='rounded-full bg-[var(--pv2-canvas)] px-2 py-0.5 text-[11px] text-[var(--pv2-mut)]'
                  >
                    {tone}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <p className='mt-1.5 text-[12px] text-[var(--pv2-mut)]'>
            {t('briefBrandEmpty')}
          </p>
        )}
      </div>

      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5'>
        <h3 className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
          {t('briefProductTitle')}
        </h3>
        <div className='mt-2.5 flex items-center gap-2.5'>
          <span
            aria-hidden
            className='size-8 shrink-0 rounded-[var(--pv2-r-sm)]'
            style={{ background: masterProduct.gradient }}
          />
          <div className='flex min-w-0 flex-col'>
            <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
              {masterProduct.title}
            </span>
            {masterProduct.body ? (
              <span className='line-clamp-1 text-[11.5px] text-[var(--pv2-mut)]'>
                {masterProduct.body}
              </span>
            ) : null}
          </div>
        </div>

        {selectedProducts.length ? (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {selectedProducts.map(p => (
              <span
                key={p.id}
                className='rounded-full bg-[var(--pv2-canvas)] px-2 py-0.5 text-[11px] text-[var(--pv2-mut)]'
              >
                {p.title}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className='flex flex-col gap-1.5'>
        <label
          htmlFor='automation-brief-note'
          className='text-[12.5px] font-medium text-[var(--pv2-ink)]'
        >
          {t('briefNoteLabel')}
        </label>
        <textarea
          id='automation-brief-note'
          value={note}
          onChange={e => onNoteChange(e.target.value)}
          placeholder={t('briefNotePlaceholder')}
          rows={3}
          className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2 text-[13px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] focus:border-[var(--pv2-electric)]'
        />
      </div>

      {queued ? (
        <div className='flex flex-col gap-1.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'>
          <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
            {t('runQueued', { total: queued.length })}
          </span>
          <span className='text-[12px] text-[var(--pv2-mut)]'>
            {t('runQueuedNote')}
          </span>
          {queued.map(item => (
            <span
              key={item.page_id}
              className='flex flex-wrap items-center gap-1.5 text-[12px] text-[var(--pv2-mut)]'
            >
              <span>
                {item.product_id}
                {item.auto_gaps.length > 0
                  ? ` · ${t('queuedGaps', { gaps: item.auto_gaps.join(', ') })}`
                  : ''}
              </span>
              <Link
                href={`/portal-v2/${encodeURIComponent(item.page_id)}/canvas`}
                className='inline-flex items-center gap-1 text-[var(--pv2-electric)] hover:underline'
              >
                {t('openDraft')}
                <ExternalLink className='size-3' aria-hidden />
              </Link>
            </span>
          ))}
        </div>
      ) : null}

      {skipped && skipped.length > 0 ? (
        <div className='flex flex-col gap-1.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 py-3'>
          <span className='text-[13px] font-semibold text-[var(--pv2-error)]'>
            {t('runSkipped', { total: skipped.length })}
          </span>
          <span className='text-[12px] text-[var(--pv2-mut)]'>
            {t('runSkippedNote')}
          </span>
          {skipped.map(item => (
            <span
              key={item.product_id}
              className='text-[12px] text-[var(--pv2-mut)]'
            >
              {item.product_id} ·{' '}
              {item.reason === 'no_product_image'
                ? t('runSkipReasonNoProductImage')
                : item.reason}
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
          {t('toGenerate', { n: selectedProducts.length })}
          {selectedProducts.length > cap ? ` · ${t('capNote', { cap })}` : ''}
        </span>
        <span className='flex-1' />
        <Button variant='primary' disabled={running} onClick={onRun}>
          {running ? (
            <Loader2 className={cn('animate-spin')} aria-hidden />
          ) : (
            <Wand2 aria-hidden />
          )}
          {running ? t('running') : t('automate')}
        </Button>
      </div>
    </div>
  );
};
