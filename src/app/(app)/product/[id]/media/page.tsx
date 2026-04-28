'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { Spinner } from '@/components/atoms/spinner';
import { ProductMediaManager } from '@/components/modules/Product/ProductMediaManager';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

export default function ProductMediaPage({ params }: PageProps) {
  const { id } = use(params);
  const basePath = `/product/${id}`;
  const isNew = id === 'new';

  const [productName, setProductName] = React.useState<string>('Loading…');
  const [loading, setLoading] = React.useState(!isNew);

  React.useEffect(() => {
    if (isNew) {
      setProductName('New product');
      return;
    }
    let alive = true;
    setLoading(true);
    rexerApi.products
      .get(id)
      .then(res => {
        if (alive) setProductName(res.product.name);
      })
      .catch(err => {
        if (!alive) return;
        toast.error(`Failed to load product: ${rxErrorMessage(err)}`);
        setProductName('Untitled product');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, isNew]);

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='product'
      section='media'
      actions={
        !isNew && (
          <Button asChild variant='primary' size='sm'>
            <Link href={`${basePath}/landing`}>
              Continue <ArrowRight className='size-3.5' />
            </Link>
          </Button>
        )
      }
    >
      {isNew ? (
        <div className='text-muted-foreground mx-auto max-w-[1200px] px-6 py-16 text-center text-sm'>
          Save the product first — media bindings need a product id.
        </div>
      ) : loading ? (
        <div className='text-muted-foreground flex justify-center py-16'>
          <Spinner size={20} />
        </div>
      ) : (
        <ProductMediaManager productId={id} />
      )}
    </ProductWorkspaceLayout>
  );
}
