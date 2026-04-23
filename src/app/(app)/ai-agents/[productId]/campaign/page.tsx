import { use } from 'react';
import { MoreVertical, Plus } from 'lucide-react';

import { CampaignAnalyticsDialog } from '@/components/dialogs/CampaignAnalyticsDialog';
import { FeatureField } from '@/components/molecules/FeatureField';
import { MarketingDetailShell } from '@/components/modules/Product/MarketingDetailShell';
import {
  MARKETINGS,
  MOCK_DESCRIPTIONS,
} from '@/components/modules/Product/marketingMocks';

interface PageProps {
  params: Promise<{ productId: string }>;
}

const CAMPAIGN_TABS = [{ key: 'c1', label: 'Campaign 01', active: true }];

function TemplateThumb({ name }: { name: string }) {
  return (
    <div className='bg-background ring-border flex flex-col gap-2 rounded-xl p-4 ring-1'>
      <div className='flex items-center justify-between text-xs'>
        <div>
          <p className='text-foreground font-semibold'>{name}</p>
          <p className='text-content-muted'>Create: 02.06.2025</p>
        </div>
        <MoreVertical className='text-content-muted size-4' />
      </div>
      <div className='flex aspect-video items-center justify-center rounded-lg bg-neutral-100 text-sm font-semibold text-neutral-500'>
        {name}
      </div>
      <div className='flex items-center justify-end gap-2 text-xs'>
        <CampaignAnalyticsDialog
          campaignName={name.toUpperCase()}
          trigger={
            <button className='rounded-pill border-primary text-primary hover:bg-primary/5 cursor-pointer border px-3 py-1'>
              Analytics
            </button>
          }
        />
        <button className='rounded-pill text-neutral-0 cursor-pointer bg-neutral-900 px-3 py-1 hover:bg-neutral-800'>
          Edit
        </button>
      </div>
    </div>
  );
}

export default function AiCampaignPage({ params }: PageProps) {
  const { productId } = use(params);
  return (
    <MarketingDetailShell
      basePath={`/ai-agents/${productId}`}
      scope='ai-agents'
      productName='Samba OG Shoes'
      marketings={MARKETINGS}
      activeMarketingId='m1'
      activeSection='campaign'
      primaryLabel='Launch'
      sidebarSections={['discovery', 'concept', 'assets', 'campaign']}
    >
      <div className='mb-6 flex items-center gap-2'>
        <button className='rounded-pill text-foreground inline-flex h-8 items-center gap-1 bg-neutral-100 px-3 text-xs font-semibold hover:bg-neutral-200'>
          <Plus className='size-3.5' /> Add more campaign
        </button>
        {CAMPAIGN_TABS.map(t => (
          <button
            key={t.key}
            className={`rounded-pill h-8 cursor-pointer px-4 text-xs font-semibold ${
              t.active ? 'text-neutral-0 bg-neutral-900' : 'text-content-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className='flex flex-col gap-8'>
        <FeatureField
          label='Campaign Planning'
          description={MOCK_DESCRIPTIONS.campaignPlanning}
          showAddMore
        />
        <TemplateThumb name='Delvaux' />
        <button
          type='button'
          className='rounded-pill text-neutral-0 inline-flex h-8 w-fit cursor-pointer items-center gap-1 bg-neutral-900 px-3 text-xs font-semibold hover:bg-neutral-800'
        >
          <Plus className='size-3.5' /> Add more template
        </button>
      </div>
    </MarketingDetailShell>
  );
}
