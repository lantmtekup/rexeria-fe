'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { TextInput } from '@/components/molecules/portal-v2/brand-form';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';

type AddItemModalProps = {
  /** Catalogue rows not already attached to this campaign. */
  products: { id: string; name: string }[];
  onClose: () => void;
  onAddProduct: (productId: string) => void;
  onAddTopic: (name: string) => void;
};

/**
 * "Add to this campaign" — a SKU from the catalogue, or a topic with no SKU
 * behind it (plan: "hạng mục (sản phẩm SKU hoặc topic)").
 */
export const AddItemModal = ({
  products,
  onClose,
  onAddProduct,
  onAddTopic,
}: AddItemModalProps) => {
  const t = useTranslations('portalV2.campaigns');
  const [topic, setTopic] = useState('');

  const submitTopic = () => {
    const name = topic.trim();
    if (!name) return;
    onAddTopic(name);
    setTopic('');
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('addItemTitle')}
      subtitle={t('addItemSub')}
      footer={
        <Button variant='ghost' onClick={onClose}>
          {t('close')}
        </Button>
      }
    >
      {products.length ? (
        <div className='mb-5 grid gap-2 sm:grid-cols-2'>
          {products.map(product => (
            <button
              key={product.id}
              type='button'
              onClick={() => onAddProduct(product.id)}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-left transition-colors',
                'border-[var(--pv2-hair)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
              )}
            >
              <Plus
                className='size-3.5 shrink-0 text-[var(--pv2-electric)]'
                strokeWidth={2.4}
                aria-hidden
              />
              <span className='min-w-0 truncate text-[12.5px] font-medium text-[var(--pv2-ink)]'>
                {product.name}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState title={t('addItemNoProducts')}>
          {t('addItemNoProductsBody')}
        </EmptyState>
      )}

      <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] px-4 py-3.5'>
        <p className='mb-2 text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
          {t('addTopicTitle')}
        </p>
        <p className='mb-3 text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('addTopicHint')}
        </p>
        <div className='flex flex-wrap items-center gap-2'>
          <TextInput
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitTopic();
              }
            }}
            placeholder={t('addTopicPlaceholder')}
            className='min-w-[200px] flex-1'
          />
          <Button
            variant='primary'
            onClick={submitTopic}
            disabled={!topic.trim()}
          >
            {t('addTopic')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
