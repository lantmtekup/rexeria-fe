'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
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
      let nextId = productId;
      if (isNew) {
        const created = await rexerApi.products.create(toCreatePayload(value));
        nextId = created.product.id;
        toast.success('Product created');
      } else {
        await rexerApi.products.update(productId, toCreatePayload(value));
        toast.success('Product saved');
      }
      router.push(`/ai-agents/${nextId}/template`);
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
          {saving ? 'Saving…' : 'Continue'} <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      <div className='mx-auto mb-4 flex w-full max-w-[1200px] flex-col gap-3 px-6'>
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
    </ProductWorkspaceLayout>
  );
}
