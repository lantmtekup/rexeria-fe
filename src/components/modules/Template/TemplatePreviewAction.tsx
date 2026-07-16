'use client';

/**
 * "Preview" trigger — replaces the old `/admin/templates/{id}/preview`
 * internal-only link. Opens the template's public `/p/:slug` demo page in a
 * new tab; if the template has no demo page yet, opens
 * `PublishTemplateDemoDialog` (autoPublishAndOpen) right here so the admin
 * can create + publish + open it in one step, instead of a separate flow.
 */

import * as React from 'react';

import { PublishTemplateDemoDialog } from './PublishTemplateDemoDialog';
import { getDemoPageMapping } from '@/lib/templateDemoPage';
import type { Template } from '@/services/rexer/types';

interface Props {
  template: Template;
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export function TemplatePreviewAction({
  template,
  className,
  title,
  children,
}: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const mapping = getDemoPageMapping(template.id);
    if (mapping?.slug) {
      window.open(
        `${window.location.origin}/p/${mapping.slug}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }
    setDialogOpen(true);
  };

  return (
    <>
      <button
        type='button'
        onClick={handleClick}
        className={className}
        title={title}
      >
        {children}
      </button>
      <PublishTemplateDemoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={template}
        autoPublishAndOpen
      />
    </>
  );
}
