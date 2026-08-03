'use client';

import { FileText, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  SectionBox,
  TonePill,
} from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import { CSV_COLUMN_MAP } from '@/lib/portal-v2/product/constants';

type AddProductModalProps = {
  onClose: () => void;
  onAddManually: () => void;
};

const Way = ({
  icon,
  iconBg,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(
      'flex cursor-pointer flex-col gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
      'bg-[var(--pv2-paper)] p-3.5 text-left transition-[border-color,transform]',
      'hover:-translate-y-0.5 hover:border-[var(--pv2-electric)]',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
    )}
  >
    <span
      className='grid size-9 place-items-center rounded-[10px] text-[15px] font-bold text-[var(--pv2-paper)]'
      style={{ background: iconBg }}
    >
      {icon}
    </span>
    <span className='font-[family-name:var(--pv2-disp)] text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
      {title}
    </span>
    <span className='text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
      {description}
    </span>
  </button>
);

export const AddProductModal = ({
  onClose,
  onAddManually,
}: AddProductModalProps) => {
  const t = useTranslations('portalV2.products');

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('addTitle')}
      subtitle={t('addSub')}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='ghost'
            onClick={() => toast.message(t('toastSampleCsv'))}
          >
            {t('downloadSampleCsv')}
          </Button>
          <Button
            variant='primary'
            onClick={() => toast.success(t('toastImported'))}
          >
            {t('importProducts')}
          </Button>
        </>
      }
    >
      <div className='grid gap-2.5 sm:grid-cols-3'>
        <Way
          icon='S'
          iconBg='var(--pv2-success)'
          title={t('waySyncTitle')}
          description='Connect your store once. Products, variants, inventory, and media stay in sync both ways.'
          onClick={() => toast.success(t('toastShopifyConnected'))}
        />
        <Way
          icon={
            <FileText className='size-[17px]' strokeWidth={2} aria-hidden />
          }
          iconBg='var(--pv2-blue-500)'
          title={t('wayCsvTitle')}
          description='Standard Shopify product CSV. Same 51 columns, same handle-per-row rules.'
          onClick={() => toast.message(t('toastChooseCsv'))}
        />
        <Way
          icon={<Plus className='size-[17px]' strokeWidth={2.6} aria-hidden />}
          iconBg='var(--pv2-violet)'
          title={t('wayManualTitle')}
          description='One product, entered by hand. Best for a single hero SKU you are testing.'
          onClick={onAddManually}
        />
      </div>

      <SectionBox
        className='mt-4'
        title={t('columnMapping')}
        action={
          <TonePill
            bg='color-mix(in srgb, var(--pv2-success) 12%, transparent)'
            fg='color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))'
          >
            <span className='size-1.5 rounded-full bg-[var(--pv2-success)]' />
            {t('allRequiredFound')}
          </TonePill>
        }
      >
        <p className='mb-3 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
          {t.rich('columnMappingHint', {
            b: chunks => (
              <b className='font-semibold text-[var(--pv2-ink)]'>{chunks}</b>
            ),
          })}
        </p>
        <div className='flex flex-col'>
          {CSV_COLUMN_MAP.map(row => (
            <div
              key={row.column}
              className='grid grid-cols-[1fr_20px_1fr] items-center gap-2 border-b border-[var(--pv2-hair)] py-[7px] text-[12px] last:border-b-0'
            >
              <span className='flex min-w-0 flex-wrap items-center gap-1.5'>
                <span className='rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--pv2-ink)]'>
                  {row.column}
                </span>
                {row.required ? (
                  <span className='text-[9.5px] font-bold text-[var(--pv2-error)]'>
                    {t('required')}
                  </span>
                ) : null}
              </span>
              <span className='text-center text-[var(--pv2-faint)]'>→</span>
              <span className='flex min-w-0 items-center gap-1.5 text-[var(--pv2-mut)]'>
                {row.field}
                <span className='text-[var(--pv2-success)]'>✓</span>
              </span>
            </div>
          ))}
        </div>
      </SectionBox>

      <div className='mt-4 rounded-[var(--pv2-r)] bg-[var(--pv2-electric-soft)] px-4 py-3.5'>
        <p className='text-[9.5px] font-bold tracking-[0.08em] text-[var(--pv2-electric)] uppercase'>
          ✦ {t('afterImport')}
        </p>
        <h3 className='mt-1.5 font-[family-name:var(--pv2-disp)] text-[14px] font-semibold text-[var(--pv2-ink)]'>
          {t('afterImportTitle')}
        </h3>
        <p className='mt-1 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('afterImportBody')}
        </p>
      </div>
    </Modal>
  );
};
