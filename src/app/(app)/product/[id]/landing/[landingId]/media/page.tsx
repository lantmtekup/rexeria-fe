'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { LandingMediaManager } from '@/components/modules/Landing/LandingMediaManager';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ id: string; landingId: string }>;
}

export default function LandingMediaPage({ params }: PageProps) {
  const { id, landingId } = use(params);
  const basePath = `/product/${id}`;

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName='Landing media'
      scope='product'
      section='landing'
      actions={
        <Button variant='pill-light' size='sm' asChild>
          <Link href={`${basePath}/landing`}>
            <ArrowLeft className='size-3.5' /> All landings
          </Link>
        </Button>
      }
    >
      <LandingMediaManager projectId={landingId} />
    </ProductWorkspaceLayout>
  );
}
