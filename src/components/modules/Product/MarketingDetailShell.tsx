'use client';

import * as React from 'react';
import { Plus, Sparkles } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import {
  MarketingSidebar,
  type MarketingInstance,
  type MarketingSection,
} from '@/components/organisms/MarketingSidebar';

export type { MarketingSection, MarketingInstance };
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

export interface MarketingDetailShellProps {
  /** Same basePath passed to ProductWorkspaceLayout — e.g. `/product/abc` or `/ai-agents/abc` */
  basePath: string;
  /** `/product` or `/ai-agents` scope */
  scope: 'product' | 'ai-agents';
  productName: string;
  marketings: MarketingInstance[];
  activeMarketingId: string;
  activeSection: MarketingSection;
  /** Primary CTA on the right — `Save` / `Continue` / `Launch` */
  primaryLabel?: string;
  /** Override sidebar sections — AI-Agents flow has no Campaign */
  sidebarSections?: MarketingSection[];
  children: React.ReactNode;
}

/**
 * Composes ProductWorkspaceLayout + MarketingSidebar. Callers only supply the
 * section content on the right.
 */
function MarketingDetailShell({
  basePath,
  scope,
  productName,
  marketings,
  activeMarketingId,
  activeSection,
  primaryLabel = 'Save',
  sidebarSections,
  children,
}: MarketingDetailShellProps) {
  const section: 'marketing' | 'campaign' =
    activeSection === 'campaign' ? 'campaign' : 'marketing';

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope={scope}
      section={section}
      actions={
        <>
          <Button variant='pill-light' size='sm'>
            <Plus className='size-3.5' /> Add more Marketing
          </Button>
          <Button variant='ai' size='sm'>
            <Sparkles className='size-3.5' /> AI-Assistant
          </Button>
          <Button variant='primary' size='sm'>
            {primaryLabel}
          </Button>
        </>
      }
    >
      <div className='mx-auto flex h-full w-full max-w-[1200px]'>
        <MarketingSidebar
          basePath={`${basePath}/marketing`}
          marketings={marketings}
          activeMarketingId={activeMarketingId}
          activeSection={activeSection}
          sections={sidebarSections}
        />
        <div className='flex-1 overflow-y-auto px-8 py-6'>{children}</div>
      </div>
    </ProductWorkspaceLayout>
  );
}

export { MarketingDetailShell };
