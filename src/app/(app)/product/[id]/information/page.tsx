'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Download, PaletteIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { AddCategoryDialog } from '@/components/dialogs/AddCategoryDialog';
import { ApiUrlDialog } from '@/components/dialogs/ApiUrlDialog';
import {
  ProductInformationEditor,
  emptyProductInformation,
  toCreatePayload,
  type ProductInformationValue,
} from '@/components/modules/Product/ProductInformationEditor';
import { SaveAsTemplateDialog } from '@/components/modules/Product/SaveAsTemplateDialog';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { BookmarkPlus } from 'lucide-react';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import { normalizeCertifications } from '@/services/rexer/normalizers';
import type { Product, ProductResponse } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

const fromDTO = (
  p: Product,
  categoryName?: string
): ProductInformationValue => ({
  name: p.name,
  category: categoryName ?? '',
  description: p.description ?? '',
  sku: p.sku ?? '',
  sizes: p.sizes ?? [],
  colors: p.colors ?? [],
  variants: [],
  ingredients: p.ingredients ?? [],
  certifications:
    (normalizeCertifications(p.certifications as unknown) as
      | ProductInformationValue['certifications']
      | undefined) ?? [],
});

export default function ProductInformationPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [value, setValue] = React.useState<ProductInformationValue>(() =>
    emptyProductInformation()
  );
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);
  /** Loaded BE product (used as source for "Lưu thành template" dialog). */
  const [loadedProduct, setLoadedProduct] = React.useState<Product | null>(
    null
  );
  const [saveAsOpen, setSaveAsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isNew) return;
    let alive = true;
    setLoading(true);
    rexerApi.products
      .get(id)
      .then((res: ProductResponse) => {
        if (!alive) return;
        setLoadedProduct(res.product);
        setValue(fromDTO(res.product, res.category?.name));
      })
      .catch(err => {
        if (!alive) return;
        toast.error(`Failed to load product: ${rxErrorMessage(err)}`);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  const basePath = `/product/${id}`;
  const productName = value.name || (isNew ? 'Product Name' : 'Untitled');

  const handleSave = async () => {
    if (!value.name.trim()) {
      setNameError('Product name is required');
      toast.error(
        'Product name is required — please fill the highlighted field'
      );
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      if (isNew) {
        const created = await rexerApi.products.create(toCreatePayload(value));
        toast.success('Product created');
        router.push(`/product/${created.product.id}/media`);
      } else {
        await rexerApi.products.update(id, toCreatePayload(value));
        toast.success('Product saved');
        router.push(`${basePath}/media`);
      }
    } catch (err) {
      toast.error(`Save failed: ${rxErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='product'
      section='information'
      actions={
        <>
          <AddCategoryDialog
            trigger={
              <Button variant='pill-light' size='sm'>
                <Plus className='size-3.5' /> Add new category
              </Button>
            }
            onApply={({ categoryName }) => {
              if (categoryName.trim()) {
                setValue(v => ({ ...v, category: categoryName.trim() }));
                toast.success(`Category "${categoryName}" set`);
              }
            }}
          />
          {!isNew && loadedProduct && !loadedProduct.is_template && (
            <Button
              variant='pill-light'
              size='sm'
              type='button'
              onClick={() => setSaveAsOpen(true)}
            >
              <BookmarkPlus className='size-3.5' /> Lưu thành template
            </Button>
          )}
          <Button
            variant='primary'
            size='sm'
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <div className='mx-auto mb-4 flex w-full max-w-[1200px] flex-col gap-1 px-6'>
        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={value.name}
            onChange={e => {
              setValue(v => ({ ...v, name: e.target.value }));
              if (nameError) setNameError(null);
            }}
            placeholder='Product Name'
            disabled={loading}
            aria-invalid={Boolean(nameError)}
            className={
              'bg-muted text-foreground placeholder:text-content-muted flex-1 rounded-lg px-4 py-2 text-sm font-medium outline-none ' +
              (nameError ? 'ring-2 ring-rose-500/60' : '')
            }
          />
          <Button
            variant='pill-light'
            size='sm'
            type='button'
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.click();
            }}
          >
            <Download className='size-3.5' /> Import
          </Button>
          <ApiUrlDialog
            trigger={
              <Button variant='pill-light' size='sm'>
                <PaletteIcon className='size-3.5' /> API
              </Button>
            }
          />
        </div>
        {nameError && (
          <p className='text-xs font-medium text-rose-500'>{nameError}</p>
        )}
      </div>

      <ProductInformationEditor
        value={value}
        onChange={setValue}
        disabled={loading || saving}
      />

      <SaveAsTemplateDialog
        open={saveAsOpen}
        product={loadedProduct}
        onOpenChange={setSaveAsOpen}
      />
    </ProductWorkspaceLayout>
  );
}
