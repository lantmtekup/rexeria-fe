import { use } from 'react';

import { FeatureField } from '@/components/molecules/FeatureField';
import { MarketingDetailShell } from '@/components/modules/Product/MarketingDetailShell';
import {
  MARKETINGS,
  MOCK_DESCRIPTIONS,
} from '@/components/modules/Product/marketingMocks';

interface PageProps {
  params: Promise<{ id: string; mid: string }>;
}

export default function ConceptPage({ params }: PageProps) {
  const { id, mid } = use(params);
  return (
    <MarketingDetailShell
      basePath={`/product/${id}`}
      scope='product'
      productName='Samba OG Shoes'
      marketings={MARKETINGS}
      activeMarketingId={mid}
      activeSection='concept'
    >
      <div className='flex flex-col gap-8'>
        <FeatureField
          label='About Concept'
          description={MOCK_DESCRIPTIONS.aboutConcept}
          showAddMore
        />
        <FeatureField
          label='Target audience'
          description={MOCK_DESCRIPTIONS.targetAudience}
          showAddMore
        />
        <FeatureField
          label='Plan'
          description={MOCK_DESCRIPTIONS.plan}
          showAddMore
        />
      </div>
    </MarketingDetailShell>
  );
}
