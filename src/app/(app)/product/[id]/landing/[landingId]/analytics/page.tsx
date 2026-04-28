'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { AnalyticsWorkspace } from '@/components/modules/Landing/AnalyticsWorkspace';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ id: string; landingId: string }>;
}

export default function LandingAnalyticsPage({ params }: PageProps) {
  const { id, landingId } = use(params);
  const basePath = `/product/${id}`;

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName='Landing analytics'
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
      <AnalyticsWorkspace projectId={landingId} />
    </ProductWorkspaceLayout>
  );
}
