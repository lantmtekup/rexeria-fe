'use client';

import { CampaignCard } from '@/components/organisms/portal-v2/campaigns/CampaignCard';
import type { CampaignView } from '@/lib/portal-v2/campaigns/types';

type CampaignGridProps = {
  campaigns: CampaignView[];
  productNames: Record<string, string>;
  selected: string[];
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

/** `.cgrid` — `repeat(auto-fill, minmax(320px, 1fr))`. */
export const CampaignGrid = ({
  campaigns,
  productNames,
  selected,
  onToggleSelect,
  onOpen,
  onEdit,
  onDelete,
}: CampaignGridProps) => (
  <div className='grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5'>
    {campaigns.map(campaign => (
      <CampaignCard
        key={campaign.id}
        campaign={campaign}
        productNames={productNames}
        selected={selected.includes(campaign.id)}
        onToggleSelect={onToggleSelect}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);
