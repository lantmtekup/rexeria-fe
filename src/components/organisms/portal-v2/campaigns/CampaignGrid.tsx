'use client';

import { CampaignCard } from '@/components/organisms/portal-v2/campaigns/CampaignCard';
import type {
  CampaignExperience,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';

import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignGridProps = {
  campaigns: CampaignView[];
  productNames: Record<string, string>;
  experiences: CampaignExperience[];
  journeys: Journey[];
  today: string;
  selected: string[];
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

/** `.cgrid` — `repeat(auto-fill, minmax(320px, 1fr))`. */
export const CampaignGrid = ({
  campaigns,
  productNames,
  experiences,
  journeys,
  today,
  selected,
  onToggleSelect,
  onOpen,
  onDuplicate,
  onDelete,
}: CampaignGridProps) => (
  <div className='grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5'>
    {campaigns.map(campaign => (
      <CampaignCard
        key={campaign.id}
        campaign={campaign}
        productNames={productNames}
        experiences={experiences}
        journeys={journeys}
        today={today}
        selected={selected.includes(campaign.id)}
        onToggleSelect={onToggleSelect}
        onOpen={onOpen}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    ))}
  </div>
);
