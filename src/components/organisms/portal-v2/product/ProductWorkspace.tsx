'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { EmptyState } from '@/components/molecules/portal-v2/product-form';
import { AddProductModal } from '@/components/organisms/portal-v2/product/AddProductModal';
import { DeleteProductModal } from '@/components/organisms/portal-v2/product/DeleteProductModal';
import { ProductBulkBar } from '@/components/organisms/portal-v2/product/ProductBulkBar';
import { ProductGrid } from '@/components/organisms/portal-v2/product/ProductGrid';
import { ProductModal } from '@/components/organisms/portal-v2/product/ProductModal';
import { ProductTable } from '@/components/organisms/portal-v2/product/ProductTable';
import { ProductToolbar } from '@/components/organisms/portal-v2/product/ProductToolbar';
import {
  PRODUCT_DEFAULT_FILTERS,
  PRODUCT_STATUS,
} from '@/lib/portal-v2/product/constants';
import {
  duplicateProduct,
  normalizeProductDraft,
  readiness,
  slugifyHandle,
  uniqueHandle,
  visibleProducts,
} from '@/lib/portal-v2/product/helpers';
import {
  MOCK_PRODUCTS,
  MOCK_PRODUCT_ASSETS,
  MOCK_PRODUCT_CAMPAIGN_LINKS,
  MOCK_PRODUCT_EXPERIENCE_LINKS,
  blankProduct,
  cloneProduct,
  cloneProducts,
} from '@/lib/portal-v2/product/mock';
import type {
  Product,
  ProductFilters,
  ProductModalMode,
  ProductModalTab,
  ProductStatus,
} from '@/lib/portal-v2/product/types';

type ModalState =
  | { kind: 'product'; id: string; mode: ProductModalMode }
  | { kind: 'add' }
  | { kind: 'delete'; ids: string[] }
  | null;

