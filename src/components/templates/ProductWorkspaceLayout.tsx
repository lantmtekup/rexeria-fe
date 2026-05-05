'use client';

import * as React from 'react';

import { TopTabBar } from '@/components/organisms/TopTabBar';
import { SubTabBar } from '@/components/organisms/SubTabBar';
import { WorkspaceTopBar } from '@/components/organisms/WorkspaceTopBar';
import type { WizardStep } from '@/components/organisms/WizardStepper';
import { WizardStepper } from '@/components/organisms/WizardStepper';
import { cn } from '@/lib/cn';

export type WorkspaceScope = 'product' | 'ai-agents';

export interface ProductWorkspaceLayoutProps {
  /** Base path slug — `/product/[id]` or `/ai-agents/[productId]` */
  basePath: string;
  /** Human-readable product name */
  productName?: string;
  /** Scope drives top-bar behaviour (stepper in AI-Agents, top tabs in Product) */
  scope: WorkspaceScope;
  /** Current sub-section — `information | media | marketing | template | campaign | landing` */
  section:
    | 'information'
    | 'media'
    | 'marketing'
    | 'template'
    | 'campaign'
    | 'landing';
  /** Extra right-side actions */
  actions?: React.ReactNode;
  /** Body content */
  children: React.ReactNode;
}

/**
 * Shared workspace shell for Product and AI-Agents flows.
 * - Product: renders `WorkspaceTopBar` + `TopTabBar(Product | Marketing)` + optional `SubTabBar`
 * - AI-Agents: renders the 4-step wizard stepper instead of the top tabs
 */
function ProductWorkspaceLayout({
  basePath,
  productName,
  scope,
  section,
  actions,
  children,
}: ProductWorkspaceLayoutProps) {
  // Product tabs: [Product, Landing, Marketing]
  const topTabs = [
    {
      key: 'product',
      label: 'Product',
      href: `${basePath}/information`,
    },
    {
      key: 'landing',
      label: 'Landing',
      href: `${basePath}/landing`,
    },
    {
      key: 'marketing',
      label: 'Marketing',
      href: `${basePath}/marketing`,
    },
  ];
  const topActive: 'product' | 'landing' | 'marketing' =
    section === 'information' || section === 'media'
      ? 'product'
      : section === 'landing'
        ? 'landing'
        : 'marketing';

  // Sub tabs only shown on Product top tab (Information | Media)
  const subTabs = [
    {
      key: 'information',
      label: 'Information',
      href: `${basePath}/information`,
    },
    { key: 'media', label: 'Media', href: `${basePath}/media` },
  ];
  const subActive = section === 'media' ? 'media' : 'information';

  // AI-Agents wizard steps — Template must come before Marketing because
  // the marketing copy depends on which template/canvas is picked.
  const wizardSteps: WizardStep[] = [
    { key: 'product', label: 'Product' },
    { key: 'template', label: 'Template' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'campaign', label: 'Campaign' },
  ];
  const wizardActive =
    section === 'information' || section === 'media' || section === 'landing'
      ? 'product'
      : section;

  const isProduct = scope === 'product';
  // Information + Media share the "Product" step in both flows. Show the
  // sub-tab bar so the user can move between them within the step.
  const showSubTabs = section === 'information' || section === 'media';

  return (
    <div className='flex h-full min-w-0 flex-1 flex-col'>
      <WorkspaceTopBar
        title={productName}
        titleEditable={Boolean(productName)}
        center={
          isProduct ? (
            <TopTabBar tabs={topTabs} activeKey={topActive} />
          ) : (
            <WizardStepper steps={wizardSteps} activeKey={wizardActive} />
          )
        }
        actions={actions}
      />
      {showSubTabs && <SubTabBar tabs={subTabs} activeKey={subActive} />}
      <div
        className={cn(
          'bg-background min-h-0 flex-1 overflow-y-auto',
          // reduce top padding when sub-tabs are present
          showSubTabs ? 'pt-6' : 'pt-6'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { ProductWorkspaceLayout };
