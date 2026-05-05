'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { ProductMediaManager } from '@/components/modules/Product/ProductMediaManager';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ productId: string }>;
}

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s
  );
}

export default function AiAgentsMediaPage({ params }: PageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const isPlaceholder = !isUuid(productId);

  return (
    <ProductWorkspaceLayout
      basePath={`/ai-agents/${productId}`}
      productName='Product media'
      scope='ai-agents'
      section='media'
      actions={
        <Button
          variant='primary'
          size='sm'
          disabled={isPlaceholder}
          // Finished sub-tabs of "01 Product" → advance to "02 Template".
          onClick={() => router.push(`/ai-agents/${productId}/template`)}
        >
          Continue <ArrowRight className='size-3.5' />
        </Button>
      }
    >
      {isPlaceholder ? (
        <div className='mx-auto flex w-full max-w-[1200px] flex-col items-center gap-2 px-6 py-16 text-center'>
          <p className='text-foreground text-sm font-semibold'>
            Sản phẩm chưa được lưu
          </p>
          <p className='text-muted-foreground max-w-md text-xs'>
            Quay lại Information, nhập tên + nhấn Continue để tạo product. Sau
            đó bước Media sẽ hiện ảnh đã gắn vào.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => router.push(`/ai-agents/${productId}/information`)}
          >
            ← Quay lại Information
          </Button>
        </div>
      ) : (
        <ProductMediaManager productId={productId} />
      )}
    </ProductWorkspaceLayout>
  );
}
