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

export default function DiscoveryPage({ params }: PageProps) {
  const { id, mid } = use(params);
  return (
    <MarketingDetailShell
      basePath={`/product/${id}`}
      scope='product'
      productName='Samba OG Shoes'
      marketings={MARKETINGS}
      activeMarketingId={mid}
      activeSection='discovery'
    >
      <div className='flex flex-col gap-8'>
        <FeatureField
          label='Marketing Concept'
          description={MOCK_DESCRIPTIONS.marketingConcept}
          showAddMore
        />
        <FeatureField
          label='Message Development'
          description={MOCK_DESCRIPTIONS.messageDevelopment}
          showAddMore
        />
        <FeatureField
          label='Creative Direction'
          description={MOCK_DESCRIPTIONS.creativeDirection}
          showAddMore
        />
        <FeatureField
          label='Content Map'
          description={MOCK_DESCRIPTIONS.contentMap}
          showAddMore
        />
      </div>
    </MarketingDetailShell>
  );
}
