'use client';

import { use } from 'react';
import Link from 'next/link';
import { Download, PaletteIcon, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { Tag } from '@/components/atoms/tag';
import { ColorSwatch } from '@/components/atoms/color-swatch';
import { AddCategoryDialog } from '@/components/dialogs/AddCategoryDialog';
import { ApiUrlDialog } from '@/components/dialogs/ApiUrlDialog';
import { ProductInformationForm } from '@/components/modules/Product/ProductInformationForm';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function AiAgentsInformationPage({ params }: PageProps) {
  const { productId } = use(params);
  const basePath = `/ai-agents/${productId}`;
  const isNew = productId === 'new-product';
  const productName = isNew ? 'Product Name' : 'Superstar Shoes';

  const overview = isNew
    ? undefined
    : [
        {
          key: 'category',
          label: 'Category',
          value: 'Fashion',
          isSelect: true,
        },
        {
          key: 'description',
          label: 'Description',
          value: 'Fashion is an ever-evolving expression of in…',
        },
        { key: 'sku', label: 'SKU', value: '#0319414325' },
      ];

  const spec = isNew
    ? undefined
    : [
        {
          key: 'size',
          label: 'Size',
          value: (
            <span className='flex gap-1 text-xs'>
              <Tag>S</Tag>
              <Tag>M</Tag>
              <Tag>L</Tag>
              <Tag>XL</Tag>
            </span>
          ),
        },
        {
          key: 'color',
          label: 'Color',
          value: (
            <span className='flex items-center gap-2 text-xs'>
              <span className='flex items-center gap-1'>
                <ColorSwatch asSpan color='#000' size={12} /> Black
              </span>
              <span className='flex items-center gap-1'>
                <ColorSwatch asSpan color='#fff' size={12} /> White
              </span>
              <span className='flex items-center gap-1'>
                <ColorSwatch asSpan color='#ef4444' size={12} /> Red
              </span>
            </span>
          ),
        },
        { key: 'variant', label: 'Variant', value: 'Product 01' },
        { key: 'ingredients', label: 'Ingredients', value: '100% Cotton' },
        {
          key: 'certifications',
          label: 'Certifications',
          value: 'Certifications 01',
        },
      ];

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='ai-agents'
      section='information'
      actions={
        <>
          <AddCategoryDialog
            trigger={
              <Button variant='pill-light' size='sm'>
                <Plus className='size-3.5' /> Add new category
              </Button>
            }
          />
          <Button asChild variant='primary' size='sm'>
            <Link href={basePath + '/marketing'}>Continue</Link>
          </Button>
        </>
      }
    >
      <div className='mx-auto mb-4 flex w-full max-w-[1200px] items-center gap-2 px-6'>
        <div className='bg-muted text-foreground flex flex-1 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'>
          {productName}
        </div>
        <Button variant='pill-light' size='sm'>
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
      <ProductInformationForm overview={overview} spec={spec} />
    </ProductWorkspaceLayout>
  );
}
