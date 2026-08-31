'use client';

import { Check, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { ProductDetailsPanel } from '@/components/organisms/portal-v2/product/ProductDetailsPanel';
import { ProductRelatedPanel } from '@/components/organisms/portal-v2/product/ProductRelatedPanel';
import { ProductValuePanel } from '@/components/organisms/portal-v2/product/ProductValuePanel';
import { cn } from '@/lib/cn';
import {
  PRODUCT_MODAL_TABS,
  PRODUCT_SOURCE,
} from '@/lib/portal-v2/product/constants';
import { valueFilledCount } from '@/lib/portal-v2/product/helpers';
import type {
  Product,
  ProductAsset,
  ProductCampaignLink,
  ProductExperienceLink,
  ProductModalMode,
  ProductModalTab,
} from '@/lib/portal-v2/product/types';

type ProductModalProps = {
  product: Product;
  mode: ProductModalMode;
  tab: ProductModalTab;
  /** Options dropdown "Loại sản phẩm" — taxonomy `product_categories` của brand. */
  categories: Array<{ id: string; name: string }>;
  /** Tạo loại mới từ popup cạnh dropdown; null = tạo thất bại (đã toast). */
  onCreateCategory: (
    name: string
  ) => Promise<{ id: string; name: string } | null>;
  assets: ProductAsset[];
  assetsHydrated: boolean;
  experiences: ProductExperienceLink[];
  campaigns: ProductCampaignLink[];
  onTabChange: (tab: ProductModalTab) => void;
  onChange: (next: Product) => void;
  onClose: () => void;
  onRequestEdit: () => void;
  onUploadMedia?: (files: File[]) => void;
  onPickFromLibrary?: () => void;
  onPickCover?: () => void;
  uploading?: boolean;
  onSave: () => void;
  onCreate: (status: 'draft' | 'active') => void;
  onDelete: () => void;
  onBuildExperience: () => void;
};

export const ProductModal = ({
  product: p,
  mode,
  tab,
  categories,
  onCreateCategory,
  assets,
  assetsHydrated,
  experiences,
  campaigns,
  onTabChange,
  onChange,
  onClose,
  onRequestEdit,
  onUploadMedia,
  onPickFromLibrary,
  onPickCover,
  uploading,
  onSave,
  onCreate,
  onDelete,
  onBuildExperience,
}: ProductModalProps) => {
  const t = useTranslations('portalV2.products');

  const isNew = mode === 'new';
  const isEdit = mode === 'edit';
  const editing = isNew || isEdit;

  const source = PRODUCT_SOURCE[p.source];
  const valueCount = valueFilledCount(p);

  const visibleTabs = PRODUCT_MODAL_TABS.filter(
    x => !(editing && x.editHidden)
  );
  const activeTab: ProductModalTab = visibleTabs.some(x => x.id === tab)
    ? tab
    : 'details';

  const title = isNew
    ? t('modalNewTitle')
    : isEdit
      ? t('modalEditTitle', { name: p.title })
      : p.title;

  const subtitle = isNew
    ? t('modalNewSub')
    : isEdit
      ? p.source === 'shopify'
        ? t('modalEditSubShopify')
        : t('modalEditSubLocal')
      : t('modalViewSub', {
          brand: p.brand,
          type: p.type,
          variants: p.variants.length,
          source: source.name,
          updated: p.updated,
        });

  const tabCount = (id: ProductModalTab): number | null => {
    if (id === 'value') return valueCount;
    if (id === 'experiences') return isNew ? 0 : experiences.length;
    if (id === 'campaigns') return isNew ? 0 : campaigns.length;
    return null;
  };

  const footer = isNew ? (
    <>
      <Button variant='ghost' onClick={onClose}>
        {t('cancel')}
      </Button>
      <span className='flex-1' />
      <Button variant='ghost' onClick={() => onCreate('draft')}>
        {t('saveAsDraft')}
      </Button>
      <Button variant='primary' onClick={() => onCreate('active')}>
        <Check className='size-[15px]' strokeWidth={2.4} aria-hidden />
        {t('saveProduct')}
      </Button>
    </>
  ) : isEdit ? (
    <>
      <Button variant='ghost' onClick={onClose}>
        {t('cancel')}
      </Button>
      <Button variant='danger' size='sm' onClick={onDelete}>
        <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
        {t('delete')}
      </Button>
      <span className='flex-1' />
      <Button variant='primary' onClick={onSave}>
        <Check className='size-[15px]' strokeWidth={2.4} aria-hidden />
        {t('saveChanges')}
      </Button>
    </>
  ) : (
    <>
      <Button variant='ghost' onClick={onClose}>
        {t('close')}
      </Button>
      <span className='flex-1' />
      <Button variant='ghost' onClick={onRequestEdit}>
        <Pencil className='size-3.5' strokeWidth={2} aria-hidden />
        {t('edit')}
      </Button>
      <Button variant='primary' onClick={onBuildExperience}>
        {t('buildExperience')}
      </Button>
    </>
  );

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={footer}
    >
      <div
        role='tablist'
        aria-label={t('modalTabsAria')}
        className='mb-[18px] flex gap-0.5 overflow-x-auto border-b border-[var(--pv2-hair)]'
      >
        {visibleTabs.map(x => {
          const on = x.id === activeTab;
          const count = tabCount(x.id);
          return (
            <button
              key={x.id}
              type='button'
              role='tab'
              aria-selected={on}
              onClick={() => onTabChange(x.id)}
              className={cn(
                'flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-semibold transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                on
                  ? 'border-[var(--pv2-electric)] text-[var(--pv2-electric)]'
                  : 'border-transparent text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
              )}
            >
              {t(x.labelKey)}
              {count !== null ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[9.5px] font-bold',
                    x.id === 'value' && count === 0
                      ? 'bg-[var(--pv2-warning)] text-[var(--pv2-paper)]'
                      : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
                  )}
                >
                  {x.id === 'value' && count === 0 ? '!' : count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div role='tabpanel'>
        {activeTab === 'details' ? (
          <ProductDetailsPanel
            categories={categories}
            onCreateCategory={onCreateCategory}
            onUploadMedia={onUploadMedia}
            onPickFromLibrary={onPickFromLibrary}
            onPickCover={onPickCover}
            uploading={uploading}
            product={p}
            assets={assets}
            assetsHydrated={assetsHydrated}
            editing={editing}
            isNew={isNew}
            onChange={onChange}
            onRequestEdit={onRequestEdit}
          />
        ) : null}
        {activeTab === 'value' ? (
          <ProductValuePanel
            product={p}
            editing={editing}
            onChange={onChange}
          />
        ) : null}
        {activeTab === 'experiences' ? (
          <ProductRelatedPanel
            kind='experiences'
            product={p}
            experiences={experiences}
            campaigns={campaigns}
          />
        ) : null}
        {activeTab === 'campaigns' ? (
          <ProductRelatedPanel
            kind='campaigns'
            product={p}
            experiences={experiences}
            campaigns={campaigns}
          />
        ) : null}
      </div>
    </Modal>
  );
};
