'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Package, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { ProductPickerDialog } from '@/components/modules/CanvasTemplate/block-editor/ProductPickerDialog';
import {
  ProductInformationEditor,
  emptyProductInformation,
  toCreatePayload,
  type ProductInformationValue,
} from '@/components/modules/Product/ProductInformationEditor';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Product } from '@/services/rexer/types';

interface PageProps {
  params: Promise<{ productId: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

const fromProduct = (
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
  certifications: p.certifications ?? [],
});

export default function AiAgentsInformationPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const isNew =
    productId === 'new-product' || productId === 'new' || productId === '';
  const basePath = `/ai-agents/${productId}`;

  const [value, setValue] = React.useState<ProductInformationValue>(
    emptyProductInformation
  );
  const [hint, setHint] = React.useState('');
  const [loading, setLoading] = React.useState(!isNew);
  const [enriching, setEnriching] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  /**
   * When the user picks an existing product from the library, we PATCH that
   * product on Continue instead of creating a new one. `null` = no pick yet,
   * fall back to the URL-based behavior (create when isNew, update otherwise).
   */
  const [pickedProductId, setPickedProductId] = React.useState<string | null>(
    null
  );
  const [pickedProductName, setPickedProductName] = React.useState<
    string | null
  >(null);

  const handlePickExisting = (p: Product, categoryName?: string) => {
    setValue(fromProduct(p, categoryName));
    setPickedProductId(p.id);
    setPickedProductName(p.name);
    toast.success(`Đã chọn sản phẩm "${p.name}" — sẽ cập nhật khi tiếp tục`);
  };

  const handleClearPick = () => {
    setPickedProductId(null);
    setPickedProductName(null);
    setValue(emptyProductInformation);
    toast.info('Đã bỏ chọn — quay lại tạo sản phẩm mới');
  };

  React.useEffect(() => {
    if (isNew) return;
    let alive = true;
    setLoading(true);
    rexerApi.products
      .get(productId)
      .then(res => {
        if (!alive) return;
        setValue(fromProduct(res.product, res.category?.name));
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
  }, [productId, isNew]);

  const handleEnrich = async () => {
    if (!value.name.trim()) {
      toast.error('Enter a product name first');
      return;
    }
    setEnriching(true);
    try {
      const res = await rexerApi.ai.productEnrich({
        name: value.name.trim(),
        hint: hint.trim() || undefined,
      });
      setValue(v => ({
        ...v,
        description: res.description || v.description,
        // BE returns ProductFeature[] — append to existing without dupes by label.
        certifications: v.certifications,
        ingredients: v.ingredients,
        // We surface features into both the dedicated list (when editor supports)
        // and as suggested tags below.
      }));
      // Show suggested tags as a toast trail so the user can copy ideas back.
      if (res.suggested_tags?.length) {
        toast.success(
          `AI suggested ${res.suggested_tags.length} tags — see panel`
        );
      } else {
        toast.success('AI fields filled');
      }
    } catch (err) {
      toast.error(`AI enrich failed: ${rxErrorMessage(err)}`);
    } finally {
      setEnriching(false);
    }
  };

  const handleContinue = async () => {
    if (!value.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      let nextId: string;
      if (pickedProductId) {
        // User picked an existing product → PATCH it (skip create), even if
        // the URL still says "new-product".
        await rexerApi.products.update(pickedProductId, toCreatePayload(value));
        nextId = pickedProductId;
        toast.success('Đã cập nhật sản phẩm');
      } else if (isNew) {
        const created = await rexerApi.products.create(toCreatePayload(value));
        nextId = created.product.id;
        toast.success('Đã tạo sản phẩm');
      } else {
        await rexerApi.products.update(productId, toCreatePayload(value));
        nextId = productId;
        toast.success('Đã lưu');
      }
      // Stay within "01 Product" step → next sub-tab is Media.
      router.push(`/ai-agents/${nextId}/media`);
    } catch (err) {
      toast.error(`Save failed: ${rxErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={value.name || 'New Product'}
      scope='ai-agents'
      section='information'
      actions={
        <Button
          variant='primary'
          size='sm'
          onClick={handleContinue}
          disabled={saving || loading}
        >
          {saving
            ? 'Saving…'
            : pickedProductId
              ? 'Cập nhật & Continue'
              : isNew
                ? 'Tạo & Continue'
                : 'Lưu & Continue'}
          <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      <div className='mx-auto mb-4 flex w-full max-w-[1200px] flex-col gap-3 px-6'>
        {isNew && !pickedProductId && (
          <div className='border-border bg-muted/40 flex flex-col gap-2 rounded-xl border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-2'>
              <Package className='text-muted-foreground mt-0.5 size-4 shrink-0' />
              <div>
                <p className='text-foreground text-sm font-medium'>
                  Đã có sản phẩm trong thư viện?
                </p>
                <p className='text-muted-foreground text-xs'>
                  Chọn 1 sản phẩm có sẵn — tên, mô tả, size, màu, tiện ích sẽ
                  được điền tự động.
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPickerOpen(true)}
              disabled={loading || saving}
            >
              <Package className='size-3.5' />
              Chọn sản phẩm có sẵn
            </Button>
          </div>
        )}

        {isNew && pickedProductId && (
          <div className='flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-start gap-2'>
              <Package className='mt-0.5 size-4 shrink-0 text-emerald-600' />
              <div>
                <p className='text-sm font-medium text-emerald-900'>
                  Đang chỉnh sửa sản phẩm có sẵn:{' '}
                  <span className='font-semibold'>{pickedProductName}</span>
                </p>
                <p className='text-xs text-emerald-700/80'>
                  Khi nhấn Continue sẽ cập nhật product này (
                  <span className='font-mono'>
                    PATCH /products/{pickedProductId.slice(0, 8)}…
                  </span>
                  ), không tạo bản mới.
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPickerOpen(true)}
                disabled={loading || saving}
              >
                Đổi sản phẩm
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleClearPick}
                disabled={loading || saving}
                className='text-emerald-700 hover:text-emerald-900'
              >
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        <div className='flex items-center gap-2'>
          <input
            type='text'
            value={value.name}
            onChange={e => setValue(v => ({ ...v, name: e.target.value }))}
            placeholder='Product name'
            disabled={loading}
            className='bg-muted text-foreground placeholder:text-content-muted flex-1 rounded-lg px-4 py-2 text-sm font-medium outline-none'
          />
        </div>

        <div className='border-border bg-background flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label className='text-muted-foreground text-xs font-semibold'>
              Optional hint for AI (target audience, tone, key benefit…)
            </label>
            <input
              type='text'
              value={hint}
              onChange={e => setHint(e.target.value)}
              placeholder='e.g. premium running shoe for marathon athletes'
              disabled={enriching}
              className='border-input mt-1 h-10 w-full rounded-md border bg-transparent px-3 text-sm outline-none'
            />
          </div>
          <Button
            variant='ai'
            size='md'
            onClick={handleEnrich}
            disabled={enriching || loading || !value.name.trim()}
          >
            {enriching ? (
              <>
                <Spinner size={14} /> Enriching…
              </>
            ) : (
              <>
                <Wand2 className='size-3.5' /> Enrich with AI
              </>
            )}
          </Button>
        </div>

        <p className='text-muted-foreground inline-flex items-center gap-1 text-xs'>
          <Sparkles className='size-3' />
          AI fills in description &amp; suggested features. You can edit
          everything after.
        </p>
      </div>

      <ProductInformationEditor
        value={value}
        onChange={setValue}
        disabled={loading || saving}
      />

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={handlePickExisting}
      />
    </ProductWorkspaceLayout>
  );
}
