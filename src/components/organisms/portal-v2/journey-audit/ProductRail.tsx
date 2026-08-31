'use client';

import { ChevronRight, PanelLeftClose } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/cn';
import { scoreColor, scoreSoft } from '@/lib/portal-v2/journey-audit/helpers';
import type { AuditProductRow } from '@/lib/portal-v2/journey-audit/types';

type ProductRailProps = {
  products: AuditProductRow[];
  activeId: string;
  /** true = dữ liệu `/v1/audit/*` thật — note provenance bỏ ngày cứng của
   *  prototype (25 Aug 2026) vốn chỉ đúng cho demo live-case. */
  live: boolean;
  onSelect: (id: string) => void;
  onCollapse: () => void;
};

/** Rail trái: catalog sản phẩm nhóm theo category, collapsible. */
export const ProductRail = ({
  products,
  activeId,
  live,
  onSelect,
  onCollapse,
}: ProductRailProps) => {
  const t = useTranslations('portalV2.journeyAudit');
  const categories = useMemo(() => {
    const byCategory = new Map<string, AuditProductRow[]>();
    products.forEach(product => {
      // Category rỗng (BE chưa có tên danh mục) → nhóm nhãn "Chưa phân loại"
      // thay vì một header trống trơ chevron.
      const key = product.category.trim() || t('uncategorized');
      const list = byCategory.get(key) ?? [];
      list.push(product);
      byCategory.set(key, list);
    });
    return [...byCategory.entries()];
  }, [products, t]);
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <aside className='flex w-[264px] shrink-0 flex-col overflow-y-auto border-r border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3.5 pt-4 pb-6'>
      <div className='mb-2.5 flex items-center gap-2 px-2'>
        <h2 className='flex-1 text-[11px] font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
          {t('productCatalog')}
        </h2>
        <button
          type='button'
          onClick={onCollapse}
          title={t('hidePanel')}
          aria-label={t('hidePanel')}
          className='grid size-6 place-items-center rounded-[var(--pv2-r-sm)] text-[var(--pv2-faint)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
        >
          <PanelLeftClose className='size-3.5' aria-hidden />
        </button>
      </div>

      {categories.map(([category, rows]) => {
        const isOpen = !closed[category];
        return (
          <div key={category} className='mb-1.5'>
            <button
              type='button'
              onClick={() =>
                setClosed(prev => ({ ...prev, [category]: isOpen }))
              }
              className='flex w-full items-center gap-2 rounded-[var(--pv2-r-sm)] p-2 text-[13px] font-semibold text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)]'
            >
              <span className='min-w-0 truncate'>{category}</span>
              <ChevronRight
                className={cn(
                  'ml-auto size-3.5 shrink-0 text-[var(--pv2-faint)] transition-transform',
                  isOpen && 'rotate-90'
                )}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className='pt-0.5 pb-1'>
                {rows.map(product => (
                  <button
                    key={product.id}
                    type='button'
                    onClick={() => onSelect(product.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-[var(--pv2-r-sm)] py-2 pr-2 pl-3.5 text-left transition-colors',
                      product.id === activeId
                        ? 'bg-[var(--pv2-electric-soft)]'
                        : 'hover:bg-[var(--pv2-canvas)]'
                    )}
                  >
                    <span
                      aria-hidden
                      className='grid size-8 shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] text-base'
                    >
                      {product.icon}
                    </span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {product.name}
                      </span>
                      <span className='text-2xs block truncate text-[var(--pv2-faint)]'>
                        {product.sku}
                      </span>
                    </span>
                    <span
                      className='text-2xs ml-auto shrink-0 rounded-[var(--pv2-r-sm)] px-1.5 py-0.5 font-semibold'
                      style={
                        product.score == null
                          ? {
                              color: 'var(--pv2-faint)',
                              background: 'var(--pv2-canvas)',
                            }
                          : {
                              color: scoreColor(product.score),
                              background: scoreSoft(product.score),
                            }
                      }
                    >
                      {product.score ?? '—'}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      <p className='mt-4 rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] p-3 text-xs leading-relaxed text-[var(--pv2-faint)]'>
        <strong className='text-[var(--pv2-mut)]'>
          {t(live ? 'railNoteLiveTitle' : 'railNoteTitle')}
        </strong>{' '}
        {t(live ? 'railNoteLiveBody' : 'railNoteBody')}
      </p>
    </aside>
  );
};
