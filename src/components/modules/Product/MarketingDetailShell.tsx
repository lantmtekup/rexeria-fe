'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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
  /**
   * Custom click handler for the primary CTA. When omitted, falls back to
   * advancing through sub-sections within the current marketing, then to
   * the next marketing in `marketings`, then to the next wizard step
   * (`/campaign` for ai-agents).
   */
  onPrimary?: () => void;
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
  primaryLabel = 'Continue',
  sidebarSections,
  onPrimary,
  children,
}: MarketingDetailShellProps) {
  const router = useRouter();
  const section: 'marketing' | 'campaign' =
    activeSection === 'campaign' ? 'campaign' : 'marketing';

  // Build the next URL based on (sub-section order × marketing order × scope).
  // - same marketing: next sub-section
  // - last sub-section: first sub-section of next marketing
  // - last marketing: jump to wizard's next step (`/campaign` for ai-agents,
  //   stay put for `product` since there is no further wizard)
  const sections = React.useMemo<MarketingSection[]>(
    () =>
      sidebarSections ??
      (scope === 'ai-agents'
        ? ['discovery', 'concept', 'assets']
        : ['discovery', 'concept', 'assets', 'campaign']),
    [sidebarSections, scope]
  );

  const nextUrl = React.useMemo<string | null>(() => {
    const sIdx = sections.indexOf(activeSection);
    if (sIdx === -1) return null;
    if (sIdx + 1 < sections.length) {
      return `${basePath}/marketing/${activeMarketingId}/${sections[sIdx + 1]}`;
    }
    // Last sub-section → next marketing's first section
    const mIdx = marketings.findIndex(m => m.id === activeMarketingId);
    if (mIdx >= 0 && mIdx + 1 < marketings.length) {
      const next = marketings[mIdx + 1]!;
      return `${basePath}/marketing/${next.id}/${sections[0]}`;
    }
    // Final → wizard step
    if (scope === 'ai-agents') return `${basePath}/campaign`;
    return null;
  }, [activeSection, activeMarketingId, marketings, sections, basePath, scope]);

  const handlePrimary = () => {
    if (onPrimary) {
      onPrimary();
      return;
    }
    if (!nextUrl) {
      toast.success('Đã hoàn thành tất cả các bước marketing');
      return;
    }
    router.push(nextUrl);
  };

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
          <Button variant='primary' size='sm' onClick={handlePrimary}>
            {primaryLabel}
            {!onPrimary && nextUrl && <ArrowRight className='size-3.5' />}
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