export const ProductWorkspace = () => {
  const t = useTranslations('portalV2.products');

  const [products, setProducts] = useState<Product[]>(() =>
    cloneProducts(MOCK_PRODUCTS)
  );
  const [filters, setFilters] = useState<ProductFilters>(
    PRODUCT_DEFAULT_FILTERS
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [modalTab, setModalTab] = useState<ProductModalTab>('details');

  const assets = MOCK_PRODUCT_ASSETS;
  const list = useMemo(
    () => visibleProducts(products, filters),
    [products, filters]
  );

  const statusTabs = useMemo(
    () => [
      { id: 'all', label: t('tabAll'), count: products.length },
      ...(Object.keys(PRODUCT_STATUS) as ProductStatus[]).map(k => ({
        id: k,
        label: PRODUCT_STATUS[k].name,
        count: products.filter(p => p.status === k).length,
      })),
    ],
    [products, t]
  );

  const patchFilters = (partial: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
    /* An unset facet means ANY — and a changed facet invalidates the selection. */
    if (!('view' in partial)) setSelected([]);
  };

  const closeModal = () => {
    setModal(null);
    setDraft(null);
    setModalTab('details');
  };

  /* ── Index actions ─────────────────────────────────────────────────── */

  const openProduct = (id: string) => {
    setModalTab('details');
    setDraft(null);
    setModal({ kind: 'product', id, mode: 'view' });
  };

  const openEdit = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    setModalTab(prev =>
      prev === 'details' || prev === 'value' ? prev : 'details'
    );
    setDraft(cloneProduct(product));
    setModal({ kind: 'product', id, mode: 'edit' });
  };

  const openNew = () => {
    setModalTab('details');
    setDraft(blankProduct());
    setModal({ kind: 'product', id: 'new', mode: 'new' });
  };

  const handleDuplicate = (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const copy = duplicateProduct(product, products);
    setProducts(prev => [copy, ...prev]);
    setFilters(PRODUCT_DEFAULT_FILTERS);
    setSelected([]);
    toast.success(t('toastDuplicated', { name: copy.title }));
  };

  const confirmDelete = () => {
    if (modal?.kind !== 'delete') return;
    const ids = new Set(modal.ids);
    const count = modal.ids.length;
    setProducts(prev => prev.filter(p => !ids.has(p.id)));
    setSelected(prev => prev.filter(id => !ids.has(id)));
    closeModal();
    toast.success(t('toastDeleted', { count }));
  };

  /* ── Modal actions ─────────────────────────────────────────────────── */

  const handleSave = () => {
    if (!draft || modal?.kind !== 'product') return;
    const cleaned = normalizeProductDraft(draft);
    if (!cleaned.title) {
      toast.error(t('toastNeedsTitle'));
      return;
    }
    cleaned.updated = 'just now';
    window.alert(JSON.stringify(cleaned, null, 2));
    setProducts(prev => prev.map(p => (p.id === cleaned.id ? cleaned : p)));
    closeModal();
    toast.success(t('toastSaved', { name: cleaned.title }));
  };

  const handleCreate = (status: 'draft' | 'active') => {
    if (!draft) return;
    const cleaned = normalizeProductDraft(draft);
    if (!cleaned.title) {
      toast.error(t('toastNeedsTitle'));
      return;
    }
    /* Mint the id from the list length, not Date.now() — no hydration drift. */
    cleaned.id = `p${products.length + 1}-${slugifyHandle(cleaned.title).slice(0, 12)}`;
    cleaned.handle = uniqueHandle(
      cleaned.handle || slugifyHandle(cleaned.title),
      products
    );
    cleaned.status = status;
    cleaned.updated = 'just now';
    window.alert(JSON.stringify(cleaned, null, 2));
    setProducts(prev => [cleaned, ...prev]);
    setFilters(PRODUCT_DEFAULT_FILTERS);
    setSelected([]);
    closeModal();
    toast.success(
      t('toastCreated', {
        name: cleaned.title,
        score: readiness(cleaned, assets).score,
      })
    );
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  const activeProduct =
    modal?.kind === 'product'
      ? (draft ?? products.find(p => p.id === modal.id) ?? null)
      : null;

  const deleteItems =
    modal?.kind === 'delete'
      ? products.filter(p => modal.ids.includes(p.id))
      : [];

  return (
    <div className='flex min-h-0 flex-col'>
      <div className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('subtitle')}
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2 pb-0.5'>
            <Button
              variant='ghost'
              onClick={() =>
                toast.success(t('toastExported', { count: products.length }))
              }
            >
              {t('export')}
            </Button>
            <Button variant='primary' onClick={() => setModal({ kind: 'add' })}>
              <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
              {t('addProduct')}
            </Button>
          </div>
        </div>
      </div>

      <div className='sticky top-0 z-10 bg-[var(--pv2-paper)]'>
        <div className='mx-auto w-full px-5 md:px-8'>
          <Tabs
            items={statusTabs}
            value={filters.status}
            onChange={id =>
              patchFilters({ status: id as ProductFilters['status'] })
            }
            aria-label={t('statusTabsAria')}
          />
        </div>
      </div>

      <div className='mx-auto w-full px-5 py-6 md:px-8'>
        <ProductToolbar filters={filters} onChange={patchFilters} />

        {selected.length ? (
          <ProductBulkBar
            count={selected.length}
            onPublish={() => toast.success(t('toastPublished'))}
            onAddTags={() => toast.success(t('toastTagsAdded'))}
            onArchive={() => toast.success(t('toastArchived'))}
            onDelete={() => setModal({ kind: 'delete', ids: selected })}
            onClear={() => setSelected([])}
          />
        ) : null}

        {!list.length ? (
          <EmptyState title={t('emptyTitle')}>{t('emptyBody')}</EmptyState>
        ) : filters.view === 'grid' ? (
          <ProductGrid
            products={list}
            assets={assets}
            onOpen={openProduct}
            onEdit={openEdit}
            onDuplicate={handleDuplicate}
            onDelete={id => setModal({ kind: 'delete', ids: [id] })}
          />
        ) : (
          <ProductTable
            products={list}
            assets={assets}
            selected={selected}
            onToggleSelect={id =>
              setSelected(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
              )
            }
            onToggleAll={() =>
              setSelected(prev =>
                prev.length === list.length ? [] : list.map(p => p.id)
              )
            }
            onOpen={openProduct}
            onEdit={openEdit}
            onDuplicate={handleDuplicate}
            onDelete={id => setModal({ kind: 'delete', ids: [id] })}
          />
        )}
      </div>

      {modal?.kind === 'product' && activeProduct ? (
        <ProductModal
          product={activeProduct}
          mode={modal.mode}
          tab={modalTab}
          assets={assets}
          experiences={MOCK_PRODUCT_EXPERIENCE_LINKS.filter(
            e => e.productId === activeProduct.id
          )}
          campaigns={MOCK_PRODUCT_CAMPAIGN_LINKS.filter(
            c => c.productId === activeProduct.id
          )}
          onTabChange={setModalTab}
          onChange={setDraft}
          onClose={closeModal}
          onRequestEdit={() => openEdit(activeProduct.id)}
          onSave={handleSave}
          onCreate={handleCreate}
          onDelete={() => setModal({ kind: 'delete', ids: [activeProduct.id] })}
          onBuildExperience={() => toast.message(t('toastBuildExperience'))}
        />
      ) : null}

      {modal?.kind === 'add' ? (
        <AddProductModal onClose={closeModal} onAddManually={openNew} />
      ) : null}

      {modal?.kind === 'delete' && deleteItems.length ? (
        <DeleteProductModal
          items={deleteItems}
          onClose={closeModal}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
};
