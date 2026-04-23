import { use } from 'react';

import { FeatureField } from '@/components/molecules/FeatureField';
import { MarketingDetailShell } from '@/components/modules/Product/MarketingDetailShell';
import {
  MARKETINGS,
  MOCK_DESCRIPTIONS,
} from '@/components/modules/Product/marketingMocks';

interface PageProps {
  params: Promise<{ productId: string; mid: string }>;
}

export default function AiConceptPage({ params }: PageProps) {
  const { productId, mid } = use(params);
  return (
    <MarketingDetailShell
      basePath={`/ai-agents/${productId}`}
      scope='ai-agents'
      productName='Samba OG Shoes'
      marketings={MARKETINGS}
      activeMarketingId={mid}
      activeSection='concept'
      primaryLabel='Continue'
      sidebarSections={['discovery', 'concept', 'assets']}
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
